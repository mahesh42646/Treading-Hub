'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { getUserDisplayInfo, getUserAvatar } from '../../utils/userDisplay';
import Image from 'next/image';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, logout } = useAuth();

  const displayInfo = getUserDisplayInfo(user, profile);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>

      <header className="navbar navbar-expand-lg fixed-top" style={{
        background: 'linear-gradient(135deg, #002260 0%, #110A28 100%)',
        backdropFilter: 'blur(20px)',
        padding: '0.1rem 0',
        zIndex: 1000,
        boxShadow: 'inset 0px 1px 20px 1px rgba(0, 0, 0, 0.22)'
      }}>
        <div className="container">
          {/* Logo */}
          <Link href="/" className="navbar-brand d-flex align-items-center" style={{ color: '#ffffff', textDecoration: 'none' }}>
            {/* <span className="fw-bold fs-3" style={{ color: '#ffffff' }}>
           <span style={{ color: 'red', textDecoration: 'underline green' }}>Xfunding </span> <span style={{ color: 'green', textDecoration: 'underline red' }}>Hub</span> 
          </span> */}

            <Image className="border-0" src="/logo.png" alt="Funding Flow" width={100} height={100} style={{ width: 'auto', height: '80px' }} />
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
                <Link href="/challenges" className="nav-link px-3" style={{ color: '#e2e8f0', fontWeight: '500' }}>
                  Challenges
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
              <li className="nav-item">
                <Link href="/terms/terms-of-use" className="nav-link px-3" style={{ color: '#e2e8f0', fontWeight: '500' }}>
                  Terms of Use
                </Link>
              </li>
              {/* Mobile Dashboard Link - Only visible on mobile */}
              <li className="nav-item d-lg-none pb-3">
                <Link href="/dashboard" className="nav-link px-3 d-flex align-items-center" style={{ color: '#e2e8f0', fontWeight: '500' }}>
                  <div className="me-2" style={{ width: '38px', height: '38px' }}>
                    {getUserAvatar(user, profile, 38, 38)}
                  </div> Dashboard

                </Link>
              </li>
            </ul>

            {/* Auth Buttons & Language Selector */}
            <div className="d-flex align-items-center gap-3 auth-dropdown d-none d-lg-flex">
              {user ? (
                <>
                  <div className="dropdown">
                    <button className="btn rounded-3 d-flex align-items-center" type="button" data-bs-toggle="dropdown" style={{

                      fontSize: '1.1rem',
                      color: 'white',
                      backdropFilter: 'blur(20px)',
                      fontWeight: '500'
                    }}>
                      <div className="me-2" style={{ width: '38px', height: '38px' }}>
                        {getUserAvatar(user, profile, 38, 38)}
                      </div>
                      <span className="d-none d-md-inline">{displayInfo.name}</span>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end w-100" style={{
                      background: 'rgba(28, 28, 28, 0.66)',
                      border: '1px solid rgba(124, 124, 124, 0.39)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)',
                      borderRadius: '10px'
                    }}>
                      <li>
                        <Link href="/dashboard"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px 16px',
                            color: 'white',
                            textDecoration: 'none',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.color = 'black';
                            const icon = e.currentTarget.querySelector('i');
                            if (icon) icon.style.color = 'black';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'white';
                            const icon = e.currentTarget.querySelector('i');
                            if (icon) icon.style.color = 'white';
                          }}>
                          <i className="bi bi-speedometer2" style={{ marginRight: '8px', color: 'white' }}></i>
                          Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link href="/profile"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px 16px',
                            color: 'white',
                            textDecoration: 'none',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.color = 'black';
                            const icon = e.currentTarget.querySelector('i');
                            if (icon) icon.style.color = 'black';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'white';
                            const icon = e.currentTarget.querySelector('i');
                            if (icon) icon.style.color = 'white';
                          }}>
                          <i className="bi bi-person" style={{ marginRight: '8px', color: 'white' }}></i>
                          Profile
                        </Link>
                      </li>
                      <li>
                        <Link href="/wallet"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px 16px',
                            color: 'white',
                            textDecoration: 'none',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.color = 'black';
                            const icon = e.currentTarget.querySelector('i');
                            if (icon) icon.style.color = 'black';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'white';
                            const icon = e.currentTarget.querySelector('i');
                            if (icon) icon.style.color = 'white';
                          }}>
                          <i className="bi bi-wallet2" style={{ marginRight: '8px', color: 'white' }}></i>
                          Wallet
                        </Link>
                      </li>
                      <li>
                        <Link href="/referral"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px 16px',
                            color: 'white',
                            textDecoration: 'none',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.color = 'black';
                            const icon = e.currentTarget.querySelector('i');
                            if (icon) icon.style.color = 'black';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'white';
                            const icon = e.currentTarget.querySelector('i');
                            if (icon) icon.style.color = 'white';
                          }}>
                          <i className="bi bi-share" style={{ marginRight: '8px', color: 'white' }}></i>
                          Referral
                        </Link>
                      </li>
                      <li><hr style={{ borderColor: 'rgba(124, 124, 124, 0.39)', margin: '8px 0' }} /></li>
                      <li>
                        <button onClick={handleLogout}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '8px 16px',
                            color: 'white',
                            background: 'transparent',
                            border: 'none',
                            width: '100%',
                            textAlign: 'left',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.color = 'black';
                            const icon = e.currentTarget.querySelector('i');
                            if (icon) icon.style.color = 'black';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'white';
                            const icon = e.currentTarget.querySelector('i');
                            if (icon) icon.style.color = 'white';
                          }}>
                          <i className="bi bi-box-arrow-right" style={{ marginRight: '8px', color: 'white' }}></i>
                          Logout
                        </button>
                      </li>
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
    </>
  );
} 