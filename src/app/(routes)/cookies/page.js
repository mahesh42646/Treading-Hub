'use client';

import React from 'react';
import Header from '../../user/components/Header';
import Footer from '../../user/components/Footer';

const CookiesPage = () => {
  return (
    <div className="page-content">
      <Header />
      
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="text-center mb-5 pt-lg-5">
              <h1 className="display-5  display-md-3 display-sm-5 fw-bold text-primary mb-3">Cookie Policy</h1>
              <p className="lead text-muted">How we use cookies to improve your experience</p>
            </div>

            <div className="card shadow-sm">
              <div className="card-body p-5">
                <h2 className="h4 mb-4">What Are Cookies?</h2>
                <p className="mb-4">
                  Cookies are small text files that are stored on your device when you visit our website. 
                  They help us provide you with a better experience and understand how you use our platform.
                </p>

                <h2 className="h4 mb-4">Types of Cookies We Use</h2>
                
                <h5 className="fw-bold mb-3">Essential Cookies</h5>
                <p className="mb-4">
                  These cookies are necessary for the website to function properly. They enable basic functions 
                  like page navigation, access to secure areas, and form submissions.
                </p>

                <h5 className="fw-bold mb-3">Performance Cookies</h5>
                <p className="mb-4">
                  These cookies help us understand how visitors interact with our website by collecting 
                  and reporting information anonymously.
                </p>

                <h5 className="fw-bold mb-3">Functional Cookies</h5>
                <p className="mb-4">
                  These cookies enable enhanced functionality and personalization, such as remembering 
                  your preferences and settings.
                </p>

                <h5 className="fw-bold mb-3">Marketing Cookies</h5>
                <p className="mb-4">
                  These cookies are used to track visitors across websites to display relevant 
                  advertisements and measure the effectiveness of marketing campaigns.
                </p>

                <h2 className="h4 mb-4">Managing Cookies</h2>
                <p className="mb-4">
                  You can control and manage cookies through your browser settings. However, 
                  disabling certain cookies may affect the functionality of our website.
                </p>

                <h2 className="h4 mb-4">Third-Party Cookies</h2>
                <p className="mb-4">
                  We may use third-party services that set their own cookies. These services include:
                </p>
                <ul className="mb-4">
                  <li>Google Analytics for website analytics</li>
                  <li>Social media platforms for sharing features</li>
                  <li>Payment processors for secure transactions</li>
                  <li>Customer support tools for assistance</li>
                </ul>

                <h2 className="h4 mb-4">Updates to This Policy</h2>
                <p className="mb-4">
                  We may update this Cookie Policy from time to time. Any changes will be posted 
                  on this page with an updated revision date.
                </p>

                <div className="alert alert-info mt-4">
                  <h5 className="alert-heading">Contact Us</h5>
                  <p className="mb-0">
                    If you have any questions about our use of cookies, please contact us at privacy@tradinghub.com
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

export default CookiesPage;
