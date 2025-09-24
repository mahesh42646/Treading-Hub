'use client';

import React from 'react';
import Header from '../../user/components/Header';
import Footer from '../../user/components/Footer';

const RefundPage = () => {
  return (
    <div className="page-content">
      <Header />
      
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="text-center mb-5 pt-lg-5">
              <h1 className="display-5  display-md-3 display-sm-5 fw-bold text-primary mb-3">Refund Policy</h1>
              <p className="lead text-muted">Our commitment to customer satisfaction</p>
            </div>

            <div className="card shadow-sm">
              <div className="card-body p-5">
                <h2 className="h4 mb-4">Refund Eligibility</h2>
                <p className="mb-4">
                  We understand that circumstances may arise where you need to request a refund. 
                  Our refund policy is designed to be fair and transparent for all customers.
                </p>

                <h2 className="h4 mb-4">Challenge Phase Refunds</h2>
                <ul className="mb-4">
                  <li>Refunds are available within 7 days of purchase if no trading activity has occurred</li>
                  <li>Once trading begins, refunds are not available for challenge fees</li>
                  <li>Technical issues preventing platform access may qualify for refunds</li>
                </ul>

                <h2 className="h4 mb-4">Trading Challenge Refunds</h2>
                <ul className="mb-4">
                  <li>Pro-rated refunds available for unused portions of trading challenges</li>
                  <li>Refund requests must be submitted before challenge expiry</li>
                  <li>Processing fees may apply to challenge refunds</li>
                </ul>

                <h2 className="h4 mb-4">How to Request a Refund</h2>
                <ol className="mb-4">
                  <li>Contact our support team at support@tradinghub.com</li>
                  <li>Provide your account details and reason for refund</li>
                  <li>Include any relevant transaction information</li>
                  <li>Allow 3-5 business days for review and processing</li>
                </ol>

                <h2 className="h4 mb-4">Processing Time</h2>
                <p className="mb-4">
                  Refunds are typically processed within 5-10 business days after approval. 
                  The time to appear in your account depends on your payment method and financial institution.
                </p>

                <h2 className="h4 mb-4">Non-Refundable Items</h2>
                <ul className="mb-4">
                  <li>Completed challenge phases with trading activity</li>
                  <li>Used educational materials and courses</li>
                  <li>Platform usage fees after service has been provided</li>
                  <li>Processing fees and transaction costs</li>
                </ul>

                <div className="alert alert-info mt-4">
                  <h5 className="alert-heading">Need Help?</h5>
                  <p className="mb-0">
                    If you have questions about our refund policy or need assistance with a refund request, 
                    please contact our support team. We&apos;re here to help!
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

export default RefundPage;
