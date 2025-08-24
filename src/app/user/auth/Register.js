
'use client';

import React, { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from './firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );

      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user);

      // Create basic user document in backend
      await fetch('http://localhost:9988/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          emailVerified: false
        }),
      });

      setEmailSent(true);
    } catch (error) {
      setError('Failed to create account. Please try again.');
      console.error('Registration error:', error);
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
                <div className="alert alert-info rounded-4" style={{
                  background: 'rgba(13, 202, 240, 0.1)',
                  border: '1px solid rgba(13, 202, 240, 0.3)',
                  color: '#6bd4ff'
                }}>
                  <small>
                    After verifying your email, you'll be redirected to complete your profile setup.
                  </small>
                </div>
                <div className="mt-4">
                  <button 
                    className="btn rounded-4 me-2"
                    onClick={() => window.location.reload()}
                    style={{
                      background: 'rgba(60, 58, 58, 0.03)',
                      border: '1px solid rgba(124, 124, 124, 0.39)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)',
                      color: 'white'
                    }}
                  >
                    Resend Email
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
                <div className="mb-3">
                  <label htmlFor="email" className="form-label text-white">Email address</label>
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

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="password" className="form-label text-white">Password</label>
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
                    <label htmlFor="confirmPassword" className="form-label text-white">Confirm Password</label>
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