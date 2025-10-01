const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { verifyAdminAuth, adminLogin } = require('./adminAuth');
const multer = require('multer');
const path = require('path');

// Import models
const { User } = require('./schema');
const Plan = require('./models/Plan');
const Challenge = require('./models/Challenge');
const Transaction = require('./models/Transaction');
const NotificationService = require('./utils/notificationService');
// Admin: create or update a challenge config
router.post('/challenges', verifyAdminAuth, async (req, res) => {
  try {
    const data = req.body;
    const challenge = new Challenge(data);
    await challenge.save();
    res.json({ success: true, challenge });
  } catch (error) {
    console.error('Create challenge error:', error);
    res.status(500).json({ success: false, message: 'Failed to create challenge' });
  }
});

// Admin: list challenges
router.get('/challenges', verifyAdminAuth, async (req, res) => {
  try {
    const items = await Challenge.find({}).sort({ createdAt: -1 });
    res.json({ success: true, challenges: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to list challenges' });
  }
});

// Admin: assign challenge to user
router.post('/challenges/assign', verifyAdminAuth, async (req, res) => {
  try {
    const { uid, challengeId, accountSize, profitTarget, platform, note } = req.body;
    const user = await User.findOne({ uid });
    const challenge = await Challenge.findById(challengeId);
    if (!user || !challenge) return res.status(404).json({ success: false, message: 'Not found' });

    user.challenges.push({
      challengeId: challenge._id,
      name: challenge.name,
      type: challenge.type,
      model: challenge.model,
      profitTarget: profitTarget || (challenge.profitTargets?.[0] || 8),
      accountSize: Number(accountSize),
      platform: platform || (challenge.platforms?.[0] || 'MetaTrader 5'),
      price: 0,
      adminNote: note || '',
      status: 'active',
      assignedBy: 'admin'
    });
    await user.save();

    await NotificationService.notifyChallengeStatus(user._id, challenge.name, 'active', 'Assigned by admin');
    res.json({ success: true, message: 'Challenge assigned' });
  } catch (error) {
    console.error('Assign challenge error:', error);
    res.status(500).json({ success: false, message: 'Failed to assign challenge' });
  }
});

// Admin: update user challenge status
router.put('/challenges/:userId/:challengeEntryId/status', verifyAdminAuth, async (req, res) => {
  try {
    const { userId, challengeEntryId } = req.params;
    const { status, adminNote } = req.body;
    
    // Validate status value
    const validStatuses = ['active', 'inactive', 'expired', 'failed', 'passed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const entry = user.challenges.id(challengeEntryId);
    if (!entry) return res.status(404).json({ success: false, message: 'Challenge entry not found' });
    if (entry.tradingAccountId) return res.status(400).json({ success: false, message: 'This challenge already has a trading account' });
    if (['inactive','expired'].includes(entry.status)) return res.status(400).json({ success: false, message: 'Cannot assign account to inactive/expired challenge' });
    entry.status = status;
    entry.adminNote = adminNote || entry.adminNote;
    entry.endedAt = ['expired', 'failed', 'passed', 'inactive', 'cancelled'].includes(status) ? new Date() : entry.endedAt;
    await user.save();

    await NotificationService.notifyChallengeStatus(user._id, entry.name, status, adminNote || '');
    res.json({ success: true, message: 'Challenge status updated' });
  } catch (error) {
    console.error('Update challenge status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

const FAQ = require('./models/FAQ');
const Team = require('./models/Team');
const Contact = require('./models/Contact');
const Referral = require('./models/Referral');
const Blog = require('./models/Blog');
const News = require('./models/News');
const Withdrawal = require('./models/Withdrawal');
// Subscription model removed - using user.plans array instead
const TradingAccount = require('./models/TradingAccount');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine destination based on the route
    let uploadPath = 'uploads/';
    if (req.route?.path?.includes('/team')) {
      uploadPath = 'uploads/team/';
    } else if (req.route?.path?.includes('/blogs')) {
      uploadPath = 'uploads/blogs/';
    }
    cb(null, uploadPath);
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

// ===== TRADING DATA MANAGEMENT (ADMIN) =====

// Update user trading data
router.put('/users/:uid/trading-data', verifyAdminAuth, async (req, res) => {
  try {
    const { uid } = req.params;
    const tradingData = req.body;

    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update trading data
    user.tradingData = {
      ...user.tradingData,
      ...tradingData,
      updatedAt: new Date(),
      lastUpdatedBy: req.admin?.email || 'admin'
    };

    await user.save();

    res.json({ success: true, message: 'Trading data updated successfully', tradingData: user.tradingData });
  } catch (error) {
    console.error('Update trading data error:', error);
    res.status(500).json({ success: false, message: 'Failed to update trading data', error: error.message });
  }
});

// Get user trading data
router.get('/users/:uid/trading-data', verifyAdminAuth, async (req, res) => {
  try {
    const { uid } = req.params;

    const user = await User.findOne({ uid }).select('uid email tradingData');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, tradingData: user.tradingData || {} });
  } catch (error) {
    console.error('Get trading data error:', error);
    res.status(500).json({ success: false, message: 'Failed to get trading data', error: error.message });
  }
});

// Add trade to user's trading history
router.post('/users/:uid/trading-data/trades', verifyAdminAuth, async (req, res) => {
  try {
    const { uid } = req.params;
    const trade = req.body;

    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Initialize tradingData if it doesn't exist
    if (!user.tradingData) {
      user.tradingData = {};
    }
    if (!user.tradingData.recentTrades) {
      user.tradingData.recentTrades = [];
    }

    // Add trade to recent trades (keep only last 100 trades)
    user.tradingData.recentTrades.unshift(trade);
    if (user.tradingData.recentTrades.length > 100) {
      user.tradingData.recentTrades = user.tradingData.recentTrades.slice(0, 100);
    }

    user.tradingData.updatedAt = new Date();
    user.tradingData.lastUpdatedBy = req.admin?.email || 'admin';

    await user.save();

    res.json({ success: true, message: 'Trade added successfully', trade });
  } catch (error) {
    console.error('Add trade error:', error);
    res.status(500).json({ success: false, message: 'Failed to add trade', error: error.message });
  }
});

// Get all users with trading data
router.get('/trading-data/users', verifyAdminAuth, async (req, res) => {
  try {
    const users = await User.find({ 
      'tradingData.isActive': true 
    }).select('uid email tradingData.accountInfo tradingData.allTimeStats');

    res.json({ success: true, users });
  } catch (error) {
    console.error('Get trading users error:', error);
    res.status(500).json({ success: false, message: 'Failed to get trading users', error: error.message });
  }
});

// ===== SUPPORT TICKET MANAGEMENT (ADMIN) =====

// List all support tickets
router.get('/support/tickets', verifyAdminAuth, async (req, res) => {
  try {
    const { status = '', category = '', search = '' } = req.query;
    
    // Get all users with support tickets
    const users = await User.find({ 
      supportTickets: { $exists: true, $not: { $size: 0 } } 
    }).select('uid email supportTickets');

    // Flatten all tickets with user info
    let allTickets = [];
    users.forEach(user => {
      user.supportTickets.forEach(ticket => {
        allTickets.push({
          ...ticket.toObject(),
          userEmail: user.email,
          userId: user.uid
        });
      });
    });

    // Apply filters
    if (status) {
      allTickets = allTickets.filter(ticket => ticket.status === status);
    }
    if (category) {
      allTickets = allTickets.filter(ticket => ticket.category === category);
    }
    if (search) {
      allTickets = allTickets.filter(ticket => 
        ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
        ticket.message.toLowerCase().includes(search.toLowerCase()) ||
        ticket.userEmail.toLowerCase().includes(search.toLowerCase()) ||
        ticket.ticketId.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Sort by creation date (newest first)
    allTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, tickets: allTickets });
  } catch (error) {
    console.error('Admin list tickets error:', error);
    res.status(500).json({ success: false, message: 'Failed to list tickets', error: error.message });
  }
});

// Get ticket details (with user info/kyc)
router.get('/support/ticket/:ticketId', verifyAdminAuth, async (req, res) => {
  try {
    const { ticketId } = req.params;
    
    // Find user with the specific ticket
    const user = await User.findOne({ 'supportTickets.ticketId': ticketId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const ticket = user.supportTickets.find(t => t.ticketId === ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const userInfo = {
      uid: user.uid,
      email: user.email,
      phone: user.profile?.personalInfo?.phone || null,
      personalInfo: user.profile?.personalInfo || null,
      kyc: user.profile?.kyc || null
    };

    res.json({ success: true, ticket, user: userInfo });
  } catch (error) {
    console.error('Admin get ticket error:', error);
    res.status(500).json({ success: false, message: 'Failed to load ticket', error: error.message });
  }
});

// Add admin response to a ticket
router.post('/support/ticket/:ticketId/response', verifyAdminAuth, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message } = req.body;
    if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

    // Find user with the specific ticket
    const user = await User.findOne({ 'supportTickets.ticketId': ticketId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const ticket = user.supportTickets.find(t => t.ticketId === ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    ticket.responses.push({ from: 'admin', message, timestamp: new Date() });
    ticket.status = ticket.status === 'open' ? 'in_progress' : ticket.status;
    ticket.lastActivity = new Date();
    await user.save();

    // Optional: notify user about admin reply
    try {
      await NotificationService.createNotification(
        user._id,
        'system',
        'Support replied to your ticket',
        `Ticket ${ticket.ticketId}: ${message.substring(0, 140)}...`,
        {
          priority: 'medium',
          relatedType: 'support_ticket',
          relatedId: ticket._id,
          metadata: { ticketId: ticket.ticketId }
        }
      );
    } catch (e) {
      console.warn('Notification on ticket response failed:', e?.message);
    }

    res.json({ success: true, message: 'Response added', ticket });
  } catch (error) {
    console.error('Admin add ticket response error:', error);
    res.status(500).json({ success: false, message: 'Failed to add response', error: error.message });
  }
});

// Update ticket status (notify on resolve)
router.put('/support/ticket/:ticketId/status', verifyAdminAuth, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, message: 'Status is required' });

    const valid = ['open', 'in_progress', 'resolved', 'closed'];
    if (!valid.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });

    // Find user with the specific ticket
    const user = await User.findOne({ 'supportTickets.ticketId': ticketId });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const ticket = user.supportTickets.find(t => t.ticketId === ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    ticket.status = status;
    if (status === 'resolved') {
      ticket.isResolved = true;
      ticket.resolvedAt = new Date();
    }
    if (status === 'closed') {
      ticket.closedAt = new Date();
    }
    ticket.lastActivity = new Date();
    await user.save();

    // Notify user if resolved
    if (status === 'resolved') {
      try {
        await NotificationService.createNotification(
          user._id,
          'system',
          'Your support ticket was resolved',
          `Ticket ${ticket.ticketId} has been marked as resolved.`,
          {
            priority: 'medium',
            relatedType: 'support_ticket',
            relatedId: ticket._id,
            metadata: { ticketId: ticket.ticketId, status: 'resolved' }
          }
        );
      } catch (e) {
        console.warn('Notification on ticket resolve failed:', e?.message);
      }
    }

    res.json({ success: true, message: 'Status updated', ticket });
  } catch (error) {
    console.error('Admin update ticket status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update ticket status', error: error.message });
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
    const totalProfiles = await User.countDocuments({ 'profile': { $exists: true } });
    const pendingKyc = await User.countDocuments({ 'profile.kyc.status': 'applied' });
    
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

    // Get referral counts for each user using the same approach as user dashboard
    const referralCountMap = {};
    
    // For each user, calculate their referral counts
    for (const user of users) {
      if (user.myReferralCode) {
        // Find all users that were referred by this user's code
        const referredUsers = await User.find({ 
          'referredByCode': user.myReferralCode 
        });
        
        const totalReferrals = referredUsers.length;
        const completedReferrals = referredUsers.filter(u => u.profile?.wallet?.totalDeposits > 0).length;
        const pendingReferrals = totalReferrals - completedReferrals;
        
        referralCountMap[user.myReferralCode] = {
          total: totalReferrals,
          completed: completedReferrals,
          pending: pendingReferrals
        };
      }
    }

    // Attach profiles and referral counts to users
    const usersWithProfiles = users.map(user => {
      const userObj = user.toObject();
      const profile = user.profile || null;
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
    const profile = user.profile;
    
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
    const users = await User.find({ 'profile.kyc.status': 'applied' })
      .sort({ createdAt: -1 });
    
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
    
    // Update user profile
    if (user.profile) {
      user.profile.kyc.status = 'approved';
      user.profile.status.completionPercentage = 100;
      await user.save();
    }

    // If this user was referred, bump referrer's referral record to 100% profile completion
    try {
      if (user.referredByCode) {
        const { User } = require('./schema');
        const referrer = await User.findOne({ myReferralCode: user.referredByCode });
        if (referrer && Array.isArray(referrer.referrals)) {
          const idx = referrer.referrals.findIndex(r => r.user.toString() === user._id.toString());
          if (idx !== -1) {
            referrer.referrals[idx].profileComplete = 100;
            await referrer.save();
          }
        }
      }
    } catch (_) {}
    
    res.json({ success: true, profile: user.profile });
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
    
    // Update user profile
    if (user.profile) {
      user.profile.kyc.status = 'rejected';
      user.profile.kyc.rejectionNote = reason;
      await user.save();
    }
    
    res.json({ success: true, profile: user.profile });
  } catch (error) {
    console.error('KYC rejection error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Plan Management
// Admin: assign a plan to a user
router.post('/users/:uid/assign-plan', verifyAdminAuth, async (req, res) => {
  try {
    const { uid } = req.params;
    const { planId, name, price, durationDays, startDate } = req.body;
    const { User } = require('./schema');
    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start.getTime() + (durationDays * 24 * 60 * 60 * 1000));
    const planEntry = {
      planId: planId || undefined,
      name,
      price: price || 0,
      durationDays: durationDays || 0,
      startDate: start,
      endDate: end,
      status: 'active',
      assignedBy: 'admin'
    };
    if (!Array.isArray(user.plans)) user.plans = [];
    user.plans.push(planEntry);
    await user.save();
    res.json({ success: true, plans: user.plans });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Admin: get user plans
router.get('/users/:uid/plans', verifyAdminAuth, async (req, res) => {
  try {
    const { uid } = req.params;
    const { User } = require('./schema');
    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    res.json({ success: true, plans: user.plans || [] });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Admin: update a plan validity/status
router.put('/users/:uid/plans/:planEntryId', verifyAdminAuth, async (req, res) => {
  try {
    const { uid, planEntryId } = req.params;
    const { endDate, status, durationDays, action } = req.body;
    const { User } = require('./schema');
    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    const entry = (user.plans || []).find(p => p._id.toString() === planEntryId);
    if (!entry) return res.status(404).json({ success: false, message: 'Plan entry not found' });
    
    if (action === 'extend') {
      // Extend plan by adding days to current end date
      if (durationDays) {
        const currentEndDate = new Date(entry.endDate);
        const newEndDate = new Date(currentEndDate.getTime() + (durationDays * 24 * 60 * 60 * 1000));
        entry.endDate = newEndDate;
        entry.durationDays += durationDays;
      }
    } else if (action === 'update_status') {
      // Update only the status
      if (status) entry.status = status;
    } else if (action === 'edit') {
      // Full edit mode
      if (endDate) entry.endDate = new Date(endDate);
      if (status) entry.status = status;
      if (typeof durationDays === 'number') {
        entry.durationDays = durationDays;
        // Recalculate end date based on start date and new duration
        const startDate = entry.startDate;
        const newEndDate = new Date(startDate.getTime() + (durationDays * 24 * 60 * 60 * 1000));
        entry.endDate = newEndDate;
      }
    } else {
      // Default behavior (backward compatibility)
      if (endDate) entry.endDate = new Date(endDate);
      if (typeof durationDays === 'number') entry.durationDays = durationDays;
      if (status) entry.status = status;
    }
    
    await user.save();
    res.json({ success: true, plan: entry });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Admin: remove a plan entry
router.delete('/users/:uid/plans/:planEntryId', verifyAdminAuth, async (req, res) => {
  try {
    const { uid, planEntryId } = req.params;
    const { User } = require('./schema');
    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.plans = (user.plans || []).filter(p => p._id.toString() !== planEntryId);
    await user.save();
    res.json({ success: true, plans: user.plans });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Admin: assign trading account
router.post('/users/:uid/trading-accounts', verifyAdminAuth, async (req, res) => {
  try {
    const { uid } = req.params;
    const account = req.body; // provider, accountId, login, server, status
    const { User } = require('./schema');
    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!Array.isArray(user.tradingAccounts)) user.tradingAccounts = [];
    user.tradingAccounts.push({ ...account, assignedBy: 'admin' });
    await user.save();
    res.json({ success: true, tradingAccounts: user.tradingAccounts });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Admin: remove trading account
router.delete('/users/:uid/trading-accounts/:entryId', verifyAdminAuth, async (req, res) => {
  try {
    const { uid, entryId } = req.params;
    const { User } = require('./schema');
    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.tradingAccounts = (user.tradingAccounts || []).filter(a => a._id.toString() !== entryId);
    await user.save();
    res.json({ success: true, tradingAccounts: user.tradingAccounts });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});
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
      teamData.image = `/uploads/team/${req.file.filename}`;
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
      teamData.image = `/uploads/team/${req.file.filename}`;
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
    // Get users who have been referred (have referredByCode field)
    const referredUsers = await User.find({ 
      'referredByCode': { $exists: true, $ne: null } 
    })
    .select('email uid profile.personalInfo profile.wallet createdAt referredByCode')
    .sort({ createdAt: -1 });

    // Get referral transactions to get commission data
    const referralTransactions = await Transaction.find({ 
      type: 'referral_bonus' 
    })
    .populate('userId', 'email')
    .select('userId amount metadata createdAt');

    // Build referral data
    const referrals = await Promise.all(referredUsers.map(async (user) => {
      // Find the referrer user
      const referrerUser = await User.findOne({ 
        'myReferralCode': user.referredByCode 
      }).select('email uid profile.personalInfo');

      // Find referral bonus transaction for this referral
      const bonusTransaction = referralTransactions.find(tx => 
        tx.metadata?.referredUserUid === user.uid
      );

      return {
        _id: user._id,
        referrer: {
          email: referrerUser?.email || 'Unknown',
          uid: referrerUser?.uid || 'Unknown',
          name: `${referrerUser?.profile?.personalInfo?.firstName || ''} ${referrerUser?.profile?.personalInfo?.lastName || ''}`.trim()
        },
        referred: {
          email: user.email,
          uid: user.uid,
          name: `${user.profile?.personalInfo?.firstName || ''} ${user.profile?.personalInfo?.lastName || ''}`.trim()
        },
        referralCode: user.referredByCode,
        commission: bonusTransaction?.amount || 0,
        commissionPaid: bonusTransaction ? true : false,
        hasDeposited: user.profile?.wallet?.totalDeposits > 0,
        totalDeposits: user.profile?.wallet?.totalDeposits || 0,
        status: user.profile?.wallet?.totalDeposits > 0 ? 'completed' : 'pending',
        createdAt: user.createdAt
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
      blogData.featuredImage = `/uploads/blogs/${req.file.filename}`;
    }
    
    // Process tags if provided as string
    if (blogData.tags && typeof blogData.tags === 'string') {
      blogData.tags = blogData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
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
      blogData.featuredImage = `/uploads/blogs/${req.file.filename}`;
    }
    
    // Process tags if provided as string
    if (blogData.tags && typeof blogData.tags === 'string') {
      blogData.tags = blogData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
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

    // Create notification for withdrawal approval
    try {
      const NotificationService = require('./utils/notificationService');
      await NotificationService.notifyWithdrawalApproved(
        withdrawal.userId,
        withdrawal.amount,
        withdrawal.type
      );
      console.log('✅ Withdrawal approval notification sent');
    } catch (notifErr) {
      console.error('Error creating withdrawal approval notification:', notifErr);
      // Don't fail the entire approval if notification creation fails
    }

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
    const user = await User.findById(withdrawal.userId);
    if (user && user.profile) {
      if (withdrawal.type === 'wallet') {
        user.profile.wallet.walletBalance += withdrawal.amount;
      } else {
        user.profile.wallet.referralBalance += withdrawal.amount;
      }
      await user.save();
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

    // Create credit transaction for rejected withdrawal
    const creditTransaction = new Transaction({
      userId: withdrawal.userId,
      type: 'withdrawal_rejected',
      amount: withdrawal.amount,
      balanceAfter: withdrawal.type === 'wallet' ? user.profile.wallet.walletBalance : user.profile.wallet.referralBalance,
      description: `Withdrawal rejected - Amount credited back to ${withdrawal.type} balance`,
      status: 'completed',
      source: 'admin',
      category: 'adjustment',
      metadata: {
        originalWithdrawalId: withdrawal._id,
        withdrawalType: withdrawal.type,
        rejectionReason: rejectionReason,
        adminId: req.admin.id
      },
      processedAt: new Date(),
      processedBy: 'admin'
    });
    await creditTransaction.save();

    // Create notification for withdrawal rejection
    try {
      const NotificationService = require('./utils/notificationService');
      await NotificationService.notifyWithdrawalRejected(
        withdrawal.userId,
        withdrawal.amount,
        withdrawal.type,
        rejectionReason
      );
      console.log('✅ Withdrawal rejection notification sent');
    } catch (notifErr) {
      console.error('Error creating withdrawal rejection notification:', notifErr);
      // Don't fail the entire rejection if notification creation fails
    }

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
    const user = await User.findById(withdrawal.userId);
    if (user && user.profile) {
      user.profile.wallet.totalWithdrawals += withdrawal.amount;
      await user.save();
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

    const profile = user.profile;
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    // Calculate plan expiry
    const now = new Date();
    const expiryDate = new Date(now.getTime() + (plan.duration * 24 * 60 * 60 * 1000));

    // Create plan entry for user's plans array (consistent with user purchases)
    const planEntry = {
      planId: plan._id,
      name: plan.name,
      price: plan.price,
      durationDays: plan.duration,
      startDate: now,
      endDate: expiryDate,
      status: 'active',
      assignedBy: 'admin'
    };

    // Add to user's plans array
    if (!Array.isArray(user.plans)) user.plans = [];
    user.plans.push(planEntry);

    await user.save();

    // Create notification for plan assignment
    try {
      const NotificationService = require('./utils/notificationService');
      await NotificationService.notifyPlanAssigned(
        user._id,
        plan.name,
        req.admin.email
      );
      console.log('✅ Plan assignment notification sent');
    } catch (notifErr) {
      console.error('Error creating plan assignment notification:', notifErr);
      // Don't fail the entire assignment if notification creation fails
    }

    res.json({
      success: true,
      message: 'Plan assigned successfully',
      plan: planEntry,
      plans: user.plans
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

// Fix user flags for existing users with plans
router.post('/fix-user-flags/:uid', verifyAdminAuth, async (req, res) => {
  try {
    const { uid } = req.params;
    
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let updated = false;
    
    // Check if user has plans but myFirstPlan is false
    if (user.plans && user.plans.length > 0 && !user.myFirstPlan) {
      user.myFirstPlan = true;
      updated = true;
      
      // Find the first plan to set payment details
      const firstPlan = user.plans[0];
      if (firstPlan) {
        user.myFirstPayment = true;
        user.myFirstPaymentAmount = firstPlan.price;
        user.myFirstPaymentDate = firstPlan.startDate || new Date();
      }
    }
    
    // Check if user has plans but myFirstPayment is false
    if (user.plans && user.plans.length > 0 && !user.myFirstPayment) {
      user.myFirstPayment = true;
      if (!user.myFirstPaymentAmount && user.plans[0]) {
        user.myFirstPaymentAmount = user.plans[0].price;
        user.myFirstPaymentDate = user.plans[0].startDate || new Date();
      }
      updated = true;
    }
    
    if (updated) {
      await user.save();
      
      // Process referral if user was referred
      if (user.referredByCode) {
        try {
          const { processFirstPayment } = require('./utils/simpleReferralUtils');
          await processFirstPayment(user._id, user.myFirstPaymentAmount, 'plan');
        } catch (refErr) {
          console.error('Referral processing failed:', refErr);
        }
      }
      
      res.json({
        success: true,
        message: 'User flags updated successfully',
        user: {
          myFirstPlan: user.myFirstPlan,
          myFirstPayment: user.myFirstPayment,
          myFirstPaymentAmount: user.myFirstPaymentAmount,
          plansCount: user.plans.length
        }
      });
    } else {
      res.json({
        success: true,
        message: 'No updates needed',
        user: {
          myFirstPlan: user.myFirstPlan,
          myFirstPayment: user.myFirstPayment,
          plansCount: user.plans.length
        }
      });
    }
  } catch (error) {
    console.error('Error fixing user flags:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fix user flags',
      error: error.message
    });
  }
});

// Create custom notification for user
router.post('/notifications/create', verifyAdminAuth, async (req, res) => {
  try {
    const { userId, title, message, priority = 'medium' } = req.body;
    
    if (!userId || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'User ID, title, and message are required'
      });
    }

    const NotificationService = require('./utils/notificationService');
    const notification = await NotificationService.notifyCustom(
      userId,
      title,
      message,
      priority
    );

    if (notification) {
      res.json({
        success: true,
        message: 'Custom notification created successfully',
        notification
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create notification'
      });
    }
  } catch (error) {
    console.error('Error creating custom notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create custom notification',
      error: error.message
    });
  }
});

// Bulk fix all users with plans but incorrect flags
router.post('/fix-all-user-flags', verifyAdminAuth, async (req, res) => {
  try {
    const users = await User.find({
      'plans.0': { $exists: true }, // Users with at least one plan
      $or: [
        { myFirstPlan: false },
        { myFirstPayment: false }
      ]
    });

    let fixedCount = 0;
    const results = [];

    for (const user of users) {
      let updated = false;
      
      // Check if user has plans but myFirstPlan is false
      if (user.plans && user.plans.length > 0 && !user.myFirstPlan) {
        user.myFirstPlan = true;
        updated = true;
        
        // Find the first plan to set payment details
        const firstPlan = user.plans[0];
        if (firstPlan) {
          user.myFirstPayment = true;
          user.myFirstPaymentAmount = firstPlan.price;
          user.myFirstPaymentDate = firstPlan.startDate || new Date();
        }
      }
      
      // Check if user has plans but myFirstPayment is false
      if (user.plans && user.plans.length > 0 && !user.myFirstPayment) {
        user.myFirstPayment = true;
        if (!user.myFirstPaymentAmount && user.plans[0]) {
          user.myFirstPaymentAmount = user.plans[0].price;
          user.myFirstPaymentDate = user.plans[0].startDate || new Date();
        }
        updated = true;
      }
      
      if (updated) {
        await user.save();
        fixedCount++;
        
        // Process referral if user was referred
        if (user.referredByCode) {
          try {
            const { processFirstPayment } = require('./utils/simpleReferralUtils');
            await processFirstPayment(user._id, user.myFirstPaymentAmount, 'plan');
          } catch (refErr) {
            console.error(`Referral processing failed for user ${user.uid}:`, refErr);
          }
        }
        
        results.push({
          uid: user.uid,
          email: user.email,
          myFirstPlan: user.myFirstPlan,
          myFirstPayment: user.myFirstPayment,
          plansCount: user.plans.length
        });
      }
    }
    
    res.json({
      success: true,
      message: `Fixed ${fixedCount} users out of ${users.length} checked`,
      fixedCount,
      totalChecked: users.length,
      results
    });
  } catch (error) {
    console.error('Error bulk fixing user flags:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk fix user flags',
      error: error.message
    });
  }
});

// Trading Account Management

// Get all trading accounts
router.get('/trading-accounts', verifyAdminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, assigned = '', broker = '', search = '' } = req.query;
    const skip = (page - 1) * limit;
    
    const query = {};
    if (assigned === 'true') query.isAssigned = true;
    if (assigned === 'false') query.isAssigned = false;
    if (broker) query.brokerName = { $regex: broker, $options: 'i' };
    if (search) {
      query.$or = [
        { accountName: { $regex: search, $options: 'i' } },
        { brokerName: { $regex: search, $options: 'i' } },
        { loginId: { $regex: search, $options: 'i' } }
      ];
    }

    const accounts = await TradingAccount.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await TradingAccount.countDocuments(query);

    res.json({
      success: true,
      accounts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
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
      createdBy: req.admin?._id || new mongoose.Types.ObjectId() // Fallback if admin ID not available
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

    // Update user's plan if provided
    if (subscriptionId) {
      const planEntry = user.plans.find(p => p._id.toString() === subscriptionId);
      if (planEntry) {
        // If extendPlanValidity is true, extend the plan validity to 100% from now
        if (extendPlanValidity) {
          const now = new Date();
          const planDuration = planEntry.durationDays; // in days
          const newExpiryDate = new Date(now.getTime() + (planDuration * 24 * 60 * 60 * 1000));
          
          planEntry.startDate = now;
          planEntry.endDate = newExpiryDate;
          planEntry.status = 'active';
        }
        
        await user.save();
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

    // Update user's plan if assigned
    if (account.subscriptionId) {
      const user = await User.findById(account.assignedTo);
      if (user) {
        const planEntry = user.plans.find(p => p._id.toString() === account.subscriptionId);
        if (planEntry) {
          // Plan status remains unchanged when unassigning trading account
          await user.save();
        }
      }
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
    // Find all users that have a referral code
    const usersWithCodes = await User.find({ 'myReferralCode': { $exists: true, $ne: null } });

    let updatedUsers = 0;

    for (const referrerUser of usersWithCodes) {
      const code = referrerUser.myReferralCode;
      if (!code) continue;

      // Collect referred users
      const referredUsers = await User.find({ 'referredByCode': code })
        .select('email profile.personalInfo profile.wallet.totalDeposits createdAt profile.status');

      // Build referrals detail
      const referrals = referredUsers.map(ref => ({
        userId: ref._id,
        userName: `${ref.profile?.personalInfo?.firstName || 'User'} ${ref.profile?.personalInfo?.lastName || ''}`.trim(),
        phone: ref.profile?.personalInfo?.phone || 'Not provided',
        joinedAt: ref.createdAt || new Date(),
        completionPercentage: ref.profile?.status?.completionPercentage || 0,
        hasDeposited: (ref.profile?.wallet?.totalDeposits || 0) > 0,
        bonusEarned: 0
      }));

      const totalReferrals = referrals.length;
      const completedReferrals = referrals.filter(r => r.hasDeposited).length;

      // Update referral stats in user's referrals array
      referrerUser.totalReferralsBy = totalReferrals;
      // Note: Individual referral records are stored in user.referrals array
      // The completedReferrals count can be calculated from the referrals array

      await referrerUser.save();
      updatedUsers++;
    }

    res.json({
      success: true,
      message: 'Referral counts recalculated successfully',
      updatedUsers
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

    console.log('Wallet action request:', { uid, action, amount, wallet, reason });

    const user = await User.findOne({ uid });
    if (!user) {
      console.log('User not found for uid:', uid);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('User found:', user.email);

    const profile = user.profile;
    if (!profile) {
      console.log('Profile not found for user:', user.email);
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    console.log('Profile found, wallet:', profile.wallet);

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
    console.log('Creating transaction for user:', user._id);
    const transaction = new Transaction({
      userId: user._id,
      type: action === 'add' ? 'admin_credit' : 'admin_debit',
      amount: parseFloat(amount),
      balanceAfter: newBalance,
      description: reason || `Admin ${action} - ${wallet} balance`,
      status: 'completed',
      source: 'admin',
      category: 'adjustment',
      metadata: {
        adminAction: true,
        adminId: req.admin._id,
        walletType: wallet,
        reason: reason
      },
      processedAt: new Date(),
      processedBy: 'admin'
    });

    console.log('Saving transaction...');
    await transaction.save();
    console.log('Transaction saved successfully');
    
    console.log('Saving user...');
    user.markModified('profile.wallet');
    await user.save();
    console.log('User saved successfully');

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

    // Check if referral exists
    if (referredUser.referredByCode !== referrerUser.myReferralCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid referral relationship'
      });
    }

    // Add bonus to referrer's referral balance
    if (!referrerUser.profile.wallet) {
      referrerUser.profile.wallet = {
        walletBalance: 0,
        referralBalance: 0,
        totalDeposits: 0,
        totalWithdrawals: 0
      };
    }
    referrerUser.profile.wallet.referralBalance += parseFloat(bonusAmount);

    // Create referral bonus transaction
    const referralTransaction = new Transaction({
      userId: referrerUser._id,
      type: 'referral_bonus',
      amount: parseFloat(bonusAmount),
      description: `Admin marked referral complete - ${referredUser.profile?.personalInfo?.firstName || 'User'}`,
      status: 'completed',
      metadata: {
        adminAction: true,
        adminId: req.admin._id,
        referredUserId: referredUser._id,
        referredUserUid: referredUid,
        referredUserName: `${referredUser.profile?.personalInfo?.firstName || ''} ${referredUser.profile?.personalInfo?.lastName || ''}`.trim()
      },
      processedAt: new Date()
    });

    await referralTransaction.save();
    await referrerUser.save();

    res.json({
      success: true,
      message: 'Referral marked as complete and bonus added',
      referral: {
        referrer: referrerUser.myReferralCode,
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
        balanceAfter: walletBalance !== undefined ? parseFloat(walletBalance) : profile.wallet.walletBalance,
        description: reason || `Admin ${action} - Manual wallet adjustment`,
        status: 'completed',
        source: 'admin',
        category: 'adjustment',
        metadata: {
          adminAction: true,
          adminId: req.admin._id,
          reason: reason
        },
        processedAt: new Date(),
        processedBy: 'admin'
      });

      await transaction.save();
    }

    // Mark the nested field as modified and save the user document
    user.markModified('profile.wallet');
    await user.save();

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

// Get all referrals with detailed information for admin
router.get('/referrals/detailed', verifyAdminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Get all users that have referrals
    const usersWithReferrals = await User.find({
      'referrals.0': { $exists: true }
    }).select('email createdAt referrals');

    const allReferrals = [];

    for (const user of usersWithReferrals) {
      const referrer = {
        referrerId: user._id,
        referrerEmail: user.email,
        referrerName: `${user.profile?.personalInfo?.firstName || 'User'} ${user.profile?.personalInfo?.lastName || ''}`.trim(),
        referralCode: user.myReferralCode
      };

      for (const referral of user.referrals || []) {
        try {
          // Get referred user details
          const referredUser = await User.findById(referral.user);

          if (referredUser) {
            const hasFirstDeposit = (referredUser.profile?.wallet?.totalDeposits || 0) > 0;
            const hasActivePlan = referredUser.profile?.subscription?.status === 'active';
            const profileCompletion = referredUser.profile?.status?.completionPercentage || 0;
            const hasCompletedFirstPayment = referredUser.myFirstPayment || false;

            allReferrals.push({
              ...referrer,
              referredUserId: referral.user,
              referredUserEmail: referredUser.email,
              referredUserName: `${referredUser.profile?.personalInfo?.firstName || 'User'} ${referredUser.profile?.personalInfo?.lastName || ''}`.trim(),
              referredUserPhone: referredUser.profile?.personalInfo?.phone || 'Not provided',
              joinedAt: referredUser.createdAt || referral.joinedAt,
              profileCompletion: profileCompletion,
              hasFirstDeposit: hasFirstDeposit,
              hasActivePlan: hasActivePlan,
              planName: referredUser.profile?.subscription?.planName || null,
              planPrice: referredUser.profile?.subscription?.planPrice || 0,
              planExpiryDate: referredUser.profile?.subscription?.expiryDate || null,
              firstPaymentAmount: referral.firstPaymentAmount || 0,
              firstPaymentDate: referral.firstPaymentDate || null,
              bonusEarned: referral.bonusAmount || 0,
              bonusCreditedAt: referral.bonusCreditedAt || null,
              status: hasCompletedFirstPayment || hasActivePlan ? 'completed' : 'pending',
              referralComplete: hasCompletedFirstPayment || hasActivePlan,
              kycStatus: referredUser.profile?.kyc?.status || 'not_started',
              walletBalance: referredUser.profile?.wallet?.walletBalance || 0,
              referralBalance: referredUser.profile?.wallet?.referralBalance || 0
            });
          }
        } catch (err) {
          console.error('Error processing referral for admin:', err);
        }
      }
    }

    // Sort by joinedAt (newest first)
    allReferrals.sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt));

    // Paginate
    const paginatedReferrals = allReferrals.slice(skip, skip + limit);
    const totalPages = Math.ceil(allReferrals.length / limit);

    // Calculate stats
    const stats = {
      totalReferrals: allReferrals.length,
      completedReferrals: allReferrals.filter(r => r.status === 'completed').length,
      pendingReferrals: allReferrals.filter(r => r.status === 'pending').length,
      totalBonusPaid: allReferrals.reduce((sum, r) => sum + (r.bonusEarned || 0), 0),
      averageProfileCompletion: allReferrals.length > 0 
        ? allReferrals.reduce((sum, r) => sum + r.profileCompletion, 0) / allReferrals.length 
        : 0
    };

    res.json({
      success: true,
      referrals: paginatedReferrals,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: allReferrals.length,
        itemsPerPage: limit
      },
      stats: stats
    });

  } catch (error) {
    console.error('Error fetching detailed referrals for admin:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch referral details',
      error: error.message
    });
  }
});

// Migration endpoint for new referral system
router.post('/migrate-referral-system', verifyAdminAuth, async (req, res) => {
  try {
    const { migrateUsersToNewReferralSystem } = require('./utils/migrationUtils');
    const result = await migrateUsersToNewReferralSystem();
    
    res.json({
      success: result.success,
      message: result.success 
        ? `Migration completed. ${result.migratedCount} users migrated.`
        : 'Migration failed',
      migratedCount: result.migratedCount || 0,
      error: result.error || null
    });

  } catch (error) {
    console.error('Migration endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Migration failed',
      error: error.message
    });
  }
});

// Challenge Management Routes

// Get all challenges
router.get('/challenges', async (req, res) => {
  try {
    const Challenge = require('./models/Challenge');
    const challenges = await Challenge.find().sort({ priority: 1, createdAt: -1 });
    res.json({ success: true, challenges });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new challenge
router.post('/challenges', async (req, res) => {
  try {
    const Challenge = require('./models/Challenge');
    const challenge = new Challenge(req.body);
    await challenge.save();
    res.json({ success: true, challenge });
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update challenge
router.put('/challenges/:id', async (req, res) => {
  try {
    const Challenge = require('./models/Challenge');
    const challenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }
    res.json({ success: true, challenge });
  } catch (error) {
    console.error('Error updating challenge:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete challenge
router.delete('/challenges/:id', async (req, res) => {
  try {
    const Challenge = require('./models/Challenge');
    const challenge = await Challenge.findByIdAndDelete(req.params.id);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }
    res.json({ success: true, message: 'Challenge deleted successfully' });
  } catch (error) {
    console.error('Error deleting challenge:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update trading account
router.put('/api/admin/trading-accounts/:id', async (req, res) => {
  try {
    const TradingAccount = require('./models/TradingAccount');
    const account = await TradingAccount.findById(req.params.id);
    if (!account) {
      return res.status(404).json({ success: false, message: 'Trading account not found' });
    }

    const updateData = req.body;
    Object.assign(account, updateData);
    account.updatedAt = new Date();
    await account.save();

    res.json({ success: true, account });
  } catch (error) {
    console.error('Error updating trading account:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update challenge sale status
router.put('/challenges/:id/sale-status', async (req, res) => {
  try {
    const Challenge = require('./models/Challenge');
    const { saleStatus } = req.body;
    
    if (!['active', 'stopped', 'inactive'].includes(saleStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sale status. Must be active, stopped, or inactive'
      });
    }
    
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }
    
    challenge.saleStatus = saleStatus;
    challenge.updatedAt = new Date();
    await challenge.save();
    
    res.json({ success: true, challenge });
  } catch (error) {
    console.error('Error updating challenge sale status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Toggle challenge status
router.put('/challenges/:id/toggle', async (req, res) => {
  try {
    const Challenge = require('./models/Challenge');
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }
    challenge.isActive = !challenge.isActive;
    challenge.updatedAt = new Date();
    await challenge.save();
    res.json({ success: true, challenge });
  } catch (error) {
    console.error('Error toggling challenge status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Assign challenge to user
router.post('/challenges/assign', async (req, res) => {
  try {
    const { userId, challengeId, accountSize, platform, adminNote } = req.body;
    
    if (!userId || !challengeId || !accountSize || !platform) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const Challenge = require('./models/Challenge');
    const challenge = await Challenge.findById(challengeId);
    if (!challenge || !challenge.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found or inactive'
      });
    }

    const price = challenge.pricesByAccountSize.get(accountSize.toString());
    if (!price) {
      return res.status(400).json({
        success: false,
        message: 'Invalid account size for this challenge'
      });
    }

    // Add challenge to user
    const challengeEntry = {
      challengeId: challenge._id,
      name: challenge.name,
      type: challenge.type,
      model: challenge.model,
      accountSize: accountSize,
      profitTarget: challenge.profitTargets[0],
      platform: platform,
      price: price,
      status: 'active',
      assignedBy: 'admin',
      adminNote: adminNote || null
    };

    user.challenges.push(challengeEntry);
    await user.save();

    // Create notification
    const Notification = require('./models/Notification');
    const notification = new Notification({
      userId: user._id,
      title: 'Challenge Assigned',
      message: `Admin has assigned you ${challenge.name} with ${accountSize} account size`,
      type: 'challenge_status_update',
      priority: 'medium'
    });
    await notification.save();

    res.json({
      success: true,
      message: 'Challenge assigned successfully',
      challenge: challengeEntry
    });
  } catch (error) {
    console.error('Error assigning challenge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign challenge',
      error: error.message
    });
  }
});

// Assign a trading account to a specific user's challenge entry
router.post('/users/:uid/challenges/:challengeEntryId/assign-trading-account', verifyAdminAuth, async (req, res) => {
  try {
    const { uid, challengeEntryId } = req.params;
    const { accountId } = req.body;
    const { User } = require('./schema');
    const TradingAccount = require('./models/TradingAccount');

    if (!accountId) return res.status(400).json({ success: false, message: 'accountId is required' });

    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const entry = user.challenges.id(challengeEntryId);
    if (!entry) return res.status(404).json({ success: false, message: 'Challenge entry not found' });

    // Load account
    const account = await TradingAccount.findById(accountId);
    if (!account) return res.status(404).json({ success: false, message: 'Trading account not found' });
    if (account.isAssigned) return res.status(400).json({ success: false, message: 'Trading account already assigned' });

    // Assign to user in TradingAccount and mark assigned (one account -> one challenge)
    await account.assignToUser(user._id, user.email, null);

    // Attach snapshot to user challenge entry
    entry.tradingAccountId = account._id;
    entry.tradingAssignedAt = new Date();
    entry.tradingAccount = {
      provider: account.accountType || 'Demo',
      accountName: account.accountName,
      brokerName: account.brokerName,
      serverId: account.serverId,
      loginId: account.loginId,
      password: account.password,
      serverAddress: account.serverAddress,
      platform: account.platform,
      leverage: account.leverage,
      currency: account.currency
    };

    await user.save();

    // Notify user
    try {
      const NotificationService = require('./utils/notificationService');
      await NotificationService.notifyTradingAccountAssigned(user._id, {
        challengeName: entry.name,
        accountName: account.accountName,
        brokerName: account.brokerName,
        loginId: account.loginId,
        platform: account.platform
      });
    } catch (_) {}

    res.json({ success: true, message: 'Trading account assigned to challenge', challenge: entry });
  } catch (error) {
    console.error('Assign trading account to challenge error:', error);
    res.status(500).json({ success: false, message: 'Failed to assign trading account', error: error.message });
  }
});

// Update user challenge status
router.put('/api/admin/challenges/:userId/:challengeEntryId/status', async (req, res) => {
  try {
    const { userId, challengeEntryId } = req.params;
    const { status, adminNote } = req.body;
    
    // Validate status value
    const validStatuses = ['active', 'inactive', 'expired', 'failed', 'passed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const challengeEntry = user.challenges.id(challengeEntryId);
    if (!challengeEntry) {
      return res.status(404).json({
        success: false,
        message: 'Challenge entry not found'
      });
    }

    challengeEntry.status = status;
    challengeEntry.adminNote = adminNote || challengeEntry.adminNote;
    
    // Set endedAt for completed/final statuses
    if (['expired', 'failed', 'passed', 'cancelled', 'inactive'].includes(status)) {
      challengeEntry.endedAt = new Date();
    }
    
    await user.save();

    // Create notification
    const Notification = require('./models/Notification');
    const notification = new Notification({
      userId: user._id,
      title: 'Challenge Status Updated',
      message: `Your ${challengeEntry.name} challenge status has been updated to ${status}`,
      type: 'challenge_status_update',
      priority: 'medium'
    });
    await notification.save();

    res.json({
      success: true,
      message: 'Challenge status updated successfully',
      challenge: challengeEntry
    });
  } catch (error) {
    console.error('Error updating challenge status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update challenge status',
      error: error.message
    });
  }
});

// Get user challenges
router.get('/users/:uid/challenges', async (req, res) => {
  try {
    const { uid } = req.params;
    
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      challenges: user.challenges || []
    });
  } catch (error) {
    console.error('Error fetching user challenges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user challenges',
      error: error.message
    });
  }
});

module.exports = router;
