const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { User } = require('./schema');
const Plan = require('./models/Plan');
const SupportTicket = require('./models/SupportTicket');

const router = express.Router();

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

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 1024, // 1GB limit
    fieldSize: 1024 * 1024 * 1024, // 1GB field size limit
    files: 10 // Allow up to 10 files
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Check if phone number exists
router.get('/check-phone/:phone', async (req, res) => {
  try {
    const { phone } = req.params;

    // Check if phone number exists in any profile
    const existingProfile = await User.findOne({ 'profile.personalInfo.phone': phone });
    
    res.json({
      success: true,
      exists: !!existingProfile,
      message: existingProfile ? 'Phone number already registered' : 'Phone number available'
    });
  } catch (error) {
    console.error('Error checking phone:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check phone number',
      error: error.message
    });
  }
});

// Check if PAN number exists
router.get('/check-pan/:panNumber', async (req, res) => {
  try {
    const { panNumber } = req.params;

    // Check if PAN number exists in any profile
    const existingProfile = await User.findOne({ 'profile.kyc.panCardNumber': panNumber });
    
    res.json({
      success: true,
      exists: !!existingProfile,
      message: existingProfile ? 'PAN number already registered' : 'PAN number available'
    });
  } catch (error) {
    console.error('Error checking PAN number:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check PAN number',
      error: error.message
    });
  }
});

// Check if email exists
router.get('/check-email/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const decodedEmail = decodeURIComponent(email);

    // Check if email exists in any user
    const existingUser = await User.findOne({ email: decodedEmail });
    
    res.json({
      success: true,
      exists: !!existingUser,
      message: existingUser ? 'Email already registered' : 'Email available'
    });
  } catch (error) {
    console.error('Error checking email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check email',
      error: error.message
    });
  }
});

// Link Google account to existing email account
router.post('/link-google', async (req, res) => {
  try {
    const { email, googleUid, emailVerified } = req.body;

    // Find existing user by email
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Update the user's UID to the Google UID
    existingUser.uid = googleUid;
    existingUser.emailVerified = emailVerified || existingUser.emailVerified;
    await existingUser.save();

    res.json({
      success: true,
      message: 'Google account linked successfully',
      user: {
        uid: existingUser.uid,
        email: existingUser.email,
        emailVerified: existingUser.emailVerified
      }
    });
  } catch (error) {
    console.error('Error linking Google account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to link Google account',
      error: error.message
    });
  }
});

