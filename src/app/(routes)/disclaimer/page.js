'use client';

import React from 'react';
import Header from '../../user/components/Header';
import Footer from '../../user/components/Footer';

const DisclaimerPage = () => {
  return (
    <div className="page-content">
      <Header />
      
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="text-center mb-5 pt-lg-5">
              <h1 className="display-5  display-md-3 display-sm-5 fw-bold text-primary mb-3">Disclaimer</h1>
              <p className="lead text-muted">Important information about our services and trading risks</p>
            </div>

            <div className="card shadow-sm">
              <div className="card-body p-5">
                <h2 className="h4 mb-4">Risk Disclosure</h2>
                <p className="mb-4">
                  Trading in financial markets involves substantial risk of loss and is not suitable for all investors. 
                  The value of investments can go down as well as up, and you may lose some or all of your invested capital.
                </p>

                <h2 className="h4 mb-4">No Investment Advice</h2>
                <p className="mb-4">
                  The information provided on this platform is for educational and informational purposes only. 
                  It does not constitute investment advice, financial advice, or any other type of advice. 
                  You should consult with a qualified financial advisor before making any investment decisions.
                </p>

                <h2 className="h4 mb-4">Past Performance</h2>
                <p className="mb-4">
                  Past performance is not indicative of future results. Historical data and performance 
                  figures are provided for informational purposes only and should not be relied upon 
                  as a guarantee of future performance.
                </p>

                <h2 className="h4 mb-4">Regulatory Compliance</h2>
                <p className="mb-4">
                  Trading Hub operates in compliance with applicable laws and regulations. 
                  However, trading regulations may vary by jurisdiction, and it is your responsibility 
                  to ensure compliance with local laws.
                </p>

                <h2 className="h4 mb-4">Technology Risks</h2>
                <p className="mb-4">
                  Trading platforms and technology systems may experience technical issues, 
                  including but not limited to system failures, connectivity problems, and data delays. 
                  We are not responsible for any losses resulting from such technical issues.
                </p>

                <h2 className="h4 mb-4">Limitation of Liability</h2>
                <p className="mb-4">
                  To the maximum extent permitted by law, Trading Hub shall not be liable for any 
                  direct, indirect, incidental, special, or consequential damages arising from 
                  the use of our services.
                </p>

                <div className="alert alert-warning mt-4">
                  <h5 className="alert-heading">Important Notice</h5>
                  <p className="mb-0">
                    By using our services, you acknowledge that you have read, understood, and agree to this disclaimer. 
                    If you do not agree with any part of this disclaimer, please do not use our services.
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

export default DisclaimerPage;
