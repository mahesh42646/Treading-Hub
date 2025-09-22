import React from 'react';
import Header from '../../user/components/Header';
import Footer from '../../user/components/Footer';

export default function Privacy() {
  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-primary text-white py-5">
        <div className="container"> 
          <div className="row">
            <div className="col-lg-8 mx-auto text-center pt-lg-5  ">
              <h1 className="display-5  display-md-3 display-sm-5 fw-bold mb-4">Privacy Policy</h1>
              <p className="lead">
                Learn how we collect, use, and protect your personal information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-5">
                  <p className="text-muted mb-4">Last updated: January 15, 2024</p>

                  <h4 className="mb-3">1. Information We Collect</h4>
                  <p className="mb-4">
                    We collect information you provide directly to us, such as when you create an account, 
                    make a purchase, or contact us for support. This may include:
                  </p>
                  <ul className="mb-4">
                    <li>Name, email address, and phone number</li>
                    <li>Payment information and transaction history</li>
                    <li>Trading activity and performance data</li>
                    <li>Communication preferences and support requests</li>
                    <li>Device and usage information</li>
                  </ul>

                  <h4 className="mb-3">2. How We Use Your Information</h4>
                  <p className="mb-4">
                    We use the information we collect to:
                  </p>
                  <ul className="mb-4">
                    <li>Provide, maintain, and improve our services</li>
                    <li>Process transactions and send related information</li>
                    <li>Send technical notices, updates, and support messages</li>
                    <li>Respond to your comments and questions</li>
                    <li>Monitor and analyze trends and usage</li>
                    <li>Detect, investigate, and prevent fraudulent transactions</li>
                  </ul>

                  <h4 className="mb-3">3. Information Sharing</h4>
                  <p className="mb-4">
                    We do not sell, trade, or otherwise transfer your personal information to third parties 
                    without your consent, except in the following circumstances:
                  </p>
                  <ul className="mb-4">
                    <li>With service providers who assist in our operations</li>
                    <li>To comply with legal obligations</li>
                    <li>To protect our rights and safety</li>
                    <li>In connection with a business transfer or merger</li>
                  </ul>

                  <h4 className="mb-3">4. Data Security</h4>
                  <p className="mb-4">
                    We implement appropriate security measures to protect your personal information against 
                    unauthorized access, alteration, disclosure, or destruction. However, no method of 
                    transmission over the internet is 100% secure.
                  </p>

                  <h4 className="mb-3">5. Cookies and Tracking Technologies</h4>
                  <p className="mb-4">
                    We use cookies and similar tracking technologies to enhance your experience on our website. 
                    These technologies help us remember your preferences and provide personalized content.
                  </p>

                  <h4 className="mb-3">6. Third-Party Services</h4>
                  <p className="mb-4">
                    Our website may contain links to third-party websites or services. We are not responsible 
                    for the privacy practices of these third parties. We encourage you to review their privacy policies.
                  </p>

                  <h4 className="mb-3">7. Data Retention</h4>
                  <p className="mb-4">
                    We retain your personal information for as long as necessary to provide our services and 
                    comply with legal obligations. When we no longer need your information, we will securely delete it.
                  </p>

                  <h4 className="mb-3">8. Your Rights</h4>
                  <p className="mb-4">
                    Depending on your location, you may have certain rights regarding your personal information, including:
                  </p>
                  <ul className="mb-4">
                    <li>The right to access and receive a copy of your data</li>
                    <li>The right to rectify inaccurate information</li>
                    <li>The right to delete your personal information</li>
                    <li>The right to restrict or object to processing</li>
                    <li>The right to data portability</li>
                  </ul>

                  <h4 className="mb-3">9. Children&apos;s Privacy</h4>
                  <p className="mb-4">
                    Our services are not intended for children under 18 years of age. We do not knowingly 
                    collect personal information from children under 18. If you believe we have collected 
                    information from a child under 18, please contact us immediately.
                  </p>

                  <h4 className="mb-3">10. International Data Transfers</h4>
                  <p className="mb-4">
                    Your information may be transferred to and processed in countries other than your own. 
                    We ensure that such transfers comply with applicable data protection laws.
                  </p>

                  <h4 className="mb-3">11. Changes to This Policy</h4>
                  <p className="mb-4">
                    We may update this Privacy Policy from time to time. We will notify you of any changes 
                    by posting the new Privacy Policy on this page and updating the &apos;Last updated&apos; date.
                  </p>

                  <h4 className="mb-3">12. Contact Us</h4>
                  <p className="mb-4">
                    If you have any questions about this Privacy Policy or our data practices, please contact us:
                  </p>
                  <div className="bg-light p-3 rounded">
                    <p className="mb-1"><strong>Email:</strong> privacy@treadinghub.com</p>
                    <p className="mb-1"><strong>Phone:</strong> +1 (555) 123-4567</p>
                    <p className="mb-0"><strong>Address:</strong> 123 Trading Street, Financial District, New York, NY 10001</p>
                  </div>

                  <div className="mt-4 p-3 bg-info bg-opacity-10 rounded">
                    <h6 className="text-info">Data Protection Officer</h6>
                    <p className="mb-0 text-muted">
                      For EU residents, you can contact our Data Protection Officer at: dpo@treadinghub.com
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 