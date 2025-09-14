const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uid: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['wallet', 'referral'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  accountDetails: {
    bankName: {
      type: String,
      required: function() {
        return this.type === 'wallet';
      }
    },
    accountNumber: {
      type: String,
      required: function() {
        return this.type === 'wallet';
      }
    },
    ifscCode: {
      type: String,
      required: function() {
        return this.type === 'wallet';
      }
    },
    accountHolderName: {
      type: String,
      required: function() {
        return this.type === 'wallet';
      }
    },
    upiId: {
      type: String,
      default: ''
    }
  },
  adminNotes: {
    type: String,
    default: ''
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  processedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient queries
withdrawalSchema.index({ userId: 1, status: 1 });
withdrawalSchema.index({ status: 1, createdAt: -1 });
withdrawalSchema.index({ uid: 1 });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