// Create user account (step 1) - supports both email and Google registration
router.post('/create', async (req, res) => {
  try {
    const { uid, email, emailVerified, isGoogleUser, referredBy, _debugId } = req.body;
    
    console.log('🔍 User creation request received:', {
      _debugId,
      uid,
      email,
      emailVerified,
      isGoogleUser,
      referredBy,
      bodyKeys: Object.keys(req.body),
      timestamp: new Date().toISOString()
    });

    // Check if user already exists
    const existingUser = await User.findOne({ uid });
    if (existingUser) {
      console.log('⚠️ User already exists:', {
        existingReferredBy: existingUser.referredBy,
        newReferredBy: referredBy,
        shouldUpdate: !existingUser.referredBy && referredBy
      });
      
      // If user exists but doesn't have referredBy and we have one, update it
      if (!existingUser.referredBy && referredBy) {
        console.log('🔄 Updating existing user with referral code:', referredBy);
        
        // Validate referral code first (new system on User.myReferralCode)
        const referrerUser = await User.findOne({ myReferralCode: referredBy });
        if (referrerUser) {
          existingUser.referredBy = referredBy;
          if (!existingUser.referredByCode) {
            existingUser.referredByCode = referredBy;
          }
          await existingUser.save();
          
          // Update referrer's pending count
          try {
            referrerUser.totalReferralsBy = (referrerUser.totalReferralsBy || 0) + 1;
            await referrerUser.save();
          } catch {}
          
          console.log('✅ Updated existing user with referral code and referrer stats');
        } else {
          console.log('❌ Invalid referral code, not updating existing user');
        }
      }
      
      // User exists, update email verification status if needed
      if (emailVerified && !existingUser.emailVerified) {
        existingUser.emailVerified = true;
        await existingUser.save();
      }
      
      return res.status(200).json({
        success: true,
        message: 'User already exists',
        user: {
          uid: existingUser.uid,
          email: existingUser.email,
          emailVerified: existingUser.emailVerified,
          referredBy: existingUser.referredBy
        }
      });
    }

    // Simplified referral handling: don't validate via endpoint.
    // If referredBy code is provided, record it on the new user and try to attach a pending referral to the referrer if found.

    // Create new user
    const user = new User({
      uid,
      email,
      emailVerified: emailVerified || isGoogleUser || false,
      referredBy: referredBy || null
    });

    console.log('💾 About to save user with data:', {
      uid: user.uid,
      email: user.email,
      emailVerified: user.emailVerified,
      referredBy: user.referredBy
    });

    await user.save();
    
    console.log('✅ User saved successfully');

    // MANDATORY: Initialize referral code for new user
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let userReferralCode = '';
    let isUnique = false;
    let attempts = 0;
    
    // Generate unique referral code (max 10 attempts)
    while (!isUnique && attempts < 10) {
      userReferralCode = '';
      for (let i = 0; i < 10; i++) {
        userReferralCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      // Check if code is unique
      const existingUser = await User.findOne({ myReferralCode: userReferralCode });
      if (!existingUser) {
        isUnique = true;
      }
      attempts++;
    }
    
    if (!isUnique) {
      // Delete the user we just created since referral code generation failed
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate unique referral code. Please try again.'
      });
    }
    
    // Initialize all required referral fields
    user.myReferralCode = userReferralCode;
    user.myProfilePercent = 0;
    user.myFirstPayment = false;
    user.myFirstPlan = false;
    user.myFirstPaymentDate = null;
    user.myFirstPaymentAmount = 0;
    user.referrals = [];
    user.totalReferralsBy = 0;
    user.referredByCode = referredBy || null;
    
    await user.save();
    console.log('✅ User created with referral code:', userReferralCode);

    // If user was referred, add referral record (new system, no strict validation)
    if (referredBy) {
      try {
        const referrer = await User.findOne({ myReferralCode: referredBy });
        if (referrer) {
          const exists = (referrer.referrals || []).some(r => r.user?.toString() === user._id.toString());
          if (!exists) {
            referrer.referrals.push({
              user: user._id,
              refState: 'pending',
              firstPayment: false,
              firstPlan: false,
              firstPaymentAmount: 0,
              firstPaymentDate: null,
              bonusCredited: false,
              bonusAmount: 0,
              profileComplete: 0,
              joinedAt: new Date()
            });
            referrer.totalReferralsBy = (referrer.totalReferralsBy || 0) + 1;
            await referrer.save();
          }
          console.log('✅ Added referral record to referrer:', referrer._id);
        }
      } catch (referralError) {
        console.error('❌ Error adding referral record:', referralError);
        // Continue - user is already created with referral code
      }
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        referredBy: user.referredBy
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
});

// Create user with profile (new registration flow)
router.post('/create-with-profile', async (req, res) => {
  try {
    const { 
      uid, 
      email, 
      emailVerified, 
      firstName, 
      lastName, 
      gender, 
      dateOfBirth, 
      country, 
      city, 
      phone,
      referralCode 
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ uid });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Check if phone number already exists
    const existingPhone = await User.findOne({ 'profile.personalInfo.phone': phone });
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number already registered'
      });
    }

    // Create new user
    const user = new User({
      uid,
      email,
      emailVerified: emailVerified || false
    });

    await user.save();

    // Calculate profile completion percentage (75% without KYC)
    const completedFields = ['firstName', 'lastName', 'gender', 'dateOfBirth', 'country', 'city', 'phone'];
    const completionPercentage = 75; // 75% complete without KYC

    // Check if user was referred (from user record or provided referral code)
    let referredBy = user.referredBy || referralCode || null;
    
    // If referral code provided, validate it
    if (referredBy) {
      const referrerUser = await User.findOne({ 'myReferralCode': referredBy });
      if (referrerUser) {
        // Check if user is not referring themselves
        if (referrerUser._id.toString() === user._id.toString()) {
          referredBy = null; // Can't refer yourself
        }
      } else {
        referredBy = null; // Invalid referral code
      }
    }

    // Update user with profile information
    user.profile = {
      personalInfo: {
        firstName,
        lastName,
        gender,
        dateOfBirth: new Date(dateOfBirth),
        country,
        city,
        phone
      },
      status: {
        isActive: false, // Not active until KYC is completed
        completionPercentage: completionPercentage,
        completedFields: completedFields
      },
      kyc: {
        status: 'not_applied'
      },
      wallet: {
        walletBalance: 0,
        referralBalance: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
        currency: 'INR'
      }
    };

    // MANDATORY: Initialize referral code for new user
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let profileReferralCode = '';
    let isUnique = false;
    let attempts = 0;
    
    // Generate unique referral code (max 10 attempts)
    while (!isUnique && attempts < 10) {
      profileReferralCode = '';
      for (let i = 0; i < 10; i++) {
        profileReferralCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      // Check if code is unique
      const existingUser = await User.findOne({ myReferralCode: profileReferralCode });
      if (!existingUser) {
        isUnique = true;
      }
      attempts++;
    }
    
    if (!isUnique) {
      // Delete the user we just created since referral code generation failed
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate unique referral code. Please try again.'
      });
    }
    
    // Initialize all required referral fields
    user.myReferralCode = profileReferralCode;
    user.myProfilePercent = completionPercentage;
    user.myFirstPayment = false;
    user.myFirstPlan = false;
    user.myFirstPaymentDate = null;
    user.myFirstPaymentAmount = 0;
    user.referrals = [];
    user.totalReferralsBy = 0;
    user.referredByCode = referredBy || null;
    
    await user.save();
    
    console.log('✅ User created with referral code:', profileReferralCode);

    // If user was referred, add referral record
    if (referredBy) {
      try {
        const referrer = await User.findOne({ myReferralCode: referredBy });
        if (referrer) {
          referrer.referrals.push({
            user: user._id,
            refState: 'pending',
            firstPayment: false,
            firstPlan: false,
            firstPaymentAmount: 0,
            firstPaymentDate: null,
            bonusCredited: false,
            bonusAmount: 0,
            profileComplete: completionPercentage,
            joinedAt: new Date()
          });
          referrer.totalReferralsBy += 1;
          await referrer.save();
          console.log('✅ Added referral record to referrer:', referrer._id);
        }
      } catch (referralError) {
        console.error('❌ Error adding referral record:', referralError);
        // Continue - user is already created with referral code
      }
    }

    res.status(201).json({
      success: true,
      message: 'User and profile created successfully',
      user: {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified
      },
      profile: {
        firstName: profile.personalInfo.firstName,
        lastName: profile.personalInfo.lastName,
        phone: profile.personalInfo.phone,
        status: profile.status,
        kyc: profile.kyc
      }
    });
  } catch (error) {
    console.error('Error creating user with profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user and profile',
      error: error.message
    });
  }
});

