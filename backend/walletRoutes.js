const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');

// Initialize Razorpay (only if environment variables are available)
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} else {
  console.warn('Razorpay credentials not found. Payment features will be disabled.');
}

// Import models
const { User } = require('./schema');
const Transaction = require('./models/Transaction');
const Withdrawal = require('./models/Withdrawal');
const NotificationService = require('./utils/notificationService');

// Create Razorpay order for deposit
router.post('/razorpay-order', async (req, res) => {
  try {
    // Check if Razorpay is initialized
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: 'Payment service is currently unavailable. Please contact support.'
      });
    }

    const { amount, currency = 'INR' } = req.body;
    
    // Validate minimum deposit amount (amount is in paise)
    const MIN_DEPOSIT_AMOUNT_PAISE = 50000; // ₹500 in paise
    if (amount < MIN_DEPOSIT_AMOUNT_PAISE) {
      return res.status(400).json({
        success: false,
        message: 'Minimum deposit amount is ₹500'
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    const options = {
      amount: amount, // amount in paise
      currency: currency,
      receipt: `deposit_${Date.now()}`,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
});

// Verify Razorpay payment and credit wallet
router.post('/razorpay-verify', async (req, res) => {
  try {
    // Check if Razorpay is initialized
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: 'Payment service is currently unavailable. Please contact support.'
      });
    }

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, uid } = req.body;
    
    if (!uid) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Verify payment signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    if (signature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Get order details from Razorpay
    const order = await razorpay.orders.fetch(razorpay_order_id);
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (payment.status !== 'captured') {
      return res.status(400).json({
        success: false,
        message: 'Payment not captured'
      });
    }

    // Find user by uid
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const profile = user.profile;
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Initialize wallet if not exists
    if (!profile.wallet) {
      profile.wallet = {
        walletBalance: 0,
        referralBalance: 0,
        totalDeposits: 0,
        totalWithdrawals: 0
      };
    }

    const depositAmount = order.amount / 100; // Convert from paise to rupees
    
    // Credit wallet balance
    profile.wallet.walletBalance += depositAmount;
    profile.wallet.totalDeposits += depositAmount;

    // Create deposit transaction record
    const depositTransaction = new Transaction({
      userId: user._id,
      type: 'deposit',
      amount: depositAmount,
      balanceAfter: profile.wallet.walletBalance,
      description: `Wallet deposit via Razorpay - Order: ${razorpay_order_id}`,
      status: 'completed',
      source: 'razorpay',
      category: 'deposit',
      metadata: {
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        paymentMethod: 'razorpay',
        currency: 'INR',
        gateway: 'razorpay'
      },
      processedAt: new Date(),
      processedBy: 'user'
    });
    await depositTransaction.save();

    // Create notification for deposit
    try {
      const NotificationService = require('./utils/notificationService');
      await NotificationService.notifyDeposit(
        user._id,
        depositAmount,
        'Razorpay'
      );
      console.log('✅ Deposit notification sent');
    } catch (notifErr) {
      console.error('Error creating deposit notification:', notifErr);
      // Don't fail the entire deposit if notification creation fails
    }

    // Mark user's first deposit (does not complete referral; completion happens on first plan)
    if (!user.myFirstPayment) {
      user.myFirstPayment = true;
      user.myFirstPaymentAmount = depositAmount;
      user.myFirstPaymentDate = new Date();
    }

    // Note: Referral completion and bonus will be handled when user purchases a plan, not on deposit
    console.log('💳 Deposit processed - referral completion will happen on plan purchase');

    await user.save();

    res.json({
      success: true,
      message: 'Payment verified and wallet credited successfully',
      amount: depositAmount,
      newBalance: profile.wallet.walletBalance
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
});

// Get wallet balance
router.get('/balance/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const profile = user.profile;
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Initialize wallet if not exists
    if (!profile.wallet) {
      profile.wallet = {
        walletBalance: 0,
        referralBalance: 0,
        totalDeposits: 0,
        totalWithdrawals: 0
      };
      await user.save();
    }

    // Get transactions
    const transactions = await Transaction.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    // Calculate today's change
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayTransactions = await Transaction.find({
      userId: user._id,
      createdAt: { $gte: today, $lt: tomorrow },
      status: 'completed'
    });

    const todayDeposits = todayTransactions
      .filter(t => t.type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const todayWithdrawals = todayTransactions
      .filter(t => t.type === 'withdrawal')
      .reduce((sum, t) => sum + t.amount, 0);

    const todayChange = todayDeposits - todayWithdrawals;

    // Calculate actual totals from transactions
    const actualTotals = await Transaction.aggregate([
      { $match: { userId: user._id, status: 'completed' } },
      { $group: {
        _id: '$type',
        total: { $sum: '$amount' }
      }}
    ]);

    const actualDeposits = actualTotals.find(t => t._id === 'deposit')?.total || 0;
    const actualWithdrawals = actualTotals.find(t => t._id === 'withdrawal')?.total || 0;

    res.json({
      success: true,
      walletBalance: profile.wallet.walletBalance,
      referralBalance: profile.wallet.referralBalance,
      totalDeposits: actualDeposits,
      totalWithdrawals: actualWithdrawals,
      todayChange: todayChange,
      transactions: transactions
    });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wallet balance',
      error: error.message
    });
  }
});

