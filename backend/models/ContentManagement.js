const mongoose = require('mongoose');

// Content Management Schema
const contentManagementSchema = new mongoose.Schema({
  page: {
    type: String,
    enum: ['home', 'about', 'contact'],
    required: true
  },
  
  // Home Page Content
  home: {
    hero: {
      tagline: {
        type: String,
        default: "Empowering Promising Traders Worldwide"
      },
      features: [{
        title: {
          type: String,
          required: true
        },
        subtitle: {
          type: String,
          required: true
        },
        image: {
          type: String,
          required: true
        },
        order: {
          type: Number,
          default: 0
        }
      }],
      rating: {
        text: {
          type: String,
          default: "Excellent"
        },
        count: {
          type: Number,
          default: 47
        },
        platform: {
          type: String,
          default: "Trustpilot"
        }
      }
    },
    
    bottomStats: {
      accounts: {
        value: {
          type: String,
          default: "156+"
        },
        label: {
          type: String,
          default: "Xfunding Flow Accounts"
        }
      },
      traders: {
        value: {
          type: String,
          default: "520+"
        },
        label: {
          type: String,
          default: "Rewarded Traders"
        }
      },
      totalRewarded: {
        value: {
          type: String,
          default: "$185.2k+"
        },
        label: {
          type: String,
          default: "Total Rewarded"
        }
      }
    },
    
    topTraders: {
      title: {
        type: String,
        default: "Rewarding our best traders"
      },
      stats: {
        fundedTraders: {
          value: {
            type: String,
            default: "156.7K+"
          },
          label: {
            type: String,
            default: "Funded Traders"
          }
        },
        activeTraders: {
          value: {
            type: String,
            default: "52.1K+"
          },
          label: {
            type: String,
            default: "Active Traders"
          }
        },
        totalPayouts: {
          value: {
            type: String,
            default: "$103.8M+"
          },
          label: {
            type: String,
            default: "Total Payouts"
          }
        }
      },
      traders: [{
        name: {
          type: String,
          required: true
        },
        payout: {
          type: String,
          required: true
        },
        order: {
          type: Number,
          default: 0
        }
      }]
    },
    
    testimonials: {
      title: {
        type: String,
        default: "Our Traders Love Us"
      },
      subtitle: {
        type: String,
        default: "Our traders are our biggest asset, and we are proud to have a community that trusts and loves us."
      },
      rating: {
        text: {
          type: String,
          default: "Excellent 4.9/5"
        },
        platform: {
          type: String,
          default: "Trustpilot"
        }
      },
      testimonials: [{
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5
        },
        text: {
          type: String,
          required: true
        },
        verified: {
          type: Boolean,
          default: true
        },
        order: {
          type: Number,
          default: 0
        }
      }]
    }
  },
  
  // About Page Content
  about: {
    keyHighlights: [{
      title: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: true
      },
      image: {
        type: String,
        required: true
      },
      order: {
        type: Number,
        default: 0
      }
    }],
    
    platformFeatures: [{
      title: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: true
      },
      image: {
        type: String,
        required: true
      },
      platforms: [{
        type: String
      }],
      order: {
        type: Number,
        default: 0
      }
    }],
    
    paymentMethods: [{
      name: {
        type: String,
        required: true
      },
      order: {
        type: Number,
        default: 0
      }
    }],
    
    iconsAroundWorld: [{
      title: {
        type: String,
        required: true
      },
      subtitle: {
        type: String,
        required: true
      },
      image: {
        type: String,
        required: true
      },
      order: {
        type: Number,
        default: 0
      }
    }],
    
    globalEvents: [{
      title: {
        type: String,
        required: true
      },
      image: {
        type: String,
        required: true
      },
      order: {
        type: Number,
        default: 0
      }
    }],
    
        collaborativeVenture: {
          title: {
            type: String,
            default: "Collaborative Venture Powered by Expertise"
          },
          subtitle: {
            type: String,
            default: "We are a team of experienced traders, financial experts, and technology enthusiasts dedicated to providing the best trading experience."
          },
          stats: [{
            value: {
              type: String,
              required: true
            },
            label: {
              type: String,
              required: true
            }
          }],
          image: {
            type: String,
            default: "/images/80-percent.png"
          }
        },
    
    tradeSmartWin: [{
      title: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: true
      },
      image: {
        type: String,
        required: true
      },
      buttons: [{
        text: {
          type: String,
          required: true
        },
        action: {
          type: String,
          required: true
        }
      }],
      order: {
        type: Number,
        default: 0
      }
    }]
  },
  
  // Contact Page Content
  contact: {
    // Add contact page specific content here if needed
    title: {
      type: String,
      default: "Contact Us"
    },
    subtitle: {
      type: String,
      default: "Get in touch with our team"
    }
  }
}, {
  timestamps: true
});

// Create model
const ContentManagement = mongoose.model('ContentManagement', contentManagementSchema);

module.exports = ContentManagement;
