import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Button,
  Typography,
  Box,
  Alert,
  Divider,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import {
  Security,
  VerifiedUser,
  Speed,
  ArrowForward,
} from "@mui/icons-material";

const Register = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/register-otp");
  };

  const features = [
    {
      icon: <Security color="primary" sx={{ fontSize: 40 }} />,
      title: "Secure Registration",
      description:
        "OTP verification ensures your account security from the start",
    },
    {
      icon: <VerifiedUser color="primary" sx={{ fontSize: 40 }} />,
      title: "Email Verification",
      description: "Verify your email address before setting up your password",
    },
    {
      icon: <Speed color="primary" sx={{ fontSize: 40 }} />,
      title: "Quick Setup",
      description: "Simple 2-step process to get you started quickly",
    },
  ];

  return (
    <Container component="main" maxWidth="md" sx={{ py: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography
          component="h1"
          variant="h3"
          sx={{ mb: 2, fontWeight: 700, textAlign: "center" }}
        >
          Join Subscribify
        </Typography>

        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ mb: 4, textAlign: "center", maxWidth: "600px" }}
        >
          Experience secure registration with OTP verification. We'll verify
          your email first, then you can set up your password.
        </Typography>

        <Alert severity="info" sx={{ width: "100%", mb: 4 }}>
          <Typography variant="body2">
            <strong>New Secure Registration Process:</strong> We now use OTP
            verification to ensure your account security. You'll receive a
            verification code via email before setting up your password.
          </Typography>
        </Alert>

        {/* Features Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                elevation={1}
                sx={{ height: "100%", textAlign: "center", p: 2 }}
              >
                <CardContent>
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" gutterBottom fontWeight="600">
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Call to Action */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleGetStarted}
            endIcon={<ArrowForward />}
            sx={{
              py: 1.5,
              px: 4,
              fontSize: "1.1rem",
              fontWeight: 600,
              borderRadius: 2,
            }}
          >
            Start Registration with OTP
          </Button>
        </Box>

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

export default Register;