// Get user profile
router.get('/profile/:uid', async (req, res) => {
  try {
    const { uid } = req.params;

    // Find user
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find profile
    const profile = user.profile;
    
    res.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        status: user.status,
        role: user.role
      },
      profile: profile || null
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
});

// Profile setup (step 2) - Store actual profile data in MongoDB
router.post('/profile-setup', async (req, res) => {
  try {
    console.log('🔍 Profile setup request received:', req.body);
    
    const { uid, firstName, lastName, gender, dateOfBirth, country, city, phone } = req.body;

    // Find user (user exists if they reached this page)
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found'
      });
    }

    // Validate phone number format (10 digits)
    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be exactly 10 digits'
      });
    }

    // Check if phone number is already registered
    const existingUser = await User.findOne({ 'profile.personalInfo.phone': phone });
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is already registered'
      });
    }

    // Generate referral code if missing
    if (!user.myReferralCode) {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 10; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      user.myReferralCode = code;
    }

    // Update user's embedded profile with actual data
    user.profile = {
      personalInfo: { 
        firstName, 
        lastName, 
        gender, 
        dateOfBirth: new Date(dateOfBirth), 
        country, 
        city, 
        phone 
      },
      status: { 
        isActive: true, 
        completionPercentage: 75, 
        completedFields: ['firstName', 'lastName', 'gender', 'dateOfBirth', 'country', 'city', 'phone'] 
      },
      kyc: { status: 'not_applied' },
      wallet: {
        walletBalance: 0,
        referralBalance: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
        currency: 'INR'
      },
      transactions: [],
      tradingStats: {
        totalTrades: 0,
        winningTrades: 0,
        totalProfit: 0,
        winRate: 0
      }
    };

    // Update user completion to 75%
    user.myProfilePercent = 75;
    user.emailVerified = true;

    // Save user with embedded profile
    await user.save();
    
    console.log('✅ Profile data stored successfully');

    res.status(201).json({
      success: true,
      message: 'Profile setup completed successfully',
      profile: { 
        firstName, 
        lastName, 
        gender, 
        country, 
        city, 
        phone, 
        referralCode: user.myReferralCode,
        completionPercentage: 75
      }
    });

  } catch (error) {
    console.error('❌ Profile setup error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to setup profile', 
      error: error.message
    });
  }
});

// Update profile
router.put('/profile/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const updateData = req.body;

    // Find user
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user profile
    Object.assign(user.profile, updateData);
    user.updatedAt = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: user.profile
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// Get user by referral code
router.get('/referral/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const user = await User.findOne({ myReferralCode: code });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Referral code not found'
      });
    }

    res.json({
      success: true,
      profile: {
        firstName: user.profile?.personalInfo?.firstName,
        lastName: user.profile?.personalInfo?.lastName,
        referralCode: user.myReferralCode
      }
    });
  } catch (error) {
    console.error('Error fetching referral:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch referral',
      error: error.message
    });
  }
});

// Update email verification status
router.put('/update-email-verification/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const { emailVerified } = req.body;

    // Find and update user
    const user = await User.findOneAndUpdate(
      { uid },
      { emailVerified },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If user has a profile, also update the profile's email verification status
    if (user.profile) {
      // Update KYC details
      if (user.profile.kyc) {
        user.profile.kyc.emailVerified = emailVerified;
      }

      // Update completed fields if email is now verified
      if (emailVerified && user.profile.status?.completedFields) {
        const completedFields = [...user.profile.status.completedFields];
        if (!completedFields.includes('emailVerified')) {
          completedFields.push('emailVerified');
        }
        user.profile.status.completedFields = completedFields;
      }

      await user.save();
    }

    res.json({
      success: true,
      message: 'Email verification status updated successfully',
      user: {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    console.error('Error updating email verification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update email verification status',
      error: error.message
    });
  }
});

// Add referral
router.post('/referral/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const { referralCode } = req.body;

    // Find user
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find profile
    const profile = user.profile;
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Find referrer
    const referrer = await User.findOne({ myReferralCode: referralCode });
    if (!referrer) {
      return res.status(404).json({
        success: false,
        message: 'Invalid referral code'
      });
    }

    // Check if user is trying to refer themselves
    if (referrer._id.toString() === user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot refer yourself'
      });
    }

    // Update profile with referral
    profile.referredBy = referralCode;
    await user.save();

    // Add to referrer's referrals list
    referrer.referrals.push(profile.referralCode);
    await referrer.save();

    res.json({
      success: true,
      message: 'Referral added successfully'
    });
  } catch (error) {
    console.error('Error adding referral:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add referral',
      error: error.message
    });
  }
});

