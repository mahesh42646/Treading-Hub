'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { buildApiUrl } from '../../../utils/config';

const ReferralPage = () => {
  const { user, profile } = useAuth();
  const [referralData, setReferralData] = useState({
    code: '',
    link: '',
    totalReferrals: 0,
    activeReferrals: 0,
    totalEarnings: 0,
    pendingReferrals: 0,
    completedReferrals: 0
  });
  const [referralHistory, setReferralHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchReferralData();
  }, [profile]);

  const fetchReferralData = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      // Generate direct registration link with referral code
      const currentDomain = window.location.origin;
      const referralCode = profile?.referral?.code || 'N/A';
      const referralLink = `${currentDomain}/register?ref=${referralCode}`;
      
      console.log('🔗 Generated referral link:', referralLink);
      
      // Fetch referral stats from API
      const response = await fetch(buildApiUrl(`/referral/stats/${user.uid}`), {
        headers: {
          'Authorization': `Bearer ${await user.getIdToken()}`
        }
      });

      if (response.ok) {
        const apiData = await response.json();
        setReferralData({
          code: apiData.stats.referralCode,
          link: referralLink,
          totalReferrals: apiData.stats.totalReferrals,
          activeReferrals: apiData.stats.totalReferrals,
          totalEarnings: apiData.stats.totalEarnings,
          pendingReferrals: apiData.stats.pendingReferrals,
          completedReferrals: apiData.stats.completedReferrals
        });
        setReferralHistory(apiData.referrals || []);
      } else {
        // Fallback to profile data if API fails
        setReferralData({
          code: referralCode,
          link: referralLink,
          totalReferrals: profile?.referral?.totalReferrals || 0,
          activeReferrals: profile?.referral?.activeReferrals || 0,
          totalEarnings: profile?.referral?.totalEarnings || 0,
          pendingReferrals: profile?.referral?.pendingReferrals || 0,
          completedReferrals: profile?.referral?.completedReferrals || 0
        });
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
      // Fallback to profile data
      const currentDomain = window.location.origin;
      const referralCode = profile?.referral?.code || 'N/A';
      const referralLink = `${currentDomain}/ref/${referralCode}`;
      
      setReferralData({
        code: referralCode,
        link: referralLink,
        totalReferrals: profile?.referral?.totalReferrals || 0,
        activeReferrals: profile?.referral?.activeReferrals || 0,
        totalEarnings: profile?.referral?.totalEarnings || 0,
        pendingReferrals: profile?.referral?.pendingReferrals || 0,
        completedReferrals: profile?.referral?.completedReferrals || 0
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setMessage('Copied to clipboard!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to copy to clipboard');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const shareReferral = (platform) => {
    const shareText = `Join Trading Hub using my referral link and get started with professional trading! Earn rewards and start your trading journey today.`;
    const shareUrl = referralData.link;
    
    let shareLink = '';
    switch (platform) {
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
        break;
      case 'telegram':
        shareLink = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
        break;
      default:
        shareLink = shareUrl;
    }
    
    window.open(shareLink, '_blank');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Page Header */}
      <div className="page- mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title mb-1">Referral Program</h1>
            <p className="page-subtitle text-muted">Earn rewards by inviting friends to Trading Hub</p>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-primary"
              onClick={() => copyToClipboard(referralData.link)}
            >
              <i className="bi bi-link-45deg"></i> Copy Link
            </button>
            <button
              className="btn btn-primary"
              onClick={() => shareReferral('whatsapp')}
            >
              <i className="bi bi-whatsapp"></i> Share
            </button>
          </div>
        </div>
      </div>

      {/* Alert Message */}
      {message && (
        <div className="alert alert-success alert-dismissible fade show mb-4">
          {message}
          <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
        </div>
      )}

      {/* Referral Stats Cards */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-people-fill text-primary" style={{ fontSize: '2rem' }}></i>
              </div>
              <h3 className="card-title mb-1">{referralData.totalReferrals}</h3>
              <p className="card-text text-muted">Total Referrals</p>
            </div>
          </div>
        </div>
        
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '2rem' }}></i>
              </div>
              <h3 className="card-title mb-1">{referralData.completedReferrals}</h3>
              <p className="card-text text-muted">Completed</p>
            </div>
          </div>
        </div>
        
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-clock-fill text-warning" style={{ fontSize: '2rem' }}></i>
              </div>
              <h3 className="card-title mb-1">{referralData.pendingReferrals}</h3>
              <p className="card-text text-muted">Pending</p>
            </div>
          </div>
        </div>
        
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card h-100">
            <div className="card-body text-center">
              <div className="mb-3">
                <i className="bi bi-currency-rupee text-success" style={{ fontSize: '2rem' }}></i>
              </div>
              <h3 className="card-title mb-1">₹{referralData.totalEarnings}</h3>
              <p className="card-text text-muted">Total Earnings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Link Section */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Your Referral Link</h5>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <label className="form-label">Direct Registration Link</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    value={referralData.link}
                    readOnly
                  />
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => copyToClipboard(referralData.link)}
                  >
                    <i className="bi bi-copy"></i> Copy
                  </button>
                </div>
                <small className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  This link takes users directly to registration page with your referral code
                </small>
              </div>

              <div className="mb-4">
                <h6>Quick Share</h6>
                <div className="d-flex gap-2 flex-wrap">
                  <button
                    className="btn btn-outline-success"
                    onClick={() => shareReferral('whatsapp')}
                  >
                    <i className="bi bi-whatsapp"></i> WhatsApp
                  </button>
                  <button
                    className="btn btn-outline-info"
                    onClick={() => shareReferral('telegram')}
                  >
                    <i className="bi bi-telegram"></i> Telegram
                  </button>
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => shareReferral('facebook')}
                  >
                    <i className="bi bi-facebook"></i> Facebook
                  </button>
                  <button
                    className="btn btn-outline-info"
                    onClick={() => shareReferral('twitter')}
                  >
                    <i className="bi bi-twitter"></i> Twitter
                  </button>
                </div>
              </div>

              <div className="alert alert-info">
                <h6 className="alert-heading">How it works:</h6>
                <ul className="mb-0">
                  <li><strong>Share your direct registration link</strong> with friends</li>
                  <li><strong>Link takes them straight to registration</strong> with your referral code attached</li>
                  <li><strong>They create account</strong> - automatically linked to your referral</li>
                  <li><strong>When they make first deposit</strong> - you earn 20% bonus instantly</li>
                  <li><strong>Bonus added to referral balance</strong> - withdraw anytime (min ₹500)</li>
                </ul>
              </div>

              <div className="alert alert-warning">
                <h6 className="alert-heading">Referral Benefits:</h6>
                <ul className="mb-0">
                  <li>Earn 20% of first deposit per referral</li>
                  <li>No limit on referrals</li>
                  <li>Instant bonus when referral deposits</li>
                  <li>Withdraw referral earnings to your wallet</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Referral History */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Recent Referrals</h5>
            </div>
            <div className="card-body">
              {referralHistory.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Joined</th>
                        <th>Progress</th>
                        <th>Status</th>
                        <th>Earnings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referralHistory.map((referral, index) => (
                        <tr key={index}>
                          <td>
                            <div>
                              <div className="fw-bold">{referral.userName}</div>
                              <small className="text-muted">{referral.phone}</small>
                            </div>
                          </td>
                          <td>{new Date(referral.joinedAt).toLocaleDateString()}</td>
                          <td>
                            <div>
                              <div className="progress mb-1" style={{ height: '6px' }}>
                                <div 
                                  className="progress-bar bg-primary" 
                                  style={{ width: `${referral.completionPercentage}%` }}
                                ></div>
                              </div>
                              <small className="text-muted">{referral.completionPercentage}% complete</small>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${referral.hasDeposited ? 'bg-success' : 'bg-warning'}`}>
                              {referral.hasDeposited ? 'Completed' : 'Pending'}
                            </span>
                          </td>
                          <td>₹{referral.bonusEarned}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-people text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="text-muted mt-3">No referrals yet. Start sharing your link to earn rewards!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralPage;
