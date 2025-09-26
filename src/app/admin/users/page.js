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
  FaPlus,
  FaSync,
  FaReceipt,
  FaBell,
  FaTrophy
} from 'react-icons/fa';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedUser, setSelectedUser] = useState(null);
  const [kycActionLoading, setKycActionLoading] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
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
  
  // Challenge management state
  const [showChallengeManagementModal, setShowChallengeManagementModal] = useState(false);
  const [userChallenges, setUserChallenges] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [showChallengeAssignModal, setShowChallengeAssignModal] = useState(false);
  const [challengeAssignData, setChallengeAssignData] = useState({
    challengeId: '',
    accountSize: '',
    platform: '',
    adminNote: ''
  });
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [showChallengeEditModal, setShowChallengeEditModal] = useState(false);
  const [challengeEditData, setChallengeEditData] = useState({
    status: 'active',
    adminNote: ''
  });
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [userTransactions, setUserTransactions] = useState([]);
  const [upiDeposits, setUpiDeposits] = useState([]);
  const [transactionSummary, setTransactionSummary] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalBonuses: 0,
    totalPurchases: 0
  });
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationData, setNotificationData] = useState({
    title: '',
    message: '',
    priority: 'medium'
  });

  const refreshReferralCounts = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/recalculate-referral-counts`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        console.log('Referral counts refreshed');
      }
    } catch (error) {
      console.error('Error refreshing referral counts:', error);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', String(currentPage));
      params.append('limit', String(pageSize));
      
      // Only add search if there's a search term
      if (searchTerm && searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users?${params}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        // Try to infer total pages from common response shapes
        const pages = data.pagination?.pages || data.totalPages || 1;
        setTotalPages(pages);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch users:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, currentPage, pageSize]);


  const fetchChallenges = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/challenges`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setChallenges(data.challenges || []);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchChallenges();
    // Refresh referral counts on page load
    refreshReferralCounts();
  }, [fetchUsers, fetchChallenges, refreshReferralCounts]);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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

      // Plans removed

      // Fetch user challenges
      const challengesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${uid}/challenges`, {
        credentials: 'include'
      });

      const [userData, walletData, referralData, transactionData, challengesData] = await Promise.all([
        userResponse.json(),
        walletResponse.json(),
        referralResponse.json(),
        transactionResponse.json(),
        challengesResponse.json()
      ]);

      if (userData.success) {
        setSelectedUser(userData.user);
        setUserChallenges(challengesData.challenges || []);
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

        // Load UPI deposits for this user
        await fetchUpiDeposits(uid);
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

  // All legacy plan functions removed


  const fetchUserTransactions = async (uid) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions/${uid}?limit=50`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUserTransactions(data.transactions || []);
        setTransactionSummary(data.summary || {
          totalDeposits: 0,
          totalWithdrawals: 0,
          totalBonuses: 0,
          totalPurchases: 0
        });
      }
    } catch (error) {
      console.error('Error fetching user transactions:', error);
    }
  };

  const createCustomNotification = async () => {
    if (!selectedUser || !notificationData.title || !notificationData.message) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/notifications/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: selectedUser._id,
          title: notificationData.title,
          message: notificationData.message,
          priority: notificationData.priority
        })
      });

      if (response.ok) {
        alert('Custom notification sent successfully!');
        setShowNotificationModal(false);
        setNotificationData({ title: '', message: '', priority: 'medium' });
      } else {
        const error = await response.json();
        alert(`Failed to send notification: ${error.message}`);
      }
    } catch (error) {
      console.error('Error creating custom notification:', error);
      alert('Failed to send notification');
    }
  };






  // Challenge management functions
  const fetchUserChallenges = async (uid) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${uid}/challenges`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserChallenges(data.challenges || []);
      }
    } catch (error) {
      console.error('Error fetching user challenges:', error);
    }
  };

  const assignChallenge = async () => {
    if (!selectedUser || !challengeAssignData.challengeId || !challengeAssignData.accountSize || !challengeAssignData.platform) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/challenges/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: selectedUser._id,
          challengeId: challengeAssignData.challengeId,
          accountSize: parseInt(challengeAssignData.accountSize),
          platform: challengeAssignData.platform,
          adminNote: challengeAssignData.adminNote
        })
      });

      if (response.ok) {
        alert('Challenge assigned successfully');
        setShowChallengeAssignModal(false);
        setChallengeAssignData({
          challengeId: '',
          accountSize: '',
          platform: '',
          adminNote: ''
        });
        fetchUserChallenges(selectedUser.uid);
        fetchUserDetails(selectedUser.uid);
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to assign challenge');
      }
    } catch (error) {
      console.error('Error assigning challenge:', error);
      alert('Failed to assign challenge');
    }
  };

  const openChallengeEditModal = (challenge) => {
    setEditingChallenge(challenge);
    setChallengeEditData({
      status: challenge.status,
      adminNote: challenge.adminNote || ''
    });
    setShowChallengeEditModal(true);
  };

  const saveChallengeEdit = async () => {
    if (!selectedUser || !editingChallenge) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/challenges/${selectedUser._id}/${editingChallenge._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: challengeEditData.status,
          adminNote: challengeEditData.adminNote
        })
      });

      if (response.ok) {
        alert('Challenge status updated successfully');
        setShowChallengeEditModal(false);
        setEditingChallenge(null);
        fetchUserChallenges(selectedUser.uid);
        fetchUserDetails(selectedUser.uid);
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to update challenge status');
      }
    } catch (error) {
      console.error('Error updating challenge status:', error);
      alert('Failed to update challenge status');
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

  const fetchUpiDeposits = async (uid) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wallet/admin/upi-deposits/${uid}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setUpiDeposits(data.deposits || []);
      }
    } catch (e) {
      console.error('Error loading UPI deposits:', e);
    }
  };

  const processUpiDeposit = async (uid, depositId, action) => {
    if (!['complete', 'reject'].includes(action)) return;
    if (action === 'complete') {
      const ok = confirm('Approve this UPI deposit and credit amount to user wallet?');
      if (!ok) return;
    }
    let adminNote = '';
    if (action === 'reject') {
      adminNote = prompt('Enter rejection note (optional):') || '';
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wallet/admin/upi-deposits/${uid}/${depositId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action, adminNote })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(action === 'complete' ? 'Deposit approved and wallet credited' : 'Deposit rejected');
        await fetchUpiDeposits(uid);
        await fetchUserDetails(uid);
      } else {
        alert(data.message || 'Failed to update UPI deposit');
      }
    } catch (e) {
      console.error('Process UPI deposit error:', e);
      alert('Failed to update UPI deposit');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ 
        minHeight: '50vh',
        background: 'linear-gradient(135deg, #110A28 0%, #002260 100%)',
        color: 'white'
      }}>
        <div className="spinner-border" role="status" style={{ color: '#3b82f6' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4" style={{ color: 'white' }}>
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-1 text-white">
                {activeTab === 'details' ? (
                  <button 
                    className="btn btn-link p-0 me-3"
                    onClick={() => setActiveTab('users')}
                    style={{ color: '#e2e8f0' }}
                  >
                    <FaArrowLeft />
                  </button>
                ) : null}
                User Management
              </h2>
              <p className="text-white-50 mb-0">
                {activeTab === 'details' 
                  ? `Managing: ${selectedUser?.email || 'User'}` 
                  : 'Manage users, KYC approvals, and wallet balances'
                }
              </p>
            </div>
            {activeTab === 'details' && (
              <div className="d-flex gap-2">
                {/* Plan actions removed */}
                <button 
                  className="btn"
                  onClick={() => setShowChallengeManagementModal(true)}
                  style={{
                    background: 'rgba(251, 191, 36, 0.2)',
                    border: '1px solid rgba(251, 191, 36, 0.5)',
                    color: '#fbbf24',
                    backdropFilter: 'blur(20px)',
                    boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
                  }}
                >
                  <FaTrophy className="me-2" />
                  Manage Challenges
                </button>
                <button 
                  className="btn"
                  onClick={() => {
                    setShowTransactionsModal(true);
                    fetchUserTransactions(selectedUser.uid);
                  }}
                  style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(59, 130, 246, 0.5)',
                    color: '#3b82f6',
                    backdropFilter: 'blur(20px)',
                    boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
                  }}
                >
                  <FaReceipt className="me-2" />
                  View Transactions
                </button>
                <button 
                  className="btn"
                  onClick={() => setShowNotificationModal(true)}
                  style={{
                    background: 'rgba(34, 197, 94, 0.2)',
                    border: '1px solid rgba(34, 197, 94, 0.5)',
                    color: '#22c55e',
                    backdropFilter: 'blur(20px)',
                    boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
                  }}
                >
                  <FaBell className="me-2" />
                  Send Notification
                </button>
                <button 
                  className="btn"
                  onClick={() => setWalletEditMode(!walletEditMode)}
                  style={{
                    background: 'rgba(251, 191, 36, 0.2)',
                    border: '1px solid rgba(251, 191, 36, 0.5)',
                    color: '#fbbf24',
                    backdropFilter: 'blur(20px)',
                    boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
                  }}
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
          {/* Search and Page Size */}
          <div className="card border-0 mb-4" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-body" style={{ color: '#e2e8f0' }}>
              <div className="row g-3 align-items-center">
                <div className="col-md-8">
                  <div className="input-group">
                    <span className="input-group-text" style={{
                      background: 'rgba(60, 58, 58, 0.03)',
                      border: '1px solid rgba(124, 124, 124, 0.39)',
                      color: '#e2e8f0'
                    }}>
                      <FaSearch />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search users by email or name"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        color: '#e2e8f0'
                      }}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="d-flex align-items-center justify-content-md-end gap-2">
                    <label className="form-label mb-0 text-white-50">Rows:</label>
                    <select
                      className="form-select"
                      style={{ 
                        maxWidth: '120px',
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        color: '#e2e8f0'
                      }}
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(parseInt(e.target.value));
                        setCurrentPage(1);
                      }}
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="card border-0" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-body" style={{ color: '#e2e8f0' }}>
              <div className="table-responsive">
                <table className="table table-hover" style={{
                  background: 'rgba(60, 58, 58, 0.03)',
                  border: '1px solid rgba(124, 124, 124, 0.39)'
                }}>
                  <thead style={{
                    background: 'rgba(30, 30, 30, 0.8)',
                    borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
                  }}>
                    <tr>
                      <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>User</th>
                      <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Profile Status</th>
                      <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>KYC Status</th>
                      <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Wallet Balance</th>
                      <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Referrals</th>
                      <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Joined</th>
                      <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody style={{ background: 'transparent' }}>
                    {users.map((user) => (
                      <tr key={user._id} style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
                      }}>
                        <td className="text-white" style={{ background: 'transparent' }}>
                          <div className="d-flex align-items-center">
                            <div className="rounded-circle d-flex align-items-center justify-content-center me-2" style={{ 
                              width: '32px', 
                              height: '32px',
                              background: 'rgba(59, 130, 246, 0.2)',
                              border: '1px solid rgba(59, 130, 246, 0.5)'
                            }}>
                              <span className="fw-bold" style={{ color: '#3b82f6' }}>{user.email?.charAt(0).toUpperCase()}</span>
                            </div>
                            <div>
                              <strong className="text-white">{user.email}</strong>
                              <br />
                              <small className="text-white-50">UID: {user.uid}</small>
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
                          <div>
                            <span className="badge bg-primary me-1">
                              Total: {user.profile?.referral?.totalReferrals || 0}
                            </span>
                            <span className="badge bg-success me-1">
                              Complete: {user.profile?.referral?.completedReferrals || 0}
                            </span>
                            <span className="badge bg-warning">
                              Pending: {user.profile?.referral?.pendingReferrals || 0}
                            </span>
                            {user.profile?.referral?.totalEarnings > 0 && (
                              <div className="mt-1">
                                <small className="text-success">
                                  Earned: ₹{user.profile.referral.totalEarnings}
                                </small>
                              </div>
                            )}
                          </div>
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

              {/* User Count, Pagination and Actions */}
              <div className="mt-3 d-flex justify-content-between align-items-center">
                <span className="text-white-50">
                  Showing {users.length} users (page {currentPage} of {totalPages})
                </span>
                <div className="d-flex align-items-center gap-2">
                  <nav aria-label="Users pagination">
                    <ul className="pagination mb-0">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          style={{
                            background: 'rgba(60, 58, 58, 0.03)',
                            border: '1px solid rgba(124, 124, 124, 0.39)',
                            color: '#e2e8f0'
                          }}
                        >Prev</button>
                      </li>
                      {Array.from({ length: totalPages }).slice(0, 7).map((_, idx) => {
                        const pageNum = idx + 1;
                        return (
                          <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                            <button 
                              className="page-link" 
                              onClick={() => setCurrentPage(pageNum)}
                              style={{
                                background: currentPage === pageNum ? 'rgba(59, 130, 246, 0.2)' : 'rgba(60, 58, 58, 0.03)',
                                border: '1px solid rgba(124, 124, 124, 0.39)',
                                color: currentPage === pageNum ? '#3b82f6' : '#e2e8f0'
                              }}
                            >{pageNum}</button>
                          </li>
                        );
                      })}
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          style={{
                            background: 'rgba(60, 58, 58, 0.03)',
                            border: '1px solid rgba(124, 124, 124, 0.39)',
                            color: '#e2e8f0'
                          }}
                        >Next</button>
                      </li>
                    </ul>
                  </nav>
                  <button 
                    className="btn btn-sm"
                    onClick={() => {
                      refreshReferralCounts();
                      fetchUsers();
                    }}
                    style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid rgba(59, 130, 246, 0.5)',
                      color: '#3b82f6',
                      backdropFilter: 'blur(20px)',
                      boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
                    }}
                  >
                    <FaSync className="me-1" />
                    Refresh Referral Counts
                  </button>
                </div>
              </div>
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
               <div className="d-flex justify-content-between align-items-center">
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
                      }}Wallet Balance
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
                      <div className="card  bg-opacity-10">
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

          {/* KYC Details */}
          <div className="col-12 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-3">KYC Details</h5>
                {selectedUser.profile?.kyc ? (
                  <div className="row g-3">
                    <div className="col-md-3">
                      <div><strong>Status:</strong></div>
                      <div className="mt-1">
                        {getKycStatusBadge(selectedUser.profile.kyc.status || 'not_applied')}
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div><strong>PAN Number:</strong></div>
                      <div className="text-muted mt-1">{selectedUser.profile.kyc.panCardNumber || 'N/A'}</div>
                    </div>
                    <div className="col-md-3">
                      <div><strong>PAN Holder:</strong></div>
                      <div className="text-muted mt-1">{selectedUser.profile.kyc.panHolderName || 'N/A'}</div>
                    </div>
                    <div className="col-md-3">
                      <div><strong>Applied At:</strong></div>
                      <div className="text-muted mt-1">{selectedUser.profile.kyc.appliedAt ? new Date(selectedUser.profile.kyc.appliedAt).toLocaleString() : 'N/A'}</div>
                    </div>
                    {(selectedUser.profile.kyc.panCardImage || selectedUser.profile.kyc.profilePhoto) && (
                      <div className="col-12">
                        <div className="row g-3">
                          {selectedUser.profile.kyc.panCardImage && (
                            <div className="col-md-6">
                              <div className="small text-muted mb-1">PAN Card Image</div>
                              <img
                                src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${selectedUser.profile.kyc.panCardImage}`}
                                alt="PAN"
                                className="img-fluid rounded border"
                              />
                            </div>
                          )}
                          {selectedUser.profile.kyc.profilePhoto && (
                            <div className="col-md-6">
                              <div className="small text-muted mb-1">Profile Photo</div>
                              <img
                                src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${selectedUser.profile.kyc.profilePhoto}`}
                                alt="Profile"
                                className="img-fluid rounded border"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {selectedUser.profile.kyc.rejectionNote && (
                      <div className="col-12">
                        <div className="alert alert-warning mb-0"><strong>Rejection Note:</strong> {selectedUser.profile.kyc.rejectionNote}</div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-muted">No KYC data available</div>
                )}
              </div>
            </div>
          </div>

          {/* Challenges Management */}
          <div className="col-12 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">
                    <FaTrophy className="me-2" />
                    Challenges Management
                  </h5>
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-outline-warning"
                      onClick={() => setShowChallengeManagementModal(true)}
                    >
                      <FaEdit className="me-1" />
                      Manage All Challenges
                    </button>
                  </div>
                </div>
                
                {userChallenges && userChallenges.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Challenge Name</th>
                          <th>Type</th>
                          <th>Account Size</th>
                          <th>Platform</th>
                          <th>Price</th>
                          <th>Status</th>
                          <th>Assigned By</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userChallenges.map((challenge, idx) => (
                          <tr key={idx}>
                            <td>
                              <strong>{challenge.name}</strong>
                            </td>
                            <td>
                              <span className="badge bg-info">{challenge.type}</span>
                            </td>
                            <td>${challenge.accountSize.toLocaleString()}</td>
                            <td>{challenge.platform}</td>
                            <td>₹{challenge.price}</td>
                            <td>
                              <span className={`badge ${
                                challenge.status === 'active' ? 'bg-success' :
                                challenge.status === 'passed' ? 'bg-primary' :
                                challenge.status === 'failed' ? 'bg-danger' :
                                challenge.status === 'expired' ? 'bg-secondary' :
                                'bg-warning'
                              }`}>
                                {challenge.status}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${
                                challenge.assignedBy === 'admin' ? 'bg-primary' : 'bg-info'
                              }`}>
                                {challenge.assignedBy}
                              </span>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button 
                                  className="btn btn-outline-primary"
                                  onClick={() => openChallengeEditModal(challenge)}
                                  title="Edit Challenge"
                                >
                                  <FaEdit />
                                </button>
                                <select 
                                  className="form-select form-select-sm"
                                  style={{ width: 'auto' }}
                                  value={challenge.status}
                                  onChange={(e) => {
                                    const newStatus = e.target.value;
                                    const adminNote = prompt('Enter admin note (optional):');
                                    if (newStatus !== challenge.status) {
                                      // Update challenge status
                                      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/challenges/${selectedUser._id}/${challenge._id}/status`, {
                                        method: 'PUT',
                                        headers: {
                                          'Content-Type': 'application/json',
                                        },
                                        credentials: 'include',
                                        body: JSON.stringify({
                                          status: newStatus,
                                          adminNote: adminNote || ''
                                        })
                                      }).then(response => {
                                        if (response.ok) {
                                          fetchUserChallenges(selectedUser.uid);
                                          fetchUserDetails(selectedUser.uid);
                                        }
                                      });
                                    }
                                  }}
                                >
                                  <option value="active">Active</option>
                                  <option value="passed">Passed</option>
                                  <option value="failed">Failed</option>
                                  <option value="expired">Expired</option>
                                  <option value="inactive">Inactive</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted">No challenges assigned to this user</p>
                    <button 
                      className="btn btn-warning"
                      onClick={() => setShowChallengeManagementModal(true)}
                    >
                      <FaPlus className="me-2" />
                      Assign First Challenge
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* UPI Deposit Requests */}
          <div className="col-12 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-qr-code me-2"></i>
                    UPI Deposit Requests
                  </h5>
                </div>
                {upiDeposits && upiDeposits.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Submitted</th>
                          <th>Txn ID</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Processed</th>
                          <th>Note</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {upiDeposits.map(d => (
                          <tr key={d._id}>
                            <td>{new Date(d.submittedAt).toLocaleString()}</td>
                            <td><code>{d.upiTransactionId}</code></td>
                            <td>₹{Number(d.amount).toFixed(2)}</td>
                            <td>
                              <span className={`badge ${d.status === 'pending' ? 'bg-warning' : d.status === 'completed' ? 'bg-success' : 'bg-danger'}`}>{d.status}</span>
                            </td>
                            <td>{d.processedAt ? new Date(d.processedAt).toLocaleString() : '-'}</td>
                            <td className="text-truncate" style={{ maxWidth: '200px' }}>{d.adminNote || '-'}</td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-outline-success"
                                  disabled={d.status !== 'pending'}
                                  onClick={() => processUpiDeposit(selectedUser.uid, d._id, 'complete')}
                                  title="Approve & Credit"
                                >
                                  Approve
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  disabled={d.status !== 'pending'}
                                  onClick={() => processUpiDeposit(selectedUser.uid, d._id, 'reject')}
                                  title="Reject"
                                >
                                  Reject
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted">No UPI deposit requests</div>
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
                    <div className="card  bg-opacity-10">
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
                            <td>
                              <div>
                                <div>{tx.description}</div>
                                {tx.metadata?.referredUserEmail && (
                                  <small className="text-muted">From: {tx.metadata.referredUserEmail}</small>
                                )}
                              </div>
                            </td>
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

      {/* Plan assignment modal removed */}

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

    

    

      {/* Transactions Modal */}
      {showTransactionsModal && selectedUser && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Transaction History - {selectedUser.email}</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowTransactionsModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {/* Transaction Summary */}
                <div className="row mb-4">
                  <div className="col-md-3 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body text-center">
                        <div className="text-success mb-2">
                          <i className="bi bi-arrow-down-circle fs-1"></i>
                        </div>
                        <h4 className="text-success">₹{transactionSummary.totalDeposits.toFixed(2)}</h4>
                        <small className="text-muted">Total Deposits</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body text-center">
                        <div className="text-danger mb-2">
                          <i className="bi bi-arrow-up-circle fs-1"></i>
                        </div>
                        <h4 className="text-danger">₹{transactionSummary.totalWithdrawals.toFixed(2)}</h4>
                        <small className="text-muted">Total Withdrawals</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body text-center">
                        <div className="text-warning mb-2">
                          <i className="bi bi-gift fs-1"></i>
                        </div>
                        <h4 className="text-warning">₹{transactionSummary.totalBonuses.toFixed(2)}</h4>
                        <small className="text-muted">Total Bonuses</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body text-center">
                        <div className="text-info mb-2">
                          <i className="bi bi-bag fs-1"></i>
                        </div>
                        <h4 className="text-info">₹{transactionSummary.totalPurchases.toFixed(2)}</h4>
                        <small className="text-muted">Total Purchases</small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Transactions Table */}
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Description</th>
                        <th>Source</th>
                        <th>Status</th>
                        <th>Balance After</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userTransactions.map((transaction) => (
                        <tr key={transaction._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <span className="me-2">
                                {transaction.type === 'deposit' && '💰'}
                                {transaction.type === 'withdrawal' && '💸'}
                                {transaction.type === 'withdrawal_rejected' && '↩️'}
                                
                                {transaction.type === 'referral_bonus' && '🎁'}
                                {transaction.type === 'admin_credit' && '➕'}
                                {transaction.type === 'admin_debit' && '➖'}
                                {transaction.type === 'profit' && '📈'}
                                {transaction.type === 'loss' && '📉'}
                                {transaction.type === 'refund' && '🔄'}
                                {transaction.type === 'fee' && '💳'}
                              </span>
                              <span className="text-capitalize">{transaction.type.replace('_', ' ')}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`fw-bold ${
                              ['deposit', 'referral_bonus', 'admin_credit', 'profit', 'withdrawal_rejected', 'refund'].includes(transaction.type) 
                                ? 'text-success' 
                                : 'text-danger'
                            }`}>
                              {['deposit', 'referral_bonus', 'admin_credit', 'profit', 'withdrawal_rejected', 'refund'].includes(transaction.type) ? '+' : '-'}₹{Math.abs(transaction.amount).toFixed(2)}
                            </span>
                          </td>
                          <td>
                            <div>
                              <div>{transaction.description}</div>
                              {transaction.metadata?.referredUserEmail && (
                                <small className="text-muted">From: {transaction.metadata.referredUserEmail}</small>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${
                              
                              transaction.source === 'razorpay' ? 'bg-primary' :
                              transaction.source === 'wallet' ? 'bg-info' :
                              transaction.source === 'referral' ? 'bg-success' :
                              transaction.source === 'admin' ? 'bg-warning' :
                              transaction.source === 'trading' ? 'bg-purple' :
                              
                              transaction.source === 'withdrawal' ? 'bg-secondary' :
                              transaction.source === 'system' ? 'bg-dark' : 'bg-secondary'
                            }`}>
                              {transaction.source}
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${
                              transaction.status === 'pending' ? 'bg-warning' :
                              transaction.status === 'completed' ? 'bg-success' :
                              transaction.status === 'failed' ? 'bg-danger' :
                              transaction.status === 'cancelled' ? 'bg-secondary' :
                              transaction.status === 'rejected' ? 'bg-danger' : 'bg-secondary'
                            }`}>
                              {transaction.status}
                            </span>
                          </td>
                          <td>₹{transaction.balanceAfter?.toFixed(2) || 'N/A'}</td>
                          <td>
                            <div>
                              <div>{new Date(transaction.createdAt).toLocaleDateString()}</div>
                              <small className="text-muted">
                                {new Date(transaction.createdAt).toLocaleTimeString()}
                              </small>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {userTransactions.length === 0 && (
                  <div className="text-center py-5">
                    <i className="bi bi-receipt fs-1 text-muted mb-3"></i>
                    <h5 className="text-muted">No transactions found</h5>
                    <p className="text-muted">This user has no transaction history</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowTransactionsModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Notification Modal */}
      {showNotificationModal && selectedUser && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Send Custom Notification to {selectedUser.email}</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowNotificationModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={notificationData.title}
                    onChange={(e) => setNotificationData({...notificationData, title: e.target.value})}
                    placeholder="Enter notification title"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Message</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={notificationData.message}
                    onChange={(e) => setNotificationData({...notificationData, message: e.target.value})}
                    placeholder="Enter notification message"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Priority</label>
                  <select
                    className="form-select"
                    value={notificationData.priority}
                    onChange={(e) => setNotificationData({...notificationData, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowNotificationModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={createCustomNotification}
                >
                  Send Notification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Challenge Management Modal */}
      {showChallengeManagementModal && selectedUser && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Manage Challenges for {selectedUser.email}</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowChallengeManagementModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6>Current Challenges ({userChallenges.length})</h6>
                  <button 
                    className="btn btn-warning btn-sm"
                    onClick={() => setShowChallengeAssignModal(true)}
                  >
                    <FaPlus className="me-1" />
                    Assign New Challenge
                  </button>
                </div>
                
                {userChallenges && userChallenges.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Challenge Name</th>
                          <th>Type</th>
                          <th>Account Size</th>
                          <th>Platform</th>
                          <th>Price</th>
                          <th>Status</th>
                          <th>Assigned By</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userChallenges.map((challenge, idx) => (
                          <tr key={idx}>
                            <td><strong>{challenge.name}</strong></td>
                            <td>
                              <span className="badge bg-info">{challenge.type}</span>
                            </td>
                            <td>${challenge.accountSize.toLocaleString()}</td>
                            <td>{challenge.platform}</td>
                            <td>₹{challenge.price}</td>
                            <td>
                              <span className={`badge ${
                                challenge.status === 'active' ? 'bg-success' :
                                challenge.status === 'passed' ? 'bg-primary' :
                                challenge.status === 'failed' ? 'bg-danger' :
                                challenge.status === 'expired' ? 'bg-secondary' :
                                'bg-warning'
                              }`}>
                                {challenge.status}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${
                                challenge.assignedBy === 'admin' ? 'bg-primary' : 'bg-info'
                              }`}>
                                {challenge.assignedBy}
                              </span>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button 
                                  className="btn btn-outline-primary"
                                  onClick={() => openChallengeEditModal(challenge)}
                                  title="Edit Challenge"
                                >
                                  <FaEdit />
                                </button>
                                <select 
                                  className="form-select form-select-sm"
                                  style={{ width: 'auto' }}
                                  value={challenge.status}
                                  onChange={(e) => {
                                    const newStatus = e.target.value;
                                    const adminNote = prompt('Enter admin note (optional):');
                                    if (newStatus !== challenge.status) {
                                      // Update challenge status
                                      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/challenges/${selectedUser._id}/${challenge._id}/status`, {
                                        method: 'PUT',
                                        headers: {
                                          'Content-Type': 'application/json',
                                        },
                                        credentials: 'include',
                                        body: JSON.stringify({
                                          status: newStatus,
                                          adminNote: adminNote || ''
                                        })
                                      }).then(response => {
                                        if (response.ok) {
                                          fetchUserChallenges(selectedUser.uid);
                                          fetchUserDetails(selectedUser.uid);
                                        }
                                      });
                                    }
                                  }}
                                >
                                  <option value="active">Active</option>
                                  <option value="passed">Passed</option>
                                  <option value="failed">Failed</option>
                                  <option value="expired">Expired</option>
                                  <option value="inactive">Inactive</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted">No challenges assigned to this user</p>
                    <button 
                      className="btn btn-warning"
                      onClick={() => setShowChallengeAssignModal(true)}
                    >
                      <FaPlus className="me-2" />
                      Assign First Challenge
                    </button>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowChallengeManagementModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Challenge Assign Modal */}
      {showChallengeAssignModal && selectedUser && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Assign Challenge to {selectedUser.email}</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowChallengeAssignModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Select Challenge</label>
                  <select
                    className="form-select"
                    value={challengeAssignData.challengeId}
                    onChange={(e) => setChallengeAssignData({
                      ...challengeAssignData,
                      challengeId: e.target.value
                    })}
                  >
                    <option value="">Choose a challenge...</option>
                    {challenges.filter(c => c.isActive).map(challenge => (
                      <option key={challenge._id} value={challenge._id}>
                        {challenge.name} - {challenge.type}
                      </option>
                    ))}
                  </select>
                </div>

                {challengeAssignData.challengeId && (
                  <>
                    <div className="mb-3">
                      <label className="form-label">Account Size</label>
                      <select
                        className="form-select"
                        value={challengeAssignData.accountSize}
                        onChange={(e) => setChallengeAssignData({
                          ...challengeAssignData,
                          accountSize: e.target.value
                        })}
                      >
                        <option value="">Select account size...</option>
                        {challenges.find(c => c._id === challengeAssignData.challengeId)?.accountSizes.map(size => (
                          <option key={size} value={size}>
                            ${size.toLocaleString()}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Platform</label>
                      <select
                        className="form-select"
                        value={challengeAssignData.platform}
                        onChange={(e) => setChallengeAssignData({
                          ...challengeAssignData,
                          platform: e.target.value
                        })}
                      >
                        <option value="">Select platform...</option>
                        {challenges.find(c => c._id === challengeAssignData.challengeId)?.platforms.map(platform => (
                          <option key={platform} value={platform}>
                            {platform}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Admin Note (Optional)</label>
                      <textarea
                        className="form-control"
                        value={challengeAssignData.adminNote}
                        onChange={(e) => setChallengeAssignData({
                          ...challengeAssignData,
                          adminNote: e.target.value
                        })}
                        rows="3"
                        placeholder="Enter any notes about this challenge assignment..."
                      />
                    </div>

                    {challengeAssignData.challengeId && challengeAssignData.accountSize && (
                      <div className="alert alert-info">
                        <strong>Challenge Details:</strong><br/>
                        Price: ₹{challenges.find(c => c._id === challengeAssignData.challengeId)?.pricesByAccountSize.get(challengeAssignData.accountSize) || 'N/A'}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowChallengeAssignModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-warning"
                  onClick={assignChallenge}
                  disabled={!challengeAssignData.challengeId || !challengeAssignData.accountSize || !challengeAssignData.platform}
                >
                  Assign Challenge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Challenge Edit Modal */}
      {showChallengeEditModal && editingChallenge && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Challenge: {editingChallenge.name}</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowChallengeEditModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select 
                    className="form-select"
                    value={challengeEditData.status}
                    onChange={(e) => setChallengeEditData({
                      ...challengeEditData,
                      status: e.target.value
                    })}
                  >
                    <option value="active">Active</option>
                    <option value="passed">Passed</option>
                    <option value="failed">Failed</option>
                    <option value="expired">Expired</option>
                    <option value="inactive">Inactive</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Admin Note</label>
                  <textarea
                    className="form-control"
                    value={challengeEditData.adminNote}
                    onChange={(e) => setChallengeEditData({
                      ...challengeEditData,
                      adminNote: e.target.value
                    })}
                    rows="3"
                    placeholder="Enter admin note..."
                  />
                </div>
                <div className="alert alert-info">
                  <strong>Current Challenge Details:</strong><br/>
                  Name: {editingChallenge.name}<br/>
                  Type: {editingChallenge.type}<br/>
                  Account Size: ${editingChallenge.accountSize.toLocaleString()}<br/>
                  Platform: {editingChallenge.platform}
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowChallengeEditModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-warning"
                  onClick={saveChallengeEdit}
                >
                  Save Changes
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