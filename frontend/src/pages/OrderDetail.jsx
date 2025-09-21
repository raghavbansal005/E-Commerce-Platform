import { useParams } from 'react-router-dom'
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Chip,
  Grid,
  Avatar,
  Divider,
  Button,
  Stepper,
  Step,
  StepLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material'
import {
  LocalShipping,
  Cancel
} from '@mui/icons-material'
import { useQuery } from 'react-query'
import { ordersAPI } from '../services/api'
import { format } from 'date-fns'

const OrderDetail = () => {
  const { id } = useParams()

  const { data: order, isLoading } = useQuery(
    ['order', id],
    () => ordersAPI.getOrder(id),
    {
      select: (response) => response.data.order,
      enabled: !!id
    }
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'Processing':
        return 'warning'
      case 'Shipped':
        return 'info'
      case 'Delivered':
        return 'success'
      case 'Cancelled':
        return 'error'
      default:
        return 'default'
    }
  }

  const getActiveStep = (status) => {
    switch (status) {
      case 'Processing':
        return 0
      case 'Shipped':
        return 1
      case 'Delivered':
        return 2
      case 'Cancelled':
        return -1
      default:
        return 0
    }
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4">Loading order details...</Typography>
      </Container>
    )
  }

  if (!order) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4">Order not found</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Order #{order._id.slice(-8)}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Placed on {format(new Date(order.createdAt), 'MMMM dd, yyyy')}
          </Typography>
        </Box>
        <Chip
          label={order.orderStatus}
          color={getStatusColor(order.orderStatus)}
          size="large"
        />
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {/* Order Status */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Order Status
              </Typography>
              {order.orderStatus !== 'Cancelled' ? (
                <Stepper activeStep={getActiveStep(order.orderStatus)} sx={{ mt: 2 }}>
                  <Step>
                    <StepLabel>Processing</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>Shipped</StepLabel>
                  </Step>
                  <Step>
                    <StepLabel>Delivered</StepLabel>
                  </Step>
                </Stepper>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <Cancel color="error" sx={{ mr: 1 }} />
                  <Typography color="error">Order has been cancelled</Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Order Items
              </Typography>
              <List>
                {order.orderItems.map((item, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar
                        src={item.image}
                        variant="rounded"
                        sx={{ width: 60, height: 60 }}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={item.name}
                      secondary={`Quantity: ${item.quantity}`}
                      sx={{ ml: 2 }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Shipping Address
              </Typography>
              <Typography variant="body1">
                {order.shippingAddress.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                {order.shippingAddress.country}<br />
                Phone: {order.shippingAddress.phone}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          {/* Order Summary */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Order Summary
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Subtotal</Typography>
                  <Typography>₹{order.itemsPrice}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Tax</Typography>
                  <Typography>₹{order.taxPrice}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Shipping</Typography>
                  <Typography>₹{order.shippingPrice}</Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Total
                </Typography>
                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                  ₹{order.totalPrice}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Actions
              </Typography>
              {order.orderStatus === 'Processing' && (
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  startIcon={<Cancel />}
                  sx={{ mb: 2 }}
                >
                  Cancel Order
                </Button>
              )}
              {order.trackingNumber && (
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<LocalShipping />}
                >
                  Track Package
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  )
}

export default OrderDetail