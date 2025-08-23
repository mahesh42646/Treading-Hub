import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      color: '#e2e8f0',
      borderTop: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <div className="container py-5">
        <div className="row">
          {/* Company */}
          <div className="col-lg-2 col-md-4 mb-4">
            <h6 className="fw-bold mb-3" style={{ color: '#f1f5f9' }}>Company</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link href="/about" className="text-muted text-decoration-none" style={{ 
                  color: '#94a3b8',
                  transition: 'color 0.3s ease'
                }}>
                  About Us
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/contact" className="text-muted text-decoration-none" style={{ 
                  color: '#94a3b8',
                  transition: 'color 0.3s ease'
                }}>
                  Contact Us
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/careers" className="text-muted text-decoration-none" style={{ 
                  color: '#94a3b8',
                  transition: 'color 0.3s ease'
                }}>
                  Careers
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/blog" className="text-muted text-decoration-none" style={{ 
                  color: '#94a3b8',
                  transition: 'color 0.3s ease'
                }}>
                  Blog
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/news" className="text-muted text-decoration-none" style={{ 
                  color: '#94a3b8',
                  transition: 'color 0.3s ease'
                }}>
                  News
                </Link>
              </li>
            </ul>
          </div>

          {/* Programs */}
          <div className="col-lg-2 col-md-4 mb-4">
            <h6 className="fw-bold mb-3" style={{ color: '#f1f5f9' }}>Programs</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link href="/evaluation" className="text-muted text-decoration-none" style={{ 
                  color: '#94a3b8',
                  transition: 'color 0.3s ease'
                }}>
                  Evaluation
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/express" className="text-muted text-decoration-none" style={{ 
                  color: '#94a3b8',
                  transition: 'color 0.3s ease'
                }}>
                  Express
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/stellar" className="text-muted text-decoration-none" style={{ 
                  color: '#94a3b8',
                  transition: 'color 0.3s ease'
                }}>
                  Stellar
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/one-step" className="text-muted text-decoration-none" style={{ 
                  color: '#94a3b8',
                  transition: 'color 0.3s ease'
                }}>
                  One-Step
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/scaling" className="text-muted text-decoration-none" style={{ 
                  color: '#94a3b8',
                  transition: 'color 0.3s ease'
                }}>
                  Scaling Plan
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/payouts" className="text-muted text-decoration-none" style={{ 
                  color: '#94a3b8',
                  transition: 'color 0.3s ease'
                }}>
                  Payouts
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="col-lg-2 col-md-4 mb-4">
            <h6 className="fw-bold mb-3" style={{ color: '#f1f5f9' }}>Resources</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link href="/faq" className="text-muted text-decoration-none" style={{ 
                  color: '#94a3b8',
                  transition: 'color 0.3s ease'
                }}>
                  FAQ
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/help" className="text-muted text-decoration-none" style={{ 
                  color: '#94a3b8',
                  transition: 'color 0.3s ease'
                }}>
                  Help Center
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/rules" className="text-muted text-decoration-none" style={{ 
                  color: '#94a3b8',
                  transition: 'color 0.3s ease'
                }}>
                  Trading Rules
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/platforms" className="text-muted text-decoration-none" style={{ 
                  color: '#94a3b8',
                  transition: 'color 0.3s ease'
                }}>
                  Trading Platforms
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/affiliates" className="text-muted text-decoration-none" style={{ 
                  color: '#94a3b8',
                  transition: 'color 0.3s ease'
                }}>
                  Affiliates
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/api" className="text-muted text-decoration-none" style={{ 
                  color: '#94a3b8',
                  transition: 'color 0.3s ease'
                }}>
                  API
                </Link>
              </li>
            </ul>
          </div>

          {/* Privacy Policy */}
          <div className="col-lg-2 col-md-4 mb-4">
            <h6 className="fw-bold mb-3" style={{ color: '#f1f5f9' }}>Privacy Policy</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link href="/privacy" className="text-muted text-decoration-none" style={{ 
                  color: '#94a3b8',
                  transition: 'color 0.3s ease'
                }}>
                  Privacy Policy
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/terms" className="text-muted text-decoration-none" style={{ 
                  color: '#94a3b8',
                  transition: 'color 0.3s ease'
                }}>
                  Terms & Conditions
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/refund" className="text-muted text-decoration-none" style={{ 
                  color: '#94a3b8',
                  transition: 'color 0.3s ease'
                }}>
                  Refund Policy
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/disclaimer" className="text-muted text-decoration-none" style={{ 
                  color: '#94a3b8',
                  transition: 'color 0.3s ease'
                }}>
                  Disclaimer
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/cookies" className="text-muted text-decoration-none" style={{ 
                  color: '#94a3b8',
                  transition: 'color 0.3s ease'
                }}>
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div className="col-lg-2 col-md-4 mb-4">
            <h6 className="fw-bold mb-3" style={{ color: '#f1f5f9' }}>Community</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none" style={{ 
                  color: '#94a3b8',
                  transition: 'color 0.3s ease'
                }}>
                  Discord
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none" style={{ 
                  color: '#94a3b8',
                  transition: 'color 0.3s ease'
                }}>
                  Telegram
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none" style={{ 
                  color: '#94a3b8',
                  transition: 'color 0.3s ease'
                }}>
                  Facebook
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none" style={{ 
                  color: '#94a3b8',
                  transition: 'color 0.3s ease'
                }}>
                  Instagram
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none" style={{ 
                  color: '#94a3b8',
                  transition: 'color 0.3s ease'
                }}>
                  Twitter
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none" style={{ 
                  color: '#94a3b8',
                  transition: 'color 0.3s ease'
                }}>
                  YouTube
                </a>
              </li>
            </ul>
          </div>

          {/* Partners/Platforms */}
          <div className="col-lg-2 col-md-4 mb-4">
            <h6 className="fw-bold mb-3" style={{ color: '#f1f5f9' }}>Partners/Platforms</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none" style={{ 
                  color: '#94a3b8',
                  transition: 'color 0.3s ease'
                }}>
                  Trustpilot
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none" style={{ 
                  color: '#94a3b8',
                  transition: 'color 0.3s ease'
                }}>
                  MetaTrader 4
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none" style={{ 
                  color: '#94a3b8',
                  transition: 'color 0.3s ease'
                }}>
                  MetaTrader 5
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-muted text-decoration-none" style={{ 
                  color: '#94a3b8',
                  transition: 'color 0.3s ease'
                }}>
                  cTrader
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <hr className="my-4" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />
        
        <div className="row align-items-center">
          <div className="col-md-6">
            <p className="mb-0 text-muted" style={{ color: '#64748b' }}>
              © 2023 FUNDEDNEXT. All rights reserved.
            </p>
          </div>
        </div>
        
        {/* Legal Disclaimer */}
        <div className="mt-3">
          <p className="text-muted small" style={{ color: '#64748b', fontSize: '0.75rem', lineHeight: '1.4' }}>
            Risk Warning: Trading in financial instruments carries a high level of risk and may not be suitable for all investors. The high degree of leverage can work against you as well as for you. Before deciding to trade in financial instruments, you should carefully consider your investment objectives, level of experience, and risk appetite. The possibility exists that you could sustain a loss of some or all of your initial investment and therefore you should not invest money that you cannot afford to lose. You should be aware of all the risks associated with trading in financial instruments and seek advice from an independent financial advisor if you have any doubts.
          </p>
        </div>
      </div>
    </footer>
  );
} 