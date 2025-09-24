'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  FaTachometerAlt,
  FaUsers,
  FaClipboardList,
  FaQuestionCircle,
  FaUsersCog,
  FaEnvelope,
  FaShareAlt,
  FaCreditCard,
  FaNewspaper,
  FaBlog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaMoneyBillWave,
  FaTrophy
} from 'react-icons/fa';

const AdminLayout = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();







  useEffect(() => {
    // Don't check auth for login page
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }
    
    // Check authentication status
    const checkAuth = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard`, {
          credentials: 'include'
        });
        
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          // Only redirect if not already on login page
          if (pathname !== '/admin/login') {
            router.push('/admin/login');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // Only redirect if not already on login page
        if (pathname !== '/admin/login') {
          router.push('/admin/login');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  const handleLogout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    { name: 'Dashboard', icon: FaTachometerAlt, path: '/admin' },
    { name: 'Users', icon: FaUsers, path: '/admin/users' },
    { name: 'Challenges', icon: FaTrophy, path: '/admin/challenges' },
    { name: 'Trading Accounts', icon: FaCreditCard, path: '/admin/trading-accounts' },
    { name: 'FAQs', icon: FaQuestionCircle, path: '/admin/faqs' },
    { name: 'Team', icon: FaUsersCog, path: '/admin/team' },
    { name: 'Contacts', icon: FaEnvelope, path: '/admin/contacts' },
    { name: 'Referrals', icon: FaShareAlt, path: '/admin/referrals' },
    { name: 'Transactions', icon: FaCreditCard, path: '/admin/transactions' },
    { name: 'Withdrawals', icon: FaMoneyBillWave, path: '/admin/withdrawals' },
    { name: 'Blogs', icon: FaBlog, path: '/admin/blogs' },
    { name: 'News', icon: FaNewspaper, path: '/admin/news' },
  ];



  // For login page, just render children without layout
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="d-flex" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Sidebar */}
      <div className={`bg-dark text-white ${sidebarOpen ? 'd-block' : 'd-none'} d-lg-block`} style={{ width: '250px', minHeight: '100vh' }}>
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom border-secondary">
          <h5 className="mb-0 fw-bold">Admin Panel</h5>
          <button
            onClick={() => setSidebarOpen(false)}
            className="btn btn-link text-white d-lg-none p-0"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <nav className="p-3">
          <ul className="nav flex-column">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;

              return (
                <li key={item.name} className="nav-item mb-2">
                  <Link
                    href={item.path}
                    className={`nav-link d-flex align-items-center text-decoration-none ${isActive
                        ? 'bg-primary text-white'
                        : 'text-white-50 hover-bg-secondary'
                      }`}
                    onClick={() => setSidebarOpen(false)}
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '0.375rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Icon className="me-3" size={16} />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="position-absolute bottom-0 start-0 end-0 p-3 border-top border-secondary">
          <button
            onClick={handleLogout}
            className="btn btn-outline-danger  d-flex align-items-center justify-content-center"
          >
            <FaSignOutAlt className="me-2" size={16} />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-grow-1">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-bottom p-3">
          <div className="d-flex justify-content-between align-items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="btn btn-link text-dark d-lg-none p-0"
            >
              <FaBars size={20} />
            </button>
            <div className="d-flex align-items-center">
              <span className="text-muted">Welcome, Admin</span>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