// KYC Verification - Upload PAN card and profile photo
router.post('/kyc-verification/:uid', upload.fields([
  { name: 'panCardImage', maxCount: 1 },
  { name: 'profilePhoto', maxCount: 1 }
]), (req, res, next) => {
  // Handle multer errors
  if (req.fileValidationError) {
    return res.status(400).json({
      success: false,
      message: req.fileValidationError
    });
  }
  
  if (req.filesValidationError) {
    return res.status(400).json({
      success: false,
      message: req.filesValidationError
    });
  }
  
  next();
}, async (req, res) => {
  try {
    const { uid } = req.params;
    const { panCardNumber, panHolderName } = req.body;

    // Find user
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find profile
    const profile = user.profile;
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Check if PAN card number already exists in another profile (only if provided)
    if (panCardNumber) {
      const existingPanCardUser = await User.findOne({ 
        'profile.kyc.panCardNumber': panCardNumber,
        _id: { $ne: user._id } // Exclude current user
      });
      
      if (existingPanCardUser) {
        return res.status(400).json({
          success: false,
          message: 'This PAN card number is already registered with another account. Please use a different PAN card or contact support if this is an error.'
        });
      }
    }

    // Check if user is blocked
    if (user.status === 'blocked') {
      return res.status(403).json({
        success: false,
        message: 'Your account is blocked. You cannot apply for KYC verification.'
      });
    }

    // Update profile with KYC information
    const updateData = {};
    const completedFields = [...profile.status.completedFields];

    // Handle PAN card upload
    if (req.files && req.files.panCardImage) {
      if (!completedFields.includes('panCardImage')) {
        completedFields.push('panCardImage');
      }
    }

    // Handle profile photo upload
    if (req.files && req.files.profilePhoto) {
      if (!completedFields.includes('profilePhoto')) {
        completedFields.push('profilePhoto');
      }
    }

    // Handle PAN card number
    if (panCardNumber) {
      if (!completedFields.includes('panCardNumber')) {
        completedFields.push('panCardNumber');
      }
    }

    // Handle PAN holder name
    if (panHolderName) {
      if (!completedFields.includes('panHolderName')) {
        completedFields.push('panHolderName');
      }
    }

    // Check if email is verified
    if (user.emailVerified) {
      if (!completedFields.includes('emailVerified')) {
        completedFields.push('emailVerified');
      }
    }

    // Calculate completion percentage
    const totalFields = ['firstName', 'lastName', 'gender', 'dateOfBirth', 'country', 'city', 'phone', 'emailVerified', 'panCardNumber', 'panHolderName', 'panCardImage', 'profilePhoto'];
    const totalCompletion = Math.min(100, (completedFields.length / totalFields.length) * 100);

    // Update KYC object
    updateData.kyc = {
      status: 'applied',
      panCardNumber: panCardNumber || profile.kyc?.panCardNumber,
      panCardImage: req.files?.panCardImage ? req.files.panCardImage[0].filename : profile.kyc?.panCardImage,
      profilePhoto: req.files?.profilePhoto ? req.files.profilePhoto[0].filename : profile.kyc?.profilePhoto,
      panHolderName: panHolderName || profile.kyc?.panHolderName,
      rejectionNote: null,
      appliedAt: new Date(),
      approvedAt: profile.kyc?.approvedAt,
      rejectedAt: profile.kyc?.rejectedAt,
      approvedBy: profile.kyc?.approvedBy,
      rejectedBy: profile.kyc?.rejectedBy
    };

    // Update status
    updateData.status = {
      isActive: totalCompletion >= 70,
      completionPercentage: totalCompletion,
      completedFields: completedFields
    };

    // Update user profile
    Object.assign(user.profile, updateData);
    user.myProfilePercent = Math.round(user.profile.status.completionPercentage || 0);
    await user.save();

    res.json({
      success: true,
      message: 'KYC verification updated successfully',
      profile: {
        firstName: user.profile.personalInfo.firstName,
        lastName: user.profile.personalInfo.lastName,
        status: user.profile.status,
        kyc: user.profile.kyc
      }
    });
  } catch (error) {
    console.error('Error updating profile completion:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile completion',
      error: error.message
    });
  }
});

// Admin: Approve KYC verification
router.put('/admin/kyc-approve/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const { adminNotes } = req.body;

    // Find user
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find profile
    const profile = user.profile;
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Check if KYC is under review
    if (profile.kyc?.status !== 'applied') {
      return res.status(400).json({
        success: false,
        message: 'KYC is not under review'
      });
    }

    // Update KYC object
    profile.kyc.status = 'approved';
    profile.kyc.approvedAt = new Date();
    profile.kyc.approvedBy = 'admin'; // You can pass admin ID here

    // Update profile completion (set to 100% on approval)
    profile.status.completionPercentage = 100;
    profile.status.isActive = true;
    if (Array.isArray(profile.status.completedFields)) {
      const totalFields = ['firstName', 'lastName', 'gender', 'dateOfBirth', 'country', 'city', 'phone', 'emailVerified', 'panCardNumber', 'panHolderName', 'panCardImage', 'profilePhoto'];
      profile.status.completedFields = Array.from(new Set([...(profile.status.completedFields || []), ...totalFields]));
    }

    // Sync user.myProfilePercent to 100 as well
    try {
      user.myProfilePercent = 100;
      await user.save();
      const { updateProfileCompletion } = require('./utils/simpleReferralUtils');
      await updateProfileCompletion(user._id, 100);
    } catch (syncError) {
      console.warn('Warning: failed to sync user.myProfilePercent/update referral on KYC approve:', syncError?.message);
    }

    // Update profile completion details
    profile.profileCompletion.kycDetails.adminApproval = {
      approvedAt: new Date(),
      adminNotes: adminNotes || 'KYC verification approved',
      status: 'approved'
    };

    await user.save();

    res.json({
      success: true,
      message: 'KYC verification approved successfully',
      profile: {
        firstName: profile.personalInfo.firstName,
        lastName: profile.personalInfo.lastName,
        status: profile.status,
        kyc: profile.kyc
      }
    });
  } catch (error) {
    console.error('Error approving KYC:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve KYC',
      error: error.message
    });
  }
});

