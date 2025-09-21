import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Email,
  Lock,
  Person,
  Sms,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { authAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

const RegisterOTP = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [countdown, setCountdown] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm();

  const steps = ["Enter Details", "Verify OTP", "Set Password"];
  const password = watch("password");

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

  // Step 1: Send OTP
  const handleSendOTP = async (data) => {
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.sendOTP({
        name: data.name,
        email: data.email,
      });

      if (response.data.success) {
        setUserEmail(data.email);
        setUserName(data.name);
        setOtpSent(true);
        setActiveStep(1);
        startCountdown();
        toast.success("OTP sent to your email!");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to send OTP";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP only
  const handleVerifyOTP = async (data) => {
    setError("");
    setLoading(true);

    try {
      const response = await authAPI.verifyOTPOnly({
        email: userEmail,
        otp: data.otp,
      });

      if (response.data.success) {
        setOtpVerified(true);
        setActiveStep(2);
        toast.success("OTP verified successfully!");
        reset({ otp: "" }); // Clear OTP field
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to verify OTP";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set Password and Complete Registration
  const handleSetPassword = async (data) => {
    setError("");
    setLoading(true);

    try {
      // Since OTP is already verified, we need to create the user account
      // We'll use the register endpoint with the verified email and password
      const response = await authAPI.register({
        name: userName,
        email: userEmail,
        password: data.password,
        isOTPVerified: true, // Flag to indicate OTP was already verified
      });

      if (response.data.success) {
        // Auto login after successful registration
        try {
          const loginResult = await login(userEmail, data.password);
          if (loginResult.success) {
            toast.success("Registration completed successfully!");
            navigate("/");
          } else {
            // If auto-login fails, redirect to login page
            toast.success("Registration completed! Please login with your credentials.");
            navigate("/login");
          }
        } catch (loginError) {
          // If auto-login fails, redirect to login page
          toast.success("Registration completed! Please login with your credentials.");
          navigate("/login");
        }
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to complete registration";
      // Don't show OTP-related errors after OTP is verified
      if (message.toLowerCase().includes('otp')) {
        setError("Registration failed. Please try again.");
        toast.error("Registration failed. Please try again.");
      } else {
        setError(message);
        toast.error(message);
      }
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
      const response = await authAPI.sendOTP({
        name: userName,
        email: userEmail,
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
            onSubmit={handleSubmit(handleSendOTP)}
            sx={{ width: "100%" }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              autoComplete="name"
              autoFocus
              error={!!errors.name}
              helperText={errors.name?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
              {...register("name", {
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
              })}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              autoComplete="email"
              error={!!errors.email}
              helperText={errors.email?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                  message: "Please enter a valid email address",
                },
              })}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <Sms />}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </Button>
          </Box>
        );

      case 1:
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
              We've sent a 6-digit OTP to <strong>{userEmail}</strong>
            </Typography>

            <TextField
              margin="normal"
              required
              fullWidth
              id="otp"
              label="Enter OTP"
              placeholder="123456"
              autoFocus
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

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Button
                variant="text"
                size="small"
                onClick={() => {
                  setActiveStep(0);
                  setOtpSent(false);
                  setError("");
                  reset();
                }}
                sx={{ textTransform: "none" }}
              >
                Change Email
              </Button>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box
            component="form"
            onSubmit={handleSubmit(handleSetPassword)}
            sx={{ width: "100%" }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3, textAlign: "center" }}
            >
              Great! Your email is verified. Now create a secure password for
              your account.
            </Typography>

            <TextField
              margin="normal"
              required
              fullWidth
              label="Create Password"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="new-password"
              autoFocus
              error={!!errors.password}
              helperText={errors.password?.message}
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
              {...register("password", {
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
              label="Confirm Password"
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
              {loading ? "Creating Account..." : "Complete Registration"}
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
          Create Account
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, textAlign: "center" }}
        >
          {activeStep === 0 && "Enter your details to get started"}
          {activeStep === 1 && "Verify your email with OTP"}
          {activeStep === 2 && "Set up your secure password"}
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
          <Typography variant="body2" color="text.secondary">
            Already have an account?{" "}
            <Link
              to="/login"
              style={{
                color: "#1976d2",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Sign in here
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default RegisterOTP;
