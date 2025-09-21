const express = require("express");
const { isAuthenticatedUser } = require("../middleware/auth");
const Order = require("../models/Order");
const Subscription = require("../models/Subscription");

const router = express.Router();

// @route   GET /api/analytics/dashboard
// @desc    Get user analytics dashboard data
// @access  Private
router.get("/dashboard", isAuthenticatedUser, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("Fetching analytics for user:", userId);

    // Get all orders for the user
    const orders = await Order.find({ user: userId }).populate(
      "items.product",
      "name price category"
    );

    // Get all subscriptions for the user
    const subscriptions = await Subscription.find({ user: userId }).populate(
      "product",
      "name price category"
    );

    // Calculate total spending
    const totalOrderSpending = orders.reduce(
      (total, order) => total + order.totalPrice, // Changed from totalAmount to totalPrice
      0
    );
    const totalSubscriptionSpending = subscriptions.reduce((total, sub) => {
      // Calculate total spent on subscriptions (assuming monthly billing)
      const monthsActive = Math.ceil(
        (Date.now() - sub.createdAt) / (1000 * 60 * 60 * 24 * 30)
      );
      return total + sub.totalAmount * Math.max(1, monthsActive);
    }, 0);

    const totalSpending = totalOrderSpending + totalSubscriptionSpending;

    // Monthly spending analysis
    const monthlySpending = {};
    const currentYear = new Date().getFullYear();

    // Initialize months
    for (let i = 0; i < 12; i++) {
      const month = new Date(currentYear, i).toLocaleString("default", {
        month: "short",
      });
      monthlySpending[month] = 0;
    }

    // Calculate monthly spending from orders
    orders.forEach((order) => {
      const orderMonth = new Date(order.createdAt).toLocaleString("default", {
        month: "short",
      });
      const orderYear = new Date(order.createdAt).getFullYear();
      if (orderYear === currentYear) {
        monthlySpending[orderMonth] += order.totalAmount;
      }
    });

    // Calculate monthly spending from subscriptions
    subscriptions.forEach((sub) => {
      const subMonth = new Date(sub.createdAt).toLocaleString("default", {
        month: "short",
      });
      const subYear = new Date(sub.createdAt).getFullYear();
      if (subYear === currentYear) {
        monthlySpending[subMonth] += sub.totalAmount;
      }
    });

    // Category-wise spending
    const categorySpending = {};

    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        // Changed from items to orderItems
        const category = item.product?.category || "Other";
        const itemTotal = item.price * item.quantity;
        categorySpending[category] =
          (categorySpending[category] || 0) + itemTotal;
      });
    });

    subscriptions.forEach((sub) => {
      const category = sub.product?.category || "Other";
      const monthsActive = Math.ceil(
        (Date.now() - sub.createdAt) / (1000 * 60 * 60 * 24 * 30)
      );
      categorySpending[category] =
        (categorySpending[category] || 0) +
        sub.totalAmount * Math.max(1, monthsActive);
    });

    // Recent transactions
    const recentTransactions = orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map((order) => ({
        id: order._id,
        type: "Order",
        amount: order.totalPrice, // Changed from totalAmount to totalPrice
        date: order.createdAt,
        status: order.orderStatus, // Changed from status to orderStatus
        itemCount: order.orderItems.length, // Changed from items to orderItems
      }));

    // Add recent subscriptions
    const recentSubscriptions = subscriptions
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((sub) => ({
        id: sub._id,
        type: "Subscription",
        amount: sub.totalAmount,
        date: sub.createdAt,
        status: sub.status,
        product: sub.product?.name,
      }));

    const allTransactions = [...recentTransactions, ...recentSubscriptions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    // Calculate average order value
    const averageOrderValue =
      orders.length > 0 ? totalOrderSpending / orders.length : 0;

    // Calculate savings (if any discounts were applied)
    const totalSavings = orders.reduce((total, order) => {
      return total + (order.originalAmount - order.totalAmount || 0);
    }, 0);

    // Top spending categories
    const topCategories = Object.entries(categorySpending)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => ({ category, amount }));

    // Spending trends
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString("default", { month: "short" });
      const year = date.getFullYear();

      const monthSpending = orders
        .filter((order) => {
          const orderDate = new Date(order.createdAt);
          return (
            orderDate.getMonth() === date.getMonth() &&
            orderDate.getFullYear() === year
          );
        })
        .reduce((total, order) => total + order.totalAmount, 0);

      last6Months.push({
        month: `${month} ${year}`,
        spending: monthSpending,
      });
    }

    res.json({
      success: true,
      data: {
        overview: {
          totalSpending,
          totalOrders: orders.length,
          totalSubscriptions: subscriptions.length,
          averageOrderValue,
          totalSavings,
        },
        monthlySpending: Object.entries(monthlySpending).map(
          ([month, amount]) => ({
            month,
            amount,
          })
        ),
        categorySpending: topCategories,
        recentTransactions: allTransactions,
        spendingTrend: last6Months,
        ordersByStatus: {
          pending: orders.filter((o) => o.status === "pending").length,
          processing: orders.filter((o) => o.status === "processing").length,
          shipped: orders.filter((o) => o.status === "shipped").length,
          delivered: orders.filter((o) => o.status === "delivered").length,
          cancelled: orders.filter((o) => o.status === "cancelled").length,
        },
      },
    });
  } catch (error) {
    console.error("Analytics dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics data",
    });
  }
});

