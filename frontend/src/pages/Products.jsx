import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  Rating,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Skeleton
} from '@mui/material'
import {
  ExpandMore,
  FilterList
} from '@mui/icons-material'
import { useQuery } from 'react-query'
import { productsAPI } from '../services/api'
import { useCart } from '../contexts/CartContext'

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { addToCart } = useCart()

  // Filter states
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'all',
    minPrice: parseInt(searchParams.get('minPrice')) || 0,
    maxPrice: parseInt(searchParams.get('maxPrice')) || 10000,
    rating: parseInt(searchParams.get('rating')) || 0,
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page')) || 1
  })

  // Fetch products
  const { data: productsData, isLoading, error } = useQuery(
    ['products', filters],
    () => productsAPI.getProducts(filters),
    {
      select: (response) => response.data,
      keepPreviousData: true,
      onError: (error) => {
        console.error('Products fetch error:', error)
      },
      onSuccess: (data) => {
        console.log('Products fetched successfully:', data)
      }
    }
  )

  // Fetch categories
  const { data: categoriesData } = useQuery(
    'categories',
    productsAPI.getCategories,
    {
      select: (response) => response.data.categories
    }
  )

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== 0 && value !== 1) {
        params.set(key, value.toString())
      }
    })
    setSearchParams(params)
  }, [filters, setSearchParams])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }))
  }

  const handlePageChange = (event, page) => {
    setFilters(prev => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleAddToCart = (product) => {
    addToCart(product, 1)
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
        Products
        {filters.search && (
          <Typography component="span" variant="h5" color="text.secondary">
            {' '}for "{filters.search}"
          </Typography>
        )}
      </Typography>

      <Grid container spacing={3}>
        {/* Filters Sidebar */}
        <Grid item xs={12} md={3}>
          <Box sx={{ position: 'sticky', top: 100 }}>
            {/* Search */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">Search</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TextField
                  fullWidth
                  placeholder="Search products..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </AccordionDetails>
            </Accordion>

            {/* Category Filter */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">Category</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormControl fullWidth>
                  <Select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    {categoriesData?.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </AccordionDetails>
            </Accordion>

            {/* Price Range */}
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">Price Range</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ px: 1 }}>
                  <Slider
                    value={[filters.minPrice, filters.maxPrice]}
                    onChange={(e, newValue) => {
                      handleFilterChange('minPrice', newValue[0])
                      handleFilterChange('maxPrice', newValue[1])
                    }}
                    valueLabelDisplay="auto"
                    min={0}
                    max={10000}
                    step={100}
                    valueLabelFormat={(value) => `₹${value}`}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="body2">₹{filters.minPrice}</Typography>
                    <Typography variant="body2">₹{filters.maxPrice}</Typography>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Rating Filter */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">Rating</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <FormControl fullWidth>
                  <Select
                    value={filters.rating}
                    onChange={(e) => handleFilterChange('rating', e.target.value)}
                  >
                    <MenuItem value={0}>All Ratings</MenuItem>
                    <MenuItem value={4}>4+ Stars</MenuItem>
                    <MenuItem value={3}>3+ Stars</MenuItem>
                    <MenuItem value={2}>2+ Stars</MenuItem>
                    <MenuItem value={1}>1+ Stars</MenuItem>
                  </Select>
                </FormControl>
              </AccordionDetails>
            </Accordion>
          </Box>
        </Grid>

        {/* Products Grid */}
        <Grid item xs={12} md={9}>
          {/* Sort and Results Info */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="body1" color="text.secondary">
              {productsData?.totalProducts || 0} products found
            </Typography>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Sort by</InputLabel>
              <Select
                value={filters.sort}
                label="Sort by"
                onChange={(e) => handleFilterChange('sort', e.target.value)}
              >
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="price_low">Price: Low to High</MenuItem>
                <MenuItem value="price_high">Price: High to Low</MenuItem>
                <MenuItem value="rating">Highest Rated</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Error Display */}
          {error && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body1" color="error" sx={{ textAlign: 'center', py: 2 }}>
                Error loading products: {error.message}
              </Typography>
            </Box>
          )}

          {/* Products Grid */}
          <Grid container spacing={3}>
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 12 }).map((_, index) => (
                <Grid item xs={12} sm={6} lg={4} key={index}>
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
            ) : productsData?.products?.length === 0 ? (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No products found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting your filters or search terms
                  </Typography>
                </Box>
              </Grid>
            ) : (
              productsData?.products?.map((product) => (
                <Grid item xs={12} sm={6} lg={4} key={product._id}>
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

          {/* Pagination */}
          {productsData?.pagination?.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={productsData.pagination.totalPages}
                page={filters.page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </Grid>
      </Grid>
    </Container>
  )
}

export default Products