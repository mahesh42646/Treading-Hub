const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { User, Profile } = require('./schema');

const router = express.Router();

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
    const existingProfile = await Profile.findOne({ phone });
    
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
    const existingProfile = await Profile.findOne({ panCardNumber: panNumber });
    
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
      phone 
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

    // Create profile
    const profile = new Profile({
      userId: user._id,
      firstName,
      lastName,
      gender,
      dateOfBirth: new Date(dateOfBirth),
      country,
      city,
      phone,
      profileCompletion: {
        percentage: completionPercentage,
        isActive: false, // Not active until KYC is completed
        completedFields: completedFields,
        kycStatus: 'pending'
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
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        profileCompletion: profile.profileCompletion
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
      phone: phone,
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

    // Create profile
    const profile = new Profile({
      userId: user._id,
      firstName,
      lastName,
      gender,
      dateOfBirth: new Date(dateOfBirth),
      country,
      city,
      phone,
      // Don't set panCardNumber to null initially to avoid unique constraint issues
      profileCompletion: {
        percentage: completionPercentage,
        isActive: completionPercentage >= 70,
        completedFields: completedFields,
        kycStatus: 'pending',
        kycDetails: {
          emailVerified: user.emailVerified || false,
          panCardVerified: false,
          profilePhotoUploaded: false
        }
      },
      kyc: {
        status: 'not_applied',
        panCardNumber: null,
        panCardImage: null,
        profilePhoto: null,
        panHolderName: null,
        rejectionNote: null,
        appliedAt: null,
        approvedAt: null,
        rejectedAt: null,
        approvedBy: null,
        rejectedBy: null
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
        firstName: profile.firstName,
        lastName: profile.lastName,
        gender: profile.gender,
        country: profile.country,
        city: profile.city,
        phone: profile.phone,
        referralCode: profile.referralCode,
        profileCompletion: profile.profileCompletion
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
        panCardNumber: panCardNumber,
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
    const completedFields = [...profile.profileCompletion.completedFields];
    const kycDetails = { ...profile.profileCompletion.kycDetails };

    // Handle PAN card upload
    if (req.files && req.files.panCardImage) {
      updateData.panCardImage = req.files.panCardImage[0].filename;
      if (!completedFields.includes('panCardImage')) {
        completedFields.push('panCardImage');
      }
      kycDetails.panCardVerified = true;
    }

    // Handle profile photo upload
    if (req.files && req.files.profilePhoto) {
      updateData.profilePhoto = req.files.profilePhoto[0].filename;
      if (!completedFields.includes('profilePhoto')) {
        completedFields.push('profilePhoto');
      }
      kycDetails.profilePhotoUploaded = true;
    }

    // Handle PAN card number
    if (panCardNumber) {
      updateData.panCardNumber = panCardNumber;
      if (!completedFields.includes('panCardNumber')) {
        completedFields.push('panCardNumber');
      }
    }

    // Handle PAN holder name
    if (panHolderName) {
      updateData.panHolderName = panHolderName;
      if (!completedFields.includes('panHolderName')) {
        completedFields.push('panHolderName');
      }
    }

    // Check if email is verified
    if (user.emailVerified) {
      kycDetails.emailVerified = true;
      if (!completedFields.includes('emailVerified')) {
        completedFields.push('emailVerified');
      }
    }

    // Calculate KYC completion
    const kycFields = ['emailVerified', 'panCardVerified', 'profilePhotoUploaded'];
    const completedKYCFields = kycFields.filter(field => kycDetails[field]);
    const kycCompletion = (completedKYCFields.length / kycFields.length) * 100;

    // Add submission timestamp and user details
    updateData.kycSubmission = {
      submittedAt: new Date(),
      submittedBy: user.uid,
      userEmail: user.email,
      userPhone: profile.phone
    };

    // Update completion percentage (75% base + KYC completion)
    const baseCompletion = 75;
    const kycContribution = (kycCompletion / 100) * 25; // KYC contributes 25% to total
    const totalCompletion = Math.min(100, baseCompletion + kycContribution);

    // Set KYC status based on submission
    let kycStatus = 'pending';
    if (panCardNumber || (req.files && (req.files.panCardImage || req.files.profilePhoto))) {
      // If user has submitted PAN number or uploaded files, set to under_review
      kycStatus = 'under_review';
    }

    // Update KYC object
    updateData.kyc = {
      status: kycStatus === 'under_review' ? 'applied' : 'not_applied',
      panCardNumber: panCardNumber || profile.kyc?.panCardNumber,
      panCardImage: updateData.panCardImage || profile.kyc?.panCardImage,
      profilePhoto: updateData.profilePhoto || profile.kyc?.profilePhoto,
      panHolderName: panHolderName || profile.kyc?.panHolderName,
      rejectionNote: null,
      appliedAt: kycStatus === 'under_review' ? new Date() : profile.kyc?.appliedAt,
      approvedAt: profile.kyc?.approvedAt,
      rejectedAt: profile.kyc?.rejectedAt,
      approvedBy: profile.kyc?.approvedBy,
      rejectedBy: profile.kyc?.rejectedBy
    };

    updateData.profileCompletion = {
      percentage: totalCompletion,
      isActive: totalCompletion >= 70,
      completedFields: completedFields,
      kycDetails: kycDetails
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
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        profileCompletion: updatedProfile.profileCompletion
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
        firstName: profile.firstName,
        lastName: profile.lastName,
        profileCompletion: profile.profileCompletion
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
        firstName: profile.firstName,
        lastName: profile.lastName,
        profileCompletion: profile.profileCompletion
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
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        kycSubmission: profile.kycSubmission,
        profileCompletion: profile.profileCompletion
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
    const pendingKYC = await Profile.countDocuments({ 'profileCompletion.kycStatus': 'pending' });
    const underReviewKYC = await Profile.countDocuments({ 'profileCompletion.kycStatus': 'under_review' });
    const approvedKYC = await Profile.countDocuments({ 'profileCompletion.kycStatus': 'approved' });
    const rejectedKYC = await Profile.countDocuments({ 'profileCompletion.kycStatus': 'rejected' });

    res.json({
      success: true,
      stats: {
        totalProfiles,
        pendingKYC,
        underReviewKYC,
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

module.exports = router;
