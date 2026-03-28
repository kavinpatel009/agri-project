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

const crypto = require('crypto');
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);
const PasswordReset = require('../models/PasswordReset');

// ── FORGOT PASSWORD ───────────────────────────────────────
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always return success (security - don't reveal if email exists)
    if (!user) {
      return res.json({ message: "If this email exists, a reset link has been sent." });
    }

    // Delete old tokens for this user
    await PasswordReset.deleteMany({ userId: user._id });

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    await PasswordReset.create({ userId: user._id, token, expiresAt });

    const resetLink = `https://agriverse-in.vercel.app/reset-password.html?token=${token}`;

    await resend.emails.send({
      from: "Agri-Verse <onboarding@resend.dev>",
      to: "kavinjpatel104@gmail.com",
      subject: `🔐 Password Reset Request — ${user.email}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;border-radius:12px;overflow:hidden;border:1px solid #e0e0e0;">
          <div style="background:linear-gradient(135deg,#1b4332,#2d6a4f);padding:28px;text-align:center;">
            <h2 style="color:#fff;margin:0;">🌿 Agri-Verse — Password Reset</h2>
          </div>
          <div style="padding:28px;">
            <p style="color:#333;"><strong>User:</strong> ${user.name}</p>
            <p style="color:#333;"><strong>Email:</strong> ${user.email}</p>
            <p style="color:#555;font-size:0.9rem;margin:16px 0;">Reset link (share with user — expires in 30 min):</p>
            <div style="background:#f5f5f5;padding:14px;border-radius:8px;word-break:break-all;font-size:0.85rem;color:#1b4332;">
              ${resetLink}
            </div>
            <div style="text-align:center;margin:20px 0;">
              <a href="${resetLink}" style="background:#2d6a4f;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;">Open Reset Link</a>
            </div>
            <p style="color:#aaa;font-size:0.75rem;text-align:center;">© 2026 Agri-Verse</p>
          </div>
        </div>
      `
    });

    res.json({ message: "If this email exists, a reset link has been sent." });

  } catch (e) {
    console.error("Forgot password error:", e.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ── RESET PASSWORD ────────────────────────────────────────
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: "Token and password required" });
    if (newPassword.length < 6) return res.status(400).json({ message: "Password min 6 characters" });

    const resetDoc = await PasswordReset.findOne({ token, used: false });

    if (!resetDoc) return res.status(400).json({ message: "Invalid or expired reset link" });
    if (new Date() > resetDoc.expiresAt) {
      await PasswordReset.deleteOne({ _id: resetDoc._id });
      return res.status(400).json({ message: "Reset link expired. Please request again." });
    }

    // Update password
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);
    await User.findByIdAndUpdate(resetDoc.userId, { password: hashed });

    // Mark token as used & delete
    await PasswordReset.deleteOne({ _id: resetDoc._id });

    res.json({ message: "Password reset successfully! You can now login." });

  } catch (e) {
    console.error("Reset password error:", e.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
