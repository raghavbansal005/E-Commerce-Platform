const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @route   POST /api/password-reset/forgot-password
// @desc    Send OTP to email for password reset
// @access  Public
router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Please enter a valid email")],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { email } = req.body;

      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "No account found with this email address",
        });
      }

      // Generate OTP
      const otp = generateOTP();
      const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

      // Store OTP temporarily
      otpStore.set(email, {
        otp,
        expiry: otpExpiry,
        attempts: 0,
      });

      // Send OTP email
      const emailOptions = {
        email: user.email,
        subject: "Password Reset OTP - Subscribify",
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #6366f1; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #6366f1; letter-spacing: 5px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
              <p>Subscribify - Your trusted e-commerce platform</p>
            </div>
            <div class="content">
              <h2>Hello ${user.name},</h2>
              <p>We received a request to reset your password. Use the OTP below to proceed with password reset:</p>
              
              <div class="otp-box">
                <p style="margin: 0; font-size: 16px; color: #666;">Your OTP Code</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">Valid for 10 minutes</p>
              </div>

              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul style="margin: 10px 0;">
                  <li>This OTP is valid for 10 minutes only</li>
                  <li>Don't share this code with anyone</li>
                  <li>If you didn't request this, please ignore this email</li>
                </ul>
              </div>

              <p>If you have any questions, please contact our support team.</p>
              
              <div class="footer">
                <p>Best regards,<br>The Subscribify Team</p>
                <p><a href="${
                  process.env.FRONTEND_URL || "http://localhost:3000"
                }" style="color: #6366f1;">Visit Subscribify</a></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      };

      await sendEmail(emailOptions);

      res.status(200).json({
        success: true,
        message: "OTP sent to your email address. Please check your inbox.",
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send OTP. Please try again later.",
      });
    }
  }
);

// @route   POST /api/password-reset/verify-otp
// @desc    Verify OTP for password reset
// @access  Public
router.post(
  "/verify-otp",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("otp")
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be 6 digits"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { email, otp } = req.body;

      // Check if OTP exists
      const storedOtpData = otpStore.get(email);
      if (!storedOtpData) {
        return res.status(400).json({
          success: false,
          message: "OTP not found or expired. Please request a new one.",
        });
      }

      // Check if OTP is expired
      if (Date.now() > storedOtpData.expiry) {
        otpStore.delete(email);
        return res.status(400).json({
          success: false,
          message: "OTP has expired. Please request a new one.",
        });
      }

      // Check attempts
      if (storedOtpData.attempts >= 3) {
        otpStore.delete(email);
        return res.status(400).json({
          success: false,
          message: "Too many failed attempts. Please request a new OTP.",
        });
      }

      // Verify OTP
      if (storedOtpData.otp !== otp) {
        storedOtpData.attempts += 1;
        return res.status(400).json({
          success: false,
          message: `Invalid OTP. ${
            3 - storedOtpData.attempts
          } attempts remaining.`,
        });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = Date.now() + 30 * 60 * 1000; // 30 minutes

      // Update user with reset token
      await User.findOneAndUpdate(
        { email },
        {
          resetPasswordToken: resetToken,
          resetPasswordExpiry: resetTokenExpiry,
        }
      );

      // Clear OTP
      otpStore.delete(email);

      res.status(200).json({
        success: true,
        message: "OTP verified successfully",
        resetToken,
      });
    } catch (error) {
      console.error("Verify OTP error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to verify OTP. Please try again.",
      });
    }
  }
);

// @route   POST /api/password-reset/reset-password
// @desc    Reset password with token
// @access  Public
router.post(
  "/reset-password",
  [
    body("resetToken").notEmpty().withMessage("Reset token is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { resetToken, newPassword } = req.body;

      // Find user with valid reset token
      const user = await User.findOne({
        resetPasswordToken: resetToken,
        resetPasswordExpire: { $gt: Date.now() },
      });

      if (!user) {
        console.log("Reset token validation failed:", {
          resetToken,
          timestamp: Date.now(),
          message: "No user found with valid reset token",
        });
        return res.status(400).json({
          success: false,
          message:
            "Invalid or expired reset token. Please request a new password reset.",
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update user password and clear reset token
      await User.findByIdAndUpdate(user._id, {
        password: hashedPassword,
        resetPasswordToken: undefined,
        resetPasswordExpire: undefined,
      });

      // Send confirmation email
      const emailOptions = {
        email: user.email,
        subject: "Password Reset Successful - Subscribify",
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
            .success-box { background: #d1fae5; border: 1px solid #10b981; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Password Reset Successful</h1>
              <p>Subscribify - Your trusted e-commerce platform</p>
            </div>
            <div class="content">
              <h2>Hello ${user.name},</h2>
              
              <div class="success-box">
                <h3 style="color: #059669; margin: 0;">Password Updated Successfully!</h3>
                <p style="margin: 10px 0 0 0;">Your account password has been reset successfully.</p>
              </div>

              <p>You can now log in to your account using your new password.</p>
              <p>If you didn't make this change, please contact our support team immediately.</p>
              
              <div class="footer">
                <p>Best regards,<br>The Subscribify Team</p>
                <p><a href="${
                  process.env.FRONTEND_URL || "http://localhost:3000"
                }/login" style="color: #6366f1;">Login to Your Account</a></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      };

      await sendEmail(emailOptions);

      res.status(200).json({
        success: true,
        message:
          "Password reset successfully. You can now login with your new password.",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to reset password. Please try again.",
      });
    }
  }
);

module.exports = router;
