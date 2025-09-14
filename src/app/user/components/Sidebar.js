'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { getUserDisplayInfo, getUserAvatar, getProfileCompletionStatus } from '../../utils/userDisplay';

const Sidebar = () => {
  const pathname = usePathname();
  const { profile, user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const displayInfo = getUserDisplayInfo(user, profile);
  const completionStatus = getProfileCompletionStatus(profile);

  const menuItems = [
    {
      title: 'Dashboard',
      icon: 'bi bi-speedometer2',
      href: '/dashboard',
    },
    {
      title: 'Profile',
      icon: 'bi bi-person',
      href: '/dashboard/profile',
    },
    {
      title: 'Wallet',
      icon: 'bi bi-wallet2',
      href: '/dashboard/wallet',
    },
    // {
    //   title: 'Trading Account',
    //   icon: 'bi bi-graph-up',
    //   href: '/dashboard/trading-account',
    // },
    {
      title: 'Referral Program',
      icon: 'bi bi-share',
      href: '/dashboard/referral',
    },
    {
      title: 'Support',
      icon: 'bi bi-headset',
      href: '/dashboard/support',
    },
  ];



  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="d-lg-none position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040 }}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`sidebar bg-dark text-light position-fixed top-0 start-0 h-100 d-flex flex-column ${
          isCollapsed ? 'collapsed' : ''
        } ${isMobileOpen ? 'mobile-open' : ''}`}
        style={{ 
          minHeight: '100vh', 
          width: isCollapsed ? '70px' : '280px',
          background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
          zIndex: 1050,
          transition: 'all 0.3s ease',
          transform: isMobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          '@media (minWidth: 992px)': {
            transform: 'translateX(0)'
          }
        }}
      >
        {/* Top Section */}
        <div className="flex-grow-1 p-3">
          {/* Header with Toggle */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            {!isCollapsed && (
              <div className="text-center flex-grow-1">
                <h5 className="text-primary fw-bold mb-0">Trading Hub</h5>
                <small className="text-white">Professional Trading Platform</small>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="btn btn-link text-light p-0 d-none d-lg-block"
              style={{ minWidth: '30px' }}
            >
              <i className={`bi ${isCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`}></i>
            </button>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="btn btn-link text-light p-0 d-lg-none"
              style={{ minWidth: '30px' }}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          
          {/* User Profile Section */}
          {!isCollapsed ? (
            <div className="mb-4 p-3 bg-dark border border-secondary rounded-3">
              <div className="d-flex align-items-center mb-3">
                <div className="flex-shrink-0">
                  {getUserAvatar(user, profile)}
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-1 text-white">{displayInfo.name}</h6>
                  <small className="text-muted d-block">{displayInfo.displayType === 'google' ? 'Google Account' : displayInfo.displayType === 'profile' ? 'Verified Profile' : 'Email Account'}</small>
                </div>
              </div>
              <small className="text-white d-block overflow-hidden text-truncate">{displayInfo.email}</small>
              
              {/* Profile Completion */}
              <div className="mb-2 text-white">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <small className="text-white">Profile Completion</small>
                  <small className="text-white">{completionStatus.percentage}%</small>
                </div>
                <div className="progress" style={{ height: '6px' }}>
                  <div 
                    className="progress-bar bg-primary" 
                    style={{ width: `${completionStatus.percentage}%` }}
                  ></div>
                </div>
                <small className="text-muted">{completionStatus.status}</small>
              </div>

              {/* Account Status */}
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-white">Account Status</small>
                <span className={`badge ${profile?.status?.isActive ? 'bg-success' : 'bg-warning'}`}>
                  {profile?.status?.isActive ? 'Active' : 'Pending'}
                </span>
              </div>
            </div>
          ) : (
            // Collapsed user profile section
            <div className="mb-4 p-2 text-center">
              {getUserAvatar(user, profile)}
            </div>
          )}
          
          {/* Navigation Menu */}
          <nav className="nav flex-column">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={`nav-link text-light mb-2 ${
                  pathname === item.href ? 'active bg-primary' : 'hover-bg-secondary'
                }`}
                style={{
                  borderRadius: '10px',
                  transition: 'all 0.3s ease',
                  padding: '12px 16px',
                  border: 'none',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
                onClick={() => setIsMobileOpen(false)}
                title={isCollapsed ? item.title : ''}
              >
                <i className={`${item.icon} me-3`} style={{ width: '20px' }}></i>
                {!isCollapsed && item.title}
              </Link>
            ))}
          </nav>
        </div>
        
        {/* Logout Button - Fixed at Bottom */}
        <div className="p-4 border-top border-secondary">
          <button
            onClick={handleLogout}
            className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center"
            style={{
              borderRadius: '10px',
              transition: 'all 0.3s ease',
              padding: '12px 16px',
              border: '2px solid #dc3545',
              color: '#dc3545',
              background: 'transparent'
            }}
            title={isCollapsed ? 'Logout' : ''}
          >
            <i className="bi bi-box-arrow-right me-3" style={{ width: '20px' }}></i>
            {!isCollapsed && 'Logout'}
          </button>
        </div>
      </div>

      {/* Mobile Toggle Button */}
      <button
        className="btn btn-primary position-fixed top-0 start-0 m-3 d-lg-none"
        style={{ zIndex: 1060 }}
        onClick={() => setIsMobileOpen(true)}
      >
        <i className="bi bi-list"></i>
      </button>

      {/* Main Content Spacer */}
      <div 
        className="d-none d-lg-block"
        style={{ 
          width: isCollapsed ? '70px' : '280px',
          transition: 'all 0.3s ease'
        }}
      />
    </>
  );
};

export default Sidebar; 