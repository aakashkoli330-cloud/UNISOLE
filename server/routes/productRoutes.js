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
    cb(null, imagesDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// ================= PUBLIC ROUTES =================
router.get("/", getAllProducts);
router.get("/category/:category", getProductsByCategory);
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
router.post("/", protect, adminOnly, upload.single("image"), addProduct);
router.put("/:id", protect, adminOnly, upload.single("image"), updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

module.exports = router;
