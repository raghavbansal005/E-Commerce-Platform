import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Alert,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import PaymentStep from "../components/payment/PaymentStep";
import { ordersAPI } from "../services/api";
import toast from "react-hot-toast";

const steps = ["Shipping Address", "Payment", "Review Order"];

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, totalAmount, clearCart } = useCart();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
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

  const calculateTax = () => {
    return Math.round(totalAmount * 0.18 * 100) / 100;
  };

  const calculateShipping = () => {
    return totalAmount >= 500 ? 0 : 50;
  };

  const calculateTotal = () => {
    return totalAmount + calculateTax() + calculateShipping();
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) =>
      Math.min(prevActiveStep + 1, steps.length - 1)
    );
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => Math.max(prevActiveStep - 1, 0));
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    setLoading(true);
    try {
      const orderData = {
        orderItems: items.map((item) => ({
          product: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        shippingAddress: {
          name: getValues("name"),
          phone: getValues("phone"),
          email: getValues("email"),
          street: getValues("street"),
          city: getValues("city"),
          state: getValues("state"),
          zipCode: getValues("zipCode"),
          country: getValues("country"),
        },
        paymentInfo: {
          id: paymentIntent.id,
          status: "succeeded",
          method: "stripe",
        },
        itemsPrice: totalAmount,
        taxPrice: calculateTax(),
        shippingPrice: calculateShipping(),
        totalPrice: calculateTotal(),
        notes: "Order placed via Stripe payment",
      };

      const response = await ordersAPI.createOrder(orderData);

      if (response.data.success) {
        clearCart();
        toast.success("Order placed successfully!");
        setActiveStep(steps.length); // Move to completion step
        navigate("/orders");
      }
    } catch (error) {
      console.error("Order creation failed:", error);
      toast.error("Failed to create order. Please contact support.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    // This is now handled by the payment step
    handleNext();
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Full Name"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  {...register("name", { required: "Name is required" })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Phone Number"
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                  {...register("phone", { required: "Phone is required" })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Email Address"
                  type="email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  {...register("email", { required: "Email is required" })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Street Address"
                  error={!!errors.street}
                  helperText={errors.street?.message}
                  {...register("street", {
                    required: "Street address is required",
                  })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="City"
                  error={!!errors.city}
                  helperText={errors.city?.message}
                  {...register("city", { required: "City is required" })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="State"
                  error={!!errors.state}
                  helperText={errors.state?.message}
                  {...register("state", { required: "State is required" })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="ZIP Code"
                  error={!!errors.zipCode}
                  helperText={errors.zipCode?.message}
                  {...register("zipCode", { required: "ZIP code is required" })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Country"
                  error={!!errors.country}
                  helperText={errors.country?.message}
                  {...register("country", { required: "Country is required" })}
                />
              </Grid>
            </Grid>
          </Box>
        );
      case 1:
        return (
          <PaymentStep
            totalAmount={calculateTotal()}
            onPaymentSuccess={handlePaymentSuccess}
            loading={loading}
            setLoading={setLoading}
          />
        );
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <List>
              {items.map((item) => (
                <ListItem key={item.id} sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar src={item.image} variant="rounded" />
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.name}
                    secondary={`Quantity: ${item.quantity} × ₹${item.price}`}
                  />
                  <Typography variant="body2">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </Typography>
                </ListItem>
              ))}
            </List>
            <Divider sx={{ my: 3 }} />

            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Price Details
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography>Subtotal</Typography>
                  <Typography>₹{totalAmount.toFixed(2)}</Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography>Tax (18% GST)</Typography>
                  <Typography>₹{calculateTax().toFixed(2)}</Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography>Shipping</Typography>
                  <Typography>
                    {calculateShipping() === 0
                      ? "FREE"
                      : `₹${calculateShipping().toFixed(2)}`}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="h6">Total</Typography>
                  <Typography variant="h6" color="primary.main">
                    ₹{calculateTotal().toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        );
      default:
        // Instead of unknown step, show completed message if steps are done
        return activeStep > steps.length - 1 ? (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <Typography variant="h5" gutterBottom color="success.main">
              Order Placed Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Thank you for your order. Your order has been placed and will be
              processed soon.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/orders")}
              sx={{ mt: 3 }}
            >
              View Orders
            </Button>
          </Box>
        ) : (
          "Error: Invalid step"
        );
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
        Checkout
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              {renderStepContent(activeStep)}

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
                {activeStep !== 0 && (
                  <Button onClick={handleBack} sx={{ mr: 1 }}>
                    Back
                  </Button>
                )}
                {activeStep === steps.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleSubmit(onSubmit)}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : "Place Order"}
                  </Button>
                ) : (
                  <Button variant="contained" onClick={handleNext}>
                    Next
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: "sticky", top: 100 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Order Summary
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography>Subtotal</Typography>
                  <Typography>₹{totalAmount.toFixed(2)}</Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography>Tax (GST 18%)</Typography>
                  <Typography>₹{calculateTax().toFixed(2)}</Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography>Shipping</Typography>
                  <Typography>
                    {calculateShipping() === 0
                      ? "FREE"
                      : `₹${calculateShipping()}`}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Total
                </Typography>
                <Typography
                  variant="h6"
                  color="primary.main"
                  sx={{ fontWeight: 600 }}
                >
                  ₹{calculateTotal().toFixed(2)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Checkout;
