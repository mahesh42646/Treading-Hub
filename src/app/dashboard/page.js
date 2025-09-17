'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../user/auth/firebase';
import { getUserDisplayInfo } from '../utils/userDisplay';

const Dashboard = () => {
  const { user, profile, logout, refreshProfile, checkEmailVerification } = useAuth();
  const [resendingEmail, setResendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);
  const router = useRouter();
  
  const displayInfo = getUserDisplayInfo(user, profile);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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
          {!profile && shouldShowAlert('profile-setup') && (
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
          {profile && kycStatusInfo && shouldShowAlert('kyc-status') && (
            <div className={`alert alert-${kycStatusInfo.badge === 'bg-warning' ? 'warning' : kycStatusInfo.badge === 'bg-info' ? 'info' : kycStatusInfo.badge === 'bg-success' ? 'success' : kycStatusInfo.badge === 'bg-danger' ? 'danger' : 'secondary'} alert-dismissible fade show rounded-3 mb-3`} role="alert">
                  <div className="d-flex align-items-start">
                <i className={`bi ${kycStatusInfo.badge === 'bg-warning' ? 'bi-exclamation-triangle' : kycStatusInfo.badge === 'bg-info' ? 'bi-clock' : kycStatusInfo.badge === 'bg-success' ? 'bi-check-circle' : kycStatusInfo.badge === 'bg-danger' ? 'bi-x-circle' : 'bi-info-circle'} me-3 mt-1 fs-4`}></i>
                    <div className="flex-grow-1">
                  <h6 className="alert-heading mb-2">KYC Status: {kycStatusInfo.text}</h6>
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
                  <h6 className="text-muted mb-1">Account Balance</h6>
                  <h4 className="fw-bold mb-0">₹0.00</h4>
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
                  <div className="bg-success bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-graph-up text-success fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Total P&L</h6>
                  <h4 className="fw-bold mb-0 text-success">+₹0.00</h4>
                  <small className="text-success">+0.00% this month</small>
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
                  <h4 className="fw-bold mb-0">{profile?.myReferralCode || 'N/A'}</h4>
                  <small className="text-muted">0 referrals</small>
                </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

      {/* Recent Activity & Quick Actions */}
      <div className="row">
        <div className="col-lg-8 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0">
              <h5 className="mb-0">Recent Activity</h5>
            </div>
            <div className="card-body">
              <div className="timeline">
                <div className="timeline-item d-flex mb-3">
                  <div className="timeline-marker bg-primary rounded-circle me-3" style={{ width: '12px', height: '12px', marginTop: '6px' }}></div>
                  <div className="flex-grow-1">
                    <h6 className="mb-1">Profile Created</h6>
                    <p className="text-muted mb-0 small">Your profile was successfully created</p>
                    <small className="text-muted">2 hours ago</small>
                  </div>
                </div>
                <div className="timeline-item d-flex mb-3">
                  <div className="timeline-marker bg-info rounded-circle me-3" style={{ width: '12px', height: '12px', marginTop: '6px' }}></div>
                  <div className="flex-grow-1">
                    <h6 className="mb-1">Account Registered</h6>
                    <p className="text-muted mb-0 small">Welcome to Trading Hub! Your account has been created</p>
                    <small className="text-muted">1 day ago</small>
                  </div>
                </div>
              </div>
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
                {!profile && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => router.push('/profile-setup')}
                  >
                    <i className="bi bi-person-plus me-2"></i>
                    Complete Profile
                  </button>
                )}
                {profile && kycStatusInfo?.badge === 'bg-warning' && (
                  <button 
                    className="btn btn-warning"
                    onClick={() => router.push('/kyc-verification')}
                  >
                    <i className="bi bi-shield-check me-2"></i>
                    Complete KYC
                  </button>
                )}
                <button 
                  className="btn btn-outline-primary"
                  onClick={() => router.push('/dashboard/wallet')}
                >
                  <i className="bi bi-wallet2 me-2"></i>
                  View Wallet
                </button>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => router.push('/dashboard/referral')}
                >
                  <i className="bi bi-share me-2"></i>
                  Referral Program
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
