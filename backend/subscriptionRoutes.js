const express = require('express');
const router = express.Router();

// Import models
const { User } = require('./schema');
const Plan = require('./models/Plan');
// Subscriptions model removed: plans are stored in user.plans[]
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

// Get current user plan (from user.plans[])
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

    const now = new Date();
    const plans = user.plans || [];
    const activePlan = plans.find(p => p.status === 'active' && new Date(p.endDate) > now) || null;
    res.json({ success: true, subscription: activePlan });
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

    const profile = user.profile;
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

    // Check if user already has active plan in user's plans array
    const now = new Date();
    const hasActivePlan = (user.plans || []).some(p => p.status === 'active' && new Date(p.endDate) > now);
    if (hasActivePlan) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active plan'
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

    // Calculate subscription dates
    const startDate = new Date();
    const expiryDate = new Date(startDate.getTime() + (plan.duration * 24 * 60 * 60 * 1000));

    // Determine if this is the first plan before pushing
    const isFirstPlan = !Array.isArray(user.plans) || user.plans.length === 0;

    // Create plan entry
    const planEntry = {
      planId: plan._id,
      name: plan.name,
      price: plan.price,
      durationDays: plan.duration,
      startDate,
      endDate: expiryDate,
      status: 'active',
      assignedBy: 'user'
    };

    // Store original wallet balances for rollback
    const originalWalletBalance = profile.wallet.walletBalance;
    const originalReferralBalance = profile.wallet.referralBalance;

    try {
      // Deduct amounts from wallet
      profile.wallet.walletBalance -= paymentMethod.walletAmount;
      profile.wallet.referralBalance -= paymentMethod.referralAmount;

      // Push plan to user's plans array
      if (!Array.isArray(user.plans)) user.plans = [];
      user.plans.push(planEntry);
      
      // Mark first plan flag for the user
      if (isFirstPlan && !user.myFirstPlan) {
        user.myFirstPlan = true;
      }
      
      await user.save();
    } catch (e) {
      // Rollback wallet amounts if plan creation fails
      profile.wallet.walletBalance = originalWalletBalance;
      profile.wallet.referralBalance = originalReferralBalance;
      await user.save();
      throw new Error(`Failed to create plan: ${e.message}`);
    }

    // No separate Subscription model/profile badge needed; plans are stored on user

    // Process referral bonus for first plan purchase
    try {
      const { processFirstPayment } = require('./utils/simpleReferralUtils');
      
      if (isFirstPlan) {
        await processFirstPayment(user._id, plan.price, 'plan');
        console.log('🎉 First plan purchase processed - referral bonus credited if applicable');
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
        planId: plan._id,
        planName: plan.name,
        paymentMethod: paymentMethod
      },
      processedAt: new Date()
    });

    await transaction.save();

    console.log('Plan purchase successful:', {
      userId: user._id,
      planName: plan.name,
      planPrice: plan.price,
      userPlansCount: user.plans.length,
      myFirstPlan: user.myFirstPlan
    });
    
    res.json({ 
      success: true, 
      message: 'Plan purchased successfully', 
      plan: user.plans[user.plans.length - 1], 
      plans: user.plans 
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
