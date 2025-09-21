import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Lock,
  Sms,
  ArrowBack,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import api from "../../services/api";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [countdown, setCountdown] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm();

  const steps = ["Verify OTP", "Set New Password"];
  const password = watch("newPassword");

  // Redirect if no email provided
  if (!email) {
    navigate("/forgot-password");
    return null;
  }

  // Start countdown timer
  const startCountdown = () => {
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1: Verify OTP
  const handleVerifyOTP = async (data) => {
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/password-reset/verify-otp", {
        email,
        otp: data.otp,
      });

      if (response.data.success) {
        setResetToken(response.data.resetToken);
        setActiveStep(1);
        // Reset form to clear OTP field when moving to password step
        reset({
          otp: "",
          newPassword: "",
          confirmPassword: "",
        });
        toast.success("OTP verified successfully!");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to verify OTP";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async (data) => {
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/password-reset/reset-password", {
        resetToken,
        newPassword: data.newPassword,
      });

      if (response.data.success) {
        toast.success("Password reset successfully!");
        navigate("/login", {
          state: {
            message:
              "Password reset successfully. Please login with your new password.",
          },
        });
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to reset password";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/password-reset/forgot-password", {
        email,
      });

      if (response.data.success) {
        startCountdown();
        toast.success("OTP resent to your email!");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to resend OTP";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box
            component="form"
            onSubmit={handleSubmit(handleVerifyOTP)}
            sx={{ width: "100%" }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3, textAlign: "center" }}
            >
              We've sent a 6-digit OTP to <strong>{email}</strong>
            </Typography>

            <TextField
              margin="normal"
              required
              fullWidth
              id="otp"
              label="Enter OTP"
              placeholder="123456"
              error={!!errors.otp}
              helperText={errors.otp?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Sms color="action" />
                  </InputAdornment>
                ),
              }}
              {...register("otp", {
                required: "OTP is required",
                pattern: {
                  value: /^\d{6}$/,
                  message: "OTP must be 6 digits",
                },
              })}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Didn't receive OTP?{" "}
                <Button
                  variant="text"
                  size="small"
                  onClick={handleResendOTP}
                  disabled={countdown > 0 || loading}
                  sx={{ textTransform: "none" }}
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                </Button>
              </Typography>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box
            component="form"
            onSubmit={handleSubmit(handleResetPassword)}
            sx={{ width: "100%" }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3, textAlign: "center" }}
            >
              Create a new password for your account
            </Typography>

            <TextField
              margin="normal"
              required
              fullWidth
              label="New Password"
              type={showPassword ? "text" : "password"}
              id="newPassword"
              autoComplete="new-password"
              error={!!errors.newPassword}
              helperText={errors.newPassword?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              {...register("newPassword", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              label="Confirm New Password"
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              autoComplete="new-password"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ py: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h4" sx={{ mb: 3, fontWeight: 600 }}>
          Reset Password
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, textAlign: "center" }}
        >
          {activeStep === 0
            ? "Verify your identity with OTP"
            : "Create your new password"}
        </Typography>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ width: "100%", mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ width: "100%", mb: 3 }}>
            {error}
          </Alert>
        )}

        {renderStepContent()}

        <Divider sx={{ my: 3, width: "100%" }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Divider>

        <Box sx={{ textAlign: "center" }}>
          <Button
            component={Link}
            to="/login"
            variant="text"
            startIcon={<ArrowBack />}
            sx={{ textTransform: "none" }}
          >
            Back to Login
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ResetPassword;
