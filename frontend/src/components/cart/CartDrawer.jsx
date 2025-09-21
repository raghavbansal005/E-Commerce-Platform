import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Badge,
  TextField
} from '@mui/material'
import {
  Close,
  Add,
  Remove,
  Delete,
  ShoppingCart
} from '@mui/icons-material'
import { Link } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'

const CartDrawer = () => {
  const {
    isOpen,
    closeCart,
    items,
    totalItems,
    totalAmount,
    updateQuantity,
    removeFromCart
  } = useCart()

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId)
    } else {
      updateQuantity(itemId, newQuantity)
    }
  }

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={closeCart}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 400 },
          maxWidth: '100vw'
        }
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShoppingCart color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Shopping Cart
            </Typography>
            <Badge badgeContent={totalItems} color="primary" />
          </Box>
          <IconButton onClick={closeCart}>
            <Close />
          </IconButton>
        </Box>

        {/* Cart Items */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {items.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                p: 3,
                textAlign: 'center'
              }}
            >
              <ShoppingCart sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Your cart is empty
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Add some products to get started
              </Typography>
              <Button
                variant="contained"
                component={Link}
                to="/products"
                onClick={closeCart}
              >
                Browse Products
              </Button>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {items.map((item, index) => (
                <Box key={item.id}>
                  <ListItem
                    sx={{
                      py: 2,
                      px: 2,
                      alignItems: 'flex-start'
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={item.image}
                        alt={item.name}
                        variant="rounded"
                        sx={{ width: 60, height: 60 }}
                      />
                    </ListItemAvatar>
                    
                    <ListItemText
                      sx={{ ml: 2 }}
                      primary={
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 500,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {item.name}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                            ₹{item.price}
                          </Typography>
                          
                          {/* Quantity Controls */}
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              mt: 1
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <IconButton
                                size="small"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <Remove fontSize="small" />
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
                                  style: { textAlign: 'center', width: '40px' }
                                }}
                                sx={{ mx: 1, width: '60px' }}
                              />
                              
                              <IconButton
                                size="small"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                disabled={item.quantity >= item.stock}
                              >
                                <Add fontSize="small" />
                              </IconButton>
                            </Box>
                            
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Subtotal: ₹{(item.price * item.quantity).toFixed(2)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < items.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </Box>

        {/* Footer */}
        {items.length > 0 && (
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Total:
              </Typography>
              <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                ₹{totalAmount.toFixed(2)}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                fullWidth
                component={Link}
                to="/cart"
                onClick={closeCart}
              >
                View Cart
              </Button>
              <Button
                variant="contained"
                fullWidth
                component={Link}
                to="/checkout"
                onClick={closeCart}
              >
                Checkout
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </Drawer>
  )
}

export default CartDrawer