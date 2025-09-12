'use client';

import React from 'react';
import Header from '../../user/components/Header';
import Footer from '../../user/components/Footer';

const HelpPage = () => {
  return (
    <div>
      <Header />
      
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="text-center mb-5 pt-lg-4">
              <h1 className="display-4  display-md-3 display-sm-5 fw-bold text-primary mb-3">Help Center</h1>
              <p className="lead text-muted">Get help and support for your trading journey</p>
            </div>

            <div className="card shadow-sm">
              <div className="card-body p-5">
                <h2 className="h4 mb-4">How Can We Help You?</h2>
                
                <div className="row">
                  <div className="col-md-6 mb-4">
                    <div className="card h-100 border-0 shadow-sm">
                      <div className="card-body text-center">
                        <i className="bi bi-question-circle text-primary" style={{ fontSize: '3rem' }}></i>
                        <h5 className="mt-3">FAQs</h5>
                        <p className="text-muted">Find answers to frequently asked questions</p>
                        <a href="/faq" className="btn btn-outline-primary">View FAQs</a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6 mb-4">
                    <div className="card h-100 border-0 shadow-sm">
                      <div className="card-body text-center">
                        <i className="bi bi-envelope text-primary" style={{ fontSize: '3rem' }}></i>
                        <h5 className="mt-3">Contact Support</h5>
                        <p className="text-muted">Get in touch with our support team</p>
                        <a href="/contact" className="btn btn-outline-primary">Contact Us</a>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="my-4" />

                <h2 className="h4 mb-4">Quick Links</h2>
                <div className="row">
                  <div className="col-md-6">
                    <ul className="list-unstyled">
                      <li className="mb-2">
                        <a href="/plans" className="text-decoration-none">
                          <i className="bi bi-arrow-right me-2"></i>Trading Plans
                        </a>
                      </li>
                      <li className="mb-2">
                        <a href="/about" className="text-decoration-none">
                          <i className="bi bi-arrow-right me-2"></i>About Us
                        </a>
                      </li>
                      <li className="mb-2">
                        <a href="/terms" className="text-decoration-none">
                          <i className="bi bi-arrow-right me-2"></i>Terms of Service
                        </a>
                      </li>
                      <li className="mb-2">
                        <a href="/privacy" className="text-decoration-none">
                          <i className="bi bi-arrow-right me-2"></i>Privacy Policy
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div className="col-md-6">
                    <ul className="list-unstyled">
                      <li className="mb-2">
                        <a href="/blog" className="text-decoration-none">
                          <i className="bi bi-arrow-right me-2"></i>Blog
                        </a>
                      </li>
                      <li className="mb-2">
                        <a href="/news" className="text-decoration-none">
                          <i className="bi bi-arrow-right me-2"></i>News
                        </a>
                      </li>
                      <li className="mb-2">
                        <a href="/careers" className="text-decoration-none">
                          <i className="bi bi-arrow-right me-2"></i>Careers
                        </a>
                      </li>
                      <li className="mb-2">
                        <a href="/contact" className="text-decoration-none">
                          <i className="bi bi-arrow-right me-2"></i>Contact
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>

                <hr className="my-4" />

                <h2 className="h4 mb-4">Need Immediate Help?</h2>
                <div className="alert alert-info">
                  <p className="mb-2">
                    <strong>Email Support:</strong> support@tradinghub.com<br />
                    <strong>Phone Support:</strong> +91 98765 43210<br />
                    <strong>Response Time:</strong> Within 24 hours
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

export default HelpPage;
