'use client';

import React, { useState } from 'react';
import Header from '../../user/components/Header';
import Footer from '../../user/components/Footer';
import Sidebar from '../../user/components/Sidebar';

export default function Referral() {
  const [referralCode, setReferralCode] = useState('TH123456');
  const [referralLink, setReferralLink] = useState('https://treadinghub.com/ref/TH123456');

  const referralStats = {
    totalReferrals: 12,
    activeReferrals: 8,
    totalEarnings: 450,
    pendingEarnings: 75
  };

  const referrals = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@example.com',
      date: '2024-01-15',
      status: 'active',
      plan: 'Professional',
      earnings: 50
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      date: '2024-01-12',
      status: 'active',
      plan: 'Starter',
      earnings: 25
    },
    {
      id: 3,
      name: 'Mike Davis',
      email: 'mike.davis@example.com',
      date: '2024-01-10',
      status: 'pending',
      plan: 'Elite',
      earnings: 0
    },
    {
      id: 4,
      name: 'Emily Wilson',
      email: 'emily.w@example.com',
      date: '2024-01-08',
      status: 'active',
      plan: 'Professional',
      earnings: 50
    }
  ];

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const shareReferral = (platform) => {
    const text = `Join Treading Hub and start your trading journey! Use my referral code: ${referralCode}`;
    const url = referralLink;
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      default:
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return 'badge bg-success';
      case 'pending':
        return 'badge bg-warning';
      case 'inactive':
        return 'badge bg-secondary';
      default:
        return 'badge bg-secondary';
    }
  };

  return (
    <div className="min-vh-100 d-flex">
      <Sidebar />
      
      <div className="flex-grow-1">
        <Header />
        
        <div className="container-fluid py-4">
          <div className="row">
            <div className="col-12">
              <h2 className="mb-4">Referral Program</h2>

              {/* Referral Stats Cards */}
              <div className="row mb-4">
                <div className="col-md-3 mb-3">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                          <i className="bi bi-people text-primary fs-4"></i>
                        </div>
                        <div>
                          <h6 className="mb-1">Total Referrals</h6>
                          <h4 className="mb-0 text-primary">{referralStats.totalReferrals}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-3 mb-3">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3">
                          <i className="bi bi-check-circle text-success fs-4"></i>
                        </div>
                        <div>
                          <h6 className="mb-1">Active Referrals</h6>
                          <h4 className="mb-0 text-success">{referralStats.activeReferrals}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-3 mb-3">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="bg-warning bg-opacity-10 rounded-circle p-3 me-3">
                          <i className="bi bi-currency-dollar text-warning fs-4"></i>
                        </div>
                        <div>
                          <h6 className="mb-1">Total Earnings</h6>
                          <h4 className="mb-0 text-warning">${referralStats.totalEarnings}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-3 mb-3">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="bg-info bg-opacity-10 rounded-circle p-3 me-3">
                          <i className="bi bi-clock text-info fs-4"></i>
                        </div>
                        <div>
                          <h6 className="mb-1">Pending Earnings</h6>
                          <h4 className="mb-0 text-info">${referralStats.pendingEarnings}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-lg-8">
                  {/* Referral Link Section */}
                  <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-4">
                      <h5 className="mb-3">Your Referral Link</h5>
                      <div className="input-group mb-3">
                        <input
                          type="text"
                          className="form-control"
                          value={referralLink}
                          readOnly
                        />
                        <button
                          className="btn btn-primary"
                          onClick={() => copyToClipboard(referralLink)}
                        >
                          <i className="bi bi-clipboard me-2"></i>
                          Copy
                        </button>
                      </div>
                      
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Your Referral Code</label>
                          <div className="input-group">
                            <input
                              type="text"
                              className="form-control"
                              value={referralCode}
                              readOnly
                            />
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => copyToClipboard(referralCode)}
                            >
                              <i className="bi bi-clipboard"></i>
                            </button>
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Commission Rate</label>
                          <div className="form-control-plaintext">
                            <span className="badge bg-success fs-6">10% of plan fee</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Referrals List */}
                  <div className="card border-0 shadow-sm">
                    <div className="card-body p-4">
                      <h5 className="mb-3">Your Referrals</h5>
                      <div className="table-responsive">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Email</th>
                              <th>Date Joined</th>
                              <th>Plan</th>
                              <th>Status</th>
                              <th>Earnings</th>
                            </tr>
                          </thead>
                          <tbody>
                            {referrals.map((referral) => (
                              <tr key={referral.id}>
                                <td>{referral.name}</td>
                                <td>{referral.email}</td>
                                <td>{referral.date}</td>
                                <td>{referral.plan}</td>
                                <td>
                                  <span className={getStatusBadge(referral.status)}>
                                    {referral.status}
                                  </span>
                                </td>
                                <td className="text-success fw-bold">
                                  ${referral.earnings}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-lg-4">
                  {/* Share Section */}
                  <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-4">
                      <h5 className="mb-3">Share & Earn</h5>
                      <p className="text-muted mb-3">
                        Share your referral link with friends and earn 10% commission on their plan purchases.
                      </p>
                      
                      <div className="d-grid gap-2">
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => shareReferral('twitter')}
                        >
                          <i className="bi bi-twitter me-2"></i>
                          Share on Twitter
                        </button>
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => shareReferral('facebook')}
                        >
                          <i className="bi bi-facebook me-2"></i>
                          Share on Facebook
                        </button>
                        <button
                          className="btn btn-outline-primary"
                          onClick={() => shareReferral('linkedin')}
                        >
                          <i className="bi bi-linkedin me-2"></i>
                          Share on LinkedIn
                        </button>
                        <button
                          className="btn btn-outline-success"
                          onClick={() => shareReferral('whatsapp')}
                        >
                          <i className="bi bi-whatsapp me-2"></i>
                          Share on WhatsApp
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* How It Works */}
                  <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-4">
                      <h5 className="mb-3">How It Works</h5>
                      <div className="d-flex mb-3">
                        <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" 
                             style={{ width: '30px', height: '30px' }}>
                          <span className="text-primary fw-bold">1</span>
                        </div>
                        <div>
                          <h6 className="mb-1">Share Your Link</h6>
                          <p className="text-muted small mb-0">Share your unique referral link with friends</p>
                        </div>
                      </div>
                      
                      <div className="d-flex mb-3">
                        <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" 
                             style={{ width: '30px', height: '30px' }}>
                          <span className="text-primary fw-bold">2</span>
                        </div>
                        <div>
                          <h6 className="mb-1">They Sign Up</h6>
                          <p className="text-muted small mb-0">Your friends sign up using your referral link</p>
                        </div>
                      </div>
                      
                      <div className="d-flex mb-3">
                        <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-3" 
                             style={{ width: '30px', height: '30px' }}>
                          <span className="text-primary fw-bold">3</span>
                        </div>
                        <div>
                          <h6 className="mb-1">You Earn</h6>
                          <p className="text-muted small mb-0">Earn 10% commission on their plan purchases</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Commission Rates */}
                  <div className="card border-0 shadow-sm">
                    <div className="card-body p-4">
                      <h5 className="mb-3">Commission Rates</h5>
                      <div className="mb-2">
                        <div className="d-flex justify-content-between">
                          <span>Starter Plan ($99)</span>
                          <span className="fw-bold text-success">$9.90</span>
                        </div>
                      </div>
                      <div className="mb-2">
                        <div className="d-flex justify-content-between">
                          <span>Professional Plan ($199)</span>
                          <span className="fw-bold text-success">$19.90</span>
                        </div>
                      </div>
                      <div className="mb-2">
                        <div className="d-flex justify-content-between">
                          <span>Elite Plan ($399)</span>
                          <span className="fw-bold text-success">$39.90</span>
                        </div>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between">
                        <span className="fw-bold">Average Commission</span>
                        <span className="fw-bold text-primary">$23.23</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 