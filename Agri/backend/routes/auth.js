const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

// Register Route
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ── GET PROFILE ──────────────────────────────────────────
router.get("/profile", async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "No token" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
    const user = await User.findById(decoded.id, '-password');
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (e) {
    res.status(401).json({ message: "Invalid token" });
  }
});

// ── UPDATE NAME ───────────────────────────────────────────
router.put("/profile", async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "No token" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
    const { name } = req.body;
    if (!name || name.trim().length < 2) return res.status(400).json({ message: "Valid name required" });
    const user = await User.findByIdAndUpdate(decoded.id, { name: name.trim() }, { new: true, select: '-password' });
    res.json({ message: "Profile updated", user });
  } catch (e) {
    res.status(401).json({ message: "Invalid token" });
  }
});

// ── CHANGE PASSWORD ───────────────────────────────────────
router.put("/password", async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "No token" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: "Both passwords required" });
    if (newPassword.length < 6) return res.status(400).json({ message: "New password min 6 characters" });

    const user = await User.findById(decoded.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: "Current password incorrect" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ message: "Password changed successfully" });
  } catch (e) {
    res.status(401).json({ message: "Invalid token" });
  }
});

// ── DELETE ACCOUNT ────────────────────────────────────────
router.delete("/account", async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: "No token" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
    await User.findByIdAndDelete(decoded.id);
    res.json({ message: "Account deleted" });
  } catch (e) {
    res.status(401).json({ message: "Invalid token" });
  }
});

module.exports = router;
