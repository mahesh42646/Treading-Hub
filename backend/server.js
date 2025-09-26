const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const multer = require('multer');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: ['https://0fare.com', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '1gb' }));
app.use(express.urlencoded({ extended: true, limit: '1gb' }));
app.use(cookieParser());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uploadsPath: require('path').join(__dirname, 'uploads')
  });
});

// Simple team files check
app.get('/api/check-team-files', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const teamDir = path.join(__dirname, 'uploads', 'team');
  
  try {
    if (fs.existsSync(teamDir)) {
      const files = fs.readdirSync(teamDir);
      res.json({ 
        success: true, 
        message: 'Team directory exists',
        files: files,
        count: files.length
      });
    } else {
      res.json({ 
        success: false, 
        message: 'Team directory does not exist',
        path: teamDir
      });
    }
  } catch (error) {
    res.json({ 
      success: false, 
      error: error.message,
      path: teamDir
    });
  }
});

// Move team image to correct directory
app.post('/api/fix-team-image', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const filename = 'image-1758868079606-254985733.png';
  
  try {
    const sourcePath = path.join(__dirname, 'uploads', filename);
    const teamDir = path.join(__dirname, 'uploads', 'team');
    const destPath = path.join(teamDir, filename);
    
    // Create team directory if it doesn't exist
    if (!fs.existsSync(teamDir)) {
      fs.mkdirSync(teamDir, { recursive: true });
    }
    
    // Check if source file exists
    if (!fs.existsSync(sourcePath)) {
      return res.json({ 
        success: false, 
        message: 'Source file not found',
        sourcePath: sourcePath
      });
    }
    
    // Move the file
    fs.renameSync(sourcePath, destPath);
    
    res.json({ 
      success: true, 
      message: 'File moved successfully',
      from: sourcePath,
      to: destPath,
      newUrl: `/api/uploads/team/${filename}`
    });
  } catch (error) {
    res.json({ 
      success: false, 
      error: error.message
    });
  }
});

// Serve uploaded files
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Test endpoint to check if files exist
app.get('/api/test-file/:filename', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  const filePath = path.join(__dirname, 'uploads', 'team', req.params.filename);
  
  if (fs.existsSync(filePath)) {
    res.json({ 
      success: true, 
      message: 'File exists',
      filePath: filePath,
      url: `/api/uploads/team/${req.params.filename}`
    });
  } else {
    res.json({ 
      success: false, 
      message: 'File not found',
      filePath: filePath,
      searchedIn: path.join(__dirname, 'uploads', 'team')
    });
  }
});

// List all files in uploads directory
app.get('/api/list-files', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const uploadsDir = path.join(__dirname, 'uploads');
    const teamDir = path.join(uploadsDir, 'team');
    const blogsDir = path.join(uploadsDir, 'blogs');
    
    const files = {
      uploads: fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : [],
      team: fs.existsSync(teamDir) ? fs.readdirSync(teamDir) : [],
      blogs: fs.existsSync(blogsDir) ? fs.readdirSync(blogsDir) : []
    };
    
    res.json({ success: true, files });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI , {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Import models
const { User, Profile } = require('./schema');
const Contact = require('./models/Contact');

// Import routes
const userRoutes = require('./routes');
const adminRoutes = require('./adminRoutes');
const walletRoutes = require('./walletRoutes');
const subscriptionRoutes = require('./subscriptionRoutes');

// User routes
app.use('/api/users', userRoutes);

// Wallet routes
app.use('/api/wallet', walletRoutes);

// Subscription routes
app.use('/api', subscriptionRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// Notification routes (mounted directly)
app.get('/api/notifications/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const { limit = 10, skip = 0 } = req.query;
    
    console.log('Fetching notifications for UID:', uid);
    
    const user = await User.findOne({ uid });
    if (!user) {
      console.log('User not found for UID:', uid);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('User found:', user.email, 'User ID:', user._id);

    // Import Notification model directly
    const Notification = require('./models/Notification');
    
    // Fetch notifications directly
    const notifications = await Notification.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const unreadCount = await Notification.countDocuments({ 
      userId: user._id, 
      isRead: false 
    });

    console.log('Notifications found:', notifications.length, 'Unread:', unreadCount);
    console.log('Sample notification:', notifications[0]);

    res.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message
    });
  }
});

