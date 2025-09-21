const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const Product = require("../models/Product");
const { isAuthenticatedUser } = require("../middleware/auth");

const router = express.Router();

// Get user's wishlist
router.get("/", isAuthenticatedUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "wishlist",
      populate: {
        path: "product",
        select: "name description price discountPrice images stock isAvailable",
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      items: user.wishlist || [],
    });
  } catch (error) {
    console.error("Wishlist fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
      error: error.message,
    });
  }
});

// Add item to wishlist
router.post(
  "/add",
  isAuthenticatedUser,
  [body("productId").notEmpty().withMessage("Product ID is required")],
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

      const { productId } = req.body;

      // Check if product exists
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Initialize wishlist if it doesn't exist
      if (!user.wishlist) {
        user.wishlist = [];
      }

      // Check if item already exists in wishlist
      const existingItem = user.wishlist.find(
        (item) => item.product.toString() === productId
      );

      if (existingItem) {
        return res.status(400).json({
          success: false,
          message: "Product already in wishlist",
        });
      }

      // Add to wishlist
      user.wishlist.push({
        product: productId,
        addedAt: new Date(),
      });

      await user.save();

      // Populate the newly added item for response
      await user.populate({
        path: "wishlist",
        populate: {
          path: "product",
          select:
            "name description price discountPrice images stock isAvailable",
        },
      });

      res.status(200).json({
        success: true,
        message: "Product added to wishlist",
        items: user.wishlist,
      });
    } catch (error) {
      console.error("Add to wishlist error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add to wishlist",
        error: error.message,
      });
    }
  }
);

// Remove item from wishlist
router.delete("/remove/:productId", isAuthenticatedUser, async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Initialize wishlist if it doesn't exist
    if (!user.wishlist) {
      user.wishlist = [];
    }

    // Remove from wishlist
    user.wishlist = user.wishlist.filter(
      (item) => item.product.toString() !== productId
    );

    await user.save();

    // Populate the updated wishlist for response
    await user.populate({
      path: "wishlist",
      populate: {
        path: "product",
        select: "name description price discountPrice images stock isAvailable",
      },
    });

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      items: user.wishlist,
    });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove from wishlist",
      error: error.message,
    });
  }
});

// Clear entire wishlist
router.delete("/clear", isAuthenticatedUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.wishlist = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: "Wishlist cleared successfully",
      items: [],
    });
  } catch (error) {
    console.error("Clear wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear wishlist",
      error: error.message,
    });
  }
});

// Check if product is in wishlist
router.get("/check/:productId", isAuthenticatedUser, async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isInWishlist =
      user.wishlist &&
      user.wishlist.some((item) => item.product.toString() === productId);

    res.status(200).json({
      success: true,
      isInWishlist,
    });
  } catch (error) {
    console.error("Check wishlist error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check wishlist",
      error: error.message,
    });
  }
});

module.exports = router;
