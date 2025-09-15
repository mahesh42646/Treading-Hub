const mongoose = require('mongoose');

const tradingAccountSchema = new mongoose.Schema({
  accountName: {
    type: String,
    required: true
  },
  brokerName: {
    type: String,
    required: true
  },
  serverId: {
    type: String,
    required: true
  },
  loginId: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  serverAddress: {
    type: String,
    default: ''
  },
  platform: {
    type: String,
    enum: ['MT4', 'MT5', 'TradingView', 'Custom'],
    default: 'MT4'
  },
  accountType: {
    type: String,
    enum: ['Demo', 'Live'],
    default: 'Demo'
  },
  balance: {
    type: Number,
    default: 0
  },
  leverage: {
    type: String,
    default: '1:100'
  },
  currency: {
    type: String,
    default: 'USD'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isAssigned: {
    type: Boolean,
    default: false
  },
  assignedTo: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    userEmail: {
      type: String,
      default: null
    },
    assignedAt: {
      type: Date,
      default: null
    }
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
tradingAccountSchema.index({ isAssigned: 1, isActive: 1 });
tradingAccountSchema.index({ 'assignedTo.userId': 1 });
tradingAccountSchema.index({ brokerName: 1 });

// Method to assign account to user
tradingAccountSchema.methods.assignToUser = function(userId, userEmail, subscriptionId) {
  this.isAssigned = true;
  this.assignedTo = {
    userId: userId,
    userEmail: userEmail,
    assignedAt: new Date()
  };
  this.subscriptionId = subscriptionId;
  return this.save();
};

// Method to unassign account
tradingAccountSchema.methods.unassign = function() {
  this.isAssigned = false;
  this.assignedTo = {
    userId: null,
    userEmail: null,
    assignedAt: null
  };
  this.subscriptionId = null;
  return this.save();
};

module.exports = mongoose.model('TradingAccount', tradingAccountSchema);
