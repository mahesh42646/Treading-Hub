'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

const NotificationDropdown = ({ isOpen, onToggle }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user?.uid) {
      console.log('No user UID available for notifications');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Fetching notifications for user:', user.uid);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${user.uid}?limit=10`, {
        credentials: 'include'
      });
      
      console.log('Notification response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Notifications data received:', data);
        // Only show unread notifications in the dropdown
        const unreadNotifications = (data.notifications || []).filter(notif => !notif.isRead);
        setNotifications(unreadNotifications);
        setUnreadCount(data.unreadCount || 0);
        console.log(`Displaying ${unreadNotifications.length} unread notifications out of ${data.notifications?.length || 0} total`);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch notifications:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      setProcessing(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ uid: user.uid })
      });
      
      if (response.ok) {
        // Remove notification from list locally (since we only show unread notifications)
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
        setUnreadCount(prev => Math.max(0, prev - 1));
        console.log('Notification marked as read and removed from list');
      } else {
        console.error('Failed to mark notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      setProcessing(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      setProcessing(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ uid: user.uid })
      });
      
      if (response.ok) {
        // Clear all notifications from list
        setNotifications([]);
        setUnreadCount(0);
        console.log('All notifications marked as read and cleared from list');
      } else {
        console.error('Failed to mark all notifications as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    } finally {
      setProcessing(false);
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
    
    // Refresh notifications every 10 seconds for better real-time experience
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (isOpen) {
          onToggle(event);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  if (!user) {
    console.log('No user found, hiding notification dropdown');
    return null;
  }

  return (
    <div className="position-relative" ref={dropdownRef}>
      <button
        className="btn btn-link position-relative"
        onClick={(e) => {
          e.stopPropagation();
          onToggle(e);
        }}
        style={{ 
          padding: '8px',
          color: '#e2e8f0'
        }}
        title="Notifications"
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
          className="position-absolute end-0 mt-2 border rounded shadow-lg"
          onClick={(e) => e.stopPropagation()}
          style={{ 
            width: '350px', 
            maxWidth: 'calc(100vw - 20px)',
            maxHeight: '400px', 
            zIndex: 1050,
            top: '100%',
            right: '0',
            left: 'auto',
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}
        >
          <div className="d-flex justify-content-between align-items-center p-3" style={{
            borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
          }}>
            <h6 className="mb-0 fw-bold text-white">Notifications</h6>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-sm rounded-4"
                style={{
                  background: 'rgba(60, 58, 58, 0.03)',
                  border: '1px solid rgba(124, 124, 124, 0.39)',
                  color: '#e2e8f0'
                }}
                onClick={fetchNotifications}
                disabled={loading}
              >
                {loading ? '...' : '↻'}
              </button>
              {unreadCount > 0 && (
                <button 
                  className="btn btn-sm rounded-4"
                  style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(59, 130, 246, 0.5)',
                    color: '#3b82f6'
                  }}
                  onClick={markAllAsRead}
                  disabled={processing}
                >
                  {processing ? '...' : 'Clear All'}
                </button>
              )}
            </div>
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
                  className="p-3 d-flex align-items-start"
                  style={{
                    borderBottom: '1px solid rgba(124, 124, 124, 0.39)',
                    background: !notification.isRead ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                  }}
                >
                  <div className="me-3">
                    <span className="fs-5">{getNotificationIcon(notification.type)}</span>
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <h6 className={`mb-1 text-white ${getNotificationColor(notification.type)}`}>
                        {notification.title}
                      </h6>
                      <button
                        className="btn btn-sm p-1 rounded-4"
                        style={{ 
                          width: '24px', 
                          height: '24px', 
                          padding: '2px',
                          background: 'rgba(239, 68, 68, 0.2)',
                          border: '1px solid rgba(239, 68, 68, 0.5)',
                          color: '#ef4444'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification._id);
                        }}
                        title="Mark as read"
                        disabled={processing}
                      >
                        {processing ? (
                          <div className="spinner-border spinner-border-sm" role="status" style={{ width: '10px', height: '10px' }}>
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        ) : (
                          <i className="bi bi-x" style={{ fontSize: '12px' }}></i>
                        )}
                      </button>
                    </div>
                    <p className="mb-1 text-white-50 small">{notification.message}</p>
                    <small className="text-white-50">{formatTimeAgo(notification.createdAt)}</small>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-4">
                <i className="bi bi-bell-slash fs-1 text-white-50 mb-2"></i>
                <p className="text-white-50 mb-0">No new notifications</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
