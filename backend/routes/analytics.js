const express = require("express");
const { isAuthenticatedUser } = require("../middleware/auth");
const Order = require("../models/Order");
const Subscription = require("../models/Subscription");

const router = express.Router();

// Helpers
const monthKey = (d) =>
  new Date(d).toLocaleString("default", { month: "short" });

// @route   GET /api/analytics/dashboard
// @desc    Get user analytics dashboard data
// @access  Private
router.get("/dashboard", isAuthenticatedUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all orders for the user
    const orders = await Order.find({ user: userId })
      .populate("orderItems.product", "name price category")
      .lean();

    // Get all subscriptions for the user
    const subscriptions = await Subscription.find({ user: userId })
      .populate("product", "name price category")
      .lean();

    // Totals
    const totalOrderSpending = orders.reduce(
      (total, order) => total + (order.totalPrice || 0),
      0
    );

    const totalSubscriptionSpending = subscriptions.reduce((total, sub) => {
      // If you want a cumulative approximation, use recorded totalAmount when available
      return total + (sub.totalAmount || 0);
    }, 0);

    const totalSpending = totalOrderSpending + totalSubscriptionSpending;

    // Monthly spending for current year
    const monthlySpending = {};
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 12; i++) {
      const month = new Date(currentYear, i).toLocaleString("default", {
        month: "short",
      });
      monthlySpending[month] = 0;
    }

    orders.forEach((order) => {
      const dt = new Date(order.createdAt);
      if (dt.getFullYear() === currentYear) {
        monthlySpending[monthKey(dt)] += order.totalPrice || 0;
      }
    });

    subscriptions.forEach((sub) => {
      const dt = new Date(sub.createdAt);
      if (dt.getFullYear() === currentYear) {
        monthlySpending[monthKey(dt)] += sub.totalAmount || 0;
      }
    });

    // Category-wise spending
    const categorySpendingMap = {};
    orders.forEach((order) => {
      (order.orderItems || []).forEach((item) => {
        const category = item.product?.category || "Other";
        const itemTotal = (item.price || 0) * (item.quantity || 0);
        categorySpendingMap[category] =
          (categorySpendingMap[category] || 0) + itemTotal;
      });
    });

    subscriptions.forEach((sub) => {
      const category = sub.product?.category || "Other";
      categorySpendingMap[category] =
        (categorySpendingMap[category] || 0) + (sub.totalAmount || 0);
    });

    // Top categories
    const topCategories = Object.entries(categorySpendingMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, amount]) => ({ category, amount }));

    // Recent transactions (orders + subscriptions)
    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map((order) => ({
        id: order._id,
        type: "Order",
        amount: order.totalPrice || 0,
        date: order.createdAt,
        status: order.orderStatus,
        itemCount: (order.orderItems || []).length,
      }));

    const recentSubs = [...subscriptions]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((sub) => ({
        id: sub._id,
        type: "Subscription",
        amount: sub.totalAmount || 0,
        date: sub.createdAt,
        status: sub.status,
        product: sub.product?.name,
      }));

    const allTransactions = [...recentOrders, ...recentSubs]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    // Average order value
    const averageOrderValue = orders.length
      ? totalOrderSpending / orders.length
      : 0;

    // Savings (unknown without original price snapshot) -> 0
    const totalSavings = 0;

    // Spending trend (last 6 months)
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString("default", { month: "short" });
      const year = date.getFullYear();

      const monthSpending = orders
        .filter((o) => {
          const d = new Date(o.createdAt);
          return d.getMonth() === date.getMonth() && d.getFullYear() === year;
        })
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

      last6Months.push({
        month: `${month} ${year}`,
        spending: monthSpending,
      });
    }

    const statusCount = {
      Processing: orders.filter((o) => o.orderStatus === "Processing").length,
      Placed: orders.filter((o) => o.orderStatus === "Placed").length,
      Shipped: orders.filter((o) => o.orderStatus === "Shipped").length,
      Delivered: orders.filter((o) => o.orderStatus === "Delivered").length,
      Cancelled: orders.filter((o) => o.orderStatus === "Cancelled").length,
    };

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
          ([month, amount]) => ({ month, amount })
        ),
        categorySpending: topCategories,
        recentTransactions: allTransactions,
        spendingTrend: last6Months,
        ordersByStatus: statusCount,
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
      case "week": {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = { createdAt: { $gte: weekAgo } };
        break;
      }
      case "month": {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = { createdAt: { $gte: monthStart } };
        break;
      }
      case "year":
      default: {
        const yearStart = new Date(now.getFullYear(), 0, 1);
        dateFilter = { createdAt: { $gte: yearStart } };
        break;
      }
    }

    const orders = await Order.find({ user: userId, ...dateFilter })
      .populate("orderItems.product", "name price category images")
      .lean();

    const detailedSpending = orders.map((order) => ({
      orderId: order._id,
      date: order.createdAt,
      totalAmount: order.totalPrice || 0,
      status: order.orderStatus,
      items: (order.orderItems || []).map((item) => ({
        productName: item.product?.name || item.name || "Unknown Product",
        category: item.product?.category || "Other",
        price: item.price,
        quantity: item.quantity,
        total: (item.price || 0) * (item.quantity || 0),
        image: item.product?.images?.[0]?.url,
      })),
    }));

    const totalSpent = orders.reduce(
      (sum, order) => sum + (order.totalPrice || 0),
      0
    );

    res.json({
      success: true,
      data: {
        period,
        orders: detailedSpending,
        summary: {
          totalOrders: orders.length,
          totalSpent,
          averageOrderValue: orders.length ? totalSpent / orders.length : 0,
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

    const orders = await Order.find({ user: userId })
      .populate("orderItems.product", "name price category")
      .lean();

    // Calculate total spending and monthly breakdown
    const totalSpending = orders.reduce(
      (total, order) => total + (order.totalPrice || 0),
      0
    );
    const totalOrders = orders.length;

    const monthlySpending = {};
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 12; i++) {
      const month = new Date(currentYear, i).toLocaleString("default", {
        month: "short",
      });
      monthlySpending[month] = 0;
    }
    orders.forEach((order) => {
      const dt = new Date(order.createdAt);
      if (dt.getFullYear() === currentYear) {
        monthlySpending[monthKey(dt)] += order.totalPrice || 0;
      }
    });

    // Category-wise spending
    const spendingByCategory = {};
    orders.forEach((order) => {
      (order.orderItems || []).forEach((item) => {
        const category = item.product?.category || "Other";
        const itemTotal = (item.price || 0) * (item.quantity || 0);
        spendingByCategory[category] =
          (spendingByCategory[category] || 0) + itemTotal;
      });
    });

    // Recent orders
    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map((order) => ({
        orderId: order._id.toString().slice(-8).toUpperCase(),
        date: order.createdAt,
        totalAmount: order.totalPrice || 0,
        status: order.orderStatus,
        items:
          (order.orderItems || [])
            .map((item) => item.product?.name || item.name)
            .join(", ") || `${(order.orderItems || []).length} items`,
      }));

    const avgOrderValue = totalOrders > 0 ? totalSpending / totalOrders : 0;

    const insights = [];
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
        `You spend most on ${topCategory[0]} category ($${topCategory[1].toFixed(
          2
        )})`
      );
    }
    const thisMonth = new Date().toLocaleString("default", { month: "short" });
    const thisMonthSpending = monthlySpending[thisMonth] || 0;
    if (thisMonthSpending > 0) {
      insights.push(`This month you've spent $${thisMonthSpending.toFixed(2)}`);
    }

    res.json({
      success: true,
      data: {
        totals: { totalSpending, totalOrders, avgOrderValue },
        monthlySpending,
        spendingByCategory,
        recentOrders,
        insights,
      },
    });
  } catch (error) {
    console.error("User spending analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics data",
    });
  }
});

module.exports = router;
