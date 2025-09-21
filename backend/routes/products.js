const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');
const { uploadMultipleImages, deleteMultipleImages } = require('../utils/cloudinary');

const router = express.Router();

// Get all products with search and filtering
router.get('/', async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      rating,
      sort,
      page = 1,
      limit = 12
    } = req.query;

    // Build query
    let query = { isAvailable: true };

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Rating filter
    if (rating) {
      query['ratings.average'] = { $gte: Number(rating) };
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'price_low':
        sortObj.price = 1;
        break;
      case 'price_high':
        sortObj.price = -1;
        break;
      case 'rating':
        sortObj['ratings.average'] = -1;
        break;
      case 'newest':
        sortObj.createdAt = -1;
        break;
      default:
        sortObj.createdAt = -1;
    }

    // If text search, add score sorting
    if (search) {
      sortObj.score = { $meta: 'textScore' };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query
    const products = await Product.find(query)
      .populate('createdBy', 'name')
      .sort(sortObj)
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalProducts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message
    });
  }
});

// Get featured products
router.get('/featured', async (req, res) => {
  try {
    // First try to get products with high ratings (4+)
    let products = await Product.find({
      isAvailable: true,
      'ratings.average': { $gte: 4 }
    })
    .populate('createdBy', 'name')
    .sort({ 'ratings.average': -1, createdAt: -1 })
    .limit(8);

    // If no high-rated products found, get any available products
    if (products.length === 0) {
      products = await Product.find({
        isAvailable: true
      })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(8);
    }

    res.status(200).json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Featured products fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products',
      error: error.message
    });
  }
});

// Get product categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isAvailable: true });
    
    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('reviews.user', 'name avatar');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Product fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error.message
    });
  }
});

// Create product (Admin only)
router.post('/', isAuthenticatedUser, authorizeRoles('admin'), uploadMultiple('images', 5), [
  body('name').trim().isLength({ min: 2 }).withMessage('Product name must be at least 2 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('category').notEmpty().withMessage('Category is required'),
  body('stock').isNumeric().withMessage('Stock must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      name,
      description,
      price,
      discountPrice,
      category,
      subcategory,
      brand,
      stock,
      tags,
      specifications,
      weight,
      dimensions,
      isSubscriptionAvailable,
      subscriptionPlans
    } = req.body;

    // Upload images to Cloudinary
    let images = [];
    if (req.files && req.files.length > 0) {
      images = await uploadMultipleImages(req.files, 'subscribify/products');
    }

    // Parse JSON fields
    let parsedTags = [];
    let parsedSpecifications = {};
    let parsedDimensions = {};
    let parsedSubscriptionPlans = [];

    try {
      if (tags) parsedTags = JSON.parse(tags);
      if (specifications) parsedSpecifications = JSON.parse(specifications);
      if (dimensions) parsedDimensions = JSON.parse(dimensions);
      if (subscriptionPlans) parsedSubscriptionPlans = JSON.parse(subscriptionPlans);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
    }

    const product = await Product.create({
      name,
      description,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      category,
      subcategory,
      brand,
      images,
      stock: Number(stock),
      tags: parsedTags,
      specifications: parsedSpecifications,
      weight: weight ? Number(weight) : undefined,
      dimensions: parsedDimensions,
      isSubscriptionAvailable: isSubscriptionAvailable === 'true',
      subscriptionPlans: parsedSubscriptionPlans,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Product creation failed',
      error: error.message
    });
  }
});

// Update product (Admin only)
router.put('/:id', isAuthenticatedUser, authorizeRoles('admin'), uploadMultiple('images', 5), async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const {
      name,
      description,
      price,
      discountPrice,
      category,
      subcategory,
      brand,
      stock,
      tags,
      specifications,
      weight,
      dimensions,
      isSubscriptionAvailable,
      subscriptionPlans,
      isAvailable
    } = req.body;

    // Handle new images
    let newImages = [];
    if (req.files && req.files.length > 0) {
      newImages = await uploadMultipleImages(req.files, 'subscribify/products');
    }

    // Parse JSON fields
    let parsedTags = product.tags;
    let parsedSpecifications = product.specifications;
    let parsedDimensions = product.dimensions;
    let parsedSubscriptionPlans = product.subscriptionPlans;

    try {
      if (tags) parsedTags = JSON.parse(tags);
      if (specifications) parsedSpecifications = JSON.parse(specifications);
      if (dimensions) parsedDimensions = JSON.parse(dimensions);
      if (subscriptionPlans) parsedSubscriptionPlans = JSON.parse(subscriptionPlans);
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
    }

    // Update product
    const updateData = {
      name: name || product.name,
      description: description || product.description,
      price: price ? Number(price) : product.price,
      discountPrice: discountPrice ? Number(discountPrice) : product.discountPrice,
      category: category || product.category,
      subcategory: subcategory || product.subcategory,
      brand: brand || product.brand,
      stock: stock !== undefined ? Number(stock) : product.stock,
      tags: parsedTags,
      specifications: parsedSpecifications,
      weight: weight ? Number(weight) : product.weight,
      dimensions: parsedDimensions,
      isSubscriptionAvailable: isSubscriptionAvailable !== undefined ? isSubscriptionAvailable === 'true' : product.isSubscriptionAvailable,
      subscriptionPlans: parsedSubscriptionPlans,
      isAvailable: isAvailable !== undefined ? isAvailable === 'true' : product.isAvailable
    };

    // Add new images to existing ones
    if (newImages.length > 0) {
      updateData.images = [...product.images, ...newImages];
    }

    product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Product update error:', error);
    res.status(500).json({
      success: false,
      message: 'Product update failed',
      error: error.message
    });
  }
});

// Delete product (Admin only)
router.delete('/:id', isAuthenticatedUser, authorizeRoles('admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete images from Cloudinary
    if (product.images.length > 0) {
      const publicIds = product.images.map(img => img.public_id);
      await deleteMultipleImages(publicIds);
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Product deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Product deletion failed',
      error: error.message
    });
  }
});

// Add product review
router.post('/:id/reviews', isAuthenticatedUser, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().isLength({ min: 5 }).withMessage('Comment must be at least 5 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already reviewed this product
    const existingReview = product.reviews.find(
      review => review.user.toString() === req.user.id.toString()
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Add review
    const review = {
      user: req.user.id,
      name: req.user.name,
      rating: Number(rating),
      comment
    };

    product.reviews.push(review);
    product.calculateAverageRating();
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully'
    });
  } catch (error) {
    console.error('Review addition error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add review',
      error: error.message
    });
  }
});

module.exports = router;