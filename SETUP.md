# 🚀 Subscribify Setup Guide

This guide will help you set up the Subscribify E-commerce + Subscription Platform on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** - [Download here](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/atlas)
- **Git** - [Download here](https://git-scm.com/)

## 🛠️ Quick Setup

### 1. Install Dependencies

```bash
npm run setup
```

This command will install all dependencies for both frontend and backend.

### 2. Configure Environment Variables

#### Backend Configuration

1. Navigate to `backend/` directory
2. Copy `.env.example` to `.env`
3. Update the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/subscribify

# JWT (Generate a secure secret)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Cloudinary (Sign up at https://cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Stripe (Sign up at https://stripe.com)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email (Gmail App Password)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

#### Frontend Configuration

1. Navigate to `frontend/` directory
2. Copy `.env.example` to `.env`
3. Update the variables:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
VITE_API_URL=http://localhost:5000/api
```

### 3. Start the Application

```bash
npm start
```

This will start both the backend and frontend servers:

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 🔧 Detailed Configuration

### MongoDB Setup

#### Option 1: Local MongoDB

1. Install MongoDB Community Edition
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/subscribify`

#### Option 2: MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string and update `MONGODB_URI`

### Stripe Setup

1. Create account at [Stripe](https://stripe.com)
2. Go to Dashboard → Developers → API Keys
3. Copy your publishable and secret keys
4. For webhooks:
   - Go to Dashboard → Developers → Webhooks
   - Add endpoint: `http://localhost:5000/api/payments/webhook`
   - Select events: `payment_intent.*`, `invoice.*`, `customer.subscription.*`
   - Copy webhook secret

### Cloudinary Setup

1. Create account at [Cloudinary](https://cloudinary.com)
2. Go to Dashboard
3. Copy Cloud Name, API Key, and API Secret

### Gmail Setup

1. Enable 2-Factor Authentication on your Gmail account
2. Generate App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use this app password in `EMAIL_PASS`

## 🚦 Development Commands

```bash
# Install all dependencies
npm run install-all

# Start both servers
npm start
# or
npm run dev

# Start backend only
npm run server

# Start frontend only
npm run client

# Complete setup
npm run setup
```

## 🧪 Testing the Setup

1. **Backend Health Check**: Visit http://localhost:5000/api/health
2. **Frontend**: Visit http://localhost:5173
3. **Database**: Check MongoDB connection in backend logs
4. **Email**: Try user registration to test email sending
5. **Payments**: Test with Stripe test cards

## 📁 Project Structure

```
subscribify/
├── backend/           # Node.js API server
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   ├── middleware/    # Custom middleware
│   ├── utils/         # Utility functions
│   └── uploads/       # File upload directory
├── frontend/          # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   └── services/
│   └── public/
└── README.md
```

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**

   - Change PORT in backend/.env
   - Update VITE_API_URL in frontend/.env

2. **MongoDB connection failed**

   - Ensure MongoDB is running
   - Check connection string format
   - Verify network access for Atlas

3. **Stripe webhook errors**

   - Use ngrok for local webhook testing
   - Verify webhook secret matches

4. **Email not sending**
   - Check Gmail app password
   - Verify 2FA is enabled
   - Test with different email provider

### Getting Help

- Check the console logs for detailed error messages
- Ensure all environment variables are set correctly
- Verify all services (MongoDB, Stripe, Cloudinary) are properly configured

## 🎉 Next Steps

Once setup is complete:

1. Create an admin user account
2. Add some test products
3. Test the complete purchase flow
4. Set up subscription products
5. Test subscription management

## 🔒 Security Notes

- Change JWT_SECRET in production
- Use environment-specific Stripe keys
- Enable MongoDB authentication in production
- Use HTTPS in production
- Set up proper CORS origins

---

**Happy Coding! 🚀**

For more detailed information, check the main [README.md](README.md) file.
