const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'deposit',           // Money added to wallet
      'withdrawal',        // Money withdrawn from wallet
      'withdrawal_rejected', // Withdrawal rejected by admin
      'plan_purchase',     // Plan purchased
      'referral_bonus',    // Referral bonus earned
      'admin_credit',      // Admin added money
      'admin_debit',       // Admin deducted money
      'profit',            // Trading profit
      'loss',              // Trading loss
      'refund',            // Refund processed
      'fee'                // Service fees
    ],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  balanceAfter: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  source: {
    type: String,
    enum: [
      'razorpay',          // Razorpay payment gateway
      'wallet',            // Internal wallet transfer
      'referral',          // Referral system
      'admin',             // Admin action
      'trading',           // Trading system
      'plan_purchase',     // Plan purchase
      'withdrawal',        // Withdrawal system
      'system'             // System generated
    ],
    required: true
  },
  category: {
    type: String,
    enum: [
      'deposit',           // Money coming in
      'withdrawal',        // Money going out
      'bonus',             // Bonus/earnings
      'purchase',          // Purchases
      'fee',               // Fees
      'adjustment'         // Admin adjustments
    ],
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  paymentId: {
    type: String,
    default: null
  },
  relatedTransactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    default: null
  },
  processedAt: {
    type: Date,
    default: null
  },
  processedBy: {
    type: String,
    enum: ['user', 'admin', 'system'],
    default: 'user'
  }
}, {
  timestamps: true
});

// Index for better query performance
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);