// Admin: Reject KYC verification
router.put('/admin/kyc-reject/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const { adminNotes, rejectionReason } = req.body;

    // Find user
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find profile
    const profile = user.profile;
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Check if KYC is under review
    if (profile.kyc?.status !== 'applied') {
      return res.status(400).json({
        success: false,
        message: 'KYC is not under review'
      });
    }

    // Update KYC object
    profile.kyc.status = 'rejected';
    profile.kyc.rejectedAt = new Date();
    profile.kyc.rejectedBy = 'admin'; // You can pass admin ID here
    profile.kyc.rejectionNote = rejectionReason || adminNotes || 'Document verification failed';

    // Update profile completion
    profile.profileCompletion.kycDetails.adminApproval = {
      rejectedAt: new Date(),
      adminNotes: adminNotes || 'KYC verification rejected',
      rejectionReason: rejectionReason || 'Document verification failed',
      status: 'rejected'
    };

    await user.save();

    res.json({
      success: true,
      message: 'KYC verification rejected',
      profile: {
        firstName: profile.personalInfo.firstName,
        lastName: profile.personalInfo.lastName,
        status: profile.status,
        kyc: profile.kyc
      }
    });
  } catch (error) {
    console.error('Error rejecting KYC:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject KYC',
      error: error.message
    });
  }
});

// Admin: Get all KYC pending users
router.get('/admin/kyc-pending', async (req, res) => {
  try {
    const users = await User.find({
      'profile.kyc.status': 'applied'
    }).select('uid email emailVerified profile.personalInfo profile.kyc createdAt');

    res.json({
      success: true,
      count: users.length,
      profiles: users.map(user => ({
        uid: user.uid,
        email: user.email,
        firstName: user.profile?.personalInfo?.firstName,
        lastName: user.profile?.personalInfo?.lastName,
        phone: user.profile?.personalInfo?.phone,
        kyc: user.profile?.kyc,
        status: user.profile?.status
      }))
    });
  } catch (error) {
    console.error('Error fetching KYC pending users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch KYC pending users',
      error: error.message
    });
  }
});

// Admin: Get KYC statistics
router.get('/admin/kyc-stats', async (req, res) => {
  try {
    const totalProfiles = await User.countDocuments({ 'profile': { $exists: true } });
    const notAppliedKYC = await User.countDocuments({ 'profile.kyc.status': 'not_applied' });
    const appliedKYC = await User.countDocuments({ 'profile.kyc.status': 'applied' });
    const approvedKYC = await User.countDocuments({ 'profile.kyc.status': 'approved' });
    const rejectedKYC = await User.countDocuments({ 'profile.kyc.status': 'rejected' });

    res.json({
      success: true,
      stats: {
        totalProfiles,
        notAppliedKYC,
        appliedKYC,
        approvedKYC,
        rejectedKYC
      }
    });
  } catch (error) {
    console.error('Error fetching KYC stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch KYC statistics',
      error: error.message
    });
  }
});

