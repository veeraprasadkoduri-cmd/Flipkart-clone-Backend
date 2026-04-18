const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { pool } = require("../db");
require("dotenv").config();

// ─── Email Transporter ────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const sendOTPEmail = async (email, name, otp) => {
  const mailOptions = {
    from: `"Flipkart Clone" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Flipkart Clone OTP Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
        <div style="background: #2874f0; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">Flipkart</h1>
        </div>
        <div style="padding: 30px;">
          <h2 style="color: #212121;">Hi ${name},</h2>
          <p style="color: #555; font-size: 15px;">Please use the following OTP to verify your email address. This OTP is valid for <strong>5 minutes</strong>.</p>
          <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #2874f0;">${otp}</span>
          </div>
          <p style="color: #888; font-size: 13px;">If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};

// ─── Controllers ──────────────────────────────────────────────────────────────

// POST /signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    if (password.length < 6)
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });

    // Check existing user
    const [existing] = await pool.execute(
      "SELECT id, is_verified FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      if (existing[0].is_verified)
        return res.status(409).json({ message: "Email already registered" });

      // Re-send OTP for unverified user
      const otp = generateOTP();
      const expiry = new Date(Date.now() + 5 * 60 * 1000);
      await pool.execute(
        "UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?",
        [otp, expiry, email]
      );
      await sendOTPEmail(email, name, otp);
      return res.status(200).json({
        message: "OTP resent to your email. Please verify.",
        email,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const otp = generateOTP();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    await pool.execute(
      "INSERT INTO users (name, email, password, otp, otp_expiry) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashedPassword, otp, expiry]
    );

    await sendOTPEmail(email, name, otp);

    res.status(201).json({
      message: "Account created! OTP sent to your email.",
      email,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// POST /verify-otp
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP are required" });

    const [users] = await pool.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0)
      return res.status(404).json({ message: "User not found" });

    const user = users[0];

    if (user.is_verified)
      return res.status(400).json({ message: "Email already verified" });

    if (!user.otp || !user.otp_expiry)
      return res.status(400).json({ message: "No OTP found. Please signup again." });

    if (new Date() > new Date(user.otp_expiry))
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });

    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP. Please try again." });

    await pool.execute(
      "UPDATE users SET is_verified = TRUE, otp = NULL, otp_expiry = NULL WHERE email = ?",
      [email]
    );

    res.status(200).json({ message: "Email verified successfully! You can now login." });
  } catch (err) {
    console.error("OTP verify error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// POST /login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const [users] = await pool.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0)
      return res.status(401).json({ message: "Invalid email or password" });

    const user = users[0];

    if (!user.is_verified)
      return res.status(403).json({
        message: "Please verify your email before logging in.",
        needsVerification: true,
        email: user.email,
      });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

// GET /profile (protected)
exports.getProfile = async (req, res) => {
  try {
    const [users] = await pool.execute(
      "SELECT id, name, email, is_verified, created_at FROM users WHERE id = ?",
      [req.user.id]
    );

    if (users.length === 0)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json({ user: users[0] });
  } catch (err) {
    console.error("Profile error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// POST /resend-otp
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const [users] = await pool.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0)
      return res.status(404).json({ message: "User not found" });

    const user = users[0];
    if (user.is_verified)
      return res.status(400).json({ message: "Email already verified" });

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);

    await pool.execute(
      "UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?",
      [otp, expiry, email]
    );

    await sendOTPEmail(email, user.name, otp);
    res.status(200).json({ message: "New OTP sent to your email." });
  } catch (err) {
    console.error("Resend OTP error:", err);
    res.status(500).json({ message: "Server error." });
  }
};
