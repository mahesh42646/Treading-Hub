'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardHeader from '../../user/components/DashboardHeader';

export default function DashboardReferral() {
  const { user } = useAuth();
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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return 'badge bg-success';
      case 'pending':
        return 'badge bg-warning';
      default:
        return 'badge bg-secondary';
    }
  };

  const getCompletionColor = (percentage) => {
    if (percentage >= 100) return 'text-success';
    if (percentage >= 70) return 'text-warning';
    return 'text-danger';
  };

  if (loading) {
    return (
      <div className="container-fluid">
        <DashboardHeader />
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
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

  return (
    <div className="container-fluid">
     
      
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>My Referrals</h2>
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

          {/* Stats Cards */}
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
                      <h6 className="mb-1">Completed</h6>
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
                      <h6 className="mb-1">Pending</h6>
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

          {/* Referral Link */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-body">
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
            </div>
          </div>

          {/* Recent Referrals Table */}
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="mb-3">Recent Referrals</h5>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Profile Complete</th>
                      <th>First Deposit</th>
                      <th>Plan</th>
                      <th>Status</th>
                      <th>Bonus Earned</th>
                      <th>Joined Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.length > 0 ? referrals.map((referral, index) => (
                      <tr key={referral.userId || index}>
                        <td>
                          <div>
                            <strong>{referral.userName || 'N/A'}</strong>
                            <br />
                            <small className="text-muted">{referral.phone || 'No phone'}</small>
                          </div>
                        </td>
                        <td>
                          <small>{referral.email || 'N/A'}</small>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="progress flex-grow-1 me-2" style={{ height: '8px' }}>
                              <div 
                                className="progress-bar" 
                                style={{ width: `${referral.profileCompletion || 0}%` }}
                              ></div>
                            </div>
                            <small className={getCompletionColor(referral.profileCompletion || 0)}>
                              {referral.profileCompletion || 0}%
                            </small>
                          </div>
                        </td>
                        <td>
                          {referral.hasFirstDeposit ? (
                            <span className="badge bg-success">✓ True</span>
                          ) : (
                            <span className="badge bg-secondary">✗ False</span>
                          )}
                        </td>
                        <td>
                          {referral.hasActivePlan ? (
                            <div>
                              <span className="badge bg-success">✓ {referral.planName}</span>
                              <br />
                              <small className="text-muted">₹{referral.planPrice}</small>
                            </div>
                          ) : (
                            <span className="badge bg-secondary">No Plan</span>
                          )}
                        </td>
                        <td>
                          <span className={getStatusBadge(referral.status)}>
                            {referral.status === 'completed' ? 'Complete' : 'Pending'}
                          </span>
                        </td>
                        <td>
                          <strong className="text-success">₹{referral.bonusEarned || 0}</strong>
                          {referral.bonusCreditedAt && (
                            <>
                              <br />
                              <small className="text-muted">
                                {new Date(referral.bonusCreditedAt).toLocaleDateString()}
                              </small>
                            </>
                          )}
                        </td>
                        <td>
                          <small>{new Date(referral.joinedAt).toLocaleDateString()}</small>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="8" className="text-center text-muted py-4">
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
      </div>
    </div>
  );
}