// @route   GET /api/analytics/spending-summary
// @desc    Get detailed spending summary
// @access  Private
router.get("/spending-summary", isAuthenticatedUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = "year" } = req.query; // year, month, week

    let dateFilter = {};
    const now = new Date();

    switch (period) {
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = { createdAt: { $gte: weekAgo } };
        break;
      case "month":
        const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = { createdAt: { $gte: monthAgo } };
        break;
      case "year":
      default:
        const yearAgo = new Date(now.getFullYear(), 0, 1);
        dateFilter = { createdAt: { $gte: yearAgo } };
        break;
    }

    const orders = await Order.find({
      user: userId,
      ...dateFilter,
    }).populate("items.product", "name price category images");

    const detailedSpending = orders.map((order) => ({
      orderId: order._id,
      date: order.createdAt,
      totalAmount: order.totalAmount,
      status: order.status,
      items: order.items.map((item) => ({
        productName: item.product?.name || "Unknown Product",
        category: item.product?.category || "Other",
        price: item.price,
        quantity: item.quantity,
        total: item.price * item.quantity,
        image: item.product?.images?.[0]?.url,
      })),
    }));

    res.json({
      success: true,
      data: {
        period,
        orders: detailedSpending,
        summary: {
          totalOrders: orders.length,
          totalSpent: orders.reduce((sum, order) => sum + order.totalAmount, 0),
          averageOrderValue:
            orders.length > 0
              ? orders.reduce((sum, order) => sum + order.totalAmount, 0) /
                orders.length
              : 0,
        },
      },
    });
  } catch (error) {
    console.error("Spending summary error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch spending summary",
    });
  }
});

// @route   GET /api/analytics/user-spending
// @desc    Get user spending analytics (for frontend compatibility)
// @access  Private
router.get("/user-spending", isAuthenticatedUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all orders for the user
    const orders = await Order.find({ user: userId }).populate(
      "items.product",
      "name price category"
    );

    // Calculate total spending
    const totalSpending = orders.reduce(
      (total, order) => total + order.totalAmount,
      0
    );
    const totalOrders = orders.length;

    // Monthly spending analysis
    const monthlySpending = {};
    const currentYear = new Date().getFullYear();

    // Initialize months
    for (let i = 0; i < 12; i++) {
      const month = new Date(currentYear, i).toLocaleString("default", {
        month: "short",
      });
      monthlySpending[month] = 0;
    }

    // Calculate monthly spending from orders
    orders.forEach((order) => {
      const orderMonth = new Date(order.createdAt).toLocaleString("default", {
        month: "short",
      });
      const orderYear = new Date(order.createdAt).getFullYear();
      if (orderYear === currentYear) {
        monthlySpending[orderMonth] += order.totalAmount;
      }
    });

    // Category-wise spending
    const spendingByCategory = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const category = item.product?.category || "Other";
        const itemTotal = item.price * item.quantity;
        spendingByCategory[category] =
          (spendingByCategory[category] || 0) + itemTotal;
      });
    });

    // Recent orders with product details
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map((order) => ({
        orderId: order._id.toString().slice(-8).toUpperCase(),
        date: order.createdAt,
        totalAmount: order.totalAmount,
        status: order.status,
        items:
          order.items.map((item) => item.product?.name).join(", ") ||
          `${order.items.length} items`,
      }));

    // Generate insights
    const insights = [];
    const avgOrderValue = totalOrders > 0 ? totalSpending / totalOrders : 0;

    if (avgOrderValue > 100) {
      insights.push(
        `Your average order value is $${avgOrderValue.toFixed(
          2
        )} - you prefer quality purchases!`
      );
    }

    const topCategory = Object.entries(spendingByCategory).sort(
      ([, a], [, b]) => b - a
    )[0];
    if (topCategory) {
      insights.push(
        `You spend most on ${
          topCategory[0]
        } category ($${topCategory[1].toFixed(2)})`
      );
    }

    const thisMonth = new Date().toLocaleString("default", { month: "short" });
    const thisMonthSpending = monthlySpending[thisMonth] || 0;
    if (thisMonthSpending > 0) {
      insights.push(`This month you've spent $${thisMonthSpending.toFixed(2)}`);
    }

    res.json({
      success: true,
      totalOrderSpending,
      totalSubscriptionSpending,
      monthlySpending,
      categorySpending,
      recentTransactions: allTransactions,
      averageOrderValue,
      totalSavings,
    });
  } catch (error) {
    console.error("User spending analytics error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message:
        "Failed to fetch analytics data: " + (error.message || "Unknown error"),
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

module.exports = router;
