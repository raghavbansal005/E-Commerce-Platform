const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send email function
exports.sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `Subscribify <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html || options.message
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error(`Email could not be sent: ${error.message}`);
  }
};

// Email templates
exports.getWelcomeEmailTemplate = (name) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { padding: 20px; text-align: center; color: #666; }
        .btn { display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Subscribify!</h1>
        </div>
        <div class="content">
          <h2>Hello ${name}!</h2>
          <p>Thank you for joining Subscribify - your smart e-commerce and subscription platform.</p>
          <p>You can now:</p>
          <ul>
            <li>Browse our wide range of products</li>
            <li>Make one-time purchases</li>
            <li>Subscribe to your favorite products</li>
            <li>Manage your orders and subscriptions</li>
          </ul>
          <p>Start shopping now and discover amazing deals!</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="btn">Start Shopping</a>
        </div>
        <div class="footer">
          <p>&copy; 2024 Subscribify. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

exports.getOrderConfirmationTemplate = (order) => {
  const itemsHtml = order.orderItems.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>₹${item.price}</td>
      <td>₹${item.price * item.quantity}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; }
        .total { font-weight: bold; font-size: 18px; }
        .footer { padding: 20px; text-align: center; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Order Confirmed!</h1>
          <p>Order ID: ${order._id}</p>
        </div>
        <div class="content">
          <h2>Thank you for your order!</h2>
          <p>Your order has been confirmed and is being processed.</p>
          
          <h3>Order Details:</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <table>
            <tr><td>Items Total:</td><td>₹${order.itemsPrice}</td></tr>
            <tr><td>Tax:</td><td>₹${order.taxPrice}</td></tr>
            <tr><td>Shipping:</td><td>₹${order.shippingPrice}</td></tr>
            <tr class="total"><td>Total Amount:</td><td>₹${order.totalPrice}</td></tr>
          </table>
          
          <h3>Shipping Address:</h3>
          <p>
            ${order.shippingAddress.name}<br>
            ${order.shippingAddress.street}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
            ${order.shippingAddress.country}<br>
            Phone: ${order.shippingAddress.phone}
          </p>
        </div>
        <div class="footer">
          <p>We'll send you another email when your order ships!</p>
          <p>&copy; 2024 Subscribify. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

exports.getSubscriptionConfirmationTemplate = (subscription) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #8b5cf6; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .highlight { background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { padding: 20px; text-align: center; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Subscription Activated!</h1>
        </div>
        <div class="content">
          <h2>Your subscription is now active!</h2>
          <p>Thank you for subscribing to our service.</p>
          
          <div class="highlight">
            <h3>Subscription Details:</h3>
            <p><strong>Plan:</strong> ${subscription.plan.name}</p>
            <p><strong>Billing Cycle:</strong> ${subscription.plan.interval}</p>
            <p><strong>Amount:</strong> ₹${subscription.plan.price}</p>
            <p><strong>Next Billing Date:</strong> ${new Date(subscription.nextBillingDate).toLocaleDateString()}</p>
          </div>
          
          <p>Your first delivery will be processed shortly and you'll receive tracking information via email.</p>
          <p>You can manage your subscription anytime from your account dashboard.</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Subscribify. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};