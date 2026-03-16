/**
 * Admin-only middleware
 * Must be used AFTER authMiddleware
 */

const adminOnly = (req, res, next) => {
  try {
    // Auth middleware must attach user
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    // Normalize role (VERY IMPORTANT FIX)
    const role = String(req.user.role || "").toLowerCase();

    if (role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admins only."
      });
    }

    next();
  } catch (err) {
    console.error("ADMIN MIDDLEWARE ERROR:", err.message);
    res.status(500).json({
      message: "Admin authorization failed"
    });
  }
};

module.exports = adminOnly;