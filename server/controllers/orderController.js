const Order = require("../models/Order");
const Cart = require("../models/cart");

/* ================= USER CHECKOUT ================= */
exports.checkout = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Extract shipping & payment info from request body
    const { shipping, paymentMethod } = req.body;

    if (
      !shipping ||
      !shipping.fullName ||
      !shipping.phone ||
      !shipping.address ||
      !shipping.city ||
      !shipping.state ||
      !shipping.pincode
    ) {
      return res.status(400).json({ message: "Incomplete shipping details" });
    }

    if (!paymentMethod) {
      return res.status(400).json({ message: "Payment method required" });
    }

    // Build order items
    const orderItems = cart.items.map(item => ({
      productId: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity
    }));

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Create order
    const order = new Order({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      shipping,
      paymentMethod,
      status: "Processing" // default status
    });

    await order.save();

    // Clear cart after checkout
    cart.items = [];
    await cart.save();

    res.json({
      message: "Order placed successfully",
      order
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
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= ADMIN: UPDATE ORDER STATUS ================= */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
