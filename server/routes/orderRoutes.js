const express = require("express");
const router = express.Router();

const {
  checkout,
  getAllOrders,
  updateOrderStatus
} = require("../controllers/orderController");

const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

/* ================= USER ================= */

// Place order
router.post("/checkout", auth, checkout);

// Get logged-in user's orders
router.get("/my", auth, async (req, res) => {
  try {
    const orders = await require("../models/Order")
      .find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================= ADMIN ================= */

// Get all orders
router.get("/admin", auth, admin, getAllOrders);

// Update order status
router.put("/admin/:id", auth, admin, updateOrderStatus);

module.exports = router;