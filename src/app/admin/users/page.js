'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaSearch, 
  FaEye, 
  FaCheck, 
  FaTimes, 
  FaUserCheck,
  FaUserTimes,
  FaSpinner,
  FaEdit,
  FaWallet,
  FaGift,
  FaHistory,
  FaUserFriends,
  FaCreditCard,
  FaArrowLeft,
  FaPlus
} from 'react-icons/fa';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [kycActionLoading, setKycActionLoading] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [plans, setPlans] = useState([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [walletEditMode, setWalletEditMode] = useState(false);
  const [walletData, setWalletData] = useState({
    walletBalance: 0,
    referralBalance: 0
  });
  const [transactionEditMode, setTransactionEditMode] = useState(false);
  const [referralEditMode, setReferralEditMode] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletAction, setWalletAction] = useState({
    type: 'add', // 'add' or 'deduct'
    amount: 0,
    wallet: 'wallet' // 'wallet' or 'referral'
  });
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [referralBonus, setReferralBonus] = useState(0);

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
        if (selectedUser && selectedUser.uid === uid) {
          fetchUserDetails(uid); // Refresh selected user details
        }
      }
    } catch (error) {
      console.error(`Error ${action}ing KYC:`, error);
    } finally {
      setKycActionLoading(null);
    }
  };

  const fetchUserDetails = async (uid) => {
    setLoadingAnalytics(true);
    try {
      // Fetch user details
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${uid}`, {
        credentials: 'include'
      });
      
      // Fetch wallet data
      const walletResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wallet/balance/${uid}`, {
        credentials: 'include'
      });
      
      // Fetch referral data
      const referralResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wallet/referral-history/${uid}`, {
        credentials: 'include'
      });
      
      // Fetch transactions
      const transactionResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/user-transactions/${uid}`, {
        credentials: 'include'
      });

      const [userData, walletData, referralData, transactionData] = await Promise.all([
        userResponse.json(),
        walletResponse.json(),
        referralResponse.json(),
        transactionResponse.json()
      ]);

      if (userData.success) {
        setSelectedUser(userData.user);
        setUserAnalytics({
          ...userData.user,
          wallet: walletData,
          referrals: referralData,
          transactions: transactionData
        });
        setWalletData({
          walletBalance: walletData.walletBalance || 0,
          referralBalance: walletData.referralBalance || 0
        });
        setActiveTab('details');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleWalletUpdate = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/user-wallet/${selectedUser.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          walletBalance: walletData.walletBalance,
          referralBalance: walletData.referralBalance,
          action: 'admin_update',
          reason: 'Admin wallet adjustment'
        })
      });

      if (response.ok) {
        alert('Wallet balance updated successfully');
        setWalletEditMode(false);
        fetchUserDetails(selectedUser.uid);
      }
    } catch (error) {
      console.error('Error updating wallet:', error);
      alert('Failed to update wallet balance');
    }
  };

  const handleWalletAction = async () => {
    if (!selectedUser || !walletAction.amount) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/user-wallet-action/${selectedUser.uid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action: walletAction.type,
          amount: parseFloat(walletAction.amount),
          wallet: walletAction.wallet,
          reason: `Admin ${walletAction.type} - ${walletAction.amount} to ${walletAction.wallet} balance`
        })
      });

      if (response.ok) {
        alert(`Wallet ${walletAction.type} successful`);
        setShowWalletModal(false);
        setWalletAction({ type: 'add', amount: 0, wallet: 'wallet' });
        fetchUserDetails(selectedUser.uid);
      }
    } catch (error) {
      console.error('Error performing wallet action:', error);
      alert('Failed to perform wallet action');
    }
  };

  const handleReferralComplete = async () => {
    if (!selectedReferral || !referralBonus) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/mark-referral-complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          referrerUid: selectedUser.uid,
          referredUid: selectedReferral.uid,
          bonusAmount: parseFloat(referralBonus)
        })
      });

      if (response.ok) {
        alert('Referral marked as complete and bonus added');
        setShowReferralModal(false);
        setSelectedReferral(null);
        setReferralBonus(0);
        fetchUserDetails(selectedUser.uid);
      }
    } catch (error) {
      console.error('Error marking referral complete:', error);
      alert('Failed to mark referral as complete');
    }
  };

  const handleTransactionStatusUpdate = async (transactionId, newStatus) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/update-transaction-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          transactionId,
          status: newStatus
        })
      });

      if (response.ok) {
        alert('Transaction status updated successfully');
        fetchUserDetails(selectedUser.uid);
      }
    } catch (error) {
      console.error('Error updating transaction status:', error);
      alert('Failed to update transaction status');
    }
  };

  const assignPlan = async () => {
    if (!selectedUser || !selectedPlan) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/assign-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          uid: selectedUser.uid,
          planId: selectedPlan
        })
      });

      if (response.ok) {
        alert('Plan assigned successfully');
        setShowSubscriptionModal(false);
        fetchUserDetails(selectedUser.uid);
      }
    } catch (error) {
      console.error('Error assigning plan:', error);
      alert('Failed to assign plan');
    }
  };

  const getKycStatusBadge = (status) => {
    const statusConfig = {
      'pending': { class: 'bg-warning', text: 'Pending' },
      'applied': { class: 'bg-info', text: 'Applied' },
      'approved': { class: 'bg-success', text: 'Approved' },
      'rejected': { class: 'bg-danger', text: 'Rejected' }
    };
    
    const config = statusConfig[status] || { class: 'bg-secondary', text: 'Unknown' };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const getTransactionStatusBadge = (status) => {
    const statusConfig = {
      'pending': { class: 'bg-warning', text: 'Pending' },
      'completed': { class: 'bg-success', text: 'Completed' },
      'failed': { class: 'bg-danger', text: 'Failed' },
      'cancelled': { class: 'bg-secondary', text: 'Cancelled' }
    };
    
    const config = statusConfig[status] || { class: 'bg-secondary', text: 'Unknown' };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
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
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-1">
                {activeTab === 'details' ? (
                  <button 
                    className="btn btn-link p-0 me-3"
                    onClick={() => setActiveTab('users')}
                  >
                    <FaArrowLeft />
                  </button>
                ) : null}
                User Management
              </h2>
              <p className="text-muted mb-0">
                {activeTab === 'details' 
                  ? `Managing: ${selectedUser?.email || 'User'}` 
                  : 'Manage users, KYC approvals, and wallet balances'
                }
              </p>
            </div>
            {activeTab === 'details' && (
              <div className="d-flex gap-2">
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => setShowSubscriptionModal(true)}
                >
                  <FaCreditCard className="me-2" />
                  Assign Plan
                </button>
                <button 
                  className="btn btn-outline-warning"
                  onClick={() => setWalletEditMode(!walletEditMode)}
                >
                  <FaWallet className="me-2" />
                  {walletEditMode ? 'Cancel Edit' : 'Edit Wallet'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Users List View */}
      {activeTab === 'users' && (
        <>
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
                      <th>Wallet Balance</th>
                      <th>Referrals</th>
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
                          <div>
                            <small className="text-muted">Wallet: ₹{user.profile?.wallet?.walletBalance || 0}</small><br/>
                            <small className="text-muted">Referral: ₹{user.profile?.wallet?.referralBalance || 0}</small>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-info">
                            {user.profile?.referral?.totalReferred || 0} referred
                          </span>
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
                              onClick={() => fetchUserDetails(user.uid)}
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
              <nav className="mt-3">
                <ul className="pagination justify-content-center">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                      <button 
                        className="page-link" 
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    </li>
                  ))}
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </>
      )}

      {/* User Details View */}
      {activeTab === 'details' && selectedUser && (
        <div className="row">
          {/* User Info Card */}
          <div className="col-lg-4 mb-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title">User Information</h5>
                <div className="mb-3">
                  <strong>Email:</strong><br/>
                  <span className="text-muted">{selectedUser.email}</span>
                </div>
                <div className="mb-3">
                  <strong>UID:</strong><br/>
                  <span className="text-muted">{selectedUser.uid}</span>
                </div>
                <div className="mb-3">
                  <strong>Joined:</strong><br/>
                  <span className="text-muted">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="mb-3">
                  <strong>Profile Status:</strong><br/>
                  {selectedUser.profile ? (
                    <span className="badge bg-success">Complete</span>
                  ) : (
                    <span className="badge bg-warning">Incomplete</span>
                  )}
                </div>
                <div className="mb-3">
                  <strong>KYC Status:</strong><br/>
                  {selectedUser.profile?.kyc?.status ? (
                    getKycStatusBadge(selectedUser.profile.kyc.status)
                  ) : (
                    <span className="badge bg-secondary">Not Started</span>
                  )}
                </div>
                
                {/* KYC Actions */}
                {selectedUser.profile?.kyc?.status === 'applied' && (
                  <div className="d-grid gap-2">
                    <button 
                      className="btn btn-success btn-sm"
                      onClick={() => handleKycAction(selectedUser.uid, 'approve')}
                      disabled={kycActionLoading === selectedUser.uid}
                    >
                      {kycActionLoading === selectedUser.uid ? (
                        <FaSpinner className="fa-spin me-2" />
                      ) : (
                        <FaCheck className="me-2" />
                      )}
                      Approve KYC
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleKycAction(selectedUser.uid, 'reject')}
                      disabled={kycActionLoading === selectedUser.uid}
                    >
                      {kycActionLoading === selectedUser.uid ? (
                        <FaSpinner className="fa-spin me-2" />
                      ) : (
                        <FaTimes className="me-2" />
                      )}
                      Reject KYC
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Wallet Management */}
          <div className="col-lg-8 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">
                    <FaWallet className="me-2" />
                    Wallet Management
                  </h5>
                  <div className="btn-group btn-group-sm">
                    <button 
                      className="btn btn-outline-success"
                      onClick={() => {
                        setWalletAction({ type: 'add', amount: 0, wallet: 'wallet' });
                        setShowWalletModal(true);
                      }}
                    >
                      <FaPlus className="me-1" />
                      Add
                    </button>
                    <button 
                      className="btn btn-outline-danger"
                      onClick={() => {
                        setWalletAction({ type: 'deduct', amount: 0, wallet: 'wallet' });
                        setShowWalletModal(true);
                      }}
                    >
                      <FaTimes className="me-1" />
                      Deduct
                    </button>
                    <button 
                      className="btn btn-outline-primary"
                      onClick={() => setWalletEditMode(!walletEditMode)}
                    >
                      <FaEdit className="me-1" />
                      {walletEditMode ? 'Cancel' : 'Edit'}
                    </button>
                  </div>
                </div>

                {walletEditMode ? (
                  <div className="row">
                    <div className="col-md-6">
                      <label className="form-label">Wallet Balance</label>
                      <div className="input-group">
                        <span className="input-group-text">₹</span>
                        <input
                          type="number"
                          className="form-control"
                          value={walletData.walletBalance}
                          onChange={(e) => setWalletData({
                            ...walletData,
                            walletBalance: parseFloat(e.target.value) || 0
                          })}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Referral Balance</label>
                      <div className="input-group">
                        <span className="input-group-text">₹</span>
                        <input
                          type="number"
                          className="form-control"
                          value={walletData.referralBalance}
                          onChange={(e) => setWalletData({
                            ...walletData,
                            referralBalance: parseFloat(e.target.value) || 0
                          })}
                        />
                      </div>
                    </div>
                    <div className="col-12 mt-3">
                      <button 
                        className="btn btn-success me-2"
                        onClick={handleWalletUpdate}
                      >
                        <FaCheck className="me-1" />
                        Update Wallet
                      </button>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => setWalletEditMode(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="row">
                    <div className="col-md-6">
                      <div className="card bg-primary bg-opacity-10">
                        <div className="card-body text-center">
                          <h4 className="text-primary">₹{userAnalytics?.wallet?.walletBalance || 0}</h4>
                          <small className="text-muted">Wallet Balance</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card bg-warning bg-opacity-10">
                        <div className="card-body text-center">
                          <h4 className="text-warning">₹{userAnalytics?.wallet?.referralBalance || 0}</h4>
                          <small className="text-muted">Referral Balance</small>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Referral Management */}
          <div className="col-12 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-3">
                  <FaUserFriends className="me-2" />
                  Referral Management
                </h5>
                
                <div className="row mb-4">
                  <div className="col-md-3">
                    <div className="card bg-info bg-opacity-10">
                      <div className="card-body text-center">
                        <h5 className="text-info">{userAnalytics?.referrals?.totalReferred || 0}</h5>
                        <small className="text-muted">Total Referred</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-success bg-opacity-10">
                      <div className="card-body text-center">
                        <h5 className="text-success">{userAnalytics?.referrals?.activeReferred || 0}</h5>
                        <small className="text-muted">Active Referrals</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-warning bg-opacity-10">
                      <div className="card-body text-center">
                        <h5 className="text-warning">{(userAnalytics?.referrals?.totalReferred || 0) - (userAnalytics?.referrals?.activeReferred || 0)}</h5>
                        <small className="text-muted">Pending Referrals</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="card bg-primary bg-opacity-10">
                      <div className="card-body text-center">
                        <h5 className="text-primary">₹{userAnalytics?.referrals?.totalReferralEarnings || 0}</h5>
                        <small className="text-muted">Total Earnings</small>
                      </div>
                    </div>
                  </div>
                </div>

                {userAnalytics?.referrals?.referredUsers && userAnalytics.referrals.referredUsers.length > 0 && (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Joined</th>
                          <th>Status</th>
                          <th>Deposits</th>
                          <th>Bonus Earned</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userAnalytics.referrals.referredUsers.map((ref, idx) => (
                          <tr key={idx}>
                            <td>{ref.name || 'N/A'}</td>
                            <td>{ref.email}</td>
                            <td>{new Date(ref.joinedAt).toLocaleDateString()}</td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <span className={`badge ${ref.hasDeposited ? 'bg-success' : 'bg-warning'}`}>
                                  {ref.hasDeposited ? 'Active' : 'Pending'}
                                </span>
                                {!ref.hasDeposited && (
                                  <button 
                                    className="btn btn-outline-success btn-sm"
                                    onClick={() => {
                                      setSelectedReferral(ref);
                                      setReferralBonus(0);
                                      setShowReferralModal(true);
                                    }}
                                  >
                                    <FaCheck className="me-1" />
                                    Mark Complete
                                  </button>
                                )}
                              </div>
                            </td>
                            <td>₹{ref.totalDeposits}</td>
                            <td>₹{ref.referralBonus}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Transaction Management */}
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-3">
                  <FaHistory className="me-2" />
                  Transaction Management
                </h5>
                
                {userAnalytics?.transactions?.transactions && userAnalytics.transactions.transactions.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th>Description</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userAnalytics.transactions.transactions.map((tx, idx) => (
                          <tr key={idx}>
                            <td>
                              <span className={`badge ${
                                tx.type === 'deposit' ? 'bg-success' :
                                tx.type === 'withdrawal' ? 'bg-danger' :
                                tx.type === 'referral_bonus' ? 'bg-info' :
                                'bg-secondary'
                              }`}>
                                {tx.type.replace('_', ' ').toUpperCase()}
                              </span>
                            </td>
                            <td>₹{tx.amount}</td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                {getTransactionStatusBadge(tx.status)}
                                {tx.status !== 'completed' && (
                                  <select 
                                    className="form-select form-select-sm"
                                    style={{ width: 'auto' }}
                                    onChange={(e) => handleTransactionStatusUpdate(tx._id, e.target.value)}
                                  >
                                    <option value="">Change Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="completed">Completed</option>
                                    <option value="failed">Failed</option>
                                    <option value="cancelled">Cancelled</option>
                                  </select>
                                )}
                              </div>
                            </td>
                            <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                            <td>{tx.description}</td>
                            <td>
                              <button 
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => setTransactionEditMode(!transactionEditMode)}
                              >
                                <FaEdit />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted">No transactions found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Assignment Modal */}
      {showSubscriptionModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Assign Plan to {selectedUser?.email}</h5>
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
                    <option value="">Choose a plan</option>
                    {plans.map(plan => (
                      <option key={plan._id} value={plan._id}>
                        {plan.name} - ₹{plan.price} ({plan.duration} days)
                      </option>
                    ))}
                  </select>
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
                  onClick={assignPlan}
                  disabled={!selectedPlan}
                >
                  Assign Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Action Modal */}
      {showWalletModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {walletAction.type === 'add' ? 'Add' : 'Deduct'} {walletAction.wallet} Balance
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowWalletModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Amount</label>
                  <div className="input-group">
                    <span className="input-group-text">₹</span>
                    <input
                      type="number"
                      className="form-control"
                      value={walletAction.amount}
                      onChange={(e) => setWalletAction({
                        ...walletAction,
                        amount: parseFloat(e.target.value) || 0
                      })}
                      placeholder="Enter amount"
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Wallet Type</label>
                  <select 
                    className="form-select"
                    value={walletAction.wallet}
                    onChange={(e) => setWalletAction({
                      ...walletAction,
                      wallet: e.target.value
                    })}
                  >
                    <option value="wallet">Wallet Balance</option>
                    <option value="referral">Referral Balance</option>
                  </select>
                </div>
                <div className="alert alert-info">
                  <strong>Current Balance:</strong><br/>
                  Wallet: ₹{userAnalytics?.wallet?.walletBalance || 0}<br/>
                  Referral: ₹{userAnalytics?.wallet?.referralBalance || 0}
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowWalletModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className={`btn ${walletAction.type === 'add' ? 'btn-success' : 'btn-danger'}`}
                  onClick={handleWalletAction}
                  disabled={!walletAction.amount}
                >
                  {walletAction.type === 'add' ? 'Add' : 'Deduct'} ₹{walletAction.amount}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mark Referral Complete Modal */}
      {showReferralModal && selectedReferral && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Mark Referral as Complete</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowReferralModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <strong>Referral Details:</strong><br/>
                  Name: {selectedReferral.name}<br/>
                  Email: {selectedReferral.email}<br/>
                  Joined: {new Date(selectedReferral.joinedAt).toLocaleDateString()}
                </div>
                <div className="mb-3">
                  <label className="form-label">Referral Bonus Amount</label>
                  <div className="input-group">
                    <span className="input-group-text">₹</span>
                    <input
                      type="number"
                      className="form-control"
                      value={referralBonus}
                      onChange={(e) => setReferralBonus(parseFloat(e.target.value) || 0)}
                      placeholder="Enter bonus amount"
                    />
                  </div>
                </div>
                <div className="alert alert-warning">
                  This will mark the referral as complete and add the bonus amount to the referrer&apos;s referral balance.
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowReferralModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-success"
                  onClick={handleReferralComplete}
                  disabled={!referralBonus}
                >
                  Mark Complete & Add Bonus
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