'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../user/components/Header';
import Footer from '../../user/components/Footer';

const PlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('http://localhost:9988/api/plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
      } else {
        setError('Failed to load plans');
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      setError('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="text-center mb-5">
              <h1 className="display-4 fw-bold text-primary mb-3">Trading Plans</h1>
              <p className="lead text-muted">Choose the perfect plan for your trading journey</p>
            </div>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {plans.length === 0 && !error ? (
              <div className="text-center py-5">
                <h3 className="text-muted">No plans available at the moment</h3>
                <p className="text-muted">Please check back later for available plans.</p>
              </div>
            ) : (
              <div className="row g-4">
                {plans.map((plan) => (
                  <div key={plan._id} className="col-md-6 col-lg-3">
                    <div className="card h-100 border-0 shadow-lg">
                      <div className="card-body p-4 text-center">
                        <h5 className="card-title fw-bold mb-3">{plan.name}</h5>
                        <div className="mb-4">
                          <span className="display-6 fw-bold text-primary">${plan.price}</span>
                          <span className="text-muted">/month</span>
                        </div>
                        <p className="card-text text-muted mb-4">{plan.description}</p>
                        
                        <div className="mb-4">
                          <h6 className="fw-bold mb-3">Features:</h6>
                          <ul className="list-unstyled">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="mb-2">
                                <i className="bi bi-check-circle-fill text-success me-2"></i>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mb-4">
                          <div className="row text-center">
                            <div className="col-6">
                              <small className="text-muted">Max Users</small>
                              <div className="fw-bold">{plan.maxUsers}</div>
                            </div>
                            <div className="col-6">
                              <small className="text-muted">Max Transactions</small>
                              <div className="fw-bold">{plan.maxTransactions}</div>
                            </div>
                          </div>
                        </div>

                        <button className="btn btn-primary w-100">
                          Choose Plan
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PlansPage;
