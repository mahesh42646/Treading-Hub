const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  planName: {
    type: String,
    required: true
  },
  planPrice: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    required: true // days
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  paymentMethod: {
    walletAmount: {
      type: Number,
      default: 0
    },
    referralAmount: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    }
  },
  assignedBy: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  assignedByAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active'
  },
  autoRenew: {
    type: Boolean,
    default: false
  },
  tradingAccountAssigned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for better query performance
subscriptionSchema.index({ userId: 1, isActive: 1 });
subscriptionSchema.index({ expiryDate: 1 });
subscriptionSchema.index({ planId: 1 });

// Method to check if subscription is still valid
subscriptionSchema.methods.isValid = function() {
  return this.isActive && new Date() < this.expiryDate;
};

// Method to extend subscription
subscriptionSchema.methods.extend = function(days) {
  this.expiryDate = new Date(this.expiryDate.getTime() + (days * 24 * 60 * 60 * 1000));
  return this.save();
};

module.exports = mongoose.model('Subscription', subscriptionSchema);
