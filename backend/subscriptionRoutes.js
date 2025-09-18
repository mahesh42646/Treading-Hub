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
      
      // Mark first plan flag for the user (always set when plan is purchased)
      if (isFirstPlan) {
        user.myFirstPlan = true;
        user.myFirstPayment = true;
        user.myFirstPaymentAmount = plan.price;
        user.myFirstPaymentDate = new Date();
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
    if (isFirstPlan && user.referredByCode) {
      try {
        const { processFirstPayment } = require('./utils/simpleReferralUtils');
        
        console.log('Processing referral for user:', {
          userId: user._id,
          isFirstPlan,
          referredByCode: user.referredByCode,
          planPrice: plan.price
        });
        
        await processFirstPayment(user._id, plan.price, 'plan');
        console.log('🎉 First plan purchase processed - referral bonus credited if applicable');
      } catch (rbErr) {
        console.error('Referral bonus on plan purchase failed:', rbErr);
        // If referral processing fails, we should still try to complete the referral manually
        try {
          const referrer = await User.findOne({ myReferralCode: user.referredByCode });
          if (referrer) {
            const referralIndex = referrer.referrals.findIndex(
              ref => ref.user.toString() === user._id.toString()
            );
            
            if (referralIndex !== -1) {
              const referralRecord = referrer.referrals[referralIndex];
              referralRecord.firstPayment = true;
              referralRecord.firstPlan = true;
              referralRecord.refState = 'completed';
              
              const bonusAmount = Math.round(plan.price * 0.20);
              referralRecord.bonusCredited = true;
              referralRecord.bonusAmount = bonusAmount;
              
              // Add bonus to referrer's wallet
              if (!referrer.profile) {
                referrer.profile = {};
              }
              if (!referrer.profile.wallet) {
                referrer.profile.wallet = {
                  walletBalance: 0,
                  referralBalance: 0
                };
              }
              referrer.profile.wallet.referralBalance += bonusAmount;
              
              await referrer.save();
              console.log('✅ Referral processing completed manually after initial failure');
            }
          }
        } catch (manualErr) {
          console.error('Manual referral processing also failed:', manualErr);
        }
      }
    } else if (isFirstPlan) {
      console.log('ℹ️ First plan purchase but user was not referred - no referral bonus');
    } else {
      console.log('ℹ️ Not first plan purchase - no referral bonus');
    }

    // Create transaction record for plan purchase
    try {
      const transaction = new Transaction({
        userId: user._id,
        type: 'plan_purchase',
        amount: totalPayment,
        balanceAfter: profile.wallet.walletBalance + profile.wallet.referralBalance,
        description: `Plan purchase: ${plan.name} (₹${plan.price})`,
        status: 'completed',
        source: 'plan_purchase',
        category: 'purchase',
        metadata: {
          planId: plan._id,
          planName: plan.name,
          planPrice: plan.price,
          paymentMethod: paymentMethod,
          walletAmount: paymentMethod.walletAmount,
          referralAmount: paymentMethod.referralAmount
        },
        processedAt: new Date(),
        processedBy: 'user'
      });

      await transaction.save();
      console.log('✅ Plan purchase transaction recorded');
    } catch (txErr) {
      console.error('Transaction creation failed:', txErr);
      // Don't fail the entire purchase if transaction creation fails
      // The plan purchase should still succeed
    }

    console.log('Plan purchase successful:', {
      userId: user._id,
      planName: plan.name,
      planPrice: plan.price,
      userPlansCount: user.plans.length,
      myFirstPlan: user.myFirstPlan
    });
    
    // Final verification: Ensure referral was processed correctly
    if (isFirstPlan && user.referredByCode) {
      try {
        const referrer = await User.findOne({ myReferralCode: user.referredByCode });
        if (referrer) {
          const referralIndex = referrer.referrals.findIndex(
            ref => ref.user.toString() === user._id.toString()
          );
          
          if (referralIndex !== -1) {
            const referralRecord = referrer.referrals[referralIndex];
            if (referralRecord.refState !== 'completed') {
              console.log('⚠️ Referral not completed, fixing now...');
              referralRecord.firstPayment = true;
              referralRecord.firstPlan = true;
              referralRecord.refState = 'completed';
              
              if (!referralRecord.bonusCredited) {
                const bonusAmount = Math.round(plan.price * 0.20);
                referralRecord.bonusCredited = true;
                referralRecord.bonusAmount = bonusAmount;
                
                if (!referrer.profile) {
                  referrer.profile = {};
                }
                if (!referrer.profile.wallet) {
                  referrer.profile.wallet = {
                    walletBalance: 0,
                    referralBalance: 0
                  };
                }
                referrer.profile.wallet.referralBalance += bonusAmount;
              }
              
              await referrer.save();
              console.log('✅ Referral completion verified and fixed');
            }
          }
        }
      } catch (verifyErr) {
        console.error('Error verifying referral completion:', verifyErr);
      }
    }
    
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
