const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log("AUTH HEADER:",authHeader);

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  // Expecting: "Bearer <token>"
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Invalid token format" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 THIS WAS MISSING / BROKEN BEFORE
    req.user = decoded;

    next();
  } catch (err) {
    console.error("AUTH ERROR:", err.message);
    res.status(401).json({ message: "Token is not valid" });
  }
};