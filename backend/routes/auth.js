const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { isAuthenticatedUser } = require("../middleware/auth");
const { sendEmail, getWelcomeEmailTemplate } = require("../utils/sendEmail");
const { uploadSingle } = require("../middleware/upload");
const { uploadImage } = require("../utils/cloudinary");

const router = express.Router();

// In-memory OTP storage (in production, use Redis or database)
const otpStorage = new Map();

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP for registration
router.post(
  "/send-otp",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("name")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters"),
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

      const { email, name } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists with this email",
        });
      }

      // Generate OTP
      const otp = generateOTP();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      // Store OTP with user data
      otpStorage.set(email, {
        otp,
        expiresAt,
        name,
        email,
        verified: false,
      });

      // Send OTP email
      try {
        await sendEmail({
          email,
          subject: "Your OTP for Subscribify Registration",
          html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1976d2;">Welcome to Subscribify!</h2>
            <p>Hi ${name},</p>
            <p>Thank you for choosing Subscribify. To complete your registration, please use the following OTP:</p>
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #1976d2; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
            </div>
            <p>This OTP is valid for 10 minutes only.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <p>Best regards,<br>The Subscribify Team</p>
          </div>
        `,
        });

        res.status(200).json({
          success: true,
          message: "OTP sent successfully to your email",
        });
      } catch (emailError) {
        console.error("OTP email failed:", emailError);
        res.status(500).json({
          success: false,
          message: "Failed to send OTP. Please try again.",
        });
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to send OTP",
        error: error.message,
      });
    }
  }
);

// Verify OTP only (for new flow)
router.post(
  "/verify-otp-only",
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
      const otpData = otpStorage.get(email);
      if (!otpData) {
        return res.status(400).json({
          success: false,
          message: "OTP not found. Please request a new OTP.",
        });
      }

      // Check if OTP is expired
      if (Date.now() > otpData.expiresAt) {
        otpStorage.delete(email);
        return res.status(400).json({
          success: false,
          message: "OTP has expired. Please request a new OTP.",
        });
      }

      // Verify OTP
      if (otpData.otp !== otp) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP. Please try again.",
        });
      }

      // Mark OTP as verified but don't delete it yet
      otpData.verified = true;
      otpStorage.set(email, otpData);

      res.status(200).json({
        success: true,
        message: "OTP verified successfully",
      });
    } catch (error) {
      console.error("OTP verification error:", error);
      res.status(500).json({
        success: false,
        message: "OTP verification failed",
        error: error.message,
      });
    }
  }
);

// Verify OTP and complete registration
router.post(
  "/verify-otp",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("otp")
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be 6 digits"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
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

      const { email, otp, password } = req.body;

      // Check if OTP exists
      const otpData = otpStorage.get(email);
      if (!otpData) {
        return res.status(400).json({
          success: false,
          message: "OTP not found. Please request a new OTP.",
        });
      }

      // Check if OTP is expired
      if (Date.now() > otpData.expiresAt) {
        otpStorage.delete(email);
        return res.status(400).json({
          success: false,
          message: "OTP has expired. Please request a new OTP.",
        });
      }

      // Verify OTP
      if (otpData.otp !== otp) {
        return res.status(400).json({
          success: false,
          message: "Invalid OTP. Please try again.",
        });
      }

      // Check if user already exists (double check)
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        otpStorage.delete(email);
        return res.status(400).json({
          success: false,
          message: "User already exists with this email",
        });
      }

      // Create user
      const user = await User.create({
        name: otpData.name,
        email: otpData.email,
        password,
        isEmailVerified: true,
      });

      // Clean up OTP
      otpStorage.delete(email);

      // Generate JWT token
      const token = user.getJWTToken();

      // Send welcome email
      try {
        await sendEmail({
          email: user.email,
          subject: "Welcome to Subscribify!",
          html: getWelcomeEmailTemplate(user.name),
        });
      } catch (emailError) {
        console.error("Welcome email failed:", emailError);
      }

      res.status(201).json({
        success: true,
        message: "Registration completed successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
        },
      });
    } catch (error) {
      console.error("OTP verification error:", error);
      res.status(500).json({
        success: false,
        message: "Registration failed",
        error: error.message,
      });
    }
  }
);

// Register user
router.post(
  "/register",
  [
    body("name")
      .trim()
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters"),
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
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

      const { name, email, password, isOTPVerified } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists with this email",
        });
      }

      // If this is from OTP flow, verify that OTP was actually verified
      if (isOTPVerified) {
        const otpData = otpStorage.get(email);
        if (!otpData || !otpData.verified) {
          return res.status(400).json({
            success: false,
            message:
              "Email verification required. Please complete OTP verification first.",
          });
        }
        // Clean up OTP data after successful verification
        otpStorage.delete(email);
      }

      // Create user
      const user = await User.create({
        name,
        email,
        password,
        isEmailVerified: isOTPVerified || false,
      });

      // Generate JWT token
      const token = user.getJWTToken();

      // Send welcome email
      try {
        await sendEmail({
          email: user.email,
          subject: "Welcome to Subscribify!",
          html: getWelcomeEmailTemplate(user.name),
        });
      } catch (emailError) {
        console.error("Welcome email failed:", emailError);
      }

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        success: false,
        message: "Registration failed",
        error: error.message,
      });
    }
  }
);

// Login user
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password").notEmpty().withMessage("Password is required"),
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

      const { email, password } = req.body;

      // Find user and include password
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Check password
      const isPasswordMatched = await user.comparePassword(password);
      if (!isPasswordMatched) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Generate JWT token
      const token = user.getJWTToken();

      res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Login failed",
        error: error.message,
      });
    }
  }
);

// Get user profile
router.get("/profile", isAuthenticatedUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        address: user.address,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
});

// Update user profile
router.put(
  "/profile",
  isAuthenticatedUser,
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters"),
    body("phone")
      .optional()
      .trim()
      .isMobilePhone()
      .withMessage("Please enter a valid phone number"),
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

      const { name, phone, address } = req.body;

      const updateData = {};
      if (name) updateData.name = name;
      if (phone) updateData.phone = phone;
      if (address) updateData.address = address;

      const user = await User.findByIdAndUpdate(req.user.id, updateData, {
        new: true,
        runValidators: true,
      });

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
          address: user.address,
        },
      });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({
        success: false,
        message: "Profile update failed",
        error: error.message,
      });
    }
  }
);

// Update avatar
router.put(
  "/avatar",
  isAuthenticatedUser,
  uploadSingle("avatar"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Please select an image file",
        });
      }

      // Upload to Cloudinary
      const result = await uploadImage(req.file.path, "subscribify/avatars");

      // Update user avatar
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { avatar: result },
        { new: true }
      );

      res.status(200).json({
        success: true,
        message: "Avatar updated successfully",
        avatar: user.avatar,
      });
    } catch (error) {
      console.error("Avatar update error:", error);
      res.status(500).json({
        success: false,
        message: "Avatar update failed",
        error: error.message,
      });
    }
  }
);

// Change password
router.put(
  "/password",
  isAuthenticatedUser,
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters"),
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

      const { currentPassword, newPassword } = req.body;

      // Get user with password
      const user = await User.findById(req.user.id).select("+password");

      // Check current password
      const isCurrentPasswordCorrect = await user.comparePassword(
        currentPassword
      );
      if (!isCurrentPasswordCorrect) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(500).json({
        success: false,
        message: "Password change failed",
        error: error.message,
      });
    }
  }
);

// Logout (client-side token removal)
router.post("/logout", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});

module.exports = router;
