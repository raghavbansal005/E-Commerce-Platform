import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Chip,
  Button,
  Grid,
  Avatar,
  Divider,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import {
  ShoppingBag,
  Visibility
} from '@mui/icons-material'
import { useQuery } from 'react-query'
import { ordersAPI } from '../services/api'
import { format } from 'date-fns'

const Orders = () => {
  const [filters, setFilters] = useState({
    status: 'all',
    page: 1,
    limit: 10
  })

  const { data: ordersData, isLoading } = useQuery(
    ['orders', filters],
    () => ordersAPI.getMyOrders(filters),
    {
      select: (response) => response.data,
      keepPreviousData: true
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

  const handlePageChange = (event, page) => {
    setFilters(prev => ({ ...prev, page }))
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Loading orders...
        </Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          My Orders
        </Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={filters.status}
            label="Filter by Status"
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
          >
            <MenuItem value="all">All Orders</MenuItem>
            <MenuItem value="Processing">Processing</MenuItem>
            <MenuItem value="Shipped">Shipped</MenuItem>
            <MenuItem value="Delivered">Delivered</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {ordersData?.orders?.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            py: 8
          }}
        >
          <ShoppingBag sx={{ fontSize: 80, color: 'grey.400', mb: 3 }} />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            No orders found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            You haven't placed any orders yet.
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/products"
          >
            Start Shopping
          </Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {ordersData?.orders?.map((order) => (
              <Grid item xs={12} key={order._id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Order #{order._id.slice(-8)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Placed on {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Chip
                          label={order.orderStatus}
                          color={getStatusColor(order.orderStatus)}
                          size="small"
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                          ₹{order.totalPrice}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Order Items Preview */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Items Ordered:
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {order.orderItems.slice(0, 2).map((item, index) => (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                              src={item.image}
                              variant="rounded"
                              sx={{ width: 40, height: 40 }}
                            />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {item.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Qty: {item.quantity} × ₹{item.price}
                              </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              ₹{(item.quantity * item.price).toFixed(2)}
                            </Typography>
                          </Box>
                        ))}
                        {order.orderItems.length > 2 && (
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 6 }}>
                            +{order.orderItems.length - 2} more items
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                          Shipping Address:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {order.shippingAddress.name}<br />
                          {order.shippingAddress.street}, {order.shippingAddress.city}<br />
                          {order.shippingAddress.state} - {order.shippingAddress.zipCode}
                        </Typography>
                      </Box>
                    )}

                    {/* Payment Info */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Payment Details:
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">Items Total:</Typography>
                        <Typography variant="body2">₹{order.itemsPrice?.toFixed(2) || '0.00'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">Tax:</Typography>
                        <Typography variant="body2">₹{order.taxPrice?.toFixed(2) || '0.00'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">Shipping:</Typography>
                        <Typography variant="body2">
                          {order.shippingPrice === 0 ? 'FREE' : `₹${order.shippingPrice?.toFixed(2) || '0.00'}`}
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>Total:</Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          ₹{order.totalPrice?.toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        {order.orderItems.length} item{order.orderItems.length > 1 ? 's' : ''} • 
                        Payment: {order.paymentInfo?.method || 'N/A'}
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Visibility />}
                        component={Link}
                        to={`/orders/${order._id}`}
                      >
                        View Details
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {ordersData?.pagination?.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={ordersData.pagination.totalPages}
                page={filters.page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  )
}

export default Orders