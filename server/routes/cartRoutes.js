const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Cart = require("../models/cart");

/* =====================
   GET CART
===================== */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.product");

    if (!cart) return res.json({ items: [] });

    // Filter out deleted products (cleanup)
    cart.items = cart.items.filter(item => item.product !== null);
    await cart.save();

    res.json({ items: cart.items });
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
    const userId = req.user.id;

    if (!productId) return res.status(400).json({ message: "Product ID required" });

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [{ product: productId, quantity: 1 }]
      });
      await cart.save();
      return res.json({ items: cart.items });
    }

    const index = cart.items.findIndex(item => item.product.toString() === productId);
    if (index > -1) {
      cart.items[index].quantity += 1;
    } else {
      cart.items.push({ product: productId, quantity: 1 });
    }

    await cart.save();
    res.json({ items: cart.items });

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
    change = Number(change);

    if (!productId || isNaN(change)) {
      return res.status(400).json({ message: "Invalid update data" });
    }

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex(i => i.product.toString() === productId);
    if (itemIndex === -1) return res.status(404).json({ message: "Item not found" });

    cart.items[itemIndex].quantity += change;

    if (cart.items[itemIndex].quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    }

    await cart.save();
    res.json({ items: cart.items });

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
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(item => item.product.toString() !== req.params.productId);
    await cart.save();
    res.json({ items: cart.items });

  } catch (err) {
    console.error("REMOVE ITEM ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
