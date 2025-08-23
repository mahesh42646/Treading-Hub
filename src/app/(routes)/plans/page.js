'use client';

import React, { useState } from 'react';
import Header from '../../user/components/Header';
import Footer from '../../user/components/Footer';

export default function Plans() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 99,
      funding: 5000,
      profitShare: 80,
      features: [
        'Up to $5,000 funding',
        '80% profit share',
        'Basic support',
        'Standard evaluation',
        '30-day evaluation period',
        'Basic trading tools'
      ],
      popular: false
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 199,
      funding: 25000,
      profitShare: 85,
      features: [
        'Up to $25,000 funding',
        '85% profit share',
        'Priority support',
        'Advanced evaluation',
        '60-day evaluation period',
        'Advanced trading tools',
        'Personal account manager'
      ],
      popular: true
    },
    {
      id: 'elite',
      name: 'Elite',
      price: 399,
      funding: 100000,
      profitShare: 90,
      features: [
        'Up to $100,000 funding',
        '90% profit share',
        '24/7 support',
        'Premium evaluation',
        '90-day evaluation period',
        'Premium trading tools',
        'Dedicated account manager',
        'Exclusive trading signals'
      ],
      popular: false
    }
  ];

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    
    try {
      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: selectedPlan.price * 100, // Amount in paise
        currency: 'USD',
        name: 'Treading Hub',
        description: `${selectedPlan.name} Plan - $${selectedPlan.funding.toLocaleString()} Funding`,
        image: '/logo.png',
        handler: function (response) {
          // Handle successful payment
          console.log('Payment successful:', response);
          alert('Payment successful! You will receive an email with your evaluation details.');
        },
        prefill: {
          name: '',
          email: '',
          contact: ''
        },
        theme: {
          color: '#0d6efd'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-primary text-white py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto text-center">
              <h1 className="display-4 fw-bold mb-4">Choose Your Trading Plan</h1>
              <p className="lead">
                Start your journey to becoming a funded trader. Select the plan that best fits your goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-5">
        <div className="container">
          <div className="row g-4 justify-content-center">
            {plans.map((plan) => (
              <div key={plan.id} className="col-lg-4 col-md-6">
                <div className={`card h-100 border-0 shadow ${plan.popular ? 'border-primary' : ''}`}>
                  {plan.popular && (
                    <div className="card-header bg-primary text-white text-center py-2">
                      <span className="badge bg-warning text-dark">Most Popular</span>
                    </div>
                  )}
                  <div className="card-body p-4">
                    <div className="text-center mb-4">
                      <h5 className="card-title">{plan.name}</h5>
                      <div className="display-6 fw-bold text-primary mb-2">
                        ${plan.price}
                      </div>
                      <p className="text-muted">One-time fee</p>
                      <div className="h4 text-success mb-2">
                        Up to ${plan.funding.toLocaleString()}
                      </div>
                      <p className="text-muted">Funding Limit</p>
                    </div>
                    
                    <ul className="list-unstyled mb-4">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="mb-2">
                          <i className="bi bi-check-circle text-success me-2"></i>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <div className="text-center">
                      <button
                        className={`btn w-100 ${plan.popular ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => handlePlanSelect(plan)}
                      >
                        Select Plan
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Selected Plan Payment */}
      {selectedPlan && (
        <section className="py-5 bg-light">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-6">
                <div className="card border-0 shadow">
                  <div className="card-body p-4">
                    <h4 className="text-center mb-4">Complete Your Purchase</h4>
                    
                    <div className="bg-light p-3 rounded mb-4">
                      <h6 className="mb-2">Selected Plan: {selectedPlan.name}</h6>
                      <div className="d-flex justify-content-between">
                        <span>Plan Fee:</span>
                        <span className="fw-bold">${selectedPlan.price}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Funding Limit:</span>
                        <span className="fw-bold">${selectedPlan.funding.toLocaleString()}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Profit Share:</span>
                        <span className="fw-bold">{selectedPlan.profitShare}%</span>
                      </div>
                    </div>
                    
                    <button
                      className="btn btn-primary w-100"
                      onClick={handlePayment}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Processing...
                        </>
                      ) : (
                        `Pay $${selectedPlan.price}`
                      )}
                    </button>
                    
                    <button
                      className="btn btn-outline-secondary w-100 mt-2"
                      onClick={() => setSelectedPlan(null)}
                    >
                      Change Plan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Comparison */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold">Plan Comparison</h2>
            <p className="lead text-muted">Compare all features across our plans</p>
          </div>
          
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-dark">
                <tr>
                  <th>Feature</th>
                  <th className="text-center">Starter</th>
                  <th className="text-center">Professional</th>
                  <th className="text-center">Elite</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Funding Limit</td>
                  <td className="text-center">$5,000</td>
                  <td className="text-center">$25,000</td>
                  <td className="text-center">$100,000</td>
                </tr>
                <tr>
                  <td>Profit Share</td>
                  <td className="text-center">80%</td>
                  <td className="text-center">85%</td>
                  <td className="text-center">90%</td>
                </tr>
                <tr>
                  <td>Evaluation Period</td>
                  <td className="text-center">30 days</td>
                  <td className="text-center">60 days</td>
                  <td className="text-center">90 days</td>
                </tr>
                <tr>
                  <td>Support</td>
                  <td className="text-center">Basic</td>
                  <td className="text-center">Priority</td>
                  <td className="text-center">24/7</td>
                </tr>
                <tr>
                  <td>Account Manager</td>
                  <td className="text-center"><i className="bi bi-x text-danger"></i></td>
                  <td className="text-center"><i className="bi bi-check text-success"></i></td>
                  <td className="text-center"><i className="bi bi-check text-success"></i></td>
                </tr>
                <tr>
                  <td>Trading Signals</td>
                  <td className="text-center"><i className="bi bi-x text-danger"></i></td>
                  <td className="text-center"><i className="bi bi-x text-danger"></i></td>
                  <td className="text-center"><i className="bi bi-check text-success"></i></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold">Frequently Asked Questions</h2>
            <p className="lead text-muted">Everything you need to know about our plans</p>
          </div>
          
          <div className="row">
            <div className="col-lg-8 mx-auto">
              <div className="accordion" id="plansFaqAccordion">
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#plansFaq1">
                      What happens after I purchase a plan?
                    </button>
                  </h2>
                  <div id="plansFaq1" className="accordion-collapse collapse show" data-bs-parent="#plansFaqAccordion">
                    <div className="accordion-body">
                      After purchase, you'll receive login credentials for your evaluation account. 
                      You can start trading immediately and work towards meeting the profit targets.
                    </div>
                  </div>
                </div>
                
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#plansFaq2">
                      Can I upgrade my plan later?
                    </button>
                  </h2>
                  <div id="plansFaq2" className="accordion-collapse collapse" data-bs-parent="#plansFaqAccordion">
                    <div className="accordion-body">
                      Yes, you can upgrade to a higher plan at any time. 
                      The difference in cost will be calculated and charged accordingly.
                    </div>
                  </div>
                </div>
                
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#plansFaq3">
                      Is there a refund policy?
                    </button>
                  </h2>
                  <div id="plansFaq3" className="accordion-collapse collapse" data-bs-parent="#plansFaqAccordion">
                    <div className="accordion-body">
                      We offer a 7-day money-back guarantee if you're not satisfied with our service. 
                      Please contact our support team for refund requests.
                    </div>
                  </div>
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