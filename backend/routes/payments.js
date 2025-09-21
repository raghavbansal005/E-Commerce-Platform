const express = require("express");
const { body, validationResult } = require("express-validator");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { isAuthenticatedUser } = require("../middleware/auth");
const Product = require("../models/Product");

const router = express.Router();

// Create payment intent for one-time purchase
router.post(
  "/create-payment-intent",
  isAuthenticatedUser,
  [
    body("items").isArray({ min: 1 }).withMessage("Items are required"),
    body("currency")
      .optional()
      .isIn(["usd", "inr"])
      .withMessage("Invalid currency"),
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

      const { items, currency = "inr", shippingAddress } = req.body;

      // Calculate total amount
      let totalAmount = 0;
      const lineItems = [];

      for (const item of items) {
        const product = await Product.findById(item.productId);

        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product not found: ${item.productId}`,
          });
        }

        if (!product.isAvailable) {
          return res.status(400).json({
            success: false,
            message: `Product is not available: ${product.name}`,
          });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for product: ${product.name}`,
          });
        }

        const price = product.discountPrice || product.price;
        const itemTotal = price * item.quantity;
        totalAmount += itemTotal;

        lineItems.push({
          price_data: {
            currency: currency,
            product_data: {
              name: product.name,
              images: product.images.map((img) => img.url),
              description: product.description.substring(0, 100),
            },
            unit_amount: Math.round(price * 100), // Convert to cents/paise
          },
          quantity: item.quantity,
        });
      }

      // Add tax (18% GST for India)
      const taxAmount = Math.round(totalAmount * 0.18);

      // Add shipping (free for orders above ₹500)
      const shippingAmount = totalAmount >= 500 ? 0 : 50;

      // Calculate final amount
      const finalAmount = totalAmount + taxAmount + shippingAmount;

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(finalAmount * 100), // Convert to cents/paise
        currency: currency,
        metadata: {
          userId: req.user.id,
          type: "one-time-purchase",
          itemsCount: items.length.toString(),
        },
      });

      res.status(200).json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: finalAmount,
        breakdown: {
          itemsTotal: totalAmount,
          tax: taxAmount,
          shipping: shippingAmount,
          total: finalAmount,
        },
      });
    } catch (error) {
      console.error("Payment intent creation error:", error);
      res.status(500).json({
        success: false,
        message: "Payment intent creation failed",
        error: error.message,
      });
    }
  }
);

// Create subscription
router.post(
  "/create-subscription",
  isAuthenticatedUser,
  [
    body("productId").notEmpty().withMessage("Product ID is required"),
    body("planId").notEmpty().withMessage("Plan ID is required"),
    body("quantity")
      .isInt({ min: 1 })
      .withMessage("Quantity must be at least 1"),
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

      const { productId, planId, quantity = 1 } = req.body;

      // Validate product and plan
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      if (!product.isSubscriptionAvailable) {
        return res.status(400).json({
          success: false,
          message: "Product is not available for subscription",
        });
      }

      const plan = product.subscriptionPlans.id(planId);
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: "Subscription plan not found",
        });
      }

      // Create or retrieve Stripe customer
      let customer;
      try {
        const existingCustomers = await stripe.customers.list({
          email: req.user.email,
          limit: 1,
        });

        if (existingCustomers.data.length > 0) {
          customer = existingCustomers.data[0];
        } else {
          customer = await stripe.customers.create({
            email: req.user.email,
            name: req.user.name,
            metadata: {
              userId: req.user.id,
            },
          });
        }
      } catch (stripeError) {
        console.error("Stripe customer error:", stripeError);
        return res.status(500).json({
          success: false,
          message: "Failed to create customer",
          error: stripeError.message,
        });
      }

      // Create Stripe product if it doesn't exist
      let stripeProduct;
      try {
        const existingProducts = await stripe.products.list({
          limit: 100,
        });

        stripeProduct = existingProducts.data.find(
          (p) =>
            p.metadata.productId === productId && p.metadata.planId === planId
        );

        if (!stripeProduct) {
          stripeProduct = await stripe.products.create({
            name: `${product.name} - ${plan.name}`,
            description: product.description,
            images: product.images.map((img) => img.url),
            metadata: {
              productId: productId,
              planId: planId,
            },
          });
        }
      } catch (stripeError) {
        console.error("Stripe product error:", stripeError);
        return res.status(500).json({
          success: false,
          message: "Failed to create product",
          error: stripeError.message,
        });
      }

      // Create Stripe price
      let stripePrice;
      try {
        const existingPrices = await stripe.prices.list({
          product: stripeProduct.id,
          limit: 100,
        });

        stripePrice = existingPrices.data.find(
          (p) =>
            p.unit_amount === Math.round(plan.price * quantity * 100) &&
            p.recurring.interval === plan.interval &&
            p.recurring.interval_count === plan.intervalCount
        );

        if (!stripePrice) {
          stripePrice = await stripe.prices.create({
            product: stripeProduct.id,
            unit_amount: Math.round(plan.price * quantity * 100), // Convert to cents/paise
            currency: "inr",
            recurring: {
              interval: plan.interval,
              interval_count: plan.intervalCount,
            },
            metadata: {
              productId: productId,
              planId: planId,
              quantity: quantity.toString(),
            },
          });
        }
      } catch (stripeError) {
        console.error("Stripe price error:", stripeError);
        return res.status(500).json({
          success: false,
          message: "Failed to create price",
          error: stripeError.message,
        });
      }

      // Create subscription
      try {
        const subscription = await stripe.subscriptions.create({
          customer: customer.id,
          items: [
            {
              price: stripePrice.id,
            },
          ],
          payment_behavior: "default_incomplete",
          payment_settings: { save_default_payment_method: "on_subscription" },
          expand: ["latest_invoice.payment_intent"],
          metadata: {
            userId: req.user.id,
            productId: productId,
            planId: planId,
            quantity: quantity.toString(),
          },
        });

        res.status(200).json({
          success: true,
          subscriptionId: subscription.id,
          customerId: customer.id,
          clientSecret:
            subscription.latest_invoice.payment_intent.client_secret,
          subscription: {
            id: subscription.id,
            status: subscription.status,
            current_period_start: subscription.current_period_start,
            current_period_end: subscription.current_period_end,
          },
        });
      } catch (stripeError) {
        console.error("Stripe subscription error:", stripeError);
        return res.status(500).json({
          success: false,
          message: "Failed to create subscription",
          error: stripeError.message,
        });
      }
    } catch (error) {
      console.error("Subscription creation error:", error);
      res.status(500).json({
        success: false,
        message: "Subscription creation failed",
        error: error.message,
      });
    }
  }
);

