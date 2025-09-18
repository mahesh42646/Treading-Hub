'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../user/auth/firebase';
import { getUserDisplayInfo } from '../utils/userDisplay';
import { userApi } from '../../services/api';

const Dashboard = () => {
  const { user, profile, logout, refreshProfile, checkEmailVerification } = useAuth();
  const [resendingEmail, setResendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);
  const [referralData, setReferralData] = useState({
    referralCode: '',
    totalReferrals: 0,
    totalEarnings: 0
  });
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const router = useRouter();
  
  const displayInfo = getUserDisplayInfo(user, profile);

  // Fetch referral data
  useEffect(() => {
    const fetchReferralData = async () => {
      if (!user?.uid) return;
      
      console.log('🔍 User object:', user);
      console.log('🔍 Profile object:', profile);
      
      try {
        const data = await userApi.getReferralStats(user.uid);
        console.log('🔍 Referral stats data:', data);
        setReferralData({
          referralCode: data.stats?.referralCode || data.stats?.myReferralCode || '',
          totalReferrals: data.stats?.totalReferrals || 0,
          totalEarnings: data.stats?.totalEarnings || 0
        });
      } catch (error) {
        console.error('Error fetching referral data:', error);
      }
    };

    fetchReferralData();
  }, [user, profile]);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.uid) return;
      
      try {
        setNotificationsLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${user.uid}?limit=10`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          // Show all notifications (both read and unread) for dashboard
          setNotifications(data.notifications || []);
        } else {
          console.error('Failed to fetch notifications:', response.status);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setNotificationsLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Check if user has profile data based on completion percentage
  const completionPercentage = profile?.status?.completionPercentage || 0;
  const hasProfile = completionPercentage >= 75;
  const hasCompleteProfile = completionPercentage >= 100;

  // Handle resend email verification
  const handleResendEmail = async () => {
    if (!user) return;
    
    setResendingEmail(true);
    try {
      await sendEmailVerification(user);
      setEmailSent(true);
      
      // Check email verification status after sending
      setTimeout(async () => {
        await checkEmailVerification();
      }, 2000);
      
    } catch (error) {
      console.error('Error sending verification email:', error);
      alert('Failed to send verification email. Please try again.');
    } finally {
      setResendingEmail(false);
    }
  };

  // Helper function to get KYC status display
  const getKYCStatusDisplay = (kycStatus) => {
    switch (kycStatus) {
      case 'not_applied':
        return { text: 'Not Applied', badge: 'bg-warning', message: 'KYC verification not applied yet' };
      case 'pending':
        return { text: 'Not Applied', badge: 'bg-warning', message: 'KYC verification not applied yet' };
      case 'applied':
        return { text: 'Under Review', badge: 'bg-info', message: 'KYC is under admin review' };
      case 'under_review':
        return { text: 'Under Review', badge: 'bg-info', message: 'KYC is under admin review' };
      case 'approved':
        return { text: 'Approved', badge: 'bg-success', message: 'KYC verification approved' };
      case 'verified':
        return { text: 'Verified', badge: 'bg-success', message: 'KYC verification completed' };
      case 'rejected':
        return { text: 'Rejected', badge: 'bg-danger', message: 'KYC verification rejected' };
      default:
        return { text: 'Not Applied', badge: 'bg-secondary', message: 'KYC verification not applied yet' };
    }
  };

  const kycStatusInfo = profile ? getKYCStatusDisplay(profile.kyc?.status || 'not_applied') : null;

  // Dismiss alert
  const dismissAlert = (alertId) => {
    setDismissedAlerts(prev => [...prev, alertId]);
  };

  // Check if alert should be shown
  const shouldShowAlert = (alertId) => {
    return !dismissedAlerts.includes(alertId);
  };

  // Helper functions for notifications
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'referral_pending':
        return '👥';
      case 'referral_completed':
        return '🎉';
      case 'transaction_deposit':
        return '💰';
      case 'transaction_withdrawal':
        return '💸';
      case 'withdrawal_approved':
        return '✅';
      case 'withdrawal_rejected':
        return '❌';
      case 'plan_purchased':
        return '📦';
      case 'plan_assigned':
        return '🎁';
      case 'plan_expiring':
        return '⏰';
      case 'plan_expired':
        return '⚠️';
      case 'trading_account_assigned':
        return '📊';
      case 'custom':
        return '📢';
      case 'system':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type, isRead) => {
    if (isRead) return 'text-muted';
    
    switch (type) {
      case 'referral_completed':
      case 'withdrawal_approved':
      case 'plan_purchased':
      case 'plan_assigned':
      case 'trading_account_assigned':
        return 'text-success';
      case 'withdrawal_rejected':
      case 'plan_expired':
        return 'text-danger';
      case 'plan_expiring':
        return 'text-warning';
      case 'referral_pending':
      case 'transaction_deposit':
      case 'transaction_withdrawal':
        return 'text-info';
      default:
        return 'text-primary';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="container-fluid py-4">
      {/* Welcome Section */}
      <div className="row mb-4">
            <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-1">Welcome back!</h2>
                              <p className="text-muted mb-0">
                Hello {displayInfo.name}, here&apos;s what&apos;s happening with your account.
              </p>
            </div>
            <div className="text-end">
              <div className="text-muted small">Last login</div>
              <div className="fw-bold">{new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="row mb-4">
        <div className="col-12">
          {/* Profile Setup Alert */}
          {!hasProfile && shouldShowAlert('profile-setup') && (
            <div className="alert alert-info alert-dismissible fade show rounded-3 mb-3" role="alert">
                  <div className="d-flex align-items-start">
                <i className="bi bi-info-circle me-3 mt-1 fs-4"></i>
                    <div className="flex-grow-1">
                  <h6 className="alert-heading mb-2">Complete Your Profile!</h6>
                  <p className="mb-2">To start trading, you need to complete your profile setup. This includes your personal information and KYC verification.</p>
                        <button 
                    className="btn btn-primary btn-sm"
                          onClick={() => router.push('/profile-setup')}
                        >
                          Complete Profile Setup
                        </button>
                      </div>
                    </div>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => dismissAlert('profile-setup')}
              ></button>
                  </div>
          )}

          {/* Email Verification Alert */}
          {user && !user.emailVerified && shouldShowAlert('email-verification') && (
            <div className="alert alert-warning alert-dismissible fade show rounded-3 mb-3" role="alert">
              <div className="d-flex align-items-start">
                <i className="bi bi-exclamation-triangle me-3 mt-1 fs-4"></i>
                <div className="flex-grow-1">
                  <h6 className="alert-heading mb-2">Email Verification Required</h6>
                  <p className="mb-2">Please verify your email address to access all features. Check your inbox for the verification link.</p>
                  <button 
                    className="btn btn-warning btn-sm me-2"
                    onClick={handleResendEmail}
                    disabled={resendingEmail}
                  >
                    {resendingEmail ? 'Sending...' : 'Resend Email'}
                  </button>
                  {emailSent && (
                    <span className="text-success small">✓ Email sent successfully!</span>
                  )}
                </div>
              </div>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => dismissAlert('email-verification')}
              ></button>
                </div>
              )}
              
          {/* KYC Status Alerts */}
          {hasProfile && !hasCompleteProfile && kycStatusInfo && shouldShowAlert('kyc-status') && (
            <div className={`alert alert-${kycStatusInfo.badge === 'bg-warning' ? 'warning' : kycStatusInfo.badge === 'bg-info' ? 'info' : kycStatusInfo.badge === 'bg-success' ? 'success' : kycStatusInfo.badge === 'bg-danger' ? 'danger' : 'secondary'} alert-dismissible fade show rounded-3 mb-3`} role="alert">
                  <div className="d-flex align-items-start">
                <i className={`bi ${kycStatusInfo.badge === 'bg-warning' ? 'bi-exclamation-triangle' : kycStatusInfo.badge === 'bg-info' ? 'bi-clock' : kycStatusInfo.badge === 'bg-success' ? 'bi-check-circle' : kycStatusInfo.badge === 'bg-danger' ? 'bi-x-circle' : 'bi-info-circle'} me-3 mt-1 fs-4`}></i>
                    <div className="flex-grow-1">
                  {/* <h6 className="alert-heading mb-2">KYC Status: {kycStatusInfo.text}</h6> */}
                  <p className="mb-2">{kycStatusInfo.message}</p>
                  {kycStatusInfo.badge === 'bg-warning' && (
                          <button 
                      className="btn btn-warning btn-sm"
                            onClick={() => router.push('/kyc-verification')}
                          >
                            Complete KYC Now
                          </button>
                        )}
                </div>
              </div>
                          <button 
                type="button" 
                className="btn-close" 
                onClick={() => dismissAlert('kyc-status')}
              ></button>
            </div>
                        )}
                      </div>
                    </div>

      {/* Analytics Cards */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-wallet2 text-primary fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Wallet Balance</h6>
                  <h4 className="fw-bold mb-0">₹{profile?.wallet?.walletBalance?.toFixed(2) || '0.00'}</h4>
                  <small className="text-success">+₹0.00 today</small>
                    </div>
                  </div>
                </div>
                      </div>
                    </div>

        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-gift text-warning fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Referral Balance</h6>
                  <h4 className="fw-bold mb-0">₹{profile?.wallet?.referralBalance?.toFixed(2) || '0.00'}</h4>
                  <small className="text-muted">Earned from referrals</small>
                </div>
              </div>
            </div>
                    </div>
                  </div>

        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-info bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-person-check text-info fs-4"></i>
                  </div>
                    </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Profile Completion</h6>
                  <h4 className="fw-bold mb-0">{profile?.status?.completionPercentage || 0}%</h4>
                  <small className="text-muted">{profile?.status?.completedFields?.length || 0} of 12 fields</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-share text-warning fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Referral Code</h6>
                  <h4 className="fw-bold mb-0">{referralData.referralCode || 'N/A'}</h4>
                  <small className="text-muted">{referralData.totalReferrals} referrals</small>
                </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

      {/* Recent Notifications & Quick Actions */}
      <div className="row">
        <div className="col-lg-8 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Notifications</h5>
              <div className="d-flex align-items-center gap-2">
                {/* <small className="text-muted">Last 10 notifications</small> */}
                <button 
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => {
                    if (!user?.uid) return;
                    setNotificationsLoading(true);
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${user.uid}?limit=10`, {
                      credentials: 'include'
                    })
                    .then(response => response.json())
                    .then(data => {
                      setNotifications(data.notifications || []);
                    })
                    .catch(error => console.error('Error refreshing notifications:', error))
                    .finally(() => setNotificationsLoading(false));
                  }}
                  disabled={notificationsLoading}
                  title="Refresh notifications"
                >
                  {notificationsLoading ? (
                    <div className="spinner-border spinner-border-sm" role="status" style={{ width: '12px', height: '12px' }}>
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : (
                    <i className="bi bi-arrow-clockwise"></i>
                  )}
                </button>
              </div>
            </div>
            <div className="card-body">
              {notificationsLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="text-muted mt-2">Loading notifications...</p>
                </div>
              ) : notifications.length > 0 ? (
                <div className="notifications-list" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  {notifications.map((notification, index) => (
                    <div
                      key={notification._id}
                      className={`notification-item d-flex align-items-start mb-3 p-3 rounded ${
                        !notification.isRead ? 'bg-light border-start border-primary border-3' : 'border-start border-light border-3'
                      }`}
                      style={{ 
                        transition: 'all 0.2s ease',
                        cursor: 'default'
                      }}
                    >
                      <div className="me-3">
                        <span className="fs-4">{getNotificationIcon(notification.type)}</span>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <h6 className={`mb-1 ${getNotificationColor(notification.type, notification.isRead)}`}>
                            {notification.title}
                            {!notification.isRead && (
                              <span className="badge bg-primary ms-2" style={{ fontSize: '0.6rem' }}>NEW</span>
                            )}
                          </h6>
                        </div>
                        <p className="mb-1 text-muted small">{notification.message}</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">{formatTimeAgo(notification.createdAt)}</small>
                          <small className={`badge ${
                            notification.priority === 'urgent' ? 'bg-danger' :
                            notification.priority === 'high' ? 'bg-warning' :
                            notification.priority === 'medium' ? 'bg-info' : 'bg-secondary'
                          }`} style={{ fontSize: '0.6rem' }}>
                            {notification.priority}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-bell-slash fs-1 text-muted mb-3"></i>
                  <p className="text-muted mb-0">No notifications yet</p>
                  <small className="text-muted">You'll see notifications here when they arrive</small>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0">
              <h5 className="mb-0">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                {/* Profile Setup Actions */}
                {!hasProfile && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => router.push('/profile-setup')}
                  >
                    <i className="bi bi-person-plus me-2"></i>
                    Complete Profile
                  </button>
                )}
                {hasProfile && !hasCompleteProfile && (
                  <button 
                    className="btn btn-warning"
                    onClick={() => router.push('/kyc-verification')}
                  >
                    <i className="bi bi-shield-check me-2"></i>
                    Complete KYC
                  </button>
                )}

                {/* Dashboard Pages */}
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => router.push('/dashboard/wallet')}
                >
                  <i className="bi bi-wallet2 me-2"></i>
                  Wallet
                </button>
                
                <button 
                  className="btn btn-outline-info"
                  onClick={() => router.push('/dashboard/transactions')}
                >
                  <i className="bi bi-receipt me-2"></i>
                  Transactions
                </button>
                
                <button 
                  className="btn btn-outline-success"
                  onClick={() => router.push('/dashboard/referral')}
                >
                  <i className="bi bi-share me-2"></i>
                  Referral Program
                </button>
                
                <button 
                  className="btn btn-outline-warning"
                  onClick={() => router.push('/dashboard/trading-account')}
                >
                  <i className="bi bi-graph-up me-2"></i>
                  Trading Account
                </button>
                
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => router.push('/dashboard/profile')}
                >
                  <i className="bi bi-person-gear me-2"></i>
                  Profile Settings
                </button>
                
                <button 
                  className="btn btn-outline-dark"
                  onClick={() => router.push('/dashboard/support')}
                >
                  <i className="bi bi-headset me-2"></i>
                  Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
