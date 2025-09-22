const Notification = require('../models/Notification');

class NotificationService {
  // Create a new notification
  static async createNotification(userId, type, title, message, options = {}) {
    try {
      const notification = new Notification({
        userId,
        type,
        title,
        message,
        priority: options.priority || 'medium',
        metadata: options.metadata || {},
        relatedId: options.relatedId || null,
        relatedType: options.relatedType || null,
        expiresAt: options.expiresAt || null
      });

      await notification.save();
      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  // Create referral pending notification
  static async notifyReferralPending(referrerId, referredUserEmail) {
    return await this.createNotification(
      referrerId,
      'referral_pending',
      'New Referral Added',
      `${referredUserEmail} used your referral code`,
      {
        priority: 'medium',
        metadata: { referredUserEmail },
        relatedType: 'referral'
      }
    );
  }

  // Create referral completed notification
  static async notifyReferralCompleted(referrerId, referredUserEmail, bonusAmount) {
    return await this.createNotification(
      referrerId,
      'referral_completed',
      'Referral Completed!',
      `${referredUserEmail} completed their first purchase. You earned ₹${bonusAmount} bonus!`,
      {
        priority: 'high',
        metadata: { referredUserEmail, bonusAmount },
        relatedType: 'referral'
      }
    );
  }

  // Create deposit notification
  static async notifyDeposit(userId, amount, paymentMethod) {
    return await this.createNotification(
      userId,
      'transaction_deposit',
      'Deposit Successful',
      `₹${amount} deposited successfully via ${paymentMethod}`,
      {
        priority: 'high',
        metadata: { amount, paymentMethod },
        relatedType: 'transaction'
      }
    );
  }

  // Create withdrawal submitted notification
  static async notifyWithdrawalSubmitted(userId, amount, type) {
    return await this.createNotification(
      userId,
      'transaction_withdrawal',
      'Withdrawal Request Submitted',
      `Withdrawal request of ₹${amount} from ${type} balance submitted`,
      {
        priority: 'medium',
        metadata: { amount, type },
        relatedType: 'withdrawal'
      }
    );
  }

  // Create withdrawal approved notification
  static async notifyWithdrawalApproved(userId, amount, type) {
    return await this.createNotification(
      userId,
      'withdrawal_approved',
      'Withdrawal Approved',
      `Your withdrawal of ₹${amount} from ${type} balance has been approved`,
      {
        priority: 'high',
        metadata: { amount, type },
        relatedType: 'withdrawal'
      }
    );
  }

  // Create withdrawal rejected notification
  static async notifyWithdrawalRejected(userId, amount, type, reason) {
    return await this.createNotification(
      userId,
      'withdrawal_rejected',
      'Withdrawal Rejected',
      `Your withdrawal of ₹${amount} from ${type} balance was rejected. Reason: ${reason}`,
      {
        priority: 'high',
        metadata: { amount, type, reason },
        relatedType: 'withdrawal'
      }
    );
  }

  // Create plan purchased notification
  static async notifyPlanPurchased(userId, planName, amount) {
    return await this.createNotification(
      userId,
      'plan_purchased',
      'Plan Purchased',
      `Successfully purchased ${planName} plan for ₹${amount}`,
      {
        priority: 'high',
        metadata: { planName, amount },
        relatedType: 'plan'
      }
    );
  }

  // Create plan assigned notification
  static async notifyPlanAssigned(userId, planName, assignedBy) {
    return await this.createNotification(
      userId,
      'plan_assigned',
      'Plan Assigned',
      `${planName} plan has been assigned to you by admin`,
      {
        priority: 'high',
        metadata: { planName, assignedBy },
        relatedType: 'plan'
      }
    );
  }

  // Create plan expiring notification
  static async notifyPlanExpiring(userId, planName, daysLeft) {
    return await this.createNotification(
      userId,
      'plan_expiring',
      'Plan Expiring Soon',
      `Your ${planName} plan will expire in ${daysLeft} days`,
      {
        priority: 'medium',
        metadata: { planName, daysLeft },
        relatedType: 'plan',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Expires in 7 days
      }
    );
  }

  // Create plan expired notification
  static async notifyPlanExpired(userId, planName) {
    return await this.createNotification(
      userId,
      'plan_expired',
      'Plan Expired',
      `Your ${planName} plan has expired`,
      {
        priority: 'high',
        metadata: { planName },
        relatedType: 'plan'
      }
    );
  }

  // Challenge notifications
  static async notifyChallengePurchased(userId, challengeName, amount) {
    return await this.createNotification(
      userId,
      'custom',
      'Challenge Purchased',
      `Successfully purchased ${challengeName} challenge for ₹${amount}`,
      {
        priority: 'high',
        metadata: { challengeName, amount },
        relatedType: 'challenge'
      }
    );
  }

  static async notifyChallengeStatus(userId, challengeName, status, adminNote = '') {
    return await this.createNotification(
      userId,
      'custom',
      `Challenge ${status}`,
      `Your challenge "${challengeName}" status updated to ${status}. ${adminNote}`.trim(),
      {
        priority: status === 'passed' ? 'high' : status === 'failed' ? 'urgent' : 'medium',
        metadata: { challengeName, status, adminNote },
        relatedType: 'challenge'
      }
    );
  }

  // Create trading account assigned notification
  static async notifyTradingAccountAssigned(userId, accountDetails) {
    return await this.createNotification(
      userId,
      'trading_account_assigned',
      'Trading Account Assigned',
      `Trading account has been assigned to you`,
      {
        priority: 'high',
        metadata: { accountDetails },
        relatedType: 'trading_account'
      }
    );
  }

  // Create custom notification
  static async notifyCustom(userId, title, message, priority = 'medium') {
    return await this.createNotification(
      userId,
      'custom',
      title,
      message,
      {
        priority,
        relatedType: 'user'
      }
    );
  }

  // Create system notification
  static async notifySystem(userId, title, message, priority = 'medium') {
    return await this.createNotification(
      userId,
      'system',
      title,
      message,
      {
        priority,
        relatedType: 'user'
      }
    );
  }

  // Get user notifications
  static async getUserNotifications(userId, limit = 10, skip = 0) {
    try {
      const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip);

      const unreadCount = await Notification.countDocuments({ 
        userId, 
        isRead: false 
      });

      return { notifications, unreadCount };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { notifications: [], unreadCount: 0 };
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId, userId) {
    try {
      await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { isRead: true }
      );
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(userId) {
    try {
      await Notification.updateMany(
        { userId, isRead: false },
        { isRead: true }
      );
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  // Clean up expired notifications
  static async cleanupExpired() {
    try {
      const result = await Notification.deleteMany({
        expiresAt: { $lt: new Date() }
      });
      console.log(`Cleaned up ${result.deletedCount} expired notifications`);
      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
      return 0;
    }
  }
}

module.exports = NotificationService;
