import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Rating,
  Chip,
  Divider,
  TextField,
  Tab,
  Tabs,
  Avatar,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import {
  ShoppingCart,
  Subscriptions,
  Favorite,
  FavoriteBorder,
  Share,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { productsAPI, wishlistAPI, subscriptionsAPI } from "../services/api";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState(0);
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [subscriptionQuantity, setSubscriptionQuantity] = useState(1);

  const { data: product, isLoading } = useQuery(
    ["product", id],
    () => productsAPI.getProduct(id),
    {
      select: (response) => response.data.product,
      enabled: !!id,
    }
  );

  // Check if product is in wishlist
  const { data: wishlistStatus } = useQuery(
    ["wishlist-check", id],
    () => wishlistAPI.checkWishlist(id),
    {
      select: (response) => response.data.isInWishlist,
      enabled: !!id && isAuthenticated,
    }
  );

  // Wishlist mutations
  const addToWishlistMutation = useMutation(wishlistAPI.addToWishlist, {
    onSuccess: () => {
      queryClient.invalidateQueries(["wishlist-check", id]);
      toast.success("Added to wishlist!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add to wishlist");
    },
  });

  const removeFromWishlistMutation = useMutation(
    wishlistAPI.removeFromWishlist,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["wishlist-check", id]);
        toast.success("Removed from wishlist!");
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message || "Failed to remove from wishlist"
        );
      },
    }
  );

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  const handleWishlistToggle = () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to wishlist");
      navigate("/login");
      return;
    }

    if (wishlistStatus) {
      removeFromWishlistMutation.mutate(id);
    } else {
      addToWishlistMutation.mutate(id);
    }
  };

  const handleSubscriptionClick = () => {
    if (!isAuthenticated) {
      toast.error("Please login to subscribe to products");
      navigate("/login");
      return;
    }
    setSubscriptionDialogOpen(true);
  };

  const handleSubscriptionSubmit = async () => {
    if (!selectedPlan) {
      toast.error("Please select a subscription plan");
      return;
    }

    try {
      const plan = product.subscriptionPlans.find(
        (p) => p._id === selectedPlan
      );
      if (!plan) {
        throw new Error("Selected plan not found");
      }

      const response = await paymentsAPI.createSubscription({
        productId: product._id,
        planId: selectedPlan,
        quantity: subscriptionQuantity,
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
      });

      if (response.data.success) {
        toast.success("Subscription created successfully!");
        setSubscriptionDialogOpen(false);
        navigate("/subscriptions");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create subscription"
      );
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={400} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="text" height={60} />
            <Skeleton variant="text" height={40} width="60%" />
            <Skeleton variant="text" height={30} />
            <Skeleton variant="rectangular" height={100} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" textAlign="center">
          Product not found
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Card>
            <Box
              sx={{
                height: 400,
                backgroundImage: `url(${
                  product.images[0]?.url || "/placeholder.jpg"
                })`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </Card>
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2 }}>
            {product.isSubscriptionAvailable && (
              <Chip
                label="Subscription Available"
                color="secondary"
                sx={{ mb: 2 }}
              />
            )}
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
              {product.name}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Rating
                value={product.ratings.average}
                precision={0.1}
                readOnly
              />
              <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                ({product.ratings.count} reviews)
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Typography
                variant="h4"
                color="primary.main"
                sx={{ fontWeight: 600 }}
              >
                ₹{product.discountPrice || product.price}
              </Typography>
              {product.discountPrice && (
                <Typography
                  variant="h6"
                  sx={{
                    textDecoration: "line-through",
                    color: "text.secondary",
                  }}
                >
                  ₹{product.price}
                </Typography>
              )}
            </Box>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              {product.description}
            </Typography>

            {/* Quantity Selector */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
              <Typography variant="body1">Quantity:</Typography>
              <TextField
                type="number"
                size="small"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                }
                inputProps={{ min: 1, max: product.stock }}
                sx={{ width: 80 }}
              />
              <Typography variant="body2" color="text.secondary">
                ({product.stock} available)
              </Typography>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <Button
                variant="contained"
                size="large"
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                sx={{ flex: 1 }}
              >
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
              {product.isSubscriptionAvailable && (
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Subscriptions />}
                  onClick={handleSubscriptionClick}
                  sx={{ flex: 1 }}
                >
                  Subscribe
                </Button>
              )}
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                startIcon={
                  wishlistStatus ? (
                    <Favorite color="error" />
                  ) : (
                    <FavoriteBorder />
                  )
                }
                size="small"
                onClick={handleWishlistToggle}
                disabled={
                  addToWishlistMutation.isLoading ||
                  removeFromWishlistMutation.isLoading
                }
              >
                {wishlistStatus ? "Remove from Wishlist" : "Add to Wishlist"}
              </Button>
              <Button startIcon={<Share />} size="small" onClick={handleShare}>
                Share
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Product Details Tabs */}
      <Box sx={{ mt: 6 }}>
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
        >
          <Tab label="Description" />
          <Tab label="Specifications" />
          <Tab label="Reviews" />
        </Tabs>

        <Box sx={{ mt: 3 }}>
          {selectedTab === 0 && (
            <Card>
              <CardContent>
                <Typography variant="body1">{product.description}</Typography>
              </CardContent>
            </Card>
          )}

          {selectedTab === 1 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Specifications
                </Typography>
                {/* Add specifications here */}
                <Typography variant="body2" color="text.secondary">
                  Specifications will be displayed here.
                </Typography>
              </CardContent>
            </Card>
          )}

          {selectedTab === 2 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Customer Reviews
                </Typography>
                {product.reviews?.length > 0 ? (
                  product.reviews.map((review, index) => (
                    <Box key={index} sx={{ mb: 3 }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <Avatar sx={{ width: 32, height: 32, mr: 2 }}>
                          {review.name[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {review.name}
                          </Typography>
                          <Rating value={review.rating} size="small" readOnly />
                        </Box>
                      </Box>
                      <Typography variant="body2">{review.comment}</Typography>
                      {index < product.reviews.length - 1 && (
                        <Divider sx={{ mt: 2 }} />
                      )}
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No reviews yet. Be the first to review this product!
                  </Typography>
                )}
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>

      {/* Subscription Dialog */}
      <Dialog
        open={subscriptionDialogOpen}
        onClose={() => setSubscriptionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Subscribe to {product.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Choose a subscription plan and get this product delivered
              regularly.
            </Typography>

            {product.subscriptionPlans &&
            product.subscriptionPlans.length > 0 ? (
              <>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Select Plan</InputLabel>
                  <Select
                    value={selectedPlan}
                    label="Select Plan"
                    onChange={(e) => setSelectedPlan(e.target.value)}
                  >
                    {product.subscriptionPlans.map((plan) => (
                      <MenuItem key={plan._id} value={plan._id}>
                        {plan.name} - ₹{plan.price} / {plan.interval}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
                >
                  <Typography variant="body1">Quantity:</Typography>
                  <TextField
                    type="number"
                    size="small"
                    value={subscriptionQuantity}
                    onChange={(e) =>
                      setSubscriptionQuantity(
                        Math.max(1, parseInt(e.target.value) || 1)
                      )
                    }
                    inputProps={{ min: 1, max: product.stock }}
                    sx={{ width: 80 }}
                  />
                </Box>

                {selectedPlan && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    {(() => {
                      const plan = product.subscriptionPlans.find(
                        (p) => p._id === selectedPlan
                      );
                      return plan
                        ? `You'll be charged ₹${(
                            plan.price * subscriptionQuantity
                          ).toFixed(2)} every ${plan.interval}`
                        : "";
                    })()}
                  </Alert>
                )}
              </>
            ) : (
              <Alert severity="warning">
                No subscription plans available for this product.
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubscriptionDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubscriptionSubmit}
            disabled={!selectedPlan}
          >
            Subscribe Now
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProductDetail;
