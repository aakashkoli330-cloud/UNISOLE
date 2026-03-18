const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ================= MIDDLEWARES =================
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

// ================= CONTROLLERS =================
const {
  addProduct,
  getAllProducts,
  getProductsByCategory,
  deleteProduct,
  updateProduct
} = require("../controllers/productController");

// ================= CREATE IMAGES FOLDER IF NOT EXISTS =================
const imagesDir = path.join(__dirname, "../images");
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
  console.log("Created images folder:", imagesDir);
}

// ================= MULTER CONFIG =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesDir); // save images in /images folder
  },
  filename: (req, file, cb) => {
    // unique filename with timestamp + original extension
    const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// ================= PUBLIC ROUTES =================
// Get all products
router.get("/", getAllProducts);

// Get products by category
router.get("/category/:category", getProductsByCategory);

// Get single product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await require("../models/product").findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error("GET PRODUCT ERROR:", err);
    res.status(500).json({ message: "Invalid product ID" });
  }
});

// ================= ADMIN ROUTES =================
// Add product (admin only)
router.post("/", protect, adminOnly, upload.single("image"), addProduct);

// Update product (admin only, image optional)
router.put("/:id", protect, adminOnly, upload.single("image"), updateProduct);

// Delete product (admin only)
router.delete("/:id", protect, adminOnly, deleteProduct);

module.exports = router;
