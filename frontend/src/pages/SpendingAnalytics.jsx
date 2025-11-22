import { useEffect, useState } from "react";
import { Bar, Line, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip as MuiTooltip,
} from "@mui/material";
import {
  TrendingUp,
  ShoppingCart,
  AttachMoney,
  Receipt,
  Analytics,
  Refresh,
} from "@mui/icons-material";
import api from "../services/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const SpendingAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      console.log("Fetching analytics data...");
      const response = await api.get("/analytics/dashboard");
      console.log("Analytics response:", response.data);

      if (!response.data || response.data.success === false) {
        throw new Error(
          response.data?.message || "Failed to fetch analytics data"
        );
      }

      const analyticsData = response.data.data;
      if (!analyticsData || !analyticsData.monthlySpending || !analyticsData.categorySpending) {
        console.error("Invalid analytics data structure:", response.data);
        throw new Error("Invalid analytics data received");
      }

      setAnalytics(analyticsData);
      setError("");
    } catch (err) {
      console.error("Analytics error:", err);
      console.error("Full error object:", JSON.stringify(err, null, 2));
      setError(
        err.response?.data?.message || err.message || "Error fetching analytics"
      );
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!analytics) return null;

  // Chart configurations - extract monthly spending array
  const monthlySpendingArray = analytics?.monthlySpending || [];
  const monthlyLabels = monthlySpendingArray.map(item => item.month);
  const monthlyValues = monthlySpendingArray.map(item => item.amount);

  const monthlyData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: "Monthly Spending (₹)",
        data: monthlyValues,
        borderColor: "#1976d2",
        backgroundColor: "rgba(25, 118, 210, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Extract category spending array
  const categorySpendingArray = analytics?.categorySpending || [];
  const categoryLabels = categorySpendingArray.map(item => item.category);
  const categoryValues = categorySpendingArray.map(item => item.amount);

  const categoryData = {
    labels: categoryLabels,
    datasets: [
      {
        data: categoryValues,
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#FF6384",
          "#C9CBCF",
        ],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `₹${context.parsed.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return "₹" + value;
          },
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ₹${context.parsed.toFixed(
              2
            )} (${percentage}%)`;
          },
        },
      },
    },
  };

  const StatCard = ({ title, value, icon, color = "primary", subtitle }) => (
    <Card elevation={2} sx={{ height: "100%" }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={`${color}.main`}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            fontWeight="bold"
          >
            Spending Analytics
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Track your spending patterns and financial insights
          </Typography>
        </Box>
        <MuiTooltip title="Refresh Data">
          <IconButton onClick={fetchAnalytics} color="primary">
            <Refresh />
          </IconButton>
        </MuiTooltip>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Spending"
            value={`₹${
              (analytics.overview?.totalSpending || 0)?.toFixed(2) || "0.00"
            }`}
            icon={<AttachMoney />}
            color="primary"
            subtitle="All time"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={analytics.overview?.totalOrders || 0}
            icon={<ShoppingCart />}
            color="success"
            subtitle="Completed orders"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Average Order"
            value={`₹${(analytics.overview?.averageOrderValue || 0)?.toFixed(2) || "0.00"}`}
            icon={<Receipt />}
            color="warning"
            subtitle="Per order"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Savings"
            value={`₹${(analytics.overview?.totalSavings || 0)?.toFixed(2) || "0.00"}`}
            icon={<TrendingUp />}
            color="info"
            subtitle="From all orders"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} mb={4}>
        {/* Monthly Spending Trend */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={2} sx={{ p: 3, height: 400 }}>
            <Typography
              variant="h6"
              gutterBottom
              display="flex"
              alignItems="center"
            >
              <Analytics sx={{ mr: 1 }} />
              Monthly Spending Trend
            </Typography>
            <Box height={320}>
              <Line data={monthlyData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>

        {/* Category Breakdown */}
        <Grid item xs={12} lg={4}>
          <Paper elevation={2} sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Spending by Category
            </Typography>
            <Box height={320}>
              <Doughnut data={categoryData} options={pieOptions} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Orders Table */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography
          variant="h6"
          gutterBottom
          display="flex"
          alignItems="center"
        >
          <Receipt sx={{ mr: 1 }} />
          Recent Purchase Details
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {analytics.recentTransactions && analytics.recentTransactions.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Transaction ID</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Date</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Amount</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Type</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Status</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analytics.recentTransactions.map((transaction, index) => (
                  <TableRow key={transaction.id || index} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        #{transaction.id?.toString().slice(-8).toUpperCase() || `TXN-${index + 1}`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(transaction.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color="primary"
                      >
                        ₹{transaction.amount?.toFixed(2) || "0.00"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.type || "Order"}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.status || "Completed"}
                        color="success"
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box textAlign="center" py={4}>
            <Typography variant="body1" color="textSecondary">
              No recent transactions found
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default SpendingAnalytics;
