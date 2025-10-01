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
      password: { type: String, default: null },
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

    // UPI deposit requests (manual verification flow)
    upiDeposits: [{
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId()
      },
      upiTransactionId: { type: String, required: true, trim: true },
      amount: { type: Number, required: true },
      status: { type: String, enum: ['pending', 'completed', 'rejected'], default: 'pending' },
      submittedAt: { type: Date, default: Date.now },
      processedAt: { type: Date, default: null },
      adminNote: { type: String, default: '' },
      processedBy: { type: String, default: null }
    }],

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

    // Trading Data (comprehensive trading analytics)
    tradingData: {
      // Account Information
      accountInfo: {
        accountType: {
          type: String,
          enum: ['demo', 'live', 'funded'],
          default: 'demo'
        },
        brokerName: {
          type: String,
          default: ''
        },
        accountNumber: {
          type: String,
          default: ''
        },
        accountBalance: {
          type: Number,
          default: 0
        },
        currency: {
          type: String,
          default: 'USD'
        },
        leverage: {
          type: String,
          default: '1:100'
        },
        platform: {
          type: String,
          default: 'MetaTrader 5'
        },
        accountStatus: {
          type: String,
          enum: ['active', 'suspended', 'closed'],
          default: 'active'
        },
        lastUpdated: {
          type: Date,
          default: Date.now
        }
      },
      
      // All Time Statistics
      allTimeStats: {
        totalTrades: {
          type: Number,
          default: 0
        },
        winningTrades: {
          type: Number,
          default: 0
        },
        losingTrades: {
          type: Number,
          default: 0
        },
        totalProfit: {
          type: Number,
          default: 0
        },
        totalLoss: {
          type: Number,
          default: 0
        },
        netProfit: {
          type: Number,
          default: 0
        },
        winRate: {
          type: Number,
          default: 0
        },
        profitFactor: {
          type: Number,
          default: 0
        },
        averageWin: {
          type: Number,
          default: 0
        },
        averageLoss: {
          type: Number,
          default: 0
        },
        largestWin: {
          type: Number,
          default: 0
        },
        largestLoss: {
          type: Number,
          default: 0
        },
        maxDrawdown: {
          type: Number,
          default: 0
        },
        maxDrawdownPercent: {
          type: Number,
          default: 0
        }
      },
      
      // Last 7 Days Statistics
      last7Days: {
        totalTrades: {
          type: Number,
          default: 0
        },
        winningTrades: {
          type: Number,
          default: 0
        },
        losingTrades: {
          type: Number,
          default: 0
        },
        totalProfit: {
          type: Number,
          default: 0
        },
        totalLoss: {
          type: Number,
          default: 0
        },
        netProfit: {
          type: Number,
          default: 0
        },
        winRate: {
          type: Number,
          default: 0
        },
        profitFactor: {
          type: Number,
          default: 0
        },
        averageWin: {
          type: Number,
          default: 0
        },
        averageLoss: {
          type: Number,
          default: 0
        },
        largestWin: {
          type: Number,
          default: 0
        },
        largestLoss: {
          type: Number,
          default: 0
        },
        maxDrawdown: {
          type: Number,
          default: 0
        },
        maxDrawdownPercent: {
          type: Number,
          default: 0
        }
      },
      
      // Last 30 Days Statistics
      last30Days: {
        totalTrades: {
          type: Number,
          default: 0
        },
        winningTrades: {
          type: Number,
          default: 0
        },
        losingTrades: {
          type: Number,
          default: 0
        },
        totalProfit: {
          type: Number,
          default: 0
        },
        totalLoss: {
          type: Number,
          default: 0
        },
        netProfit: {
          type: Number,
          default: 0
        },
        winRate: {
          type: Number,
          default: 0
        },
        profitFactor: {
          type: Number,
          default: 0
        },
        averageWin: {
          type: Number,
          default: 0
        },
        averageLoss: {
          type: Number,
          default: 0
        },
        largestWin: {
          type: Number,
          default: 0
        },
        largestLoss: {
          type: Number,
          default: 0
        },
        maxDrawdown: {
          type: Number,
          default: 0
        },
        maxDrawdownPercent: {
          type: Number,
          default: 0
        }
      },
      
      // Trading History (recent trades)
      recentTrades: [{
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          default: () => new mongoose.Types.ObjectId()
        },
        tradeId: {
          type: String,
          required: true
        },
        symbol: {
          type: String,
          required: true
        },
        type: {
          type: String,
          enum: ['buy', 'sell'],
          required: true
        },
        volume: {
          type: Number,
          required: true
        },
        openPrice: {
          type: Number,
          required: true
        },
        closePrice: {
          type: Number,
          required: true
        },
        profit: {
          type: Number,
          required: true
        },
        swap: {
          type: Number,
          default: 0
        },
        commission: {
          type: Number,
          default: 0
        },
        netProfit: {
          type: Number,
          required: true
        },
        openTime: {
          type: Date,
          required: true
        },
        closeTime: {
          type: Date,
          required: true
        },
        duration: {
          type: String,
          default: ''
        },
        status: {
          type: String,
          enum: ['open', 'closed'],
          default: 'closed'
        }
      }],
      
      // Performance Metrics
      performanceMetrics: {
        sharpeRatio: {
          type: Number,
          default: 0
        },
        sortinoRatio: {
          type: Number,
          default: 0
        },
        calmarRatio: {
          type: Number,
          default: 0
        },
        recoveryFactor: {
          type: Number,
          default: 0
        },
        expectancy: {
          type: Number,
          default: 0
        },
        riskRewardRatio: {
          type: Number,
          default: 0
        },
        averageTradeDuration: {
          type: String,
          default: '0h 0m'
        },
        tradesPerDay: {
          type: Number,
          default: 0
        },
        consistency: {
          type: Number,
          default: 0
        }
      },
      
      // Risk Management
      riskManagement: {
        maxRiskPerTrade: {
          type: Number,
          default: 0
        },
        maxDailyLoss: {
          type: Number,
          default: 0
        },
        maxDailyProfit: {
          type: Number,
          default: 0
        },
        maxConsecutiveLosses: {
          type: Number,
          default: 0
        },
        maxConsecutiveWins: {
          type: Number,
          default: 0
        },
        currentConsecutiveLosses: {
          type: Number,
          default: 0
        },
        currentConsecutiveWins: {
          type: Number,
          default: 0
        }
      },
      
      // Trading Goals and Targets
      goals: {
        monthlyTarget: {
          type: Number,
          default: 0
        },
        weeklyTarget: {
          type: Number,
          default: 0
        },
        dailyTarget: {
          type: Number,
          default: 0
        },
        maxDrawdownLimit: {
          type: Number,
          default: 0
        },
        profitTarget: {
          type: Number,
          default: 0
        }
      },
      
      // Admin Notes and Comments
      adminNotes: {
        type: String,
        default: ''
      },
      
      // Last Updated by Admin
      lastUpdatedBy: {
        type: String,
        default: ''
      },
      
      // Data Status
      isActive: {
        type: Boolean,
        default: true
      },
      
      // Timestamps
      createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
    },

  },

  // Support Tickets (moved to root level)
  supportTickets: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      default: () => new mongoose.Types.ObjectId()
    },
    ticketId: {
      type: String,
      required: true
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['general', 'technical', 'billing', 'account', 'trading', 'kyc'],
      default: 'general'
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    assignedTo: {
      type: String,
      default: null
    },
    responses: [{
      from: {
        type: String,
        enum: ['user', 'admin'],
        required: true
      },
      message: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    attachments: [{
      filename: String,
      originalName: String,
      mimeType: String,
      size: Number,
      url: String
    }],
    tags: [{
      type: String
    }],
    isResolved: {
      type: Boolean,
      default: false
    },
    resolvedAt: {
      type: Date
    },
    closedAt: {
      type: Date
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Create models
const User = mongoose.model('User', userSchema);

module.exports = {
  User
};
