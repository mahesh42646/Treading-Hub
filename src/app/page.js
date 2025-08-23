import React from 'react';
import Link from 'next/link';
import Header from './user/components/Header';
import Footer from './user/components/Footer';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header />
      
      {/* Banner Section - Exact FUNDEDNEXT Style */}
      <section className="py-3" style={{ 
        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        color: 'white'
      }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <p className="mb-0 fw-medium">
                Treading Hub offers up to 150% profit share from day 1. No time limit, no consistency rule, and no minimum trading days.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <Link href="/plans" className="btn btn-light btn-sm px-3">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section - Exact FUNDEDNEXT Style */}
      <section
        className="hero-section position-relative overflow-hidden py-5"
        style={{
          backgroundImage: "url('/hero-bg.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'bottom',
          backgroundRepeat: 'no-repeat',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}
      >
    
        
        <div className="container position-relative">
          <div className="row align-items-center">
            <div className="col-lg-10 text-white">
              <h1 className="display-4 fw-bold mb-5" style={{ 
                fontSize: '3.5rem',
                lineHeight: '1.1',
                color: '#ffffff',
                marginBottom: '2rem'
              }}>
                Empowering Promising<br />
                <span style={{ color: '#ffffff' }}>Traders Worldwide</span>
              </h1>
              
              {/* Key Features - Exact FUNDEDNEXT Layout */}
              <div className="row mb-5">
                <div className="col-6 mb-4">
                  <div className="d-flex align-items-center mb-2">
                    <div className="bg-primary bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center me-3" 
                         style={{ width: '40px', height: '40px' }}>
                      <i className="bi bi-coin text-primary"></i>
                    </div>
                    <div>
                      <div className="h4 fw-bold text-white mb-0">Up to 95%</div>
                      <div className="text-white-50 small">Performance Reward</div>
                    </div>
                  </div>
                </div>
                
                <div className="col-6 mb-4">
                  <div className="d-flex align-items-center mb-2">
                    <div className="bg-primary bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center me-3" 
                         style={{ width: '40px', height: '40px' }}>
                      <i className="bi bi-graph-up text-primary"></i>
                    </div>
                    <div>
                      <div className="h4 fw-bold text-white mb-0">Up to $300k</div>
                      <div className="text-white-50 small">Simulated Accounts</div>
                    </div>
                  </div>
                </div>
                
                <div className="col-6 mb-4">
                  <div className="d-flex align-items-center mb-2">
                    <div className="bg-primary bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center me-3" 
                         style={{ width: '40px', height: '40px' }}>
                      <i className="bi bi-currency-dollar text-primary"></i>
                    </div>
                    <div>
                      <div className="h4 fw-bold text-white mb-0">24 Hours</div>
                      <div className="text-white-50 small">Guaranteed Reward</div>
                    </div>
                  </div>
                </div>
                
                <div className="col-6 mb-4">
                  <div className="d-flex align-items-center mb-2">
                    <div className="bg-primary bg-opacity-20 rounded-circle d-flex align-items-center justify-content-center me-3" 
                         style={{ width: '40px', height: '40px' }}>
                      <i className="bi bi-clock text-primary"></i>
                    </div>
                    <div>
                      <div className="h4 fw-bold text-white mb-0">No time limit</div>
                      <div className="text-white-50 small">in Challenge Phase</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Call-to-Action Buttons */}
              <div className="d-flex gap-3 flex-wrap mb-4">
                <Link href="/register" className="btn btn-lg px-5 py-3 fw-bold d-flex align-items-center gap-2" style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                  border: 'none',
                  fontSize: '1.1rem',
                  color: 'white',
                  borderRadius: '12px'
                }}>
                  Start Challenge
                  <i className="bi bi-arrow-down"></i>
                </Link>
                <Link href="/plans" className="btn btn-lg px-5 py-3 fw-bold" style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  fontSize: '1.1rem',
                  color: 'white',
                  borderRadius: '12px'
                }}>
                  Free Trial
                </Link>
              </div>
              
              {/* Trustpilot Rating */}
              <div className="d-flex align-items-center gap-2 mb-4">
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
          <div className="row mt-5">
            <div className="col-12">
              <div className=" rounded-4 p-4" style={{ 
                background: 'rgba(0, 0, 0, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)'
              }}>
                <div className="row align-items-center">
                  <div className="col-lg-12">
                    <div className="row text-center">
                      <div className="col-md-4 mb-3">
                        <div className="h2 fw-bold text-white mb-1">156.7K+</div>
                        <div className="text-white-50 small">FundedNext Accounts</div>
                      </div>
                      <div className="col-md-4 mb-3">
                        <div className="h2 fw-bold text-white mb-1">52.1K+</div>
                        <div className="text-white-50 small">Rewarded Traders</div>
                      </div>
                      <div className="col-md-4 mb-3">
                        <div className="h2 fw-bold text-white mb-1">$163.6M+</div>
                        <div className="text-white-50 small">Total Rewarded</div>
                      </div>
                    </div>
                  </div>
              
                </div>
              </div>
            </div>
          </div>
        </div>
        
      
      </section>

      {/* Key Highlights Section - Exact FUNDEDNEXT Style */}
      <section className="py-5" style={{ background: '#f8fafc' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Key Highlights</h2>
          </div>
          
          <div className="row g-4">
            <div className="col-lg-4 col-md-6">
              <div className="card h-100 border-0 shadow-sm hover-lift">
                <div className="card-body p-4 text-center">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-4" 
                       style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-person-star text-primary fs-1"></i>
                  </div>
                  <h5 className="card-title mb-3">150% Performance Review in Challenge Phase</h5>
                  <p className="card-text text-muted">
                    Achieve higher profit targets during your evaluation phase with our enhanced performance review system.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-lg-4 col-md-6">
              <div className="card h-100 border-0 shadow-sm hover-lift">
                <div className="card-body p-4 text-center">
                  <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-4" 
                       style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-clock text-success fs-1"></i>
                  </div>
                  <h5 className="card-title mb-3">No Time Limits</h5>
                  <p className="card-text text-muted">
                    Trade at your own pace without worrying about time constraints or deadlines.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-lg-4 col-md-6">
              <div className="card h-100 border-0 shadow-sm hover-lift">
                <div className="card-body p-4 text-center">
                  <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-4" 
                       style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-infinity text-warning fs-1"></i>
                  </div>
                  <h5 className="card-title mb-3">Unlimited Trading</h5>
                  <p className="card-text text-muted">
                    Trade as much as you want with no restrictions on trading volume or frequency.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-lg-4 col-md-6">
              <div className="card h-100 border-0 shadow-sm hover-lift">
                <div className="card-body p-4 text-center">
                  <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-4" 
                       style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-graph-up text-info fs-1"></i>
                  </div>
                  <h5 className="card-title mb-3">Guaranteed Live Spreads & High Liquidity</h5>
                  <p className="card-text text-muted">
                    Experience tight spreads and high liquidity for optimal trading conditions.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-lg-4 col-md-6">
              <div className="card h-100 border-0 shadow-sm hover-lift">
                <div className="card-body p-4 text-center">
                  <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-4" 
                       style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-arrow-left-right text-danger fs-1"></i>
                  </div>
                  <h5 className="card-title mb-3">Raw Spreads</h5>
                  <p className="card-text text-muted">
                    Benefit from raw spreads with minimal markups for better trading costs.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-lg-4 col-md-6">
              <div className="card h-100 border-0 shadow-sm hover-lift">
                <div className="card-body p-4 text-center">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-4" 
                       style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-trophy text-primary fs-1"></i>
                  </div>
                  <h5 className="card-title mb-3">Monthly Competition</h5>
                  <p className="card-text text-muted">
                    Compete with other traders monthly for prizes and recognition.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features Section - Exact FUNDEDNEXT Style */}
      <section className="py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white' }}>
                <div className="card-body p-4 text-center">
                  <div className="mb-3">
                    <i className="bi bi-shield-check fs-1"></i>
                  </div>
                  <h5 className="card-title mb-3">Globally Based Standards</h5>
                  <p className="card-text">
                    We maintain globally based standards to ensure a fair and transparent trading environment.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white' }}>
                <div className="card-body p-4 text-center">
                  <div className="mb-3">
                    <i className="bi bi-laptop fs-1"></i>
                  </div>
                  <h5 className="card-title mb-3">Best Trading Platform</h5>
                  <p className="card-text mb-3">
                    Trade on the most popular trading platforms, MetaTrader 4 and MetaTrader 5, with the best trading conditions.
                  </p>
                  <div className="d-flex justify-content-center gap-3">
                    <div className="bg-white bg-opacity-20 rounded p-2">MT4</div>
                    <div className="bg-white bg-opacity-20 rounded p-2">MT5</div>
                    <div className="bg-white bg-opacity-20 rounded p-2">cTrader</div>
                    <div className="bg-white bg-opacity-20 rounded p-2">TradingView</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm h-100" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: 'white' }}>
                <div className="card-body p-4 text-center">
                  <div className="mb-3">
                    <i className="bi bi-person-check fs-1"></i>
                  </div>
                  <h5 className="card-title mb-3">Best Trading Conditions</h5>
                  <p className="card-text">
                    Experience the best trading conditions with raw spreads, low commissions, and fast execution.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Payment & Platform Logos - Exact FUNDEDNEXT Layout */}
          <div className="text-center mt-5">
            <div className="d-flex justify-content-center align-items-center gap-4 flex-wrap">
              {['Visa', 'Mastercard', 'PayPal', 'Stripe', 'Skrill', 'Neteller', 'Bitcoin', 'Ethereum', 'Litecoin', 'USDT', 'Bank Transfer'].map((payment, index) => (
                <div key={index} className="bg-light rounded p-3" style={{ minWidth: '80px', border: '1px solid #e5e7eb' }}>
                  <div className="text-muted small fw-medium">{payment}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Choose the Best Plan Section - Exact FUNDEDNEXT Style */}
      <section className="py-5" style={{ background: '#f8fafc' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Choose the Best Plan</h2>
          </div>
          
          {/* Plan Tabs - Exact FUNDEDNEXT Layout */}
          <div className="d-flex justify-content-center mb-4">
            <div className="btn-group" role="group">
              <button type="button" className="btn active" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', border: 'none', color: 'white' }}>Evaluation</button>
              <button type="button" className="btn btn-outline-primary">Express</button>
              <button type="button" className="btn btn-outline-primary">Stellar</button>
              <button type="button" className="btn btn-outline-primary">One-Step</button>
            </div>
          </div>
          
          {/* Duration Toggle - Exact FUNDEDNEXT Layout */}
          <div className="d-flex justify-content-center mb-4">
            <div className="btn-group" role="group">
              <button type="button" className="btn active" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', border: 'none', color: 'white' }}>Monthly</button>
              <button type="button" className="btn btn-outline-primary">Lifetime</button>
            </div>
          </div>
          
          {/* Plan Comparison Table - Exact FUNDEDNEXT Layout */}
          <div className="table-responsive">
            <table className="table table-bordered bg-white rounded">
              <thead>
                <tr>
                  <th>Features</th>
                  <th className="text-center">$15K</th>
                  <th className="text-center">$25K</th>
                  <th className="text-center">$50K</th>
                  <th className="text-center">$100K</th>
                  <th className="text-center">$200K</th>
                  <th className="text-center">$300K</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Profit Share</td>
                  <td className="text-center">80%</td>
                  <td className="text-center">80%</td>
                  <td className="text-center">80%</td>
                  <td className="text-center">80%</td>
                  <td className="text-center">80%</td>
                  <td className="text-center">80%</td>
                </tr>
                <tr>
                  <td>Max Daily Loss</td>
                  <td className="text-center">$750</td>
                  <td className="text-center">$1,250</td>
                  <td className="text-center">$2,500</td>
                  <td className="text-center">$5,000</td>
                  <td className="text-center">$10,000</td>
                  <td className="text-center">$15,000</td>
                </tr>
                <tr>
                  <td>Max Overall Loss</td>
                  <td className="text-center">$1,500</td>
                  <td className="text-center">$2,500</td>
                  <td className="text-center">$5,000</td>
                  <td className="text-center">$10,000</td>
                  <td className="text-center">$20,000</td>
                  <td className="text-center">$30,000</td>
                </tr>
                <tr>
                  <td>Trading Period</td>
                  <td className="text-center">Unlimited</td>
                  <td className="text-center">Unlimited</td>
                  <td className="text-center">Unlimited</td>
                  <td className="text-center">Unlimited</td>
                  <td className="text-center">Unlimited</td>
                  <td className="text-center">Unlimited</td>
                </tr>
                <tr>
                  <td>Minimum Trading Days</td>
                  <td className="text-center">None</td>
                  <td className="text-center">None</td>
                  <td className="text-center">None</td>
                  <td className="text-center">None</td>
                  <td className="text-center">None</td>
                  <td className="text-center">None</td>
                </tr>
                <tr>
                  <td>Refundable Fee</td>
                  <td className="text-center">$99</td>
                  <td className="text-center">$199</td>
                  <td className="text-center">$299</td>
                  <td className="text-center">$399</td>
                  <td className="text-center">$499</td>
                  <td className="text-center">$599</td>
                </tr>
                <tr>
                  <td>Scaling Plan</td>
                  <td className="text-center">Yes</td>
                  <td className="text-center">Yes</td>
                  <td className="text-center">Yes</td>
                  <td className="text-center">Yes</td>
                  <td className="text-center">Yes</td>
                  <td className="text-center">Yes</td>
                </tr>
                <tr>
                  <td>Payout Frequency</td>
                  <td className="text-center">Monthly</td>
                  <td className="text-center">Monthly</td>
                  <td className="text-center">Monthly</td>
                  <td className="text-center">Monthly</td>
                  <td className="text-center">Monthly</td>
                  <td className="text-center">Monthly</td>
                </tr>
                <tr>
                  <td></td>
                  <td className="text-center">
                    <Link href="/plans" className="btn btn-sm" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', border: 'none', color: 'white' }}>Get Funded</Link>
                  </td>
                  <td className="text-center">
                    <Link href="/plans" className="btn btn-sm" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', border: 'none', color: 'white' }}>Get Funded</Link>
                  </td>
                  <td className="text-center">
                    <Link href="/plans" className="btn btn-sm" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', border: 'none', color: 'white' }}>Get Funded</Link>
                  </td>
                  <td className="text-center">
                    <Link href="/plans" className="btn btn-sm" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', border: 'none', color: 'white' }}>Get Funded</Link>
                  </td>
                  <td className="text-center">
                    <Link href="/plans" className="btn btn-sm" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', border: 'none', color: 'white' }}>Get Funded</Link>
                  </td>
                  <td className="text-center">
                    <Link href="/plans" className="btn btn-sm" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', border: 'none', color: 'white' }}>Get Funded</Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Rewarding Our Best Traders Section - Exact FUNDEDNEXT Style */}
      <section className="py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h2 className="display-5 fw-bold mb-4">Rewarding our best traders</h2>
              
                          {/* Statistics - Exact FUNDEDNEXT Layout */}
            <div className="row mb-4">
              <div className="col-4">
                <div className="h3 fw-bold mb-1" style={{ color: '#8b5cf6' }}>156.7K+</div>
                <div className="text-muted small">Funded Traders</div>
              </div>
              <div className="col-4">
                <div className="h3 fw-bold mb-1" style={{ color: '#10b981' }}>52.1K+</div>
                <div className="text-muted small">Active Traders</div>
              </div>
              <div className="col-4">
                <div className="h3 fw-bold mb-1" style={{ color: '#f59e0b' }}>$103.8M+</div>
                <div className="text-muted small">Total Payouts</div>
              </div>
            </div>
            </div>
            
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-3">Top Traders</h5>
                  {[
                    { name: 'Trader Name', payout: '4,000.00 USD' },
                    { name: 'Trader Name', payout: '3,500.00 USD' },
                    { name: 'Trader Name', payout: '3,200.00 USD' },
                    { name: 'Trader Name', payout: '2,800.00 USD' },
                    { name: 'Trader Name', payout: '2,500.00 USD' }
                  ].map((trader, index) => (
                    <div key={index} className="d-flex justify-content-between align-items-center mb-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" 
                             style={{ width: '40px', height: '40px' }}>
                          <i className="bi bi-person text-white"></i>
                        </div>
                        <div>
                          <div className="fw-medium">{trader.name}</div>
                          <div className="text-muted small">{trader.payout}</div>
                        </div>
                      </div>
                      <button className="btn btn-outline-primary btn-sm">View Profile</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Icons Around the World Section - Exact FUNDEDNEXT Style */}
      <section className="py-5" style={{ background: '#f8fafc' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Icons Around the World</h2>
            <p className="lead text-muted">
              We have partnered with some of the most influential figures in the trading and financial world to bring you exclusive insights and challenges.
            </p>
          </div>
          
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4 text-center">
                  <div className="position-relative mb-3">
                    <div className="bg-dark rounded" style={{ height: '200px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                      <div className="d-flex align-items-center justify-content-center h-100">
                        <i className="bi bi-play-circle text-white" style={{ fontSize: '3rem' }}></i>
                      </div>
                    </div>
                  </div>
                  <h5 className="card-title mb-2">What does it take to be a successful trader?</h5>
                  <p className="text-muted mb-0">Nathan, Australia</p>
                </div>
              </div>
            </div>
            
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4 text-center">
                  <div className="position-relative mb-3">
                    <div className="bg-dark rounded" style={{ height: '200px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                      <div className="d-flex align-items-center justify-content-center h-100">
                        <i className="bi bi-play-circle text-white" style={{ fontSize: '3rem' }}></i>
                      </div>
                    </div>
                  </div>
                  <h5 className="card-title mb-2">How to get up to 150% profit share?</h5>
                  <p className="text-muted mb-0">Chris Gayle, West Indies</p>
                </div>
              </div>
            </div>
            
            <div className="col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4 text-center">
                  <div className="position-relative mb-3">
                    <div className="bg-dark rounded" style={{ height: '200px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                      <div className="d-flex align-items-center justify-content-center h-100">
                        <i className="bi bi-play-circle text-white" style={{ fontSize: '3rem' }}></i>
                      </div>
                    </div>
                  </div>
                  <h5 className="card-title mb-2">How to get a 15% profit share from day 1?</h5>
                  <p className="text-muted mb-0">David Warner, Australia</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Traders Love Us Section - Exact FUNDEDNEXT Style */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Our Traders Love Us</h2>
            <p className="lead text-muted">
              Our traders are our biggest asset, and we are proud to have a community that trusts and loves us.
            </p>
            
            {/* Trustpilot Rating - Exact FUNDEDNEXT Layout */}
            <div className="d-flex align-items-center justify-content-center gap-3 mb-4">
              <div className="h4 fw-bold text-success mb-0">Excellent 4.9/5</div>
              <div className="d-flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <i key={star} className="bi bi-star-fill text-success"></i>
                ))}
              </div>
              <div className="text-muted">Trustpilot</div>
            </div>
          </div>
          
          {/* Testimonials Grid - Exact FUNDEDNEXT Layout */}
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
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <i key={star} className={`bi bi-star-fill ${star <= testimonial.rating ? 'text-warning' : 'text-muted'}`}></i>
                        ))}
                      </div>
                      {testimonial.verified && (
                        <span className="badge bg-success">Verified</span>
                      )}
                    </div>
                    <p className="card-text text-muted mb-0">{testimonial.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Events Section - Exact FUNDEDNEXT Style */}
      <section className="py-5" style={{ background: '#f8fafc' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Global Events</h2>
            <p className="lead text-muted">
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
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-0">
                    <div className="bg-dark rounded-top" style={{ height: '200px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                      <div className="d-flex align-items-center justify-content-center h-100">
                        <i className="bi bi-people text-white" style={{ fontSize: '3rem' }}></i>
                      </div>
                    </div>
                    <div className="p-4">
                      <h5 className="card-title mb-0">{event.title}</h5>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Collaborative Venture Powered by Expertise Section - Exact FUNDEDNEXT Style */}
      <section className="py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h2 className="display-5 fw-bold mb-4">Collaborative Venture Powered by Expertise</h2>
              <p className="lead text-muted mb-4">
                We are a team of experienced traders, financial experts, and technology enthusiasts dedicated to providing the best trading experience.
              </p>
              
              {/* Statistics - Exact FUNDEDNEXT Layout */}
              <div className="row">
                <div className="col-4">
                  <div className="h3 fw-bold mb-1" style={{ color: '#8b5cf6' }}>180+</div>
                  <div className="text-muted small">Countries</div>
                </div>
                <div className="col-4">
                  <div className="h3 fw-bold mb-1" style={{ color: '#10b981' }}>24/7</div>
                  <div className="text-muted small">Live Support</div>
                </div>
                <div className="col-4">
                  <div className="h3 fw-bold mb-1" style={{ color: '#f59e0b' }}>4.9/5</div>
                  <div className="text-muted small">Trustpilot Rating</div>
                </div>
              </div>
            </div>
            
            <div className="col-lg-6">
              <div className="text-center">
                <div className="bg-dark rounded" style={{ height: '300px', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <i className="bi bi-building text-white" style={{ fontSize: '4rem' }}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trade Smart & Win Section - Exact FUNDEDNEXT Style */}
      <section className="py-5" style={{ background: '#f8fafc' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Trade Smart & Win</h2>
            <p className="lead text-muted">
              Join our community of successful traders and start your journey to financial freedom.
            </p>
          </div>
          
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4 text-center">
                  <div className="mb-3">
                    <i className="bi bi-headset text-primary" style={{ fontSize: '3rem' }}></i>
                  </div>
                  <h5 className="card-title mb-3">24/7 Human Support</h5>
                  <p className="card-text text-muted mb-4">
                    Our dedicated support team is available 24/7 to assist you with any queries or issues.
                  </p>
                  <div className="d-flex gap-3 justify-content-center">
                    <button className="btn" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', border: 'none', color: 'white' }}>Live Chat</button>
                    <button className="btn btn-outline-primary">Join Now</button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4 text-center">
                  <div className="mb-3">
                    <i className="bi bi-globe text-primary" style={{ fontSize: '3rem' }}></i>
                  </div>
                  <h5 className="card-title mb-3">Join the FN community</h5>
                  <p className="card-text text-muted mb-4">
                    Engage with fellow traders, share insights, and learn from the best in our vibrant community.
                  </p>
                  <div className="d-flex gap-3 justify-content-center">
                    <button className="btn" style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', border: 'none', color: 'white' }}>Join Discord</button>
                    <button className="btn btn-outline-primary">Join Now</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Exact FUNDEDNEXT Style */}
      <section className="py-5" style={{ 
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        color: 'white'
      }}>
        <div className="container text-center">
          <h2 className="display-4 fw-bold mb-4">Ready to Start Your Trading Journey?</h2>
          <p className="lead mb-4" style={{ color: '#cbd5e1' }}>
            Join thousands of successful traders and start earning from your skills today.
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link href="/register" className="btn btn-lg px-5 py-3 fw-bold" style={{
              background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              border: 'none',
              fontSize: '1.1rem',
              color: 'white'
            }}>
              Start Trading Now
            </Link>
            <Link href="/contact" className="btn btn-outline-light btn-lg px-5 py-3 fw-bold" style={{
              border: '2px solid rgba(255, 255, 255, 0.3)',
              fontSize: '1.1rem'
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
