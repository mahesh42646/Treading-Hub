const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { User, Profile } = require('./schema');
const Plan = require('./models/Plan');

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
    const existingProfile = await Profile.findOne({ 'personalInfo.phone': phone });
    
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
    const existingProfile = await Profile.findOne({ 'kyc.panCardNumber': panNumber });
    
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
    const { uid, email, emailVerified, isGoogleUser } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ uid });
    if (existingUser) {
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
          emailVerified: existingUser.emailVerified
        }
      });
    }

    // Create new user
    const user = new User({
      uid,
      email,
      emailVerified: emailVerified || isGoogleUser || false
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified
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
    const existingPhone = await Profile.findOne({ phone });
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

    // Validate referral code if provided
    let referredBy = null;
    if (referralCode) {
      const referrerProfile = await Profile.findOne({ 'referral.code': referralCode });
      if (referrerProfile) {
        // Check if user is not referring themselves
        if (referrerProfile.userId.toString() !== user._id.toString()) {
          referredBy = referralCode;
        }
      }
    }

    // Create profile with new schema structure
    const profile = new Profile({
      userId: user._id,
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
      referral: {
        referredBy: referredBy
      },
      wallet: {
        walletBalance: 0,
        referralBalance: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
        currency: 'INR'
      }
    });

    await profile.save();

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
    const profile = await Profile.findOne({ userId: user._id });
    
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

// Profile setup (step 2) - basic profile without PAN card
router.post('/profile-setup', async (req, res) => {
  try {
    const {
      uid,
      firstName,
      lastName,
      gender,
      dateOfBirth,
      country,
      city,
      phone
    } = req.body;

    // Validate required fields
    if (!uid || !firstName || !lastName || !gender || !dateOfBirth || 
        !country || !city || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing'
      });
    }

    // Find user
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if profile already exists
    const existingProfile = await Profile.findOne({ userId: user._id });
    if (existingProfile) {
      return res.status(400).json({
        success: false,
        message: 'Profile already exists'
      });
    }

    // Check if phone number already exists in another profile
    const existingPhoneProfile = await Profile.findOne({ 
      'personalInfo.phone': phone,
      userId: { $ne: user._id } // Exclude current user
    });
    
    if (existingPhoneProfile) {
      return res.status(400).json({
        success: false,
        message: 'This phone number is already registered with another account. Please use a different phone number.'
      });
    }

    // Calculate profile completion percentage (75% for basic profile)
    const completedFields = ['firstName', 'lastName', 'gender', 'dateOfBirth', 'country', 'city', 'phone'];
    const completionPercentage = 75; // 75% complete without PAN card

    // Create profile with new schema structure
    const profile = new Profile({
      userId: user._id,
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
        isActive: completionPercentage >= 70,
        completionPercentage: completionPercentage,
        completedFields: completedFields
      },
      kyc: {
        status: 'not_applied'
      }
    });

    await profile.save();

    // Update user email verification status if needed
    if (!user.emailVerified) {
      user.emailVerified = true;
      await user.save();
    }

    res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      profile: {
        firstName: profile.personalInfo.firstName,
        lastName: profile.personalInfo.lastName,
        gender: profile.personalInfo.gender,
        country: profile.personalInfo.country,
        city: profile.personalInfo.city,
        phone: profile.personalInfo.phone,
        referralCode: profile.referral.code,
        status: profile.status,
        kyc: profile.kyc
      }
    });
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create profile',
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

    // Find and update profile
    const profile = await Profile.findOneAndUpdate(
      { userId: user._id },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile
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

    const profile = await Profile.findOne({ referralCode: code });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Referral code not found'
      });
    }

    res.json({
      success: true,
      profile: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        referralCode: profile.referralCode
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
    const profile = await Profile.findOne({ userId: user._id });
    if (profile) {
      const updateData = {};
      
      // Update KYC details
      if (profile.profileCompletion?.kycDetails) {
        updateData['profileCompletion.kycDetails.emailVerified'] = emailVerified;
      }

      // Update completed fields if email is now verified
      if (emailVerified && profile.profileCompletion?.completedFields) {
        const completedFields = [...profile.profileCompletion.completedFields];
        if (!completedFields.includes('emailVerified')) {
          completedFields.push('emailVerified');
        }
        updateData['profileCompletion.completedFields'] = completedFields;
      }

      if (Object.keys(updateData).length > 0) {
        await Profile.findOneAndUpdate(
          { userId: user._id },
          updateData,
          { new: true }
        );
      }
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
    const profile = await Profile.findOne({ userId: user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Find referrer
    const referrer = await Profile.findOne({ referralCode });
    if (!referrer) {
      return res.status(404).json({
        success: false,
        message: 'Invalid referral code'
      });
    }

    // Check if user is trying to refer themselves
    if (referrer.userId.toString() === user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot refer yourself'
      });
    }

    // Update profile with referral
    profile.referredBy = referralCode;
    await profile.save();

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
    const profile = await Profile.findOne({ userId: user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Check if PAN card number already exists in another profile (only if provided)
    if (panCardNumber) {
      const existingPanCardProfile = await Profile.findOne({ 
        'kyc.panCardNumber': panCardNumber,
        _id: { $ne: profile._id } // Exclude current profile
      });
      
      if (existingPanCardProfile) {
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

    const updatedProfile = await Profile.findOneAndUpdate(
      { userId: user._id },
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'KYC verification updated successfully',
      profile: {
        firstName: updatedProfile.personalInfo.firstName,
        lastName: updatedProfile.personalInfo.lastName,
        status: updatedProfile.status,
        kyc: updatedProfile.kyc
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
    const profile = await Profile.findOne({ userId: user._id });
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

    // Update profile completion
    profile.profileCompletion.kycDetails.adminApproval = {
      approvedAt: new Date(),
      adminNotes: adminNotes || 'KYC verification approved',
      status: 'approved'
    };

    await profile.save();

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
    const profile = await Profile.findOne({ userId: user._id });
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

    await profile.save();

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
    const profiles = await Profile.find({
      'kyc.status': 'applied'
    }).populate('userId', 'uid email emailVerified');

    res.json({
      success: true,
      count: profiles.length,
      profiles: profiles.map(profile => ({
        uid: profile.userId.uid,
        email: profile.userId.email,
        firstName: profile.personalInfo.firstName,
        lastName: profile.personalInfo.lastName,
        phone: profile.personalInfo.phone,
        kyc: profile.kyc,
        status: profile.status
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
    const totalProfiles = await Profile.countDocuments();
    const notAppliedKYC = await Profile.countDocuments({ 'kyc.status': 'not_applied' });
    const appliedKYC = await Profile.countDocuments({ 'kyc.status': 'applied' });
    const approvedKYC = await Profile.countDocuments({ 'kyc.status': 'approved' });
    const rejectedKYC = await Profile.countDocuments({ 'kyc.status': 'rejected' });

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

    // Delete profile if exists
    await Profile.findOneAndDelete({ userId: user._id });

    // Delete user
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

    // Find profile with this referral code
    const referrerProfile = await Profile.findOne({ 'referral.code': code });
    
    if (!referrerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Invalid referral code'
      });
    }

    // Get referrer user details
    const referrerUser = await User.findById(referrerProfile.userId);
    
    res.json({
      success: true,
      message: 'Valid referral code',
      referrerName: `${referrerProfile.personalInfo?.firstName || ''} ${referrerProfile.personalInfo?.lastName || ''}`.trim(),
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
    const profile = await Profile.findOne({ userId: user._id });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Get all profiles referred by this user
    const referredProfiles = await Profile.find({ 'referral.referredBy': profile.referral.code });
    
    // Calculate stats
    const totalReferrals = referredProfiles.length;
    const activeReferrals = referredProfiles.filter(p => p.status.completionPercentage >= 100).length;
    
    // Calculate earnings (₹200 per completed referral)
    const completedReferrals = referredProfiles.filter(p => 
      p.status.completionPercentage >= 100 && p.wallet?.totalDeposits > 0
    );
    const totalEarnings = completedReferrals.length * 200;
    
    // This month earnings
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const thisMonthReferrals = completedReferrals.filter(p => 
      p.updatedAt >= thisMonth
    );
    const thisMonthEarnings = thisMonthReferrals.length * 200;

    // Get detailed referral list
    const referrals = referredProfiles.map(p => ({
      id: p._id,
      name: `${p.personalInfo?.firstName || ''} ${p.personalInfo?.lastName || ''}`.trim() || 'N/A',
      email: p.personalInfo?.email || 'N/A',
      joinedDate: p.createdAt,
      status: p.status.completionPercentage >= 100 ? 'active' : 'pending',
      profileCompletion: p.status.completionPercentage,
      depositMade: (p.wallet?.totalDeposits || 0) > 0,
      earnings: p.status.completionPercentage >= 100 && (p.wallet?.totalDeposits || 0) > 0 ? 200 : 0
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
    
    // Get user from session/token (implement your auth middleware)
    const userId = req.user?.id; // Implement your auth middleware
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
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

    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    
    // Get user from session/token (implement your auth middleware)
    const userId = req.user?.id; // Implement your auth middleware
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
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

    // Update user's wallet
    const user = await User.findById(userId);
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
        
        referrerProfile.wallet.referralBalance += 200; // ₹200 referral bonus
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
    await profile.save();

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

module.exports = router;
