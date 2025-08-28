
'use client';

import React, { useState, useEffect } from 'react';
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
  const [referralCode, setReferralCode] = useState('');
  const [referrerName, setReferrerName] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Check for referral code in localStorage
    const storedReferralCode = localStorage.getItem('referralCode');
    const storedReferrerName = localStorage.getItem('referrerName');
    
    if (storedReferralCode) {
      setReferralCode(storedReferralCode);
      setReferrerName(storedReferrerName || '');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle Google login with referral
  const handleGoogleLogin = async () => {
    try {
      // Store referral info before Google login
      if (referralCode) {
        localStorage.setItem('referralCode', referralCode);
        localStorage.setItem('referrerName', referrerName);
      }
      
      // Redirect to Google login (implement your Google auth)
      // After successful Google login, the referral code will be available in localStorage
      console.log('Google login with referral:', referralCode);
    } catch (error) {
      console.error('Google login error:', error);
    }
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
        phone: formData.phone,
        referralCode: referralCode // Include referral code if available
      });

      if (!createResponse.success) {
        throw new Error('Failed to create profile');
      }

      console.log('✅ Registration completed successfully');
      
      // Clear referral data from localStorage after successful registration
      if (referralCode) {
        localStorage.removeItem('referralCode');
        localStorage.removeItem('referrerName');
      }
      
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
                  We&apos;ve sent a verification email to <strong>{formData.email}</strong>. 
                  Please check your inbox and click the verification link to continue.
                </p>
                {referralCode && (
                  <div className="alert alert-success rounded-4 mb-4" style={{
                    background: 'rgba(25, 135, 84, 0.1)',
                    border: '1px solid rgba(25, 135, 84, 0.3)',
                    color: '#198754'
                  }}>
                    <small>
                      <strong>🎉 Referral Bonus:</strong> You&apos;ve been referred by {referrerName || 'a Trading Hub member'}. 
                      Complete your profile and make your first deposit to earn your referrer a ₹200 bonus!
                    </small>
                  </div>
                )}
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
                    onClick={handleResendEmail}
                    disabled={resendingEmail}
                    className="btn btn-outline-light me-2"
                  >
                    {resendingEmail ? 'Sending...' : 'Resend Email'}
                  </button>
                  <Link href="/login" className="btn btn-light">
                    Back to Login
                  </Link>
                </div>
                {emailSent && (
                  <div className="alert alert-success mt-3 rounded-4" style={{
                    background: 'rgba(25, 135, 84, 0.1)',
                    border: '1px solid rgba(25, 135, 84, 0.3)',
                    color: '#198754'
                  }}>
                    <small>✅ Verification email sent successfully!</small>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center" style={{
      background: 'linear-gradient(135deg, #002260 0%, #110A28 100%)',
      color: 'white'
    }}>
      <div className="row w-100 justify-content-center">
        <div className="col-md-8 col-lg-6 col-xl-5">
          <div className="card border-0 rounded-4" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-body p-5">
              {/* Header */}
              <div className="text-center mb-4">
                <h2 className="fw-bold text-white mb-2">
                  <span style={{ color: 'red', textDecoration: 'underline green' }}>Trading </span> 
                  <span style={{ color: 'green', textDecoration: 'underline red' }}>Hub</span>
                </h2>
                <p className="text-white-50">Create your account to start trading</p>
                {referralCode && (
                  <div className="alert alert-success rounded-4" style={{
                    background: 'rgba(25, 135, 84, 0.1)',
                    border: '1px solid rgba(25, 135, 84, 0.3)',
                    color: '#198754'
                  }}>
                    <small>
                      <strong>🎉 Referral Bonus:</strong> You&apos;ve been invited by {referrerName || 'a Trading Hub member'}! 
                      Complete your profile and make your first deposit to earn your referrer a ₹200 bonus.
                    </small>
                  </div>
                )}
              </div>

              {/* Registration Form */}
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* Email and Password */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-white">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-control rounded-3"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: 'white'
                      }}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-white">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="form-control rounded-3"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: 'white'
                      }}
                      placeholder="Create a password"
                      required
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-white">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="form-control rounded-3"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: 'white'
                      }}
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-white">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-control rounded-3"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: 'white'
                      }}
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-white">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="form-control rounded-3"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: 'white'
                      }}
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-white">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="form-control rounded-3"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: 'white'
                      }}
                      placeholder="Enter your last name"
                      required
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-white">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="form-select rounded-3"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: 'white'
                      }}
                      required
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-white">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="form-control rounded-3"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: 'white'
                      }}
                      required
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-white">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="form-control rounded-3"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: 'white'
                      }}
                      placeholder="Enter your country"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-white">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="form-control rounded-3"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: 'white'
                      }}
                      placeholder="Enter your city"
                      required
                    />
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="mb-4">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleChange}
                      className="form-check-input"
                      id="agreeToTerms"
                      required
                    />
                    <label className="form-check-label text-white-50" htmlFor="agreeToTerms">
                      I agree to the <Link href="/terms" className="text-primary">Terms and Conditions</Link> and{' '}
                      <Link href="/privacy" className="text-primary">Privacy Policy</Link>
                    </label>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="alert alert-danger rounded-4 mb-4" style={{
                    background: 'rgba(220, 53, 69, 0.1)',
                    border: '1px solid rgba(220, 53, 69, 0.3)',
                    color: '#dc3545'
                  }}>
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-100 rounded-3 py-3 mb-3"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    border: 'none',
                    fontSize: '1.1rem',
                    fontWeight: '600'
                  }}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>

                {/* Google Login */}
                <div className="text-center mb-3">
                  <div className="d-flex align-items-center justify-content-center mb-3">
                    <hr className="flex-grow-1" style={{ borderColor: 'rgba(255,255,255,0.2)' }} />
                    <span className="text-white-50 px-3">or</span>
                    <hr className="flex-grow-1" style={{ borderColor: 'rgba(255,255,255,0.2)' }} />
                  </div>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center"
                    style={{
                      borderRadius: '10px',
                      padding: '12px 24px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      background: 'transparent'
                    }}
                  >
                    <i className="bi bi-google me-2"></i>
                    Continue with Google
                  </button>
                </div>

                {/* Login Link */}
                <div className="text-center">
                  <span className="text-white-50">Already have an account? </span>
                  <Link href="/login" className="text-primary fw-bold">
                    Login here
                  </Link>
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