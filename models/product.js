const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    category: {
      type: String,
      enum: ["men", "women"],
      required: true,
      lowercase: true
    },

    image: {
      type: String,
      required: true
    },

    description: {
      type: String,
      default: ""
    },

    sizes: [
      {
        size: {
          type: Number,
          required: true,
          min: 1
        },
        stock: {
          type: Number,
          default: 0,
          min: 0
        }
      }
    ],

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0  
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);