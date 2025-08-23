'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: 'bi bi-speedometer2',
      href: '/dashboard',
    },
    {
      title: 'Profile',
      icon: 'bi bi-person',
      href: '/profile',
    },
    {
      title: 'Wallet',
      icon: 'bi bi-wallet2',
      href: '/wallet',
    },
    {
      title: 'Trading Account',
      icon: 'bi bi-graph-up',
      href: '/trading-account',
    },
    {
      title: 'Referral Program',
      icon: 'bi bi-share',
      href: '/referral',
    },
    {
      title: 'Education',
      icon: 'bi bi-book',
      href: '/education',
    },
    {
      title: 'Support',
      icon: 'bi bi-headset',
      href: '/support',
    },
    {
      title: 'Settings',
      icon: 'bi bi-gear',
      href: '/settings',
    },
  ];

  return (
    <div className="sidebar bg-dark text-light" style={{ minHeight: '100vh', width: '250px' }}>
      <div className="p-3">
        <h5 className="text-center mb-4">Treading Hub</h5>
        
        <nav className="nav flex-column">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`nav-link text-light mb-2 ${
                pathname === item.href ? 'active bg-primary' : ''
              }`}
              style={{
                borderRadius: '8px',
                transition: 'all 0.3s ease',
              }}
            >
              <i className={`${item.icon} me-2`}></i>
              {item.title}
            </Link>
          ))}
        </nav>
        
        <div className="mt-5 pt-5 border-top">
          <div className="d-flex align-items-center p-3 bg-secondary rounded">
            <div className="flex-shrink-0">
              <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" 
                   style={{ width: '40px', height: '40px' }}>
                <i className="bi bi-person text-white"></i>
              </div>
            </div>
            <div className="flex-grow-1 ms-3">
              <h6 className="mb-0">User Name</h6>
              <small className="text-muted">Premium Member</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 