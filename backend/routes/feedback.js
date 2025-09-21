const express = require('express');
const { body, validationResult } = require('express-validator');
const { sendEmail } = require('../utils/sendEmail');

const router = express.Router();

// Submit feedback
router.post('/submit', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('subject').trim().isLength({ min: 5 }).withMessage('Subject must be at least 5 characters'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, subject, message, rating, phone } = req.body;

    // Send feedback email to admin
    try {
      await sendEmail({
        email: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
        subject: `New Customer Feedback: ${subject}`,
        html: getFeedbackEmailTemplate({
          name,
          email,
          subject,
          message,
          rating,
          phone,
          submittedAt: new Date()
        })
      });

      // Send confirmation email to customer
      await sendEmail({
        email: email,
        subject: 'Thank you for your feedback - Subscribify',
        html: getFeedbackConfirmationTemplate(name)
      });

      res.status(200).json({
        success: true,
        message: 'Feedback submitted successfully. Thank you for your valuable input!'
      });
    } catch (emailError) {
      console.error('Feedback email failed:', emailError);
      res.status(500).json({
        success: false,
        message: 'Feedback received but email notification failed. We will still review your feedback.'
      });
    }
  } catch (error) {
    console.error('Feedback submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit feedback',
      error: error.message
    });
  }
});

// Email template for admin notification
const getFeedbackEmailTemplate = (feedback) => {
  const ratingStars = feedback.rating ? '★'.repeat(feedback.rating) + '☆'.repeat(5 - feedback.rating) : 'Not provided';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1976d2; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; background: #f9f9f9; border: 1px solid #e0e0e0; }
        .feedback-item { margin: 15px 0; padding: 15px; background: white; border-radius: 5px; border-left: 4px solid #1976d2; }
        .label { font-weight: bold; color: #1976d2; display: inline-block; width: 120px; }
        .rating { font-size: 20px; color: #ffa726; }
        .message-box { background: #fff; padding: 20px; border-radius: 5px; border: 1px solid #ddd; margin: 15px 0; }
        .footer { padding: 20px; text-align: center; color: #666; background: #f5f5f5; border-radius: 0 0 8px 8px; }
        .urgent { background: #ffebee; border-left-color: #f44336; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 New Customer Feedback</h1>
          <p>Received on ${feedback.submittedAt.toLocaleString()}</p>
        </div>
        <div class="content">
          <div class="feedback-item">
            <p><span class="label">Customer Name:</span> ${feedback.name}</p>
          </div>
          
          <div class="feedback-item">
            <p><span class="label">Email:</span> <a href="mailto:${feedback.email}">${feedback.email}</a></p>
          </div>
          
          ${feedback.phone ? `
          <div class="feedback-item">
            <p><span class="label">Phone:</span> ${feedback.phone}</p>
          </div>
          ` : ''}
          
          <div class="feedback-item">
            <p><span class="label">Subject:</span> ${feedback.subject}</p>
          </div>
          
          ${feedback.rating ? `
          <div class="feedback-item">
            <p><span class="label">Rating:</span> <span class="rating">${ratingStars}</span> (${feedback.rating}/5)</p>
          </div>
          ` : ''}
          
          <div class="feedback-item">
            <p><span class="label">Message:</span></p>
            <div class="message-box">
              ${feedback.message.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <div class="feedback-item" style="text-align: center; background: #e3f2fd;">
            <p><strong>📧 Reply to customer:</strong> <a href="mailto:${feedback.email}?subject=Re: ${feedback.subject}" style="color: #1976d2;">Click here to respond</a></p>
          </div>
        </div>
        <div class="footer">
          <p>This feedback was submitted through the Subscribify website feedback form.</p>
          <p>&copy; 2024 Subscribify Admin Panel</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Email template for customer confirmation
const getFeedbackConfirmationTemplate = (customerName) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4caf50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 30px; background: #f9f9f9; border: 1px solid #e0e0e0; }
        .highlight { background: #e8f5e8; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4caf50; }
        .footer { padding: 20px; text-align: center; color: #666; background: #f5f5f5; border-radius: 0 0 8px 8px; }
        .btn { display: inline-block; padding: 12px 24px; background: #1976d2; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Thank You for Your Feedback!</h1>
        </div>
        <div class="content">
          <h2>Hello ${customerName}!</h2>
          <p>Thank you for taking the time to share your feedback with us. Your input is incredibly valuable and helps us improve our services.</p>
          
          <div class="highlight">
            <h3>🎯 What happens next?</h3>
            <ul>
              <li>Our team will review your feedback within 24-48 hours</li>
              <li>If you've reported an issue, we'll work on resolving it promptly</li>
              <li>For suggestions, we'll consider them for future updates</li>
              <li>If you need a direct response, we'll get back to you via email</li>
            </ul>
          </div>
          
          <p>In the meantime, feel free to continue exploring our products and services:</p>
          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" class="btn">Continue Shopping</a>
          </div>
          
          <p>If you have any urgent concerns, please don't hesitate to contact our support team directly.</p>
          
          <p>Thank you for being a valued customer!</p>
          <p><strong>The Subscribify Team</strong></p>
        </div>
        <div class="footer">
          <p>This is an automated confirmation. Please do not reply to this email.</p>
          <p>&copy; 2024 Subscribify. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = router;