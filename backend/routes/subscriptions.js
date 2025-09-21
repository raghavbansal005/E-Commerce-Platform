const express = require('express');
const { body, validationResult } = require('express-validator');
const Subscription = require('../models/Subscription');
const Product = require('../models/Product');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');
const { sendEmail, getSubscriptionConfirmationTemplate } = require('../utils/sendEmail');

const router = express.Router();

// Create new subscription
router.post('/', isAuthenticatedUser, [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('planId').notEmpty().withMessage('Plan ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('shippingAddress.name').notEmpty().withMessage('Shipping name is required'),
  body('shippingAddress.phone').notEmpty().withMessage('Phone number is required'),
  body('shippingAddress.email').isEmail().withMessage('Valid email is required'),
  body('shippingAddress.street').notEmpty().withMessage('Street address is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.state').notEmpty().withMessage('State is required'),
  body('shippingAddress.zipCode').notEmpty().withMessage('Zip code is required'),
  body('stripeSubscriptionId').notEmpty().withMessage('Stripe subscription ID is required'),
  body('stripeCustomerId').notEmpty().withMessage('Stripe customer ID is required')
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
      productId,
      planId,
      quantity,
      shippingAddress,
      stripeSubscriptionId,
      stripeCustomerId,
      notes
    } = req.body;

    // Validate product and plan
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.isSubscriptionAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Product is not available for subscription'
      });
    }

    const plan = product.subscriptionPlans.id(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }

    // Calculate subscription dates
    const currentDate = new Date();
    const currentPeriodStart = new Date(currentDate);
    let currentPeriodEnd = new Date(currentDate);

    switch (plan.interval) {
      case 'weekly':
        currentPeriodEnd.setDate(currentPeriodEnd.getDate() + (7 * plan.intervalCount));
        break;
      case 'monthly':
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + plan.intervalCount);
        break;
      case 'quarterly':
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + (3 * plan.intervalCount));
        break;
      case 'yearly':
        currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + plan.intervalCount);
        break;
    }

    // Create subscription
    const subscription = await Subscription.create({
      user: req.user.id,
      product: productId,
      plan: {
        name: plan.name,
        interval: plan.interval,
        intervalCount: plan.intervalCount,
        price: plan.price
      },
      quantity,
      stripeSubscriptionId,
      stripeCustomerId,
      currentPeriodStart,
      currentPeriodEnd,
      nextBillingDate: currentPeriodEnd,
      shippingAddress,
      notes
    });

    // Populate subscription for response
    const populatedSubscription = await Subscription.findById(subscription._id)
      .populate('user', 'name email')
      .populate('product', 'name images');

    // Send subscription confirmation email
    try {
      await sendEmail({
        email: shippingAddress.email,
        subject: 'Subscription Confirmed - Subscribify',
        html: getSubscriptionConfirmationTemplate(populatedSubscription)
      });
    } catch (emailError) {
      console.error('Subscription confirmation email failed:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      subscription: populatedSubscription
    });
  } catch (error) {
    console.error('Subscription creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Subscription creation failed',
      error: error.message
    });
  }
});

// Get user subscriptions
router.get('/my-subscriptions', isAuthenticatedUser, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    let query = { user: req.user.id };
    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const subscriptions = await Subscription.find(query)
      .populate('product', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalSubscriptions = await Subscription.countDocuments(query);
    const totalPages = Math.ceil(totalSubscriptions / limit);

    res.status(200).json({
      success: true,
      subscriptions,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalSubscriptions,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Subscriptions fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscriptions',
      error: error.message
    });
  }
});

// Get single subscription
router.get('/:id', isAuthenticatedUser, async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id)
      .populate('user', 'name email')
      .populate('product', 'name images description')
      .populate('deliveryHistory.orderId');

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Check if user owns this subscription or is admin
    if (subscription.user._id.toString() !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      subscription
    });
  } catch (error) {
    console.error('Subscription fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription',
      error: error.message
    });
  }
});

