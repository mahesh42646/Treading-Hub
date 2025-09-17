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
  }
}, {
  timestamps: true
});

// Profile Schema - Completely reworked with clean structure
const profileSchema = new mongoose.Schema({
  // Reference to User
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Personal Information
  personalInfo: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
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

}, {
  timestamps: true
});

// Generate referral code function
profileSchema.pre('save', function(next) {
  if (!this.referral.code) {
    this.referral.code = generateReferralCode();
  }
  next();
});

function generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Create models
const User = mongoose.model('User', userSchema);
const Profile = mongoose.model('Profile', profileSchema);

module.exports = {
  User,
  Profile
};
