'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { buildApiUrl } from '../../../utils/config';
import { userApi } from '../../../services/api';

const ProfilePage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    city: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [referralData, setReferralData] = useState({
    referralCode: '',
    totalReferrals: 0,
    totalEarnings: 0
  });

  const fetchReferralData = async () => {
    try {
      const data = await userApi.getReferralStats(user.uid);
      
      setReferralData({
        referralCode: data.stats?.referralCode || data.stats?.myReferralCode || '',
        totalReferrals: data.stats?.totalReferrals || 0,
        totalEarnings: data.stats?.totalEarnings || 0
      });
    } catch (error) {
      
    }
  };

  useEffect(() => {
    if (profile) {
      // Format date of birth for input field
      let formattedDateOfBirth = '';
      if (profile.personalInfo?.dateOfBirth) {
        const date = new Date(profile.personalInfo.dateOfBirth);
        formattedDateOfBirth = date.toISOString().split('T')[0];
      }
      
      setFormData({
        firstName: profile.personalInfo?.firstName || profile.firstName || '',
        lastName: profile.personalInfo?.lastName || profile.lastName || '',
        phoneNumber: profile.personalInfo?.phone || '',
        dateOfBirth: formattedDateOfBirth,
        gender: profile.personalInfo?.gender || '',
        city: profile.personalInfo?.city || ''
      });
    }
    
    if (user?.uid) {
      fetchReferralData();
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

    try {
      const response = await fetch(buildApiUrl(`/users/profile/${user.uid}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // No auth header needed for current backend; using uid param
        },
        body: JSON.stringify({
          personalInfo: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phoneNumber,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender,
            city: formData.city
          }
        })
      });

      if (response.ok) {
        setMessage('Profile updated successfully!');
        setIsEditing(false);
        await refreshProfile();
      } else {
        const error = await response.json();
        setMessage(error.message || 'Failed to update profile');
      }
    } catch (error) {
      setMessage('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (referralData.referralCode) {
      const referralLink = `${window.location.origin}/register?ref=${referralData.referralCode}`;
      navigator.clipboard.writeText(referralLink);
      setMessage('Referral link copied to clipboard!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const getKYCStatusBadge = (status) => {
    const statusMap = {
      'not_applied': { class: 'bg-warning', text: 'Not Applied' },
      'pending': { class: 'bg-warning', text: 'Pending' },
      'applied': { class: 'bg-info', text: 'Under Review' },
      'under_review': { class: 'bg-info', text: 'Under Review' },
      'approved': { class: 'bg-success', text: 'Approved' },
      'verified': { class: 'bg-success', text: 'Verified' },
      'rejected': { class: 'bg-danger', text: 'Rejected' }
    };
    const statusInfo = statusMap[status] || statusMap['not_applied'];
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  if (!profile) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Page Header */}
      <div className="page- mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title mb-1 text-white">Profile Settings</h1>
            <p className="page-subtitle text-white-50">Manage your account information and preferences</p>
          </div>
          <button
            className={`btn rounded-4 ${isEditing ? 'btn-secondary' : 'btn-primary'}`}
            style={isEditing ? {
              background: 'rgba(60, 58, 58, 0.03)',
              border: '1px solid rgba(124, 124, 124, 0.39)',
              color: '#e2e8f0'
            } : {
              background: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.5)',
              color: '#3b82f6'
            }}
            onClick={() => setIsEditing(!isEditing)}
            disabled={loading}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Alert Message */}
      {message && (
        <div className={`alert alert-dismissible fade show mb-4 rounded-4`} style={{
          background: message.includes('success') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: message.includes('success') ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
          color: '#e2e8f0'
        }}>
          {message}
          <button type="button" className="btn-close btn-close-white" onClick={() => setMessage('')}></button>
        </div>
      )}

      <div className="row">
        {/* Personal Information */}
        <div className="col-lg-8 mb-4">
          <div className="card h-100 border-0" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-header border-0" style={{
              background: 'transparent',
              borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
            }}>
              <h5 className="card-title mb-0 text-white">Personal Information</h5>
            </div>
            <div className="card-body" style={{ color: '#e2e8f0' }}>
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-white">First Name</label>
                    <input
                      type="text"
                      className="form-control rounded-4"
                      style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        color: '#e2e8f0'
                      }}
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-white">Last Name</label>
                    <input
                      type="text"
                      className="form-control rounded-4"
                      style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        color: '#e2e8f0'
                      }}
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-white">Email Address</label>
                    <input
                      type="email"
                      className="form-control rounded-4"
                      style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        color: '#e2e8f0'
                      }}
                      value={user?.email || ''}
                      disabled
                    />
                    <small className="text-white-50">Email cannot be changed</small>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-white">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control rounded-4"
                      style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        color: '#e2e8f0'
                      }}
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label text-white">Date of Birth</label>
                    <input
                      type="date"
                      className="form-control rounded-4"
                      style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        color: '#e2e8f0'
                      }}
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label text-white">Gender</label>
                    <select
                      className="form-select rounded-4"
                      style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        color: '#e2e8f0'
                      }}
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
                  <div className="col-md-4 mb-3">
                    <label className="form-label text-white">City</label>
                    <input
                      type="text"
                      className="form-control rounded-4"
                      style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        color: '#e2e8f0'
                      }}
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="text-end">
                    <button type="submit" className="btn rounded-4" style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid rgba(59, 130, 246, 0.5)',
                      color: '#3b82f6'
                    }} disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Account Status & KYC */}
        <div className="col-lg-4 mb-4">
          <div className="card h-100 border-0" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-header border-0" style={{
              background: 'transparent',
              borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
            }}>
              <h5 className="card-title mb-0 text-white">Account Status</h5>
            </div>
            <div className="card-body" style={{ color: '#e2e8f0' }}>
              <div className="mb-3">
                <label className="form-label text-white">Profile Completion</label>
                <div className="progress mb-2" style={{
                  background: 'rgba(60, 58, 58, 0.03)',
                  border: '1px solid rgba(124, 124, 124, 0.39)'
                }}>
                  <div className="progress-bar" style={{ 
                    background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
                    width: '100%'
                  }}>100%</div>
                </div>
                <small className="text-white-50">12 of 12 fields completed</small>
              </div>

              <div className="mb-3">
                <label className="form-label text-white">Account Status</label>
                <div>
                  <span className="badge bg-success">Active</span>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-white">Email Verification</label>
                <div>
                  <span className="badge bg-success">Verified</span>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-white">KYC Status</label>
                <div>
                  {getKYCStatusBadge(profile.kyc?.status || 'not_applied')}
                </div>
                {profile.kyc?.appliedOn && (
                  <small className="text-white-50 d-block mt-1">
                    Applied on {new Date(profile.kyc.appliedOn).toLocaleDateString()}
                  </small>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Information */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-header border-0" style={{
              background: 'transparent',
              borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
            }}>
              <h5 className="card-title mb-0 text-white">Referral Information</h5>
            </div>
            <div className="card-body" style={{ color: '#e2e8f0' }}>
              <div className="row align-items-center">
                <div className="col-12">
                  <div className="mb-3">
                    <label className="form-label text-white">Your Referral Link</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control rounded-4"
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: '#e2e8f0'
                        }}
                        value={referralData.referralCode ? `${window.location.origin}/register?ref=${referralData.referralCode}` : 'N/A'}
                        readOnly
                      />
                      <button
                        className="btn rounded-4"
                        style={{
                          background: 'rgba(59, 130, 246, 0.2)',
                          border: '1px solid rgba(59, 130, 246, 0.5)',
                          color: '#3b82f6'
                        }}
                        type="button"
                        onClick={copyReferralLink}
                      >
                        <i className="bi bi-copy"></i> Copy Link
                      </button>
                    </div>
                    <small className="text-white-50">Share this link with friends to earn 20% of their first deposit</small>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-white">Total Referrals</label>
                    <div className="d-flex align-items-center">
                      <span className="h4 mb-0 me-2 text-white">{referralData.totalReferrals}</span>
                      <span className="text-white-50">users referred</span>
                    </div>
                    <small className="text-success">Total earnings: ₹{referralData.totalEarnings.toFixed(2)}</small>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <a href="/dashboard/referral" className="btn rounded-4" style={{
                  background: 'rgba(59, 130, 246, 0.2)',
                  border: '1px solid rgba(59, 130, 246, 0.5)',
                  color: '#3b82f6'
                }}>
                  View Referral Program
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProfilePage;
