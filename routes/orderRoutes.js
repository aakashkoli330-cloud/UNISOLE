const express = require("express");
const router = express.Router();
const { checkout, getAllOrders, updateOrderStatus, createRazorpayOrder, verifyPayment } = require("../controllers/orderController");
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

/* ================= ADMIN ROUTES (MUST BE BEFORE /:id) ================= */

// Get all orders
router.get("/admin/all", auth, admin, async (req, res) => {
  try {
    const Order = require("../models/Order");
    const { status, paymentStatus } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate("user", "name email");

    res.json(orders);
  } catch (err) {
    console.error("GET ALL ORDERS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get all orders (backward compat)
router.get("/admin", auth, admin, getAllOrders);

// Update order status
router.put("/admin/:id", auth, admin, updateOrderStatus);

/* ================= USER ROUTES ================= */

// Create Razorpay order
router.post("/create-order", auth, createRazorpayOrder);

// Verify Razorpay payment
router.post("/verify-payment", auth, verifyPayment);

// Place order (COD only)
router.post("/checkout", auth, checkout);

// Get logged-in user's orders
router.get("/my", auth, async (req, res) => {
  try {
    const Order = require("../models/Order");
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("GET MY ORDERS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// Get single order details (MUST BE LAST)
router.get("/:id", auth, async (req, res) => {
  try {
    const Order = require("../models/Order");
    const order = await Order.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    console.error("GET ORDER ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
