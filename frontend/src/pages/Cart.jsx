import { Link } from 'react-router-dom'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  TextField,
  Divider,
  Avatar,
  Chip
} from '@mui/material'
import {
  Add,
  Remove,
  Delete,
  ShoppingCart,
  ArrowBack
} from '@mui/icons-material'
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'

const Cart = () => {
  const { items, totalItems, totalAmount, updateQuantity, removeFromCart, clearCart } = useCart()
  const { isAuthenticated } = useAuth()

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId)
    } else {
      updateQuantity(itemId, newQuantity)
    }
  }

  const calculateTax = () => {
    return Math.round(totalAmount * 0.18 * 100) / 100 // 18% GST
  }

  const calculateShipping = () => {
    return totalAmount >= 500 ? 0 : 50 // Free shipping above ₹500
  }

  const calculateTotal = () => {
    return totalAmount + calculateTax() + calculateShipping()
  }

  if (items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            py: 8
          }}
        >
          <ShoppingCart sx={{ fontSize: 80, color: 'grey.400', mb: 3 }} />
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
            Your cart is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Looks like you haven't added any items to your cart yet.
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/products"
            startIcon={<ArrowBack />}
          >
            Continue Shopping
          </Button>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
        Shopping Cart ({totalItems} items)
      </Typography>

      <Grid container spacing={4}>
        {/* Cart Items */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ p: 0 }}>
              {items.map((item, index) => (
                <Box key={item.id}>
                  <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
                    {/* Product Image */}
                    <Avatar
                      src={item.image}
                      alt={item.name}
                      variant="rounded"
                      sx={{ width: 80, height: 80 }}
                    />

                    {/* Product Details */}
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="h6"
                        component={Link}
                        to={`/products/${item.id}`}
                        sx={{
                          textDecoration: 'none',
                          color: 'inherit',
                          '&:hover': { color: 'primary.main' },
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          mb: 1
                        }}
                      >
                        {item.name}
                      </Typography>

                      <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600, mb: 2 }}>
                        ₹{item.price}
                      </Typography>

                      {/* Quantity Controls */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Remove />
                          </IconButton>

                          <TextField
                            size="small"
                            value={item.quantity}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 1
                              handleQuantityChange(item.id, value)
                            }}
                            inputProps={{
                              min: 1,
                              max: item.stock,
                              style: { textAlign: 'center', width: '50px' }
                            }}
                            sx={{ mx: 1, width: '80px' }}
                          />

                          <IconButton
                            size="small"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                          >
                            <Add />
                          </IconButton>
                        </Box>

                        <Typography variant="body2" color="text.secondary">
                          Stock: {item.stock}
                        </Typography>

                        <IconButton
                          color="error"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Item Total */}
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </Typography>
                    </Box>
                  </Box>
                  {index < items.length - 1 && <Divider />}
                </Box>
              ))}
            </CardContent>
          </Card>

          {/* Cart Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              variant="outlined"
              component={Link}
              to="/products"
              startIcon={<ArrowBack />}
            >
              Continue Shopping
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={clearCart}
            >
              Clear Cart
            </Button>
          </Box>
        </Grid>

        {/* Order Summary */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 100 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Order Summary
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Subtotal ({totalItems} items)</Typography>
                  <Typography>₹{totalAmount.toFixed(2)}</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Tax (GST 18%)</Typography>
                  <Typography>₹{calculateTax().toFixed(2)}</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Shipping</Typography>
                  <Box sx={{ textAlign: 'right' }}>
                    {calculateShipping() === 0 ? (
                      <Box>
                        <Typography sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                          ₹50
                        </Typography>
                        <Chip label="FREE" size="small" color="success" />
                      </Box>
                    ) : (
                      <Typography>₹{calculateShipping()}</Typography>
                    )}
                  </Box>
                </Box>

                {totalAmount < 500 && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Add ₹{(500 - totalAmount).toFixed(2)} more for free shipping
                  </Typography>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Total
                </Typography>
                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                  ₹{calculateTotal().toFixed(2)}
                </Typography>
              </Box>

              {isAuthenticated ? (
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  component={Link}
                  to="/checkout"
                >
                  Proceed to Checkout
                </Button>
              ) : (
                <Box>
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    component={Link}
                    to="/login"
                    sx={{ mb: 2 }}
                  >
                    Login to Checkout
                  </Button>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    New customer?{' '}
                    <Link to="/register" style={{ color: '#1976d2', textDecoration: 'none' }}>
                      Create an account
                    </Link>
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Cart