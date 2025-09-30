'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import RouteGuard from '../components/RouteGuard';
import { userApi } from '../../services/api';
import Image from 'next/image';

const ProfileSetup = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const router = useRouter();

  // Debug logging
  
  if (profile) {
    
  }

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    country: '',
    city: '',
    phone: ''
  });

  const [referralCode, setReferralCode] = useState('');

  // Check if user already has a profile based on completion percentage
  useEffect(() => {
    // Only check after a small delay to ensure profile is loaded
    const timer = setTimeout(() => {
      if (profile) {
        const completionPercentage = profile.status?.completionPercentage || 0;
        
        if (completionPercentage >= 75) {
          
          router.push('/dashboard');
        }
      } else {
        
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [profile, router]);

  // Check for referral code in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For phone number, only allow digits and limit to 10
    if (name === 'phone') {
      const phoneValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({
        ...prev,
        [name]: phoneValue
      }));
      setPhoneError('');
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validatePhone = async (phone) => {
    try {
      const response = await userApi.checkPhone(phone);
      if (response.exists) {
        setPhoneError('This phone number is already registered');
        return false;
      }
      return true;
    } catch (error) {
      
      return true; // Allow submission if validation fails
    }
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.gender) {
      setError('Gender is required');
      return false;
    }
    if (!formData.dateOfBirth) {
      setError('Date of birth is required');
      return false;
    }
    if (!formData.country.trim()) {
      setError('Country is required');
      return false;
    }
    if (!formData.city.trim()) {
      setError('City is required');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    // Validate phone number format (10 digits)
    if (!/^\d{10}$/.test(formData.phone.trim())) {
      setError('Phone number must be exactly 10 digits');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    setPhoneError('');

    try {
      // Validate form fields
      if (!validateForm()) {
        setSubmitting(false);
        return;
      }

      // Validate phone number
      const isPhoneValid = await validatePhone(formData.phone);
      if (!isPhoneValid) {
        setSubmitting(false);
        return;
      }

      // Create profile for existing user
      
      const response = await userApi.profileSetup({
        uid: user.uid,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        country: formData.country.trim(),
        city: formData.city.trim(),
        phone: formData.phone.trim(),
        referralCode: referralCode || null
      });

      
      
      if (response.success) {
        setSuccess('Profile created successfully! Redirecting to dashboard...');
        await refreshProfile();
        setTimeout(() => router.push('/dashboard'), 2000);
      } else {
        setError(response.message || 'Failed to create profile');
      }
    } catch (error) {
      
      setError(`Error: ${error.message}`);
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
                <Link href="/" className="navbar-brand d-flex align-items-center justify-content-center mb-3" style={{ color: '#ffffff', textDecoration: 'none' }}>


<Image className="border-0" src="/logo.png" alt="Funding Flow" width={100} height={100} style={{ width: 'auto', height: '80px' }} />
</Link>
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
                  {/* Referral Code Section */}
                  {referralCode && (
                    <div className="alert alert-info rounded-4 mb-4" style={{
                      background: 'rgba(13, 202, 240, 0.1)',
                      border: '1px solid rgba(13, 202, 240, 0.3)',
                      color: '#6bd4ff'
                    }}>
                      <div className="d-flex align-items-center">
                        <i className="bi bi-gift me-2"></i>
                        <div>
                          <strong>Referral Code Applied!</strong>
                          <br />
                          <small>You&apos;re joining with referral code: <strong>{referralCode}</strong></small>
                        </div>
                      </div>
                    </div>
                  )}

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
                      className={`form-control rounded-4 ${phoneError ? 'is-invalid' : ''}`}
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      maxLength="10"
                      placeholder="Enter 10-digit phone number"
                      style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        backdropFilter: 'blur(20px)',
                        color: 'white'
                      }}
                    />
                    {phoneError && (
                      <div className="invalid-feedback text-danger">
                        {phoneError}
                      </div>
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
                    disabled={submitting}
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