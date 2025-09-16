'use client';

import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import Header from '../../user/components/Header';
import Footer from '../../user/components/Footer';
import Sidebar from '../../user/components/Sidebar';

export default function Referral() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [referralData, setReferralData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReferralData = async () => {
    try {
      if (!user?.uid) return;
      
      const response = await fetch('/api/profile/referral', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.uid}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReferralData(data);
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReferralData();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReferralData();
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex">
        <Sidebar />
        <div className="flex-grow-1">
          <Header />
          <div className="container-fluid py-4">
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const referralCode = referralData?.referralCode || 'Loading...';
  const referralLink = `${window.location.origin}/ref/${referralCode}`;
  const stats = referralData?.stats || {
    totalReferrals: 0,
    completedReferrals: 0,
    pendingReferrals: 0,
    totalEarnings: 0
  };
  const referrals = referralData?.referrals || [];

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
                          <h4 className="mb-0 text-primary">{stats.totalReferrals}</h4>
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
                          <h6 className="mb-1">Completed Referrals</h6>
                          <h4 className="mb-0 text-success">{stats.completedReferrals}</h4>
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
                          <i className="bi bi-hourglass text-warning fs-4"></i>
                        </div>
                        <div>
                          <h6 className="mb-1">Pending Referrals</h6>
                          <h4 className="mb-0 text-warning">{stats.pendingReferrals}</h4>
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
                          <i className="bi bi-currency-rupee text-info fs-4"></i>
                        </div>
                        <div>
                          <h6 className="mb-1">Total Earnings</h6>
                          <h4 className="mb-0 text-info">₹{stats.totalEarnings}</h4>
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
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">Your Referral Link</h5>
                        <button 
                          className="btn btn-outline-primary btn-sm"
                          onClick={handleRefresh}
                          disabled={refreshing}
                        >
                          {refreshing ? (
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          ) : (
                            <i className="bi bi-arrow-clockwise me-2"></i>
                          )}
                          Refresh
                        </button>
                      </div>
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
                            <span className="badge bg-success fs-6">20% of first plan purchase</span>
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
                              <th>Phone</th>
                              <th>Date Joined</th>
                              <th>Status</th>
                              <th>Plan Purchase</th>
                              <th>Bonus Earned</th>
                            </tr>
                          </thead>
                          <tbody>
                            {referrals.length > 0 ? referrals.map((referral, index) => (
                              <tr key={referral.userId || index}>
                                <td>{referral.userName || 'N/A'}</td>
                                <td>{referral.phone || 'N/A'}</td>
                                <td>{new Date(referral.joinedAt).toLocaleDateString()}</td>
                                <td>
                                  <span className={getStatusBadge(referral.hasDeposited ? 'completed' : 'pending')}>
                                    {referral.hasDeposited ? 'Completed' : 'Pending'}
                                  </span>
                                </td>
                                <td>
                                  {referral.hasDeposited ? (
                                    <span className="text-success">₹{referral.firstPaymentAmount || 0}</span>
                                  ) : (
                                    <span className="text-muted">No plan yet</span>
                                  )}
                                </td>
                                <td className="text-success fw-bold">
                                  ₹{referral.bonusEarned || 0}
                                </td>
                              </tr>
                            )) : (
                              <tr>
                                <td colspan="6" className="text-center text-muted py-4">
                                  No referrals yet. Share your referral link to start earning!
                                </td>
                              </tr>
                            )}
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
                        Share your referral link with friends and earn 20% bonus when they purchase their first plan.
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
                          <p className="text-muted small mb-0">Earn 20% bonus when they purchase their first plan</p>
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