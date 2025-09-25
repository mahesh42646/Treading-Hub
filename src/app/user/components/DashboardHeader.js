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

  const handleNotificationToggle = () => {
    setShowNotifications(!showNotifications);
    if (showUserMenu) setShowUserMenu(false);
  };

  const handleUserMenuToggle = () => {
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
    <header ref={headerRef} className="bg-white shadow-sm border-bottom position-sticky top-0" style={{ zIndex: 1030 }}>
      <div className="container-fluid">
        <div className="row align-items-center py-2">
          <div className="col-12">
            <div className="d-flex  align-items-center">
              {/* Left Section */}
              <div className="d-flex align-items-center  w-50">
                <h3 className="mb-0 ">Dashboard</h3>
              </div>

              {/* Right Section */}
              <div className="d-flex align-items-center justify-content-end  w-50">
                {/* Notifications */}
                <div className="position-relative me-3">
                  <NotificationDropdown 
                    isOpen={showNotifications}
                    onToggle={handleNotificationToggle}
                  />
                </div>

                {/* User Menu */}
                <div className="dropdown">
                  <button
                    className="btn btn-link text-dark d-flex align-items-center gap-2"
                    onClick={handleUserMenuToggle}
                  >
                    <div style={{ width: '40px', height: '40px' }}>
                      {getUserAvatar(user, profile, 40)}
                    </div>
                    <span className="d-none d-md-block">{displayInfo.name}</span>
                    <i className="bi bi-chevron-down d-none d-md-block"></i>
                  </button>

                  <ul className={`dropdown-menu dropdown-menu-end ${showUserMenu ? 'show' : ''}`}
                    style={{ 
                      minWidth: '200px',
                      maxWidth: 'calc(100vw - 20px)',
                      right: '0',
                      left: 'auto'
                    }}>
                    <li>
                      <div className="dropdown-item-text">
                        <div className="fw-bold">{displayInfo.name}</div>
                        <small className="text-muted">{displayInfo.email}</small>
                        <small className="text-muted d-block">
                          {displayInfo.displayType === 'google' ? 'Google Account' :
                            displayInfo.displayType === 'profile' ? 'Verified Profile' :
                              'Email Account'}
                        </small>
                      </div>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item d-flex align-items-center"
                        onClick={() => router.push('/dashboard/profile')}
                        style={{ transition: 'all 0.3s ease' }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#f8f9fa';
                          e.target.style.color = '#000';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.color = '#000';
                        }}>
                        <i className="bi bi-person me-2"></i>
                        Profile
                      </button>
                    </li>
                    <li>
                      <button className="dropdown-item d-flex align-items-center"
                        onClick={() => router.push('/dashboard/wallet')}
                        style={{ transition: 'all 0.3s ease' }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#f8f9fa';
                          e.target.style.color = '#000';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.color = '#000';
                        }}>
                        <i className="bi bi-wallet2 me-2"></i>
                        Wallet
                      </button>
                    </li>
                    <li>
                      <button className="dropdown-item d-flex align-items-center"
                        onClick={() => router.push('/dashboard/referral')}
                        style={{ transition: 'all 0.3s ease' }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#f8f9fa';
                          e.target.style.color = '#000';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.color = '#000';
                        }}>
                        <i className="bi bi-share me-2"></i>
                        Referrals
                      </button>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger d-flex align-items-center"
                        onClick={handleLogout}
                        style={{ transition: 'all 0.3s ease' }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#f8f9fa';
                          e.target.style.color = '#dc3545';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                          e.target.style.color = '#dc3545';
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
