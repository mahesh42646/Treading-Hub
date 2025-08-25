'use client';

import React from 'react';
import Header from '../../user/components/Header';
import Footer from '../../user/components/Footer';

const CareersPage = () => {
  return (
    <div>
      <Header />
      
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="text-center mb-5">
              <h1 className="display-4 fw-bold text-primary mb-3">Careers</h1>
              <p className="lead text-muted">Join our team and help shape the future of trading</p>
            </div>

            <div className="card shadow-sm">
              <div className="card-body p-5">
                <h2 className="h4 mb-4">Why Work With Us?</h2>
                <ul className="list-unstyled">
                  <li className="mb-3">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    <strong>Innovation:</strong> Work with cutting-edge trading technology
                  </li>
                  <li className="mb-3">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    <strong>Growth:</strong> Continuous learning and career development
                  </li>
                  <li className="mb-3">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    <strong>Impact:</strong> Help traders achieve their financial goals
                  </li>
                  <li className="mb-3">
                    <i className="bi bi-check-circle-fill text-success me-2"></i>
                    <strong>Team:</strong> Collaborative and supportive work environment
                  </li>
                </ul>

                <hr className="my-4" />

                <h2 className="h4 mb-4">Current Openings</h2>
                <div className="alert alert-info">
                  <p className="mb-0">
                    <strong>No current openings</strong><br />
                                         We&apos;re always looking for talented individuals to join our team. 
                     Please send your resume to <a href="mailto:careers@tradinghub.com">careers@tradinghub.com</a> 
                     and we&apos;ll keep it on file for future opportunities.
                  </p>
                </div>

                <hr className="my-4" />

                <h2 className="h4 mb-4">Contact Us</h2>
                <p>
                  If you&apos;re interested in joining our team, please reach out to us at{' '}
                  <a href="mailto:careers@tradinghub.com">careers@tradinghub.com</a> with your resume and a cover letter.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CareersPage;
