const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const { User, Profile } = require('./schema');
const Blog = require('./models/Blog');
const Team = require('./models/Team');
const Contact = require('./models/Contact');
const FAQ = require('./models/FAQ');
const News = require('./models/News');
const Plan = require('./models/Plan');
const Referral = require('./models/Referral');
const Transaction = require('./models/Transaction');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trading-hub', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

// Dummy data arrays
const dummyUsers = [
  {
    uid: 'user1_uid_123456',
    email: 'john.doe@example.com',
    emailVerified: true,
    status: 'active',
    role: 'user'
  },
  {
    uid: 'user2_uid_789012',
    email: 'jane.smith@example.com',
    emailVerified: true,
    status: 'active',
    role: 'user'
  },
  {
    uid: 'user3_uid_345678',
    email: 'mike.wilson@example.com',
    emailVerified: true,
    status: 'active',
    role: 'user'
  },
  {
    uid: 'user4_uid_901234',
    email: 'sarah.jones@example.com',
    emailVerified: false,
    status: 'active',
    role: 'user'
  },
  {
    uid: 'user5_uid_567890',
    email: 'alex.brown@example.com',
    emailVerified: true,
    status: 'active',
    role: 'user'
  }
];

const dummyProfiles = [
  {
    firstName: 'John',
    lastName: 'Doe',
    gender: 'male',
    dateOfBirth: new Date('1990-05-15'),
    country: 'India',
    city: 'Mumbai',
    phone: '+91-9876543210',
    panCardNumber: 'ABCDE1234F',
    panHolderName: 'JOHN DOE',
    referralCode: 'JOHN123456',
    wallet: { balance: 5000, currency: 'USD' },
    tradingStats: {
      totalTrades: 45,
      winningTrades: 32,
      totalProfit: 1250,
      winRate: 71
    },
    profileCompletion: {
      percentage: 100,
      isActive: true,
      completedFields: ['personal', 'kyc', 'documents'],
      kycStatus: 'verified',
      kycDetails: {
        emailVerified: true,
        panCardVerified: true,
        profilePhotoUploaded: true
      }
    }
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    gender: 'female',
    dateOfBirth: new Date('1988-12-20'),
    country: 'India',
    city: 'Delhi',
    phone: '+91-8765432109',
    panCardNumber: 'FGHIJ5678K',
    panHolderName: 'JANE SMITH',
    referralCode: 'JANE789012',
    wallet: { balance: 3200, currency: 'USD' },
    tradingStats: {
      totalTrades: 28,
      winningTrades: 18,
      totalProfit: 850,
      winRate: 64
    },
    profileCompletion: {
      percentage: 100,
      isActive: true,
      completedFields: ['personal', 'kyc', 'documents'],
      kycStatus: 'verified',
      kycDetails: {
        emailVerified: true,
        panCardVerified: true,
        profilePhotoUploaded: true
      }
    }
  },
  {
    firstName: 'Mike',
    lastName: 'Wilson',
    gender: 'male',
    dateOfBirth: new Date('1992-08-10'),
    country: 'India',
    city: 'Bangalore',
    phone: '+91-7654321098',
    panCardNumber: 'LMNOP9012Q',
    panHolderName: 'MIKE WILSON',
    referralCode: 'MIKE345678',
    wallet: { balance: 1800, currency: 'USD' },
    tradingStats: {
      totalTrades: 15,
      winningTrades: 8,
      totalProfit: -200,
      winRate: 53
    },
    profileCompletion: {
      percentage: 85,
      isActive: true,
      completedFields: ['personal', 'kyc'],
      kycStatus: 'under_review',
      kycDetails: {
        emailVerified: true,
        panCardVerified: true,
        profilePhotoUploaded: false
      }
    }
  },
  {
    firstName: 'Sarah',
    lastName: 'Jones',
    gender: 'female',
    dateOfBirth: new Date('1995-03-25'),
    country: 'India',
    city: 'Chennai',
    phone: '+91-6543210987',
    panCardNumber: 'RSTUV3456W',
    panHolderName: 'SARAH JONES',
    referralCode: 'SARAH901234',
    wallet: { balance: 0, currency: 'USD' },
    tradingStats: {
      totalTrades: 0,
      winningTrades: 0,
      totalProfit: 0,
      winRate: 0
    },
    profileCompletion: {
      percentage: 60,
      isActive: false,
      completedFields: ['personal'],
      kycStatus: 'pending',
      kycDetails: {
        emailVerified: false,
        panCardVerified: false,
        profilePhotoUploaded: false
      }
    }
  },
  {
    firstName: 'Alex',
    lastName: 'Brown',
    gender: 'male',
    dateOfBirth: new Date('1987-11-05'),
    country: 'India',
    city: 'Hyderabad',
    phone: '+91-5432109876',
    panCardNumber: 'WXYZA7890B',
    panHolderName: 'ALEX BROWN',
    referralCode: 'ALEX567890',
    wallet: { balance: 7500, currency: 'USD' },
    tradingStats: {
      totalTrades: 67,
      winningTrades: 52,
      totalProfit: 2100,
      winRate: 78
    },
    profileCompletion: {
      percentage: 100,
      isActive: true,
      completedFields: ['personal', 'kyc', 'documents'],
      kycStatus: 'verified',
      kycDetails: {
        emailVerified: true,
        panCardVerified: true,
        profilePhotoUploaded: true
      }
    }
  }
];

