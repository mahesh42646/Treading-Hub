'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaLock, FaEnvelope } from 'react-icons/fa';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { isAuthenticated, login } = useAdminAuth();

  // If already authenticated, redirect to admin dashboard
  if (isAuthenticated) {
    router.push('/admin');
    return null;
  }





  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);

    if (result.success) {
      router.push('/admin');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <div className="card shadow" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <h2 className="h3 fw-bold text-dark mb-2">
              Admin Login
            </h2>
            <p className="text-muted small">
              Access the admin panel
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <FaEnvelope className="text-muted" />
                </span>
                <input
                  name="email"
                  type="email"
                  required
                  className="form-control border-start-0"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <FaLock className="text-muted" />
                </span>
                <input
                  name="password"
                  type="password"
                  required
                  className="form-control border-start-0"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            {error && (
              <div className="alert alert-danger py-2 mb-3" role="alert">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-100 mb-3"
            >
              {loading ? (
                <div className="d-flex align-items-center justify-content-center">
                  <div className="spinner-border spinner-border-sm me-2" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-muted small mb-0">
              Default credentials: admin@gmail.com / admin@123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

import LoginWrapper from './LoginWrapper';

const AdminLoginPage = () => {
  return (
    <LoginWrapper>
      <AdminLogin />
    </LoginWrapper>
  );
};

export default AdminLoginPage;
