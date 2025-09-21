import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
} from "@mui/material";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import {
  CreditCard as CreditCardIcon,
  Security as SecurityIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import { paymentsAPI } from "../../services/api";
import { useCart } from "../../contexts/CartContext";
import toast from "react-hot-toast";

const TEST_CARDS = {
  visa: "4242 4242 4242 4242",
  visaDebit: "4000 0566 5566 5556",
  mastercard: "5555 5555 5555 4444",
};

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#424770",
      "::placeholder": {
        color: "#aab7c4",
      },
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
    },
    invalid: {
      color: "#9e2146",
    },
  },
  hidePostalCode: false,
};

const PaymentStep = ({
  totalAmount,
  onPaymentSuccess,
  loading,
  setLoading,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { items: cartItems } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [clientSecret, setClientSecret] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  useEffect(() => {
    // Create payment intent when component mounts
    createPaymentIntent();
  }, [totalAmount, cartItems]);

  const createPaymentIntent = async () => {
    try {
      setLoading(true);

      if (!cartItems || cartItems.length === 0) {
        setPaymentError("No items in cart");
        return;
      }

      const response = await paymentsAPI.createPaymentIntent({
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        currency: "inr",
      });

      if (response.data.success) {
        setClientSecret(response.data.clientSecret);
      }
    } catch (error) {
      console.error("Payment intent creation failed:", error);
      setPaymentError("Failed to initialize payment. Please try again.");
      toast.error("Failed to initialize payment");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setPaymentProcessing(true);
    setPaymentError("");

    const cardElement = elements.getElement(CardElement);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: "Customer Name", // This should come from form data
            },
          },
        }
      );

      if (error) {
        setPaymentError(error.message);
        toast.error(error.message);
      } else if (paymentIntent.status === "succeeded") {
        toast.success("Payment successful!");
        onPaymentSuccess(paymentIntent);
      }
    } catch (error) {
      setPaymentError("Payment failed. Please try again.");
      toast.error("Payment failed");
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ display: "flex", alignItems: "center", mb: 3 }}
      >
        <CreditCardIcon sx={{ mr: 1 }} />
        Payment Method
      </Typography>

      {paymentError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {paymentError}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <FormControl component="fieldset" sx={{ width: "100%" }}>
            <FormLabel component="legend" sx={{ mb: 2 }}>
              Choose Payment Method
            </FormLabel>
            <RadioGroup
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <FormControlLabel
                value="card"
                control={<Radio />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <CreditCardIcon sx={{ mr: 1 }} />
                    Credit/Debit Card
                  </Box>
                }
              />
            </RadioGroup>
          </FormControl>

          {paymentMethod === "card" && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter your card details below
              </Typography>

              <Box
                sx={{
                  p: 2,
                  border: "1px solid #e0e0e0",
                  borderRadius: 1,
                  backgroundColor: "#fafafa",
                  "&:focus-within": {
                    borderColor: "primary.main",
                    backgroundColor: "white",
                  },
                }}
              >
                <CardElement options={CARD_ELEMENT_OPTIONS} />
              </Box>

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mt: 2,
                  color: "text.secondary",
                }}
              >
                <SecurityIcon sx={{ mr: 1, fontSize: 16 }} />
                <Typography variant="caption">
                  Your payment information is secure and encrypted
                </Typography>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Payment Summary
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography>Total Amount:</Typography>
            <Typography
              variant="h6"
              color="primary.main"
              sx={{ fontWeight: 600 }}
            >
              ₹{totalAmount.toFixed(2)}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              color: "success.main",
            }}
          >
            <CheckIcon sx={{ mr: 1, fontSize: 16 }} />
            <Typography variant="caption">
              SSL Encrypted • Secure Payment
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Button
        variant="contained"
        size="large"
        fullWidth
        onClick={handleSubmit}
        disabled={!stripe || paymentProcessing || loading}
        sx={{ py: 1.5 }}
      >
        {paymentProcessing ? (
          <>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            Processing Payment...
          </>
        ) : (
          `Pay ₹${totalAmount.toFixed(2)}`
        )}
      </Button>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", textAlign: "center", mt: 2 }}
      >
        By clicking "Pay", you agree to our terms and conditions
      </Typography>

      {/* Test Card Information */}
      <Card sx={{ mt: 3, bgcolor: "info.soft" }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Test Card Details
          </Typography>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" gutterBottom>
              <strong>Visa:</strong> {TEST_CARDS.visa}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Visa Debit:</strong> {TEST_CARDS.visaDebit}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Mastercard:</strong> {TEST_CARDS.mastercard}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Expiry:</strong> Any future date
              <br />
              <strong>CVC:</strong> Any 3 digits
              <br />
              <strong>ZIP/Postal Code:</strong> Any 5 digits
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PaymentStep;
