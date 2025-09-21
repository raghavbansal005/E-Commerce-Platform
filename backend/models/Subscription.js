const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  },
  plan: {
    name: {
      type: String,
      required: true
    },
    interval: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
      required: true
    },
    intervalCount: {
      type: Number,
      default: 1
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    }
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'cancelled', 'expired'],
    default: 'active'
  },
  stripeSubscriptionId: {
    type: String,
    required: true
  },
  stripeCustomerId: {
    type: String,
    required: true
  },
  currentPeriodStart: {
    type: Date,
    required: true
  },
  currentPeriodEnd: {
    type: Date,
    required: true
  },
  nextBillingDate: {
    type: Date,
    required: true
  },
  shippingAddress: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true,
      default: 'India'
    }
  },
  deliveryHistory: [{
    deliveryDate: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['scheduled', 'shipped', 'delivered', 'failed'],
      default: 'scheduled'
    },
    trackingNumber: String,
    notes: String,
    orderId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Order'
    }
  }],
  pausedPeriods: [{
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    reason: String
  }],
  totalAmount: {
    type: Number,
    default: 0
  },
  totalDeliveries: {
    type: Number,
    default: 0
  },
  failedPayments: [{
    date: {
      type: Date,
      default: Date.now
    },
    amount: Number,
    reason: String,
    stripeInvoiceId: String
  }],
  notes: String,
  cancelledAt: Date,
  cancelReason: String
}, {
  timestamps: true
});

// Calculate next billing date
subscriptionSchema.methods.calculateNextBillingDate = function() {
  const currentDate = new Date(this.currentPeriodEnd);
  
  switch (this.plan.interval) {
    case 'weekly':
      currentDate.setDate(currentDate.getDate() + (7 * this.plan.intervalCount));
      break;
    case 'monthly':
      currentDate.setMonth(currentDate.getMonth() + this.plan.intervalCount);
      break;
    case 'quarterly':
      currentDate.setMonth(currentDate.getMonth() + (3 * this.plan.intervalCount));
      break;
    case 'yearly':
      currentDate.setFullYear(currentDate.getFullYear() + this.plan.intervalCount);
      break;
  }
  
  return currentDate;
};

// Check if subscription is due for renewal
subscriptionSchema.methods.isDueForRenewal = function() {
  return new Date() >= this.nextBillingDate && this.status === 'active';
};

// Pause subscription
subscriptionSchema.methods.pause = function(reason) {
  this.status = 'paused';
  this.pausedPeriods.push({
    startDate: new Date(),
    reason: reason || 'User requested'
  });
};

// Resume subscription
subscriptionSchema.methods.resume = function() {
  this.status = 'active';
  const lastPausedPeriod = this.pausedPeriods[this.pausedPeriods.length - 1];
  if (lastPausedPeriod && !lastPausedPeriod.endDate) {
    lastPausedPeriod.endDate = new Date();
  }
};

// Cancel subscription
subscriptionSchema.methods.cancel = function(reason) {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancelReason = reason || 'User requested';
};

module.exports = mongoose.model('Subscription', subscriptionSchema);