// Pause subscription
router.put('/:id/pause', isAuthenticatedUser, [
  body('reason').optional().trim().isLength({ max: 200 }).withMessage('Reason cannot exceed 200 characters')
], async (req, res) => {
  try {
    const { reason } = req.body;
    
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Check if user owns this subscription
    if (subscription.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (subscription.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Only active subscriptions can be paused'
      });
    }

    subscription.pause(reason);
    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'Subscription paused successfully',
      subscription
    });
  } catch (error) {
    console.error('Subscription pause error:', error);
    res.status(500).json({
      success: false,
      message: 'Subscription pause failed',
      error: error.message
    });
  }
});

// Resume subscription
router.put('/:id/resume', isAuthenticatedUser, async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Check if user owns this subscription
    if (subscription.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (subscription.status !== 'paused') {
      return res.status(400).json({
        success: false,
        message: 'Only paused subscriptions can be resumed'
      });
    }

    subscription.resume();
    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'Subscription resumed successfully',
      subscription
    });
  } catch (error) {
    console.error('Subscription resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Subscription resume failed',
      error: error.message
    });
  }
});

// Cancel subscription
router.put('/:id/cancel', isAuthenticatedUser, [
  body('reason').optional().trim().isLength({ max: 200 }).withMessage('Reason cannot exceed 200 characters')
], async (req, res) => {
  try {
    const { reason } = req.body;
    
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Check if user owns this subscription
    if (subscription.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (subscription.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Subscription is already cancelled'
      });
    }

    subscription.cancel(reason);
    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscription
    });
  } catch (error) {
    console.error('Subscription cancellation error:', error);
    res.status(500).json({
      success: false,
      message: 'Subscription cancellation failed',
      error: error.message
    });
  }
});

// Update shipping address
router.put('/:id/shipping-address', isAuthenticatedUser, [
  body('shippingAddress.name').notEmpty().withMessage('Name is required'),
  body('shippingAddress.phone').notEmpty().withMessage('Phone number is required'),
  body('shippingAddress.email').isEmail().withMessage('Valid email is required'),
  body('shippingAddress.street').notEmpty().withMessage('Street address is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.state').notEmpty().withMessage('State is required'),
  body('shippingAddress.zipCode').notEmpty().withMessage('Zip code is required')
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

    const { shippingAddress } = req.body;
    
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Check if user owns this subscription
    if (subscription.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    subscription.shippingAddress = shippingAddress;
    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'Shipping address updated successfully',
      subscription
    });
  } catch (error) {
    console.error('Shipping address update error:', error);
    res.status(500).json({
      success: false,
      message: 'Shipping address update failed',
      error: error.message
    });
  }
});

// Admin routes

// Get all subscriptions (Admin only)
router.get('/admin/all', isAuthenticatedUser, authorizeRoles('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;

    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { 'shippingAddress.name': { $regex: search, $options: 'i' } },
        { 'shippingAddress.email': { $regex: search, $options: 'i' } },
        { 'shippingAddress.phone': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const subscriptions = await Subscription.find(query)
      .populate('user', 'name email')
      .populate('product', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const totalSubscriptions = await Subscription.countDocuments(query);
    const totalPages = Math.ceil(totalSubscriptions / limit);

    // Calculate statistics
    const stats = await Subscription.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      subscriptions,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalSubscriptions,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      stats
    });
  } catch (error) {
    console.error('Admin subscriptions fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscriptions',
      error: error.message
    });
  }
});

// Get subscriptions due for renewal
router.get('/admin/due-renewals', isAuthenticatedUser, authorizeRoles('admin'), async (req, res) => {
  try {
    const currentDate = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(currentDate.getDate() + 7);

    const subscriptions = await Subscription.find({
      status: 'active',
      nextBillingDate: { $lte: nextWeek }
    })
    .populate('user', 'name email')
    .populate('product', 'name images')
    .sort({ nextBillingDate: 1 });

    res.status(200).json({
      success: true,
      subscriptions
    });
  } catch (error) {
    console.error('Due renewals fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch due renewals',
      error: error.message
    });
  }
});

module.exports = router;