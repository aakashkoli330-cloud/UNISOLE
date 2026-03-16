const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 🔒 Check header exists and format is correct
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token, authorization denied" });
    }

    const token = authHeader.split(" ")[1];

    // 🔥 VERY IMPORTANT: block invalid tokens before verifying
    if (!token || token === "undefined" || token === "null") {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    // Optional: only check if field exists
    if (user.isActive === false) {
      return res.status(403).json({ message: "User account is disabled" });
    }

    req.user = user;
    req.userId = user._id;

    next();

  } catch (err) {
    console.error("Auth middleware error:", err.message);
    return res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = protect;