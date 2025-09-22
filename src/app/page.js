import React from 'react';
import Link from 'next/link';
import Header from './user/components/Header';
import Footer from './user/components/Footer';
import Image from 'next/image';
import ChoosePlanSection from './components/ChoosePlanSection';

export default function Home() {
  return (
    <div className="page-content">
      <Header />

  

      {/* Hero Section - Exact FUNDEDNEXT Style */}
      <section
        className="hero-section hero--landing position-relative overflow-hidden pt-lg-5 pb-lg-0"
        style={{
          backgroundImage: "url('/hero-bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'bottom',
          backgroundRepeat: 'no-repeat',
          minHeight: '96vh',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}
      >


        <div className="container position-relative">
          <div className="row align-items-center">
            <div className="col-lg-8 text-white">
            <h1 className="fw-bold mb-4 text-white hero-heading 
                display-5 display-md-3 display-sm-5">
  Empowering Promising <br />
  <span className="text-white">Traders Worldwide</span>
</h1>


              {/* Key Features - Exact FUNDEDNEXT Layout */}
              <div className="row mb-1 hero-features py-lg-3">
                <div className="col-6 mb-4">
                  <div className="d-flex align-items-center mb-2">
                    <div className=" bg-opacity-20 d-flex align-items-center justify-content-center me-3 hero-feature-icon"
                      style={{ width: '50px', height: '50px' }}>
                      <Image src="/images/90-percent.gif" alt="Simulated Accounts" width={150} height={150} style={{ height: '50px', width: '50px' }} />
                    </div>
                    <div>
                      <div className="h4 fw-bold text-white mb-0">Up to 80%</div>
                      <div className="text-white small">Performance Reward</div>
                    </div>
                  </div>
                </div>

                <div className="col-6 mb-4">
                  <div className="d-flex align-items-center mb-2">
                    <div className=" bg-opacity-20 d-flex align-items-center justify-content-center me-3 hero-feature-icon"
                      style={{ width: '50px', height: '50px' }}>
                      <Image src="/images/simulated-accounts.gif" alt="Simulated Accounts" width={150} height={150} style={{ height: '50px', width: '50px' }} />
                    </div>
                    <div>
                      <div className="h4 fw-bold text-white mb-0">Up to $300k</div>
                      <div className="text-white small">Simulated Accounts</div>
                    </div>
                  </div>
                </div>

                <div className="col-6 mb-4">
                  <div className="d-flex align-items-center mb-2">
                    <div className=" bg-opacity-20 d-flex align-items-center justify-content-center me-3 hero-feature-icon"
                      style={{ width: '50px', height: '50px' }}>
                      <Image src="/images/win.gif" alt="Simulated Accounts" width={250} height={250} style={{ height: '60px', width: '60px' }} />
                    </div>
                    <div>
                      <div className="h4 fw-bold text-white mb-0">24 Hours</div>
                      <div className="text-white small">Guaranteed Reward</div>
                    </div>
                  </div>
                </div>

                <div className="col-6 mb-4">
                  <div className="d-flex align-items-center mb-2">
                    <div className=" bg-opacity-20 d-flex align-items-center justify-content-center me-3 hero-feature-icon"
                      style={{ width: '50px', height: '50px' }}>
                      <Image src="/images/No-time-limit.gif" alt="Simulated Accounts" width={150} height={150} style={{ height: '50px', width: '50px' }} />
                    </div>
                    <div>
                      <div className="h4 fw-bold text-white mb-0">No time limit</div>
                      <div className="text-white small">in Challenge Phase</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call-to-Action  Buttons */}
              <div className="d-flex gap-3 flex-wrap mb-4 hero-cta">
                <Link href="/register" className="btn btn-lg px-5 py-3 fw-bold  rounded-4 d-flex align-items-center gap-2" style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                  border: 'none',
                  fontSize: '1.1rem',
                  color: 'white',
                  backdropFilter: 'blur(20px)', boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
                }}>
                  Start Challenge
                  <i className="bi bi-arrow-down"></i>
                </Link>
                <Link href="/plans" className="btn btn-lg px-5 py-3 fw-bold rounded-4" style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  fontSize: '1.1rem',
                  color: 'white',
                  backdropFilter: 'blur(20px)', boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
                }}>
                  Free Trial
                </Link>
              </div>

              {/* Trustpilot Rating */}
              <div className="d-flex align-items-center gap-2 mb-0 hero-trust">
                <span className="fw-bold text-white">Excellent</span>
                <div className="d-flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i key={star} className="bi bi-star-fill text-success"></i>
                  ))}
                </div>
                <span className="text-white">47 reviews on</span>
                <i className="bi bi-star-fill text-warning"></i>
                <span className="fw-bold text-white">Trustpilot</span>
              </div>
            </div>


          </div>

          {/* Bottom Statistics Panel */}
          <div className="row mt-4">
            <div className="col-12">
              <div className=" rounded-4 p-3 hero-bottom-panel" style={{
                background: 'rgba(60, 58, 58, 0.03)',
                border: '1px solid rgba(124, 124, 124, 0.39)',
                backdropFilter: 'blur(20px)', boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
              }}>
                <div className="row align-items-center ">
                  <div className="col-lg-12">
                    <div className="row text-center justify-content-center ">
                      <div className="col-4 col-md-4 ">
                        <div className="h2 fw-bold text-white mb-1 hero-stat-number">156+</div>
                        <div className="text-white small">FundedNext Accounts</div>
                      </div>
                      <div className="col-4 col-md-4 ">
                        <div className="h2 fw-bold text-white mb-1 hero-stat-number">520+</div>
                        <div className="text-white small">Rewarded Traders</div>
                      </div>
                      <div className="col-4 col-md-4 ">
                        <div className="h2 fw-bold text-white mb-1 hero-stat-number">$185.2k+</div>
                        <div className="text-white small">Total Rewarded</div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>


      </section>


      {(() => {
        const keyHighlights = [
          {
            image: "/images/90-percent.gif",
            alt: "Performance",
            title: "90% Performance Reward in Challenge Phase",
            description: "Achieve higher profit targets during your evaluation phase ."
          },
          {
            image: "/images/No-time-limit.gif",
            alt: "No Time Limit",
            title: "No Time Limits",
            description: "Trade at your own pace without worrying about time constraints or deadlines."
          },
          {
            image: "/images/simulated-accounts.gif",
            alt: "Unlimited Trading",
            title: "Unlimited Trading",
            description: "Trade as much as you want with no restrictions on trading volume or frequency."
          },
          {
            image: "/chart.gif",
            alt: "Live Spreads",
            title: "Guaranteed Live Spreads & High Liquidity",
            description: "Experience tight spreads and high liquidity for optimal trading conditions."
          },
          {
            image: "/analysis.gif",
            alt: "Raw Spreads",
            title: "Raw Spreads",
            description: "Benefit from raw spreads with minimal markups for better trading costs."
          },
          {
            image: "/images/win.gif",
            alt: "Monthly Competition",
            title: "Monthly Competition",
            description: "Compete with other traders monthly for prizes and recognition."
          }
        ];

        // Card style as in "90% Performance Reward in Challenge Phase"
        const cardStyle = {
          background: 'rgba(75, 75, 75, 0.08)',
          border: '1px solid rgba(187, 187, 187, 0.49)',
          backdropFilter: 'blur(10px)',
          boxShadow: 'inset 1px 4px 20px 1px rgba(96, 96, 96, 0.44)'
        };

        return (
          <section className="py-5 key-highlights" style={{
            // backgroundImage: "url('/section-bg.jpg')",
            background: 'linear-gradient(135deg, #110A28 0%, #110A28 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'bottom',
            backgroundRepeat: 'no-repeat',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            backdropFilter: 'blur(10px)',
            color: 'white'
          }}>
            <div className="container">
              <div className="text-center mb-5">
                <h2 className="  display-5 display-md-3 display-sm-5 fw-bold mb-3 text-white ">Key Highlights</h2>
              </div>
              <div className="row g-4">
                {keyHighlights.map((card, idx) => (
                  <div className="col-lg-4 col-md-6" key={idx}>
                    <div className="card shadow-0 h-100 border-0 rounded-4 kh-card" style={cardStyle}>
                      <div className="card-body p-4 text-center">
                        <div className="d-flex align-items-center justify-content-center mb-4 kh-icon"
                          style={{ width: '100px', height: '100px', margin: '0 auto' }}>
                          <Image src={card.image} alt={card.alt} width={100} height={100} />
                        </div>
                        <h5 className="card-title mb-3 text-white kh-title">{card.title}</h5>
                        <p className="card-text text-white-50 kh-desc">
                          {card.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* Platform Features Section - Dark Glossy Theme */}
      <section className="py-5" style={{
        background: 'linear-gradient(135deg,#002260 0%,#110A28 100%)',
        color: 'white'
      }}>
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-6 d-flex flex-column gap-4">
              <div className="w-100">
                <div className="  rounded-4 h-100" style={{
                  background: 'rgba(60, 58, 58, 0.03)',
                  border: '3px solid rgba(67, 34, 124, 0.74)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: ' 5px 4px 20px 1px rgba(70, 74, 103, 0.44)',
                  color: 'white'
                }}>
                  <div className="card-body p-4 text-center">
                    <div className="mb-3">
                      <Image src="/images/90-percent.gif" alt="Standards" width={80} height={80} />
                    </div>
                    <h5 className="card-title mb-3 text-white">Globally Based Standards</h5>
                    <p className="card-text text-white-50">
                      We maintain globally based standards to ensure a fair and transparent trading environment.
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-100">
                <div className=" rounded-4 h-100" style={{
                  background: 'rgba(60, 58, 58, 0.03)',
                  border: '3px solid rgba(67, 34, 124, 0.74)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: ' 5px 4px 20px 1px rgba(70, 74, 103, 0.44)',
                  color: 'white'
                }}>
                  <div className="card-body p-4 text-center">
                    <div className="mb-3">
                      <Image src="/analysis.gif" alt="Trading Conditions" width={80} height={80} />
                    </div>
                    <h5 className="card-title mb-3 text-white">Best Trading Conditions</h5>
                    <p className="card-text text-white-50">
                      Experience the best trading conditions with raw spreads, low commissions, and fast execution.
                    </p>
                  </div>
                </div>
              </div>
            </div>




            <div className="col-lg-6">
              <div className=" rounded-4 h-100" style={{
                background: 'rgba(60, 58, 58, 0.03)',
                border: '3px solid rgba(67, 34, 124, 0.74)',
                backdropFilter: 'blur(20px)',
                boxShadow: ' 5px 4px 20px 1px rgba(70, 74, 103, 0.44)',
                color: 'white'
              }}>
                <div className="card-body p-4 text-center">
                  <div className="mb-3">
                    <Image src="/chart.gif" alt="Trading Platform" width={80} height={80} />
                  </div>
                  <h5 className="card-title mb-3 text-white">Best Trading Platform</h5>
                  <p className="card-text text-white-50 mb-3">
                    Trade on the most popular trading platforms, MetaTrader 4 and MetaTrader 5, with the best trading conditions.
                  </p>
                  <div className="d-flex justify-content-center gap-3">
                    <div className="rounded p-2" style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>MT4</div>
                    <div className="rounded p-2" style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>MT5</div>
                    <div className="rounded p-2" style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>cTrader</div>
                    <div className="rounded p-2" style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>TradingView</div>
                  </div>
                </div>
              </div>
            </div>


          </div>

          {/* Payment & Platform Logos - Dark Glossy Theme */}
          <div className="text-center mt-5">
            <div className="d-flex justify-content-center align-items-center gap-4 flex-wrap">
              {['Visa', 'Mastercard', 'PayPal', 'Stripe', 'Skrill', 'Neteller', 'Bitcoin', 'Ethereum', 'Litecoin', 'USDT', 'Bank Transfer'].map((payment, index) => (
                <div key={index} className="rounded p-3" style={{
                  minWidth: '80px',
                  background: 'rgba(60, 58, 58, 0.03)',
                  border: '1px solid rgba(124, 124, 124, 0.39)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
                }}>
                  <div className="text-white small fw-medium">{payment}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Choose the Best Plan Section - Dynamic Component */}
      <ChoosePlanSection />

      {/* Rewarding Our Best Traders Section - Dark Glossy Theme */}
      <section className="py-5 best-traders-section" style={{
        background: 'linear-gradient(135deg, #110A28 0%, #110A28 100%)',
        color: 'white'
      }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 col-12">
              <h2 className="display-5 fw-bold mb-4 text-white">Rewarding our best traders</h2>

              {/* Statistics - Dark Glossy Theme */}
              <div className="row mb-4">
                <div className="col-4">
                  <div className="h3 fw-bold mb-1 text-white">156.7K+</div>
                  <div className="text-white-50 small">Funded Traders</div>
                </div>
                <div className="col-4">
                  <div className="h3 fw-bold mb-1 text-white">52.1K+</div>
                  <div className="text-white-50 small">Active Traders</div>
                </div>
                <div className="col-4">
                  <div className="h3 fw-bold mb-1 text-white">$103.8M+</div>
                  <div className="text-white-50 small">Total Payouts</div>
                </div>
              </div>
            </div>

            <div className="col-lg-6 col-12">
              <div className="card border-0 rounded-4" style={{
                background: 'rgba(60, 58, 58, 0.03)',
                border: '3px solid rgba(67, 34, 124, 0.74)',
                backdropFilter: 'blur(20px)',
                boxShadow: ' 5px 4px 20px 1px rgba(70, 74, 103, 0.44)',
                color: 'white'
              }}>
                <div className="card-body">
                  <h5 className="card-title mb-3 text-white">Top Traders</h5>
                  {[
                    { name: 'Trader Name', payout: '4,000.00 USD' },
                    { name: 'Trader Name', payout: '3,500.00 USD' },
                    { name: 'Trader Name', payout: '3,200.00 USD' },
                    { name: 'Trader Name', payout: '2,800.00 USD' },
                    { name: 'Trader Name', payout: '2,500.00 USD' }
                  ].map((trader, index) => (
                    <div key={index} className="d-flex justify-content-between align-items-center mb-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="rounded-circle d-flex align-items-center justify-content-center"
                          style={{
                            width: '40px',
                            height: '40px',
                            background: 'rgba(60, 58, 58, 0.03)',
                            border: '1px solid rgba(124, 124, 124, 0.39)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
                          }}>
                          <i className="bi bi-person text-white"></i>
                        </div>
                        <div>
                          <div className="fw-medium text-white">{trader.name}</div>
                          <div className="text-white-50 small">{trader.payout}</div>
                        </div>
                      </div>
                      <button className="btn btn-sm rounded-4" style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)',
                        color: 'white'
                      }}>View Profile</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Icons Around the World Section - Dark Glossy Theme */}
      <section className="py-5" style={{
        background: 'linear-gradient(135deg, #110A28 0%, #110A28 100%)',
        color: 'white'
      }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3 text-white">Icons Around the World</h2>
            <p className="lead text-white-50">
              We have partnered with some of the most influential figures in the trading and financial world to bring you exclusive insights and challenges.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-lg-4">
              <div className=" rounded-4 h-100" style={{
                background: 'rgba(60, 58, 58, 0.03)',
                border: '3px solid rgba(67, 34, 124, 0.74)',
                backdropFilter: 'blur(20px)',
                boxShadow: ' 5px 4px 20px 1px rgba(70, 74, 103, 0.44)',
                color: 'white'
              }}>
                <div className="card-body p-4 text-center">
                  <div className="position-relative mb-3">
                    <div className="rounded" style={{
                      height: '200px'
                    }}>
                      <div className="d-flex align-items-center justify-content-center h-100">
                        <Image src="/images/win.gif" alt="Video" width={120} height={120} />
                      </div>
                    </div>
                  </div>
                  <h5 className="card-title mb-2 text-white">What does it take to be a successful trader?</h5>
                  <p className="text-white-50 mb-0">Nathan, Australia</p>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className=" rounded-4 h-100" style={{
                background: 'rgba(60, 58, 58, 0.03)',
                border: '3px solid rgba(67, 34, 124, 0.74)',
                backdropFilter: 'blur(20px)',
                boxShadow: ' 5px 4px 20px 1px rgba(70, 74, 103, 0.44)',
                color: 'white'
              }}>
                <div className="card-body p-4 text-center">
                  <div className="position-relative mb-3">
                    <div className="rounded" style={{
                      height: '200px'
                    }}>
                      <div className="d-flex align-items-center justify-content-center h-100">
                        <Image src="/chart.gif" alt="Video" width={120} height={120} />
                      </div>
                    </div>
                  </div>
                  <h5 className="card-title mb-2 text-white">How to get up to 150% profit share?</h5>
                  <p className="text-white-50 mb-0">Chris Gayle, West Indies</p>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className=" rounded-4 h-100" style={{
                background: 'rgba(60, 58, 58, 0.03)',
                border: '3px solid rgba(67, 34, 124, 0.74)',
                backdropFilter: 'blur(20px)',
                boxShadow: ' 5px 4px 20px 1px rgba(70, 74, 103, 0.44)',
                color: 'white'
              }}>
                <div className="card-body p-4 text-center">
                  <div className="position-relative mb-3">
                    <div className="rounded" style={{
                      height: '200px'
                    }}>
                      <div className="d-flex align-items-center justify-content-center h-100">
                        <Image src="/analysis.gif" alt="Video" width={120} height={120} />
                      </div>
                    </div>
                  </div>
                  <h5 className="card-title mb-2 text-white">How to get a 15% profit share from day 1?</h5>
                  <p className="text-white-50 mb-0">David Warner, Australia</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Traders Love Us Section - Dark Glossy Theme */}
      <section className="py-5 testimonials-section" style={{
        background: 'linear-gradient(135deg, #110A28 0%, #110A28 100%)',
        color: 'white'
      }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3 text-white">Our Traders Love Us</h2>
            <p className="lead text-white-50">
              Our traders are our biggest asset, and we are proud to have a community that trusts and loves us.
            </p>

            {/* Trustpilot Rating - Dark Glossy Theme */}
            <div className="d-flex align-items-center justify-content-center gap-3 mb-4">
              <div className="h4 fw-bold text-white mb-0">Excellent 4.9/5</div>
              <div className="d-flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <i key={star} className="bi bi-star-fill text-warning"></i>
                ))}
              </div>
              <div className="text-white-50">Trustpilot</div>
            </div>
          </div>

          {/* Testimonials Grid - Dark Glossy Theme */}
          <div className="row g-4">
            {[
              { rating: 5, text: "Amazing platform! The best funded trading program I've ever used.", verified: true },
              { rating: 5, text: "Excellent support team and transparent rules. Highly recommended!", verified: true },
              { rating: 5, text: "Great experience with quick payouts and fair evaluation process.", verified: true },
              { rating: 5, text: "Best trading conditions and professional service. Love it!", verified: true },
              { rating: 5, text: "Outstanding platform with the best profit sharing in the industry.", verified: true },
              { rating: 5, text: "Fantastic community and excellent trading tools. 5 stars!", verified: true },
              { rating: 5, text: "Reliable platform with fast execution and tight spreads.", verified: true },
              { rating: 5, text: "Professional team and great educational resources. Highly satisfied!", verified: true },
              { rating: 5, text: "Best funded trading program with excellent customer service.", verified: true },
              { rating: 5, text: "Amazing profit sharing and transparent evaluation process.", verified: true },
              { rating: 5, text: "Great platform with the best trading conditions available.", verified: true },
              { rating: 5, text: "Excellent experience with quick funding and fair rules.", verified: true }
            ].map((testimonial, index) => (
              <div key={index} className="col-lg-4 col-md-6">
                <div className=" rounded-4 h-100" style={{
                  background: 'rgba(60, 58, 58, 0.03)',
                  border: '1px solid rgba(124, 124, 124, 0.39)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
                }}>
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i key={star} className={`bi bi-star-fill ${star <= testimonial.rating ? 'text-warning' : 'text-white-50'}`}></i>
                        ))}
                      </div>
                      {testimonial.verified && (
                        <span className="badge rounded-4" style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          backdropFilter: 'blur(20px)',
                          boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)',
                          color: 'white'
                        }}>Verified</span>
                      )}
                    </div>
                    <p className="card-text text-white-50 mb-0">{testimonial.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Events Section - Dark Glossy Theme */}
      <section className="py-5" style={{
        background: 'linear-gradient(135deg, #110A28 0%, #110A28 100%)',
        color: 'white'
      }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3 text-white">Global Events</h2>
            <p className="lead text-white-50">
              Join us at our global events, where we bring together traders, investors, and industry experts from around the world to share insights, network, and celebrate success.
            </p>
          </div>

          <div className="row g-4">
            {[
              { title: "Envision The World", image: "group-outdoors" },
              { title: "Global Summit 2023", image: "people-beach" },
              { title: "The Future of Trading", image: "people-car" },
              { title: "Innovate & Inspire", image: "group-red-shirts" }
            ].map((event, index) => (
              <div key={index} className="col-lg-3 col-md-6">
                <div className=" rounded-4 h-100" style={{
                  background: 'rgba(60, 58, 58, 0.03)',
                  border: '1px solid rgba(124, 124, 124, 0.39)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
                }}>
                  <div className="card-body p-0">
                    <div className="rounded-top" style={{
                      height: '200px'
                    }}>
                      <div className="d-flex align-items-center justify-content-center h-100">
                        <Image src="/images/simulated-accounts.gif" alt="Event" width={80} height={80} />
                      </div>
                    </div>
                    <div className="p-4">
                      <h5 className="card-title mb-0 text-white">{event.title}</h5>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collaborative Venture Powered by Expertise Section - Dark Glossy Theme */}
      <section className="py-5" style={{
        background: 'linear-gradient(135deg, #110A28 0%, #110A28 100%)',
        color: 'white'
      }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h2 className=" display-5 display-md-3 display-sm-5  fw-bold mb-4 text-white">Collaborative Venture Powered by Expertise</h2>
              <p className="lead text-white-50 mb-4">
                We are a team of experienced traders, financial experts, and technology enthusiasts dedicated to providing the best trading experience.
              </p>

              {/* Statistics - Dark Glossy Theme */}
              <div className="row">
                <div className="col-4">
                  <div className="h3 fw-bold mb-1 text-white">180+</div>
                  <div className="text-white-50 small">Countries</div>
                </div>
                <div className="col-4">
                  <div className="h3 fw-bold mb-1 text-white">24/7</div>
                  <div className="text-white-50 small">Live Support</div>
                </div>
                <div className="col-4">
                  <div className="h3 fw-bold mb-1 text-white">4.9/5</div>
                  <div className="text-white-50 small">Trustpilot Rating</div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="text-center">
                <div className="rounded" style={{
                  height: '300px',
                  background: 'rgba(60, 58, 58, 0.03)',
                  border: '1px solid rgba(124, 124, 124, 0.39)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
                }}>
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <Image src="/images/90-percent.gif" alt="Building" width={120} height={120} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trade Smart & Win Section - Dark Glossy Theme */}
      <section className="py-5" style={{
        background: 'linear-gradient(135deg, #110A28 0%, #110A28 100%)',
        color: 'white'
      }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3 text-white">Trade Smart & Win</h2>
            <p className="lead text-white-50">
              Join our community of successful traders and start your journey to financial freedom.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-lg-6">
              <div className=" rounded-4 h-100" style={{
                background: 'rgba(60, 58, 58, 0.03)',
                border: '3px solid rgba(67, 34, 124, 0.74)',
                backdropFilter: 'blur(20px)',
                boxShadow: ' 5px 4px 20px 1px rgba(70, 74, 103, 0.44)',
                color: 'white'
              }}>
                <div className="card-body p-4 text-center">
                  <div className="mb-3">
                    <Image src="/images/No-time-limit.gif" alt="Support" width={80} height={80} />
                  </div>
                  <h5 className="card-title mb-3 text-white">24/7 Human Support</h5>
                  <p className="card-text text-white-50 mb-4">
                    Our dedicated support team is available 24/7 to assist you with any queries or issues.
                  </p>
                  <div className="d-flex gap-3 justify-content-center">
                    <button className="btn rounded-4" style={{
                      background: 'rgba(60, 58, 58, 0.03)',
                      border: '1px solid rgba(124, 124, 124, 0.39)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)',
                      color: 'white'
                    }}>Live Chat</button>
                    <button className="btn rounded-4" style={{
                      background: 'rgba(60, 58, 58, 0.03)',
                      border: '1px solid rgba(124, 124, 124, 0.39)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)',
                      color: 'white'
                    }}>Join Now</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-6">
              <div className=" rounded-4 h-100" style={{
                background: 'rgba(60, 58, 58, 0.03)',
                border: '3px solid rgba(67, 34, 124, 0.74)',
                backdropFilter: 'blur(20px)',
                boxShadow: ' 5px 4px 20px 1px rgba(70, 74, 103, 0.44)',
                color: 'white'
              }}>
                <div className="card-body p-4 text-center">
                  <div className="mb-3">
                    <Image src="/images/simulated-accounts.gif" alt="Community" width={80} height={80} />
                  </div>
                  <h5 className="card-title mb-3 text-white">Join the FN community</h5>
                  <p className="card-text text-white-50 mb-4">
                    Engage with fellow traders, share insights, and learn from the best in our vibrant community.
                  </p>
                  <div className="d-flex gap-3 justify-content-center">
                    <button className="btn rounded-4" style={{
                      background: 'rgba(60, 58, 58, 0.03)',
                      border: '1px solid rgba(124, 124, 124, 0.39)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)',
                      color: 'white'
                    }}>Join Discord</button>
                    <button className="btn rounded-4" style={{
                      background: 'rgba(60, 58, 58, 0.03)',
                      border: '1px solid rgba(124, 124, 124, 0.39)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)',
                      color: 'white'
                    }}>Join Now</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Dark Glossy Theme */}
      <section className="py-5" style={{
        background: 'linear-gradient(135deg, #110A28 0%, #110A28 100%)',
        color: 'white'
      }}>
        <div className="container text-center">
          <h2 className="display-5 display-md-3 display-sm-5 fw-bold mb-4 text-white">Ready to Start Your Trading Journey?</h2>
          <p className="lead mb-4 text-white-50">
            Join thousands of successful traders and start earning from your skills today.
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link href="/register" className="btn btn-lg px-5 py-3 fw-bold rounded-4" style={{
              background: 'rgba(60, 58, 58, 0.03)',
              border: '1px solid rgba(124, 124, 124, 0.39)',
              backdropFilter: 'blur(20px)',
              boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)',
              fontSize: '1.1rem',
              
              color: 'white'
            }}>
              Start Trading Now
            </Link>
            <Link href="/contact" className="btn btn-lg px-5 py-3 fw-bold rounded-4" style={{
              background: 'rgba(60, 58, 58, 0.03)',
              border: '1px solid rgba(124, 124, 124, 0.39)',
              backdropFilter: 'blur(20px)',
              boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)',
              fontSize: '1.1rem',
              color: 'white'
            }}>
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
