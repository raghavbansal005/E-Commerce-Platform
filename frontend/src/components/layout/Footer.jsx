import { Link } from 'react-router-dom'
import {
  Box,
  Container,
  Grid,
  Typography,
  IconButton,
  Divider
} from '@mui/material'
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Email,
  Phone,
  LocationOn
} from '@mui/icons-material'

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'grey.900',
        color: 'white',
        py: 6,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
              Subscribify
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'grey.400' }}>
              Your smart e-commerce platform with flexible subscription options. 
              Shop once or subscribe for regular deliveries.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                color="inherit"
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: 'grey.400', '&:hover': { color: 'primary.main' } }}
              >
                <Facebook />
              </IconButton>
              <IconButton
                color="inherit"
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: 'grey.400', '&:hover': { color: 'primary.main' } }}
              >
                <Twitter />
              </IconButton>
              <IconButton
                color="inherit"
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: 'grey.400', '&:hover': { color: 'primary.main' } }}
              >
                <Instagram />
              </IconButton>
              <IconButton
                color="inherit"
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: 'grey.400', '&:hover': { color: 'primary.main' } }}
              >
                <LinkedIn />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link
                to="/products"
                style={{
                  color: '#9ca3af',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.color = '#3b82f6'}
                onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
              >
                All Products
              </Link>
              <Link
                to="/products?category=Electronics"
                style={{
                  color: '#9ca3af',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.color = '#3b82f6'}
                onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
              >
                Electronics
              </Link>
              <Link
                to="/products?category=Clothing"
                style={{
                  color: '#9ca3af',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.color = '#3b82f6'}
                onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
              >
                Clothing
              </Link>
              <Link
                to="/products?category=Books"
                style={{
                  color: '#9ca3af',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.color = '#3b82f6'}
                onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
              >
                Books
              </Link>
            </Box>
          </Grid>

          {/* Customer Service */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Customer Service
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link
                to="/feedback"
                style={{
                  color: '#9ca3af',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.color = '#3b82f6'}
                onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
              >
                Share Feedback
              </Link>
              <Typography variant="body2" sx={{ color: 'grey.400' }}>
                Help Center
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.400' }}>
                Shipping Info
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.400' }}>
                Returns & Exchanges
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.400' }}>
                Size Guide
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.400' }}>
                Track Your Order
              </Typography>
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Contact Us
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email sx={{ color: 'grey.400', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: 'grey.400' }}>
                  support@subscribify.com
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone sx={{ color: 'grey.400', fontSize: 20 }} />
                <Typography variant="body2" sx={{ color: 'grey.400' }}>
                  +1 (555) 123-4567
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <LocationOn sx={{ color: 'grey.400', fontSize: 20, mt: 0.2 }} />
                <Typography variant="body2" sx={{ color: 'grey.400' }}>
                  123 Commerce Street<br />
                  Business District<br />
                  New York, NY 10001
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'grey.700' }} />

        {/* Bottom Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Typography variant="body2" sx={{ color: 'grey.400' }}>
            © 2024 Subscribify. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Typography
              variant="body2"
              sx={{
                color: 'grey.400',
                cursor: 'pointer',
                '&:hover': { color: 'primary.main' }
              }}
            >
              Privacy Policy
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'grey.400',
                cursor: 'pointer',
                '&:hover': { color: 'primary.main' }
              }}
            >
              Terms of Service
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'grey.400',
                cursor: 'pointer',
                '&:hover': { color: 'primary.main' }
              }}
            >
              Cookie Policy
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default Footer