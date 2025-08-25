
'use client';

import React, { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from './firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { userApi } from '../../../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    country: '',
    city: '',
    phone: '',
    agreeToTerms: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle resend email verification
  const handleResendEmail = async () => {
    if (!currentUser) {
      setError('No user found. Please try registering again.');
      return;
    }
    
    setResendingEmail(true);
    setError('');
    
    try {
      console.log('📧 Resending verification email to:', currentUser.email);
      await sendEmailVerification(currentUser);
      console.log('✅ Verification email resent successfully');
      setEmailSent(true);
      setTimeout(() => setEmailSent(false), 3000); // Hide success message after 3 seconds
    } catch (error) {
      console.error('❌ Error resending verification email:', error);
      if (error.code === 'auth/too-many-requests') {
        setError('Too many requests. Please wait a few minutes before trying again.');
      } else if (error.code === 'auth/user-not-found') {
        setError('User not found. Please try registering again.');
      } else {
        setError(`Failed to resend verification email: ${error.message}. Please try again.`);
      }
    } finally {
      setResendingEmail(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!formData.agreeToTerms) {
      setError('Please agree to the terms and conditions');
      setLoading(false);
      return;
    }

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'gender', 'dateOfBirth', 'country', 'city', 'phone'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        setLoading(false);
        return;
      }
    }

    try {
      console.log('🚀 Starting registration process...');
      
      // First check if phone number already exists using API service
      const phoneCheckData = await userApi.checkPhone(formData.phone);
      
      if (phoneCheckData.exists) {
        setError('An account with this phone number already exists. Please use a different phone number or login with existing account.');
        setLoading(false);
        return;
      }

      console.log('📧 Creating Firebase user account...');
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );

      const user = userCredential.user;
      console.log('✅ Firebase user created:', user.uid);
      setCurrentUser(user); // Store user for resend functionality

      // Send email verification
      console.log('📧 Sending verification email...');
      try {
        await sendEmailVerification(user);
        console.log('✅ Verification email sent successfully');
      } catch (emailError) {
        console.error('❌ Error sending verification email:', emailError);
        setError(`Email verification failed: ${emailError.message}. Please try again or contact support.`);
        setLoading(false);
        return;
      }

      console.log('💾 Creating user profile in backend...');
      // Create user with profile data in backend using API service
      const createResponse = await userApi.createWithProfile({
        uid: user.uid,
        email: user.email,
        emailVerified: false,
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        country: formData.country,
        city: formData.city,
        phone: formData.phone
      });

      if (!createResponse.success) {
        throw new Error('Failed to create profile');
      }

      console.log('✅ Registration completed successfully');
      setEmailSent(true);
    } catch (error) {
      console.error('❌ Registration error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Please login instead.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters long.');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError(`Registration failed: ${error.message}. Please try again.`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center" style={{
        background: 'linear-gradient(135deg, #002260 0%, #110A28 100%)',
        color: 'white'
      }}>
        <div className="row w-100 justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card border-0 rounded-4" style={{
              background: 'rgba(60, 58, 58, 0.03)',
              border: '1px solid rgba(124, 124, 124, 0.39)',
              backdropFilter: 'blur(20px)',
              boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
            }}>
              <div className="card-body p-5 text-center">
                <div className="mb-4">
                  <i className="bi bi-envelope-check text-success" style={{ fontSize: '3rem' }}></i>
                </div>
                <h3 className="fw-bold text-white mb-3">Verify Your Email</h3>
                <p className="text-white-50 mb-4">
                  We've sent a verification email to <strong>{formData.email}</strong>. 
                  Please check your inbox and click the verification link to continue.
                </p>
                <div className="alert alert-warning rounded-4" style={{
                  background: 'rgba(255, 193, 7, 0.1)',
                  border: '1px solid rgba(255, 193, 7, 0.3)',
                  color: '#ffc107'
                }}>
                  <small>
                    <strong>KYC Pending:</strong> After email verification, complete KYC by uploading PAN card and profile photo to activate your account.
                  </small>
                </div>
                <div className="mt-4">
                  <button 
                    className="btn rounded-4 me-2"
                    onClick={handleResendEmail}
                    disabled={resendingEmail}
                    style={{
                      background: 'rgba(60, 58, 58, 0.03)',
                      border: '1px solid rgba(124, 124, 124, 0.39)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)',
                      color: 'white'
                    }}
                  >
                    {resendingEmail ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Resending...
                      </>
                    ) : (
                      'Resend Email'
                    )}
                  </button>
                  <Link href="/login" className="btn rounded-4" style={{
                    background: 'rgba(60, 58, 58, 0.03)',
                    border: '1px solid rgba(124, 124, 124, 0.39)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)',
                    color: 'white',
                    textDecoration: 'none'
                  }}>
                    Back to Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center py-5" style={{
      background: 'linear-gradient(135deg, #002260 0%, #110A28 100%)',
      color: 'white'
    }}>
      <div className="row w-100 justify-content-center">
        <div className="col-md-10 col-lg-8">
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
                <p className="text-white-50">Create your account and start your trading journey</p>
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

              <form onSubmit={handleSubmit}>
                {/* Account Details */}
                <div className="mb-4">
                  <h5 className="text-white mb-3">Account Details</h5>
                <div className="row">
                  <div className="col-md-6 mb-3">
                      <label htmlFor="email" className="form-label text-white">Email address *</label>
                  <input
                    type="email"
                        className="form-control rounded-4"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          backdropFilter: 'blur(20px)',
                          color: 'white'
                        }}
                  />
                </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="phone" className="form-label text-white">Phone Number *</label>
                  <input
                    type="tel"
                        className="form-control rounded-4"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                        required
                    placeholder="Enter your phone number"
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
                      <label htmlFor="password" className="form-label text-white">Password *</label>
                    <input
                      type="password"
                        className="form-control rounded-4"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Create a password"
                      minLength="6"
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          backdropFilter: 'blur(20px)',
                          color: 'white'
                        }}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                      <label htmlFor="confirmPassword" className="form-label text-white">Confirm Password *</label>
                    <input
                      type="password"
                        className="form-control rounded-4"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="Confirm your password"
                      minLength="6"
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          backdropFilter: 'blur(20px)',
                          color: 'white'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="mb-4">
                  <h5 className="text-white mb-3">Personal Information</h5>
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
                      <label htmlFor="country" className="form-label text-white">Country *</label>
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
                </div>

                {/* KYC Notice */}
                <div className="alert alert-info rounded-4 mb-4" style={{
                  background: 'rgba(13, 202, 240, 0.1)',
                  border: '1px solid rgba(13, 202, 240, 0.3)',
                  color: '#6bd4ff'
                }}>
                  <div className="d-flex align-items-start">
                    <i className="bi bi-info-circle me-2 mt-1"></i>
                    <div>
                      <strong>KYC Verification Required:</strong>
                      <ul className="mb-0 mt-1">
                        <li>Email verification via Firebase OTP</li>
                        <li>PAN card upload and verification</li>
                        <li>Profile photo upload</li>
                      </ul>
                      <small>Your account will be 75% complete after registration. Complete KYC to activate full features.</small>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="agreeToTerms"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      required
                    />
                    <label className="form-check-label text-white-50" htmlFor="agreeToTerms">
                      I agree to the{' '}
                      <Link href="/terms" className="text-decoration-none text-white">Terms & Conditions</Link>
                      {' '}and{' '}
                      <Link href="/privacy" className="text-decoration-none text-white">Privacy Policy</Link>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn w-100 mb-3 rounded-4"
                  disabled={loading}
                  style={{
                    background: 'rgba(60, 58, 58, 0.03)',
                    border: '1px solid rgba(124, 124, 124, 0.39)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)',
                    color: 'white'
                  }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>

                <div className="text-center">
                  <p className="mb-0 text-white-50">
                    Already have an account?{' '}
                    <Link href="/login" className="text-decoration-none text-white">
                      Login here
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 