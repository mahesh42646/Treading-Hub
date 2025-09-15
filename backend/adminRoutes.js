const express = require('express');
const router = express.Router();
const { verifyAdminAuth, adminLogin } = require('./adminAuth');
const multer = require('multer');
const path = require('path');

// Import models
const { User, Profile } = require('./schema');
const Plan = require('./models/Plan');
const FAQ = require('./models/FAQ');
const Team = require('./models/Team');
const Contact = require('./models/Contact');
const Referral = require('./models/Referral');
const Transaction = require('./models/Transaction');
const Blog = require('./models/Blog');
const News = require('./models/News');
const Withdrawal = require('./models/Withdrawal');
const Subscription = require('./models/Subscription');
const TradingAccount = require('./models/TradingAccount');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
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
  }
});

// Admin Authentication Routes
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const result = adminLogin(email, password);
  
  if (result.success) {
    res.cookie('adminToken', result.token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    res.json({ success: true, token: result.token });
  } else {
    res.status(401).json(result);
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('adminToken');
  res.json({ success: true, message: 'Logged out successfully' });
});

// Dashboard Analytics
router.get('/dashboard', verifyAdminAuth, async (req, res) => {
  try {
    // Basic counts
    const totalUsers = await User.countDocuments();
    const totalProfiles = await Profile.countDocuments();
    const pendingKyc = await Profile.countDocuments({ 'profileCompletion.kycStatus': 'under_review' });
    
    // Revenue calculations
    const totalRevenue = await Transaction.aggregate([
      { $match: { status: 'completed', type: 'deposit' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Additional analytics
    const totalWithdrawals = await Transaction.aggregate([
      { $match: { status: 'completed', type: 'withdrawal' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalReferralBonuses = await Transaction.aggregate([
      { $match: { status: 'completed', type: 'referral_bonus' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Recent data with better formatting
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('email uid createdAt');

    const recentTransactions = await Transaction.find()
      .populate('userId', 'email')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('amount type status createdAt userId');

    const recentContacts = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email subject message createdAt');

    // Growth data (last 7 days)
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const newUsersLast7Days = await User.countDocuments({
      createdAt: { $gte: last7Days }
    });

    const depositsLast7Days = await Transaction.aggregate([
      { 
        $match: { 
          status: 'completed', 
          type: 'deposit',
          createdAt: { $gte: last7Days }
        } 
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      totalUsers,
      totalProfiles,
      pendingKyc,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalWithdrawals: totalWithdrawals[0]?.total || 0,
      totalReferralBonuses: totalReferralBonuses[0]?.total || 0,
      newUsersLast7Days,
      depositsLast7Days: depositsLast7Days[0]?.total || 0,
      recentUsers: recentUsers.map(user => ({
        email: user.email,
        uid: user.uid,
        createdAt: user.createdAt.toLocaleDateString()
      })),
      recentTransactions: recentTransactions.map(tx => ({
        amount: tx.amount,
        type: tx.type,
        status: tx.status,
        userEmail: tx.userId?.email || 'Unknown',
        date: tx.createdAt.toLocaleDateString()
      })),
      recentContacts: recentContacts.map(contact => ({
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        date: contact.createdAt.toLocaleDateString()
      }))
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// User Management
router.get('/users', verifyAdminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { uid: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.status = status;
    }

    let usersQuery = User.find(query).sort({ createdAt: -1 });
    
    // Only apply pagination if limit is provided and less than 1000
    if (limit && parseInt(limit) < 1000) {
      usersQuery = usersQuery.skip(skip).limit(parseInt(limit));
    }
    
    const users = await usersQuery;

    // Get profiles for these users
    const userIds = users.map(user => user._id);
    const profiles = await Profile.find({ userId: { $in: userIds } });
    
    // Create a map of userId to profile
    const profileMap = {};
    profiles.forEach(profile => {
      profileMap[profile.userId.toString()] = profile;
    });

    // Get referral counts for each user using the same approach as user dashboard
    const referralCountMap = {};
    
    // For each user, calculate their referral counts
    for (const user of users) {
      const userProfile = profileMap[user._id.toString()];
      if (userProfile && userProfile.referral && userProfile.referral.code) {
        // Find all profiles that were referred by this user's code
        const referredProfiles = await Profile.find({ 
          'referral.referredBy': userProfile.referral.code 
        });
        
        const totalReferrals = referredProfiles.length;
        const completedReferrals = referredProfiles.filter(p => p.wallet?.totalDeposits > 0).length;
        const pendingReferrals = totalReferrals - completedReferrals;
        
        referralCountMap[userProfile.referral.code] = {
          total: totalReferrals,
          completed: completedReferrals,
          pending: pendingReferrals
        };
      }
    }

    // Attach profiles and referral counts to users
    const usersWithProfiles = users.map(user => {
      const userObj = user.toObject();
      const profile = profileMap[user._id.toString()] || null;
      userObj.profile = profile;
      
      // Initialize referral object safely
      if (!userObj.profile) {
        userObj.profile = {
          referral: {
            totalReferred: 0,
            completedReferrals: 0,
            pendingReferrals: 0
          }
        };
      } else if (!userObj.profile.referral) {
        userObj.profile.referral = {
          totalReferred: 0,
          completedReferrals: 0,
          pendingReferrals: 0
        };
      }
      
      // Add referral counts if user has a referral code
      if (profile && profile.referral && profile.referral.code) {
        const counts = referralCountMap[profile.referral.code] || { total: 0, completed: 0, pending: 0 };
        userObj.profile.referral.totalReferred = counts.total;
        userObj.profile.referral.completedReferrals = counts.completed;
        userObj.profile.referral.pendingReferrals = counts.pending;
      } else {
        userObj.profile.referral.totalReferred = 0;
        userObj.profile.referral.completedReferrals = 0;
        userObj.profile.referral.pendingReferrals = 0;
      }
      
      return userObj;
    });

    const total = await User.countDocuments(query);

    const response = {
      success: true,
      users: usersWithProfiles,
      pagination: {
        current: 1,
        total: 1,
        totalUsers: usersWithProfiles.length
      }
    };

    res.json(response);
  } catch (error) {
    console.error('Error in users endpoint:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message
    });
  }
});

router.get('/users/:uid', verifyAdminAuth, async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Get profile for this user
    const profile = await Profile.findOne({ userId: user._id });
    
    const userWithProfile = user.toObject();
    userWithProfile.profile = profile;
    
    res.json({ success: true, user: userWithProfile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// KYC Management
router.get('/kyc-pending', verifyAdminAuth, async (req, res) => {
  try {
    const profiles = await Profile.find({ 'profileCompletion.kycStatus': 'under_review' })
      .sort({ createdAt: -1 });
    
    // Get users for these profiles
    const userIds = profiles.map(profile => profile.userId);
    const users = await User.find({ _id: { $in: userIds } });
    
    // Create a map of userId to user
    const userMap = {};
    users.forEach(user => {
      userMap[user._id.toString()] = user;
    });
    
    // Attach users to profiles
    const profilesWithUsers = profiles.map(profile => {
      const profileObj = profile.toObject();
      profileObj.user = userMap[profile.userId.toString()] || null;
      return profileObj;
    });
    
    res.json({ success: true, profiles: profilesWithUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/kyc-approve/:uid', verifyAdminAuth, async (req, res) => {
  try {
    // First find the user by uid
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const profile = await Profile.findOneAndUpdate(
      { 'userId': user._id },
      { 
        'kyc.status': 'approved',
        'profileCompletion.kycStatus': 'approved',
        'profileCompletion.percentage': 100
      },
      { new: true }
    );
    
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    
    res.json({ success: true, profile });
  } catch (error) {
    console.error('KYC approval error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/kyc-reject/:uid', verifyAdminAuth, async (req, res) => {
  try {
    const { reason } = req.body;
    
    // First find the user by uid
    const user = await User.findOne({ uid: req.params.uid });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const profile = await Profile.findOneAndUpdate(
      { 'userId': user._id },
      { 
        'kyc.status': 'rejected',
        'profileCompletion.kycStatus': 'rejected',
        'profileCompletion.kycDetails.rejectionReason': reason
      },
      { new: true }
    );
    
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    
    res.json({ success: true, profile });
  } catch (error) {
    console.error('KYC rejection error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Plan Management
router.get('/plans', verifyAdminAuth, async (req, res) => {
  try {
    const plans = await Plan.find().sort({ priority: 1, createdAt: -1 });
    res.json({ success: true, plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/plans', verifyAdminAuth, async (req, res) => {
  try {
    const plan = new Plan(req.body);
    await plan.save();
    res.json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/plans/:id', verifyAdminAuth, async (req, res) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/plans/:id', verifyAdminAuth, async (req, res) => {
  try {
    await Plan.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// FAQ Management
router.get('/faqs', verifyAdminAuth, async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ priority: 1, createdAt: -1 });
    res.json({ success: true, faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/faqs', verifyAdminAuth, async (req, res) => {
  try {
    const faq = new FAQ(req.body);
    await faq.save();
    res.json({ success: true, faq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/faqs/:id', verifyAdminAuth, async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, faq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/faqs/:id', verifyAdminAuth, async (req, res) => {
  try {
    await FAQ.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'FAQ deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Team Management
router.get('/team', verifyAdminAuth, async (req, res) => {
  try {
    const team = await Team.find().sort({ priority: 1, createdAt: -1 });
    res.json({ success: true, team });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/team', verifyAdminAuth, upload.single('image'), async (req, res) => {
  try {
    const teamData = req.body;
    if (req.file) {
      teamData.image = `/uploads/${req.file.filename}`;
    }
    const member = new Team(teamData);
    await member.save();
    res.json({ success: true, member });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/team/:id', verifyAdminAuth, upload.single('image'), async (req, res) => {
  try {
    const teamData = req.body;
    if (req.file) {
      teamData.image = `/uploads/${req.file.filename}`;
    }
    const member = await Team.findByIdAndUpdate(req.params.id, teamData, { new: true });
    res.json({ success: true, member });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/team/:id', verifyAdminAuth, async (req, res) => {
  try {
    await Team.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Team member deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Contact Management
router.get('/contacts', verifyAdminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) {
      query.status = status;
    }

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Contact.countDocuments(query);

    res.json({
      success: true,
      contacts,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalContacts: total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/contacts/:id', verifyAdminAuth, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, contact });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Referral Management
router.get('/referrals', verifyAdminAuth, async (req, res) => {
  try {
    // Get users who have been referred (have referredBy field)
    const referredProfiles = await Profile.find({ 
      'referral.referredBy': { $exists: true, $ne: null } 
    })
    .populate('userId', 'email uid')
    .select('personalInfo referral wallet userId createdAt')
    .sort({ createdAt: -1 });

    // Get referral transactions to get commission data
    const referralTransactions = await Transaction.find({ 
      type: 'referral_bonus' 
    })
    .populate('userId', 'email')
    .select('userId amount metadata createdAt');

    // Build referral data
    const referrals = await Promise.all(referredProfiles.map(async (profile) => {
      // Find the referrer profile
      const referrerProfile = await Profile.findOne({ 
        'referral.code': profile.referral.referredBy 
      }).populate('userId', 'email uid');

      // Find referral bonus transaction for this referral
      const bonusTransaction = referralTransactions.find(tx => 
        tx.metadata?.referredUserUid === profile.userId.uid
      );

      return {
        _id: profile._id,
        referrer: {
          email: referrerProfile?.userId?.email || 'Unknown',
          uid: referrerProfile?.userId?.uid || 'Unknown',
          name: `${referrerProfile?.personalInfo?.firstName || ''} ${referrerProfile?.personalInfo?.lastName || ''}`.trim()
        },
        referred: {
          email: profile.userId.email,
          uid: profile.userId.uid,
          name: `${profile.personalInfo?.firstName || ''} ${profile.personalInfo?.lastName || ''}`.trim()
        },
        referralCode: profile.referral.referredBy,
        commission: bonusTransaction?.amount || 0,
        commissionPaid: bonusTransaction ? true : false,
        hasDeposited: profile.wallet?.totalDeposits > 0,
        totalDeposits: profile.wallet?.totalDeposits || 0,
        status: profile.wallet?.totalDeposits > 0 ? 'completed' : 'pending',
        createdAt: profile.createdAt
      };
    }));

    // Get overall referral statistics
    const totalReferrals = referrals.length;
    const completedReferrals = referrals.filter(r => r.status === 'completed').length;
    const totalCommissionPaid = referrals.reduce((sum, r) => sum + r.commission, 0);
    const pendingReferrals = referrals.filter(r => r.status === 'pending').length;

    res.json({ 
      success: true, 
      referrals,
      statistics: {
        totalReferrals,
        completedReferrals,
        pendingReferrals,
        totalCommissionPaid
      }
    });
  } catch (error) {
    console.error('Referrals fetch error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Transaction Management
router.get('/transactions', verifyAdminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, type = '', status = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (type) query.type = type;
    if (status) query.status = status;

    const transactions = await Transaction.find(query)
      .populate('userId', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(query);

    res.json({
      success: true,
      transactions,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalTransactions: total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/transactions/:id', verifyAdminAuth, async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Blog Management
router.get('/blogs', verifyAdminAuth, async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/blogs', verifyAdminAuth, upload.single('featuredImage'), async (req, res) => {
  try {
    const blogData = req.body;
    if (req.file) {
      blogData.featuredImage = `/uploads/${req.file.filename}`;
    }
    const blog = new Blog(blogData);
    await blog.save();
    res.json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/blogs/:id', verifyAdminAuth, upload.single('featuredImage'), async (req, res) => {
  try {
    const blogData = req.body;
    if (req.file) {
      blogData.featuredImage = `/uploads/${req.file.filename}`;
    }
    const blog = await Blog.findByIdAndUpdate(req.params.id, blogData, { new: true });
    res.json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/blogs/:id', verifyAdminAuth, async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// News Management
router.get('/news', verifyAdminAuth, async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.json({ success: true, news });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/news', verifyAdminAuth, upload.single('featuredImage'), async (req, res) => {
  try {
    const newsData = req.body;
    if (req.file) {
      newsData.featuredImage = `/uploads/${req.file.filename}`;
    }
    const news = new News(newsData);
    await news.save();
    res.json({ success: true, news });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/news/:id', verifyAdminAuth, upload.single('featuredImage'), async (req, res) => {
  try {
    const newsData = req.body;
    if (req.file) {
      newsData.featuredImage = `/uploads/${req.file.filename}`;
    }
    const news = await News.findByIdAndUpdate(req.params.id, newsData, { new: true });
    res.json({ success: true, news });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/news/:id', verifyAdminAuth, async (req, res) => {
  try {
    await News.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'News deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== WITHDRAWAL MANAGEMENT ====================

// Get all withdrawal requests
router.get('/withdrawals', verifyAdminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const withdrawals = await Withdrawal.find(query)
      .populate('userId', 'uid email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Withdrawal.countDocuments(query);

    res.json({
      success: true,
      withdrawals,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get withdrawal details
router.get('/withdrawals/:id', verifyAdminAuth, async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id)
      .populate('userId', 'uid email')
      .populate('processedBy', 'uid email');

    if (!withdrawal) {
      return res.status(404).json({ success: false, message: 'Withdrawal not found' });
    }

    res.json({ success: true, withdrawal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Approve withdrawal request
router.put('/withdrawals/:id/approve', verifyAdminAuth, async (req, res) => {
  try {
    const { adminNotes } = req.body;
    
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ success: false, message: 'Withdrawal not found' });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Withdrawal request has already been processed' 
      });
    }

    // Update withdrawal status
    withdrawal.status = 'approved';
    withdrawal.processedBy = req.admin.id;
    withdrawal.processedAt = new Date();
    withdrawal.adminNotes = adminNotes || '';
    await withdrawal.save();

    // Update transaction status
    await Transaction.findOneAndUpdate(
      { 'metadata.withdrawalId': withdrawal._id },
      { status: 'approved' }
    );

    res.json({ 
      success: true, 
      message: 'Withdrawal request approved successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reject withdrawal request
router.put('/withdrawals/:id/reject', verifyAdminAuth, async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    
    if (!rejectionReason) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rejection reason is required' 
      });
    }

    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ success: false, message: 'Withdrawal not found' });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Withdrawal request has already been processed' 
      });
    }

    // Restore amount to user's wallet
    const profile = await Profile.findOne({ userId: withdrawal.userId });
    if (profile) {
      if (withdrawal.type === 'wallet') {
        profile.wallet.walletBalance += withdrawal.amount;
      } else {
        profile.wallet.referralBalance += withdrawal.amount;
      }
      await profile.save();
    }

    // Update withdrawal status
    withdrawal.status = 'rejected';
    withdrawal.processedBy = req.admin.id;
    withdrawal.processedAt = new Date();
    withdrawal.rejectionReason = rejectionReason;
    await withdrawal.save();

    // Update transaction status
    await Transaction.findOneAndUpdate(
      { 'metadata.withdrawalId': withdrawal._id },
      { status: 'rejected' }
    );

    res.json({ 
      success: true, 
      message: 'Withdrawal request rejected and amount restored to user wallet' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark withdrawal as completed (after manual transfer)
router.put('/withdrawals/:id/complete', verifyAdminAuth, async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ success: false, message: 'Withdrawal not found' });
    }

    if (withdrawal.status !== 'approved') {
      return res.status(400).json({ 
        success: false, 
        message: 'Withdrawal must be approved before marking as completed' 
      });
    }

    // Update withdrawal status
    withdrawal.status = 'completed';
    await withdrawal.save();

    // Update user's total withdrawals
    const profile = await Profile.findOne({ userId: withdrawal.userId });
    if (profile) {
      profile.wallet.totalWithdrawals += withdrawal.amount;
      await profile.save();
    }

    // Update transaction status
    await Transaction.findOneAndUpdate(
      { 'metadata.withdrawalId': withdrawal._id },
      { status: 'completed' }
    );

    res.json({ 
      success: true, 
      message: 'Withdrawal marked as completed successfully' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get withdrawal statistics
router.get('/withdrawals/stats', verifyAdminAuth, async (req, res) => {
  try {
    const stats = await Withdrawal.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const totalWithdrawals = await Withdrawal.countDocuments();
    const totalAmount = await Withdrawal.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      stats: {
        byStatus: stats,
        totalWithdrawals,
        totalAmount: totalAmount[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user transactions for admin
router.get('/user-transactions/:uid', verifyAdminAuth, async (req, res) => {
  try {
    const { uid } = req.params;
    
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const transactions = await Transaction.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    const withdrawals = await Withdrawal.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      transactions,
      withdrawals
    });
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user transactions',
      error: error.message
    });
  }
});

// Assign plan to user
router.post('/assign-plan', verifyAdminAuth, async (req, res) => {
  try {
    const { uid, planId } = req.body;
    
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    const profile = await Profile.findOne({ userId: user._id });
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Calculate plan expiry
    const now = new Date();
    const expiryDate = new Date(now.getTime() + (plan.duration * 24 * 60 * 60 * 1000));

    // Update profile with plan subscription
    profile.subscription = {
      planId: plan._id,
      planName: plan.name,
      startDate: now,
      expiryDate: expiryDate,
      isActive: true,
      assignedBy: 'admin'
    };

    await profile.save();

    res.json({
      success: true,
      message: 'Plan assigned successfully',
      subscription: profile.subscription
    });
  } catch (error) {
    console.error('Error assigning plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign plan',
      error: error.message
    });
  }
});

// Trading Account Management

// Get all trading accounts
router.get('/trading-accounts', verifyAdminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, assigned = '', broker = '' } = req.query;
    const skip = (page - 1) * limit;
    
    let query = {};
    
    if (assigned === 'true') {
      query.isAssigned = true;
    } else if (assigned === 'false') {
      query.isAssigned = false;
    }
    
    if (broker) {
      query.brokerName = { $regex: broker, $options: 'i' };
    }

    const accounts = await TradingAccount.find(query)
      .populate('assignedTo.userId', 'email')
      .populate('subscriptionId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(skip);

    const total = await TradingAccount.countDocuments(query);

    res.json({
      success: true,
      accounts,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching trading accounts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trading accounts',
      error: error.message
    });
  }
});

// Create trading account
router.post('/trading-accounts', verifyAdminAuth, async (req, res) => {
  try {
    const {
      accountName,
      brokerName,
      serverId,
      loginId,
      password,
      serverAddress,
      platform,
      accountType,
      balance,
      leverage,
      currency,
      notes
    } = req.body;

    const tradingAccount = new TradingAccount({
      accountName,
      brokerName,
      serverId,
      loginId,
      password,
      serverAddress,
      platform,
      accountType,
      balance: balance || 0,
      leverage: leverage || '1:100',
      currency: currency || 'USD',
      notes,
      createdBy: req.admin._id // Assuming admin ID is available in req.admin
    });

    await tradingAccount.save();

    res.json({
      success: true,
      message: 'Trading account created successfully',
      account: tradingAccount
    });
  } catch (error) {
    console.error('Error creating trading account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create trading account',
      error: error.message
    });
  }
});

// Assign trading account to user
router.post('/trading-accounts/:accountId/assign', verifyAdminAuth, async (req, res) => {
  try {
    const { accountId } = req.params;
    const { uid, subscriptionId, extendPlanValidity } = req.body;

    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const account = await TradingAccount.findById(accountId);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Trading account not found'
      });
    }

    if (account.isAssigned) {
      return res.status(400).json({
        success: false,
        message: 'Trading account is already assigned'
      });
    }

    // Assign account
    await account.assignToUser(user._id, user.email, subscriptionId);

    // Update subscription if provided
    if (subscriptionId) {
      const subscription = await Subscription.findById(subscriptionId);
      if (subscription) {
        subscription.tradingAccountAssigned = true;
        
        // If extendPlanValidity is true, extend the plan validity to 100% from now
        if (extendPlanValidity) {
          const now = new Date();
          const planDuration = subscription.duration; // in days
          const newExpiryDate = new Date(now.getTime() + (planDuration * 24 * 60 * 60 * 1000));
          
          subscription.startDate = now;
          subscription.expiryDate = newExpiryDate;
          subscription.status = 'active';
        }
        
        await subscription.save();
      }
    }

    res.json({
      success: true,
      message: 'Trading account assigned successfully',
      account
    });
  } catch (error) {
    console.error('Error assigning trading account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign trading account',
      error: error.message
    });
  }
});

// Unassign trading account
router.post('/trading-accounts/:accountId/unassign', verifyAdminAuth, async (req, res) => {
  try {
    const { accountId } = req.params;

    const account = await TradingAccount.findById(accountId);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Trading account not found'
      });
    }

    // Update subscription if assigned
    if (account.subscriptionId) {
      await Subscription.findByIdAndUpdate(account.subscriptionId, {
        tradingAccountAssigned: false
      });
    }

    // Unassign account
    await account.unassign();

    res.json({
      success: true,
      message: 'Trading account unassigned successfully',
      account
    });
  } catch (error) {
    console.error('Error unassigning trading account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unassign trading account',
      error: error.message
    });
  }
});

// Update trading account
router.put('/trading-accounts/:accountId', verifyAdminAuth, async (req, res) => {
  try {
    const { accountId } = req.params;
    const updateData = req.body;

    const account = await TradingAccount.findByIdAndUpdate(
      accountId,
      updateData,
      { new: true }
    );

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Trading account not found'
      });
    }

    res.json({
      success: true,
      message: 'Trading account updated successfully',
      account
    });
  } catch (error) {
    console.error('Error updating trading account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update trading account',
      error: error.message
    });
  }
});

// Delete trading account
router.delete('/trading-accounts/:accountId', verifyAdminAuth, async (req, res) => {
  try {
    const { accountId } = req.params;

    const account = await TradingAccount.findById(accountId);
    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Trading account not found'
      });
    }

    if (account.isAssigned) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete assigned trading account. Unassign first.'
      });
    }

    await TradingAccount.findByIdAndDelete(accountId);

    res.json({
      success: true,
      message: 'Trading account deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting trading account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete trading account',
      error: error.message
    });
  }
});

// Update transaction status
router.put('/update-transaction-status', verifyAdminAuth, async (req, res) => {
  try {
    const { transactionId, status } = req.body;

    const transaction = await Transaction.findByIdAndUpdate(
      transactionId,
      { status },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      message: 'Transaction status updated successfully',
      transaction
    });
  } catch (error) {
    console.error('Error updating transaction status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update transaction status',
      error: error.message
    });
  }
});

// Recalculate all referral counts
router.post('/recalculate-referral-counts', verifyAdminAuth, async (req, res) => {
  try {
    // Get all profiles with referral codes
    const profilesWithCodes = await Profile.find({
      'referral.code': { $exists: true, $ne: null }
    });

    for (const profile of profilesWithCodes) {
      // Count total referrals
      const totalReferrals = await Profile.countDocuments({
        'referral.referredBy': profile.referral.code
      });

      // Count completed referrals (those who have made deposits)
      const completedReferrals = await Profile.countDocuments({
        'referral.referredBy': profile.referral.code,
        'wallet.totalDeposits': { $gt: 0 }
      });

      // Update the profile
      profile.referral.totalReferrals = totalReferrals;
      profile.referral.completedReferrals = completedReferrals;
      profile.referral.pendingReferrals = totalReferrals - completedReferrals;
      
      await profile.save();
    }

    res.json({
      success: true,
      message: 'Referral counts recalculated successfully',
      updatedProfiles: profilesWithCodes.length
    });
  } catch (error) {
    console.error('Error recalculating referral counts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to recalculate referral counts',
      error: error.message
    });
  }
});

// User wallet action (add/deduct)
router.post('/user-wallet-action/:uid', verifyAdminAuth, async (req, res) => {
  try {
    const { uid } = req.params;
    const { action, amount, wallet, reason } = req.body;

    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

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

    // Calculate new balance
    const currentBalance = wallet === 'wallet' ? profile.wallet.walletBalance : profile.wallet.referralBalance;
    const newBalance = action === 'add' 
      ? currentBalance + parseFloat(amount)
      : currentBalance - parseFloat(amount);

    // Update balance (allow negative)
    if (wallet === 'wallet') {
      profile.wallet.walletBalance = newBalance;
    } else {
      profile.wallet.referralBalance = newBalance;
    }

    // Create transaction record
    const transaction = new Transaction({
      userId: user._id,
      type: action === 'add' ? 'admin_credit' : 'admin_debit',
      amount: parseFloat(amount),
      description: reason || `Admin ${action} - ${wallet} balance`,
      status: 'completed',
      metadata: {
        adminAction: true,
        adminId: req.admin._id,
        walletType: wallet,
        reason: reason
      },
      processedAt: new Date()
    });

    await transaction.save();
    await profile.save();

    res.json({
      success: true,
      message: `Wallet ${action} successful`,
      wallet: profile.wallet
    });
  } catch (error) {
    console.error('Error performing wallet action:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform wallet action',
      error: error.message
    });
  }
});

// Mark referral as complete
router.post('/mark-referral-complete', verifyAdminAuth, async (req, res) => {
  try {
    const { referrerUid, referredUid, bonusAmount } = req.body;

    // Find referrer user
    const referrerUser = await User.findOne({ uid: referrerUid });
    if (!referrerUser) {
      return res.status(404).json({
        success: false,
        message: 'Referrer user not found'
      });
    }

    // Find referred user
    const referredUser = await User.findOne({ uid: referredUid });
    if (!referredUser) {
      return res.status(404).json({
        success: false,
        message: 'Referred user not found'
      });
    }

    // Find referrer profile
    const referrerProfile = await Profile.findOne({ userId: referrerUser._id });
    if (!referrerProfile) {
      return res.status(404).json({
        success: false,
        message: 'Referrer profile not found'
      });
    }

    // Find referred profile
    const referredProfile = await Profile.findOne({ userId: referredUser._id });
    if (!referredProfile) {
      return res.status(404).json({
        success: false,
        message: 'Referred profile not found'
      });
    }

    // Check if referral exists
    if (referredProfile.referral.referredBy !== referrerProfile.referral.code) {
      return res.status(400).json({
        success: false,
        message: 'Invalid referral relationship'
      });
    }

    // Update referral counts
    if (!referrerProfile.referral) {
      referrerProfile.referral = {
        totalReferrals: 0,
        completedReferrals: 0,
        pendingReferrals: 0
      };
    }
    
    referrerProfile.referral.completedReferrals += 1;
    referrerProfile.referral.pendingReferrals = Math.max(0, referrerProfile.referral.pendingReferrals - 1);

    // Add bonus to referrer's referral balance
    if (!referrerProfile.wallet) {
      referrerProfile.wallet = {
        walletBalance: 0,
        referralBalance: 0,
        totalDeposits: 0,
        totalWithdrawals: 0
      };
    }
    referrerProfile.wallet.referralBalance += parseFloat(bonusAmount);

    // Create referral bonus transaction
    const referralTransaction = new Transaction({
      userId: referrerUser._id,
      type: 'referral_bonus',
      amount: parseFloat(bonusAmount),
      description: `Admin marked referral complete - ${referredProfile.personalInfo?.firstName || 'User'}`,
      status: 'completed',
      metadata: {
        adminAction: true,
        adminId: req.admin._id,
        referredUserId: referredUser._id,
        referredUserUid: referredUid,
        referredUserName: `${referredProfile.personalInfo?.firstName || ''} ${referredProfile.personalInfo?.lastName || ''}`.trim()
      },
      processedAt: new Date()
    });

    await referralTransaction.save();
    await referrerProfile.save();

    res.json({
      success: true,
      message: 'Referral marked as complete and bonus added',
      referral: {
        referrer: referrerProfile.referral,
        bonusAdded: parseFloat(bonusAmount)
      }
    });
  } catch (error) {
    console.error('Error marking referral complete:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark referral as complete',
      error: error.message
    });
  }
});

// Admin wallet management

// Update user wallet balance
router.put('/user-wallet/:uid', verifyAdminAuth, async (req, res) => {
  try {
    const { uid } = req.params;
    const { walletBalance, referralBalance, action, amount, reason } = req.body;

    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

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

    // Update balances
    if (walletBalance !== undefined) {
      profile.wallet.walletBalance = parseFloat(walletBalance);
    }
    if (referralBalance !== undefined) {
      profile.wallet.referralBalance = parseFloat(referralBalance);
    }

    // If action is specified, create transaction record
    if (action && amount) {
      const transaction = new Transaction({
        userId: user._id,
        type: action === 'add' ? 'admin_credit' : 'admin_debit',
        amount: Math.abs(parseFloat(amount)),
        description: reason || `Admin ${action} - Manual wallet adjustment`,
        status: 'completed',
        metadata: {
          adminAction: true,
          adminId: req.admin._id,
          reason: reason
        },
        processedAt: new Date()
      });

      await transaction.save();
    }

    await profile.save();

    res.json({
      success: true,
      message: 'Wallet balance updated successfully',
      wallet: profile.wallet
    });
  } catch (error) {
    console.error('Error updating wallet balance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update wallet balance',
      error: error.message
    });
  }
});

module.exports = router;
