const express = require('express');
const router = express.Router();

// Import models
const { User, Profile } = require('./schema');
const Plan = require('./models/Plan');
const Subscription = require('./models/Subscription');
const TradingAccount = require('./models/TradingAccount');
const Transaction = require('./models/Transaction');

// Get active plans
router.get('/plans/active', async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ priority: 1, price: 1 });
    res.json({
      success: true,
      plans
    });
  } catch (error) {
    console.error('Error fetching active plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plans',
      error: error.message
    });
  }
});

// Get current user subscription
router.get('/subscription/current/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const subscription = await Subscription.findOne({ 
      userId: user._id, 
      isActive: true,
      expiryDate: { $gt: new Date() }
    }).populate('planId');

    if (subscription) {
      res.json({
        success: true,
        subscription
      });
    } else {
      res.json({
        success: true,
        subscription: null
      });
    }
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription',
      error: error.message
    });
  }
});

// Purchase subscription
router.post('/subscription/purchase', async (req, res) => {
  try {
    const { planId, paymentMethod } = req.body;
    const userUid = req.user?.uid || req.body.uid; // From auth middleware or request body
    
    if (!userUid) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const user = await User.findOne({ uid: userUid });
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

    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found or inactive'
      });
    }

    // Check if user already has active subscription
    const existingSubscription = await Subscription.findOne({
      userId: user._id,
      isActive: true,
      expiryDate: { $gt: new Date() }
    });

    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active subscription'
      });
    }

    // Validate payment method
    const totalPayment = paymentMethod.walletAmount + paymentMethod.referralAmount;
    if (totalPayment < plan.price) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    // Check wallet balances
    if (paymentMethod.walletAmount > profile.wallet.walletBalance) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance'
      });
    }

    if (paymentMethod.referralAmount > profile.wallet.referralBalance) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient referral balance'
      });
    }

    // Deduct amounts from wallet
    profile.wallet.walletBalance -= paymentMethod.walletAmount;
    profile.wallet.referralBalance -= paymentMethod.referralAmount;

    // Calculate subscription dates
    const startDate = new Date();
    const expiryDate = new Date(startDate.getTime() + (plan.duration * 24 * 60 * 60 * 1000));

    // Create subscription
    const subscription = new Subscription({
      userId: user._id,
      planId: plan._id,
      planName: plan.name,
      planPrice: plan.price,
      duration: plan.duration,
      startDate,
      expiryDate,
      paymentMethod: {
        walletAmount: paymentMethod.walletAmount,
        referralAmount: paymentMethod.referralAmount,
        totalAmount: totalPayment
      },
      assignedBy: 'user',
      status: 'active'
    });

    await subscription.save();

    // Update profile with subscription badge
    profile.subscription = {
      planId: plan._id,
      planName: plan.name,
      startDate,
      expiryDate,
      isActive: true,
      assignedBy: 'user'
    };

    await profile.save();

    // Process referral bonus for first plan purchase
    try {
      const { processReferralBonus, ensureProfileReferral } = require('./utils/referralUtils');
      
      // Ensure profile has referral info from user
      await ensureProfileReferral(user, profile);
      
      // Check if this is the first plan purchase
      const priorSubscriptions = await Subscription.countDocuments({ 
        userId: user._id, 
        _id: { $ne: subscription._id },
        status: 'active'
      });
      
      const isFirstPlanPurchase = priorSubscriptions === 0;

      if (isFirstPlanPurchase) {
        const referralResult = await processReferralBonus(user, profile, plan.price, plan.name);
        if (referralResult.success) {
          console.log('🎉 Plan purchase referral bonus processed:', referralResult.bonus);
        }
      } else {
        console.log('ℹ️ Not first plan purchase - no referral bonus');
      }
    } catch (rbErr) {
      console.error('Referral bonus on plan purchase failed:', rbErr);
    }

    // Create transaction record
    const transaction = new Transaction({
      userId: user._id,
      type: 'subscription',
      amount: totalPayment,
      description: `Subscription purchase: ${plan.name} plan`,
      status: 'completed',
      metadata: {
        subscriptionId: subscription._id,
        planId: plan._id,
        planName: plan.name,
        paymentMethod: paymentMethod
      },
      processedAt: new Date()
    });

    await transaction.save();

    res.json({
      success: true,
      message: 'Subscription purchased successfully',
      subscription
    });
  } catch (error) {
    console.error('Error purchasing subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to purchase subscription',
      error: error.message
    });
  }
});

// Get user's trading account
router.get('/trading-account/user/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const tradingAccount = await TradingAccount.findOne({
      'assignedTo.userId': user._id,
      isActive: true
    });

    if (tradingAccount) {
      res.json({
        success: true,
        tradingAccount
      });
    } else {
      res.json({
        success: true,
        tradingAccount: null
      });
    }
  } catch (error) {
    console.error('Error fetching trading account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trading account',
      error: error.message
    });
  }
});

module.exports = router;
