'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../../user/components/Sidebar';
import DashboardHeader from '../../user/components/DashboardHeader';
import { useRouter } from 'next/navigation';

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({});
  const router = useRouter();

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.personalInfo?.firstName || profile.firstName || '',
        lastName: profile.personalInfo?.lastName || profile.lastName || '',
        email: user?.email || '',
        phone: profile.personalInfo?.phone || profile.phone || '',
        country: profile.personalInfo?.country || profile.country || '',
        city: profile.personalInfo?.city || profile.city || '',
        dateOfBirth: profile.personalInfo?.dateOfBirth ? new Date(profile.personalInfo.dateOfBirth).toISOString().split('T')[0] : profile.dateOfBirth || '',
        gender: profile.personalInfo?.gender || profile.gender || '',
      });
    }
  }, [profile, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Simulate API call
    setTimeout(() => {
      setMessage('Profile updated successfully!');
      setIsEditing(false);
      setLoading(false);
    }, 2000);
  };

  const getKYCStatusDisplay = (kycStatus) => {
    switch (kycStatus) {
      case 'not_applied':
        return { text: 'Not Applied', badge: 'bg-warning', message: 'KYC verification not applied yet' };
      case 'applied':
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

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <Sidebar />
      
      <div className="flex-grow-1 d-flex flex-column">
        <DashboardHeader />
        
        <main className="flex-grow-1 bg-light">
          <div className="container-fluid py-4">
            {/* Header */}
            <div className="row mb-4">
              <div className="col-12">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h2 className="fw-bold mb-1">Profile Settings</h2>
                    <p className="text-muted mb-0">Manage your account information and preferences</p>
                  </div>
                  <button
                    className={`btn ${isEditing ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>
              </div>
            </div>

            {message && (
              <div className="alert alert-success alert-dismissible fade show" role="alert">
                {message}
                <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
              </div>
            )}

            <div className="row">
              {/* Profile Information */}
              <div className="col-lg-8 mb-4">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-white border-0">
                    <h5 className="mb-0">Personal Information</h5>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleSubmit}>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="firstName" className="form-label">First Name</label>
                          <input
                            type="text"
                            className="form-control"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="lastName" className="form-label">Last Name</label>
                          <input
                            type="text"
                            className="form-control"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="email" className="form-label">Email Address</label>
                          <input
                            type="email"
                            className="form-control"
                            id="email"
                            name="email"
                            value={formData.email}
                            disabled
                          />
                          <small className="text-muted">Email cannot be changed</small>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="phone" className="form-label">Phone Number</label>
                          <input
                            type="tel"
                            className="form-control"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="dateOfBirth" className="form-label">Date of Birth</label>
                          <input
                            type="date"
                            className="form-control"
                            id="dateOfBirth"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="gender" className="form-label">Gender</label>
                          <select
                            className="form-select"
                            id="gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="country" className="form-label">Country</label>
                          <input
                            type="text"
                            className="form-control"
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="city" className="form-label">City</label>
                          <input
                            type="text"
                            className="form-control"
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                      
                      {isEditing && (
                        <div className="d-flex gap-2">
                          <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={loading}
                          >
                            {loading ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button 
                            type="button" 
                            className="btn btn-secondary"
                            onClick={() => setIsEditing(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              </div>

              {/* Account Status & KYC */}
              <div className="col-lg-4 mb-4">
                {/* Account Status */}
                <div className="card border-0 shadow-sm mb-4">
                  <div className="card-header bg-white border-0">
                    <h5 className="mb-0">Account Status</h5>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted">Profile Completion</span>
                        <span className="fw-bold">{profile?.status?.completionPercentage || 0}%</span>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div 
                          className="progress-bar bg-primary" 
                          style={{ width: `${profile?.status?.completionPercentage || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted">Account Status</span>
                        <span className={`badge ${profile?.status?.isActive ? 'bg-success' : 'bg-warning'}`}>
                          {profile?.status?.isActive ? 'Active' : 'Pending'}
                        </span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted">Email Verified</span>
                        <span className={`badge ${user?.emailVerified ? 'bg-success' : 'bg-warning'}`}>
                          {user?.emailVerified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-muted">KYC Status</span>
                        <span className={`badge ${kycStatusInfo?.badge || 'bg-secondary'}`}>
                          {kycStatusInfo?.text || 'Not Applied'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* KYC Information */}
                {profile?.kyc && (
                  <div className="card border-0 shadow-sm mb-4">
                    <div className="card-header bg-white border-0">
                      <h5 className="mb-0">KYC Information</h5>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <small className="text-muted d-block">Status</small>
                        <span className={`badge ${kycStatusInfo?.badge || 'bg-secondary'}`}>
                          {kycStatusInfo?.text || 'Not Applied'}
                        </span>
                      </div>
                      
                      {profile.kyc.status === 'applied' && (
                        <div className="mb-3">
                          <small className="text-muted d-block">Applied On</small>
                          <span className="fw-bold">
                            {profile.kyc.appliedAt ? new Date(profile.kyc.appliedAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      )}

                      {profile.kyc.status === 'approved' && (
                        <div className="mb-3">
                          <small className="text-muted d-block">Approved On</small>
                          <span className="fw-bold">
                            {profile.kyc.approvedAt ? new Date(profile.kyc.approvedAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      )}

                      {profile.kyc.status === 'rejected' && (
                        <div className="mb-3">
                          <small className="text-muted d-block">Rejected On</small>
                          <span className="fw-bold">
                            {profile.kyc.rejectedAt ? new Date(profile.kyc.rejectedAt).toLocaleDateString() : 'N/A'}
                          </span>
                          {profile.kyc.rejectionNote && (
                            <div className="mt-2">
                              <small className="text-muted d-block">Reason</small>
                              <p className="text-danger small mb-0">{profile.kyc.rejectionNote}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {kycStatusInfo?.badge === 'bg-warning' && (
                        <button 
                          className="btn btn-warning btn-sm w-100"
                          onClick={() => router.push('/kyc-verification')}
                        >
                          Complete KYC
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Referral Information */}
                {profile?.referral && (
                  <div className="card border-0 shadow-sm">
                    <div className="card-header bg-white border-0">
                      <h5 className="mb-0">Referral Information</h5>
                    </div>
                    <div className="card-body">
                      <div className="mb-3">
                        <small className="text-muted d-block">Your Referral Code</small>
                        <div className="input-group">
                          <input 
                            type="text" 
                            className="form-control" 
                            value={profile.referral.code || 'N/A'} 
                            readOnly 
                          />
                          <button className="btn btn-outline-secondary" type="button">
                            <i className="bi bi-copy"></i>
                          </button>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <small className="text-muted d-block">Total Referrals</small>
                        <span className="fw-bold">0</span>
                      </div>

                      <button 
                        className="btn btn-outline-primary btn-sm w-100"
                        onClick={() => router.push('/referral')}
                      >
                        View Referral Program
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 