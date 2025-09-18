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
    console.log('processFirstPayment called:', { userId, amount, type });
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found for referral processing');
      return;
    }
    
    console.log('User found for referral processing:', {
      userId: user._id,
      referredByCode: user.referredByCode,
      myFirstPayment: user.myFirstPayment,
      myFirstPlan: user.myFirstPlan
    });

    // If this call is for a deposit and we've already marked first deposit, exit
    if (type !== 'plan' && user.myFirstPayment) {
      return;
    }

    // If this call is for a plan and we've already marked first plan, exit
    if (type === 'plan' && user.myFirstPlan) {
      return;
    }

    // Mark user's firsts
    if (type === 'deposit') {
      user.myFirstPayment = true;
      user.myFirstPaymentAmount = amount;
      user.myFirstPaymentDate = new Date();
    } else if (type === 'plan') {
      // Ensure first deposit fields exist if not set previously (for consistency)
      if (!user.myFirstPayment) {
        user.myFirstPayment = true;
        user.myFirstPaymentAmount = amount;
        user.myFirstPaymentDate = new Date();
      }
      user.myFirstPlan = true;
    }

    // If user was referred, credit bonus to referrer
    if (user.referredByCode) {
      console.log('User was referred, looking for referrer with code:', user.referredByCode);
      const referrer = await User.findOne({ myReferralCode: user.referredByCode });
      if (referrer) {
        console.log('Referrer found:', {
          referrerId: referrer._id,
          referrerEmail: referrer.email,
          referralsCount: referrer.referrals.length
        });
        const bonusAmount = Math.round(amount * 0.20); // 20% bonus
        
        // Initialize referrer's wallet if not exists
        if (!referrer.profile) {
          referrer.profile = {};
        }
        if (!referrer.profile.wallet) {
          referrer.profile.wallet = {
            walletBalance: 0,
            referralBalance: 0,
            totalDeposits: 0,
            totalWithdrawals: 0
          };
        }
        
        // Credit referral bonus to referrer's wallet
        referrer.profile.wallet.referralBalance += bonusAmount;
        
        // Update referrer's referral record
        const referralIndex = referrer.referrals.findIndex(
          ref => ref.user.toString() === userId.toString()
        );
        
        console.log('Looking for referral record:', {
          referralIndex,
          totalReferrals: referrer.referrals.length,
          lookingForUserId: userId
        });
        
        if (referralIndex !== -1) {
          console.log('Found referral record, updating for type:', type);
          // For deposits, only mark firstPayment; For plan, complete and credit bonus
          if (type === 'deposit') {
            if (!referrer.referrals[referralIndex].firstPayment) {
              referrer.referrals[referralIndex].firstPayment = true;
              referrer.referrals[referralIndex].firstPaymentAmount = amount;
              referrer.referrals[referralIndex].firstPaymentDate = new Date();
              console.log('Marked first payment for deposit');
            }
          } else if (type === 'plan') {
            referrer.referrals[referralIndex].firstPlan = true;
            referrer.referrals[referralIndex].refState = 'completed';
            // Credit bonus only if not yet credited
            if (!referrer.referrals[referralIndex].bonusCredited) {
              referrer.referrals[referralIndex].bonusCredited = true;
              referrer.referrals[referralIndex].bonusAmount = bonusAmount;
            }
            console.log('Marked first plan and completed referral');
          }
          
          await referrer.save();
          
          // Create transaction for referrer
          try {
            const Transaction = require('../models/Transaction');
            const referralTransaction = new Transaction({
              userId: referrer._id,
              type: 'referral_bonus',
              amount: bonusAmount,
              balanceAfter: referrer.profile.wallet.referralBalance,
              description: `Referral bonus: 20% of ₹${amount} from ${user.email}`,
              status: 'completed',
              source: 'referral',
              category: 'bonus',
              metadata: {
                referredUserId: userId,
                referredUserEmail: user.email,
                referralCode: user.referredByCode,
                originalAmount: amount,
                paymentType: type,
                bonusPercentage: 20
              },
              processedAt: new Date(),
              processedBy: 'system'
            });
            
            await referralTransaction.save();
          } catch (txnError) {
            console.error('❌ Error creating referral transaction:', txnError);
            // Continue without failing the whole process
          }

          // Create notification for referrer
          try {
            const NotificationService = require('./notificationService');
            await NotificationService.notifyReferralCompleted(
              referrer._id, 
              user.email, 
              bonusAmount
            );
            console.log('✅ Referral completion notification sent');
          } catch (notifError) {
            console.error('❌ Error creating referral notification:', notifError);
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