const dummyBlogs = [
  {
    title: 'Understanding Cryptocurrency Trading: A Beginner\'s Guide',
    slug: 'cryptocurrency-trading-beginners-guide',
    content: 'Cryptocurrency trading has become increasingly popular in recent years. This comprehensive guide will walk you through the basics of crypto trading, including how to get started, understanding market trends, and developing a trading strategy. We\'ll cover everything from setting up your first wallet to advanced trading techniques.',
    excerpt: 'Learn the fundamentals of cryptocurrency trading with this comprehensive beginner\'s guide.',
    author: 'Trading Hub Team',
    category: 'education',
    tags: ['cryptocurrency', 'trading', 'beginners', 'guide'],
    featuredImage: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800',
    isPublished: true,
    isFeatured: true,
    views: 1250
  },
  {
    title: 'Top 5 Trading Strategies for 2024',
    slug: 'top-5-trading-strategies-2024',
    content: 'As we move into 2024, the trading landscape continues to evolve. In this article, we explore the top 5 trading strategies that are proving effective in current market conditions. From swing trading to day trading, we\'ll analyze each strategy\'s pros and cons.',
    excerpt: 'Discover the most effective trading strategies for 2024 and learn how to implement them.',
    author: 'Market Analyst',
    category: 'trading',
    tags: ['strategies', '2024', 'market-analysis', 'trading-tips'],
    featuredImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    isPublished: true,
    isFeatured: true,
    views: 890
  },
  {
    title: 'The Future of Digital Trading Platforms',
    slug: 'future-digital-trading-platforms',
    content: 'Digital trading platforms are revolutionizing how we trade. From AI-powered analysis tools to blockchain-based settlements, the future of trading is here. This article explores the latest innovations and what they mean for traders.',
    excerpt: 'Explore the cutting-edge innovations shaping the future of digital trading platforms.',
    author: 'Tech Expert',
    category: 'technology',
    tags: ['digital-platforms', 'innovation', 'AI', 'blockchain'],
    featuredImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    isPublished: true,
    isFeatured: false,
    views: 567
  },
  {
    title: 'Risk Management in Trading: Essential Principles',
    slug: 'risk-management-trading-principles',
    content: 'Risk management is the cornerstone of successful trading. This article covers essential risk management principles that every trader should understand and implement. Learn how to protect your capital while maximizing your profit potential.',
    excerpt: 'Master the essential principles of risk management to protect your trading capital.',
    author: 'Risk Management Specialist',
    category: 'education',
    tags: ['risk-management', 'trading-principles', 'capital-protection'],
    featuredImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
    isPublished: true,
    isFeatured: false,
    views: 432
  },
  {
    title: 'Market Psychology: Understanding Trader Behavior',
    slug: 'market-psychology-trader-behavior',
    content: 'Understanding market psychology is crucial for successful trading. This article delves into the psychological aspects of trading, including fear, greed, and crowd behavior. Learn how to control your emotions and make rational trading decisions.',
    excerpt: 'Understand the psychological aspects of trading and learn to control your emotions.',
    author: 'Psychology Expert',
    category: 'education',
    tags: ['psychology', 'emotions', 'behavior', 'trading-mindset'],
    featuredImage: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800',
    isPublished: true,
    isFeatured: false,
    views: 345
  }
];

