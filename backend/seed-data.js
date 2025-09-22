// Seed initial challenge configs: One Step and Two Step
const mongoose = require('mongoose');
require('dotenv').config();

const Challenge = require('./models/Challenge');

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

    const seeds = [
      {
        name: 'Two Step FundingPips',
        description: 'Two Step evaluation with flexible targets',
        type: 'Two Step',
        model: 'FundingPips',
        profitTargets: [8, 10],
        pricesByAccountSize: { '5000': 59, '10000': 99, '25000': 199, '50000': 329, '100000': 529 },
        platforms: ['MetaTrader 5', 'MatchTrader', 'cTrader'],
        isActive: true,
        priority: 1
      },
      {
        name: 'One Step FundingPips',
        description: 'One Step evaluation with same rules',
        type: 'One Step',
        model: 'FundingPips',
        profitTargets: [8, 10],
        pricesByAccountSize: { '5000': 69, '10000': 109, '25000': 219, '50000': 359, '100000': 569 },
        platforms: ['MetaTrader 5', 'MatchTrader', 'cTrader'],
        isActive: true,
        priority: 2
      }
    ];

    for (const s of seeds) {
      const existing = await Challenge.findOne({ name: s.name });
      if (existing) {
        await Challenge.updateOne({ _id: existing._id }, s);
        console.log('Updated challenge:', s.name);
      } else {
        await Challenge.create(s);
        console.log('Created challenge:', s.name);
      }
    }

    console.log('Seed finished');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

if (require.main === module) {
  run();
}


