const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  // Referral System - Simple unified approach
  referredByCode: {
    type: String,
    default: null
  },
  myReferralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  myFirstPayment: {
    type: Boolean,
    default: false
  },
  myFirstPlan: {
    type: Boolean,
    default: false
  },
  myFirstPaymentDate: {
    type: Date,
    default: null
  },
  myFirstPaymentAmount: {
    type: Number,
    default: 0
  },
  myProfilePercent: {
    type: Number,
    default: 0
  },
  referrals: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    refState: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending'
    },
    firstPayment: {
      type: Boolean,
      default: false
    },
    firstPlan: {
      type: Boolean,
      default: false
    },
    firstPaymentAmount: {
      type: Number,
      default: 0
    },
    firstPaymentDate: {
      type: Date,
      default: null
    },
    bonusCredited: {
      type: Boolean,
      default: false
    },
    bonusAmount: {
      type: Number,
      default: 0
    },
    profileComplete: {
      type: Number,
      default: 0
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Purchased/Assigned Plans history
  plans: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan'
    },
    name: { type: String },
    price: { type: Number, default: 0 },
    durationDays: { type: Number, default: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
    status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
    assignedBy: { type: String, enum: ['user', 'admin'], default: 'user' },
    createdAt: { type: Date, default: Date.now }
  }],

  // Challenges purchased/assigned to the user
  challenges: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge'
    },
    name: { type: String },
    type: { type: String },
    model: { type: String },
    profitTarget: { type: Number, default: 8 },
    accountSize: { type: Number, required: true },
    platform: { type: String },
    price: { type: Number, default: 0 },
    couponCode: { type: String, default: null },
    status: { type: String, enum: ['active', 'inactive', 'expired', 'failed', 'passed', 'cancelled'], default: 'active' },
    adminNote: { type: String, default: '' },
    assignedBy: { type: String, enum: ['user', 'admin'], default: 'user' },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    // Trading account assignment (optional)
    tradingAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'TradingAccount', default: null },
    tradingAccount: {
      provider: { type: String, default: null },
      accountName: { type: String, default: null },
      brokerName: { type: String, default: null },
      serverId: { type: String, default: null },
      loginId: { type: String, default: null },
      serverAddress: { type: String, default: null },
      platform: { type: String, default: null },
      leverage: { type: String, default: null },
      currency: { type: String, default: null }
    },
    tradingAssignedAt: { type: Date, default: null }
  }],

  // Trading accounts assigned to the user
  tradingAccounts: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    provider: { type: String },
    accountId: { type: String },
    login: { type: String },
    server: { type: String },
    status: { type: String, enum: ['active', 'suspended', 'closed'], default: 'active' },
    assignedBy: { type: String, enum: ['admin'], default: 'admin' },
    createdAt: { type: Date, default: Date.now }
  }],
  totalReferralsBy: {
    type: Number,
    default: 0
  },
  uid: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'blocked'],
    default: 'active'
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },

  // Profile Information - merged from Profile schema
  profile: {
    // Personal Information
    personalInfo: {
      firstName: {
        type: String,
        trim: true
      },
      lastName: {
        type: String,
        trim: true
      },
      gender: {
        type: String,
        enum: ['male', 'female', 'other']
      },
      dateOfBirth: {
        type: Date
      },
      phone: {
        type: String,
        trim: true
      },
      country: {
        type: String,
        trim: true
      },
      city: {
        type: String,
        trim: true
      }
    },

    // KYC Information
    kyc: {
      status: {
        type: String,
        enum: ['not_applied', 'applied', 'approved', 'rejected'],
        default: 'not_applied'
      },
      panCardNumber: {
        type: String,
        trim: true
      },
      panHolderName: {
        type: String,
        trim: true
      },
      panCardImage: {
        type: String
      },
      profilePhoto: {
        type: String
      },
      rejectionNote: {
        type: String,
        default: null
      },
      appliedAt: {
        type: Date
      },
      approvedAt: {
        type: Date
      },
      rejectedAt: {
        type: Date
      },
      approvedBy: {
        type: String
      },
      rejectedBy: {
        type: String
      }
    },

    // Profile Status
    status: {
      isActive: {
        type: Boolean,
        default: false
      },
      completionPercentage: {
        type: Number,
        default: 0
      },
      completedFields: [{
        type: String
      }]
    },

    // Wallet System
    wallet: {
      walletBalance: {
        type: Number,
        default: 0
      },
      referralBalance: {
        type: Number,
        default: 0
      },
      totalDeposits: {
        type: Number,
        default: 0
      },
      totalWithdrawals: {
        type: Number,
        default: 0
      },
      currency: {
        type: String,
        default: 'INR'
      }
    },

    // Transaction History
    transactions: [{
      type: {
        type: String,
        enum: ['deposit', 'withdrawal', 'referral_bonus', 'profit', 'fee'],
        required: true
      },
      amount: {
        type: Number,
        required: true
      },
      description: {
        type: String,
        required: true
      },
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
      },
      paymentMethod: {
        type: String,
        enum: ['razorpay', 'bank_transfer', 'upi', 'card'],
        default: 'razorpay'
      },
      transactionId: {
        type: String
      },
      date: {
        type: Date,
        default: Date.now
      }
    }],

    // Trading Stats (for future development)
    tradingStats: {
      totalTrades: {
        type: Number,
        default: 0
      },
      winningTrades: {
        type: Number,
        default: 0
      },
      totalProfit: {
        type: Number,
        default: 0
      },
      winRate: {
        type: Number,
        default: 0
      }
    }
  }
}, {
  timestamps: true
});

// Create models
const User = mongoose.model('User', userSchema);

module.exports = {
  User
};
