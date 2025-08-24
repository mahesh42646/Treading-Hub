'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="navbar navbar-expand-lg fixed-top" style={{
      background: 'linear-gradient(135deg, #002260 0%, #110A28 100%)',
      backdropFilter: 'blur(20px)',
      padding: '1rem 0',
      zIndex: 1000,
      boxShadow: 'inset 0px 1px 20px 1px rgba(0, 0, 0, 0.22)'
    }}>
      <div className="container">
        {/* Logo */}
        <Link href="/" className="navbar-brand d-flex align-items-center" style={{ color: '#ffffff', textDecoration: 'none' }}>
          <span className="fw-bold fs-3" style={{ color: '#ffffff' }}>
          <span style={{ color: 'red', textDecoration: 'underline green' }}>Trading </span> <span style={{ color: 'green', textDecoration: 'underline red' }}>Hub</span> 
          </span>
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler border-0"
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{ color: '#ffffff' }}
        >
          <i className={`bi ${isMenuOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
        </button>

        {/* Navigation Menu */}
        <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav mx-auto">
            <li className="nav-item">
              <Link href="/" className="nav-link px-3" style={{ color: '#e2e8f0', fontWeight: '500' }}>
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/plans" className="nav-link px-3" style={{ color: '#e2e8f0', fontWeight: '500' }}>
                Programs
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/about" className="nav-link px-3" style={{ color: '#e2e8f0', fontWeight: '500' }}>
                About Us
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/faq" className="nav-link px-3" style={{ color: '#e2e8f0', fontWeight: '500' }}>
                FAQ
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/contact" className="nav-link px-3" style={{ color: '#e2e8f0', fontWeight: '500' }}>
                Contact Us
              </Link>
            </li>
          </ul>

          {/* Auth Buttons & Language Selector */}
          <div className="d-flex align-items-center gap-3">
            {user ? (
              <>
                <div className="dropdown">
                  <button className="btn btn-outline-light dropdown-toggle rounded-3" type="button" data-bs-toggle="dropdown" style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    fontSize: '1.1rem',
                    color: 'white',
                    backdropFilter: 'blur(20px)', 
                    boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)',
                    fontWeight: '500'
                  }}>
                    <i className="bi bi-person-circle me-2"></i>
                    Profile
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end" style={{
                    background: 'rgba(60, 58, 58, 0.95)',
                    border: '1px solid rgba(124, 124, 124, 0.39)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
                  }}>
                    <li><Link href="/dashboard" className="dropdown-item text-white">Dashboard</Link></li>
                    <li><Link href="/profile" className="dropdown-item text-white">Profile</Link></li>
                    <li><Link href="/wallet" className="dropdown-item text-white">Wallet</Link></li>
                    <li><Link href="/referral" className="dropdown-item text-white">Referral</Link></li>
                    <li><hr className="dropdown-divider" style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }} /></li>
                    <li><button onClick={handleLogout} className="dropdown-item text-white">Logout</button></li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-outline-light px-4 rounded-3" style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  fontSize: '1.1rem',
                  color: 'white',
                  backdropFilter: 'blur(20px)', boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)',
                  fontWeight: '500'
                }}>
                  Login
                </Link>
                <Link href="/register" className="btn px-4 rounded-3" style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  fontSize: '1.1rem',
                  color: 'white',
                  backdropFilter: 'blur(20px)', boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)',
                  fontWeight: '600'
                }}>
                  Register
                </Link>
              </>
            )}
            
           
          </div>
        </div>
      </div>
    </header>
  );
} 