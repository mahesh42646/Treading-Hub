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
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      padding: '1rem 0',
      zIndex: 1000
    }}>
      <div className="container">
        {/* Logo */}
        <Link href="/" className="navbar-brand d-flex align-items-center" style={{ color: '#ffffff', textDecoration: 'none' }}>
          <span className="fw-bold fs-3" style={{ color: '#ffffff' }}>
          Treading Hub
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
                  <button className="btn btn-outline-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    <i className="bi bi-person-circle me-2"></i>
                    {user.displayName || user.email}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li><Link href="/profile" className="dropdown-item">Profile</Link></li>
                    <li><Link href="/wallet" className="dropdown-item">Wallet</Link></li>
                    <li><Link href="/referral" className="dropdown-item">Referral</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button onClick={handleLogout} className="dropdown-item">Logout</button></li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="btn btn-outline-light px-4" style={{
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#e2e8f0',
                  fontWeight: '500'
                }}>
                  Login
                </Link>
                <Link href="/register" className="btn px-4" style={{
                  background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: '600'
                }}>
                  Register
                </Link>
              </>
            )}
            
            {/* Language Selector */}
            <div className="dropdown">
              <button className="btn btn-outline-light dropdown-toggle btn-sm" type="button" data-bs-toggle="dropdown" style={{
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#e2e8f0',
                fontSize: '0.875rem'
              }}>
                English
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li><button className="dropdown-item">English</button></li>
                <li><button className="dropdown-item">Spanish</button></li>
                <li><button className="dropdown-item">French</button></li>
                <li><button className="dropdown-item">German</button></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 