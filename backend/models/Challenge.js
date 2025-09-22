const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  // Admin-defined master challenge configuration
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  type: { type: String, required: true }, // e.g., One Step, Two Step, Zero
  model: { type: String, default: 'FundingPips' },
  profitTargets: [{ type: Number, default: 8 }], // percentages like 8, 10
  // Price per account size in INR (or site currency)
  pricesByAccountSize: {
    type: Map,
    of: Number, // e.g., { '5000': 59, '10000': 99, '25000': 199, ... }
    default: {}
  },
  platforms: [{ type: String }], // e.g., MetaTrader 5, MatchTrader, cTrader
  coupons: [{
    code: { type: String, trim: true },
    discountFlat: { type: Number, default: 0 }, // flat amount off
    discountPercent: { type: Number, default: 0 }, // percent off
    expiresAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true }
  }],
  isActive: { type: Boolean, default: true },
  priority: { type: Number, default: 0 },
}, { timestamps: true });

challengeSchema.index({ isActive: 1, priority: 1 });

module.exports = mongoose.model('Challenge', challengeSchema);