const dummyTeam = [
  {
    name: 'Rajesh Kumar',
    position: 'CEO & Founder',
    email: 'rajesh.kumar@tradinghub.com',
    phone: '+91-9876543210',
    bio: 'Experienced entrepreneur with 15+ years in fintech and trading platforms. Passionate about democratizing trading access.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/rajesh-kumar',
      twitter: 'https://twitter.com/rajeshkumar',
      github: 'https://github.com/rajeshkumar'
    },
    isActive: true,
    priority: 1,
    department: 'management'
  },
  {
    name: 'Priya Sharma',
    position: 'CTO',
    email: 'priya.sharma@tradinghub.com',
    phone: '+91-8765432109',
    bio: 'Technology leader with expertise in scalable trading platforms and blockchain technology.',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/priya-sharma',
      twitter: 'https://twitter.com/priyasharma',
      github: 'https://github.com/priyasharma'
    },
    isActive: true,
    priority: 2,
    department: 'development'
  },
  {
    name: 'Amit Patel',
    position: 'Head of Trading',
    email: 'amit.patel@tradinghub.com',
    phone: '+91-7654321098',
    bio: 'Former Wall Street trader with 12+ years of experience in equity and derivatives trading.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/amit-patel',
      twitter: 'https://twitter.com/amitpatel'
    },
    isActive: true,
    priority: 3,
    department: 'management'
  },
  {
    name: 'Neha Singh',
    position: 'Senior Developer',
    email: 'neha.singh@tradinghub.com',
    phone: '+91-6543210987',
    bio: 'Full-stack developer specializing in React, Node.js, and real-time trading applications.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/neha-singh',
      github: 'https://github.com/nehasingh'
    },
    isActive: true,
    priority: 4,
    department: 'development'
  },
  {
    name: 'Vikram Mehta',
    position: 'Customer Success Manager',
    email: 'vikram.mehta@tradinghub.com',
    phone: '+91-5432109876',
    bio: 'Dedicated to ensuring customer satisfaction and helping traders succeed on our platform.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/vikram-mehta'
    },
    isActive: true,
    priority: 5,
    department: 'support'
  }
];

const dummyContacts = [
  {
    name: 'Rahul Verma',
    email: 'rahul.verma@email.com',
    phone: '+91-9876543210',
    subject: 'Account Verification Issue',
    message: 'I\'m having trouble with my account verification process. The KYC documents are not being accepted. Please help.',
    status: 'new',
    priority: 'high'
  },
  {
    name: 'Anjali Desai',
    email: 'anjali.desai@email.com',
    phone: '+91-8765432109',
    subject: 'Trading Platform Query',
    message: 'I would like to know more about the advanced trading features available on your platform.',
    status: 'read',
    priority: 'medium'
  },
  {
    name: 'Suresh Reddy',
    email: 'suresh.reddy@email.com',
    phone: '+91-7654321098',
    subject: 'Payment Method Inquiry',
    message: 'What payment methods do you accept for funding my trading account?',
    status: 'replied',
    priority: 'low'
  },
  {
    name: 'Meera Iyer',
    email: 'meera.iyer@email.com',
    phone: '+91-6543210987',
    subject: 'Technical Support Required',
    message: 'The mobile app is crashing when I try to place trades. Need immediate assistance.',
    status: 'new',
    priority: 'urgent'
  },
  {
    name: 'Karan Malhotra',
    email: 'karan.malhotra@email.com',
    phone: '+91-5432109876',
    subject: 'Partnership Opportunity',
    message: 'I represent a financial services company and would like to discuss partnership opportunities.',
    status: 'read',
    priority: 'medium'
  }
];

