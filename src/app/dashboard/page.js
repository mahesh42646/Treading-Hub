'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import RouteGuard from '../components/RouteGuard';
import Header from '../user/components/Header';
import Footer from '../user/components/Footer';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../user/auth/firebase';
import { userApi } from '../../services/api';

const Dashboard = () => {
  const { user, profile, logout, refreshProfile, checkEmailVerification } = useAuth();
  const [resendingEmail, setResendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();

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
      case 'pending':
        return { text: 'Not Applied', badge: 'bg-warning', message: 'KYC verification not applied yet' };
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

  const kycStatusInfo = profile ? getKYCStatusDisplay(profile.profileCompletion?.kycStatus) : null;

  return (
    <RouteGuard requireAuth={true} requireProfile={false}>
      <div style={{
        background: 'linear-gradient(135deg, #002260 0%, #110A28 100%)',
        minHeight: '100vh',
        color: 'white'
      }}>
        <Header />
        
        <div className="container py-5 mt-5">
          <div className="row">
            <div className="col-12">
              <h1 className="display-4 fw-bold text-white mb-4">Welcome to Your Dashboard</h1>
              <p className="lead text-white-50 mb-5">
                Hello {profile?.firstName ? `${profile.firstName} ${profile.lastName}` : user?.email}, welcome to Trading Hub!
              </p>
              
              {/* Profile Setup Alert - Show only if user doesn't have profile */}
              {!profile && (
                <div className="alert alert-info rounded-4 mb-4" style={{
                  background: 'rgba(13, 202, 240, 0.1)',
                  border: '1px solid rgba(13, 202, 240, 0.3)',
                  color: '#6bd4ff'
                }}>
                  <div className="d-flex align-items-start">
                    <i className="bi bi-info-circle me-2 mt-1"></i>
                    <div className="flex-grow-1">
                      <strong>Complete Your Profile!</strong>
                      <p className="mb-2 mt-1">Set up your profile to access all features and complete KYC verification.</p>
                      <div className="d-flex gap-2">
                        <button 
                          className="btn btn-sm rounded-3"
                          onClick={() => router.push('/profile-setup')}
                          style={{
                            background: 'rgba(13, 202, 240, 0.2)',
                            border: '1px solid rgba(13, 202, 240, 0.5)',
                            color: '#6bd4ff'
                          }}
                        >
                          Complete Profile Setup
                        </button>
                        <button 
                          className="btn btn-sm rounded-3"
                          style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            color: 'white'
                          }}
                        >
                          Skip for Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* KYC Status Alerts - Show different alerts based on KYC status */}
              {profile && (
                <div className={`alert rounded-4 mb-4 ${
                  profile.profileCompletion.kycStatus === 'approved' || profile.profileCompletion.kycStatus === 'verified' 
                    ? 'alert-success' 
                    : profile.profileCompletion.kycStatus === 'rejected'
                    ? 'alert-danger'
                    : profile.profileCompletion.kycStatus === 'under_review'
                    ? 'alert-info'
                    : 'alert-warning'
                }`} style={{
                  background: profile.profileCompletion.kycStatus === 'approved' || profile.profileCompletion.kycStatus === 'verified'
                    ? 'rgba(25, 135, 84, 0.1)'
                    : profile.profileCompletion.kycStatus === 'rejected'
                    ? 'rgba(220, 53, 69, 0.1)'
                    : profile.profileCompletion.kycStatus === 'under_review'
                    ? 'rgba(13, 202, 240, 0.1)'
                    : 'rgba(255, 193, 7, 0.1)',
                  border: profile.profileCompletion.kycStatus === 'approved' || profile.profileCompletion.kycStatus === 'verified'
                    ? '1px solid rgba(25, 135, 84, 0.3)'
                    : profile.profileCompletion.kycStatus === 'rejected'
                    ? '1px solid rgba(220, 53, 69, 0.3)'
                    : profile.profileCompletion.kycStatus === 'under_review'
                    ? '1px solid rgba(13, 202, 240, 0.3)'
                    : '1px solid rgba(255, 193, 7, 0.3)',
                  color: profile.profileCompletion.kycStatus === 'approved' || profile.profileCompletion.kycStatus === 'verified'
                    ? '#6bff6b'
                    : profile.profileCompletion.kycStatus === 'rejected'
                    ? '#ff6b6b'
                    : profile.profileCompletion.kycStatus === 'under_review'
                    ? '#6bd4ff'
                    : '#ffc107'
                }}>
                  <div className="d-flex align-items-start">
                    <i className={`bi me-2 mt-1 ${
                      profile.profileCompletion.kycStatus === 'approved' || profile.profileCompletion.kycStatus === 'verified'
                        ? 'bi-check-circle-fill'
                        : profile.profileCompletion.kycStatus === 'rejected'
                        ? 'bi-x-circle-fill'
                        : profile.profileCompletion.kycStatus === 'under_review'
                        ? 'bi-clock-fill'
                        : 'bi-exclamation-triangle'
                    }`}></i>
                    <div className="flex-grow-1">
                      <strong>KYC Status: {kycStatusInfo?.text}</strong>
                      <p className="mb-2 mt-1">{kycStatusInfo?.message}</p>
                      <div className="d-flex gap-2">
                        {(profile.profileCompletion.kycStatus === 'pending' || !profile.profileCompletion.kycStatus) && (
                          <button 
                            className="btn btn-sm rounded-3"
                            onClick={() => router.push('/kyc-verification')}
                            style={{
                              background: 'rgba(255, 193, 7, 0.2)',
                              border: '1px solid rgba(255, 193, 7, 0.5)',
                              color: '#ffc107'
                            }}
                          >
                            Complete KYC Now
                          </button>
                        )}
                        {profile.profileCompletion.kycStatus === 'rejected' && (
                          <button 
                            className="btn btn-sm rounded-3"
                            onClick={() => router.push('/kyc-verification')}
                            style={{
                              background: 'rgba(220, 53, 69, 0.2)',
                              border: '1px solid rgba(220, 53, 69, 0.5)',
                              color: '#ff6b6b'
                            }}
                          >
                            Update KYC Data
                          </button>
                        )}
                        {profile.profileCompletion.kycStatus === 'under_review' && (
                          <button 
                            className="btn btn-sm rounded-3"
                            style={{
                              background: 'rgba(13, 202, 240, 0.2)',
                              border: '1px solid rgba(13, 202, 240, 0.5)',
                              color: '#6bd4ff'
                            }}
                          >
                            View KYC Status
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Verification Success Alert */}
              {user?.emailVerified && (
                <div className="alert alert-success rounded-4 mb-4" style={{
                  background: 'rgba(25, 135, 84, 0.1)',
                  border: '1px solid rgba(25, 135, 84, 0.3)',
                  color: '#6bff6b'
                }}>
                  <div className="d-flex align-items-start">
                    <i className="bi bi-check-circle-fill me-2 mt-1"></i>
                    <div className="flex-grow-1">
                      <strong>Email Verified Successfully!</strong>
                      <p className="mb-0 mt-1">Your email address has been verified. You can now complete KYC verification to activate your account.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Verification Alert */}
              {!user?.emailVerified && (
                <div className="alert alert-info rounded-4 mb-4" style={{
                  background: 'rgba(13, 202, 240, 0.1)',
                  border: '1px solid rgba(13, 202, 240, 0.3)',
                  color: '#6bd4ff'
                }}>
                  <div className="d-flex align-items-start">
                    <i className="bi bi-envelope me-2 mt-1"></i>
                    <div className="flex-grow-1">
                      <strong>Email Verification Required!</strong>
                      <p className="mb-2 mt-1">Please verify your email address to complete the registration process.</p>
                      <div className="d-flex gap-2">
                        <button 
                          className="btn btn-sm rounded-3"
                          onClick={handleResendEmail}
                          disabled={resendingEmail}
                          style={{
                            background: 'rgba(13, 202, 240, 0.2)',
                            border: '1px solid rgba(13, 202, 240, 0.5)',
                            color: '#6bd4ff'
                          }}
                        >
                          {resendingEmail ? 'Sending...' : 'Resend Verification Email'}
                        </button>
                        <button 
                          className="btn btn-sm rounded-3"
                          onClick={checkEmailVerification}
                          style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            color: 'white'
                          }}
                        >
                          Check Verification Status
                        </button>
                      </div>
                      {emailSent && (
                        <p className="mt-2 text-success">Verification email sent! Check your inbox and click the verification link.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="row g-4">
            {/* Profile Card */}
            <div className="col-lg-4">
              <div className="card border-0 rounded-4" style={{
                background: 'rgba(60, 58, 58, 0.03)',
                border: '1px solid rgba(124, 124, 124, 0.39)',
                backdropFilter: 'blur(20px)',
                boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
              }}>
                <div className="card-body p-4">
                  <h5 className="card-title text-white mb-3">Profile Information</h5>
                  {profile ? (
                    <>
                      <div className="mb-2">
                        <small className="text-white-50">Name:</small>
                        <p className="text-white mb-0">{profile.firstName} {profile.lastName}</p>
                      </div>
                      <div className="mb-2">
                        <small className="text-white-50">Email:</small>
                        <p className="text-white mb-0">{user?.email}</p>
                      </div>
                      <div className="mb-2">
                        <small className="text-white-50">Phone:</small>
                        <p className="text-white mb-0">{profile.phone}</p>
                      </div>
                      <div className="mb-2">
                        <small className="text-white-50">Location:</small>
                        <p className="text-white mb-0">{profile.city}, {profile.country}</p>
                      </div>
                      <div className="mb-2">
                        <small className="text-white-50">Referral Code:</small>
                        <p className="text-white mb-0">{profile.referralCode}</p>
                      </div>
                      <div className="mb-2">
                        <small className="text-white-50">Profile Completion:</small>
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress flex-grow-1" style={{ height: '8px' }}>
                            <div 
                              className="progress-bar" 
                              style={{ 
                                width: `${profile.profileCompletion?.percentage || 0}%`,
                                background: profile.profileCompletion?.percentage >= 70 ? '#28a745' : '#ffc107'
                              }}
                            ></div>
                          </div>
                          <span className="text-white small">{profile.profileCompletion?.percentage || 0}%</span>
                        </div>
                        <small className="text-white-50">
                          Status: <span className={`badge ${profile.profileCompletion?.isActive ? 'bg-success' : 'bg-warning'}`}>
                            {profile.profileCompletion?.isActive ? 'Active' : 'Incomplete'}
                          </span>
                        </small>
                      </div>
                      <div className="mb-2">
                        <small className="text-white-50">KYC Status:</small>
                        <div className="mt-1">
                          <span className={`badge ${kycStatusInfo?.badge || 'bg-secondary'}`}>
                            {kycStatusInfo?.text || 'Not Started'}
                          </span>
                        </div>
                        {profile.profileCompletion?.kycDetails && (
                          <div className="mt-2">
                            <small className="text-white-50 d-block">
                              <i className={`bi ${profile.profileCompletion?.kycDetails?.emailVerified ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'}`}></i>
                              Email Verified
                            </small>
                            <small className="text-white-50 d-block">
                              <i className={`bi ${profile.profileCompletion?.kycDetails?.panCardVerified ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'}`}></i>
                              PAN Card Verified
                            </small>
                            <small className="text-white-50 d-block">
                              <i className={`bi ${profile.profileCompletion?.kycDetails?.profilePhotoUploaded ? 'bi-check-circle-fill text-success' : 'bi-x-circle-fill text-danger'}`}></i>
                              Profile Photo Uploaded
                            </small>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-3">
                      <i className="bi bi-person-circle text-white-50" style={{ fontSize: '3rem' }}></i>
                      <p className="text-white-50 mt-3">Profile not set up yet</p>
                      <button 
                        className="btn btn-sm rounded-3"
                        onClick={() => router.push('/profile-setup')}
                        style={{
                          background: 'rgba(13, 202, 240, 0.2)',
                          border: '1px solid rgba(13, 202, 240, 0.5)',
                          color: '#6bd4ff'
                        }}
                      >
                        Set Up Profile
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Trading Stats */}
            <div className="col-lg-4">
              <div className="card border-0 rounded-4" style={{
                background: 'rgba(60, 58, 58, 0.03)',
                border: '1px solid rgba(124, 124, 124, 0.39)',
                backdropFilter: 'blur(20px)',
                boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
              }}>
                <div className="card-body p-4">
                  <h5 className="card-title text-white mb-3">Trading Statistics</h5>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span className="text-white-50">Account Balance:</span>
                      <span className="text-white fw-bold">$0.00</span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span className="text-white-50">Total Trades:</span>
                      <span className="text-white fw-bold">0</span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span className="text-white-50">Win Rate:</span>
                      <span className="text-white fw-bold">0%</span>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between">
                      <span className="text-white-50">Profit/Loss:</span>
                      <span className="text-white fw-bold">$0.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="col-lg-4">
              <div className="card border-0 rounded-4" style={{
                background: 'rgba(60, 58, 58, 0.03)',
                border: '1px solid rgba(124, 124, 124, 0.39)',
                backdropFilter: 'blur(20px)',
                boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
              }}>
                <div className="card-body p-4">
                  <h5 className="card-title text-white mb-3">Quick Actions</h5>
                  <div className="d-grid gap-2">
                    <button className="btn rounded-4" style={{
                      background: 'rgba(60, 58, 58, 0.03)',
                      border: '1px solid rgba(124, 124, 124, 0.39)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)',
                      color: 'white'
                    }}>
                      Start Trading
                    </button>
                    <button className="btn rounded-4" style={{
                      background: 'rgba(60, 58, 58, 0.03)',
                      border: '1px solid rgba(124, 124, 124, 0.39)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)',
                      color: 'white'
                    }}>
                      View History
                    </button>
                    <button className="btn rounded-4" style={{
                      background: 'rgba(60, 58, 58, 0.03)',
                      border: '1px solid rgba(124, 124, 124, 0.39)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)',
                      color: 'white'
                    }}>
                      Settings
                    </button>
                    {!profile && (
                      <button 
                        className="btn rounded-4" 
                        onClick={() => router.push('/profile-setup')}
                        style={{
                          background: 'rgba(13, 202, 240, 0.1)',
                          border: '1px solid rgba(13, 202, 240, 0.3)',
                          backdropFilter: 'blur(20px)',
                          color: '#6bd4ff'
                        }}
                      >
                        Set Up Profile
                      </button>
                    )}
                    {profile && profile.profileCompletion?.kycStatus === 'pending' && (
                      <button 
                        className="btn rounded-4" 
                        onClick={() => router.push('/kyc-verification')}
                        style={{
                          background: 'rgba(255, 193, 7, 0.1)',
                          border: '1px solid rgba(255, 193, 7, 0.3)',
                          backdropFilter: 'blur(20px)',
                          color: '#ffc107'
                        }}
                      >
                        Complete KYC
                      </button>
                    )}
                    {profile && profile.profileCompletion?.kycStatus === 'rejected' && (
                      <button 
                        className="btn rounded-4" 
                        onClick={() => router.push('/kyc-verification')}
                        style={{
                          background: 'rgba(220, 53, 69, 0.1)',
                          border: '1px solid rgba(220, 53, 69, 0.3)',
                          backdropFilter: 'blur(20px)',
                          color: '#ff6b6b'
                        }}
                      >
                        Update KYC Data
                      </button>
                    )}
                    <button 
                      className="btn rounded-4" 
                      onClick={handleLogout}
                      style={{
                        background: 'rgba(220, 53, 69, 0.1)',
                        border: '1px solid rgba(220, 53, 69, 0.3)',
                        backdropFilter: 'blur(20px)',
                        color: '#ff6b6b'
                      }}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="row mt-5">
            <div className="col-12">
              <div className="card border-0 rounded-4" style={{
                background: 'rgba(60, 58, 58, 0.03)',
                border: '1px solid rgba(124, 124, 124, 0.39)',
                backdropFilter: 'blur(20px)',
                boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
              }}>
                <div className="card-body p-4">
                  <h5 className="card-title text-white mb-3">Recent Activity</h5>
                  <div className="text-center py-4">
                    <i className="bi bi-activity text-white-50" style={{ fontSize: '3rem' }}></i>
                    <p className="text-white-50 mt-3">No recent activity to display</p>
                    <p className="text-white-50">Start trading to see your activity here</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </RouteGuard>
  );
};

export default Dashboard;
