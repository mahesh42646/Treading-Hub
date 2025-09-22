'use client';

import React from 'react';
import Header from '../../user/components/Header';
import Footer from '../../user/components/Footer';

const RulesPage = () => {
  return (
    <div>
      <Header />
      
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="text-center mb-5 pt-lg-5">
              <h1 className="display-5 display-md-3 display-sm-5 fw-bold text-primary mb-3">Trading Rules</h1>
              <p className="lead text-muted">Important rules and guidelines for successful trading</p>
            </div>

            <div className="card shadow-sm">
              <div className="card-body p-5">
                <h2 className="h4 mb-4">General Trading Rules</h2>
                
                <div className="mb-4">
                  <h5 className="text-primary">1. Risk Management</h5>
                  <ul>
                    <li>Never risk more than 2% of your account on a single trade</li>
                    <li>Always use stop-loss orders to limit potential losses</li>
                    <li>Maintain proper position sizing based on your account balance</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h5 className="text-primary">2. Trading Hours</h5>
                  <ul>
                    <li>Forex markets are open 24/5 (Monday to Friday)</li>
                    <li>Stock markets have specific trading hours</li>
                    <li>Be aware of market holidays and closures</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h5 className="text-primary">3. Leverage Guidelines</h5>
                  <ul>
                    <li>Use leverage responsibly and understand the risks</li>
                    <li>Higher leverage means higher risk</li>
                    <li>Start with lower leverage until you gain experience</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h5 className="text-primary">4. Technical Analysis</h5>
                  <ul>
                    <li>Use multiple timeframes for analysis</li>
                    <li>Combine technical and fundamental analysis</li>
                    <li>Keep a trading journal to track your performance</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h5 className="text-primary">5. Emotional Control</h5>
                  <ul>
                    <li>Don&apos;t let emotions drive your trading decisions</li>
                    <li>Stick to your trading plan</li>
                    <li>Take breaks when needed to maintain focus</li>
                  </ul>
                </div>

                <hr className="my-4" />

                <h2 className="h4 mb-4">Platform-Specific Rules</h2>
                
                <div className="mb-4">
                  <h5 className="text-primary">Account Management</h5>
                  <ul>
                    <li>Keep your account credentials secure</li>
                    <li>Enable two-factor authentication</li>
                    <li>Regularly review your account statements</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h5 className="text-primary">Order Types</h5>
                  <ul>
                    <li>Market orders: Immediate execution at current price</li>
                    <li>Limit orders: Execution at specified price or better</li>
                    <li>Stop orders: Execution when price reaches specified level</li>
                  </ul>
                </div>

                <hr className="my-4" />

                <div className="alert alert-warning">
                  <h5 className="alert-heading">Important Disclaimer</h5>
                  <p className="mb-0">
                    Trading involves substantial risk of loss and is not suitable for all investors. 
                    Past performance is not indicative of future results. Please ensure you understand 
                    the risks involved before trading.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RulesPage;