// Mark notification as read
app.put('/api/notifications/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { uid } = req.body;
    
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const Notification = require('./models/Notification');
    const result = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: user._id },
      { isRead: true }
    );

    if (result) {
      res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to mark notification as read'
      });
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
});

// Mark all notifications as read
app.put('/api/notifications/read-all', async (req, res) => {
  try {
    const { uid } = req.body;
    
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const Notification = require('./models/Notification');
    const result = await Notification.updateMany(
      { userId: user._id, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
});

// Transaction routes (mounted directly)
app.get('/api/transactions/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const { page = 1, limit = 20, type, status, category } = req.query;
    
    console.log('Fetching transactions for UID:', uid);
    
    const user = await User.findOne({ uid });
    if (!user) {
      console.log('User not found for UID:', uid);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('User found:', user.email, 'User ID:', user._id);

    // Import Transaction model directly
    const Transaction = require('./models/Transaction');
    
    // Build query
    const query = { userId: user._id };
    if (type) query.type = type;
    if (status) query.status = status;
    if (category) query.category = category;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Fetch transactions with pagination
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Transaction.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    // Calculate summary
    const summary = await Transaction.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: null,
          totalDeposits: {
            $sum: {
              $cond: [{ $eq: ['$type', 'deposit'] }, '$amount', 0]
            }
          },
          totalWithdrawals: {
            $sum: {
              $cond: [{ $eq: ['$type', 'withdrawal'] }, '$amount', 0]
            }
          },
          totalBonuses: {
            $sum: {
              $cond: [{ $eq: ['$type', 'referral_bonus'] }, '$amount', 0]
            }
          },
          totalPurchases: {
            $sum: {
              $cond: [{ $eq: ['$type', 'plan_purchase'] }, '$amount', 0]
            }
          }
        }
      }
    ]);

    const summaryData = summary[0] || {
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalBonuses: 0,
      totalPurchases: 0
    };

    console.log('Transactions found:', transactions.length, 'Total:', total);

    res.json({
      success: true,
      transactions,
      summary: summaryData,
      pagination: {
        current: parseInt(page),
        pages: totalPages,
        total: total
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error.message
    });
  }
});

// Contact form endpoint (public)
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, subject, and message are required' 
      });
    }

    const contact = new Contact({
      name,
      email,
      phone,
      subject,
      message
    });

    await contact.save();
    
    res.json({ 
      success: true, 
      message: 'Contact form submitted successfully' 
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit contact form' 
    });
  }
});

