# Testing Guide - Payment & Analytics Fixes

## Quick Start

### 1. Restart Backend Server
```bash
cd backend
npm start
```

Expected output:
```
MongoDB connected successfully
Server running on port 5001
Environment: development
```

### 2. Clear Frontend Cache
- Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Or clear browser cache manually

---

## Test Case 1: Analytics Tab

### Steps:
1. Login to application
2. Navigate to "Spending Analytics" page
3. Observe dashboard loads without errors

### Expected Results:
- ✅ Page loads successfully
- ✅ No console errors
- ✅ Stats cards display:
  - Total Spending (₹)
  - Total Orders (count)
  - Average Order (₹)
  - Total Savings (₹)
- ✅ Monthly Spending Trend chart displays
- ✅ Spending by Category chart displays
- ✅ Recent Purchase Details table displays transactions

### If Issues Occur:
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab:
   - Look for `/api/analytics/dashboard` request
   - Verify response status is 200
   - Check response structure has `{ success: true, data: {...} }`

---

## Test Case 2: Payment Flow (One-Time Purchase)

### Prerequisites:
- Have at least 1 product in cart
- Have valid shipping address

### Steps:
1. Add product to cart
2. Click "Checkout"
3. Fill in shipping address:
   - Name: Test User
   - Phone: 9999999999
   - Email: test@example.com
   - Street: 123 Test St
   - City: Test City
   - State: Test State
   - ZIP: 12345
   - Country: India
4. Click "Next" to proceed to Payment
5. Enter test card details:
   - Card Number: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)
6. Click "Pay ₹[amount]"
7. Wait for payment to process

### Expected Results:
- ✅ Payment processes successfully
- ✅ Toast notification: "Payment successful!"
- ✅ Redirected to Orders page
- ✅ New order appears in list with status "Placed"
- ✅ Order status is NOT "Processing"
- ✅ Only ONE order created (no duplicates)

### If Issues Occur:

**Payment fails with error:**
1. Check browser console for error message
2. Verify Stripe keys in backend `.env`:
   - `STRIPE_SECRET_KEY` should start with `sk_test_`
   - `STRIPE_PUBLISHABLE_KEY` should start with `pk_test_`
3. Check server logs for payment intent creation errors

**Order shows "Processing" status:**
1. Wait 5-10 seconds (webhook may be delayed)
2. Refresh page
3. If still "Processing", check server logs for webhook errors
4. Verify `STRIPE_WEBHOOK_SECRET` is correct in `.env`

**Duplicate orders created:**
1. Check Orders page - should only see 1 new order
2. If duplicates exist, this indicates frontend is still creating orders
3. Verify `Checkout.jsx` `handlePaymentSuccess` doesn't call `ordersAPI.createOrder`

---

## Test Case 3: Webhook Processing

### Prerequisites:
- Backend running
- Stripe CLI installed (for local testing)

### Steps (Local Testing with Stripe CLI):

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Authenticate: `stripe login`
3. Forward webhooks:
   ```bash
   stripe listen --forward-to localhost:5001/api/payments/webhook
   ```
4. Note the webhook signing secret displayed
5. Update backend `.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_test_...
   ```
6. Restart backend server
7. Complete a payment (steps from Test Case 2)
8. Observe webhook processing in Stripe CLI output

### Expected Results:
- ✅ Stripe CLI shows webhook received
- ✅ Server logs show webhook processing
- ✅ Order status updates from "Processing" to "Placed" within seconds
- ✅ Webhook returns 200 status

### If Issues Occur:

**Webhook signature verification fails:**
1. Verify `STRIPE_WEBHOOK_SECRET` matches Stripe CLI output
2. Check server logs for "Webhook signature verification failed"
3. Ensure raw body middleware is in place (check `server.js`)

**Order status doesn't update:**
1. Check server logs for webhook handler errors
2. Verify Order model is imported in `payments.js`
3. Check MongoDB connection is active
4. Verify order exists with matching `paymentInfo.id`

