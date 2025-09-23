'use client';

import React, { useState, useEffect } from 'react';
import Header from '../user/components/Header';
import Footer from '../user/components/Footer';
import { FaCheck, FaTimes, FaStar, FaClock, FaDollarSign, FaTrophy, FaUsers } from 'react-icons/fa';
import Link from 'next/link';

const Challenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [filteredChallenges, setFilteredChallenges] = useState([]);

  useEffect(() => {
    fetchChallenges();
  }, []);

  useEffect(() => {
    filterChallenges();
  }, [challenges, selectedSize, selectedPlatform]);

  const fetchChallenges = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/challenges/configs`);
      
      if (response.ok) {
        const data = await response.json();
        setChallenges(data.challenges || []);
      } else {
        setError('Failed to load challenges');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterChallenges = () => {
    let filtered = [...challenges];
    
    if (selectedSize) {
      filtered = filtered.filter(challenge => {
        if (!challenge.pricesByAccountSize) return false;
        
        if (challenge.pricesByAccountSize instanceof Map) {
          return challenge.pricesByAccountSize.has(selectedSize.toString());
        } else {
          return challenge.pricesByAccountSize.hasOwnProperty(selectedSize.toString());
        }
      });
    }
    
    if (selectedPlatform) {
      filtered = filtered.filter(challenge => 
        challenge.platforms && challenge.platforms.includes(selectedPlatform)
      );
    }
    
    setFilteredChallenges(filtered);
  };

  const getPopularChallenge = () => {
    if (challenges.length === 0) return null;
    // For now, return the first challenge as popular. In real app, this would be based on purchase data
    return challenges[0];
  };

  const getAllAccountSizes = () => {
    const sizes = new Set();
    challenges.forEach(challenge => {
      if (challenge.pricesByAccountSize) {
        if (challenge.pricesByAccountSize instanceof Map) {
          challenge.pricesByAccountSize.forEach((price, size) => {
            sizes.add(parseInt(size));
          });
        } else {
          Object.keys(challenge.pricesByAccountSize).forEach(size => {
            sizes.add(parseInt(size));
          });
        }
      }
    });
    return Array.from(sizes).sort((a, b) => a - b);
  };

  const getAllPlatforms = () => {
    const platforms = new Set();
    challenges.forEach(challenge => {
      if (challenge.platforms) {
        challenge.platforms.forEach(platform => {
          platforms.add(platform);
        });
      }
    });
    return Array.from(platforms);
  };

  const getPriceForSize = (challenge, size) => {
    if (!challenge.pricesByAccountSize) return 0;
    
    // Handle both Map and Object formats
    if (challenge.pricesByAccountSize instanceof Map) {
      return challenge.pricesByAccountSize.get(size.toString()) || 0;
    } else {
      return challenge.pricesByAccountSize[size.toString()] || 0;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const popularChallenge = getPopularChallenge();
  const accountSizes = getAllAccountSizes();
  const platforms = getAllPlatforms();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="py-5" style={{
        background: 'linear-gradient(135deg, #110A28 0%, #110A28 100%)',
        color: 'white',
        minHeight: '60vh'
      }}>
        <div className="container">
          <div className="text-center mb-5 pt-lg-5">
            <h1 className="display-4 fw-bold mb-3 text-white" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
              Choose Your Trading Challenge
            </h1>
            <p className="lead text-white-50 mb-4" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}>
              Start your trading journey with our comprehensive challenge programs
            </p>
          </div>

          {/* Popular Challenge Highlight */}
          {popularChallenge && (
            <div className="row justify-content-center mb-5">
              <div className="col-12 col-lg-8">
                <div className="card border-0 rounded-4 position-relative overflow-hidden" style={{
                  background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                  border: '3px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
                }}>
                  <div className="position-absolute top-0 end-0 m-3">
                    <span className="badge bg-warning text-dark fs-6 px-3 py-2">
                      <FaStar className="me-1" />
                      Most Popular
                    </span>
                  </div>
                  <div className="card-body p-4 text-center">
                    <h3 className="text-white fw-bold mb-3">{popularChallenge.name}</h3>
                    <p className="text-white-50 mb-4">{popularChallenge.description}</p>
                    <div className="row text-center">
                      <div className="col-4">
                        <div className="text-white">
                          <FaClock className="fs-4 mb-2" />
                          <div className="fw-bold">{popularChallenge.durationDays} Days</div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="text-white">
                          <FaTrophy className="fs-4 mb-2" />
                          <div className="fw-bold">{popularChallenge.profitTargets?.[0] || 8}% Target</div>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="text-white">
                          <FaUsers className="fs-4 mb-2" />
                          <div className="fw-bold">{popularChallenge.type}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filter Options */}
          <div className="row justify-content-center mb-4">
            <div className="col-12 col-lg-10">
              <div className="card border-0 rounded-4" style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <div className="card-body p-4">
                  <h5 className="text-white mb-3">Filter Challenges</h5>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label text-white">Account Size</label>
                      <select 
                        className="form-select"
                        value={selectedSize || ''}
                        onChange={(e) => setSelectedSize(e.target.value ? parseInt(e.target.value) : null)}
                      >
                        <option value="">All Sizes</option>
                        {accountSizes.map(size => (
                          <option key={size} value={size}>${size.toLocaleString()}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-white">Platform</label>
                      <select 
                        className="form-select"
                        value={selectedPlatform || ''}
                        onChange={(e) => setSelectedPlatform(e.target.value || null)}
                      >
                        <option value="">All Platforms</option>
                        {platforms.map(platform => (
                          <option key={platform} value={platform}>{platform}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Challenges Grid */}
      <section className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Available Challenges</h2>
            <p className="lead text-muted">Select the perfect challenge for your trading goals</p>
          </div>

          {error && (
            <div className="text-center mb-4">
              <div className="alert alert-warning" role="alert">
                {error}
              </div>
            </div>
          )}

          {filteredChallenges.length === 0 && !loading && (
            <div className="text-center">
              <div className="alert alert-info" role="alert">
                No challenges match your current filters.
              </div>
            </div>
          )}

          <div className="row g-4">
            {filteredChallenges.map((challenge, index) => {
              const gradients = [
                'linear-gradient(135deg, #ff6b6b, #ee5a24)',
                'linear-gradient(135deg, #4834d4, #686de0)',
                'linear-gradient(135deg, #6c5ce7, #a29bfe)',
                'linear-gradient(135deg, #00b894, #00cec9)',
                'linear-gradient(135deg, #fdcb6e, #e17055)',
                'linear-gradient(135deg, #fd79a8, #fdcb6e)'
              ];
              
              return (
                <div key={challenge._id} className="col-12 col-md-6 col-lg-4">
                  <div className="card border-0 rounded-4 h-100 position-relative overflow-hidden shadow-lg" style={{
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-10px)';
                    e.currentTarget.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
                  }}>
                    
                    {/* Challenge Header */}
                    <div className="position-relative" style={{
                      background: gradients[index % gradients.length],
                      minHeight: '120px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      padding: '2rem 1rem'
                    }}>
                      <h3 className="text-white fw-bold mb-2 text-center">
                        {challenge.name}
                      </h3>
                      <p className="text-white-50 text-center mb-0 small">
                        {challenge.description}
                      </p>
                    </div>

                    {/* Challenge Body */}
                    <div className="card-body p-4">
                      {/* Challenge Details */}
                      <div className="mb-4">
                        <div className="row text-center mb-3">
                          <div className="col-4">
                            <div className="text-primary">
                              <FaClock className="fs-5 mb-1" />
                              <div className="small fw-bold">{challenge.durationDays} Days</div>
                            </div>
                          </div>
                          <div className="col-4">
                            <div className="text-success">
                              <FaTrophy className="fs-5 mb-1" />
                              <div className="small fw-bold">{challenge.profitTargets?.[0] || 8}% Target</div>
                            </div>
                          </div>
                          <div className="col-4">
                            <div className="text-info">
                              <FaUsers className="fs-5 mb-1" />
                              <div className="small fw-bold">{challenge.type}</div>
                            </div>
                          </div>
                        </div>

                        {/* Platforms */}
                        {challenge.platforms && challenge.platforms.length > 0 && (
                          <div className="mb-3">
                            <div className="small text-muted mb-2">Platforms:</div>
                            <div className="d-flex flex-wrap gap-1">
                              {challenge.platforms.map((platform, idx) => (
                                <span key={idx} className="badge bg-light text-dark">
                                  {platform}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Pricing Options */}
                      <div className="mb-4">
                        <h6 className="text-muted mb-3">Account Sizes & Pricing</h6>
                        <div className="row g-2">
                          {accountSizes.slice(0, 3).map(size => {
                            const price = getPriceForSize(challenge, size);
                            if (price === 0) return null;
                            return (
                              <div key={size} className="col-12">
                                <div className="d-flex justify-content-between align-items-center p-2 rounded" style={{ background: '#f8f9fa' }}>
                                  <span className="fw-bold">${size.toLocaleString()}</span>
                                  <span className="text-primary fw-bold">₹{price}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* CTA Button */}
                      <Link 
                        href="/dashboard/challenges" 
                        className="btn w-100 py-2 fw-bold rounded-4 text-white border-0"
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
                        Start Challenge
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Challenges;