// Get all users (admin only)
router.get('/all', async (req, res) => {
  try {
    const users = await User.find().populate('profile');
    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Delete user (admin only)
router.delete('/:uid', async (req, res) => {
  try {
    const { uid } = req.params;

    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete user (profile is embedded, so it gets deleted with user)
    await User.findByIdAndDelete(user._id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

// ==================== REFERRAL SYSTEM ROUTES ====================

// Validate referral code
router.get('/referral/validate/:code', async (req, res) => {
  try {
    const { code } = req.params;

    // Find user with this referral code
    const referrerUser = await User.findOne({ 'myReferralCode': code });
    
    if (!referrerUser) {
      return res.status(404).json({
        success: false,
        message: 'Invalid referral code'
      });
    }

    res.json({
      success: true,
      message: 'Valid referral code',
      referrerName: `${referrerUser.profile?.personalInfo?.firstName || ''} ${referrerUser.profile?.personalInfo?.lastName || ''}`.trim(),
      referrerEmail: referrerUser?.email
    });
  } catch (error) {
    console.error('Error validating referral code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate referral code',
      error: error.message
    });
  }
});

// Get referral stats
router.get('/referral/stats', async (req, res) => {
  try {
    // Get user from session/token (implement your auth middleware)
    const userId = req.user?.id; // Implement your auth middleware
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const user = await User.findById(userId);

    if (!user || !user.profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Get all users referred by this user
    const referredUsers = await User.find({ 'referredByCode': user.myReferralCode });
    
    // Calculate stats
    const totalReferrals = referredUsers.length;
    const activeReferrals = referredUsers.filter(u => u.profile?.status?.completionPercentage >= 100).length;
    
    // Calculate earnings (₹200 per completed referral)
    const completedReferrals = referredUsers.filter(u => 
      u.profile?.status?.completionPercentage >= 100 && u.profile?.wallet?.totalDeposits > 0
    );
    const totalEarnings = completedReferrals.length * 200;
    
    // This month earnings
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const thisMonthReferrals = completedReferrals.filter(u => 
      u.updatedAt >= thisMonth
    );
    const thisMonthEarnings = thisMonthReferrals.length * 200;

    // Get detailed referral list
    const referrals = referredUsers.map(u => ({
      id: u._id,
      name: `${u.profile?.personalInfo?.firstName || ''} ${u.profile?.personalInfo?.lastName || ''}`.trim() || 'N/A',
      email: u.email || 'N/A',
      joinedDate: u.createdAt,
      status: u.profile?.status?.completionPercentage >= 100 ? 'active' : 'pending',
      profileCompletion: u.profile?.status?.completionPercentage || 0,
      depositMade: (u.profile?.wallet?.totalDeposits || 0) > 0,
      earnings: u.profile?.status?.completionPercentage >= 100 && (u.profile?.wallet?.totalDeposits || 0) > 0 ? 200 : 0
    }));

    res.json({
      success: true,
      totalReferrals,
      activeReferrals,
      totalEarnings,
      thisMonthEarnings,
      referrals
    });
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch referral stats',
      error: error.message
    });
  }
});

// ==================== WALLET SYSTEM ROUTES ====================

// Get wallet balance
router.get('/wallet/balance', async (req, res) => {
  try {
    // Get user from session/token (implement your auth middleware)
    const userId = req.user?.id; // Implement your auth middleware
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const user = await User.findById(userId);
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

    res.json({
      success: true,
      walletBalance: profile.wallet.walletBalance || 0,
      referralBalance: profile.wallet.referralBalance || 0,
      totalDeposits: profile.wallet.totalDeposits || 0,
      totalWithdrawals: profile.wallet.totalWithdrawals || 0,
      totalPnl: 0, // For future trading P&L
      transactions: [] // For future transaction history
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

// Create Razorpay order for deposit
router.post('/wallet/razorpay-order', async (req, res) => {
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
router.post('/wallet/razorpay-verify', async (req, res) => {
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

    // Check if this is the first deposit and user has a referrer
    if (user.referredByCode && profile.wallet.totalDeposits === depositAmount) {
      // Find referrer and credit referral bonus
      const referrerUser = await User.findOne({ 'myReferralCode': user.referredByCode });
      
      if (referrerUser && referrerUser.profile) {
        if (!referrerUser.profile.wallet) {
          referrerUser.profile.wallet = {
            walletBalance: 0,
            referralBalance: 0,
            totalDeposits: 0,
            totalWithdrawals: 0
          };
        }
        
        referrerUser.profile.wallet.referralBalance += 200; // ₹200 referral bonus
        await referrerUser.save();
      }
    }

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

// Withdraw from wallet
router.post('/wallet/withdraw', async (req, res) => {
  try {
    const { amount, type = 'wallet' } = req.body; // type: 'wallet' or 'referral'
    
    // Get user from session/token (implement your auth middleware)
    const userId = req.user?.id; // Implement your auth middleware
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (!amount || amount < 500) {
      return res.status(400).json({
        success: false,
        message: 'Minimum withdrawal amount is ₹500'
      });
    }

    const user = await User.findById(userId);
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

    let availableBalance = 0;
    
    if (type === 'wallet') {
      availableBalance = profile.wallet.walletBalance;
    } else if (type === 'referral') {
      // Check if user has made at least one deposit
      if (profile.wallet.totalDeposits === 0) {
        return res.status(400).json({
          success: false,
          message: 'You must make at least one deposit before withdrawing referral bonus'
        });
      }
      availableBalance = profile.wallet.referralBalance;
    }

    if (amount > availableBalance) {
      return res.status(400).json({
        success: false,
        message: `Insufficient ${type} balance`
      });
    }

    // Process withdrawal (in real implementation, integrate with payment gateway)
    if (type === 'wallet') {
      profile.wallet.walletBalance -= amount;
    } else {
      profile.wallet.referralBalance -= amount;
    }
    
    profile.wallet.totalWithdrawals += amount;
    await user.save();

    res.json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      amount,
      type,
      newBalance: type === 'wallet' ? profile.wallet.walletBalance : profile.wallet.referralBalance
    });
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process withdrawal',
      error: error.message
    });
  }
});

// ==================== PLANS API ROUTES ====================

// Get all active plans
router.get('/plans', async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ priority: 1, price: 1 });
    
    res.json({
      success: true,
      plans: plans
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plans',
      error: error.message
    });
  }
});

// Admin: Get all plans
router.get('/admin/plans', async (req, res) => {
  try {
    const plans = await Plan.find().sort({ priority: 1, createdAt: -1 });
    
    res.json({
      success: true,
      plans: plans
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plans',
      error: error.message
    });
  }
});

// Admin: Create new plan
router.post('/admin/plans', async (req, res) => {
  try {
    const planData = req.body;
    
    const plan = new Plan(planData);
    await plan.save();
    
    res.status(201).json({
      success: true,
      message: 'Plan created successfully',
      plan: plan
    });
  } catch (error) {
    console.error('Error creating plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create plan',
      error: error.message
    });
  }
});

// Admin: Update plan
router.put('/admin/plans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const planData = req.body;
    
    const plan = await Plan.findByIdAndUpdate(
      id,
      planData,
      { new: true, runValidators: true }
    );
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Plan updated successfully',
      plan: plan
    });
  } catch (error) {
    console.error('Error updating plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update plan',
      error: error.message
    });
  }
});

// Admin: Delete plan
router.delete('/admin/plans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const plan = await Plan.findByIdAndDelete(id);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Plan deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete plan',
      error: error.message
    });
  }
});

// ===== SUPPORT TICKET ROUTES =====

// Create support ticket
router.post('/support/ticket', async (req, res) => {
  try {
    const { subject, message, category, userId, userEmail } = req.body;

    // Validate required fields
    if (!subject || !message || !userId || !userEmail) {
      return res.status(400).json({
        success: false,
        message: 'Subject, message, userId, and userEmail are required'
      });
    }

    // Create support ticket with Firebase UID
    const ticket = new SupportTicket({
      userId: userId, // Use Firebase UID directly
      userEmail,
      subject,
      message,
      category: category || 'general',
      responses: [{
        from: 'user',
        message: message,
        timestamp: new Date()
      }]
    });

    await ticket.save();

    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      ticket: {
        id: ticket._id,
        ticketId: ticket.ticketId,
        subject: ticket.subject,
        category: ticket.category,
        status: ticket.status,
        createdAt: ticket.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create support ticket',
      error: error.message
    });
  }
});

