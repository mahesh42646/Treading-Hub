const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
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

// Profile Schema
const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
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
  country: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  panCardNumber: {
    type: String,
    trim: true,
    unique: true,
    sparse: true // Allows multiple null values
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
  referralCode: {
    type: String,
    unique: true,
    length: 10
  },
  referredBy: {
    type: String,
    default: null
  },
  referrals: [{
    type: String
  }],
  wallet: {
    balance: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
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
  },
  profileCompletion: {
    percentage: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: false
    },
    completedFields: [{
      type: String
    }],
    kycStatus: {
      type: String,
      enum: ['pending', 'under_review', 'verified', 'rejected'],
      default: 'pending'
    },
    kycDetails: {
      emailVerified: {
        type: Boolean,
        default: false
      },
      panCardVerified: {
        type: Boolean,
        default: false
      },
      profilePhotoUploaded: {
        type: Boolean,
        default: false
      }
    },
    kycSubmission: {
      submittedAt: {
        type: Date
      },
      submittedBy: {
        type: String
      },
      userEmail: {
        type: String
      },
      userPhone: {
        type: String
      }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate referral code function
profileSchema.pre('save', function(next) {
  if (!this.referralCode) {
    this.referralCode = generateReferralCode();
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
