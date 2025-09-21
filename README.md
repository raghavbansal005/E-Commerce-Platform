# Subscribify - Smart E-commerce with Subscriptions

A full-stack e-commerce platform with subscription functionality built with React, Node.js, Express, and MongoDB.

## 🚀 Features

### Core Features
- **User Authentication** - JWT-based signup/login system
- **Product Management** - Browse, search, and filter products
- **Shopping Cart** - Add/remove items with quantity management
- **One-time Purchases** - Standard e-commerce checkout flow
- **Subscription System** - Weekly/monthly/quarterly subscription plans
- **Order Management** - Track orders and view order history
- **Payment Integration** - Stripe payment gateway for secure transactions
- **Image Upload** - Cloudinary integration for product images
- **Email Notifications** - Order confirmations and subscription reminders
- **Responsive Design** - Mobile-first responsive UI

### Advanced Features
- **Search & Filtering** - Advanced product search with filters
- **Product Reviews** - Customer reviews and ratings
- **Subscription Management** - Pause, resume, cancel subscriptions
- **Admin Dashboard** - Product and order management (extensible)
- **Real-time Updates** - Cart and order status updates
- **SEO Optimized** - Meta tags and structured data

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Material-UI (MUI)** - Component library
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Query** - Server state management
- **React Hook Form** - Form handling
- **Stripe.js** - Payment processing
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **Bcrypt.js** - Password hashing
- **Stripe** - Payment processing
- **Cloudinary** - Image storage
- **Nodemailer** - Email service
- **Multer** - File upload handling

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Stripe account
- Cloudinary account
- Gmail account (for email service)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd subscribify
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all dependencies (backend + frontend)
npm run install-all
```

### 3. Environment Setup

#### Backend Environment (.env)
Create a `.env` file in the `backend` directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/subscribify

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Server
PORT=5000
NODE_ENV=development
```

#### Frontend Environment (.env)
Create a `.env` file in the `frontend` directory:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
VITE_API_URL=http://localhost:5000/api
```

### 4. Database Setup
Make sure MongoDB is running locally or set up MongoDB Atlas and update the connection string.

### 5. Start the Application
```bash
# Start both backend and frontend concurrently
npm run dev

# Or start them separately:
# Backend only
npm run server

# Frontend only
npm run client
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 🔧 Configuration

### Stripe Setup
1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe dashboard
3. Set up webhooks for subscription events
4. Add the webhook endpoint: `http://localhost:5000/api/payments/webhook`

### Cloudinary Setup
1. Create a Cloudinary account at https://cloudinary.com
2. Get your cloud name, API key, and API secret
3. Configure upload presets if needed

### Email Setup (Gmail)
1. Enable 2-factor authentication on your Gmail account
2. Generate an app password
3. Use the app password in the EMAIL_PASS environment variable

## 📁 Project Structure

```
subscribify/
├── backend/
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Utility functions
│   ├── uploads/         # File upload directory
│   └── server.js        # Express server
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   ├── services/    # API services
│   │   └── main.jsx     # App entry point
│   ├── public/          # Static assets
│   └── index.html       # HTML template
└── package.json         # Root package.json
```

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/DigitalOcean)
1. Set environment variables on your hosting platform
2. Update CORS origins for production
3. Set up MongoDB Atlas for production database
4. Configure Stripe webhooks for production URL

### Frontend Deployment (Vercel/Netlify)
1. Build the frontend: `cd frontend && npm run build`
2. Deploy the `dist` folder
3. Set environment variables on your hosting platform
4. Update API URLs for production

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Product browsing and search
- [ ] Add to cart functionality
- [ ] Checkout process
- [ ] Order placement
- [ ] Subscription creation
- [ ] Payment processing
- [ ] Email notifications
- [ ] Subscription management

### API Testing
Use tools like Postman or Thunder Client to test API endpoints:
- Authentication endpoints
- Product CRUD operations
- Order management
- Subscription handling
- Payment processing

## 🔐 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS configuration
- Helmet.js security headers
- Environment variable protection

## 📈 Performance Optimizations

- Image optimization with Cloudinary
- Lazy loading for product images
- React Query for efficient data fetching
- Pagination for large datasets
- Database indexing for search
- Gzip compression
- Static asset caching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@subscribify.com
- Documentation: Check the `/docs` folder for detailed guides

## 🔄 Version History

- **v1.0.0** - Initial release with core e-commerce and subscription features
- **v1.1.0** - Added advanced search and filtering
- **v1.2.0** - Enhanced subscription management
- **v2.0.0** - Major UI/UX improvements and performance optimizations

## 🎯 Roadmap

- [ ] Admin dashboard
- [ ] Advanced analytics
- [ ] Multi-vendor support
- [ ] Mobile app (React Native)
- [ ] AI-powered recommendations
- [ ] Social login integration
- [ ] Multi-language support
- [ ] Advanced inventory management

---

**Happy Coding! 🚀**