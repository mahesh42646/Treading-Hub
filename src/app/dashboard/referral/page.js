'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardHeader from '../../user/components/DashboardHeader';
import { userApi } from '../../../services/api';

export default function DashboardReferral() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [referralData, setReferralData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReferralData = async () => {
    try {
      if (!user?.uid) return;
      const data = await userApi.getReferralStats(user.uid);
      setReferralData({
        referralCode: data.stats?.referralCode || data.stats?.myReferralCode,
        stats: {
          totalReferrals: data.stats?.totalReferrals || 0,
          completedReferrals: data.stats?.completedReferrals || 0,
          pendingReferrals: data.stats?.pendingReferrals || 0,
          totalEarnings: data.stats?.totalEarnings || 0
        },
        referrals: data.referrals || []
      });
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

  const referralCode = referralData?.referralCode || '';
  const referralLink = referralCode ? `${window.location.origin}/register?ref=${referralCode}` : 'Loading...';
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
            <h2 className="text-white">My Referrals</h2>
            <button 
              className="btn btn-sm rounded-4"
              style={{
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.5)',
                color: '#3b82f6'
              }}
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
              <div className="card border-0" style={{
                background: 'rgba(60, 58, 58, 0.03)',
                border: '1px solid rgba(124, 124, 124, 0.39)',
                backdropFilter: 'blur(20px)',
                boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
              }}>
                <div className="card-body" style={{ color: '#e2e8f0' }}>
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle p-3 me-3" style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid rgba(59, 130, 246, 0.5)'
                    }}>
                      <i className="bi bi-people fs-4" style={{ color: '#3b82f6' }}></i>
                    </div>
                    <div>
                      <h6 className="mb-1 text-white-50">Total Referrals</h6>
                      <h4 className="mb-0 text-white">{stats.totalReferrals}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3 mb-3">
              <div className="card border-0" style={{
                background: 'rgba(60, 58, 58, 0.03)',
                border: '1px solid rgba(124, 124, 124, 0.39)',
                backdropFilter: 'blur(20px)',
                boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
              }}>
                <div className="card-body" style={{ color: '#e2e8f0' }}>
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle p-3 me-3" style={{
                      background: 'rgba(34, 197, 94, 0.2)',
                      border: '1px solid rgba(34, 197, 94, 0.5)'
                    }}>
                      <i className="bi bi-check-circle fs-4" style={{ color: '#22c55e' }}></i>
                    </div>
                    <div>
                      <h6 className="mb-1 text-white-50">Completed</h6>
                      <h4 className="mb-0 text-white">{stats.completedReferrals}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3 mb-3">
              <div className="card border-0" style={{
                background: 'rgba(60, 58, 58, 0.03)',
                border: '1px solid rgba(124, 124, 124, 0.39)',
                backdropFilter: 'blur(20px)',
                boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
              }}>
                <div className="card-body" style={{ color: '#e2e8f0' }}>
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle p-3 me-3" style={{
                      background: 'rgba(251, 191, 36, 0.2)',
                      border: '1px solid rgba(251, 191, 36, 0.5)'
                    }}>
                      <i className="bi bi-hourglass fs-4" style={{ color: '#fbbf24' }}></i>
                    </div>
                    <div>
                      <h6 className="mb-1 text-white-50">Pending</h6>
                      <h4 className="mb-0 text-white">{stats.pendingReferrals}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3 mb-3">
              <div className="card border-0" style={{
                background: 'rgba(60, 58, 58, 0.03)',
                border: '1px solid rgba(124, 124, 124, 0.39)',
                backdropFilter: 'blur(20px)',
                boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
              }}>
                <div className="card-body" style={{ color: '#e2e8f0' }}>
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle p-3 me-3" style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid rgba(59, 130, 246, 0.5)'
                    }}>
                      <i className="bi bi-currency-rupee fs-4" style={{ color: '#3b82f6' }}></i>
                    </div>
                    <div>
                      <h6 className="mb-1 text-white-50">Total Earnings</h6>
                      <h4 className="mb-0 text-white">₹{stats.totalEarnings}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Referral Link */}
          <div className="card border-0 mb-4" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-body" style={{ color: '#e2e8f0' }}>
              <h5 className="mb-3 text-white">Your Referral Link</h5>
              <div className="input-group mb-3">
                <input
                  type="text"
                  className="form-control rounded-4"
                  style={{
                    background: 'rgba(60, 58, 58, 0.03)',
                    border: '1px solid rgba(124, 124, 124, 0.39)',
                    color: '#e2e8f0'
                  }}
                  value={referralLink}
                  readOnly
                />
                <button
                  className="btn rounded-4"
                  style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(59, 130, 246, 0.5)',
                    color: '#3b82f6'
                  }}
                  onClick={() => copyToClipboard(referralLink)}
                >
                  <i className="bi bi-clipboard me-2"></i>
                  Copy
                </button>
              </div>
            </div>
          </div>

          {/* Recent Referrals Table */}
          <div className="card border-0" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-body" style={{ color: '#e2e8f0' }}>
              <h5 className="mb-3 text-white">Recent Referrals</h5>
              <div className="table-responsive">
                <table className="table table-hover" style={{
                  background: 'rgba(66, 62, 77, 0.03)',
                  border: '1px solid rgba(124, 124, 124, 0.39)'
                }}>
                  <thead style={{
                    background: 'rgba(30, 30, 30, 0)',
                    borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
                  }}>
                    <tr>
                      <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0)' }}>User</th>
                      {/* <th>Email</th> */}
                      <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.1)' }}>Profile Complete</th>
                      <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.1)' }}>First Deposit</th>
                      <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.1)' }}>Plan</th>
                      <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.1)' }}>Status</th>
                      <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.1)' }}>Bonus Earned</th>
                      <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.1)' }}>Joined Date</th>
                    </tr>
                  </thead>
                  <tbody style={{ background: 'transparent' }}>
                    {referrals.length > 0 ? referrals.map((referral, index) => (
                      <tr key={referral.userId || index} style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
                      }}>
                        <td style={{ background: 'transparent' }}>
                          <div>
                            <strong className="text-white">{referral.userName || 'N/A'}</strong>
                            <br />
                            <small className="text-white-50">{referral.phone || 'No phone'}</small>
                          </div>
                        </td>
                        {/* <td>
                          <small>{referral.email || 'N/A'}</small>
                        </td> */}
                        <td style={{ background: 'transparent' }}>
                          <div className="d-flex align-items-center">
                            <div className="progress flex-grow-1 me-2" style={{ height: '8px', background: 'rgba(124, 124, 124, 0.39)' }}>
                              <div 
                                className="progress-bar" 
                                style={{ 
                                  width: `${referral.completionPercentage || 0}%`,
                                  background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)'
                                }}
                              ></div>
                            </div>
                            <small className="text-white-50">
                              {referral.completionPercentage || 0}%
                            </small>
                          </div>
                        </td>
                        <td style={{ background: 'transparent' }}>
                          {referral.hasDeposited ? (
                            <span className="badge" style={{
                              background: 'rgba(34, 197, 94, 0.2)',
                              color: '#22c55e',
                              border: '1px solid rgba(34, 197, 94, 0.5)'
                            }}>✓ Done</span>
                          ) : (
                            <span className="badge" style={{
                              background: 'rgba(124, 124, 124, 0.2)',
                              color: '#9ca3af',
                              border: '1px solid rgba(124, 124, 124, 0.5)'
                            }}>✗ Pending</span>
                          )}
                        </td>
                        <td style={{ background: 'transparent' }}>
                          {referral.hasFirstPlan ? (
                            <div>
                              <span className="badge" style={{
                                background: 'rgba(34, 197, 94, 0.2)',
                                color: '#22c55e',
                                border: '1px solid rgba(34, 197, 94, 0.5)'
                              }}>✓ ₹{referral.firstPaymentAmount },  Purchased</span>
                     
                              <small className="text-white-50"></small>
                            </div>
                          ) : (
                            <span className="badge" style={{
                              background: 'rgba(124, 124, 124, 0.2)',
                              color: '#9ca3af',
                              border: '1px solid rgba(124, 124, 124, 0.5)'
                            }}>No Plan</span>
                          )}
                        </td>
                        <td style={{ background: 'transparent' }}>
                          <span className={getStatusBadge(referral.status)} style={{
                            background: referral.status === 'completed' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                            color: referral.status === 'completed' ? '#22c55e' : '#fbbf24',
                            border: referral.status === 'completed' ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(251, 191, 36, 0.5)'
                          }}>
                            {referral.status === 'completed' ? 'Complete' : 'Pending'}
                          </span>
                        </td>
                        <td style={{ background: 'transparent' }}>
                          <strong className="text-success">₹{referral.bonusEarned || 0}</strong>
                          {referral.firstPaymentDate && (
                            <>
                              <br />
                              <small className="text-white-50">
                                {new Date(referral.firstPaymentDate).toLocaleDateString()}
                              </small>
                            </>
                          )}
                        </td>
                        <td style={{ background: 'transparent' }}>
                          <small className="text-white-50">{new Date(referral.joinedAt).toLocaleDateString()}</small>
                        </td>
                      </tr>
                    )) : (
                      <tr style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
                      }}>
                        <td colSpan="8" className="text-center text-white-50 py-4" style={{ background: 'transparent' }}>
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