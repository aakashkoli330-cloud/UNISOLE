const express = require("express");
const router = express.Router();
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const path = require("path");

const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");
const productController = require("../controllers/productController");

const {
  addProduct,
  getAllProducts,
  getProductsByCategory,
  deleteProduct,
  updateProduct
} = require("../controllers/productController");

const Product = require("../models/product");

let upload;
const cloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (cloudinaryConfigured) {
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "unisole_products",
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
      transformation: [{ width: 800, height: 800, crop: "limit" }],
    },
  });
  upload = multer({ storage });
  console.log("✅ Cloudinary storage configured");
} else {
  const localStorage = multer.diskStorage({
    destination: "./images",
    filename: (req, file, cb) => {
      const uniqueName = Date.now() + "-" + file.originalname;
      cb(null, uniqueName);
    },
  });
  upload = multer({ storage: localStorage });
  console.log("⚠️ Using local storage (Cloudinary not configured)");
}

router.get("/", getAllProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/test", (req, res) => {
  res.json({ 
    cloudinaryConfigured,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? "set" : "missing",
    api_key: process.env.CLOUDINARY_API_KEY ? "set" : "missing",
    api_secret: process.env.CLOUDINARY_API_SECRET ? "set" : "missing"
  });
});

router.post("/upload-images", async (req, res) => {
  try {
    if (!cloudinaryConfigured) {
      return res.status(500).json({ message: "Cloudinary not configured" });
    }
    await productController.resetAndUploadImages();
    res.json({ success: true, message: "Images uploaded to Cloudinary" });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error("GET PRODUCT ERROR:", err);
    res.status(500).json({ message: "Invalid product ID" });
  }
});

router.post("/", protect, adminOnly, (req, res, next) => {
  if (!upload) {
    return res.status(500).json({ message: "Upload not configured" });
  }
  upload.single("image")(req, res, (err) => {
    if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({ message: err.message || "Upload failed" });
    }
    next();
  });
}, addProduct);

router.put("/:id", protect, adminOnly, (req, res, next) => {
  if (!upload) {
    return res.status(500).json({ message: "Upload not configured" });
  }
  upload.single("image")(req, res, (err) => {
    if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({ message: err.message || "Upload failed" });
    }
    next();
  });
}, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

module.exports = router;
