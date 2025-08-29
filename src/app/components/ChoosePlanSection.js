'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaCheck, FaTimes } from 'react-icons/fa';

const ChoosePlanSection = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTab, setSelectedTab] = useState('Evaluation');
  const [selectedDuration, setSelectedDuration] = useState('Monthly');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/plans`);
      
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
      } else {
        setError('Failed to load plans');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-5" style={{
        background: 'linear-gradient(135deg, #110A28 0%, #110A28 100%)',
        color: 'white',
        minHeight: '50vh'
      }}>
        <div className="container">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
            <div className="spinner-border text-white" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-5" style={{
      background: 'linear-gradient(135deg, #110A28 0%, #110A28 100%)',
      color: 'white'
    }}>
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold mb-3 text-white">Choose the Best Plan</h2>
        </div>

      

     

        {/* Plans Grid - Dark Glossy Theme */}
        <div className="row g-4 justify-content-center">
          {plans.slice(0, 3).map((plan, index) => {
            const gradients = [
              'linear-gradient(135deg, #ff6b6b, #ee5a24)',
              'linear-gradient(135deg, #4834d4, #686de0)',
              'linear-gradient(135deg, #6c5ce7, #a29bfe)'
            ];
            
            return (
              <div key={plan._id} className="col-lg-4 col-md-6">
                <div className="card border-0 rounded-4 h-100 position-relative overflow-hidden" style={{
                  background: 'rgba(60, 58, 58, 0.03)',
                  border: '3px solid rgba(67, 34, 124, 0.74)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '5px 4px 20px 1px rgba(70, 74, 103, 0.44)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '5px 4px 20px 1px rgba(70, 74, 103, 0.44)';
                }}>
                  
                  {/* Gradient Header */}
                  <div className="position-relative" style={{
                    background: gradients[index % gradients.length],
                    minHeight: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    padding: '2rem 1rem 1rem'
                  }}>
                    {/* Decorative dots */}
                    <div className="position-absolute" style={{
                      top: '10px',
                      right: '10px',
                      display: 'flex',
                      gap: '4px'
                    }}>
                      {[...Array(3)].map((_, i) => (
                        <div key={i} style={{
                          width: '4px',
                          height: '4px',
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.6)'
                        }}></div>
                      ))}
                    </div>
                    
                    <h3 className="text-white fw-bold mb-2" style={{ fontSize: '1.5rem' }}>
                      {plan.name}
                    </h3>
                    <div className="text-center">
                      <span className="display-6 fw-bold text-white">${plan.price}</span>
                      <span className="text-white ms-2">PER {plan.duration} DAYS</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="card-body p-4" style={{ 
                    background: 'rgba(60, 58, 58, 0.03)',
                    border: '3px solid rgba(67, 34, 124, 0.74)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '5px 4px 20px 1px rgba(70, 74, 103, 0.44)'
                  }}>
                    <div className="mb-4">
                      {plan.features && plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="d-flex align-items-center mb-2">
                          <div className="me-3">
                            {featureIndex < 20 ? (
                              <FaCheck className="text-success" size={16} />
                            ) : (
                              <FaTimes className="text-danger" size={16} />
                            )}
                          </div>
                          <span className="text-white-50" style={{ fontSize: '0.9rem' }}>
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <Link 
                      href="/plans" 
                      className="btn w-100 py-3 fw-bold rounded-4 text-white border-0"
                      style={{
                        background: gradients[index % gradients.length],
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      BUY NOW
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="text-center mt-4">
            <div className="alert alert-warning" role="alert">
              {error}
            </div>
          </div>
        )}

        {plans.length === 0 && (
          <div className="text-center mt-4">
            <div className="alert alert-info" role="alert">
              No plans available at the moment.
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ChoosePlanSection;
