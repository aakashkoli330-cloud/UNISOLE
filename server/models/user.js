const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: "India" },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    // 🔐 Password (ONLY for local users)
    password: {
      type: String,
      select: false
    },

    // 🔵 Google OAuth fields
    googleId: {
      type: String,
      unique: true,
      sparse: true
    },

    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local"
    },

    phone: {
      type: String,
      default: ""
    },

    address: addressSchema,

    avatar: {
      type: String,
      default: ""
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      lowercase: true
    },

    isActive: {
      type: Boolean,
      default: true
    },

    // 🔐 EMAIL VERIFICATION
    isVerified: {
      type: Boolean,
      default: function () {
        // Google users are auto verified
        return this.provider === "google";
      }
    },

    verificationToken: String,
    verificationTokenExpires: Date
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// 🔥 Virtual for admin checks
userSchema.virtual("isAdmin").get(function () {
  return this.role === "admin";
});

module.exports = mongoose.model("User", userSchema);