const dummyFAQs = [
  {
    question: 'How do I create an account on Trading Hub?',
    answer: 'To create an account, click on the "Sign Up" button on our homepage. You\'ll need to provide your email address, create a password, and verify your email. After email verification, you can complete your profile and KYC process.',
    category: 'general',
    isActive: true,
    priority: 1
  },
  {
    question: 'What documents are required for KYC verification?',
    answer: 'For KYC verification, you need to provide: 1) PAN Card, 2) Aadhaar Card or Passport, 3) Recent passport-size photograph, 4) Address proof (utility bill or bank statement). All documents should be clear and valid.',
    category: 'kyc',
    isActive: true,
    priority: 2
  },
  {
    question: 'How long does KYC verification take?',
    answer: 'KYC verification typically takes 24-48 hours after document submission. In some cases, it may take up to 72 hours. You\'ll receive an email notification once your verification is complete.',
    category: 'kyc',
    isActive: true,
    priority: 3
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept various payment methods including UPI, Net Banking, Credit/Debit Cards, and digital wallets like Paytm and Google Pay. All transactions are secure and encrypted.',
    category: 'payment',
    isActive: true,
    priority: 4
  },
  {
    question: 'How do I start trading?',
    answer: 'After completing your profile and KYC verification, you can fund your account and start trading. We provide a demo account for practice. Visit our trading section to access live markets and place your first trade.',
    category: 'trading',
    isActive: true,
    priority: 5
  },
  {
    question: 'What are the trading hours?',
    answer: 'Our platform is available 24/7 for cryptocurrency trading. For equity trading, we follow standard market hours (9:15 AM to 3:30 PM IST, Monday to Friday).',
    category: 'trading',
    isActive: true,
    priority: 6
  },
  {
    question: 'How do I withdraw my funds?',
    answer: 'To withdraw funds, go to your wallet section, click on "Withdraw", enter the amount and your bank details. Withdrawals are processed within 24-48 hours on business days.',
    category: 'payment',
    isActive: true,
    priority: 7
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes, we use bank-level encryption and security measures to protect your data. We are compliant with all regulatory requirements and never share your personal information with third parties.',
    category: 'general',
    isActive: true,
    priority: 8
  }
];

const dummyNews = [
  {
    title: 'Trading Hub Launches New Mobile App with Advanced Features',
    slug: 'trading-hub-launches-new-mobile-app',
    content: 'Trading Hub is excited to announce the launch of our new mobile application featuring advanced trading tools, real-time market data, and enhanced security features. The app is now available for both iOS and Android devices.',
    summary: 'New mobile app with advanced trading features now available for download.',
    author: 'Trading Hub Team',
    category: 'company',
    tags: ['mobile-app', 'launch', 'trading-platform'],
    featuredImage: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
    source: 'Trading Hub',
    sourceUrl: 'https://tradinghub.com/news',
    isPublished: true,
    isBreaking: true,
    isFeatured: true,
    views: 2100
  },
  {
    title: 'Bitcoin Reaches New All-Time High in 2024',
    slug: 'bitcoin-reaches-new-all-time-high-2024',
    content: 'Bitcoin has achieved a new all-time high, surpassing previous records and showing strong market momentum. Analysts attribute this growth to increased institutional adoption and regulatory clarity.',
    summary: 'Bitcoin sets new record high with strong market momentum and institutional adoption.',
    author: 'Market Analyst',
    category: 'market',
    tags: ['bitcoin', 'cryptocurrency', 'market-analysis'],
    featuredImage: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800',
    source: 'Crypto News',
    sourceUrl: 'https://cryptonews.com',
    isPublished: true,
    isBreaking: false,
    isFeatured: true,
    views: 1850
  },
  {
    title: 'New Regulatory Framework for Digital Trading Platforms',
    slug: 'new-regulatory-framework-digital-trading',
    content: 'The government has announced a new regulatory framework for digital trading platforms, aimed at protecting investors and ensuring market integrity. The new regulations will come into effect next month.',
    summary: 'Government introduces new regulations for digital trading platforms to protect investors.',
    author: 'Regulatory Expert',
    category: 'regulatory',
    tags: ['regulation', 'government', 'trading-platforms'],
    featuredImage: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
    source: 'Financial Times',
    sourceUrl: 'https://financialtimes.com',
    isPublished: true,
    isBreaking: false,
    isFeatured: false,
    views: 1200
  },
  {
    title: 'AI-Powered Trading Tools Show Promising Results',
    slug: 'ai-powered-trading-tools-promising-results',
    content: 'Recent studies show that AI-powered trading tools are delivering impressive results, with some platforms reporting 20-30% improvement in trading accuracy. These tools are becoming increasingly popular among retail traders.',
    summary: 'AI trading tools show 20-30% improvement in accuracy, gaining popularity among traders.',
    author: 'Tech Analyst',
    category: 'technology',
    tags: ['AI', 'trading-tools', 'technology'],
    featuredImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    source: 'Tech News',
    sourceUrl: 'https://technews.com',
    isPublished: true,
    isBreaking: false,
    isFeatured: false,
    views: 890
  },
  {
    title: 'Global Markets React to Economic Policy Changes',
    slug: 'global-markets-react-economic-policy-changes',
    content: 'Global markets are experiencing volatility as investors react to recent economic policy changes. Major indices have shown mixed performance, with technology stocks leading the gains while traditional sectors face pressure.',
    summary: 'Global markets show volatility as investors react to economic policy changes.',
    author: 'Global Analyst',
    category: 'global',
    tags: ['global-markets', 'economic-policy', 'volatility'],
    featuredImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
    source: 'Global Finance',
    sourceUrl: 'https://globalfinance.com',
    isPublished: true,
    isBreaking: false,
    isFeatured: false,
    views: 650
  }
];

