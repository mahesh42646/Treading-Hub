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

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// User routes
app.use('/api/users', userRoutes);

// Wallet routes
app.use('/api/wallet', walletRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

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

const PORT = process.env.PORT || 9988;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
