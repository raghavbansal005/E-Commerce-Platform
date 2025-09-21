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
  Subscriptions as SubscriptionsIcon,
  Visibility,
  Pause,
  PlayArrow,
  Cancel
} from '@mui/icons-material'
import { useQuery } from 'react-query'
import { subscriptionsAPI } from '../services/api'
import { format } from 'date-fns'

const Subscriptions = () => {
  const [filters, setFilters] = useState({
    status: 'all',
    page: 1,
    limit: 10
  })

  const { data: subscriptionsData, isLoading } = useQuery(
    ['subscriptions', filters],
    () => subscriptionsAPI.getMySubscriptions(filters),
    {
      select: (response) => response.data,
      keepPreviousData: true
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

  const handlePageChange = (event, page) => {
    setFilters(prev => ({ ...prev, page }))
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Loading subscriptions...
        </Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          My Subscriptions
        </Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={filters.status}
            label="Filter by Status"
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
          >
            <MenuItem value="all">All Subscriptions</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="paused">Paused</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
            <MenuItem value="expired">Expired</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {subscriptionsData?.subscriptions?.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            py: 8
          }}
        >
          <SubscriptionsIcon sx={{ fontSize: 80, color: 'grey.400', mb: 3 }} />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
            No subscriptions found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            You don't have any subscriptions yet.
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/products"
          >
            Browse Products
          </Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {subscriptionsData?.subscriptions?.map((subscription) => (
              <Grid item xs={12} key={subscription._id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={subscription.product?.images?.[0]?.url}
                          variant="rounded"
                          sx={{ width: 60, height: 60 }}
                        />
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {subscription.product?.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {subscription.plan.name} - {subscription.plan.interval}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Started on {format(new Date(subscription.createdAt), 'MMM dd, yyyy')}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Chip
                          label={subscription.status}
                          color={getStatusColor(subscription.status)}
                          size="small"
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                          ₹{subscription.plan.price}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          per {subscription.plan.interval}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Next billing: {format(new Date(subscription.nextBillingDate), 'MMM dd, yyyy')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Quantity: {subscription.quantity}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Visibility />}
                          component={Link}
                          to={`/subscriptions/${subscription._id}`}
                        >
                          View Details
                        </Button>
                        {subscription.status === 'active' && (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Pause />}
                            color="warning"
                          >
                            Pause
                          </Button>
                        )}
                        {subscription.status === 'paused' && (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<PlayArrow />}
                            color="success"
                          >
                            Resume
                          </Button>
                        )}
                        {(subscription.status === 'active' || subscription.status === 'paused') && (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Cancel />}
                            color="error"
                          >
                            Cancel
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {subscriptionsData?.pagination?.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={subscriptionsData.pagination.totalPages}
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

export default Subscriptions