import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Box,
  IconButton,
  Chip,
  Alert,
  Skeleton,
} from "@mui/material";
import {
  FavoriteOutlined as WishlistIcon,
  ShoppingCart as CartIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { wishlistAPI } from "../services/api";
import { useCart } from "../contexts/CartContext";
import toast from "react-hot-toast";

const Wishlist = () => {
  const queryClient = useQueryClient();
  const { addToCart } = useCart();

  const {
    data: wishlistData,
    isLoading,
    error,
  } = useQuery("wishlist", wishlistAPI.getWishlist, {
    select: (response) => response.data,
    retry: 1,
  });

  const removeFromWishlistMutation = useMutation(
    wishlistAPI.removeFromWishlist,
    {
      onSuccess: () => {
        queryClient.invalidateQueries("wishlist");
        toast.success("Item removed from wishlist");
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Failed to remove item");
      },
    }
  );

  const handleRemoveFromWishlist = (productId) => {
    removeFromWishlistMutation.mutate(productId);
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
          My Wishlist
        </Typography>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={24} />
                  <Skeleton variant="text" height={20} width="60%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          Failed to load wishlist. Please try again later.
        </Alert>
      </Container>
    );
  }

  const wishlistItems = wishlistData?.items || [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <WishlistIcon sx={{ mr: 2, fontSize: 32, color: "primary.main" }} />
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          My Wishlist
        </Typography>
        <Chip
          label={`${wishlistItems.length} items`}
          color="primary"
          sx={{ ml: 2 }}
        />
      </Box>

      {wishlistItems.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            py: 8,
          }}
        >
          <WishlistIcon sx={{ fontSize: 80, color: "grey.400", mb: 3 }} />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            Your wishlist is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Save items you love to your wishlist and shop them later.
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/products"
            size="large"
            startIcon={<CartIcon />}
          >
            Start Shopping
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {wishlistItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item._id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
              >
                <Box sx={{ position: "relative" }}>
                  <CardMedia
                    component="img"
                    height="200"
                    image={
                      item.product.images[0]?.url || "/placeholder-image.jpg"
                    }
                    alt={item.product.name}
                    sx={{ objectFit: "cover" }}
                  />
                  <IconButton
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      bgcolor: "rgba(255, 255, 255, 0.9)",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 1)",
                      },
                    }}
                    onClick={() => handleRemoveFromWishlist(item.product._id)}
                    disabled={removeFromWishlistMutation.isLoading}
                  >
                    <DeleteIcon color="error" />
                  </IconButton>
                </Box>

                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {item.product.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {item.product.description}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      color="primary.main"
                      sx={{ fontWeight: 600 }}
                    >
                      ₹{item.product.discountPrice || item.product.price}
                    </Typography>
                    {item.product.discountPrice && (
                      <Typography
                        variant="body2"
                        sx={{
                          textDecoration: "line-through",
                          color: "text.secondary",
                        }}
                      >
                        ₹{item.product.price}
                      </Typography>
                    )}
                  </Box>

                  {item.product.stock > 0 ? (
                    <Chip
                      label="In Stock"
                      color="success"
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  ) : (
                    <Chip
                      label="Out of Stock"
                      color="error"
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  )}
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<CartIcon />}
                    onClick={() => handleAddToCart(item.product)}
                    disabled={item.product.stock === 0}
                    sx={{ mr: 1 }}
                  >
                    Add to Cart
                  </Button>
                  <Button
                    variant="outlined"
                    component={Link}
                    to={`/products/${item.product._id}`}
                    startIcon={<ViewIcon />}
                    sx={{ minWidth: "auto", px: 2 }}
                  >
                    View
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Wishlist;
