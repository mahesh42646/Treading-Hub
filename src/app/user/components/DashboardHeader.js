'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getUserDisplayInfo, getUserAvatar } from '../../utils/userDisplay';
import NotificationDropdown from '../../components/NotificationDropdown';

const DashboardHeader = () => {
  const { user, profile, logout } = useAuth();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const headerRef = useRef(null);

  const displayInfo = getUserDisplayInfo(user, profile);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNotificationToggle = (e) => {
    e.stopPropagation();
    setShowNotifications(!showNotifications);
    if (showUserMenu) setShowUserMenu(false);
  };

  const handleUserMenuToggle = (e) => {
    e.stopPropagation();
    setShowUserMenu(!showUserMenu);
    if (showNotifications) setShowNotifications(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  return (
    <header ref={headerRef} className="position-sticky top-0" style={{ 
      zIndex: 1030,
      background: 'rgba(60, 58, 58, 0.03)',
      borderBottom: '1px solid rgba(124, 124, 124, 0.39)',
      backdropFilter: 'blur(20px)',
      boxShadow: 'inset 0px 1px 20px 1px rgba(105, 100, 100, 0.44)'
    }}>
      <div className="container-fluid">
        <div className="row align-items-center py-2">
          <div className="col-12">
            <div className="d-flex  align-items-center">
              {/* Left Section */}
              <div className="d-flex align-items-center  w-50">
                <h3 className="mb-0 text-white px-3">Dashboard</h3>
              </div>

              {/* Right Section */}
              <div className="d-flex align-items-center justify-content-end  w-50">
                {/* Notifications */}
                <div className="position-relative me-3" onClick={(e) => e.stopPropagation()}>
                  <NotificationDropdown  className="bg-dark"
                    isOpen={showNotifications}
                    onToggle={handleNotificationToggle}
                  />
                </div>

                {/* User Menu */}
                <div className="dropdown" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="btn btn-link d-flex align-items-center gap-2"
                    style={{ color: '#e2e8f0' }}
                    onClick={handleUserMenuToggle}
                  >
                    <div style={{ width: '40px', height: '40px' }}>
                      {getUserAvatar(user, profile, 40)}
                    </div>
                    <span className="d-none d-md-block text-white">{displayInfo.name}</span>
                    <i className="bi bi-chevron-down d-none d-md-block text-white"></i>
                  </button>

                  <ul className={`dropdown-menu dropdown-menu-end ${showUserMenu ? 'show' : ''}`}
                    style={{ 
                      minWidth: '200px',
                      maxWidth: 'calc(100vw - 20px)',
                      right: '0',
                      left: 'auto',
                      background: 'rgba(31, 4, 82, 0.95)',
                      border: '1px solid rgba(3, 19, 88, 0.74)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
                    }}>
                    <li>
                      <div className="dropdown-item-text" style={{ color: '#e2e8f0' }}>
                        <div className="fw-bold text-white">{displayInfo.name}</div>
                        <small className="text-white-50">{displayInfo.email}</small>
                        <small className="text-white-50 d-block">
                          {displayInfo.displayType === 'google' ? 'Google Account' :
                            displayInfo.displayType === 'profile' ? 'Verified Profile' :
                              'Email Account'}
                        </small>
                      </div>
                    </li>
                    <li><hr className="dropdown-divider" style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }} /></li>
                    <li>
                      <button className="dropdown-item d-flex align-items-center"
                        onClick={() => router.push('/dashboard/profile')}
                        style={{ 
                          transition: 'all 0.3s ease',
                          color: '#e2e8f0',
                          background: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(59, 130, 246, 0.2)';
                          e.target.style.color = '#3b82f6';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.color = '#e2e8f0';
                        }}>
                        <i className="bi bi-person me-2"></i>
                        Profile
                      </button>
                    </li>
                    <li>
                      <button className="dropdown-item d-flex align-items-center"
                        onClick={() => router.push('/dashboard/wallet')}
                        style={{ 
                          transition: 'all 0.3s ease',
                          color: '#e2e8f0',
                          background: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(59, 130, 246, 0.2)';
                          e.target.style.color = '#3b82f6';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.color = '#e2e8f0';
                        }}>
                        <i className="bi bi-wallet2 me-2"></i>
                        Wallet
                      </button>
                    </li>
                    <li>
                      <button className="dropdown-item d-flex align-items-center"
                        onClick={() => router.push('/dashboard/referral')}
                        style={{ 
                          transition: 'all 0.3s ease',
                          color: '#e2e8f0',
                          background: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(59, 130, 246, 0.2)';
                          e.target.style.color = '#3b82f6';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.color = '#e2e8f0';
                        }}>
                        <i className="bi bi-share me-2"></i>
                        Referrals
                      </button>
                    </li>
                    <li><hr className="dropdown-divider" style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }} /></li>
                    <li>
                      <button className="dropdown-item d-flex align-items-center"
                        onClick={handleLogout}
                        style={{ 
                          transition: 'all 0.3s ease',
                          color: '#ef4444',
                          background: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                          e.target.style.color = '#ef4444';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.color = '#ef4444';
                        }}>
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
