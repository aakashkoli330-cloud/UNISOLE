// ============================================================
// server/routes/cartRoutes.js  — FIXED
// All routes use req.user._id (full user object from authMiddleware)
// ============================================================

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Cart = require("../models/cart");
const Product = require("../models/product");

/* =====================
   GET CART
===================== */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product");

    if (!cart) {
      return res.json({ items: [] });
    }

    res.json(cart);
  } catch (err) {
    console.error("LOAD CART ERROR:", err);
    res.status(500).json({ message: "Failed to load cart" });
  }
});

/* =====================
   ADD TO CART (with stock check)
===================== */
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    console.log("ADD TO CART:", { productId, userId: userId.toString() });

    if (!productId) {
      return res.status(400).json({ message: "Product ID required" });
    }

    const product = await Product.findById(productId);
    console.log("PRODUCT:", product ? product.name : "NOT FOUND", "stock:", product?.stock);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock <= 0) {
      return res.status(400).json({ message: "Out of stock" });
    }

    let cart = await Cart.findOne({ user: userId });
    console.log("CART:", cart ? "found" : "not found");

    if (!cart) {
      try {
        cart = new Cart({
          user: userId,
          items: [{ product: productId, quantity: 1 }],
        });
        await cart.save();
        console.log("New cart created");
        return res.json(cart);
      } catch (err) {
        console.error("Cart create error:", err);
        return res.status(500).json({ message: err.message });
      }
    }

    const index = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );
    console.log("ITEM INDEX:", index);

    if (index > -1) {
      const currentQty = cart.items[index].quantity;
      console.log("Current qty:", currentQty, "stock:", product.stock);
      if (currentQty + 1 > product.stock) {
        return res.status(400).json({ message: "Stock limit reached" });
      }
      cart.items[index].quantity += 1;
    } else {
      cart.items.push({ product: productId, quantity: 1 });
    }

    try {
      await cart.save();
      console.log("Cart saved, items:", cart.items.length);
      res.json(cart);
    } catch (err) {
      console.error("Cart save error:", err);
      res.status(500).json({ message: err.message });
    }
  } catch (err) {
    console.error("ADD TO CART ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================
   UPDATE QUANTITY
===================== */
router.put("/update", authMiddleware, async (req, res) => {
  try {
    let { productId, change } = req.body;

    if (!productId || change === undefined) {
      return res.status(400).json({ message: "Invalid update data" });
    }

    change = Number(change);
    if (isNaN(change)) {
      return res.status(400).json({ message: "Change must be a number" });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      (i) => i.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const newQty = item.quantity + change;

    if (newQty > product.stock) {
      return res.status(400).json({
        message: `Only ${product.stock} items available`,
      });
    }

    if (newQty <= 0) {
      cart.items = cart.items.filter(
        (i) => i.product.toString() !== productId
      );
    } else {
      item.quantity = newQty;
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error("UPDATE CART ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================
   REMOVE ITEM
===================== */
router.delete("/remove/:productId", authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== req.params.productId
    );

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error("REMOVE ITEM ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
