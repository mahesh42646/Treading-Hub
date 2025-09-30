const mongoose = require('mongoose');
const ContentManagement = require('./models/ContentManagement');
require('dotenv').config();

const seedContentData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing content
    await ContentManagement.deleteMany({});
    console.log('Cleared existing content');

    // Home page content
    const homeContent = new ContentManagement({
      page: 'home',
      home: {
        hero: {
          tagline: "Empowering Promising Traders Worldwide",
          features: [
            {
              title: "Up to 80%",
              subtitle: "Performance Reward",
              image: "/images/80-percent.png",
              order: 0
            },
            {
              title: "Up to $300k",
              subtitle: "Simulated Accounts",
              image: "/images/simulated-accounts.gif",
              order: 1
            },
            {
              title: "24 Hours",
              subtitle: "Guaranteed Reward",
              image: "/images/win.gif",
              order: 2
            },
            {
              title: "No time limit",
              subtitle: "in Challenge Phase",
              image: "/images/No-time-limit.gif",
              order: 3
            }
          ],
          rating: {
            text: "Excellent",
            count: 47,
            platform: "Trustpilot"
          }
        },
        bottomStats: {
          accounts: {
            value: "156+",
            label: "Xfunding Flow Accounts"
          },
          traders: {
            value: "520+",
            label: "Rewarded Traders"
          },
          totalRewarded: {
            value: "$185.2k+",
            label: "Total Rewarded"
          }
        },
        topTraders: {
          title: "Rewarding our best traders",
          stats: {
            fundedTraders: {
              value: "156.7K+",
              label: "Funded Traders"
            },
            activeTraders: {
              value: "52.1K+",
              label: "Active Traders"
            },
            totalPayouts: {
              value: "$103.8M+",
              label: "Total Payouts"
            }
          },
          traders: [
            {
              name: "Trader Name",
              payout: "4,000.00 USD",
              order: 0
            },
            {
              name: "Trader Name",
              payout: "3,500.00 USD",
              order: 1
            },
            {
              name: "Trader Name",
              payout: "3,200.00 USD",
              order: 2
            },
            {
              name: "Trader Name",
              payout: "2,800.00 USD",
              order: 3
            },
            {
              name: "Trader Name",
              payout: "2,500.00 USD",
              order: 4
            }
          ]
        },
        testimonials: {
          title: "Our Traders Love Us",
          subtitle: "Our traders are our biggest asset, and we are proud to have a community that trusts and loves us.",
          rating: {
            text: "Excellent 4.9/5",
            platform: "Trustpilot"
          },
          testimonials: [
            {
              rating: 5,
              text: "Amazing platform! The best funded trading program I've ever used.",
              verified: true,
              order: 0
            },
            {
              rating: 5,
              text: "Excellent support team and transparent rules. Highly recommended!",
              verified: true,
              order: 1
            },
            {
              rating: 5,
              text: "Great experience with quick payouts and fair evaluation process.",
              verified: true,
              order: 2
            },
            {
              rating: 5,
              text: "Best trading conditions and professional service. Love it!",
              verified: true,
              order: 3
            },
            {
              rating: 5,
              text: "Outstanding platform with the best profit sharing in the industry.",
              verified: true,
              order: 4
            },
            {
              rating: 5,
              text: "Fantastic community and excellent trading tools. 5 stars!",
              verified: true,
              order: 5
            },
            {
              rating: 5,
              text: "Reliable platform with fast execution and tight spreads.",
              verified: true,
              order: 6
            },
            {
              rating: 5,
              text: "Professional team and great educational resources. Highly satisfied!",
              verified: true,
              order: 7
            },
            {
              rating: 5,
              text: "Best funded trading program with excellent customer service.",
              verified: true,
              order: 8
            },
            {
              rating: 5,
              text: "Amazing profit sharing and transparent evaluation process.",
              verified: true,
              order: 9
            },
            {
              rating: 5,
              text: "Great platform with the best trading conditions available.",
              verified: true,
              order: 10
            },
            {
              rating: 5,
              text: "Excellent experience with quick funding and fair rules.",
              verified: true,
              order: 11
            }
          ]
        }
      }
    });

    // About page content
    const aboutContent = new ContentManagement({
      page: 'about',
      about: {
        keyHighlights: [
          {
            title: "90% Performance Reward in Challenge Phase",
            description: "Achieve higher profit targets during your evaluation phase.",
            image: "/images/80-percent.png",
            order: 0
          },
          {
            title: "No Time Limits",
            description: "Trade at your own pace without worrying about time constraints or deadlines.",
            image: "/images/No-time-limit.gif",
            order: 1
          },
          {
            title: "Unlimited Trading",
            description: "Trade as much as you want with no restrictions on trading volume or frequency.",
            image: "/images/simulated-accounts.gif",
            order: 2
          },
          {
            title: "Guaranteed Live Spreads & High Liquidity",
            description: "Experience tight spreads and high liquidity for optimal trading conditions.",
            image: "/chart.gif",
            order: 3
          },
          {
            title: "Raw Spreads",
            description: "Benefit from raw spreads with minimal markups for better trading costs.",
            image: "/analysis.gif",
            order: 4
          },
          {
            title: "Monthly Competition",
            description: "Compete with other traders monthly for prizes and recognition.",
            image: "/images/win.gif",
            order: 5
          }
        ],
        platformFeatures: [
          {
            title: "Globally Based Standards",
            description: "We maintain globally based standards to ensure a fair and transparent trading environment.",
            image: "/images/80-percent.png",
            platforms: ["MT4", "MT5", "cTrader", "TradingView"],
            order: 0
          },
          {
            title: "Best Trading Conditions",
            description: "Experience the best trading conditions with raw spreads, low commissions, and fast execution.",
            image: "/analysis.gif",
            platforms: ["MT4", "MT5", "cTrader", "TradingView"],
            order: 1
          },
          {
            title: "Best Trading Platform",
            description: "Trade on the most popular trading platforms, MetaTrader 4 and MetaTrader 5, with the best trading conditions.",
            image: "/chart.gif",
            platforms: ["MT4", "MT5", "cTrader", "TradingView"],
            order: 2
          }
        ],
        paymentMethods: [
          { name: "Razor Pay", order: 0 },
          { name: "UPI", order: 1 },
          { name: "Bank Transfer", order: 2 },
          { name: "USDT", order: 3 }
        ],
        iconsAroundWorld: [
          {
            title: "What does it take to be a successful trader?",
            subtitle: "Nathan, Australia",
            image: "/images/win.gif",
            order: 0
          },
          {
            title: "How to get up to 150% profit share?",
            subtitle: "Chris Gayle, West Indies",
            image: "/chart.gif",
            order: 1
          },
          {
            title: "How to get a 15% profit share from day 1?",
            subtitle: "David Warner, Australia",
            image: "/analysis.gif",
            order: 2
          }
        ],
        globalEvents: [
          {
            title: "Envision The World",
            image: "/images/simulated-accounts.gif",
            order: 0
          },
          {
            title: "Global Summit 2023",
            image: "/images/simulated-accounts.gif",
            order: 1
          },
          {
            title: "The Future of Trading",
            image: "/images/simulated-accounts.gif",
            order: 2
          },
          {
            title: "Innovate & Inspire",
            image: "/images/simulated-accounts.gif",
            order: 3
          }
        ],
        collaborativeVenture: {
          title: "Collaborative Venture Powered by Expertise",
          subtitle: "We are a team of experienced traders, financial experts, and technology enthusiasts dedicated to providing the best trading experience.",
          stats: [
            { value: "180+", label: "Countries" },
            { value: "24/7", label: "Live Support" },
            { value: "4.9/5", label: "Trustpilot Rating" }
          ],
          image: "/images/80-percent.png"
        },
        tradeSmartWin: [
          {
            title: "24/7 Human Support",
            description: "Our dedicated support team is available 24/7 to assist you with any queries or issues.",
            image: "/images/No-time-limit.gif",
            buttons: [
              { text: "Live Chat", action: "chat" },
              { text: "Join Now", action: "join" }
            ],
            order: 0
          },
          {
            title: "Join the FN community",
            description: "Engage with fellow traders, share insights, and learn from the best in our vibrant community.",
            image: "/images/simulated-accounts.gif",
            buttons: [
              { text: "Join Discord", action: "discord" },
              { text: "Join Now", action: "join" }
            ],
            order: 1
          }
        ]
      }
    });

    // Contact page content
    const contactContent = new ContentManagement({
      page: 'contact',
      contact: {
        title: "Contact Us",
        subtitle: "Get in touch with our team"
      }
    });

    // Save all content
    await homeContent.save();
    console.log('Home content seeded');

    await aboutContent.save();
    console.log('About content seeded');

    await contactContent.save();
    console.log('Contact content seeded');

    console.log('All content seeded successfully!');
  } catch (error) {
    console.error('Error seeding content:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seed function
seedContentData();
