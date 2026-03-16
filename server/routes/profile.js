const express = require("express");
const bcrypt = require("bcryptjs");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();

/* ================= GET PROFILE ================= */
router.get("/", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user).select("-password");
  res.json(user);
});

/* ================= UPDATE PROFILE ================= */
router.put("/update", authMiddleware, async (req, res) => {
  const { name, email, address } = req.body;

  const user = await User.findById(req.user);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (name) user.name = name;
  if (email) user.email = email;
  if (address) user.address = address;

  await user.save();
  res.json({ message: "Profile updated successfully" });
});

/* ================= CHANGE PASSWORD ================= */
router.put("/password", authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user);
  if (!user) return res.status(404).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Current password incorrect" });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ message: "Password changed successfully" });
});

module.exports = router;