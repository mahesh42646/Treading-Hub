'use client';

import React, { useState } from 'react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from './firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('✅ User signed in:', user.email);

      // The AuthContext will handle the redirect logic automatically
      // No need to manually check profile or redirect here
    } catch (error) {
      console.error('❌ Login error:', error);
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email. Please register first.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError('Failed to login. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError('');

    try {
      console.log('🚀 Opening Google login popup...');
      const provider = new GoogleAuthProvider();
      
      // Add additional scopes if needed
      provider.addScope('email');
      provider.addScope('profile');
      
      // Use popup instead of redirect
      const result = await signInWithPopup(auth, provider);
      console.log('✅ Google login successful:', result.user.email);
      
      // The AuthContext will handle the redirect logic automatically
      // No need to manually check profile or redirect here
      
    } catch (error) {
      console.error('❌ Google login error:', error);
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Login cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        setError('Popup blocked by browser. Please allow popups and try again.');
      } else {
        setError('Failed to login with Google. Please try again.');
      }
    } finally {
      setGoogleLoading(false);
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
                <h2 className="fw-bold text-white">
                  <span style={{ color: 'red', textDecoration: 'underline green' }}>Trading </span>
                  <span style={{ color: 'green', textDecoration: 'underline red' }}>Hub</span>
                </h2>
                <p className="text-white-50">Welcome back! Please login to your account.</p>
              </div>

              {/* Debug info in development */}
              {process.env.NODE_ENV === 'development' && (
                <div className="alert alert-warning rounded-4 mb-4" style={{
                  background: 'rgba(255, 193, 7, 0.1)',
                  border: '1px solid rgba(255, 193, 7, 0.3)',
                  color: '#ffc107'
                }}>
                  <div className="d-flex align-items-start">
                    <i className="bi bi-bug me-2 mt-1"></i>
                    <div>
                      <strong>Debug Mode:</strong>
                      <ul className="mb-0 mt-1">
                        <li>Check browser console for detailed logs</li>
                        <li>Look for the debug panel in bottom-right corner</li>
                        <li>If login fails, check network tab for API calls</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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

                <div className="mb-3">
                  <label htmlFor="password" className="form-label text-white">Password</label>
                  <input
                    type="password"
                    className="form-control rounded-4"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    style={{
                      background: 'rgba(60, 58, 58, 0.03)',
                      border: '1px solid rgba(124, 124, 124, 0.39)',
                      backdropFilter: 'blur(20px)',
                      color: 'white'
                    }}
                  />
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="remember" />
                    <label className="form-check-label text-white-50" htmlFor="remember">
                      Remember me
                    </label>
                  </div>
                  <Link href="/forgot-password" className="text-decoration-none text-white-50">
                    Forgot password?
                  </Link>
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
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </button>

                <div className="text-center">
                  <p className="mb-0 text-white-50">
                    Don't have an account?{' '}
                    <Link href="/register" className="text-decoration-none text-white">
                      Sign up here
                    </Link>
                  </p>
                </div>
              </form>

              <div className="mt-4">
                <div className="text-center">
                  <p className="text-white-50">Or continue with</p>
                  <div className="d-grid gap-2">
                    <button 
                      className="btn rounded-4"
                      onClick={handleGoogleLogin}
                      disabled={googleLoading}
                      style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)',
                        color: 'white'
                      }}
                    >
                      {googleLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Logging in...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-google me-2"></i>
                          Continue with Google
                        </>
                      )}
                    </button>
                    <small className="text-white-50 mt-2 d-block">
                      A popup window will open for Google authentication
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 