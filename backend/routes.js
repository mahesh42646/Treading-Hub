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
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Create user account (step 1) - supports both email and Google registration
router.post('/create', async (req, res) => {
  try {
    const { uid, email, emailVerified, isGoogleUser } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ uid });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
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

// Profile setup (step 2) - with optional PAN card upload
router.post('/profile-setup', upload.single('panCardImage'), async (req, res) => {
  try {
    const {
      uid,
      firstName,
      lastName,
      gender,
      dateOfBirth,
      country,
      city,
      phone,
      panCardNumber
    } = req.body;

    // Validate required fields (PAN card is optional)
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

    // Check if PAN card number already exists (only if provided)
    if (panCardNumber) {
      const existingPanCard = await Profile.findOne({ panCardNumber });
      if (existingPanCard) {
        return res.status(400).json({
          success: false,
          message: 'PAN card number already registered'
        });
      }
    }

    // Calculate profile completion percentage
    const completedFields = ['firstName', 'lastName', 'gender', 'dateOfBirth', 'country', 'city', 'phone'];
    let completionPercentage = (completedFields.length / 7) * 100; // 7 total fields including PAN card

    if (req.file) {
      completedFields.push('panCardImage');
      completionPercentage = 100;
    }

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
      panCardNumber: panCardNumber || null,
      panCardImage: req.file ? req.file.filename : null,
      profileCompletion: {
        percentage: completionPercentage,
        isActive: completionPercentage >= 70,
        completedFields: completedFields
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

// Update profile completion (for completing profile later)
router.post('/profile-completion/:uid', upload.single('panCardImage'), async (req, res) => {
  try {
    const { uid } = req.params;
    const { panCardNumber } = req.body;

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

    // Check if PAN card number already exists (only if provided)
    if (panCardNumber) {
      const existingPanCard = await Profile.findOne({ 
        panCardNumber,
        _id: { $ne: profile._id } // Exclude current profile
      });
      if (existingPanCard) {
        return res.status(400).json({
          success: false,
          message: 'PAN card number already registered'
        });
      }
    }

    // Update profile with PAN card information
    const updateData = {};
    const completedFields = [...profile.profileCompletion.completedFields];

    if (req.file) {
      updateData.panCardImage = req.file.filename;
      if (!completedFields.includes('panCardImage')) {
        completedFields.push('panCardImage');
      }
    }

    if (panCardNumber) {
      updateData.panCardNumber = panCardNumber;
      if (!completedFields.includes('panCardNumber')) {
        completedFields.push('panCardNumber');
      }
    }

    // Calculate new completion percentage
    const completionPercentage = Math.min(100, (completedFields.length / 7) * 100);

    updateData.profileCompletion = {
      percentage: completionPercentage,
      isActive: completionPercentage >= 70,
      completedFields: completedFields
    };

    const updatedProfile = await Profile.findOneAndUpdate(
      { userId: user._id },
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile completion updated successfully',
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