// Cancel subscription
router.post(
  "/cancel-subscription",
  isAuthenticatedUser,
  [
    body("subscriptionId")
      .notEmpty()
      .withMessage("Subscription ID is required"),
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

      const { subscriptionId, cancelAtPeriodEnd = true } = req.body;

      // Cancel subscription in Stripe
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: cancelAtPeriodEnd,
      });

      res.status(200).json({
        success: true,
        message: "Subscription cancelled successfully",
        subscription: {
          id: subscription.id,
          status: subscription.status,
          cancel_at_period_end: subscription.cancel_at_period_end,
          canceled_at: subscription.canceled_at,
        },
      });
    } catch (error) {
      console.error("Subscription cancellation error:", error);
      res.status(500).json({
        success: false,
        message: "Subscription cancellation failed",
        error: error.message,
      });
    }
  }
);

// Get payment methods
router.get("/payment-methods", isAuthenticatedUser, async (req, res) => {
  try {
    // Find customer
    const customers = await stripe.customers.list({
      email: req.user.email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return res.status(200).json({
        success: true,
        paymentMethods: [],
      });
    }

    const customer = customers.data[0];

    // Get payment methods
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customer.id,
      type: "card",
    });

    res.status(200).json({
      success: true,
      paymentMethods: paymentMethods.data.map((pm) => ({
        id: pm.id,
        type: pm.type,
        card: {
          brand: pm.card.brand,
          last4: pm.card.last4,
          exp_month: pm.card.exp_month,
          exp_year: pm.card.exp_year,
        },
      })),
    });
  } catch (error) {
    console.error("Payment methods fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment methods",
      error: error.message,
    });
  }
});

// Stripe webhook handler
router.post("/webhook", async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log("Payment succeeded:", paymentIntent.id);

        // Update order status
        const order = await Order.findOne({
          "paymentInfo.id": paymentIntent.id,
        });

        if (order && order.orderStatus === "Processing") {
          order.orderStatus = "Placed";
          await order.save();
        }
        break;

      case "payment_intent.payment_failed":
        console.log("Payment failed:", event.data.object.id);
        break;

      case "invoice.payment_succeeded":
        console.log("Invoice payment succeeded:", event.data.object.id);
        // Handle subscription renewal
        break;

      case "invoice.payment_failed":
        console.log("Invoice payment failed:", event.data.object.id);
        // Handle failed subscription payment
        break;

      case "customer.subscription.created":
        console.log("Subscription created:", event.data.object.id);
        break;

      case "customer.subscription.updated":
        console.log("Subscription updated:", event.data.object.id);
        break;

      case "customer.subscription.deleted":
        console.log("Subscription deleted:", event.data.object.id);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    res.status(500).json({ error: "Webhook handler failed" });
  }
});

// Get Stripe publishable key
router.get("/config", (req, res) => {
  res.status(200).json({
    success: true,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  });
});

module.exports = router;
