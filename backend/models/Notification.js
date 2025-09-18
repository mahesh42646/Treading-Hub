const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'referral_pending',      // New referral added
      'referral_completed',    // Referral completed
      'transaction_deposit',   // Deposit successful
      'transaction_withdrawal', // Withdrawal submitted
      'withdrawal_approved',   // Withdrawal approved
      'withdrawal_rejected',   // Withdrawal rejected
      'plan_purchased',        // Plan purchased
      'plan_assigned',         // Plan assigned by admin
      'plan_expiring',         // Plan expiring soon
      'plan_expired',          // Plan expired
      'trading_account_assigned', // Trading account assigned
      'custom',                // Custom notification
      'system'                 // System notification
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  relatedType: {
    type: String,
    enum: ['user', 'transaction', 'withdrawal', 'plan', 'referral', 'trading_account'],
    default: null
  },
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for better query performance
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Notification', notificationSchema);
