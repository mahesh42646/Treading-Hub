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
    {
      title: 'Transactions',
      icon: 'bi bi-receipt',
      href: '/dashboard/transactions',
    },
    {
      title: 'Challenges',
      icon: 'bi bi-trophy',
      href: '/dashboard/challenges',
    },
    {
      title: 'Trading Account',
      icon: 'bi bi-graph-up',
      href: '/dashboard/trading-account',
    },
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
          background: 'linear-gradient(135deg, #002260 0%, #110A28 100%)',
          backdropFilter: 'blur(20px)',
          boxShadow: 'inset 0px 1px 20px 1px rgba(0, 0, 0, 0.22)',
          borderRight: '1px solid rgba(124, 124, 124, 0.39)',
          zIndex: 1050,
          transition: 'all 0.3s ease',
          transform: window.innerWidth < 992 ? (isMobileOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)'
        }}
      >
        {/* Top Section */}
        <div className="flex-grow-1 p-3 overflow-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
          {/* Header with Toggle */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            {!isCollapsed && (
              <div className="text-center flex-grow-1">
                <h5 className="text-primary fw-bold mb-0">Xfunding Flow</h5>
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
              className="btn btn-link text-light p-0 d-lg-none position-absolute"
              style={{ 
                minWidth: '30px',
                top: '15px',
                right: '15px',
                zIndex: 1060
              }}
            >
              <i className="bi bi-x-lg"></i>  
            </button>
          </div>
          
          {/* User Profile Section */}
          {!isCollapsed ? (
            <div className="mb-4 p-3 rounded-4" style={{
              background: 'rgba(60, 58, 58, 0.03)',
              border: '1px solid rgba(124, 124, 124, 0.39)',
              backdropFilter: 'blur(20px)',
              boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
            }}>
              <div className="d-flex align-items-center mb-3">
                <div className="flex-shrink-0">
                  {getUserAvatar(user, profile)}
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-1 text-white">{displayInfo.name}</h6>
                  <small className="text-white-50 d-block">{displayInfo.displayType === 'google' ? 'Google Account' : displayInfo.displayType === 'profile' ? 'Verified Profile' : 'Email Account'}</small>
                </div>
              </div>
              <small className="text-white-50 d-block overflow-hidden text-truncate">{displayInfo.email}</small>
              
              {/* Profile Completion */}
              <div className="mb-2 text-white">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <small className="text-white">Profile Completion</small>
                  <small className="text-white">{completionStatus.percentage}%</small>
                </div>
                <div className="progress" style={{ height: '6px', background: 'rgba(60, 58, 58, 0.03)' }}>
                  <div 
                    className="progress-bar" 
                    style={{ 
                      width: `${completionStatus.percentage}%`,
                      background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)'
                    }}
                  ></div>
                </div>
                <small className="text-white-50">{completionStatus.status}</small>
              </div>

              {/* Account Status */}
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-white">Account Status</small>
                <span className="badge rounded-4" style={{
                  background: profile?.status?.isActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                  border: `1px solid ${profile?.status?.isActive ? 'rgba(34, 197, 94, 0.5)' : 'rgba(251, 191, 36, 0.5)'}`,
                  color: profile?.status?.isActive ? '#22c55e' : '#fbbf24'
                }}>
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
                  pathname === item.href ? 'active' : ''
                }`}
                style={{
                  borderRadius: '10px',
                  transition: 'all 0.3s ease',
                  padding: '12px 16px',
                  border: 'none',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  background: pathname === item.href ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                  borderLeft: pathname === item.href ? '3px solid #3b82f6' : '3px solid transparent',
                  color: pathname === item.href ? '#3b82f6' : '#e2e8f0'
                }}
                onClick={() => setIsMobileOpen(false)}
                title={isCollapsed ? item.title : ''}
                onMouseEnter={(e) => {
                  if (pathname !== item.href) {
                    e.target.style.background = 'rgba(60, 58, 58, 0.03)';
                    e.target.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (pathname !== item.href) {
                    e.target.style.background = 'transparent';
                    e.target.style.color = '#e2e8f0';
                  }
                }}
              >
                <i className={`${item.icon} me-3`} style={{ width: '20px' }}></i>
                {!isCollapsed && item.title}
              </Link>
            ))}
          </nav>
        </div>
        
        {/* Logout Button - Fixed at Bottom */}
        <div className="p-4" style={{ borderTop: '1px solid rgba(124, 124, 124, 0.39)' }}>
          <button
            onClick={handleLogout}
            className="btn w-100 d-flex align-items-center justify-content-center"
            style={{
              borderRadius: '10px',
              transition: 'all 0.3s ease',
              padding: '12px 16px',
              background: 'rgba(220, 53, 69, 0.1)',
              border: '1px solid rgba(220, 53, 69, 0.3)',
              color: '#dc3545',
              backdropFilter: 'blur(20px)',
              boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
            }}
            title={isCollapsed ? 'Logout' : ''}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(220, 53, 69, 0.2)';
              e.target.style.borderColor = 'rgba(220, 53, 69, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(220, 53, 69, 0.1)';
              e.target.style.borderColor = 'rgba(220, 53, 69, 0.3)';
            }}
          >
            <i className="bi bi-box-arrow-right me-3" style={{ width: '20px' }}></i>
            {!isCollapsed && 'Logout'}
          </button>
        </div>
      </div>

      {/* Mobile Toggle Button */}
      {!isMobileOpen && (
        <button
          className="btn btn-primary position-fixed d-lg-none"
          style={{ 
            zIndex: 1060,
            top: '15px',
            left: '15px',
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
          }}
          onClick={() => setIsMobileOpen(true)}
        >
          <i className="bi bi-list fs-5"></i>
        </button>
        
      )}

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