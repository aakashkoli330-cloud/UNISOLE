const Product = require("../models/product");

/* =========================
   ADD PRODUCT (ADMIN)
========================= */
exports.addProduct = async (req, res) => {
  try {
    const { name, price, category, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const newProduct = new Product({
      name,
      price,
      category: category.toLowerCase(),
      description: description || "",
      image: req.file.filename
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product: newProduct
    });
  } catch (err) {
    console.error("ADD PRODUCT ERROR:", err);

    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }

    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   GET ALL PRODUCTS
========================= */
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error("GET PRODUCTS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   GET PRODUCTS BY CATEGORY
========================= */
exports.getProductsByCategory = async (req, res) => {
  try {
    const category = req.params.category.toLowerCase();
    const products = await Product.find({ category });
    res.json(products);
  } catch (err) {
    console.error("GET CATEGORY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   DELETE PRODUCT
========================= */
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    console.error("DELETE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   UPDATE PRODUCT
========================= */
exports.updateProduct = async (req, res) => {
  try {
    const { name, price, category, description } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (name) product.name = name;
    if (price) product.price = Number(price);
    if (category) product.category = category.toLowerCase();
    if (description !== undefined) product.description = description;

    // Only update image if new file uploaded
    if (req.file) product.image = req.file.filename;

    await product.save();

    res.json({
      success: true,
      message: "Product updated successfully",
      product
    });
  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err);

    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }

    res.status(500).json({ message: "Server error" });
  }
};
