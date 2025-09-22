import React from 'react';
import Header from '../../../user/components/Header';
import Footer from '../../../user/components/Footer';

export default function TermsOfUse() {
  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header />
      
      {/* Hero Section */}
      <section className="about-hero text-white py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto text-center pt-lg-5">
              <h1 className="display-5 display-md-3 display-sm-5 fw-bold mb-4">Terms of Use</h1>
              <p className="lead">
                Please read these terms of use carefully before using our trading platform and services.
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

                  <h4 className="mb-3">1. Agreement to Terms</h4>
                  <p className="mb-4">
                    By accessing and using Treading Hub&apos;s website, mobile application, and services (collectively, 
                    the &quot;Service&quot;), you agree to be bound by these Terms of Use (&quot;Terms&quot;). If you do not agree 
                    to these Terms, you may not access or use our Service.
                  </p>

                  <h4 className="mb-3">2. Description of Service</h4>
                  <p className="mb-4">
                    Treading Hub provides a proprietary trading platform that offers funded trading programs, 
                    evaluation challenges, and educational resources for traders. Our Service includes:
                  </p>
                  <ul className="mb-4">
                    <li>Funded trading account programs with various capital levels</li>
                    <li>Evaluation challenges to assess trading skills</li>
                    <li>Educational materials and trading resources</li>
                    <li>Real-time market data and trading tools</li>
                    <li>Customer support and account management</li>
                  </ul>

                  <h4 className="mb-3">3. Eligibility Requirements</h4>
                  <p className="mb-4">
                    To use our Service, you must:
                  </p>
                  <ul className="mb-4">
                    <li>Be at least 18 years of age or the age of majority in your jurisdiction</li>
                    <li>Have the legal capacity to enter into binding agreements</li>
                    <li>Provide accurate and complete registration information</li>
                    <li>Comply with all applicable laws and regulations</li>
                    <li>Not be prohibited from using our Service under applicable law</li>
                  </ul>

                  <h4 className="mb-3">4. Account Registration and Security</h4>
                  <p className="mb-4">
                    When you create an account with us, you must provide information that is accurate, 
                    complete, and current at all times. You are responsible for:
                  </p>
                  <ul className="mb-4">
                    <li>Maintaining the confidentiality of your account credentials</li>
                    <li>All activities that occur under your account</li>
                    <li>Notifying us immediately of any unauthorized use</li>
                    <li>Ensuring your account information remains accurate and up-to-date</li>
                  </ul>

                  <h4 className="mb-3">5. Trading Rules and Risk Disclosure</h4>
                  <p className="mb-4">
                    <strong>Important Risk Warning:</strong> Trading financial instruments involves substantial risk 
                    of loss and is not suitable for all investors. You acknowledge and agree that:
                  </p>
                  <ul className="mb-4">
                    <li>You understand the risks involved in trading</li>
                    <li>You can afford to lose the money you invest</li>
                    <li>Past performance does not guarantee future results</li>
                    <li>You will not hold Treading Hub liable for trading losses</li>
                    <li>You will comply with all trading rules and restrictions</li>
                  </ul>

                  <h4 className="mb-3">6. Evaluation Program Terms</h4>
                  <p className="mb-4">
                    Our evaluation programs are designed to assess your trading skills and risk management abilities. 
                    Key terms include:
                  </p>
                  <ul className="mb-4">
                    <li>Specific profit targets must be met within designated timeframes</li>
                    <li>Maximum drawdown limits must not be exceeded</li>
                    <li>Certain trading strategies and instruments may be restricted</li>
                    <li>Account may be terminated for rule violations</li>
                    <li>Evaluation fees are non-refundable once trading begins</li>
                  </ul>

                  <h4 className="mb-3">7. Funded Account Terms</h4>
                  <p className="mb-4">
                    Upon successful completion of evaluation requirements, you may receive a funded trading account. 
                    Funded accounts are subject to:
                  </p>
                  <ul className="mb-4">
                    <li>Profit sharing arrangements as specified in your plan</li>
                    <li>Ongoing compliance with trading rules and risk management</li>
                    <li>Regular performance monitoring and evaluation</li>
                    <li>Potential account suspension or termination for violations</li>
                    <li>Withdrawal restrictions and processing requirements</li>
                  </ul>

                  <h4 className="mb-3">8. Payment Terms and Fees</h4>
                  <p className="mb-4">
                    All fees and charges are clearly disclosed before purchase. Payment terms include:
                  </p>
                  <ul className="mb-4">
                    <li>Evaluation fees must be paid in full before account activation</li>
                    <li>All fees are non-refundable unless otherwise specified</li>
                    <li>We accept various payment methods as indicated on our website</li>
                    <li>Additional fees may apply for certain services or transactions</li>
                    <li>Price changes will be communicated with appropriate notice</li>
                  </ul>

                  <h4 className="mb-3">9. Prohibited Activities</h4>
                  <p className="mb-4">
                    You agree not to engage in any of the following prohibited activities:
                  </p>
                  <ul className="mb-4">
                    <li>Using automated trading systems, bots, or algorithms without authorization</li>
                    <li>Engaging in market manipulation, front-running, or other fraudulent activities</li>
                    <li>Sharing account credentials or allowing others to trade on your behalf</li>
                    <li>Attempting to circumvent trading rules, restrictions, or security measures</li>
                    <li>Using our Service for any illegal or unauthorized purpose</li>
                    <li>Reverse engineering, decompiling, or disassembling our software</li>
                    <li>Interfering with or disrupting our Service or servers</li>
                    <li>Collecting user information or data without authorization</li>
                  </ul>

                  <h4 className="mb-3">10. Intellectual Property Rights</h4>
                  <p className="mb-4">
                    The Service and its original content, features, and functionality are owned by Treading Hub 
                    and are protected by international copyright, trademark, patent, trade secret, and other 
                    intellectual property laws. You may not:
                  </p>
                  <ul className="mb-4">
                    <li>Copy, modify, or distribute our proprietary content</li>
                    <li>Use our trademarks or logos without permission</li>
                    <li>Create derivative works based on our Service</li>
                    <li>Remove or alter any proprietary notices</li>
                  </ul>

                  <h4 className="mb-3">11. Privacy and Data Protection</h4>
                  <p className="mb-4">
                    Your privacy is important to us. Our collection and use of personal information is governed 
                    by our Privacy Policy, which is incorporated into these Terms by reference. By using our Service, 
                    you consent to the collection and use of information as described in our Privacy Policy.
                  </p>

                  <h4 className="mb-3">12. Disclaimers and Limitations of Liability</h4>
                  <p className="mb-4">
                    <strong>Service Disclaimer:</strong> Our Service is provided &quot;as is&quot; and &quot;as available&quot; 
                    without warranties of any kind. We disclaim all warranties, express or implied, including but 
                    not limited to warranties of merchantability, fitness for a particular purpose, and non-infringement.
                  </p>
                  <p className="mb-4">
                    <strong>Limitation of Liability:</strong> In no event shall Treading Hub be liable for any indirect, 
                    incidental, special, consequential, or punitive damages, including without limitation, loss of profits, 
                    data, use, goodwill, or other intangible losses, resulting from your use of the Service.
                  </p>

                  <h4 className="mb-3">13. Indemnification</h4>
                  <p className="mb-4">
                    You agree to defend, indemnify, and hold harmless Treading Hub and its officers, directors, 
                    employees, and agents from and against any claims, damages, obligations, losses, liabilities, 
                    costs, or debt, and expenses (including attorney&apos;s fees) arising from:
                  </p>
                  <ul className="mb-4">
                    <li>Your use of the Service</li>
                    <li>Your violation of these Terms</li>
                    <li>Your violation of any third-party rights</li>
                    <li>Any content you submit or transmit through the Service</li>
                  </ul>

                  <h4 className="mb-3">14. Termination</h4>
                  <p className="mb-4">
                    We may terminate or suspend your account and access to the Service immediately, without prior 
                    notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. 
                    Upon termination, your right to use the Service will cease immediately.
                  </p>

                  <h4 className="mb-3">15. Governing Law and Dispute Resolution</h4>
                  <p className="mb-4">
                    These Terms shall be governed by and construed in accordance with the laws of the jurisdiction 
                    in which Treading Hub operates, without regard to its conflict of law provisions. Any disputes 
                    arising from these Terms or your use of the Service shall be resolved through binding arbitration 
                    in accordance with the rules of the American Arbitration Association.
                  </p>

                  <h4 className="mb-3">16. Changes to Terms</h4>
                  <p className="mb-4">
                    We reserve the right to modify or replace these Terms at any time. If a revision is material, 
                    we will try to provide at least 30 days notice prior to any new terms taking effect. Your 
                    continued use of the Service after any changes constitutes acceptance of the new Terms.
                  </p>

                  <h4 className="mb-3">17. Severability</h4>
                  <p className="mb-4">
                    If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining 
                    provisions of these Terms will remain in effect. These Terms constitute the entire agreement 
                    between you and Treading Hub regarding the use of the Service.
                  </p>

                  <h4 className="mb-3">18. Contact Information</h4>
                  <p className="mb-4">
                    If you have any questions about these Terms of Use, please contact us:
                  </p>
                  <div className="bg-light p-3 rounded">
                    <p className="mb-1"><strong>Email:</strong> legal@treadinghub.com</p>
                    <p className="mb-1"><strong>Phone:</strong> +1 (555) 123-4567</p>
                    <p className="mb-1"><strong>Address:</strong> 123 Trading Street, Financial District, New York, NY 10001</p>
                    <p className="mb-0"><strong>Support Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM EST</p>
                  </div>

                  <div className="mt-4 p-3 bg-warning bg-opacity-10 rounded">
                    <h6 className="text-warning">Important Notice</h6>
                    <p className="mb-0 text-muted">
                      These Terms of Use are legally binding. Please read them carefully and ensure you understand 
                      your rights and obligations before using our Service. If you do not agree to any part of 
                      these Terms, you must not use our Service.
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
