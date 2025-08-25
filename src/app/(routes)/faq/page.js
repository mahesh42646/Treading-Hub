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
    "What Is The Copy Trading Rule at Trading Hub?",
    "What are the Restricted/Prohibited Trading Strategies?",
    "How can I calculate the Daily Loss Limit?",
    "How can I complete the KYC verification process?",
    "What Will Be My Profit Share from the Challenge?",
    "Does Trading Hub offer a Scale-Up plan?",
    "How can I Withdraw my profits?",
    "What is slippage? Understanding Slippage in Trading"
  ];

  // Mock data for FAQ categories
  const faqCategories = [
    { name: "General FAQ", icon: FaQuestionCircle, count: 62, color: "purple" },
    { name: "About Trading Hub", icon: FaBook, count: 18, color: "blue" },
    { name: "1-Step Challenge FAQ", icon: FaUser, count: 9, color: "blue" },
    { name: "2-Step Challenge FAQ", icon: FaShieldAlt, count: 11, color: "orange" },
    { name: "Lite Challenge FAQ", icon: FaRocket, count: 11, color: "orange" },
    { name: "Instant Challenge", icon: FaStar, count: 28, color: "purple" },
    { name: "Trading Hub Features", icon: FaSearch, count: 20, color: "purple" },
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
      <div className="page-content min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <Header />
      
      <div className="container py-5">
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold text-primary mb-3">Help Center</h1>
          <p className="lead text-muted">Find answers to your questions and get the support you need</p>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Most Viewed Articles Section */}
        <div className="mb-5">
          <h2 className="h3 fw-bold mb-4">Most Viewed Articles</h2>
          <div className="row">
            <div className="col-md-6">
              {mostViewedArticles.slice(0, 4).map((article, index) => (
                <div key={index} className="d-flex align-items-center mb-3">
                  <a href="#" className="text-decoration-none text-dark flex-grow-1">
                    {article}
                  </a>
                  <i className="bi bi-arrow-right text-muted"></i>
                </div>
              ))}
            </div>
            <div className="col-md-6">
              {mostViewedArticles.slice(4, 8).map((article, index) => (
                <div key={index + 4} className="d-flex align-items-center mb-3">
                  <a href="#" className="text-decoration-none text-dark flex-grow-1">
                    {article}
                  </a>
                  <i className="bi bi-arrow-right text-muted"></i>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Categories Section */}
        <div>
          <h2 className="h3 fw-bold mb-4">Browse by Category</h2>
          <div className="row g-4">
            {faqCategories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <div key={index} className="col-md-6 col-lg-4">
                  <div 
                    className="faq-category-card"
                    onClick={() => setSelectedCategory(category.name)}
                  >
                    <div className="d-flex align-items-center">
                      <div 
                        className="rounded-circle p-3 me-3"
                        style={{ 
                          backgroundColor: `${getIconColor(category.color)}20`,
                          color: getIconColor(category.color)
                        }}
                      >
                        <IconComponent size={24} />
                      </div>
                      <div className="flex-grow-1">
                        <h5 className="mb-1 fw-bold">{category.name}</h5>
                        <p className="text-muted mb-0">{category.count} articles</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ Accordion (if FAQs are available) */}
        {faqs.length > 0 && (
          <div className="mt-5">
            <h2 className="h3 fw-bold mb-4">All FAQs</h2>
            <div className="accordion" id="faqAccordion">
              {faqs.map((faq, index) => (
                <div className="accordion-item" key={faq._id || index}>
                  <h2 className="accordion-header" id={`faq-${index}`}>
                    <button
                      className="accordion-button collapsed"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target={`#collapse-${index}`}
                      aria-expanded="false"
                      aria-controls={`collapse-${index}`}
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
                    <div className="accordion-body">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No FAQs Message */}
        {faqs.length === 0 && !error && (
          <div className="text-center py-5">
            <div className="mb-4">
              <i className="bi bi-question-circle text-muted" style={{ fontSize: '4rem' }}></i>
            </div>
            <h3 className="text-muted mb-3">No FAQs available at the moment</h3>
            <p className="text-muted mb-4">Please check back later or contact our support team.</p>
            <a href="/contact" className="btn btn-purple">
              Contact Support
            </a>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default FAQPage;
