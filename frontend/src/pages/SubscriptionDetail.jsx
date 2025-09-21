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
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material'
import {
  Pause,
  PlayArrow,
  Cancel,
  Edit,
  History
} from '@mui/icons-material'
import { useState } from 'react'
import { useQuery } from 'react-query'
import { subscriptionsAPI } from '../services/api'
import { format } from 'date-fns'

const SubscriptionDetail = () => {
  const { id } = useParams()
  const [pauseDialog, setPauseDialog] = useState(false)
  const [cancelDialog, setCancelDialog] = useState(false)
  const [reason, setReason] = useState('')

  const { data: subscription, isLoading } = useQuery(
    ['subscription', id],
    () => subscriptionsAPI.getSubscription(id),
    {
      select: (response) => response.data.subscription,
      enabled: !!id
    }
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'paused':
        return 'warning'
      case 'cancelled':
        return 'error'
      case 'expired':
        return 'default'
      default:
        return 'default'
    }
  }

  const handlePause = () => {
    // Implement pause functionality
    setPauseDialog(false)
    setReason('')
  }

  const handleCancel = () => {
    // Implement cancel functionality
    setCancelDialog(false)
    setReason('')
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4">Loading subscription details...</Typography>
      </Container>
    )
  }

  if (!subscription) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4">Subscription not found</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Subscription Details
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Started on {format(new Date(subscription.createdAt), 'MMMM dd, yyyy')}
          </Typography>
        </Box>
        <Chip
          label={subscription.status}
          color={getStatusColor(subscription.status)}
          size="large"
        />
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          {/* Product Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                <Avatar
                  src={subscription.product?.images?.[0]?.url}
                  variant="rounded"
                  sx={{ width: 80, height: 80 }}
                />
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {subscription.product?.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {subscription.product?.description}
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Plan
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {subscription.plan.name}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Frequency
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {subscription.plan.interval}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Quantity
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {subscription.quantity}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Price
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    ₹{subscription.plan.price}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Billing Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Billing Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Current Period
                  </Typography>
                  <Typography variant="body1">
                    {format(new Date(subscription.currentPeriodStart), 'MMM dd, yyyy')} - {format(new Date(subscription.currentPeriodEnd), 'MMM dd, yyyy')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Next Billing Date
                  </Typography>
                  <Typography variant="body1">
                    {format(new Date(subscription.nextBillingDate), 'MMM dd, yyyy')}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Total Amount Paid
                  </Typography>
                  <Typography variant="body1">
                    ₹{subscription.totalAmount || 0}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Total Deliveries
                  </Typography>
                  <Typography variant="body1">
                    {subscription.totalDeliveries || 0}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Delivery History */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Delivery History
              </Typography>
              {subscription.deliveryHistory?.length > 0 ? (
                <List>
                  {subscription.deliveryHistory.map((delivery, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemText
                        primary={`Delivery #${index + 1}`}
                        secondary={`${format(new Date(delivery.deliveryDate), 'MMM dd, yyyy')} - ${delivery.status}`}
                      />
                      <Chip
                        label={delivery.status}
                        size="small"
                        color={delivery.status === 'delivered' ? 'success' : 'default'}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No deliveries yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          {/* Shipping Address */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Shipping Address
                </Typography>
                <Button size="small" startIcon={<Edit />}>
                  Edit
                </Button>
              </Box>
              <Typography variant="body1">
                {subscription.shippingAddress.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {subscription.shippingAddress.street}<br />
                {subscription.shippingAddress.city}, {subscription.shippingAddress.state} {subscription.shippingAddress.zipCode}<br />
                {subscription.shippingAddress.country}<br />
                Phone: {subscription.shippingAddress.phone}
              </Typography>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Manage Subscription
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {subscription.status === 'active' && (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<Pause />}
                      color="warning"
                      onClick={() => setPauseDialog(true)}
                    >
                      Pause Subscription
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      color="error"
                      onClick={() => setCancelDialog(true)}
                    >
                      Cancel Subscription
                    </Button>
                  </>
                )}
                {subscription.status === 'paused' && (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<PlayArrow />}
                      color="success"
                    >
                      Resume Subscription
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      color="error"
                      onClick={() => setCancelDialog(true)}
                    >
                      Cancel Subscription
                    </Button>
                  </>
                )}
                <Button
                  variant="outlined"
                  startIcon={<History />}
                >
                  View Payment History
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Pause Dialog */}
      <Dialog open={pauseDialog} onClose={() => setPauseDialog(false)}>
        <DialogTitle>Pause Subscription</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Your subscription will be paused and you won't be charged until you resume it.
          </Typography>
          <TextField
            fullWidth
            label="Reason (optional)"
            multiline
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPauseDialog(false)}>Cancel</Button>
          <Button onClick={handlePause} variant="contained" color="warning">
            Pause Subscription
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialog} onClose={() => setCancelDialog(false)}>
        <DialogTitle>Cancel Subscription</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Are you sure you want to cancel this subscription? This action cannot be undone.
          </Typography>
          <TextField
            fullWidth
            label="Reason (optional)"
            multiline
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog(false)}>Keep Subscription</Button>
          <Button onClick={handleCancel} variant="contained" color="error">
            Cancel Subscription
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

export default SubscriptionDetail