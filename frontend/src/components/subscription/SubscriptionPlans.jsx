import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  Subscriptions as SubscriptionIcon,
  CheckCircle as CheckIcon,
  LocalShipping as ShippingIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "react-query";
import { paymentsAPI, subscriptionsAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

const SubscriptionPlans = ({ product }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [subscriptionDialog, setSubscriptionDialog] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      street: user?.address?.street || "",
      city: user?.address?.city || "",
      state: user?.address?.state || "",
      zipCode: user?.address?.zipCode || "",
      country: user?.address?.country || "India",
    },
  });

  const createSubscriptionMutation = useMutation(
    paymentsAPI.createSubscription,
    {
      onSuccess: (response) => {
        if (response.data.success) {
          // Handle successful subscription creation
          handleSubscriptionSuccess(response.data);
        }
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message || "Failed to create subscription"
        );
      },
    }
  );

  const handleSubscriptionSuccess = async (subscriptionData) => {
    try {
      // Create subscription record in our database
      const subscriptionRecord = {
        productId: product._id,
        planId: selectedPlan._id,
        quantity,
        stripeSubscriptionId: subscriptionData.subscriptionId,
        stripeCustomerId: subscriptionData.customerId,
        shippingAddress: {
          name: user?.name || "",
          email: user?.email || "",
          phone: user?.phone || "",
          street: user?.address?.street || "",
          city: user?.address?.city || "",
          state: user?.address?.state || "",
          zipCode: user?.address?.zipCode || "",
          country: user?.address?.country || "India",
        },
      };

      const response = await subscriptionsAPI.createSubscription(
        subscriptionRecord
      );

      if (response.data.success) {
        toast.success("Subscription created successfully!");
        queryClient.invalidateQueries("subscriptions");
        setSubscriptionDialog(false);
        reset();
      }
    } catch (error) {
      toast.error("Failed to create subscription record");
    }
  };

  const handleSubscribe = (plan) => {
    if (!user) {
      toast.error("Please login to subscribe");
      return;
    }
    setSelectedPlan(plan);
    setSubscriptionDialog(true);
  };

  const onSubmit = async (data) => {
    if (!selectedPlan) return;

    const paymentData = {
      productId: product._id,
      planId: selectedPlan._id,
      quantity,
      shippingAddress: {
        ...data,
        country: data.country || "India",
      },
    };

    setLoading(true);
    try {
      const response = await paymentsAPI.createSubscription(paymentData);
      if (response.data.success) {
        await handleSubscriptionSuccess(response.data);
        setSubscriptionDialog(false);
        reset();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create subscription"
      );
    } finally {
      setLoading(false);
    }
  };

  const getPlanDiscount = (plan) => {
    const monthlyPrice =
      product.subscriptionPlans.find((p) => p.interval === "monthly")?.price ||
      plan.price;
    if (plan.interval === "monthly") return 0;

    const totalMonthlyPrice =
      monthlyPrice *
      (plan.interval === "yearly" ? 12 : plan.interval === "quarterly" ? 3 : 1);
    const discount =
      ((totalMonthlyPrice - plan.price) / totalMonthlyPrice) * 100;
    return Math.round(discount);
  };

  const getIntervalLabel = (interval, intervalCount = 1) => {
    const labels = {
      weekly: intervalCount === 1 ? "Weekly" : `Every ${intervalCount} weeks`,
      monthly:
        intervalCount === 1 ? "Monthly" : `Every ${intervalCount} months`,
      quarterly: "Quarterly",
      yearly: "Yearly",
    };
    return labels[interval] || interval;
  };

  if (!product.isSubscriptionAvailable || !product.subscriptionPlans?.length) {
    return null;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <SubscriptionIcon sx={{ mr: 1, color: "primary.main" }} />
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Subscription Plans
        </Typography>
      </Box>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Save money and never run out! Choose a subscription plan and get regular
        deliveries.
      </Typography>

      <Grid container spacing={3}>
        {product.subscriptionPlans.map((plan) => {
          const discount = getPlanDiscount(plan);
          const isPopular = plan.interval === "monthly";

          return (
            <Grid item xs={12} sm={6} md={4} key={plan._id}>
              <Card
                sx={{
                  height: "100%",
                  position: "relative",
                  border: isPopular ? 2 : 1,
                  borderColor: isPopular ? "primary.main" : "divider",
                  "&:hover": {
                    boxShadow: 4,
                    transform: "translateY(-2px)",
                    transition: "all 0.2s",
                  },
                }}
              >
                {isPopular && (
                  <Chip
                    label="Most Popular"
                    color="primary"
                    size="small"
                    sx={{
                      position: "absolute",
                      top: -10,
                      left: "50%",
                      transform: "translateX(-50%)",
                      zIndex: 1,
                    }}
                  />
                )}

                <CardContent sx={{ p: 3, textAlign: "center" }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {plan.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {getIntervalLabel(plan.interval, plan.intervalCount)}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="h4"
                      color="primary.main"
                      sx={{ fontWeight: 700 }}
                    >
                      ₹{plan.price}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      per {plan.interval}
                    </Typography>
                  </Box>

                  {discount > 0 && (
                    <Chip
                      label={`Save ${discount}%`}
                      color="success"
                      size="small"
                      sx={{ mb: 2 }}
                    />
                  )}

                  <Box sx={{ mb: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 1,
                      }}
                    >
                      <CheckIcon
                        sx={{ fontSize: 16, color: "success.main", mr: 1 }}
                      />
                      <Typography variant="body2">
                        Regular deliveries
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 1,
                      }}
                    >
                      <ShippingIcon
                        sx={{ fontSize: 16, color: "success.main", mr: 1 }}
                      />
                      <Typography variant="body2">Free shipping</Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 1,
                      }}
                    >
                      <ScheduleIcon
                        sx={{ fontSize: 16, color: "success.main", mr: 1 }}
                      />
                      <Typography variant="body2">
                        Flexible scheduling
                      </Typography>
                    </Box>
                  </Box>

                  <Button
                    variant={isPopular ? "contained" : "outlined"}
                    fullWidth
                    size="large"
                    onClick={() => handleSubscribe(plan)}
                    sx={{ py: 1.5 }}
                  >
                    Subscribe Now
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Subscription Dialog */}
      <Dialog
        open={subscriptionDialog}
        onClose={() => setSubscriptionDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <SubscriptionIcon sx={{ mr: 1 }} />
            Subscribe to {product.name}
          </Box>
        </DialogTitle>

        <DialogContent>
          {selectedPlan && (
            <Box sx={{ mb: 3 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                You're subscribing to the <strong>{selectedPlan.name}</strong>{" "}
                plan (₹{selectedPlan.price} per {selectedPlan.interval})
              </Alert>

              <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <Typography variant="h6" gutterBottom>
                  Shipping Information
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Quantity</InputLabel>
                      <Select
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        label="Quantity"
                      >
                        {[1, 2, 3, 4, 5].map((num) => (
                          <MenuItem key={num} value={num}>
                            {num}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      {...register("name", { required: "Name is required" })}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      {...register("email", { required: "Email is required" })}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                      {...register("phone", { required: "Phone is required" })}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Street Address"
                      error={!!errors.street}
                      helperText={errors.street?.message}
                      {...register("street", {
                        required: "Street address is required",
                      })}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="City"
                      error={!!errors.city}
                      helperText={errors.city?.message}
                      {...register("city", { required: "City is required" })}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="State"
                      error={!!errors.state}
                      helperText={errors.state?.message}
                      {...register("state", { required: "State is required" })}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="ZIP Code"
                      error={!!errors.zipCode}
                      helperText={errors.zipCode?.message}
                      {...register("zipCode", {
                        required: "ZIP code is required",
                      })}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography variant="h6">
                    Total: ₹{(selectedPlan.price * quantity).toFixed(2)} per{" "}
                    {selectedPlan.interval}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setSubscriptionDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit(onSubmit)}
            disabled={createSubscriptionMutation.isLoading}
            startIcon={
              createSubscriptionMutation.isLoading ? (
                <CircularProgress size={20} />
              ) : null
            }
          >
            {createSubscriptionMutation.isLoading
              ? "Creating..."
              : "Create Subscription"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubscriptionPlans;