const dummyPlans = [
  {
    name: 'BASIC',
    description: 'Perfect for beginners starting their trading journey',
    price: 25,
    duration: 30,
    features: [
      'Lorem ipsum dolor sit amet',
      'Lorem ipsum dolor sit amet',
      'Lorem ipsum dolor sit amet',
      'Lorem ipsum dolor sit amet',
      'Lorem ipsum dolor sit amet'
    ],
    isActive: true,
    maxUsers: 1,
    maxTransactions: 50,
    priority: 1
  },
  {
    name: 'STANDARD',
    description: 'Great for intermediate traders',
    price: 35,
    duration: 30,
    features: [
      'Lorem ipsum dolor sit amet',
      'Lorem ipsum dolor sit amet',
      'Lorem ipsum dolor sit amet',
      'Lorem ipsum dolor sit amet',
      'Lorem ipsum dolor sit amet'
    ],
    isActive: true,
    maxUsers: 1,
    maxTransactions: 200,
    priority: 2
  },
  {
    name: 'PREMIUM',
    description: 'Advanced features for professionals',
    price: 50,
    duration: 30,
    features: [
      'Lorem ipsum dolor sit amet',
      'Lorem ipsum dolor sit amet',
      'Lorem ipsum dolor sit amet',
      'Lorem ipsum dolor sit amet',
      'Lorem ipsum dolor sit amet'
    ],
    isActive: true,
    maxUsers: 1,
    maxTransactions: 500,
    priority: 3
  }
];

// Seed function
async function seedData() {
  try {
    console.log('Starting data seeding...');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Profile.deleteMany({});
    await Blog.deleteMany({});
    await Team.deleteMany({});
    await Contact.deleteMany({});
    await FAQ.deleteMany({});
    await News.deleteMany({});
    await Plan.deleteMany({});
    await Referral.deleteMany({});
    await Transaction.deleteMany({});

    // Create users
    console.log('Creating users...');
    const createdUsers = await User.insertMany(dummyUsers);

    // Create profiles with user references
    console.log('Creating profiles...');
    const profilesWithUserIds = dummyProfiles.map((profile, index) => ({
      userId: createdUsers[index]._id,
      personalInfo: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        gender: profile.gender,
        dateOfBirth: profile.dateOfBirth,
        country: profile.country,
        city: profile.city,
        phone: profile.phone
      },
      status: {
        isActive: profile.profileCompletion.isActive,
        completionPercentage: profile.profileCompletion.percentage,
        completedFields: profile.profileCompletion.completedFields
      },
      kyc: {
        status: profile.profileCompletion.kycStatus === 'verified' ? 'approved' : 'not_applied',
        panCardNumber: profile.panCardNumber,
        panHolderName: profile.panHolderName
      },
      referral: {
        code: profile.referralCode || `REF${Date.now()}${index}`,
        referredBy: null
      },
      wallet: {
        walletBalance: profile.wallet.balance,
        referralBalance: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
        currency: 'INR'
      }
    }));
    await Profile.insertMany(profilesWithUserIds);

    // Create other data
    console.log('Creating blogs...');
    await Blog.insertMany(dummyBlogs);

    console.log('Creating team members...');
    await Team.insertMany(dummyTeam);

    console.log('Creating contact inquiries...');
    await Contact.insertMany(dummyContacts);

    console.log('Creating FAQs...');
    await FAQ.insertMany(dummyFAQs);

    console.log('Creating news...');
    await News.insertMany(dummyNews);

    console.log('Creating plans...');
    await Plan.insertMany(dummyPlans);

    console.log('Data seeding completed successfully!');
    console.log(`Created ${createdUsers.length} users with profiles`);
    console.log(`Created ${dummyBlogs.length} blogs`);
    console.log(`Created ${dummyTeam.length} team members`);
    console.log(`Created ${dummyContacts.length} contact inquiries`);
    console.log(`Created ${dummyFAQs.length} FAQs`);
    console.log(`Created ${dummyNews.length} news articles`);
    console.log(`Created ${dummyPlans.length} plans`);

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the seed function
seedData();
