'use client';

import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebase';
import Link from 'next/link';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false
      });
      setMessage('Password reset email sent! Check your inbox and follow the instructions to reset your password.');
    } catch (error) {
      console.error('Password reset error:', error);
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email address. Please check your email or create a new account.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many requests. Please wait a few minutes before trying again.');
      } else {
        setError('Failed to send reset email. Please check your email address and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

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
              <div className="text-center mb-4">
                <h2 className="fw-bold text-white mb-2">
                  <span style={{ color: 'red', textDecoration: 'underline green' }}>Trading </span> 
                  <span style={{ color: 'green', textDecoration: 'underline red' }}>Hub</span>
                </h2>
                <p className="text-white-50">Reset your password</p>
              </div>

              {message && (
                <div className="alert alert-success rounded-4 mb-4" style={{
                  background: 'rgba(25, 135, 84, 0.1)',
                  border: '1px solid rgba(25, 135, 84, 0.3)',
                  color: '#198754'
                }}>
                  {message}
                </div>
              )}

              {error && (
                <div className="alert alert-danger rounded-4 mb-4" style={{
                  background: 'rgba(220, 53, 69, 0.1)',
                  border: '1px solid rgba(220, 53, 69, 0.3)',
                  color: '#dc3545'
                }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label text-white">Email address</label>
                  <input
                    type="email"
                    className="form-control rounded-3"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: 'white'
                    }}
                  />
                  <div className="form-text text-white-50">
                    We&apos;ll send you a link to reset your password.
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 rounded-3 py-3 mb-3"
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                    border: 'none',
                    fontSize: '1.1rem',
                    fontWeight: '600'
                  }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>

                <div className="text-center">
                  <p className="mb-0 text-white-50">
                    Remember your password?{' '}
                    <Link href="/login" className="text-primary fw-bold">
                      Back to login
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

export default ForgotPassword; 