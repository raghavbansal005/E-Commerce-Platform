import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Box,
  Chip,
  Rating,
  Skeleton,
  TextField,
  Paper,
  InputAdornment,
  Alert,
  CircularProgress
} from '@mui/material'
import {
  ShoppingCart,
  Subscriptions,
  LocalShipping,
  Security,
  Support,
  Star,
  Email,
  Person,
  Send,
  Feedback as FeedbackIcon,
  CheckCircle,
  LocationOn,
  Phone,
  AccessTime,
  Business,
  Public,
  Store,
  LocalAtm,
  Verified
} from '@mui/icons-material'
import { useQuery } from 'react-query'
import { productsAPI, feedbackAPI } from '../services/api'
import { useCart } from '../contexts/CartContext'
import { useForm, Controller } from 'react-hook-form'
import toast from 'react-hot-toast'

const Home = () => {
  const { addToCart } = useCart()
  
  // Feedback form state
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [feedbackError, setFeedbackError] = useState('')

  const {
    register: registerFeedback,
    handleSubmit: handleFeedbackSubmit,
    control: feedbackControl,
    reset: resetFeedback,
    formState: { errors: feedbackErrors }
  } = useForm()

  // Fetch featured products
  const { data: featuredProducts, isLoading: loadingFeatured } = useQuery(
    'featuredProducts',
    productsAPI.getFeaturedProducts,
    {
      select: (response) => response.data.products,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )

  const handleAddToCart = (product) => {
    addToCart(product, 1)
  }

  // Handle feedback form submission
  const onFeedbackSubmit = async (data) => {
    setFeedbackError('')
    setFeedbackLoading(true)

    try {
      const response = await feedbackAPI.submitFeedback(data)
      
      if (response.data.success) {
        setFeedbackSubmitted(true)
        toast.success('Thank you for your feedback!')
        resetFeedback()
        // Reset success state after 5 seconds
        setTimeout(() => setFeedbackSubmitted(false), 5000)
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit feedback'
      setFeedbackError(message)
      toast.error(message)
    } finally {
      setFeedbackLoading(false)
    }
  }

  const features = [
    {
      icon: <ShoppingCart sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'One-Time Purchase',
      description: 'Buy products instantly with secure checkout and fast delivery.'
    },
    {
      icon: <Subscriptions sx={{ fontSize: 40, color: 'secondary.main' }} />,
      title: 'Flexible Subscriptions',
      description: 'Subscribe to your favorite products with weekly, monthly, or custom intervals.'
    },
    {
      icon: <LocalShipping sx={{ fontSize: 40, color: 'success.main' }} />,
      title: 'Free Shipping',
      description: 'Enjoy free shipping on orders above ₹500 and all subscription deliveries.'
    },
    {
      icon: <Security sx={{ fontSize: 40, color: 'warning.main' }} />,
      title: 'Secure Payments',
      description: 'Your payments are protected with industry-standard encryption.'
    },
    {
      icon: <Support sx={{ fontSize: 40, color: 'info.main' }} />,
      title: '24/7 Support',
      description: 'Get help anytime with our dedicated customer support team.'
    },
    {
      icon: <Star sx={{ fontSize: 40, color: 'error.main' }} />,
      title: 'Quality Products',
      description: 'Curated selection of high-quality products from trusted brands.'
    }
  ]

  return (
    <div>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              mb: 3
            }}
          >
            Smart E-commerce with
            <br />
            <span style={{ color: '#fbbf24' }}>Subscriptions</span>
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              opacity: 0.9,
              fontSize: { xs: '1.1rem', md: '1.5rem' },
              maxWidth: '600px',
              mx: 'auto'
            }}
          >
            Discover amazing products with flexible options - buy once or subscribe for regular deliveries
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/products"
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': {
                  bgcolor: 'grey.100'
                }
              }}
            >
              Shop Now
            </Button>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              to="/about"
              sx={{
                borderColor: 'white',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              Learn More
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          textAlign="center"
          gutterBottom
          sx={{ fontWeight: 600, mb: 6 }}
        >
          Why Choose Subscribify?
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  p: 3,
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Products Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
            <Typography
              variant="h3"
              component="h2"
              sx={{ fontWeight: 600 }}
            >
              Featured Products
            </Typography>
            <Button
              variant="outlined"
              component={Link}
              to="/products"
              size="large"
            >
              View All
            </Button>
          </Box>

          <Grid container spacing={3}>
            {loadingFeatured ? (
              // Loading skeletons
              Array.from({ length: 8 }).map((_, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card>
                    <Skeleton variant="rectangular" height={200} />
                    <CardContent>
                      <Skeleton variant="text" height={32} />
                      <Skeleton variant="text" height={24} width="60%" />
                      <Skeleton variant="text" height={20} />
                    </CardContent>
                    <CardActions>
                      <Skeleton variant="rectangular" width={100} height={36} />
                    </CardActions>
                  </Card>
                </Grid>
              ))
            ) : (
              featuredProducts?.slice(0, 8).map((product) => (
                <Grid item xs={12} sm={6} md={3} key={product._id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      transition: 'transform 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3
                      }
                    }}
                  >
                    {product.isSubscriptionAvailable && (
                      <Chip
                        label="Subscription Available"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          zIndex: 1,
                          bgcolor: 'secondary.main',
                          color: 'white'
                        }}
                      />
                    )}
                    
                    <CardMedia
                      component={Link}
                      to={`/products/${product._id}`}
                      sx={{
                        height: 200,
                        backgroundImage: `url(${product.images[0]?.url || '/placeholder.jpg'})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        textDecoration: 'none'
                      }}
                    />
                    
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="h6"
                        component={Link}
                        to={`/products/${product._id}`}
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
                        {product.name}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Rating
                          value={product.ratings.average}
                          precision={0.1}
                          size="small"
                          readOnly
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                          ({product.ratings.count})
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
                          ₹{product.discountPrice || product.price}
                        </Typography>
                        {product.discountPrice && (
                          <Typography
                            variant="body2"
                            sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                          >
                            ₹{product.price}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                    
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                      >
                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 600, mb: 3 }}
          >
            Ready to Start Shopping?
          </Typography>
          <Typography
            variant="h6"
            sx={{ mb: 4, opacity: 0.9 }}
          >
            Join thousands of satisfied customers who love our products and subscription service
          </Typography>
          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/products"
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              px: 6,
              py: 2,
              fontSize: '1.2rem',
              '&:hover': {
                bgcolor: 'grey.100'
              }
            }}
          >
            Browse Products
          </Button>
        </Container>
      </Box>

      {/* Feedback Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
            Share Your Feedback
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '600px', mx: 'auto' }}>
            Help us improve by sharing your experience with Subscribify
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
              {feedbackSubmitted ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'success.main' }}>
                    Thank You!
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Your feedback has been submitted successfully. We appreciate your input!
                  </Typography>
                </Box>
              ) : (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <FeedbackIcon sx={{ fontSize: 28, color: 'primary.main', mr: 2 }} />
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      Quick Feedback Form
                    </Typography>
                  </Box>

                  {feedbackError && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {feedbackError}
                    </Alert>
                  )}

                  <Box component="form" onSubmit={handleFeedbackSubmit(onFeedbackSubmit)}>
                    <Grid container spacing={3}>
                      {/* Name and Email */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          fullWidth
                          label="Your Name"
                          error={!!feedbackErrors.name}
                          helperText={feedbackErrors.name?.message}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Person color="action" />
                              </InputAdornment>
                            ),
                          }}
                          {...registerFeedback('name', {
                            required: 'Name is required',
                            minLength: {
                              value: 2,
                              message: 'Name must be at least 2 characters'
                            }
                          })}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          fullWidth
                          label="Email Address"
                          type="email"
                          error={!!feedbackErrors.email}
                          helperText={feedbackErrors.email?.message}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Email color="action" />
                              </InputAdornment>
                            ),
                          }}
                          {...registerFeedback('email', {
                            required: 'Email is required',
                            pattern: {
                              value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                              message: 'Please enter a valid email address'
                            }
                          })}
                        />
                      </Grid>

                      {/* Rating */}
                      <Grid item xs={12} sm={6}>
                        <Box>
                          <Typography variant="body1" gutterBottom>
                            Rate Your Experience
                          </Typography>
                          <Controller
                            name="rating"
                            control={feedbackControl}
                            render={({ field }) => (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Rating
                                  {...field}
                                  size="large"
                                  onChange={(event, newValue) => {
                                    field.onChange(newValue)
                                  }}
                                />
                                {field.value && (
                                  <Typography variant="body2" color="text.secondary">
                                    {field.value} star{field.value !== 1 ? 's' : ''}
                                  </Typography>
                                )}
                              </Box>
                            )}
                          />
                        </Box>
                      </Grid>

                      {/* Subject */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          fullWidth
                          label="Subject"
                          placeholder="Brief summary of your feedback"
                          error={!!feedbackErrors.subject}
                          helperText={feedbackErrors.subject?.message}
                          {...registerFeedback('subject', {
                            required: 'Subject is required',
                            minLength: {
                              value: 5,
                              message: 'Subject must be at least 5 characters'
                            }
                          })}
                        />
                      </Grid>

                      {/* Message */}
                      <Grid item xs={12}>
                        <TextField
                          required
                          fullWidth
                          multiline
                          rows={4}
                          label="Your Message"
                          placeholder="Share your thoughts, suggestions, or report any issues..."
                          error={!!feedbackErrors.message}
                          helperText={feedbackErrors.message?.message}
                          {...registerFeedback('message', {
                            required: 'Message is required',
                            minLength: {
                              value: 10,
                              message: 'Message must be at least 10 characters'
                            }
                          })}
                        />
                      </Grid>

                      {/* Submit Button */}
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                          <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={feedbackLoading}
                            startIcon={feedbackLoading ? <CircularProgress size={20} /> : <Send />}
                            sx={{ px: 4, py: 1.5 }}
                          >
                            {feedbackLoading ? 'Submitting...' : 'Submit Feedback'}
                          </Button>
                          <Button
                            variant="outlined"
                            size="large"
                            component={Link}
                            to="/feedback"
                            sx={{ px: 4, py: 1.5 }}
                          >
                            Detailed Form
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </>
              )}
            </Paper>
          </Grid>

          {/* Quick Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  💬 Why Your Feedback Matters
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your feedback helps us improve our products, services, and overall customer experience. 
                  Every suggestion is valuable to us!
                </Typography>
              </Card>

              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  ⚡ Quick & Easy
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This form takes less than 2 minutes to complete. For more detailed feedback, 
                  use our comprehensive feedback form.
                </Typography>
              </Card>

              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  📧 We'll Respond
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We read every feedback and respond within 24-48 hours. 
                  Your input drives our improvements!
                </Typography>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </div>
  )
}

export default Home