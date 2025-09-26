'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FaUsers, FaUserCheck, FaClock, FaDollarSign, FaChartLine, FaPlus, FaEye, FaEdit, FaEnvelope } from 'react-icons/fa';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalProfiles: 0,
    pendingKyc: 0,
    totalRevenue: 0,
    totalWithdrawals: 0,
    totalReferralBonuses: 0,
    newUsersLast7Days: 0,
    depositsLast7Days: 0,
    recentUsers: [],
    recentTransactions: [],
    recentContacts: []
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRecalculateReferrals = async () => {
    if (!confirm('This will recalculate all referral counts. Continue?')) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/recalculate-referral-counts`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`Referral counts recalculated successfully! Updated ${data.updatedProfiles} profiles.`);
        fetchDashboardData(); // Refresh dashboard data
      } else {
        alert('Failed to recalculate referral counts');
      }
    } catch (error) {
      console.error('Error recalculating referral counts:', error);
      alert('Error recalculating referral counts');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ color: '#e2e8f0' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0 text-white">Dashboard</h1>
   
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-xl-3 col-lg-6 mb-3">
          <div className="card border-0 h-100" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-body" style={{ color: '#e2e8f0' }}>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-circle p-3" style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(59, 130, 246, 0.5)'
                  }}>
                    <FaUsers style={{ color: '#3b82f6' }} size={24} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title text-white-50 mb-1">Total Users</h6>
                  <h4 className="mb-0 fw-bold text-white">{dashboardData.totalUsers.toLocaleString()}</h4>
                  <small className="text-success">+{dashboardData.newUsersLast7Days} this week</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-lg-6 mb-3">
          <div className="card border-0 h-100" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-body" style={{ color: '#e2e8f0' }}>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-circle p-3" style={{
                    background: 'rgba(34, 197, 94, 0.2)',
                    border: '1px solid rgba(34, 197, 94, 0.5)'
                  }}>
                    <FaDollarSign style={{ color: '#22c55e' }} size={24} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title text-white-50 mb-1">Total Revenue</h6>
                  <h4 className="mb-0 fw-bold text-white">₹{dashboardData.totalRevenue.toLocaleString()}</h4>
                  <small className="text-success">+₹{dashboardData.depositsLast7Days.toLocaleString()} this week</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-lg-6 mb-3">
          <div className="card border-0 h-100" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-body" style={{ color: '#e2e8f0' }}>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-circle p-3" style={{
                    background: 'rgba(251, 191, 36, 0.2)',
                    border: '1px solid rgba(251, 191, 36, 0.5)'
                  }}>
                    <FaClock style={{ color: '#fbbf24' }} size={24} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title text-white-50 mb-1">Pending KYC</h6>
                  <h4 className="mb-0 fw-bold text-white">{dashboardData.pendingKyc}</h4>
                  <small className="text-white-50">Awaiting verification</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-lg-6 mb-3">
          <div className="card border-0 h-100" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-body" style={{ color: '#e2e8f0' }}>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-circle p-3" style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(59, 130, 246, 0.5)'
                  }}>
                    <FaUserCheck style={{ color: '#3b82f6' }} size={24} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title text-white-50 mb-1">Complete Profiles</h6>
                  <h4 className="mb-0 fw-bold text-white">{dashboardData.totalProfiles}</h4>
                  <small className="text-white-50">{((dashboardData.totalProfiles/dashboardData.totalUsers)*100).toFixed(1)}% completion rate</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="row mb-4">
        <div className="col-lg-4 mb-3">
          <div className="card border-0 h-100" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-body" style={{ color: '#e2e8f0' }}>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-circle p-3" style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid rgba(239, 68, 68, 0.5)'
                  }}>
                    <FaChartLine style={{ color: '#ef4444' }} size={20} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title text-white-50 mb-1">Total Withdrawals</h6>
                  <h5 className="mb-0 fw-bold text-white">₹{dashboardData.totalWithdrawals.toLocaleString()}</h5>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 mb-3">
          <div className="card border-0 h-100" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-body" style={{ color: '#e2e8f0' }}>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-circle p-3" style={{
                    background: 'rgba(251, 191, 36, 0.2)',
                    border: '1px solid rgba(251, 191, 36, 0.5)'
                  }}>
                    <FaUsers style={{ color: '#fbbf24' }} size={20} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title text-white-50 mb-1">Referral Bonuses</h6>
                  <h5 className="mb-0 fw-bold text-white">₹{dashboardData.totalReferralBonuses.toLocaleString()}</h5>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4 mb-3">
          <div className="card border-0 h-100" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-body" style={{ color: '#e2e8f0' }}>
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-circle p-3" style={{
                    background: 'rgba(34, 197, 94, 0.2)',
                    border: '1px solid rgba(34, 197, 94, 0.5)'
                  }}>
                    <FaDollarSign style={{ color: '#22c55e' }} size={20} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title text-white-50 mb-1">Net Revenue</h6>
                  <h5 className="mb-0 fw-bold text-white">₹{(dashboardData.totalRevenue - dashboardData.totalWithdrawals).toLocaleString()}</h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-header" style={{
              background: 'rgba(60, 58, 58, 0.03)',
              borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
            }}>
              <h5 className="card-title mb-0 text-white">Quick Actions</h5>
            </div>
            <div className="card-body" style={{ color: '#e2e8f0' }}>
              <div className="row g-3">
                <div className="col-md-3">
                  <a href="/admin/users" className="btn w-100" style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(59, 130, 246, 0.5)',
                    color: '#3b82f6',
                    backdropFilter: 'blur(20px)',
                    boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
                  }}>
                    <FaUsers className="me-2" />
                    Manage Users
                  </a>
                </div>
                <div className="col-md-3">
                  <a href="/admin/challenges" className="btn w-100" style={{
                    background: 'rgba(34, 197, 94, 0.2)',
                    border: '1px solid rgba(34, 197, 94, 0.5)',
                    color: '#22c55e',
                    backdropFilter: 'blur(20px)',
                    boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
                  }}>
                    <FaPlus className="me-2" />
                    Manage Challenges
                  </a>
                </div>
                <div className="col-md-3">
                  <a href="/admin/trading-accounts" className="btn w-100" style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(59, 130, 246, 0.5)',
                    color: '#3b82f6',
                    backdropFilter: 'blur(20px)',
                    boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
                  }}>
                    <FaEdit className="me-2" />
                    Trading Accounts
                  </a>
                </div>
                <div className="col-md-3">
                  <button 
                    className="btn w-100"
                    onClick={handleRecalculateReferrals}
                    style={{
                      background: 'rgba(251, 191, 36, 0.2)',
                      border: '1px solid rgba(251, 191, 36, 0.5)',
                      color: '#fbbf24',
                      backdropFilter: 'blur(20px)',
                      boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
                    }}
                  >
                    <FaChartLine className="me-2" />
                    Fix Referral Counts
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="row">
        <div className="col-lg-4 mb-4">
          <div className="card border-0" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-header" style={{
              background: 'rgba(60, 58, 58, 0.03)',
              borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
            }}>
              <h5 className="card-title mb-0 text-white">Recent Users</h5>
            </div>
            <div className="card-body" style={{ color: '#e2e8f0' }}>
              {dashboardData.recentUsers?.length > 0 ? (
                <div className="list-group list-group-flush">
                  {dashboardData.recentUsers.map((user, index) => (
                    <div key={index} className="list-group-item border-0 px-0" style={{ background: 'transparent' }}>
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle p-2 me-3" style={{
                          background: 'rgba(59, 130, 246, 0.2)',
                          border: '1px solid rgba(59, 130, 246, 0.5)'
                        }}>
                          <FaUsers style={{ color: '#3b82f6' }} size={16} />
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1 text-white">{user.email}</h6>
                          <small className="text-white-50">Joined {user.createdAt}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white-50 text-center mb-0">No recent users</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4 mb-4">
          <div className="card border-0" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-header" style={{
              background: 'rgba(60, 58, 58, 0.03)',
              borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
            }}>
              <h5 className="card-title mb-0 text-white">Recent Transactions</h5>
            </div>
            <div className="card-body" style={{ color: '#e2e8f0' }}>
              {dashboardData.recentTransactions?.length > 0 ? (
                <div className="list-group list-group-flush">
                  {dashboardData.recentTransactions.map((transaction, index) => (
                    <div key={index} className="list-group-item border-0 px-0" style={{ background: 'transparent' }}>
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle p-2 me-3" style={{
                          background: 'rgba(34, 197, 94, 0.2)',
                          border: '1px solid rgba(34, 197, 94, 0.5)'
                        }}>
                          <FaChartLine style={{ color: '#22c55e' }} size={16} />
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1 text-white">₹{transaction.amount}</h6>
                          <small className="text-white-50">{transaction.type} by {transaction.userEmail}</small>
                          <br/>
                          <small className="text-white-50">{transaction.date}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white-50 text-center mb-0">No recent transactions</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4 mb-4">
          <div className="card border-0" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-header" style={{
              background: 'rgba(60, 58, 58, 0.03)',
              borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
            }}>
              <h5 className="card-title mb-0 text-white">Recent Contacts</h5>
            </div>
            <div className="card-body" style={{ color: '#e2e8f0' }}>
              {dashboardData.recentContacts?.length > 0 ? (
                <div className="list-group list-group-flush">
                  {dashboardData.recentContacts.map((contact, index) => (
                    <div key={index} className="list-group-item border-0 px-0" style={{ background: 'transparent' }}>
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle p-2 me-3" style={{
                          background: 'rgba(59, 130, 246, 0.2)',
                          border: '1px solid rgba(59, 130, 246, 0.5)'
                        }}>
                          <FaEnvelope style={{ color: '#3b82f6' }} size={16} />
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1 text-white">{contact.name}</h6>
                          <small className="text-white-50">{contact.subject} - {contact.date}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white-50 text-center mb-0">No recent contacts</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
