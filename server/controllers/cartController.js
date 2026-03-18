const Cart = require("../models/Cart");
const Product = require("../models/Product");

/* =========================
   ADD TO CART
========================= */
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [{ product: productId, quantity: 1 }]
      });
    } else {
      // Remove any items that no longer exist
      cart.items = cart.items.filter(item => item.product !== null);

      const itemIndex = cart.items.findIndex(
        item => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += 1;
      } else {
        cart.items.push({ product: productId, quantity: 1 });
      }
    }

    await cart.save();
    res.json({ success: true, message: "Added to cart" });

  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   GET CART
========================= */
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate("items.product");

    if (!cart) {
      return res.json({ items: [] });
    }

    // ✅ Filter out deleted products
    cart.items = cart.items.filter(item => item.product !== null);

    // Optional: persist cleaned cart
    await cart.save();

    res.json(cart);
  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   UPDATE CART ITEM QUANTITY
========================= */
exports.updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, change } = req.body;

    if (!productId || !change) {
      return res.status(400).json({ message: "Product ID and change required" });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Product not in cart" });
    }

    cart.items[itemIndex].quantity += Number(change);

    // Remove item if quantity <= 0
    if (cart.items[itemIndex].quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    }

    await cart.save();
    res.json({ success: true, message: "Cart updated" });

  } catch (err) {
    console.error("Update cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   REMOVE FROM CART
========================= */
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID required" });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );

    await cart.save();
    res.json({ success: true, message: "Removed from cart" });

  } catch (err) {
    console.error("Remove cart error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
