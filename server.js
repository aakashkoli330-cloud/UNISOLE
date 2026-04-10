// ============================================================
// server/server.js  — FIXED
// FIX 1: Restricted CORS to frontend domain
// FIX 2: Added SPA fallback route (fixes direct URL refresh on Render)
// FIX 3: Mounts profile route (was completely missing)
// FIX 4: Removed dotenv version issue note
// ============================================================

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

// Debug env check
console.log("MONGO_URI:", process.env.MONGO_URI ? "OK" : "MISSING");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "OK" : "MISSING");
console.log(
  "CLOUDINARY_CLOUD_NAME:",
  process.env.CLOUDINARY_CLOUD_NAME ? "OK" : "MISSING",
);
console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID ? "OK" : "MISSING");

// =================== CORS ===================
// FIX: Restrict CORS to your actual frontend domain in production
const allowedOrigins = [
  "http://localhost:5000",
  "http://localhost:3000",
  "https://unisole.onrender.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  }),
);

// =================== MIDDLEWARE ===================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =================== STATIC FILES ===================
// Serve product images
app.use("/images", express.static(path.join(__dirname, "images")));

// Serve frontend
const frontendPath = path.join(__dirname, "frontend");
app.use(express.static(frontendPath));

// =================== ROUTES ===================
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

// =================== SPA FALLBACK ===================
// FIX: This was missing — without it, refreshing any page (e.g. /cart.html)
// returns a 404 on Render because there's no file at that URL path.
// This sends all non-API requests to the frontend.
app.get(/^(?!\/api\/).*/, (req, res) => {
  // Don't intercept API calls
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ message: "API route not found" });
  }
  res.sendFile(path.join(frontendPath, "index.html"));
});

// =================== MONGODB ===================
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected");

    // Auto-upload existing product images to Cloudinary
    try {
      const productController = require("./controllers/productController");
      await productController.autoUploadExistingImages();
    } catch (err) {
      console.warn("Auto-upload skipped:", err.message);
    }
  })
  .catch((err) => console.error("❌ MongoDB connection failed:", err.message));

// =================== START ===================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
