'use client';

import React, { useState, useEffect } from 'react';
import { FaQuestionCircle, FaBook, FaUser, FaRocket, FaShieldAlt, FaStar, FaSearch, FaLaptop, FaBalanceScale, FaChartBar, FaVideo, FaNetworkWired } from 'react-icons/fa';
import Header from '../../user/components/Header';
import Footer from '../../user/components/Footer';

const FAQPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/faqs`);
      if (response.ok) {
        const data = await response.json();
        setFaqs(data.faqs || []);
      } else {
        setError('Failed to load FAQs');
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      setError('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  // Mock data for most viewed articles
  const mostViewedArticles = [
    "What Is The Copy Trading Rule at Xfunding Flow?",
    "What are the Restricted/Prohibited Trading Strategies?",
    "How can I calculate the Daily Loss Limit?",
    "How can I complete the KYC verification process?",
    "What Will Be My Profit Share from the Challenge?",
    "Does Xfunding Flow offer a Scale-Up plan?",
    "How can I Withdraw my profits?",
    "What is slippage? Understanding Slippage in Trading"
  ];

  // Mock data for FAQ categories
  const faqCategories = [
    { name: "General FAQ", icon: FaQuestionCircle, count: 62, color: "purple" },
    { name: "About Xfunding Flow", icon: FaBook, count: 18, color: "blue" },
    { name: "1-Step Challenge FAQ", icon: FaUser, count: 9, color: "blue" },
    { name: "2-Step Challenge FAQ", icon: FaShieldAlt, count: 11, color: "orange" },
    { name: "Lite Challenge FAQ", icon: FaRocket, count: 11, color: "orange" },
    { name: "Instant Challenge", icon: FaStar, count: 28, color: "purple" },
    { name: "Xfunding Flow Features", icon: FaSearch, count: 20, color: "purple" },
    { name: "Trading Basics", icon: FaLaptop, count: 8, color: "blue" },
    { name: "Trading Rules & Guidelines", icon: FaBalanceScale, count: 19, color: "blue" },
    { name: "Dashboard FAQ", icon: FaChartBar, count: 17, color: "orange" },
    { name: "Video Library", icon: FaVideo, count: 21, color: "purple" },
    { name: "Affiliate & Payment FAQ", icon: FaNetworkWired, count: 20, color: "green" }
  ];

  const getIconColor = (color) => {
    const colors = {
      purple: '#6f42c1',
      blue: '#0d6efd',
      orange: '#fd7e14',
      green: '#198754'
    };
    return colors[color] || '#6f42c1';
  };

  if (loading) {
    return (
      <div className="page-content" style={{
        background: 'linear-gradient(135deg, #110A28 0%, #110A28 100%)',
        minHeight: '100vh',
        color: 'white'
      }}>
        <Header />
        <div className="d-flex align-items-center justify-content-center" style={{ height: '50vh' }}>
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-content faq-page" style={{
      background: 'linear-gradient(135deg, #110A28 0%, #110A28 100%)',
      minHeight: '100vh',
      color: 'white'
    }}>
      <Header />
      
      <div className="container py-5">
        <div className="text-center mb-5">
          <h1 className="display-5 mt-lg-5 display-md-3 display-sm-5 fw-bold text-white mb-3">
            Help <span className="text-info">Center</span>
          </h1>
          <p className="lead text-white-50">Find answers to your questions and get the support you need</p>
        </div>

        {error && (
          <div className="alert rounded-4" role="alert" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)',
            color: 'white'
          }}>
            {error}
          </div>
        )}

        {/* Most Viewed Articles Section - Dark Glossy Theme */}
        <div className="mb-5">
          <div className="rounded-4 p-4 mb-4" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '3px solid rgba(67, 34, 124, 0.74)',
            backdropFilter: 'blur(20px)',
            boxShadow: '5px 4px 20px 1px rgba(70, 74, 103, 0.44)'
          }}>
            <h2 className="h3 fw-bold mb-4 text-white">Most Viewed <span className="text-info">Articles</span></h2>
            <div className="row">
              <div className="col-md-6">
                {mostViewedArticles.slice(0, 4).map((article, index) => (
                  <div key={index} className="d-flex align-items-center mb-3 p-2 rounded-3" style={{
                    background: 'rgba(60, 58, 58, 0.03)',
                    border: '1px solid rgba(124, 124, 124, 0.39)',
                    backdropFilter: 'blur(20px)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(60, 58, 58, 0.03)';
                    e.currentTarget.style.borderColor = 'rgba(124, 124, 124, 0.39)';
                  }}>
                    <a href="#" className="text-decoration-none text-white flex-grow-1 fw-medium">
                      {article}
                    </a>
                    <i className="bi bi-arrow-right text-info"></i>
                  </div>
                ))}
              </div>
              <div className="col-md-6">
                {mostViewedArticles.slice(4, 8).map((article, index) => (
                  <div key={index + 4} className="d-flex align-items-center mb-3 p-2 rounded-3" style={{
                    background: 'rgba(60, 58, 58, 0.03)',
                    border: '1px solid rgba(124, 124, 124, 0.39)',
                    backdropFilter: 'blur(20px)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(60, 58, 58, 0.03)';
                    e.currentTarget.style.borderColor = 'rgba(124, 124, 124, 0.39)';
                  }}>
                    <a href="#" className="text-decoration-none text-white flex-grow-1 fw-medium">
                      {article}
                    </a>
                    <i className="bi bi-arrow-right text-info"></i>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Categories Section - Dark Glossy Theme */}
        <div>
          <h2 className="h3 fw-bold mb-4 text-white">Browse by <span className="text-info">Category</span></h2>
          <div className="row g-4">
            {faqCategories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <div key={index} className="col-md-6 col-lg-4">
                  <div 
                    className="faq-category-card rounded-4 p-3"
                    style={{
                      background: 'rgba(60, 58, 58, 0.03)',
                      border: '3px solid rgba(67, 34, 124, 0.74)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: '5px 4px 20px 1px rgba(70, 74, 103, 0.44)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      color: 'white'
                    }}
                    onClick={() => setSelectedCategory(category.name)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 15px 35px rgba(139, 92, 246, 0.3)';
                      e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.8)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '5px 4px 20px 1px rgba(70, 74, 103, 0.44)';
                      e.currentTarget.style.borderColor = 'rgba(67, 34, 124, 0.74)';
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <div 
                        className="rounded-circle p-3 me-3"
                        style={{ 
                          background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                          color: 'white'
                        }}
                      >
                        <IconComponent size={24} />
                      </div>
                      <div className="flex-grow-1">
                        <h5 className="mb-1 fw-bold text-white">{category.name}</h5>
                        <p className="text-white-50 mb-0">{category.count} articles</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ Accordion (if FAQs are available) - Dark Glossy Theme */}
        {faqs.length > 0 && (
          <div className="mt-5">
            <h2 className="h3 fw-bold mb-4 text-white">All <span className="text-info">FAQs</span></h2>
            <div className="accordion" id="faqAccordion">
              {faqs.map((faq, index) => (
                <div className="accordion-item border-0 mb-3 rounded-4" key={faq._id || index} style={{
                  background: 'rgba(60, 58, 58, 0.03)',
                  border: '3px solid rgba(67, 34, 124, 0.74)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '5px 4px 20px 1px rgba(70, 74, 103, 0.44)'
                }}>
                  <h2 className="accordion-header" id={`faq-${index}`}>
                    <button
                      className="accordion-button collapsed rounded-4"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target={`#collapse-${index}`}
                      aria-expanded="false"
                      aria-controls={`collapse-${index}`}
                      style={{
                        background: 'transparent',
                        color: 'white',
                        border: 'none',
                        fontWeight: 'bold'
                      }}
                    >
                      {faq.question}
                    </button>
                  </h2>
                  <div
                    id={`collapse-${index}`}
                    className="accordion-collapse collapse"
                    aria-labelledby={`faq-${index}`}
                    data-bs-parent="#faqAccordion"
                  >
                    <div className="accordion-body text-white-50">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No FAQs Message - Dark Glossy Theme */}
        {faqs.length === 0 && !error && (
          <div className="text-center py-5">
            <div className="rounded-4 p-5" style={{
              background: 'rgba(60, 58, 58, 0.03)',
              border: '3px solid rgba(67, 34, 124, 0.74)',
              backdropFilter: 'blur(20px)',
              boxShadow: '5px 4px 20px 1px rgba(70, 74, 103, 0.44)'
            }}>
              <div className="mb-4">
                <i className="bi bi-question-circle text-info" style={{ fontSize: '4rem' }}></i>
              </div>
              <h3 className="text-white mb-3">No FAQs available at the moment</h3>
              <p className="text-white-50 mb-4">Please check back later or contact our support team.</p>
              <a href="/contact" className="btn btn-lg rounded-4 fw-bold" style={{
                background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                border: 'none',
                color: 'white'
              }}>
                Contact Support
              </a>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default FAQPage;
