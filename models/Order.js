const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: String,
    price: Number,
    quantity: Number,
    image: String
  },
  { _id: false }
);

/*  ADD SHIPPING SCHEMA */
const shippingSchema = new mongoose.Schema(
  {
    fullName: String,
    phone: String,
    address: String,
    state: String,
    district: String,
    pincode: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [orderItemSchema],

    totalAmount: Number,

    /*  ADD THIS */
    shipping: shippingSchema,

    paymentMethod: {
      type: String,
      default: "razorpay"
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "verified", "failed"],
      default: "pending"
    },

    transactionId: {
      type: String,
      default: null
    },

    razorpayOrderId: {
      type: String,
      default: null
    },

    paidAt: {
      type: Date,
      default: null
    },

    status: {
      type: String,
      enum: ["Placed", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Placed",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);