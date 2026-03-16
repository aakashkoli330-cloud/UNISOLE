const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Cart = require("../models/Cart");

/* =====================
   GET CART
===================== */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user })
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
   ADD TO CART
===================== */
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user; // ✅ FIX

    if (!productId) {
      return res.status(400).json({ message: "Product ID required" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [{ product: productId, quantity: 1 }]
      });

      await cart.save();
      return res.json(cart);
    }

    const index = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (index > -1) {
      cart.items[index].quantity += 1;
    } else {
      cart.items.push({ product: productId, quantity: 1 });
    }

    await cart.save();
    res.json(cart);

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

    // ✅ force number (very important)
    change = Number(change);

    if (isNaN(change)) {
      return res.status(400).json({ message: "Change must be a number" });
    }

    const cart = await Cart.findOne({ user: req.user });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      i => i.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.quantity += change;

    if (item.quantity <= 0) {
      cart.items = cart.items.filter(
        i => i.product.toString() !== productId
      );
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
    const cart = await Cart.findOne({ user: req.user });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      item => item.product.toString() !== req.params.productId
    );

    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error("REMOVE ITEM ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;