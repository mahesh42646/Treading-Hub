'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { buildApiUrl } from '../../../utils/config';

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

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.personalInfo?.firstName || profile.firstName || '',
        lastName: profile.personalInfo?.lastName || profile.lastName || '',
        phoneNumber: profile.personalInfo?.phoneNumber || '',
        dateOfBirth: profile.personalInfo?.dateOfBirth || '',
        gender: profile.personalInfo?.gender || '',
        city: profile.personalInfo?.city || ''
      });
    }
  }, [profile]);

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
      const response = await fetch(buildApiUrl('/profile/update'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify({
          personalInfo: formData
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

  const copyReferralCode = () => {
    if (profile?.referral?.code) {
      navigator.clipboard.writeText(profile.referral.code);
      setMessage('Referral code copied to clipboard!');
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
            <h1 className="page-title mb-1">Profile Settings</h1>
            <p className="page-subtitle text-muted">Manage your account information and preferences</p>
          </div>
          <button
            className={`btn ${isEditing ? 'btn-secondary' : 'btn-primary'}`}
            onClick={() => setIsEditing(!isEditing)}
            disabled={loading}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Alert Message */}
      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show mb-4`}>
          {message}
          <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
        </div>
      )}

      <div className="row">
        {/* Personal Information */}
        <div className="col-lg-8 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">Personal Information</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control bg-light"
                      value={user?.email || ''}
                      disabled
                    />
                    <small className="text-muted">Email cannot be changed</small>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      className="form-control"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Gender</label>
                    <select
                      className="form-select"
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
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      className="form-control"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="text-end">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
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
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">Account Status</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Profile Completion</label>
                <div className="progress mb-2">
                  <div className="progress-bar bg-primary" style={{ width: '100%' }}>100%</div>
                </div>
                <small className="text-muted">12 of 12 fields completed</small>
              </div>

              <div className="mb-3">
                <label className="form-label">Account Status</label>
                <div>
                  <span className="badge bg-success">Active</span>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Email Verification</label>
                <div>
                  <span className="badge bg-success">Verified</span>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">KYC Status</label>
                <div>
                  {getKYCStatusBadge(profile.kyc?.status || 'not_applied')}
                </div>
                {profile.kyc?.appliedOn && (
                  <small className="text-muted d-block mt-1">
                    Applied on {new Date(profile.kyc.appliedOn).toLocaleDateString()}
                  </small>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProfilePage;