// Public endpoints for frontend
app.get('/api/plans', async (req, res) => {
  try {
    const Plan = require('./models/Plan');
    const plans = await Plan.find({ isActive: true }).sort({ priority: 1 });
    res.json({ success: true, plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/faqs', async (req, res) => {
  try {
    const FAQ = require('./models/FAQ');
    const faqs = await FAQ.find({ isActive: true }).sort({ priority: 1 });
    res.json({ success: true, faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Global error handler for multer errors
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: 'File too large. Maximum file size is 20MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'File upload error: ' + error.message
    });
  }
  next(error);
});

app.get('/api/team', async (req, res) => {
  try {
    const Team = require('./models/Team');
    const team = await Team.find({ isActive: true }).sort({ priority: 1 });
    res.json({ success: true, team });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/blogs', async (req, res) => {
  try {
    const Blog = require('./models/Blog');
    const blogs = await Blog.find({ isPublished: true }).sort({ publishedAt: -1 });
    res.json({ success: true, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/news', async (req, res) => {
  try {
    const News = require('./models/News');
    const news = await News.find({ isPublished: true }).sort({ publishedAt: -1 });
    res.json({ success: true, news });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Challenge routes (mounted directly)
app.get('/api/challenges/configs', async (req, res) => {
  try {
    const Challenge = require('./models/Challenge');
    const challenges = await Challenge.find({ 
      isActive: true, 
      saleStatus: 'active' 
    }).sort({ priority: 1 });
    res.json({ success: true, challenges });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/challenges/purchase', async (req, res) => {
  try {
    const { uid, challengeId, accountSize, platform, paymentSource, couponCode } = req.body;
    
    if (!uid || !challengeId || !accountSize || !platform || !paymentSource) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const user = await User.findOne({ uid });
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

    // Resolve price from Map or plain object
    let price = undefined;
    if (challenge.pricesByAccountSize && typeof challenge.pricesByAccountSize.get === 'function') {
      price = challenge.pricesByAccountSize.get(accountSize.toString());
    }
    if (!price && challenge.pricesByAccountSize && typeof challenge.pricesByAccountSize === 'object') {
      price = challenge.pricesByAccountSize[accountSize.toString()];
    }
    if (!price) {
      return res.status(400).json({
        success: false,
        message: 'Invalid account size for this challenge'
      });
    }

    // Apply coupon if provided
    let discountApplied = null;
    if (couponCode && Array.isArray(challenge.coupons) && challenge.coupons.length) {
      const now = new Date();
      const coupon = challenge.coupons.find(c => c.isActive !== false && c.code && c.code.toLowerCase() === couponCode.toLowerCase() && (!c.expiresAt || new Date(c.expiresAt) > now));
      if (coupon) {
        const percentOff = Math.max(0, Math.min(100, coupon.discountPercent || 0));
        const flatOff = Math.max(0, coupon.discountFlat || 0);
        const pctAmount = (percentOff / 100) * price;
        const bestDiscount = Math.max(pctAmount, flatOff);
        const newPrice = Math.max(0, price - bestDiscount);
        discountApplied = { code: coupon.code, percentOff, flatOff, amount: price - newPrice };
        price = newPrice;
      }
    }

    // Ensure wallet structure exists
    if (!user.profile) {
      user.profile = {};
    }
    if (!user.profile.wallet) {
      user.profile.wallet = {
        walletBalance: 0,
        referralBalance: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
        currency: 'INR'
      };
    }

    const currentWalletBalance = Number(user.profile.wallet.walletBalance || 0);
    const currentReferralBalance = Number(user.profile.wallet.referralBalance || 0);

    // Check balance using profile wallet balances
    if (paymentSource === 'wallet' && currentWalletBalance < price) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient wallet balance'
      });
    }

    if (paymentSource === 'referral' && currentReferralBalance < price) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient referral balance'
      });
    }

    // Deduct balance from appropriate wallet
    if (paymentSource === 'wallet') {
      user.profile.wallet.walletBalance = currentWalletBalance - price;
    } else {
      user.profile.wallet.referralBalance = currentReferralBalance - price;
    }

    // Add challenge to user
    const challengeEntry = {
      challengeId: challenge._id,
      name: challenge.name,
      type: challenge.type,
      model: challenge.model,
      accountSize: accountSize,
      profitTarget: challenge.profitTargets[0], // Use first profit target
      platform: platform,
      price: price,
      status: 'active',
      assignedBy: 'user',
      startedAt: new Date(),
      endedAt: challenge.durationDays ? new Date(Date.now() + challenge.durationDays * 24 * 60 * 60 * 1000) : null
    };

    user.challenges.push(challengeEntry);
    await user.save();

    // Create transaction
    const Transaction = require('./models/Transaction');
    const transaction = new Transaction({
      userId: user._id,
      type: 'challenge_purchase',
      amount: price,
      balanceAfter: paymentSource === 'wallet' 
        ? user.profile.wallet.walletBalance 
        : user.profile.wallet.referralBalance,
      source: 'challenge',
      category: 'purchase',
      description: `Purchased ${challenge.name} - ${accountSize} account${discountApplied ? ` (coupon ${discountApplied.code} -${discountApplied.amount})` : ''}`,
      status: 'completed',
      processedBy: 'user',
      processedAt: new Date(),
      metadata: {
        challengeId: challenge._id,
        challengeName: challenge.name,
        accountSize: Number(accountSize),
        platform,
        paymentSource,
        coupon: discountApplied || null
      }
    });
    await transaction.save();

    // Create notification
    const Notification = require('./models/Notification');
    const notification = new Notification({
      userId: user._id,
      title: 'Challenge Purchased',
      message: `You have successfully purchased ${challenge.name} with ${accountSize} account size`,
      type: 'challenge_purchased',
      priority: 'medium',
      relatedType: 'challenge',
      relatedId: challenge._id,
      metadata: { accountSize: Number(accountSize), platform }
    });
    await notification.save();

    // Process referral on first challenge purchase (20% of paid price)
    try {
      const challengesCount = Array.isArray(user.challenges) ? user.challenges.length : 0;
      const isFirstChallenge = challengesCount === 1;
      if (user.referredByCode) {
        const { processFirstPayment } = require('./utils/simpleReferralUtils');
        if (isFirstChallenge) {
          await processFirstPayment(user._id, price, 'challenge');
        } else {
          // Recovery: if referral still pending, complete it now using first challenge price
          const { User } = require('./schema');
          const referrer = await User.findOne({ myReferralCode: user.referredByCode });
          if (referrer) {
            const idx = (referrer.referrals || []).findIndex(r => r.user.toString() === user._id.toString());
            if (idx !== -1 && referrer.referrals[idx].refState !== 'completed') {
              const firstChallenge = user.challenges?.[0];
              const basisPrice = Number(firstChallenge?.price || price || 0);
              const bonusAmount = Math.round(basisPrice * 0.20);
              // Initialize wallet
              if (!referrer.profile) referrer.profile = {};
              if (!referrer.profile.wallet) referrer.profile.wallet = { walletBalance: 0, referralBalance: 0, totalDeposits: 0, totalWithdrawals: 0 };
              referrer.profile.wallet.referralBalance += bonusAmount;
              referrer.referrals[idx].firstPlan = true;
              referrer.referrals[idx].refState = 'completed';
              referrer.referrals[idx].bonusCredited = true;
              referrer.referrals[idx].bonusAmount = bonusAmount;
              referrer.referrals[idx].firstPayment = true;
              referrer.referrals[idx].firstPaymentAmount = basisPrice;
              referrer.referrals[idx].firstPaymentDate = new Date();
              await referrer.save();
              const Transaction = require('./models/Transaction');
              await Transaction.create({
                userId: referrer._id,
                type: 'referral_bonus',
                amount: bonusAmount,
                balanceAfter: referrer.profile.wallet.referralBalance,
                description: `Referral bonus: 20% of ₹${basisPrice} from ${user.email}`,
                status: 'completed',
                source: 'referral',
                category: 'bonus',
                processedAt: new Date(),
                processedBy: 'system',
                metadata: { referredUserId: user._id, paymentType: 'challenge', originalAmount: basisPrice, bonusPercentage: 20 }
              });
              try {
                const NotificationService = require('./utils/notificationService');
                await NotificationService.notifyReferralCompleted(referrer._id, user.email, bonusAmount);
              } catch (_) {}
            }
          }
        }
      }
    } catch (refErr) {
      console.error('Referral processing on challenge purchase failed:', refErr);
    }

    res.json({
      success: true,
      message: 'Challenge purchased successfully',
      challenge: challengeEntry
    });
  } catch (error) {
    console.error('Error purchasing challenge:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to purchase challenge'
    });
  }
});

const PORT = process.env.PORT || 9988;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