// Get user's support tickets
router.get('/support/tickets/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user's tickets using Firebase UID
    const tickets = await SupportTicket.find({ userId: userId })
      .sort({ createdAt: -1 })
      .select('ticketId subject category status createdAt lastActivity');

    res.json({
      success: true,
      tickets: tickets
    });
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch support tickets',
      error: error.message
    });
  }
});

// Get specific ticket details
router.get('/support/ticket/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;

    const ticket = await SupportTicket.findOne({ ticketId })
      .populate('userId', 'uid email');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    res.json({
      success: true,
      ticket: ticket
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket',
      error: error.message
    });
  }
});

// Add response to ticket
router.post('/support/ticket/:ticketId/response', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message, from } = req.body;

    if (!message || !from) {
      return res.status(400).json({
        success: false,
        message: 'Message and from field are required'
      });
    }

    const ticket = await SupportTicket.findOne({ ticketId });
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Add response
    ticket.responses.push({
      from,
      message,
      timestamp: new Date()
    });

    // Update status if admin responds
    if (from === 'admin') {
      ticket.status = 'in_progress';
    }

    await ticket.save();

    res.json({
      success: true,
      message: 'Response added successfully',
      ticket: ticket
    });
  } catch (error) {
    console.error('Error adding response:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add response',
      error: error.message
    });
  }
});

// Update ticket status
router.put('/support/ticket/:ticketId/status', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const ticket = await SupportTicket.findOne({ ticketId });
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    ticket.status = status;
    
    if (status === 'resolved') {
      ticket.isResolved = true;
      ticket.resolvedAt = new Date();
    } else if (status === 'closed') {
      ticket.closedAt = new Date();
    }

    await ticket.save();

    res.json({
      success: true,
      message: 'Ticket status updated successfully',
      ticket: ticket
    });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ticket status',
      error: error.message
    });
  }
});

// Validate referral code - NEW UNIFIED SYSTEM
router.get('/referral/validate/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    // Find user by referral code (new system)
    const user = await User.findOne({ myReferralCode: code });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired referral code'
      });
    }

    // Get profile for additional info
    const profile = user.profile;
    
    res.json({
      success: true,
      referrerName: profile ? `${profile.personalInfo?.firstName || 'User'} ${profile.personalInfo?.lastName || ''}`.trim() : 'User',
      referrerId: user.uid,
      referralCode: code
    });
  } catch (error) {
    console.error('Error validating referral code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate referral code',
      error: error.message
    });
  }
});

// Get referral stats
router.get('/referral/stats/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Ensure user has a referral code
    if (!user.myReferralCode) {
      const { initializeUserReferral } = require('./utils/simpleReferralUtils');
      await initializeUserReferral(user._id);
      await user.reload?.();
    }

    // Build referral stats by querying users who used this user's code
    const referredUsers = await User.find({ referredByCode: user.myReferralCode });

    // Map referral data
    const referralsList = referredUsers.map(ru => {
      const name = ru.profile ? `${ru.profile.personalInfo?.firstName || ''} ${ru.profile.personalInfo?.lastName || ''}`.trim() : '';
      const phone = ru.profile?.personalInfo?.phone || 'N/A';
      const joinedAt = ru.createdAt || new Date();
      const completionPercentage = typeof ru.myProfilePercent === 'number' ? ru.myProfilePercent : 0;
      const hasDeposited = !!ru.myFirstPayment;
      const hasFirstPlan = !!ru.myFirstPlan;
      return {
        userId: ru._id,
        userName: name || ru.email || 'User',
        phone,
        completionPercentage,
        joinedAt,
        hasDeposited,
        hasFirstPlan,
        bonusEarned: 0
      };
    });

    // Compute counts
    const totalReferrals = referralsList.length;
    const completedReferrals = referralsList.filter(r => r.hasFirstPlan || r.hasDeposited).length;
    const pendingReferrals = totalReferrals - completedReferrals;

    // Compute total earnings from stored referrals array (if present)
    let totalEarnings = 0;
    if (Array.isArray(user.referrals) && user.referrals.length > 0) {
      totalEarnings = user.referrals.reduce((sum, r) => sum + (r.bonusAmount || 0), 0);
      // Map bonus amounts if possible
      const bonusMap = new Map(user.referrals.map(r => [r.user?.toString(), r.bonusAmount || 0]));
      referralsList.forEach(r => {
        const b = bonusMap.get(r.userId.toString());
        if (typeof b === 'number') r.bonusEarned = b;
      });
    }

    res.json({
      success: true,
      stats: {
        totalReferrals,
        completedReferrals,
        pendingReferrals,
        totalEarnings,
        referralCode: user.myReferralCode
      },
      referrals: referralsList
    });
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch referral stats',
      error: error.message
    });
  }
});

