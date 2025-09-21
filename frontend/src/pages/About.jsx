import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import {
  Business,
  People,
  TrendingUp,
  Security,
  Nature,
  CheckCircle,
  Rocket,
  Star,
  EmojiEvents,
  Public,
  LocalShipping,
  Support,
  Verified,
  Lightbulb
} from '@mui/icons-material'

const About = () => {
  const teamMembers = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      description: 'Visionary leader with 15+ years in e-commerce and subscription services.'
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      description: 'Tech innovator specializing in scalable platforms and AI-driven solutions.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Design',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      description: 'Creative designer focused on user experience and modern interfaces.'
    },
    {
      name: 'David Kim',
      role: 'VP of Operations',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      description: 'Operations expert ensuring seamless delivery and customer satisfaction.'
    }
  ]

  const milestones = [
    {
      year: '2020',
      title: 'Company Founded',
      description: 'Started with a vision to revolutionize e-commerce subscriptions'
    },
    {
      year: '2021',
      title: 'First 1K Customers',
      description: 'Reached our first milestone of 1,000 satisfied customers'
    },
    {
      year: '2022',
      title: 'Global Expansion',
      description: 'Expanded to serve customers in 25+ countries worldwide'
    },
    {
      year: '2023',
      title: 'AI Integration',
      description: 'Launched AI-powered recommendation and subscription management'
    },
    {
      year: '2024',
      title: 'Sustainability Focus',
      description: 'Achieved carbon-neutral shipping and eco-friendly packaging'
    }
  ]

  const values = [
    {
      icon: <Lightbulb sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Innovation',
      description: 'Constantly pushing boundaries with cutting-edge technology and creative solutions.'
    },
    {
      icon: <People sx={{ fontSize: 40, color: 'secondary.main' }} />,
      title: 'Customer First',
      description: 'Every decision we make is centered around delivering exceptional customer value.'
    },
    {
      icon: <Security sx={{ fontSize: 40, color: 'success.main' }} />,
      title: 'Trust & Security',
      description: 'Your data and transactions are protected with enterprise-grade security.'
    },
    {
      icon: <Nature sx={{ fontSize: 40, color: 'warning.main' }} />,
      title: 'Sustainability',
      description: 'Committed to environmental responsibility and sustainable business practices.'
    }
  ]

  const achievements = [
    { number: '50K+', label: 'Happy Customers', icon: <People /> },
    { number: '1M+', label: 'Orders Delivered', icon: <LocalShipping /> },
    { number: '99.9%', label: 'Uptime', icon: <TrendingUp /> },
    { number: '24/7', label: 'Support', icon: <Support /> }
  ]

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
          About Subscribify
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto', mb: 4 }}>
          We're revolutionizing e-commerce with smart subscription services that adapt to your lifestyle
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Chip
            icon={<Verified />}
            label="Trusted by 50K+ customers"
            color="primary"
            variant="outlined"
            size="large"
          />
          <Chip
            icon={<EmojiEvents />}
            label="Award-winning platform"
            color="secondary"
            variant="outlined"
            size="large"
          />
          <Chip
            icon={<Public />}
            label="Global presence"
            color="success"
            variant="outlined"
            size="large"
          />
        </Box>
      </Box>

      {/* Mission & Vision */}
      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              height: '100%',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              color: 'white',
              borderRadius: 3
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Rocket sx={{ fontSize: 32, mr: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                Our Mission
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
              To make shopping effortless and personalized through intelligent subscription services 
              that anticipate your needs and deliver exactly what you want, when you want it.
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              p: 4,
              height: '100%',
              background: 'linear-gradient(135deg, #ec4899 0%, #f59e0b 100%)',
              color: 'white',
              borderRadius: 3
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Star sx={{ fontSize: 32, mr: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                Our Vision
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
              To become the world's most trusted and innovative subscription commerce platform, 
              empowering businesses and delighting customers with seamless, sustainable experiences.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Achievements */}
      <Paper elevation={2} sx={{ p: 4, mb: 8, borderRadius: 3 }}>
        <Typography variant="h3" textAlign="center" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
          Our Impact
        </Typography>
        <Grid container spacing={4}>
          {achievements.map((achievement, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  {achievement.icon}
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                  {achievement.number}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                  {achievement.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Values */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h3" textAlign="center" gutterBottom sx={{ fontWeight: 600, mb: 6 }}>
          Our Values
        </Typography>
        <Grid container spacing={4}>
          {values.map((value, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  p: 3,
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ mb: 2 }}>
                    {value.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    {value.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {value.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Why Choose Us */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
        }}
      >
        <Typography variant="h3" textAlign="center" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
          Why Choose Subscribify?
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Flexible Subscriptions"
                  secondary="Pause, modify, or cancel anytime with no penalties"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="AI-Powered Recommendations"
                  secondary="Smart suggestions based on your preferences and usage patterns"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Premium Quality Products"
                  secondary="Curated selection from trusted brands and suppliers"
                />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={12} md={6}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Sustainable Practices"
                  secondary="Eco-friendly packaging and carbon-neutral shipping"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="24/7 Customer Support"
                  secondary="Always here to help with dedicated support team"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="Secure & Reliable"
                  secondary="Enterprise-grade security with 99.9% uptime guarantee"
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  )
}

export default About