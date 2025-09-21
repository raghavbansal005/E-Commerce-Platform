import { useState } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useAuth } from "../contexts/AuthContext";
import { authAPI } from "../services/api";
import toast from "react-hot-toast";

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [selectedTab, setSelectedTab] = useState(0);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await authAPI.updateAvatar(formData);

      if (response.data.success) {
        updateProfile({ avatar: response.data.avatar });
        toast.success("Avatar updated successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update avatar");
    } finally {
      setUploading(false);
    }
  };

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm();

  const onProfileSubmit = async (data) => {
    const result = await updateProfile(data);
    if (result.success) {
      setMessage("Profile updated successfully!");
    }
  };

  const onPasswordSubmit = async (data) => {
    const result = await changePassword(data);
    if (result.success) {
      setMessage("Password changed successfully!");
      resetPassword();
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
        My Profile
      </Typography>

      {message && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setMessage("")}>
          {message}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
            <Box sx={{ position: "relative" }}>
              <Box sx={{ position: "relative" }}>
                <Avatar
                  src={user?.avatar?.url}
                  sx={{
                    width: 120,
                    height: 120,
                    mr: 3,
                    border: "4px solid white",
                    boxShadow: 3,
                    transition: "transform 0.2s ease-in-out",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  {user?.name?.[0]?.toUpperCase()}
                </Avatar>
                {uploading && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      borderRadius: "50%",
                    }}
                  >
                    <CircularProgress size={40} />
                  </Box>
                )}
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    backgroundColor: "rgba(0,0,0,0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0,
                    transition: "opacity 0.2s",
                    cursor: "pointer",
                    "&:hover": {
                      opacity: 1,
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: "white", fontWeight: 500 }}
                  >
                    Change Photo
                  </Typography>
                </Box>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0,
                    cursor: "pointer",
                  }}
                />
              </Box>
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                {user?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
          </Box>

          <Tabs
            value={selectedTab}
            onChange={(e, newValue) => setSelectedTab(newValue)}
          >
            <Tab label="Profile Information" />
            <Tab label="Change Password" />
          </Tabs>

          <Box sx={{ mt: 3 }}>
            {selectedTab === 0 && (
              <Box
                component="form"
                onSubmit={handleProfileSubmit(onProfileSubmit)}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      error={!!profileErrors.name}
                      helperText={profileErrors.name?.message}
                      {...registerProfile("name", {
                        required: "Name is required",
                      })}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      disabled
                      {...registerProfile("email")}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      {...registerProfile("phone")}
                    />
                  </Grid>
                </Grid>
                <Button type="submit" variant="contained" sx={{ mt: 3 }}>
                  Update Profile
                </Button>
              </Box>
            )}

            {selectedTab === 1 && (
              <Box
                component="form"
                onSubmit={handlePasswordSubmit(onPasswordSubmit)}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      type="password"
                      error={!!passwordErrors.currentPassword}
                      helperText={passwordErrors.currentPassword?.message}
                      {...registerPassword("currentPassword", {
                        required: "Current password is required",
                      })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="New Password"
                      type="password"
                      error={!!passwordErrors.newPassword}
                      helperText={passwordErrors.newPassword?.message}
                      {...registerPassword("newPassword", {
                        required: "New password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                    />
                  </Grid>
                </Grid>
                <Button type="submit" variant="contained" sx={{ mt: 3 }}>
                  Change Password
                </Button>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Profile;
