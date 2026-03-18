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

// ================= FIXED IMAGES PATH =================
// __dirname = server/routes → go one level up → server/images
const imagesDir = path.join(__dirname, "../images");

// Ensure folder exists (safe for Render)
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
  console.log("Created images folder:", imagesDir);
}

// ================= MULTER CONFIG =================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, imagesDir),
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// ================= PUBLIC ROUTES =================
router.get("/", getAllProducts);
router.get("/category/:category", getProductsByCategory);

router.get("/:id", async (req, res) => {
  try {
    const Product = require("../models/product");
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

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
