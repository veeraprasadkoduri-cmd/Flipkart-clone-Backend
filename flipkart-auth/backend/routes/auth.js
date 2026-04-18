const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// ─── JWT Middleware ───────────────────────────────────────────────────────────
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer "))
    return res.status(401).json({ message: "Access denied. No token provided." });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

// ─── Public Routes ────────────────────────────────────────────────────────────
router.post("/signup", authController.signup);
router.post("/verify-otp", authController.verifyOTP);
router.post("/login", authController.login);
router.post("/resend-otp", authController.resendOTP);

// ─── Protected Routes ─────────────────────────────────────────────────────────
router.get("/profile", authenticate, authController.getProfile);

module.exports = router;