// Get wallet balance
router.get('/wallet/balance/:uid', async (req, res) => {
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

    // Get transaction history
    const Transaction = require('./models/Transaction');
    const transactions = await Transaction.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      walletBalance: profile.wallet.walletBalance,
      referralBalance: profile.wallet.referralBalance,
      totalDeposits: profile.wallet.totalDeposits,
      totalWithdrawals: profile.wallet.totalWithdrawals,
      transactions: transactions.map(t => ({
        id: t._id,
        type: t.type,
        amount: t.amount,
        description: t.description,
        status: t.status,
        date: t.createdAt
      }))
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


// Process deposit
router.post('/wallet/deposit', async (req, res) => {
  try {
    const { uid, amount, paymentId } = req.body;
    
    // Validate minimum deposit amount
    const MIN_DEPOSIT_AMOUNT = 500;
    if (amount < MIN_DEPOSIT_AMOUNT) {
      return res.status(400).json({
        success: false,
        message: `Minimum deposit amount is ₹${MIN_DEPOSIT_AMOUNT}`
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

    // Update wallet balance
    profile.wallet.walletBalance += amount;
    profile.wallet.totalDeposits += amount;
    await user.save();

    // Create transaction record
    const Transaction = require('./models/Transaction');
    const transaction = new Transaction({
      userId: user._id,
      type: 'deposit',
      amount: amount,
      description: `Wallet deposit via payment ID: ${paymentId}`,
      status: 'completed',
      metadata: { paymentId }
    });
    await transaction.save();

    console.log('ℹ️ Wallet deposit completed');

    res.json({
      success: true,
      message: 'Deposit successful',
      newBalance: profile.wallet.walletBalance
    });
  } catch (error) {
    console.error('Error processing deposit:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process deposit',
      error: error.message
    });
  }
});

// Debug endpoint to check user referral status
router.get('/debug/user/:uid', async (req, res) => {
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
    
    res.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        referredBy: user.referredBy,
        createdAt: user.createdAt
      },
      profile: profile ? {
        name: `${profile.personalInfo.firstName} ${profile.personalInfo.lastName}`,
        referral: profile.referral,
        createdAt: profile.createdAt
      } : null
    });
  } catch (error) {
    console.error('Error checking user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check user',
      error: error.message
    });
  }
});

// Legacy referral processing endpoint - now handled in user creation
// Keeping for backward compatibility but redirecting to proper flow

// Process withdrawal
router.post('/wallet/withdraw', async (req, res) => {
  try {
    const { uid, amount, type, accountDetails } = req.body; // type: 'wallet' or 'referral'
    
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

    // Validate withdrawal amount
    const availableBalance = type === 'wallet' ? profile.wallet.walletBalance : profile.wallet.referralBalance;
    if (amount > availableBalance) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    if (amount < 500) {
      return res.status(400).json({
        success: false,
        message: 'Minimum withdrawal amount is ₹500'
      });
    }

    // For referral withdrawal, check if user has made at least one deposit
    if (type === 'referral' && profile.wallet.totalDeposits === 0) {
      return res.status(400).json({
        success: false,
        message: 'You must make at least one deposit before withdrawing referral bonus'
      });
    }

    // Update wallet balance
    if (type === 'wallet') {
      profile.wallet.walletBalance -= amount;
    } else {
      profile.wallet.referralBalance -= amount;
    }
    profile.wallet.totalWithdrawals += amount;
    await user.save();

    // Create transaction record
    const Transaction = require('./models/Transaction');
    const transaction = new Transaction({
      userId: user._id,
      type: 'withdrawal',
      amount: amount,
      description: `Withdrawal from ${type} balance`,
      status: 'pending',
      metadata: { 
        withdrawalType: type,
        accountDetails: accountDetails
      }
    });
    await transaction.save();

    res.json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      transactionId: transaction._id
    });
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process withdrawal',
      error: error.message
    });
  }
});

// Get user's referral data - Simple unified approach
router.get('/profile/referral', async (req, res) => {
  try {
    const uid = req.headers['x-user-uid'];
    if (!uid) {
      return res.status(401).json({ error: 'No user ID provided' });
    }

    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Initialize referral fields if not present (for existing users)
    if (!user.myReferralCode) {
      const { initializeUserReferral } = require('./utils/simpleReferralUtils');
      await initializeUserReferral(user._id);
      // Refetch user with updated data
      const updatedUser = await User.findOne({ uid });
      if (updatedUser) {
        user.myReferralCode = updatedUser.myReferralCode;
        user.referrals = updatedUser.referrals || [];
        user.totalReferralsBy = updatedUser.totalReferralsBy || 0;
      }
    }

    const { getUserReferralStats } = require('./utils/simpleReferralUtils');
    const referralData = await getUserReferralStats(user._id);

    if (!referralData) {
      return res.status(500).json({ error: 'Failed to get referral data' });
    }

    // Get detailed referral info with profile data
    const detailedReferrals = [];
    for (const referral of user.referrals) {
      try {
        const referredUser = await User.findById(referral.user);
        
        if (referredUser) {
          detailedReferrals.push({
            userId: referral.user,
            userName: `${referredUser.profile?.personalInfo?.firstName || 'User'} ${referredUser.profile?.personalInfo?.lastName || ''}`.trim(),
            email: referredUser.email,
            phone: referredUser.profile?.personalInfo?.phone || 'Not provided',
            joinedAt: referral.joinedAt,
            profileCompletion: referral.profileComplete,
            hasFirstDeposit: referredUser.myFirstPayment,
            hasActivePlan: referredUser.myFirstPlan,
            planName: referredUser.profile?.subscription?.planName || null,
            planPrice: referredUser.profile?.subscription?.planPrice || 0,
            firstPaymentAmount: referral.firstPaymentAmount,
            firstPaymentDate: referral.firstPaymentDate,
            bonusEarned: referral.bonusAmount,
            bonusCreditedAt: referral.firstPaymentDate,
            status: referral.refState,
            referralComplete: referral.refState === 'completed'
          });
        }
      } catch (err) {
        console.error('Error processing referral:', err);
      }
    }

    res.json({
      referralCode: user.myReferralCode,
      stats: {
        totalReferrals: referralData.totalReferrals,
        completedReferrals: referralData.completedReferrals,
        pendingReferrals: referralData.pendingReferrals,
        totalEarnings: referralData.totalEarnings
      },
      referrals: detailedReferrals
    });

  } catch (error) {
    console.error('Error fetching referral data:', error);
    res.status(500).json({ error: 'Failed to fetch referral data' });
  }
});

module.exports = router;
