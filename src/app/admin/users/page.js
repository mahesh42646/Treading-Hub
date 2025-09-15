'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaSearch, 
  FaEye, 
  FaCheck, 
  FaTimes, 
  FaUserCheck,
  FaUserTimes,
  FaSpinner
} from 'react-icons/fa';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [kycActionLoading, setKycActionLoading] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [plans, setPlans] = useState([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        search: searchTerm
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users?${params}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setTotalPages(data.pagination?.total || 1);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchUsers();
    fetchPlans();
  }, [fetchUsers]);

  const fetchPlans = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/plans`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const handleKycAction = async (uid, action) => {
    setKycActionLoading(uid);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/kyc-${action}/${uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(action === 'reject' ? { reason: 'Admin rejection' } : {})
      });

      if (response.ok) {
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      console.error(`Error ${action}ing KYC:`, error);
    } finally {
      setKycActionLoading(null);
    }
  };

  const viewUserDetails = async (uid) => {
    setLoadingAnalytics(true);
    try {
      // Fetch user details
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${uid}`, {
        credentials: 'include'
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setSelectedUser(userData.user);
        
        // Fetch user analytics (wallet data, referrals, transactions)
        const [walletResponse, referralResponse, transactionResponse] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wallet/balance/${uid}`, {
            credentials: 'include'
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wallet/referral-history/${uid}`, {
            credentials: 'include'
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/user-transactions/${uid}`, {
            credentials: 'include'
          })
        ]);

        const analytics = {
          wallet: walletResponse.ok ? await walletResponse.json() : null,
          referrals: referralResponse.ok ? await referralResponse.json() : null,
          transactions: transactionResponse.ok ? await transactionResponse.json() : null
        };
        
        setUserAnalytics(analytics);
        setShowUserModal(true);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const assignPlan = async (uid, planId) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/assign-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ uid, planId })
      });

      if (response.ok) {
        alert('Plan assigned successfully!');
        setShowSubscriptionModal(false);
        viewUserDetails(uid); // Refresh user data
      } else {
        alert('Failed to assign plan');
      }
    } catch (error) {
      console.error('Error assigning plan:', error);
      alert('Error assigning plan');
    }
  };

  const getKycStatusBadge = (status) => {
    switch (status) {
      case 'not_applied':
        return <span className="badge bg-secondary">Not Applied</span>;
      case 'applied':
        return <span className="badge bg-info">Under Review</span>;
      case 'approved':
        return <span className="badge bg-success">Approved</span>;
      case 'rejected':
        return <span className="badge bg-danger">Rejected</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
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
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">User Management</h1>
          <p className="text-muted mb-0">Manage users and their KYC status</p>
        </div>
        <div className="d-flex gap-2">
          <span className="badge bg-primary fs-6">
            Total: {users.length}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="input-group">
            <span className="input-group-text">
              <FaSearch />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search users by email or name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Profile Status</th>
                  <th>KYC Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
                          <span className="text-primary fw-bold">{user.email?.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <strong>{user.email}</strong>
                          <br />
                          <small className="text-muted">UID: {user.uid}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      {user.profile ? (
                        <span className="badge bg-success">Complete</span>
                      ) : (
                        <span className="badge bg-warning">Incomplete</span>
                      )}
                    </td>
                    <td>
                      {user.profile?.kyc?.status ? (
                        getKycStatusBadge(user.profile.kyc.status)
                      ) : (
                        <span className="badge bg-secondary">Not Started</span>
                      )}
                    </td>
                    <td>
                      <small className="text-muted">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </small>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button 
                          className="btn btn-outline-primary"
                          onClick={() => viewUserDetails(user.uid)}
                        >
                          <FaEye />
                        </button>
                        {user.profile?.kyc?.status === 'applied' && (
                          <>
                            <button 
                              className="btn btn-outline-success"
                              onClick={() => handleKycAction(user.uid, 'approve')}
                              disabled={kycActionLoading === user.uid}
                            >
                              {kycActionLoading === user.uid ? (
                                <FaSpinner className="fa-spin" />
                              ) : (
                                <FaCheck />
                              )}
                            </button>
                            <button 
                              className="btn btn-outline-danger"
                              onClick={() => handleKycAction(user.uid, 'reject')}
                              disabled={kycActionLoading === user.uid}
                            >
                              {kycActionLoading === user.uid ? (
                                <FaSpinner className="fa-spin" />
                              ) : (
                                <FaTimes />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <small className="text-muted">
                Page {currentPage} of {totalPages}
              </small>
              <div className="btn-group">
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comprehensive User Analytics Modal */}
      {showUserModal && selectedUser && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <FaUserCheck className="me-2" />
                  Complete User Analytics - {selectedUser.email}
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowUserModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {loadingAnalytics ? (
                  <div className="text-center py-5">
                    <FaSpinner className="fa-spin fs-1 text-primary mb-3" />
                    <p>Loading complete analytics...</p>
                  </div>
                ) : (
                  <>
                    {/* User Basic Info & Actions */}
                    <div className="row mb-4">
                      <div className="col-md-8">
                        <div className="card border-0 bg-light">
                          <div className="card-body">
                            <h6 className="fw-bold mb-3">Basic Information</h6>
                            <div className="row">
                              <div className="col-sm-6">
                                <strong>Email:</strong> {selectedUser.email}<br/>
                                <strong>UID:</strong> {selectedUser.uid}<br/>
                                <strong>Joined:</strong> {new Date(selectedUser.createdAt).toLocaleDateString()}<br/>
                              </div>
                              <div className="col-sm-6">
                                <strong>KYC Status:</strong> {getKycStatusBadge(selectedUser.profile?.profileCompletion?.kycStatus)}<br/>
                                <strong>Profile:</strong> {selectedUser.profile ? 'Complete' : 'Incomplete'}<br/>
                                <strong>Status:</strong> <span className="badge bg-success">Active</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="d-grid gap-2">
                          {selectedUser.profile?.profileCompletion?.kycStatus === 'applied' && (
                            <>
                              <button 
                                className="btn btn-success btn-sm"
                                onClick={() => handleKycAction(selectedUser.uid, 'approve')}
                                disabled={kycActionLoading === selectedUser.uid}
                              >
                                <FaCheck className="me-1" />
                                Approve KYC
                              </button>
                              <button 
                                className="btn btn-danger btn-sm"
                                onClick={() => handleKycAction(selectedUser.uid, 'reject')}
                                disabled={kycActionLoading === selectedUser.uid}
                              >
                                <FaTimes className="me-1" />
                                Reject KYC
                              </button>
                            </>
                          )}
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              setShowSubscriptionModal(true);
                              setShowUserModal(false);
                            }}
                          >
                            <FaUserCheck className="me-1" />
                            Assign Plan
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Financial Analytics */}
                    {userAnalytics?.wallet && (
                      <div className="row mb-4">
                        <div className="col-12">
                          <h6 className="fw-bold mb-3">Financial Overview</h6>
                          <div className="row">
                            <div className="col-lg-3 col-md-6 mb-3">
                              <div className="card border-0 bg-primary bg-opacity-10">
                                <div className="card-body text-center">
                                  <h5 className="fw-bold text-primary">₹{userAnalytics.wallet.walletBalance?.toFixed(2) || '0.00'}</h5>
                                  <small className="text-muted">Wallet Balance</small>
                                </div>
                              </div>
                            </div>
                            <div className="col-lg-3 col-md-6 mb-3">
                              <div className="card border-0 bg-warning bg-opacity-10">
                                <div className="card-body text-center">
                                  <h5 className="fw-bold text-warning">₹{userAnalytics.wallet.referralBalance?.toFixed(2) || '0.00'}</h5>
                                  <small className="text-muted">Referral Balance</small>
                                </div>
                              </div>
                            </div>
                            <div className="col-lg-3 col-md-6 mb-3">
                              <div className="card border-0 bg-success bg-opacity-10">
                                <div className="card-body text-center">
                                  <h5 className="fw-bold text-success">₹{userAnalytics.wallet.totalDeposits?.toFixed(2) || '0.00'}</h5>
                                  <small className="text-muted">Total Deposits</small>
                                </div>
                              </div>
                            </div>
                            <div className="col-lg-3 col-md-6 mb-3">
                              <div className="card border-0 bg-danger bg-opacity-10">
                                <div className="card-body text-center">
                                  <h5 className="fw-bold text-danger">₹{userAnalytics.wallet.totalWithdrawals?.toFixed(2) || '0.00'}</h5>
                                  <small className="text-muted">Total Withdrawals</small>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Referral Analytics */}
                    {userAnalytics?.referrals && (
                      <div className="row mb-4">
                        <div className="col-12">
                          <h6 className="fw-bold mb-3">Referral Performance</h6>
                          <div className="row">
                            <div className="col-lg-4 col-md-6 mb-3">
                              <div className="card border-0 bg-info bg-opacity-10">
                                <div className="card-body text-center">
                                  <h5 className="fw-bold text-info">{userAnalytics.referrals.totalReferred || 0}</h5>
                                  <small className="text-muted">Total Referred</small>
                                </div>
                              </div>
                            </div>
                            <div className="col-lg-4 col-md-6 mb-3">
                              <div className="card border-0 bg-success bg-opacity-10">
                                <div className="card-body text-center">
                                  <h5 className="fw-bold text-success">{userAnalytics.referrals.activeReferred || 0}</h5>
                                  <small className="text-muted">Active Referrals</small>
                                </div>
                              </div>
                            </div>
                            <div className="col-lg-4 col-md-6 mb-3">
                              <div className="card border-0 bg-warning bg-opacity-10">
                                <div className="card-body text-center">
                                  <h5 className="fw-bold text-warning">₹{userAnalytics.referrals.totalReferralEarnings?.toFixed(2) || '0.00'}</h5>
                                  <small className="text-muted">Referral Earnings</small>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Recent Transactions */}
                    {userAnalytics?.transactions && (
                      <div className="row mb-4">
                        <div className="col-12">
                          <h6 className="fw-bold mb-3">Recent Transactions</h6>
                          <div className="table-responsive">
                            <table className="table table-sm">
                              <thead>
                                <tr>
                                  <th>Type</th>
                                  <th>Amount</th>
                                  <th>Status</th>
                                  <th>Date</th>
                                </tr>
                              </thead>
                              <tbody>
                                {userAnalytics.transactions.transactions?.slice(0, 5).map((tx, idx) => (
                                  <tr key={idx}>
                                    <td>
                                      <span className="text-capitalize">{tx.type.replace('_', ' ')}</span>
                                    </td>
                                    <td>
                                      <span className={tx.type === 'deposit' ? 'text-success' : 'text-danger'}>
                                        {tx.type === 'deposit' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                                      </span>
                                    </td>
                                    <td>
                                      <span className={`badge bg-${tx.status === 'completed' ? 'success' : tx.status === 'pending' ? 'warning' : 'danger'}`}>
                                        {tx.status}
                                      </span>
                                    </td>
                                    <td>
                                      <small>{new Date(tx.createdAt).toLocaleDateString()}</small>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Current Subscription */}
                    {selectedUser.profile?.subscription && (
                      <div className="row mb-4">
                        <div className="col-12">
                          <h6 className="fw-bold mb-3">Current Subscription</h6>
                          <div className="card border-0 bg-light">
                            <div className="card-body">
                              <div className="row">
                                <div className="col-md-6">
                                  <strong>Plan:</strong> {selectedUser.profile.subscription.planName}<br/>
                                  <strong>Status:</strong> <span className={`badge bg-${selectedUser.profile.subscription.isActive ? 'success' : 'danger'}`}>
                                    {selectedUser.profile.subscription.isActive ? 'Active' : 'Expired'}
                                  </span>
                                </div>
                                <div className="col-md-6">
                                  <strong>Start Date:</strong> {new Date(selectedUser.profile.subscription.startDate).toLocaleDateString()}<br/>
                                  <strong>Expiry Date:</strong> {new Date(selectedUser.profile.subscription.expiryDate).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowUserModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Assignment Modal */}
      {showSubscriptionModal && selectedUser && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Assign Plan to {selectedUser.email}</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowSubscriptionModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Select Plan</label>
                  <select 
                    className="form-select"
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                  >
                    <option value="">Choose a plan...</option>
                    {plans.filter(plan => plan.isActive).map(plan => (
                      <option key={plan._id} value={plan._id}>
                        {plan.name} - ₹{plan.price} ({plan.duration} days)
                      </option>
                    ))}
                  </select>
                </div>
                <div className="alert alert-info">
                  <small>
                    <strong>Note:</strong> This will assign the selected plan to the user and activate their subscription immediately.
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowSubscriptionModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => assignPlan(selectedUser.uid, selectedPlan)}
                  disabled={!selectedPlan}
                >
                  Assign Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
