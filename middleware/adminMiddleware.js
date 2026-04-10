// ============================================================
// server/middleware/adminMiddleware.js
// Requires req.user to be set by authMiddleware first
// ============================================================

const adminOnly = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // req.user is a full Mongoose user document — use .role
    const role = String(req.user.role || "").toLowerCase().trim();

    if (role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    next();
  } catch (err) {
    console.error("ADMIN MIDDLEWARE ERROR:", err.message);
    res.status(500).json({ message: "Admin authorization failed" });
  }
};

module.exports = adminOnly;
