const { User } = require('../schema');
const mongoose = require('mongoose');

/**
 * Generate a unique referral code
 */
function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Initialize referral code for a user
 */
async function initializeUserReferral(userId) {
  try {
    const user = await User.findById(userId);
    if (!user || user.myReferralCode) {
      return; // Already has code
    }

    let referralCode;
    let isUnique = false;
    
    // Generate unique referral code
    while (!isUnique) {
      referralCode = generateReferralCode();
      const existingUser = await User.findOne({ myReferralCode: referralCode });
      if (!existingUser) {
        isUnique = true;
      }
    }

    user.myReferralCode = referralCode;
    await user.save();
    
    console.log('✅ Referral code initialized for user:', userId, 'Code:', referralCode);
    return referralCode;
  } catch (error) {
    console.error('❌ Error initializing referral code:', error);
  }
}

/**
 * Update user profile completion percentage
 */
async function updateProfileCompletion(userId, percentage) {
  try {
    const user = await User.findById(userId);
    if (user) {
      user.myProfilePercent = percentage;
      
      // Update this user's completion in referrer's referrals array
      if (user.referredByCode) {
        const referrer = await User.findOne({ myReferralCode: user.referredByCode });
        if (referrer) {
          const referralIndex = referrer.referrals.findIndex(
            ref => ref.user.toString() === userId.toString()
          );
          if (referralIndex !== -1) {
            referrer.referrals[referralIndex].profileComplete = percentage;
            await referrer.save();
          }
        }
      }
      
      await user.save();
      console.log('✅ Profile completion updated:', userId, percentage + '%');
    }
  } catch (error) {
    console.error('❌ Error updating profile completion:', error);
  }
}

/**
 * Add referral when user registers with referral code
 */
async function addReferral(newUserId, referralCode) {
  try {
    const newUser = await User.findById(newUserId);
    const referrer = await User.findOne({ myReferralCode: referralCode });
    
    if (!newUser || !referrer) {
      console.log('❌ User or referrer not found');
      return false;
    }

    // Set referral code for new user
    newUser.referredByCode = referralCode;
    await newUser.save();

    // Add to referrer's referrals array
    const referralRecord = {
      user: newUserId,
      refState: 'pending',
      firstPayment: false,
      firstPlan: false,
      firstPaymentAmount: 0,
      firstPaymentDate: null,
      bonusCredited: false,
      bonusAmount: 0,
      profileComplete: newUser.myProfilePercent || 0,
      joinedAt: new Date()
    };

    referrer.referrals.push(referralRecord);
    referrer.totalReferralsBy += 1;
    await referrer.save();

    console.log('✅ Referral added:', newUserId, 'referred by', referrer._id);
    return true;
  } catch (error) {
    console.error('❌ Error adding referral:', error);
    return false;
  }
}

/**
 * Process first payment and credit referral bonus
 */
async function processFirstPayment(userId, amount, type = 'deposit') {
  try {
    const user = await User.findById(userId);
    if (!user || user.myFirstPayment) {
      return; // Already processed first payment
    }

    // Mark user's first payment
    user.myFirstPayment = true;
    user.myFirstPaymentAmount = amount;
    user.myFirstPaymentDate = new Date();
    
    if (type === 'plan') {
      user.myFirstPlan = true;
    }

    // If user was referred, credit bonus to referrer
    if (user.referredByCode) {
      const referrer = await User.findOne({ myReferralCode: user.referredByCode });
      if (referrer) {
        const bonusAmount = Math.round(amount * 0.20); // 20% bonus
        
        // Update referrer's referral record
        const referralIndex = referrer.referrals.findIndex(
          ref => ref.user.toString() === userId.toString()
        );
        
        if (referralIndex !== -1) {
          referrer.referrals[referralIndex].refState = 'completed';
          referrer.referrals[referralIndex].firstPayment = true;
          referrer.referrals[referralIndex].firstPaymentAmount = amount;
          referrer.referrals[referralIndex].firstPaymentDate = new Date();
          referrer.referrals[referralIndex].bonusCredited = true;
          referrer.referrals[referralIndex].bonusAmount = bonusAmount;
          
          if (type === 'plan') {
            referrer.referrals[referralIndex].firstPlan = true;
          }
          
          await referrer.save();
          
          // Create transaction for referrer
          try {
            const Transaction = require('../models/Transaction');
            const referralTransaction = new Transaction({
              userId: referrer._id,
              type: 'referral_bonus',
              amount: bonusAmount,
              description: `Referral bonus: 20% of ₹${amount} from first ${type}`,
              status: 'completed',
              metadata: {
                referredUserId: userId,
                referralCode: user.referredByCode,
                originalAmount: amount,
                paymentType: type
              }
            });
            
            await referralTransaction.save();
          } catch (txnError) {
            console.error('❌ Error creating referral transaction:', txnError);
            // Continue without failing the whole process
          }
          console.log('✅ Referral bonus credited:', bonusAmount, 'to', referrer._id);
        }
      }
    }

    await user.save();
    console.log('✅ First payment processed for user:', userId);
  } catch (error) {
    console.error('❌ Error processing first payment:', error);
  }
}

/**
 * Get user referral stats
 */
async function getUserReferralStats(userId) {
  try {
    const user = await User.findById(userId).populate('referrals.user', 'email');
    if (!user) {
      return null;
    }

    const totalReferrals = user.referrals.length;
    const completedReferrals = user.referrals.filter(ref => ref.refState === 'completed').length;
    const pendingReferrals = totalReferrals - completedReferrals;
    const totalEarnings = user.referrals.reduce((sum, ref) => sum + (ref.bonusAmount || 0), 0);

    return {
      myReferralCode: user.myReferralCode,
      totalReferrals,
      completedReferrals,
      pendingReferrals,
      totalEarnings,
      referrals: user.referrals
    };
  } catch (error) {
    console.error('❌ Error getting referral stats:', error);
    return null;
  }
}

module.exports = {
  generateReferralCode,
  initializeUserReferral,
  updateProfileCompletion,
  addReferral,
  processFirstPayment,
  getUserReferralStats
};
