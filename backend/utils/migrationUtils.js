const { User } = require('../schema');

/**
 * Migrate existing users to new referral system
 */
async function migrateUsersToNewReferralSystem() {
  try {
    console.log('🔄 Starting user migration to new referral system...');

    // Find all users that don't have the new referral fields
    const usersToMigrate = await User.find({
      $or: [
        { myReferralCode: { $exists: false } },
        { referrals: { $exists: false } },
        { totalReferralsBy: { $exists: false } },
        { myFirstPayment: { $exists: false } },
        { myFirstPlan: { $exists: false } },
        { myProfilePercent: { $exists: false } }
      ]
    });

    console.log(`📊 Found ${usersToMigrate.length} users to migrate`);

    for (const user of usersToMigrate) {
      try {
        // Set default values for new fields
        const updates = {};
        
        if (!user.myReferralCode) {
          // Generate referral code
          const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
          let referralCode = '';
          for (let i = 0; i < 10; i++) {
            referralCode += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          
          // Ensure uniqueness
          let isUnique = false;
          while (!isUnique) {
            const existingUser = await User.findOne({ myReferralCode: referralCode });
            if (!existingUser) {
              isUnique = true;
            } else {
              referralCode = '';
              for (let i = 0; i < 10; i++) {
                referralCode += chars.charAt(Math.floor(Math.random() * chars.length));
              }
            }
          }
          updates.myReferralCode = referralCode;
        }

        if (!user.hasOwnProperty('referrals')) {
          updates.referrals = [];
        }

        if (!user.hasOwnProperty('totalReferralsBy')) {
          updates.totalReferralsBy = 0;
        }

        if (!user.hasOwnProperty('myFirstPayment')) {
          updates.myFirstPayment = false;
        }

        if (!user.hasOwnProperty('myFirstPlan')) {
          updates.myFirstPlan = false;
        }

        if (!user.hasOwnProperty('myProfilePercent')) {
          updates.myProfilePercent = 0;
        }

        if (!user.hasOwnProperty('myFirstPaymentDate')) {
          updates.myFirstPaymentDate = null;
        }

        if (!user.hasOwnProperty('myFirstPaymentAmount')) {
          updates.myFirstPaymentAmount = 0;
        }

        if (!user.hasOwnProperty('referredByCode')) {
          // Check if old referredBy field exists and migrate it
          if (user.referredBy) {
            updates.referredByCode = user.referredBy;
          } else {
            updates.referredByCode = null;
          }
        }

        // Update user with new fields
        await User.findByIdAndUpdate(user._id, { $set: updates });
        console.log(`✅ Migrated user: ${user.email} with code: ${updates.myReferralCode}`);

      } catch (userError) {
        console.error(`❌ Error migrating user ${user._id}:`, userError);
      }
    }

    console.log('🎉 User migration completed!');
    return { success: true, migratedCount: usersToMigrate.length };

  } catch (error) {
    console.error('❌ Migration failed:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  migrateUsersToNewReferralSystem
};
