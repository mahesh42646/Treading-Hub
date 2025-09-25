
'use client';

import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from './firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { userApi } from '../../../services/api';
import { buildApiUrl } from '../../../utils/config';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
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
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for referral code in URL parameters first
    const urlReferralCode = searchParams.get('ref');
    if (urlReferralCode) {
      setReferralCode(urlReferralCode);
      console.log('✅ Referral code from URL:', urlReferralCode);
      // Store in localStorage as backup
      localStorage.setItem('referralCode', urlReferralCode);
    } else {
      // Fallback to localStorage if no URL params
      const storedReferralCode = localStorage.getItem('referralCode');
      const storedReferrerName = localStorage.getItem('referrerName');
      
      console.log('🔍 Checking for referral data in localStorage:', { storedReferralCode, storedReferrerName });
      
      if (storedReferralCode) {
        setReferralCode(storedReferralCode);
        setReferrerName(storedReferrerName || '');
        console.log('✅ Referral data loaded from localStorage:', { code: storedReferralCode, name: storedReferrerName });
      }
    }
  }, [searchParams]);

  // No validation needed per simplified rules
  const validateReferralCode = async () => {};

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
      await sendEmailVerification(currentUser, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false
      });
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
    
    // Prevent double submission
    if (loading) {
      console.log('⚠️ Form already submitting, ignoring duplicate submission');
      return;
    }
    
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

    try {
      console.log('🚀 Starting registration process...');
      
      console.log('📧 Creating Firebase user account...');
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );

      const user = userCredential.user;
      console.log('✅ Firebase user created:', user.uid);
      setCurrentUser(user); // Store user for resend functionality

      // Send email verification immediately after user creation
      console.log('📧 Sending verification email...');
      try {
        await sendEmailVerification(user, {
          url: `${window.location.origin}/login`,
          handleCodeInApp: false
        });
        console.log('✅ Verification email sent successfully');
      } catch (emailError) {
        console.error('❌ Error sending verification email:', emailError);
        setError(`Email verification failed: ${emailError.message}. Please try again or contact support.`);
        setLoading(false);
        return;
      }

      console.log('💾 Creating basic user account in backend...');
      console.log('🔍 Current referralCode state:', referralCode);
      console.log('🔍 typeof referralCode:', typeof referralCode);
      console.log('🔍 referralCode length:', referralCode?.length);
      console.log('🔍 Referral data being sent:', {
        uid: user.uid,
        email: user.email,
        emailVerified: false,
        referredBy: referralCode || null,
        actualReferralCode: referralCode,
        hasReferralCode: !!referralCode,
        referralCodeTrimmed: referralCode?.trim()
      });
      
      // Ensure we have the latest referral code from URL or localStorage
      const urlReferralCode = searchParams.get('ref');
      const storedReferralCode = localStorage.getItem('referralCode');
      const finalReferralCode = (urlReferralCode || referralCode || storedReferralCode)?.trim() || null;
      
      console.log('🎯 Determining final referral code:', {
        fromURL: urlReferralCode,
        fromState: referralCode,
        fromStorage: storedReferralCode,
        finalChoice: finalReferralCode
      });
      
      const createResponse = await userApi.create({
        uid: user.uid,
        email: user.email,
        emailVerified: false,
        referredBy: finalReferralCode,
        _debugId: Date.now() + '-' + Math.random().toString(36).substr(2, 9)
      });

      console.log('📋 Backend response:', createResponse);

      if (!createResponse.success) {
        throw new Error('Failed to create user account');
      }

      console.log('✅ User created with referral code:', referralCode || 'None');
      console.log('✅ Backend confirmed referredBy:', createResponse.user?.referredBy);

      console.log('✅ Registration completed successfully');
      
      // Set flag to prevent AuthContext from creating duplicate user
      localStorage.setItem('userCreatedInRegistration', 'true');
      
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
                <p className="text-white-50 mb-4">
                  After email verification, you&apos;ll be able to complete your profile setup with personal details.
                </p>
                {referralCode && (
                  <div className="alert alert-success rounded-4 mb-4" style={{
                    background: 'rgba(25, 135, 84, 0.1)',
                    border: '1px solid rgba(25, 135, 84, 0.3)',
                    color: '#198754'
                  }}>
                    <small>
                      <strong>🎉 Referral Bonus:</strong> You&apos;ve been referred by {referrerName || 'a Xfunding Flow member'}. 
                      Complete your profile and make your first deposit to earn your referrer 20% of your deposit amount!
                    </small>
                  </div>
                )}
                <div className="alert alert-warning rounded-4" style={{
                  background: 'rgba(255, 193, 7, 0.1)',
                  border: '1px solid rgba(255, 193, 7, 0.3)',
                  color: '#ffc107'
                }}>
                  <small>
                    <strong>Next Steps:</strong> After email verification, complete your profile setup and KYC by uploading PAN card and profile photo to activate your account.
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
        <div className="col-md-6 col-lg-4">
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
                  <div className="alert alert-success rounded-4 mb-4" style={{
                    background: 'rgba(25, 135, 84, 0.1)',
                    border: '1px solid rgba(25, 135, 84, 0.3)',
                    color: '#198754'
                  }}>
                    <div className="d-flex align-items-center">
                      <i className="bi bi-gift-fill me-2" style={{ fontSize: '1.2rem' }}></i>
                      <div>
                        <div className="fw-bold">🎉 You&apos;ve been referred!</div>
                        <small>
                          Invited by <strong>{referrerName || 'a Xfunding Flow member'}</strong>. 
                          Complete registration and get special benefits!
                        </small>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Registration Form */}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
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

                <div className="mb-3">
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

                <div className="mb-3">
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