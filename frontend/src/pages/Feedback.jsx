import { useState } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Rating,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  Email,
  Person,
  Phone,
  Subject,
  Message,
  Send,
  Feedback as FeedbackIcon,
  Star,
  CheckCircle,
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { feedbackAPI } from "../services/api";
import toast from "react-hot-toast";

const Feedback = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setError("");
    setLoading(true);

    try {
      const response = await feedbackAPI.submitFeedback(data);

      if (response.data.success) {
        setSubmitted(true);
        toast.success("Thank you for your feedback!");
        reset();
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to submit feedback";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Container component="main" maxWidth="md" sx={{ py: 8 }}>
        <Paper
          elevation={3}
          sx={{
            p: 6,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <CheckCircle sx={{ fontSize: 80, color: "success.main", mb: 3 }} />
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontWeight: 600, color: "success.main" }}
          >
            Thank You!
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Your feedback has been submitted successfully
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: "500px" }}
          >
            We appreciate you taking the time to share your thoughts with us.
            Our team will review your feedback and get back to you if needed.
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Button
              variant="contained"
              onClick={() => setSubmitted(false)}
              startIcon={<FeedbackIcon />}
            >
              Submit Another Feedback
            </Button>
            <Button variant="outlined" href="/" startIcon={<Email />}>
              Back to Home
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 700 }}
        >
          We Value Your Feedback
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ maxWidth: "600px", mx: "auto" }}
        >
          Help us improve by sharing your experience, suggestions, or reporting
          any issues
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Feedback Form */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <FeedbackIcon
                sx={{ fontSize: 32, color: "primary.main", mr: 2 }}
              />
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Share Your Feedback
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                {/* Name */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Full Name"
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
                </Grid>

                {/* Email */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Email Address"
                    type="email"
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
                </Grid>

                {/* Phone (Optional) */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number (Optional)"
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone color="action" />
                        </InputAdornment>
                      ),
                    }}
                    {...register("phone", {
                      pattern: {
                        value: /^[+]?[\d\s\-\(\)]{10,}$/,
                        message: "Please enter a valid phone number",
                      },
                    })}
                  />
                </Grid>

                {/* Rating */}
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="body1" gutterBottom>
                      Overall Rating (Optional)
                    </Typography>
                    <Controller
                      name="rating"
                      control={control}
                      render={({ field }) => (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Rating
                            {...field}
                            size="large"
                            onChange={(event, newValue) => {
                              field.onChange(newValue);
                            }}
                          />
                          {field.value && (
                            <Typography variant="body2" color="text.secondary">
                              {field.value} star{field.value !== 1 ? "s" : ""}
                            </Typography>
                          )}
                        </Box>
                      )}
                    />
                  </Box>
                </Grid>

                {/* Subject */}
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Subject"
                    error={!!errors.subject}
                    helperText={errors.subject?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Subject color="action" />
                        </InputAdornment>
                      ),
                    }}
                    {...register("subject", {
                      required: "Subject is required",
                      minLength: {
                        value: 5,
                        message: "Subject must be at least 5 characters",
                      },
                    })}
                  />
                </Grid>

                {/* Message */}
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    multiline
                    rows={6}
                    label="Your Message"
                    placeholder="Please share your feedback, suggestions, or report any issues..."
                    error={!!errors.message}
                    helperText={errors.message?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment
                          position="start"
                          sx={{ alignSelf: "flex-start", mt: 1 }}
                        >
                          <Message color="action" />
                        </InputAdornment>
                      ),
                    }}
                    {...register("message", {
                      required: "Message is required",
                      minLength: {
                        value: 10,
                        message: "Message must be at least 10 characters",
                      },
                    })}
                  />
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    startIcon={
                      loading ? <CircularProgress size={20} /> : <Send />
                    }
                    sx={{ py: 1.5, fontSize: "1.1rem" }}
                  >
                    {loading ? "Submitting..." : "Submit Feedback"}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Information Sidebar */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Contact Info */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  📞 Need Immediate Help?
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  For urgent issues, you can contact our support team directly:
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Email:</strong> support@subscribify.com
                  </Typography>
                  <Typography variant="body2">
                    <strong>Phone:</strong> +1 (555) 123-4567
                  </Typography>
                  <Typography variant="body2">
                    <strong>Hours:</strong> Mon-Fri 9AM-6PM
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Feedback Types */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  💡 What to Include
                </Typography>
                <Box component="ul" sx={{ pl: 2, mt: 2 }}>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    <strong>Bug Reports:</strong> Steps to reproduce the issue
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    <strong>Feature Requests:</strong> Detailed description of
                    desired functionality
                  </Typography>
                  <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                    <strong>General Feedback:</strong> Your overall experience
                  </Typography>
                  <Typography component="li" variant="body2">
                    <strong>Compliments:</strong> What you love about our
                    service
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Response Time */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  ⏱️ Response Time
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We typically respond to feedback within 24-48 hours. For
                  urgent issues, please use our direct contact methods above.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Feedback;
