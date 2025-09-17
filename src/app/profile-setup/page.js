'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import RouteGuard from '../components/RouteGuard';
import Image from 'next/image';
import { userApi } from '../../services/api';

const ProfileSetup = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [phoneValidation, setPhoneValidation] = useState({ checking: false, available: null, message: '' });
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    country: '',
    city: '',
    phone: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Check phone number availability when phone field changes
    if (name === 'phone' && value.length >= 10) {
      checkPhoneAvailability(value);
    } else if (name === 'phone') {
      setPhoneValidation({ checking: false, available: null, message: '' });
    }
  };

  // Check if phone number is available
  const checkPhoneAvailability = async (phone) => {
    if (!phone || phone.length < 10) return;

    setPhoneValidation({ checking: true, available: null, message: '' });

    try {
      const data = await userApi.checkPhone(phone);

      if (data.success) {
        if (data.exists) {
          setPhoneValidation({ 
            checking: false, 
            available: false, 
            message: 'This phone number is already registered with another account' 
          });
        } else {
          setPhoneValidation({ 
            checking: false, 
            available: true, 
            message: 'Phone number is available' 
          });
        }
      } else {
        setPhoneValidation({ 
          checking: false, 
          available: null, 
          message: 'Error checking phone number availability' 
        });
      }
    } catch (error) {
      setPhoneValidation({ 
        checking: false, 
        available: null, 
        message: 'Error checking phone number availability' 
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.gender || 
        !formData.dateOfBirth || !formData.country || !formData.city || 
        !formData.phone) {
      setError('Please fill in all required fields');
      setSubmitting(false);
      return;
    }

    // Validate phone number availability
    if (phoneValidation.available === false) {
      setError('Please use a different phone number. This one is already registered.');
      setSubmitting(false);
      return;
    }

    try {
      const profileData = {
        uid: user.uid,
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        country: formData.country,
        city: formData.city,
        phone: formData.phone
      };

      // Call API directly with correct URL
      const response = await fetch('https://0fare.com/api/api/users/profile-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSuccess('Profile created successfully! Redirecting to dashboard...');
        await refreshProfile();
        setTimeout(() => router.push('/dashboard'), 2000);
      } else {
        setError(data.message || 'Failed to create profile');
      }
    } catch (error) {
      console.error('Profile setup error:', error);
      const errorMessage = error.message || 'An error occurred. Please try again.';
      setError(`Error: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RouteGuard requireAuth={true} requireProfile={false}>
      <div className="container-fluid min-vh-100 py-5" style={{
        background: 'linear-gradient(135deg, #002260 0%, #110A28 100%)',
        color: 'white'
      }}>
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card border-0 rounded-4" style={{
              background: 'rgba(60, 58, 58, 0.03)',
              border: '1px solid rgba(124, 124, 124, 0.39)',
              backdropFilter: 'blur(20px)',
              boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
            }}>
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-white">
                    <span style={{ color: 'red', textDecoration: 'underline green' }}>Trading </span>
                    <span style={{ color: 'green', textDecoration: 'underline red' }}>Hub</span>
                  </h2>
                  <p className="text-white-50">Complete your profile setup</p>
                </div>

                {error && (
                  <div className="alert alert-danger rounded-4" role="alert" style={{
                    background: 'rgba(220, 53, 69, 0.1)',
                    border: '1px solid rgba(220, 53, 69, 0.3)',
                    color: '#ff6b6b'
                  }}>
                    {error}
                  </div>
                )}

                {success && (
                  <div className="alert alert-success rounded-4" role="alert" style={{
                    background: 'rgba(25, 135, 84, 0.1)',
                    border: '1px solid rgba(25, 135, 84, 0.3)',
                    color: '#6bff6b'
                  }}>
                    {success}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="firstName" className="form-label text-white">First Name *</label>
                      <input
                        type="text"
                        className="form-control rounded-4"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        placeholder="Enter your first name"
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          backdropFilter: 'blur(20px)',
                          color: 'white'
                        }}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="lastName" className="form-label text-white">Last Name *</label>
                      <input
                        type="text"
                        className="form-control rounded-4"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        placeholder="Enter your last name"
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          backdropFilter: 'blur(20px)',
                          color: 'white'
                        }}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="gender" className="form-label text-white">Gender *</label>
                      <select
                        className="form-select rounded-4"
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          backdropFilter: 'blur(20px)',
                          color: 'white'
                        }}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="dateOfBirth" className="form-label text-white">Date of Birth *</label>
                      <input
                        type="date"
                        className="form-control rounded-4"
                        id="dateOfBirth"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        required
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          backdropFilter: 'blur(20px)',
                          color: 'white'
                        }}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="country" className="form-label text-white">Country (as per Government ID) *</label>
                      <input
                        type="text"
                        className="form-control rounded-4"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                        placeholder="Enter your country"
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          backdropFilter: 'blur(20px)',
                          color: 'white'
                        }}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="city" className="form-label text-white">City *</label>
                      <input
                        type="text"
                        className="form-control rounded-4"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        placeholder="Enter your city"
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          backdropFilter: 'blur(20px)',
                          color: 'white'
                        }}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label text-white">Phone Number *</label>
                    <input
                      type="tel"
                      className={`form-control rounded-4 ${
                        phoneValidation.available === false ? 'is-invalid' : 
                        phoneValidation.available === true ? 'is-valid' : ''
                      }`}
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="Enter your phone number"
                      style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: phoneValidation.available === false 
                          ? '1px solid rgba(220, 53, 69, 0.5)' 
                          : phoneValidation.available === true 
                          ? '1px solid rgba(25, 135, 84, 0.5)' 
                          : '1px solid rgba(124, 124, 124, 0.39)',
                        backdropFilter: 'blur(20px)',
                        color: 'white'
                      }}
                    />
                    {phoneValidation.checking && (
                      <small className="text-info">
                        <i className="bi bi-arrow-clockwise me-1"></i>
                        Checking phone number availability...
                      </small>
                    )}
                    {phoneValidation.message && !phoneValidation.checking && (
                      <small className={`${
                        phoneValidation.available === false ? 'text-danger' : 
                        phoneValidation.available === true ? 'text-success' : 'text-warning'
                      }`}>
                        {phoneValidation.message}
                      </small>
                    )}
                  </div>

                  <div className="alert alert-info rounded-4 mb-3" style={{
                    background: 'rgba(13, 202, 240, 0.1)',
                    border: '1px solid rgba(13, 202, 240, 0.3)',
                    color: '#6bd4ff'
                  }}>
                    <div className="d-flex align-items-start">
                      <i className="bi bi-info-circle me-2 mt-1"></i>
                      <div>
                        <strong>Profile Setup Complete!</strong>
                        <br />
                        Your profile will be 75% complete. You can complete KYC verification later from your dashboard.
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn w-100 rounded-4"
                    disabled={submitting || phoneValidation.available === false}
                    style={{
                      background: 'rgba(60, 58, 58, 0.03)',
                      border: '1px solid rgba(124, 124, 124, 0.39)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)',
                      color: 'white'
                    }}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Creating Profile...
                      </>
                    ) : (
                      'Complete Profile Setup'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
};

export default ProfileSetup;
