const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [
      {
        product: {
          type: mongoose.Schema.ObjectId,
          ref: "Product",
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },
        price: {
          type: Number,
          required: true,
          min: [0, "Price cannot be negative"],
        },
        image: {
          type: String,
          required: true,
        },
      },
    ],
    shippingAddress: {
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      zipCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
        default: "India",
      },
    },
    paymentInfo: {
      id: {
        type: String,
        required: true,
      },
      status: {
        type: String,
        required: true,
      },
      method: {
        type: String,
        enum: ["stripe", "razorpay", "cod"],
        required: true,
      },
    },
    paidAt: {
      type: Date,
      required: true,
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    orderStatus: {
      type: String,
      required: true,
      enum: ["Processing", "Placed", "Shipped", "Delivered", "Cancelled"],
      default: "Processing",
    },
    deliveredAt: Date,
    trackingNumber: String,
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Calculate total price before saving
orderSchema.pre("save", function (next) {
  this.itemsPrice = this.orderItems.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  // Calculate tax (18% GST)
  this.taxPrice = Math.round(this.itemsPrice * 0.18 * 100) / 100;

  // Calculate shipping (free for orders above ₹500)
  this.shippingPrice = this.itemsPrice >= 500 ? 0 : 50;

  // Calculate total
  this.totalPrice = this.itemsPrice + this.taxPrice + this.shippingPrice;

  next();
});

module.exports = mongoose.model("Order", orderSchema);
