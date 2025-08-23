import React from 'react';
import Header from '../../user/components/Header';
import Footer from '../../user/components/Footer';

export default function About() {
  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-primary text-white py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto text-center">
              <h1 className="display-4 fw-bold mb-4">About Treading Hub</h1>
              <p className="lead">
                Empowering traders worldwide to achieve financial freedom through 
                innovative funding solutions and comprehensive support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h2 className="display-5 fw-bold mb-4">Our Mission</h2>
              <p className="lead text-muted mb-4">
                At Treading Hub, we believe that talented traders should have access to 
                the capital they need to succeed. Our mission is to bridge the gap 
                between trading talent and funding opportunities.
              </p>
              <p className="text-muted">
                We provide a platform where skilled traders can demonstrate their 
                abilities and receive funding to trade with real capital, while 
                maintaining full control over their trading decisions.
              </p>
            </div>
            <div className="col-lg-6">
              <div className="bg-light p-4 rounded">
                <h4 className="mb-3">What We Offer</h4>
                <ul className="list-unstyled">
                  <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Up to $200,000 in funding</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>90% profit sharing</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Risk-free evaluation process</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>24/7 customer support</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Advanced trading tools</li>
                  <li className="mb-2"><i className="bi bi-check-circle text-success me-2"></i>Educational resources</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold">Our Values</h2>
            <p className="lead text-muted">The principles that guide everything we do</p>
          </div>
          
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{ width: '60px', height: '60px' }}>
                    <i className="bi bi-shield-check text-primary fs-2"></i>
                  </div>
                  <h5 className="card-title">Transparency</h5>
                  <p className="card-text text-muted">
                    We believe in complete transparency in all our processes, 
                    from evaluation criteria to profit sharing.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{ width: '60px', height: '60px' }}>
                    <i className="bi bi-people text-success fs-2"></i>
                  </div>
                  <h5 className="card-title">Community</h5>
                  <p className="card-text text-muted">
                    Building a supportive community of traders who learn, 
                    grow, and succeed together.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{ width: '60px', height: '60px' }}>
                    <i className="bi bi-lightbulb text-warning fs-2"></i>
                  </div>
                  <h5 className="card-title">Innovation</h5>
                  <p className="card-text text-muted">
                    Continuously innovating our platform and services to 
                    provide the best trading experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-5">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-3 mb-4">
              <div className="display-4 fw-bold text-primary mb-2">10,000+</div>
              <p className="text-muted">Active Traders</p>
            </div>
            <div className="col-md-3 mb-4">
              <div className="display-4 fw-bold text-success mb-2">$50M+</div>
              <p className="text-muted">Total Funding Provided</p>
            </div>
            <div className="col-md-3 mb-4">
              <div className="display-4 fw-bold text-warning mb-2">95%</div>
              <p className="text-muted">Success Rate</p>
            </div>
            <div className="col-md-3 mb-4">
              <div className="display-4 fw-bold text-info mb-2">24/7</div>
              <p className="text-muted">Customer Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold">Our Team</h2>
            <p className="lead text-muted">Meet the experts behind Treading Hub</p>
          </div>
          
          <div className="row g-4">
            <div className="col-lg-4 col-md-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-person text-primary fs-1"></i>
                  </div>
                  <h5 className="card-title">John Smith</h5>
                  <p className="text-muted">CEO & Founder</p>
                  <p className="card-text">
                    Former hedge fund manager with 15+ years of experience in 
                    financial markets and trading technology.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-lg-4 col-md-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-person text-success fs-1"></i>
                  </div>
                  <h5 className="card-title">Sarah Johnson</h5>
                  <p className="text-muted">CTO</p>
                  <p className="card-text">
                    Technology expert with deep experience in building 
                    scalable trading platforms and financial systems.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-lg-4 col-md-6">
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center p-4">
                  <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-person text-warning fs-1"></i>
                  </div>
                  <h5 className="card-title">Mike Davis</h5>
                  <p className="text-muted">Head of Trading</p>
                  <p className="card-text">
                    Professional trader with expertise in risk management 
                    and developing trading strategies for funded accounts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 