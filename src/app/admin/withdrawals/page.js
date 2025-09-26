'use client';

import React, { useState, useEffect, useCallback } from 'react';

export default function AdminWithdrawals() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState(''); // 'approve', 'reject', 'complete'
  const [notes, setNotes] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    type: ''
  });

  const checkAuth = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Admin auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const fetchWithdrawals = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.type) queryParams.append('type', filters.type);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/withdrawals?${queryParams}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setWithdrawals(data.withdrawals);
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchWithdrawals();
    }
  }, [filters, isAuthenticated, authLoading, fetchWithdrawals]);

  const handleAction = async (withdrawalId, action) => {
    try {
      setLoading(true);
      
      let endpoint = '';
      let body = {};
      
      switch (action) {
        case 'approve':
          endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/withdrawals/${withdrawalId}/approve`;
          body = { adminNotes: notes };
          break;
        case 'reject':
          endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/withdrawals/${withdrawalId}/reject`;
          body = { rejectionReason: notes };
          break;
        case 'complete':
          endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/withdrawals/${withdrawalId}/complete`;
          break;
      }

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(body)
      });

      if (response.ok) {
        alert(`Withdrawal ${action}d successfully`);
        setShowModal(false);
        setNotes('');
        fetchWithdrawals();
      } else {
        const error = await response.json();
        alert(error.message || `Failed to ${action} withdrawal`);
      }
    } catch (error) {
      console.error(`Error ${action}ing withdrawal:`, error);
      alert(`Failed to ${action} withdrawal`);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (withdrawal, action) => {
    setSelectedWithdrawal(withdrawal);
    setActionType(action);
    setNotes('');
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return 'badge bg-warning';
      case 'approved':
        return 'badge bg-info';
      case 'completed':
        return 'badge bg-success';
      case 'rejected':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  };

  const getTypeBadge = (type) => {
    return type === 'wallet' ? 'badge bg-primary' : 'badge bg-warning';
  };

  if (authLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #110A28 0%, #002260 100%)',
        color: 'white'
      }}>
        <div className="spinner-border" role="status" style={{ color: '#3b82f6' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container-fluid py-4" style={{ color: 'white' }}>
        <div className="alert" style={{
          background: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(239, 68, 68, 0.5)',
          color: '#ef4444'
        }}>
          <h4>Access Denied</h4>
          <p>You need to be logged in as an admin to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4" style={{ color: 'white' }}>
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-1 text-white">Withdrawal Management</h2>
              <p className="text-white-50 mb-0">Manage user withdrawal requests</p>
            </div>
            <button 
              className="btn"
              onClick={fetchWithdrawals}
              disabled={loading}
              style={{
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.5)',
                color: '#3b82f6',
                backdropFilter: 'blur(20px)',
                boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
              }}
            >
              <i className="bi bi-arrow-clockwise me-2"></i>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label text-white-50">Status</label>
                  <select 
                    className="form-select"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    style={{
                      background: 'rgba(60, 58, 58, 0.03)',
                      border: '1px solid rgba(124, 124, 124, 0.39)',
                      color: 'white'
                    }}
                  >
                    <option value="" style={{ background: '#1f2937', color: 'white' }}>All Status</option>
                    <option value="pending" style={{ background: '#1f2937', color: 'white' }}>Pending</option>
                    <option value="approved" style={{ background: '#1f2937', color: 'white' }}>Approved</option>
                    <option value="completed" style={{ background: '#1f2937', color: 'white' }}>Completed</option>
                    <option value="rejected" style={{ background: '#1f2937', color: 'white' }}>Rejected</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label text-white-50">Type</label>
                  <select 
                    className="form-select"
                    value={filters.type}
                    onChange={(e) => setFilters({...filters, type: e.target.value})}
                    style={{
                      background: 'rgba(60, 58, 58, 0.03)',
                      border: '1px solid rgba(124, 124, 124, 0.39)',
                      color: 'white'
                    }}
                  >
                    <option value="" style={{ background: '#1f2937', color: 'white' }}>All Types</option>
                    <option value="wallet" style={{ background: '#1f2937', color: 'white' }}>Wallet</option>
                    <option value="referral" style={{ background: '#1f2937', color: 'white' }}>Referral</option>
                  </select>
                </div>
                <div className="col-md-4 d-flex align-items-end">
                  <button 
                    className="btn"
                    onClick={() => setFilters({status: '', type: ''})}
                    style={{
                      background: 'rgba(124, 124, 124, 0.2)',
                      border: '1px solid rgba(124, 124, 124, 0.5)',
                      color: '#9ca3af'
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="row">
        <div className="col-12">
          <div className="card" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status" style={{ color: '#3b82f6' }}>
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : withdrawals.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-arrow-up-circle fs-1" style={{ color: '#9ca3af' }}></i>
                  <p className="text-white-50 mt-3">No withdrawal requests found</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover" style={{
                    background: 'rgba(60, 58, 58, 0.03)',
                    border: '1px solid rgba(124, 124, 124, 0.39)'
                  }}>
                    <thead style={{
                      background: 'rgba(30, 30, 30, 0.8)',
                      borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
                    }}>
                      <tr>
                        <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>User</th>
                        <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Type</th>
                        <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Amount</th>
                        <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Status</th>
                        <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Requested</th>
                        <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Bank Details</th>
                        <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody style={{ background: 'transparent' }}>
                      {withdrawals.map((withdrawal) => (
                        <tr key={withdrawal._id} style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
                        }}>
                          <td className="text-white" style={{ background: 'transparent' }}>
                            <div>
                              <div className="fw-bold">{withdrawal.userId?.email || 'N/A'}</div>
                              <small className="text-white-50">{withdrawal.uid}</small>
                            </div>
                          </td>
                          <td style={{ background: 'transparent' }}>
                            <span className={getTypeBadge(withdrawal.type)}>
                              {withdrawal.type === 'wallet' ? 'Wallet' : 'Referral'}
                            </span>
                          </td>
                          <td className="fw-bold text-white" style={{ background: 'transparent' }}>₹{withdrawal.amount.toFixed(2)}</td>
                          <td style={{ background: 'transparent' }}>
                            <span className={getStatusBadge(withdrawal.status)}>
                              {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                            </span>
                          </td>
                          <td className="text-white" style={{ background: 'transparent' }}>{new Date(withdrawal.createdAt).toLocaleDateString()}</td>
                          <td className="text-white" style={{ background: 'transparent' }}>
                            {withdrawal.type === 'wallet' && withdrawal.accountDetails ? (
                              <div>
                                <div className="fw-bold">{withdrawal.accountDetails.bankName}</div>
                                <small className="text-white-50">
                                  {withdrawal.accountDetails.accountHolderName}
                                </small>
                                <br />
                                <small className="text-white-50">
                                  ****{withdrawal.accountDetails.accountNumber?.slice(-4)}
                                </small>
                                <br />
                                <small className="text-white-50">
                                  {withdrawal.accountDetails.ifscCode}
                                </small>
                              </div>
                            ) : (
                              <span className="text-white-50">-</span>
                            )}
                          </td>
                          <td style={{ background: 'transparent' }}>
                            <div className="btn-group" role="group">
                              {withdrawal.status === 'pending' && (
                                <>
                                  <button 
                                    className="btn btn-sm"
                                    onClick={() => openModal(withdrawal, 'approve')}
                                    style={{
                                      background: 'rgba(16, 185, 129, 0.2)',
                                      border: '1px solid rgba(16, 185, 129, 0.5)',
                                      color: '#10b981'
                                    }}
                                  >
                                    <i className="bi bi-check-circle me-1"></i>
                                    Approve
                                  </button>
                                  <button 
                                    className="btn btn-sm"
                                    onClick={() => openModal(withdrawal, 'reject')}
                                    style={{
                                      background: 'rgba(239, 68, 68, 0.2)',
                                      border: '1px solid rgba(239, 68, 68, 0.5)',
                                      color: '#ef4444'
                                    }}
                                  >
                                    <i className="bi bi-x-circle me-1"></i>
                                    Reject
                                  </button>
                                </>
                              )}
                              {withdrawal.status === 'approved' && (
                                <button 
                                  className="btn btn-sm"
                                  onClick={() => openModal(withdrawal, 'complete')}
                                  style={{
                                    background: 'rgba(59, 130, 246, 0.2)',
                                    border: '1px solid rgba(59, 130, 246, 0.5)',
                                    color: '#3b82f6'
                                  }}
                                >
                                  <i className="bi bi-check2-all me-1"></i>
                                  Complete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {showModal && selectedWithdrawal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{
              background: 'rgba(60, 58, 58, 0.03)',
              border: '1px solid rgba(124, 124, 124, 0.39)',
              backdropFilter: 'blur(20px)',
              boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
            }}>
              <div className="modal-header" style={{
                background: 'rgba(30, 30, 30, 0.8)',
                borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
              }}>
                <h5 className="modal-title text-white">
                  {actionType === 'approve' && 'Approve Withdrawal'}
                  {actionType === 'reject' && 'Reject Withdrawal'}
                  {actionType === 'complete' && 'Complete Withdrawal'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body" style={{ color: 'white' }}>
                <div className="mb-3">
                  <strong className="text-white">Withdrawal Details:</strong>
                  <ul className="list-unstyled mt-2">
                    <li className="text-white"><strong>User:</strong> {selectedWithdrawal.userId?.email}</li>
                    <li className="text-white"><strong>Amount:</strong> ₹{selectedWithdrawal.amount.toFixed(2)}</li>
                    <li className="text-white"><strong>Type:</strong> {selectedWithdrawal.type}</li>
                    {selectedWithdrawal.type === 'wallet' && selectedWithdrawal.accountDetails && (
                      <>
                        <li className="text-white"><strong>Bank:</strong> {selectedWithdrawal.accountDetails.bankName}</li>
                        <li className="text-white"><strong>Account:</strong> ****{selectedWithdrawal.accountDetails.accountNumber?.slice(-4)}</li>
                        <li className="text-white"><strong>IFSC:</strong> {selectedWithdrawal.accountDetails.ifscCode}</li>
                      </>
                    )}
                  </ul>
                </div>
                
                {(actionType === 'approve' || actionType === 'reject') && (
                  <div className="mb-3">
                    <label className="form-label text-white-50">
                      {actionType === 'approve' ? 'Admin Notes (Optional)' : 'Rejection Reason *'}
                    </label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={
                        actionType === 'approve' 
                          ? 'Add any notes about this approval...'
                          : 'Please provide a reason for rejection...'
                      }
                      required={actionType === 'reject'}
                      style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        color: 'white'
                      }}
                    />
                  </div>
                )}

                {actionType === 'complete' && (
                  <div className="alert" style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(59, 130, 246, 0.5)',
                    color: '#3b82f6'
                  }}>
                    <i className="bi bi-info-circle me-2"></i>
                    Mark this withdrawal as completed after manually transferring the amount to the user&apos;s account.
                  </div>
                )}
              </div>
              <div className="modal-footer" style={{
                background: 'rgba(30, 30, 30, 0.8)',
                borderTop: '1px solid rgba(124, 124, 124, 0.39)'
              }}>
                <button 
                  type="button" 
                  className="btn"
                  onClick={() => setShowModal(false)}
                  style={{
                    background: 'rgba(124, 124, 124, 0.2)',
                    border: '1px solid rgba(124, 124, 124, 0.5)',
                    color: '#9ca3af'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn"
                  onClick={() => handleAction(selectedWithdrawal._id, actionType)}
                  disabled={loading || (actionType === 'reject' && !notes.trim())}
                  style={{
                    background: actionType === 'approve' ? 'rgba(16, 185, 129, 0.2)' : 
                               actionType === 'reject' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                    border: actionType === 'approve' ? '1px solid rgba(16, 185, 129, 0.5)' : 
                            actionType === 'reject' ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(59, 130, 246, 0.5)',
                    color: actionType === 'approve' ? '#10b981' : 
                           actionType === 'reject' ? '#ef4444' : '#3b82f6'
                  }}
                >
                  {loading ? 'Processing...' : 
                    actionType === 'approve' ? 'Approve' :
                    actionType === 'reject' ? 'Reject' : 'Complete'
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
