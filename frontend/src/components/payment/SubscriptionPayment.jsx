import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Alert,
  Grid,
  Paper,
} from "@mui/material";
import toast from "react-hot-toast";
import { LockOutlined } from "@mui/icons-material";

const SubscriptionPayment = ({
  amount,
  planId,
  onSuccess,
  loading,
  setLoading,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setCardError("");

    try {
      // First create payment method
      const { error: paymentMethodError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: elements.getElement(CardElement),
        });

      if (paymentMethodError) {
        setCardError(paymentMethodError.message);
        return;
      }

      // Create subscription with payment method
      const { error: confirmationError, subscription } = await onSuccess(
        paymentMethod
      );

      if (confirmationError) {
        setCardError(confirmationError.message);
        return;
      }

      // Check subscription status and handle accordingly
      if (
        subscription.status === "active" ||
        subscription.status === "trialing"
      ) {
        toast.success("Subscription activated successfully!");
      } else if (subscription.status === "incomplete") {
        const { error: confirmError } = await stripe.confirmCardPayment(
          subscription.clientSecret
        );
        if (confirmError) {
          setCardError(confirmError.message);
          return;
        }
        toast.success("Subscription activated successfully!");
      }
    } catch (err) {
      console.error("Subscription error:", err);
      toast.error("Subscription failed. Please try again.");
      setCardError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%", mt: 2 }}>
      <Paper elevation={0} sx={{ p: 3, bgcolor: "grey.50", mb: 3 }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: "flex", alignItems: "center" }}
        >
          <LockOutlined sx={{ mr: 1, color: "success.main" }} />
          Secure Payment
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: cardError ? "error.main" : "grey.300",
                borderRadius: 1,
                bgcolor: "white",
              }}
            >
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: "16px",
                      color: "#424770",
                      "::placeholder": {
                        color: "#aab7c4",
                      },
                    },
                    invalid: {
                      color: "#9e2146",
                    },
                  },
                }}
              />
            </Box>
            {cardError && (
              <Typography
                color="error"
                variant="caption"
                sx={{ mt: 1, display: "block" }}
              >
                {cardError}
              </Typography>
            )}
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2 }}>
          <Alert
            severity="info"
            sx={{ "& .MuiAlert-message": { width: "100%" } }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="body2">Total amount:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                ₹{amount.toFixed(2)}
              </Typography>
            </Box>
          </Alert>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading || !stripe}
            startIcon={loading && <CircularProgress size={20} />}
            sx={{ py: 1.5 }}
          >
            {loading ? "Processing..." : "Subscribe Now"}
          </Button>
        </Box>

        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Typography variant="caption" color="text.secondary">
            This is a secure, encrypted payment
          </Typography>
        </Box>
      </Paper>

      {/* Test Card Info */}
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          <strong>Test Card Details:</strong>
          <br />
          Number: 4242 4242 4242 4242
          <br />
          Expiry: Any future date
          <br />
          CVC: Any 3 digits
        </Typography>
      </Alert>
    </Box>
  );
};

export default SubscriptionPayment;
