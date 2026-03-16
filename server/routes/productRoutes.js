const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// ✅ MIDDLEWARES
const protect = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

// ✅ CONTROLLERS
const {
  addProduct,
  getAllProducts,
  getProductsByCategory,
  deleteProduct,
  updateProduct
} = require("../controllers/productController");

/* =========================
   MULTER CONFIG
========================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

/* =========================
   PUBLIC ROUTES
========================= */

// Anyone can view products
router.get("/", getAllProducts);
router.get("/category/:category", getProductsByCategory);

// Get single product by ID
router.get("/:id", async (req, res) => {
  try {
    const product = await require("../models/Product").findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Invalid product ID" });
  }
});

/* =========================
   ADMIN ROUTES (PROTECTED)
========================= */

// Add product (admin only)
router.post("/", protect, adminOnly, upload.single("image"), addProduct);

// Update product (admin only, image optional)
router.put("/:id", protect, adminOnly, upload.single("image"), updateProduct);

// Delete product (admin only)
router.delete("/:id", protect, adminOnly, deleteProduct);

/* =========================
   FUTURE-PROOFING NOTES
========================= */

/*
1. Only import and use middlewares that exist (no "admin" variable errors).
2. Avoid duplicate routes — define each HTTP method + URL only once.
3. Always apply `protect` BEFORE `adminOnly` for admin routes.
4. Multer upload is only applied where images are sent (POST and optional in PUT).
5. All route handlers should handle errors internally in the controller to avoid crashing the server.
*/

module.exports = router;

