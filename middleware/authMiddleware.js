// ============================================================
// server/middleware/authMiddleware.js  — UNIFIED AUTH MIDDLEWARE
// Sets req.user = full user object (with ._id and .role)
// Used by ALL routes: cart, orders, products, users
// ============================================================

const jwt = require("jsonwebtoken");
const User = require("../models/user");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const token = authHeader.split(" ")[1];

    // Block obviously bad tokens
    if (!token || token === "undefined" || token === "null") {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch full user from DB
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    if (user.isActive === false) {
      return res.status(403).json({ message: "User account is disabled" });
    }

    // Attach FULL user object — all routes use req.user._id or req.user.id
    req.user = user;

    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    return res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = protect;
