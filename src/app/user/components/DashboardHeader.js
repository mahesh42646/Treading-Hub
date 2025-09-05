'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { getUserDisplayInfo, getUserAvatar } from '../../utils/userDisplay';

const DashboardHeader = () => {
  const { user, profile, logout } = useAuth();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const displayInfo = getUserDisplayInfo(user, profile);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };



  return (
    <header className="bg-white shadow-sm border-bottom position-sticky top-0" style={{ zIndex: 1030 }}>
      <div className="container-fluid">
        <div className="row align-items-center py-3">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              {/* Left Section */}
              <div className="d-flex align-items-center">
                <h4 className="mb-0 d-none d-md-block">Dashboard</h4>
                <h5 className="mb-0 d-md-none">Dashboard</h5>
              </div>

              {/* Right Section */}
              <div className="d-flex align-items-center gap-3">
                {/* Notifications */}
                <div className="dropdown d-none d-sm-block">
                  <button
                    className="btn btn-link text-dark position-relative"
                    onClick={() => setShowNotifications(!showNotifications)}
                  >
                    <i className="bi bi-bell fs-5"></i>
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                      3
                    </span>
                  </button>
                </div>

                {/* User Menu */}
                <div className="dropdown">
                  <button
                    className="btn btn-link text-dark d-flex align-items-center gap-2"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <div style={{ width: '40px', height: '40px' }}>
                      {getUserAvatar(user, profile, 40)}
                    </div>
                    <span className="d-none d-md-block">{displayInfo.name}</span>
                    <i className="bi bi-chevron-down d-none d-md-block"></i>
                  </button>
                  
                  <ul className={`dropdown-menu dropdown-menu-end ${showUserMenu ? 'show' : ''}`} 
                      style={{ minWidth: '200px' }}>
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
