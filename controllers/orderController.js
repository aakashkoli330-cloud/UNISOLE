// ============================================================
// server/controllers/orderController.js  — UPDATED
// Uses req.user._id (full user object from authMiddleware)
// ============================================================

const Order = require("../models/Order");
const Cart = require("../models/cart");
const Product = require("../models/product");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");

/* ================= CREATE RAZORPAY ORDER ================= */
exports.createRazorpayOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const { shipping } = req.body;

    if (
      !shipping ||
      !shipping.fullName ||
      !shipping.phone ||
      !shipping.state ||
      !shipping.district ||
      !shipping.pincode ||
      !shipping.address
    ) {
      return res.status(400).json({ message: "Incomplete shipping details" });
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(shipping.phone)) {
      return res.status(400).json({ message: "Phone number must be exactly 10 digits" });
    }

    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(shipping.pincode)) {
      return res.status(400).json({ message: "Pincode must be exactly 6 digits" });
    }

    for (const item of cart.items) {
      const product = item.product;
      if (!product) {
        return res.status(400).json({ message: "Product not found in cart" });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `${product.name} has only ${product.stock} left in stock`,
        });
      }
    }

    const orderItems = cart.items.map((item) => ({
      productId: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.image,
    }));

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `order_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        userName: shipping.fullName,
      },
    });

    const order = new Order({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      shipping,
      paymentMethod: "razorpay",
      paymentStatus: "pending",
      status: "Placed",
      razorpayOrderId: razorpayOrder.id,
    });

    await order.save();

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      order,
    });
  } catch (err) {
    console.error("CREATE RAZORPAY ORDER ERROR:", err);
    res.status(500).json({ message: "Failed to create order" });
  }
};

/* ================= VERIFY RAZORPAY PAYMENT ================= */
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment details" });
    }

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    order.paymentStatus = "verified";
    order.transactionId = razorpay_payment_id;
    order.paidAt = new Date();
    order.status = "Processing";
    await order.save();

    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.json({
      success: true,
      message: "Payment verified successfully",
      order,
    });
  } catch (err) {
    console.error("VERIFY PAYMENT ERROR:", err);
    res.status(500).json({ message: "Payment verification failed" });
  }
};

/* ================= USER CHECKOUT (COD ONLY) ================= */
exports.checkout = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const { shipping, paymentMethod } = req.body;

    if (
      !shipping ||
      !shipping.fullName ||
      !shipping.phone ||
      !shipping.state ||
      !shipping.district ||
      !shipping.pincode ||
      !shipping.address
    ) {
      return res.status(400).json({ message: "Incomplete shipping details" });
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(shipping.phone)) {
      return res.status(400).json({ message: "Phone number must be exactly 10 digits" });
    }

    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(shipping.pincode)) {
      return res.status(400).json({ message: "Pincode must be exactly 6 digits" });
    }

    for (const item of cart.items) {
      const product = item.product;
      if (!product) {
        return res.status(400).json({ message: "Product not found in cart" });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `${product.name} has only ${product.stock} left in stock`,
        });
      }
    }

    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    const orderItems = cart.items.map((item) => ({
      productId: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.image,
    }));

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = new Order({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      shipping,
      paymentMethod: "cod",
      paymentStatus: "verified",
      status: "Processing",
    });

    await order.save();

    cart.items = [];
    await cart.save();

    res.json({
      message: "Order placed successfully",
      order,
    });
  } catch (err) {
    console.error("CHECKOUT ERROR:", err);
    res.status(500).json({ message: "Checkout failed" });
  }
};

/* ================= ADMIN: GET ALL ORDERS ================= */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone address")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("GET ALL ORDERS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= ADMIN: UPDATE ORDER STATUS ================= */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ["Placed", "Processing", "Shipped", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    console.error("UPDATE ORDER STATUS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
