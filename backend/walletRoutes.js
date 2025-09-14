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
const { User, Profile } = require('./schema');
const Transaction = require('./models/Transaction');
const Withdrawal = require('./models/Withdrawal');

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

    const profile = await Profile.findOne({ userId: user._id });
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
      description: `Wallet deposit via Razorpay - Order: ${razorpay_order_id}`,
      status: 'completed',
      metadata: {
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        paymentMethod: 'razorpay',
        currency: 'INR'
      },
      processedAt: new Date()
    });
    await depositTransaction.save();

    // Check if this is the first deposit and user has a referrer
    if (profile.referral.referredBy && profile.wallet.totalDeposits === depositAmount) {
      // Find referrer and credit referral bonus
      const referrerProfile = await Profile.findOne({ 'referral.code': profile.referral.referredBy });
      
      if (referrerProfile) {
        if (!referrerProfile.wallet) {
          referrerProfile.wallet = {
            walletBalance: 0,
            referralBalance: 0,
            totalDeposits: 0,
            totalWithdrawals: 0
          };
        }
        
        const referralBonus = depositAmount * 0.2; // 20% of first deposit
        referrerProfile.wallet.referralBalance += referralBonus;
        
        // Create referral bonus transaction for referrer
        const referralTransaction = new Transaction({
          userId: referrerProfile.userId,
          type: 'referral_bonus',
          amount: referralBonus,
          description: `Referral bonus from ${profile.personalInfo?.firstName || 'User'}'s first deposit`,
          status: 'completed',
          metadata: {
            referredUserId: user._id,
            referredUserUid: uid,
            referredUserName: `${profile.personalInfo?.firstName || ''} ${profile.personalInfo?.lastName || ''}`.trim(),
            depositAmount: depositAmount
          },
          processedAt: new Date()
        });
        await referralTransaction.save();
        
        await referrerProfile.save();
      }
    }

    await profile.save();

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

    const profile = await Profile.findOne({ userId: user._id });
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
      await profile.save();
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

    const profile = await Profile.findOne({ userId: user._id });
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
    
    await profile.save();

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
      description: `Withdrawal request from ${type} balance`,
      status: 'pending',
      metadata: { 
        withdrawalId: withdrawal._id,
        withdrawalType: type
      }
    });
    await transaction.save();

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

    const profile = await Profile.findOne({ userId: user._id });
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
    const referredUsers = await Profile.find({ 
      'referral.referredBy': profile.referral.code 
    })
    .populate('userId', 'uid email')
    .select('personalInfo referral wallet')
    .sort({ createdAt: -1 });

    // Get total referral earnings
    const totalReferralEarnings = await Transaction.aggregate([
      { $match: { userId: user._id, type: 'referral_bonus' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      referralTransactions: referralTransactions,
      referredUsers: referredUsers.map(user => ({
        uid: user.userId.uid,
        email: user.userId.email,
        name: `${user.personalInfo?.firstName || ''} ${user.personalInfo?.lastName || ''}`.trim(),
        joinedAt: user.createdAt,
        hasDeposited: user.wallet?.totalDeposits > 0,
        totalDeposits: user.wallet?.totalDeposits || 0,
        referralBonus: user.wallet?.totalDeposits > 0 ? user.wallet.totalDeposits * 0.2 : 0
      })),
      totalReferralEarnings: totalReferralEarnings[0]?.total || 0,
      totalReferred: referredUsers.length,
      activeReferred: referredUsers.filter(user => user.wallet?.totalDeposits > 0).length
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

module.exports = router;
