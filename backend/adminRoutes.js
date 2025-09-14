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
    const totalUsers = await User.countDocuments();
    const totalProfiles = await Profile.countDocuments();
    const pendingKyc = await Profile.countDocuments({ 'profileCompletion.kycStatus': 'under_review' });
    const totalTransactions = await Transaction.countDocuments();
    const totalRevenue = await Transaction.aggregate([
      { $match: { status: 'completed', type: 'deposit' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);
    const recentTransactions = await Transaction.find().populate('userId', 'email').sort({ createdAt: -1 }).limit(5);
    const recentContacts = await Contact.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      analytics: {
        totalUsers,
        totalProfiles,
        pendingKyc,
        totalTransactions,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      recent: {
        users: recentUsers,
        transactions: recentTransactions,
        contacts: recentContacts
      }
    });
  } catch (error) {
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

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get profiles for these users
    const userIds = users.map(user => user._id);
    const profiles = await Profile.find({ userId: { $in: userIds } });
    
    // Create a map of userId to profile
    const profileMap = {};
    profiles.forEach(profile => {
      profileMap[profile.userId.toString()] = profile;
    });

    // Attach profiles to users
    const usersWithProfiles = users.map(user => {
      const userObj = user.toObject();
      userObj.profile = profileMap[user._id.toString()] || null;
      return userObj;
    });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users: usersWithProfiles,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        totalUsers: total
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
        'profileCompletion.kycStatus': 'approved',
        'profileCompletion.percentage': 100
      },
      { new: true }
    );
    res.json({ success: true, profile });
  } catch (error) {
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
        'profileCompletion.kycStatus': 'rejected',
        'profileCompletion.kycDetails.rejectionReason': reason
      },
      { new: true }
    );
    res.json({ success: true, profile });
  } catch (error) {
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
    const referrals = await Referral.find()
      .populate('referrerId', 'email')
      .populate('referredId', 'email')
      .sort({ createdAt: -1 });
    res.json({ success: true, referrals });
  } catch (error) {
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

module.exports = router;