// Create withdrawal request
router.post('/withdraw', async (req, res) => {
  try {
    const { uid, amount, type, accountDetails } = req.body;
    
    // Validate minimum withdrawal amount
    const MIN_WITHDRAWAL_AMOUNT = 500;
    if (amount < MIN_WITHDRAWAL_AMOUNT) {
      return res.status(400).json({
        success: false,
        message: `Minimum withdrawal amount is ₹${MIN_WITHDRAWAL_AMOUNT}`
      });
    }
    
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const profile = user.profile;
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Initialize wallet if not exists
    if (!profile.wallet) {
      profile.wallet = {
        walletBalance: 0,
        referralBalance: 0,
        totalDeposits: 0,
        totalWithdrawals: 0
      };
    }

    // Check sufficient balance
    const maxAmount = type === 'wallet' ? profile.wallet.walletBalance : profile.wallet.referralBalance;
    if (amount > maxAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient ${type} balance`
      });
    }

    // Check if user has made at least one deposit for referral withdrawal
    if (type === 'referral' && profile.wallet.totalDeposits === 0) {
      return res.status(400).json({
        success: false,
        message: 'You must make at least one deposit before withdrawing referral bonus'
      });
    }

    // Deduct amount from wallet (will be restored if rejected)
    if (type === 'wallet') {
      profile.wallet.walletBalance -= amount;
    } else {
      profile.wallet.referralBalance -= amount;
    }
    
    await user.save();

    // Create withdrawal request
    const withdrawal = new Withdrawal({
      userId: user._id,
      uid: user.uid,
      type,
      amount,
      accountDetails: type === 'wallet' ? accountDetails : {}
    });

    await withdrawal.save();

    // Create transaction record
    const transaction = new Transaction({
      userId: user._id,
      type: 'withdrawal',
      amount: amount,
      balanceAfter: type === 'wallet' ? profile.wallet.walletBalance : profile.wallet.referralBalance,
      description: `Withdrawal request from ${type} balance`,
      status: 'pending',
      source: 'withdrawal',
      category: 'withdrawal',
      metadata: {
        withdrawalId: withdrawal._id,
        withdrawalType: type,
        accountDetails: accountDetails
      },
      processedBy: 'user'
    });
    await transaction.save();

    // Create notification for withdrawal submission
    try {
      const NotificationService = require('./utils/notificationService');
      await NotificationService.notifyWithdrawalSubmitted(
        user._id,
        amount,
        type
      );
      console.log('✅ Withdrawal submission notification sent');
    } catch (notifErr) {
      console.error('Error creating withdrawal notification:', notifErr);
      // Don't fail the entire withdrawal if notification creation fails
    }

    res.json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      withdrawalId: withdrawal._id
    });
  } catch (error) {
    console.error('Error creating withdrawal request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create withdrawal request',
      error: error.message
    });
  }
});

// Get withdrawal history
router.get('/withdrawals/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const query = { userId: user._id };
    if (status) {
      query.status = status;
    }

    const withdrawals = await Withdrawal.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-accountDetails.accountNumber'); // Hide sensitive data

    const total = await Withdrawal.countDocuments(query);

    res.json({
      success: true,
      withdrawals,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching withdrawal history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch withdrawal history',
      error: error.message
    });
  }
});

// Get withdrawal details (for user)
router.get('/withdrawal/:withdrawalId', async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    
    const withdrawal = await Withdrawal.findById(withdrawalId)
      .select('-accountDetails.accountNumber'); // Hide sensitive data

    if (!withdrawal) {
      return res.status(404).json({
        success: false,
        message: 'Withdrawal not found'
      });
    }

    res.json({
      success: true,
      withdrawal
    });
  } catch (error) {
    console.error('Error fetching withdrawal details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch withdrawal details',
      error: error.message
    });
  }
});

// Get referral history for a user
router.get('/referral-history/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const profile = user.profile;
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Get referral transactions (referral bonuses earned)
    const referralTransactions = await Transaction.find({ 
      userId: user._id, 
      type: 'referral_bonus' 
    })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    // Get users who used this user's referral code
    const referredUsers = await User.find({ 
      'referredByCode': user.myReferralCode 
    })
    .select('uid email profile.personalInfo profile.wallet createdAt')
    .sort({ createdAt: -1 });

    // Get total referral earnings
    const totalReferralEarnings = await Transaction.aggregate([
      { $match: { userId: user._id, type: 'referral_bonus' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      referralTransactions: referralTransactions,
      referredUsers: referredUsers.map(referredUser => ({
        uid: referredUser.uid,
        email: referredUser.email,
        name: `${referredUser.profile?.personalInfo?.firstName || ''} ${referredUser.profile?.personalInfo?.lastName || ''}`.trim(),
        joinedAt: referredUser.createdAt,
        hasDeposited: referredUser.profile?.wallet?.totalDeposits > 0,
        totalDeposits: referredUser.profile?.wallet?.totalDeposits || 0,
        referralBonus: referredUser.profile?.wallet?.totalDeposits > 0 ? referredUser.profile.wallet.totalDeposits * 0.2 : 0
      })),
      totalReferralEarnings: totalReferralEarnings[0]?.total || 0,
      totalReferred: referredUsers.length,
      activeReferred: referredUsers.filter(user => user.profile?.wallet?.totalDeposits > 0).length
    });
  } catch (error) {
    console.error('Error fetching referral history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch referral history',
      error: error.message
    });
  }
});

// Submit UPI deposit request
router.post('/upi-deposit', async (req, res) => {
  try {
    const { uid, upiTransactionId, amount } = req.body;
    if (!uid || !upiTransactionId || !amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Missing or invalid fields' });
    }

    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!user.profile) user.profile = {};
    if (!user.profile.upiDeposits) user.profile.upiDeposits = [];

    // Create a new UPI deposit entry
    user.profile.upiDeposits.push({ upiTransactionId, amount, status: 'pending' });
    await user.save();

    // Notify user
    await NotificationService.createNotification(
      user._id,
      'custom',
      'UPI Transaction Under Process',
      'UPI transaction under process, money will be added to your wallet within 24 hours',
      { relatedType: 'transaction', metadata: { upiTransactionId, amount, method: 'upi' } }
    );

    return res.json({ success: true, message: 'UPI deposit submitted', upiDeposits: user.profile.upiDeposits });
  } catch (error) {
    console.error('UPI deposit submit error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit UPI deposit', error: error.message });
  }
});

// Admin: list UPI deposits for a user
router.get('/admin/upi-deposits/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, deposits: user.profile?.upiDeposits || [] });
  } catch (error) {
    console.error('List UPI deposits error:', error);
    return res.status(500).json({ success: false, message: 'Failed to list UPI deposits', error: error.message });
  }
});

// User: list own UPI deposit requests
router.get('/upi-deposits/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, deposits: user.profile?.upiDeposits || [] });
  } catch (error) {
    console.error('User list UPI deposits error:', error);
    return res.status(500).json({ success: false, message: 'Failed to list UPI deposits', error: error.message });
  }
});

// Admin: process UPI deposit (complete or reject)
router.put('/admin/upi-deposits/:uid/:depositId', async (req, res) => {
  try {
    const { uid, depositId } = req.params;
    const { action, adminNote } = req.body; // action: 'complete' | 'reject'
    if (!['complete', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const entry = user.profile?.upiDeposits?.id(depositId);
    if (!entry) return res.status(404).json({ success: false, message: 'UPI deposit entry not found' });

    if (entry.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'This UPI request is already processed' });
    }

    entry.processedAt = new Date();
    entry.adminNote = adminNote || entry.adminNote;
    entry.processedBy = req.admin?._id?.toString() || 'admin';

    if (action === 'complete') {
      entry.status = 'completed';

      // Initialize wallet if needed
      if (!user.profile.wallet) {
        user.profile.wallet = { walletBalance: 0, referralBalance: 0, totalDeposits: 0, totalWithdrawals: 0, currency: 'INR' };
      }
      user.profile.wallet.walletBalance += entry.amount;
      user.profile.wallet.totalDeposits += entry.amount;

      // Create transaction
      const txn = new Transaction({
        userId: user._id,
        type: 'deposit',
        amount: entry.amount,
        balanceAfter: user.profile.wallet.walletBalance,
        description: `Wallet deposit via UPI - Ref: ${entry.upiTransactionId}`,
        status: 'completed',
        source: 'upi',
        category: 'deposit',
        metadata: { upiTransactionId: entry.upiTransactionId, method: 'upi' },
        processedAt: new Date(),
        processedBy: 'admin'
      });
      await txn.save();

      await NotificationService.notifyDeposit(user._id, entry.amount, 'UPI');
    } else {
      entry.status = 'rejected';
      await NotificationService.notifyCustom(
        user._id,
        'UPI Deposit Rejected',
        `Your UPI deposit request was rejected.${adminNote ? ' Reason: ' + adminNote : ''}`,
        'high'
      );
    }

    await user.save();
    return res.json({ success: true, message: 'UPI deposit updated', deposit: entry });
  } catch (error) {
    console.error('Process UPI deposit error:', error);
    return res.status(500).json({ success: false, message: 'Failed to process UPI deposit', error: error.message });
  }
});

module.exports = router;
