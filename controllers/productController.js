const Product = require("../models/product");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const path = require("path");

/* =========================
   Helper for local images
========================= */
const IMAGE_FOLDER = path.join(__dirname, "../images");

function findLocalFile(productImage) {
  if (!productImage) return null;

  let filePath = path.join(IMAGE_FOLDER, productImage);
  if (fs.existsSync(filePath)) return filePath;

  const baseName = productImage.split("-").slice(1).join("-");
  filePath = path.join(IMAGE_FOLDER, baseName);
  if (fs.existsSync(filePath)) return filePath;

  return null;
}

/* =========================
   Upload local image to Cloudinary
========================= */
async function uploadImageToCloudinary(localPath) {
  if (!localPath) return null;
  if (!fs.existsSync(localPath)) {
    throw new Error(`File not found: ${localPath}`);
  }

  const res = await cloudinary.uploader.upload(localPath, {
    folder: "unisole_products",
    use_filename: true,
    unique_filename: false,
    overwrite: true,
  });

  return res.secure_url;
}

/* =========================
   ADD PRODUCT (ADMIN)
========================= */
exports.addProduct = async (req, res) => {
  try {
    const { name, price, category, description, stock } = req.body;

    if (!name || !price || !category || stock === undefined) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const imageUrl = req.file.secure_url || req.file.path;

    const newProduct = new Product({
      name,
      price,
      category,
      description: description || "",
      stock: Number(stock),
      image: imageUrl,
    });

    await newProduct.save();
    res.status(201).json({ success: true, product: newProduct });
  } catch (err) {
    console.error("ADD PRODUCT ERROR:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

/* =========================
   GET PRODUCTS
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

exports.getProductsByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    const products = await Product.find({
      category: { $regex: `^${category}$`, $options: "i" },
    });
    res.json(products);
  } catch (err) {
    console.error("GET CATEGORY ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   SEARCH PRODUCTS
========================= */
exports.searchProducts = async (req, res) => {
  try {
    const query = req.query.q || "";

    if (!query || query.length < 2) {
      return res.json([]);
    }

    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    })
      .select("name category price image stock")
      .limit(8);

    res.json(products);
  } catch (err) {
    console.error("SEARCH ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   DELETE PRODUCT
========================= */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.image?.includes("res.cloudinary.com")) {
      const publicId = product.image.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(`unisole_products/${publicId}`);
      } catch (err) {
        console.warn("Cloudinary delete failed:", err.message);
      }
    }

    await product.deleteOne();
    res.json({ success: true });
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
    const { name, price, category, description, stock } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.name = name || product.name;
    product.price = price || product.price;
    product.category = category || product.category;
    product.description = description || product.description;

    //  STOCK UPDATE
    if (stock !== undefined) {
      product.stock = Number(stock);
    }

    if (req.file) {
      if (product.image?.includes("res.cloudinary.com")) {
        const publicId = product.image.split("/").pop().split(".")[0];
        try {
          await cloudinary.uploader.destroy(`unisole_products/${publicId}`);
        } catch (err) {
          console.warn("Old image delete failed:", err.message);
        }
      }
      product.image = req.file.secure_url || req.file.path;
    }

    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   AUTO-UPLOAD EXISTING LOCAL IMAGES
========================= */
exports.autoUploadExistingImages = async () => {
  try {
    const products = await Product.find();
    if (!products.length) return;

    let uploadedCount = 0;
    for (const product of products) {
      if (!product.image || product.image.startsWith("http")) continue;

      const localPath = findLocalFile(product.image);
      if (!localPath) {
        console.warn(
          `⚠️ Local image not found for product: ${product.name} (${product.image})`,
        );
        continue;
      }

      console.log(`Uploading existing product image: ${product.name}`);
      try {
        const url = await uploadImageToCloudinary(localPath);
        product.image = url;
        await product.save();
        uploadedCount++;
      } catch (uploadErr) {
        console.warn(
          `⚠️ Upload failed for ${product.name}:`,
          uploadErr.message,
        );
      }
    }

    if (uploadedCount > 0) {
      console.log(`✅ Uploaded ${uploadedCount} product images to Cloudinary`);
    }
  } catch (err) {
    console.warn("Auto-upload error:", err.message);
  }
};

exports.resetAndUploadImages = async () => {
  try {
    const products = await Product.find();
    if (!products.length) return;

    let uploadedCount = 0;
    let failedCount = 0;
    for (const product of products) {
      const localPath = findLocalFile(product.image);
      if (!localPath) {
        console.warn(`⚠️ Local image not found for product: ${product.name}`);
        failedCount++;
        continue;
      }

      try {
        console.log(`📤 Uploading: ${product.name}`);
        const url = await uploadImageToCloudinary(localPath);
        product.image = url;
        await product.save();
        uploadedCount++;
        console.log(`✅ Uploaded: ${product.name}`);
      } catch (uploadErr) {
        console.warn(
          `⚠️ Upload failed for ${product.name}:`,
          uploadErr.message,
        );
        failedCount++;
      }
    }

    console.log(
      `🎉 Done! Uploaded ${uploadedCount} images, ${failedCount} failed`,
    );
  } catch (err) {
    console.error("Reset upload error:", err);
  }
};
