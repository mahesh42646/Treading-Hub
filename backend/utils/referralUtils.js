const { User, Profile } = require('../schema');
const Transaction = require('../models/Transaction');

/**
 * Process referral bonus for first plan purchase
 * @param {Object} user - User who purchased the plan
 * @param {Object} profile - User's profile
 * @param {Number} planPrice - Price of the plan
 * @param {String} planName - Name of the plan
 * @returns {Object} Result of referral processing
 */
async function processReferralBonus(user, profile, planPrice, planName) {
  try {
    console.log('🔍 Processing referral bonus for plan purchase by user:', user.email);
    
    // Check if user was referred
    const referralCode = user.referredBy || profile?.referral?.referredBy;
    if (!referralCode) {
      console.log('❌ No referral code found for user');
      return { success: false, message: 'No referral code' };
    }

    // Check if this is their first plan purchase
    if (profile.referral?.hasCompletedFirstPayment) {
      console.log('❌ User has already completed first plan purchase');
      return { success: false, message: 'First plan purchase already processed' };
    }

    // Find referrer profile
    const referrerProfile = await Profile.findOne({ 'referral.code': referralCode });
    if (!referrerProfile) {
      console.log('❌ Referrer profile not found for code:', referralCode);
      return { success: false, message: 'Referrer not found' };
    }

    console.log('✅ Found referrer:', referrerProfile.personalInfo?.firstName);

    // Initialize referrer's referral and wallet if needed
    if (!referrerProfile.referral) {
      referrerProfile.referral = {
        totalReferrals: 0,
        completedReferrals: 0,
        pendingReferrals: 0,
        totalEarnings: 0,
        referrals: []
      };
    }

    if (!referrerProfile.wallet) {
      referrerProfile.wallet = {
        walletBalance: 0,
        referralBalance: 0,
        totalDeposits: 0,
        totalWithdrawals: 0
      };
    }

    // Calculate 20% bonus on plan price
    const referralBonus = Math.round(planPrice * 0.20);
    console.log('💰 Calculating referral bonus on plan purchase:', referralBonus, 'for plan:', planName);

    // Mark referred user's first plan purchase as completed
    if (!profile.referral) {
      profile.referral = {};
    }
    profile.referral.hasCompletedFirstPayment = true;
    profile.referral.firstPaymentAmount = planPrice;
    profile.referral.firstPaymentDate = new Date();
    profile.referral.bonusCredited = true;
    profile.referral.referredBy = referralCode; // Ensure it's set

    // Credit bonus to referrer
    referrerProfile.wallet.referralBalance += referralBonus;
    referrerProfile.referral.totalEarnings += referralBonus;

    // Update referral counts
    referrerProfile.referral.completedReferrals += 1;
    referrerProfile.referral.pendingReferrals = Math.max(0, referrerProfile.referral.pendingReferrals - 1);

    // Find and update referral record in referrer's list
    let referralIndex = referrerProfile.referral.referrals.findIndex(
      ref => ref.userId && ref.userId.toString() === user._id.toString()
    );

    const referralData = {
      userId: user._id,
      userName: `${profile.personalInfo?.firstName || 'User'} ${profile.personalInfo?.lastName || ''}`.trim(),
      phone: profile.personalInfo?.phone || 'Not provided',
      joinedAt: profile.createdAt || new Date(),
      completionPercentage: profile.status?.completionPercentage || 0,
      hasDeposited: true,
      firstPaymentAmount: planPrice,
      firstPaymentDate: new Date(),
      bonusEarned: referralBonus,
      bonusCreditedAt: new Date()
    };

    if (referralIndex === -1) {
      // Add new referral record
      referrerProfile.referral.referrals.push(referralData);
      console.log('✅ Added new referral record');
    } else {
      // Update existing referral record
      referrerProfile.referral.referrals[referralIndex] = {
        ...referrerProfile.referral.referrals[referralIndex],
        ...referralData
      };
      console.log('✅ Updated existing referral record');
    }

    // Save both profiles
    await profile.save();
    await referrerProfile.save();

    // Create referral bonus transaction
    const referralTransaction = new Transaction({
      userId: referrerProfile.userId,
      type: 'referral_bonus',
      amount: referralBonus,
      description: `Referral bonus: 20% of ₹${planPrice} from ${profile.personalInfo?.firstName || user.email}'s first plan purchase (${planName})`,
      status: 'completed',
      metadata: {
        referredUserId: user._id,
        referralCode: referralCode,
        originalAmount: planPrice,
        planName: planName,
        paymentType: 'plan_purchase'
      }
    });

    await referralTransaction.save();

    console.log('🎉 Referral bonus processed successfully');

    return {
      success: true,
      bonus: referralBonus,
      referrerName: referrerProfile.personalInfo?.firstName,
      referralCode: referralCode
    };

  } catch (error) {
    console.error('❌ Error processing referral bonus:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Add referral record when someone registers with a referral code
 * @param {Object} user - New user
 * @param {Object} profile - New user's profile
 * @param {String} referralCode - Referral code used
 */
async function addReferralRecord(user, profile, referralCode) {
  try {
    console.log('📝 Adding referral record for:', user.email, 'with code:', referralCode);

    const referrerProfile = await Profile.findOne({ 'referral.code': referralCode });
    if (!referrerProfile) {
      console.log('❌ Referrer profile not found');
      return false;
    }

    // Initialize referrer's referral object if needed
    if (!referrerProfile.referral) {
      referrerProfile.referral = {
        totalReferrals: 0,
        completedReferrals: 0,
        pendingReferrals: 0,
        totalEarnings: 0,
        referrals: []
      };
    }

    // Check if referral already exists
    const existingReferralIndex = referrerProfile.referral.referrals.findIndex(
      ref => ref.userId && ref.userId.toString() === user._id.toString()
    );

    if (existingReferralIndex === -1) {
      // Add new referral
      const referralData = {
        userId: user._id,
        userName: `${profile.personalInfo?.firstName || 'User'} ${profile.personalInfo?.lastName || ''}`.trim(),
        phone: profile.personalInfo?.phone || 'Not provided',
        joinedAt: new Date(),
        completionPercentage: profile.status?.completionPercentage || 0,
        hasDeposited: false,
        firstPaymentAmount: 0,
        firstPaymentDate: null,
        bonusEarned: 0,
        bonusCreditedAt: null
      };

      referrerProfile.referral.referrals.push(referralData);
      referrerProfile.referral.totalReferrals += 1;
      referrerProfile.referral.pendingReferrals += 1;

      await referrerProfile.save();
      console.log('✅ Added referral record successfully');
      return true;
    }

    console.log('ℹ️ Referral record already exists');
    return true;

  } catch (error) {
    console.error('❌ Error adding referral record:', error);
    return false;
  }
}

/**
 * Ensure profile has referredBy field from user
 * @param {Object} user - User object
 * @param {Object} profile - Profile object
 */
async function ensureProfileReferral(user, profile) {
  if (user.referredBy && (!profile.referral || !profile.referral.referredBy)) {
    if (!profile.referral) {
      profile.referral = {};
    }
    profile.referral.referredBy = user.referredBy;
    await profile.save();
    console.log('✅ Backfilled profile.referral.referredBy from user.referredBy');
  }
}

module.exports = {
  processReferralBonus,
  addReferralRecord,
  ensureProfileReferral
};
