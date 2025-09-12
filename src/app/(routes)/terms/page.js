import React from 'react';
import Header from '../../user/components/Header';
import Footer from '../../user/components/Footer';

export default function Terms() {
  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-primary text-white py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto text-center pt-lg-4  ">
              <h1 className="display-4  display-md-3 display-sm-5    fw-bold mb-4">Terms & Conditions</h1>
              <p className="lead">
                Please read these terms and conditions carefully before using our services.
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

                  <h4 className="mb-3">1. Acceptance of Terms</h4>
                  <p className="mb-4">
                    By accessing and using Treading Hub&apos;s services, you accept and agree to be bound by the terms 
                    and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                  </p>

                  <h4 className="mb-3">2. Description of Service</h4>
                  <p className="mb-4">
                    Treading Hub provides funded trading programs where traders can demonstrate their skills 
                    and potentially receive funding to trade with real capital. Our services include evaluation 
                    programs, trading education, and platform access.
                  </p>

                  <h4 className="mb-3">3. User Eligibility</h4>
                  <p className="mb-4">
                    You must be at least 18 years old to use our services. You must also have the legal capacity 
                    to enter into binding agreements. By using our services, you represent and warrant that you 
                    meet these eligibility requirements.
                  </p>

                  <h4 className="mb-3">4. Account Registration</h4>
                  <p className="mb-4">
                    To access certain features of our service, you must register for an account. You agree to 
                    provide accurate, current, and complete information during registration and to update such 
                    information to keep it accurate, current, and complete.
                  </p>

                  <h4 className="mb-3">5. Trading Rules and Risk Disclosure</h4>
                  <p className="mb-4">
                    Trading involves substantial risk of loss and is not suitable for all investors. You acknowledge 
                    that you understand the risks involved in trading and that you can afford to lose your investment. 
                    Past performance does not guarantee future results.
                  </p>

                  <h4 className="mb-3">6. Evaluation Program Terms</h4>
                  <p className="mb-4">
                    Our evaluation programs have specific rules and requirements that must be followed. These include 
                    profit targets, drawdown limits, and trading restrictions. Failure to comply with these rules 
                    may result in account termination.
                  </p>

                  <h4 className="mb-3">7. Profit Sharing</h4>
                  <p className="mb-4">
                    Profit sharing terms vary by plan and are subject to meeting all evaluation requirements. 
                    Profits are calculated based on net gains after all fees and commissions. We reserve the right 
                    to modify profit sharing terms with appropriate notice.
                  </p>

                  <h4 className="mb-3">8. Payment Terms</h4>
                  <p className="mb-4">
                    All fees are non-refundable unless otherwise specified. Payment must be made in full before 
                    account activation. We accept various payment methods as indicated on our website.
                  </p>

                  <h4 className="mb-3">9. Prohibited Activities</h4>
                  <p className="mb-4">
                    You agree not to engage in any of the following activities:
                  </p>
                  <ul className="mb-4">
                    <li>Using automated trading systems or bots without authorization</li>
                    <li>Engaging in market manipulation or fraudulent activities</li>
                    <li>Sharing account credentials with others</li>
                    <li>Attempting to circumvent our trading rules</li>
                    <li>Using our services for illegal purposes</li>
                  </ul>

                  <h4 className="mb-3">10. Intellectual Property</h4>
                  <p className="mb-4">
                    All content, features, and functionality of our service are owned by Treading Hub and are 
                    protected by international copyright, trademark, and other intellectual property laws.
                  </p>

                  <h4 className="mb-3">11. Privacy Policy</h4>
                  <p className="mb-4">
                    Your privacy is important to us. Please review our Privacy Policy, which also governs your 
                    use of the service, to understand our practices.
                  </p>

                  <h4 className="mb-3">12. Limitation of Liability</h4>
                  <p className="mb-4">
                    In no event shall Treading Hub be liable for any indirect, incidental, special, consequential, 
                    or punitive damages, including without limitation, loss of profits, data, use, goodwill, or 
                    other intangible losses.
                  </p>

                  <h4 className="mb-3">13. Termination</h4>
                  <p className="mb-4">
                    We may terminate or suspend your account immediately, without prior notice or liability, 
                    for any reason whatsoever, including without limitation if you breach the Terms.
                  </p>

                  <h4 className="mb-3">14. Governing Law</h4>
                  <p className="mb-4">
                    These Terms shall be interpreted and governed by the laws of the jurisdiction in which 
                    Treading Hub operates, without regard to its conflict of law provisions.
                  </p>

                  <h4 className="mb-3">15. Changes to Terms</h4>
                  <p className="mb-4">
                    We reserve the right to modify or replace these Terms at any time. If a revision is material, 
                    we will try to provide at least 30 days notice prior to any new terms taking effect.
                  </p>

                  <h4 className="mb-3">16. Contact Information</h4>
                  <p className="mb-4">
                    If you have any questions about these Terms, please contact us at:
                  </p>
                  <div className="bg-light p-3 rounded">
                    <p className="mb-1"><strong>Email:</strong> legal@treadinghub.com</p>
                    <p className="mb-1"><strong>Phone:</strong> +1 (555) 123-4567</p>
                    <p className="mb-0"><strong>Address:</strong> 123 Trading Street, Financial District, New York, NY 10001</p>
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