---

## Test Case 4: Order Status Transitions

### Steps:
1. Complete a payment (Test Case 2)
2. Navigate to Orders page
3. Click on the new order
4. Observe order details

### Expected Results:
- ✅ Order status shows "Placed" (not "Processing")
- ✅ Payment status shows "succeeded"
- ✅ Order items are listed correctly
- ✅ Shipping address is populated
- ✅ Total amount matches checkout total

### If Issues Occur:
1. Check order creation response in Network tab
2. Verify `orderId` is returned from payment intent creation
3. Check MongoDB for order document:
   ```bash
   db.orders.findOne({ _id: ObjectId("...") })
   ```

---

## Test Case 5: Failed Payment

### Steps:
1. Add product to cart
2. Proceed to checkout and fill shipping address
3. Enter test card that will fail:
   - Card Number: `4000 0000 0000 0002`
   - Other details: same as successful payment
4. Click "Pay"
5. Observe error handling

### Expected Results:
- ✅ Payment fails with error message
- ✅ Error displayed to user
- ✅ Order status is "Cancelled" (not "Processing")
- ✅ User can retry payment

### If Issues Occur:
1. Check error message in browser
2. Verify webhook handler processes `payment_intent.payment_failed` event
3. Check order status in database

---

## Debugging Commands

### Check Backend Logs
```bash
# If using npm start, logs appear in terminal
# Look for:
# - "Payment succeeded: pi_..."
# - "Payment failed: pi_..."
# - "Webhook handler error: ..."
```

### Check MongoDB Orders
```bash
# Connect to MongoDB
mongo

# Use database
use subscribify

# Find recent orders
db.orders.find().sort({ createdAt: -1 }).limit(5)

# Find order by payment intent ID
db.orders.findOne({ "paymentInfo.id": "pi_..." })
```

### Check Stripe Dashboard
1. Go to https://dashboard.stripe.com
2. Navigate to Payments section
3. Find your test payment
4. Verify status is "Succeeded"
5. Check webhook delivery status

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Analytics page blank | API returns error | Check `/api/analytics/dashboard` response in Network tab |
| Payment fails immediately | Invalid Stripe keys | Verify `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` in `.env` |
| Order stuck in "Processing" | Webhook not processing | Check webhook signature verification, verify `STRIPE_WEBHOOK_SECRET` |
| Duplicate orders | Frontend creating order after payment | Verify `handlePaymentSuccess` doesn't call `ordersAPI.createOrder` |
| Charts not displaying | Data structure mismatch | Check response structure in Network tab, verify frontend data extraction |
| 404 on analytics endpoint | Route not registered | Verify `analyticsRoutes` imported in `server.js` |

---

## Performance Checks

### Analytics Query Performance
1. Open DevTools Network tab
2. Navigate to Analytics page
3. Check `/api/analytics/dashboard` request time
4. Should complete in < 500ms for typical data

### Payment Processing Time
1. Complete a payment
2. Check order status update time
3. Should transition from "Processing" to "Placed" within 5-10 seconds

---

## Rollback Instructions

If issues occur after deployment:

1. **Revert Backend Changes:**
   ```bash
   git checkout backend/routes/payments.js
   git checkout backend/routes/analytics.js
   git checkout backend/server.js
   npm start
   ```

2. **Revert Frontend Changes:**
   ```bash
   git checkout frontend/src/pages/SpendingAnalytics.jsx
   git checkout frontend/src/pages/Checkout.jsx
   git checkout frontend/src/components/payment/PaymentStep.jsx
   npm run dev
   ```

3. **Clear Browser Cache** and test

---

## Success Criteria

All tests pass when:
- ✅ Analytics tab loads without errors
- ✅ Payment completes successfully
- ✅ Order status transitions to "Placed"
- ✅ No duplicate orders created
- ✅ Webhook processes within 10 seconds
- ✅ Failed payments handled gracefully
