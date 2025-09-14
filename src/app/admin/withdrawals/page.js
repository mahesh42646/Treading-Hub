'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';

export default function AdminWithdrawals() {
  const { isAuthenticated, loading: authLoading } = useAdminAuth();
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

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchWithdrawals();
    }
  }, [filters, isAuthenticated, authLoading]);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.type) queryParams.append('type', filters.type);
      
      const response = await fetch(`/api/admin/withdrawals?${queryParams}`, {
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
  };

  const handleAction = async (withdrawalId, action) => {
    try {
      setLoading(true);
      
      let endpoint = '';
      let body = {};
      
      switch (action) {
        case 'approve':
          endpoint = `/api/admin/withdrawals/${withdrawalId}/approve`;
          body = { adminNotes: notes };
          break;
        case 'reject':
          endpoint = `/api/admin/withdrawals/${withdrawalId}/reject`;
          body = { rejectionReason: notes };
          break;
        case 'complete':
          endpoint = `/api/admin/withdrawals/${withdrawalId}/complete`;
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
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">
          <h4>Access Denied</h4>
          <p>You need to be logged in as an admin to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-1">Withdrawal Management</h2>
              <p className="text-muted mb-0">Manage user withdrawal requests</p>
            </div>
            <button 
              className="btn btn-primary"
              onClick={fetchWithdrawals}
              disabled={loading}
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
          <div className="card">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Status</label>
                  <select 
                    className="form-select"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Type</label>
                  <select 
                    className="form-select"
                    value={filters.type}
                    onChange={(e) => setFilters({...filters, type: e.target.value})}
                  >
                    <option value="">All Types</option>
                    <option value="wallet">Wallet</option>
                    <option value="referral">Referral</option>
                  </select>
                </div>
                <div className="col-md-4 d-flex align-items-end">
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => setFilters({status: '', type: ''})}
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
          <div className="card">
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : withdrawals.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-arrow-up-circle fs-1 text-muted"></i>
                  <p className="text-muted mt-3">No withdrawal requests found</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Requested</th>
                        <th>Bank Details</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawals.map((withdrawal) => (
                        <tr key={withdrawal._id}>
                          <td>
                            <div>
                              <div className="fw-bold">{withdrawal.userId?.email || 'N/A'}</div>
                              <small className="text-muted">{withdrawal.uid}</small>
                            </div>
                          </td>
                          <td>
                            <span className={getTypeBadge(withdrawal.type)}>
                              {withdrawal.type === 'wallet' ? 'Wallet' : 'Referral'}
                            </span>
                          </td>
                          <td className="fw-bold">₹{withdrawal.amount.toFixed(2)}</td>
                          <td>
                            <span className={getStatusBadge(withdrawal.status)}>
                              {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                            </span>
                          </td>
                          <td>{new Date(withdrawal.createdAt).toLocaleDateString()}</td>
                          <td>
                            {withdrawal.type === 'wallet' && withdrawal.accountDetails ? (
                              <div>
                                <div className="fw-bold">{withdrawal.accountDetails.bankName}</div>
                                <small className="text-muted">
                                  {withdrawal.accountDetails.accountHolderName}
                                </small>
                                <br />
                                <small className="text-muted">
                                  ****{withdrawal.accountDetails.accountNumber?.slice(-4)}
                                </small>
                                <br />
                                <small className="text-muted">
                                  {withdrawal.accountDetails.ifscCode}
                                </small>
                              </div>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              {withdrawal.status === 'pending' && (
                                <>
                                  <button 
                                    className="btn btn-success btn-sm"
                                    onClick={() => openModal(withdrawal, 'approve')}
                                  >
                                    <i className="bi bi-check-circle me-1"></i>
                                    Approve
                                  </button>
                                  <button 
                                    className="btn btn-danger btn-sm"
                                    onClick={() => openModal(withdrawal, 'reject')}
                                  >
                                    <i className="bi bi-x-circle me-1"></i>
                                    Reject
                                  </button>
                                </>
                              )}
                              {withdrawal.status === 'approved' && (
                                <button 
                                  className="btn btn-primary btn-sm"
                                  onClick={() => openModal(withdrawal, 'complete')}
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
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {actionType === 'approve' && 'Approve Withdrawal'}
                  {actionType === 'reject' && 'Reject Withdrawal'}
                  {actionType === 'complete' && 'Complete Withdrawal'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <strong>Withdrawal Details:</strong>
                  <ul className="list-unstyled mt-2">
                    <li><strong>User:</strong> {selectedWithdrawal.userId?.email}</li>
                    <li><strong>Amount:</strong> ₹{selectedWithdrawal.amount.toFixed(2)}</li>
                    <li><strong>Type:</strong> {selectedWithdrawal.type}</li>
                    {selectedWithdrawal.type === 'wallet' && selectedWithdrawal.accountDetails && (
                      <>
                        <li><strong>Bank:</strong> {selectedWithdrawal.accountDetails.bankName}</li>
                        <li><strong>Account:</strong> ****{selectedWithdrawal.accountDetails.accountNumber?.slice(-4)}</li>
                        <li><strong>IFSC:</strong> {selectedWithdrawal.accountDetails.ifscCode}</li>
                      </>
                    )}
                  </ul>
                </div>
                
                {(actionType === 'approve' || actionType === 'reject') && (
                  <div className="mb-3">
                    <label className="form-label">
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
                    />
                  </div>
                )}

                {actionType === 'complete' && (
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    Mark this withdrawal as completed after manually transferring the amount to the user&apos;s account.
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className={`btn ${
                    actionType === 'approve' ? 'btn-success' : 
                    actionType === 'reject' ? 'btn-danger' : 'btn-primary'
                  }`}
                  onClick={() => handleAction(selectedWithdrawal._id, actionType)}
                  disabled={loading || (actionType === 'reject' && !notes.trim())}
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
