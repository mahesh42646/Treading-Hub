'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

const NotificationDropdown = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${user.uid}?limit=5`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ uid: user.uid })
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, isRead: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ uid: user.uid })
      });
      
      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'referral_pending':
        return '👥';
      case 'referral_completed':
        return '🎉';
      case 'transaction_deposit':
        return '💰';
      case 'transaction_withdrawal':
        return '💸';
      case 'withdrawal_approved':
        return '✅';
      case 'withdrawal_rejected':
        return '❌';
      case 'plan_purchased':
        return '📦';
      case 'plan_assigned':
        return '🎁';
      case 'plan_expiring':
        return '⏰';
      case 'plan_expired':
        return '⚠️';
      case 'trading_account_assigned':
        return '📊';
      case 'custom':
        return '📢';
      case 'system':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'referral_completed':
      case 'withdrawal_approved':
      case 'plan_purchased':
      case 'plan_assigned':
      case 'trading_account_assigned':
        return 'text-success';
      case 'withdrawal_rejected':
      case 'plan_expired':
        return 'text-danger';
      case 'plan_expiring':
        return 'text-warning';
      case 'referral_pending':
      case 'transaction_deposit':
      case 'transaction_withdrawal':
        return 'text-info';
      default:
        return 'text-muted';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(date)) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  useEffect(() => {
    fetchNotifications();
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="position-relative" ref={dropdownRef}>
      <button
        className="btn btn-link text-light position-relative"
        onClick={() => setIsOpen(!isOpen)}
        style={{ padding: '8px' }}
      >
        <i className="bi bi-bell fs-5"></i>
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          className="position-absolute end-0 mt-2 bg-white border rounded shadow-lg"
          style={{ 
            width: '350px', 
            maxHeight: '400px', 
            zIndex: 1050,
            top: '100%'
          }}
        >
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
            <h6 className="mb-0 fw-bold">Notifications</h6>
            {unreadCount > 0 && (
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={markAllAsRead}
              >
                Mark all read
              </button>
            )}
          </div>

          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {loading ? (
              <div className="text-center p-3">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-3 border-bottom cursor-pointer ${
                    !notification.isRead ? 'bg-light' : ''
                  }`}
                  onClick={() => !notification.isRead && markAsRead(notification._id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-start">
                    <div className="me-3">
                      <span className="fs-5">{getNotificationIcon(notification.type)}</span>
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start">
                        <h6 className={`mb-1 ${getNotificationColor(notification.type)}`}>
                          {notification.title}
                        </h6>
                        {!notification.isRead && (
                          <span className="badge bg-primary rounded-pill" style={{ fontSize: '8px' }}>
                            New
                          </span>
                        )}
                      </div>
                      <p className="mb-1 text-muted small">{notification.message}</p>
                      <small className="text-muted">{formatTimeAgo(notification.createdAt)}</small>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-4">
                <i className="bi bi-bell-slash fs-1 text-muted mb-2"></i>
                <p className="text-muted mb-0">No notifications yet</p>
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-2 border-top text-center">
              <a href="/dashboard/notifications" className="text-decoration-none">
                View all notifications
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
