'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardHeader from '../../user/components/DashboardHeader';
import { userApi } from '../../../services/api';

export default function DashboardTransactions() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalBonuses: 0,
    totalPurchases: 0
  });
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    category: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });

  const fetchTransactions = async (page = 1) => {
    try {
      if (!user?.uid) return;
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions/${user.uid}?${params}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions);
        setSummary(data.summary);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user, filters]);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'deposit':
        return '💰';
      case 'withdrawal':
        return '💸';
      case 'withdrawal_rejected':
        return '↩️';
      case 'plan_purchase':
        return '📦';
      case 'referral_bonus':
        return '🎁';
      case 'admin_credit':
        return '➕';
      case 'admin_debit':
        return '➖';
      case 'profit':
        return '📈';
      case 'loss':
        return '📉';
      case 'refund':
        return '🔄';
      case 'fee':
        return '💳';
      default:
        return '💼';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'deposit':
      case 'referral_bonus':
      case 'admin_credit':
      case 'profit':
        return 'text-success';
      case 'withdrawal':
      case 'admin_debit':
      case 'loss':
      case 'fee':
        return 'text-danger';
      case 'withdrawal_rejected':
      case 'refund':
        return 'text-warning';
      case 'plan_purchase':
        return 'text-info';
      default:
        return 'text-muted';
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { class: 'bg-warning', text: 'Pending' },
      'completed': { class: 'bg-success', text: 'Completed' },
      'failed': { class: 'bg-danger', text: 'Failed' },
      'cancelled': { class: 'bg-secondary', text: 'Cancelled' },
      'rejected': { class: 'bg-danger', text: 'Rejected' }
    };
    
    const config = statusConfig[status] || { class: 'bg-secondary', text: 'Unknown' };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const getSourceBadge = (source) => {
    const sourceConfig = {
      'razorpay': { class: 'bg-primary', text: 'Razorpay' },
      'wallet': { class: 'bg-info', text: 'Wallet' },
      'referral': { class: 'bg-success', text: 'Referral' },
      'admin': { class: 'bg-warning', text: 'Admin' },
      'trading': { class: 'bg-purple', text: 'Trading' },
      'plan_purchase': { class: 'bg-info', text: 'Plan Purchase' },
      'withdrawal': { class: 'bg-secondary', text: 'Withdrawal' },
      'system': { class: 'bg-dark', text: 'System' }
    };
    
    const config = sourceConfig[source] || { class: 'bg-secondary', text: 'Unknown' };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const formatAmount = (amount, type) => {
    const isPositive = ['deposit', 'referral_bonus', 'admin_credit', 'profit', 'withdrawal_rejected', 'refund'].includes(type);
    const prefix = isPositive ? '+' : '-';
    return `${prefix}₹${Math.abs(amount).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="container-fluid">
     
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
     
      
      <div className="row mb-4">
        <div className="col-12">
          <h2 className="fw-bold mb-3">Transaction History</h2>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="text-success mb-2">
                <i className="bi bi-arrow-down-circle fs-1"></i>
              </div>
              <h4 className="text-success">₹{summary.totalDeposits.toFixed(2)}</h4>
              <small className="text-muted">Total Deposits</small>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="text-danger mb-2">
                <i className="bi bi-arrow-up-circle fs-1"></i>
              </div>
              <h4 className="text-danger">₹{summary.totalWithdrawals.toFixed(2)}</h4>
              <small className="text-muted">Total Withdrawals</small>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="text-warning mb-2">
                <i className="bi bi-gift fs-1"></i>
              </div>
              <h4 className="text-warning">₹{summary.totalBonuses.toFixed(2)}</h4>
              <small className="text-muted">Total Bonuses</small>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body text-center">
              <div className="text-info mb-2">
                <i className="bi bi-bag fs-1"></i>
              </div>
              <h4 className="text-info">₹{summary.totalPurchases.toFixed(2)}</h4>
              <small className="text-muted">Total Purchases</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">Transaction Type</label>
                  <select 
                    className="form-select"
                    value={filters.type}
                    onChange={(e) => setFilters({...filters, type: e.target.value})}
                  >
                    <option value="">All Types</option>
                    <option value="deposit">Deposit</option>
                    <option value="withdrawal">Withdrawal</option>
                    <option value="withdrawal_rejected">Withdrawal Rejected</option>
                    <option value="plan_purchase">Plan Purchase</option>
                    <option value="referral_bonus">Referral Bonus</option>
                    <option value="admin_credit">Admin Credit</option>
                    <option value="admin_debit">Admin Debit</option>
                    <option value="profit">Profit</option>
                    <option value="loss">Loss</option>
                    <option value="refund">Refund</option>
                    <option value="fee">Fee</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Status</label>
                  <select 
                    className="form-select"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Category</label>
                  <select 
                    className="form-select"
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                  >
                    <option value="">All Categories</option>
                    <option value="deposit">Deposit</option>
                    <option value="withdrawal">Withdrawal</option>
                    <option value="bonus">Bonus</option>
                    <option value="purchase">Purchase</option>
                    <option value="fee">Fee</option>
                    <option value="adjustment">Adjustment</option>
                  </select>
                </div>
                <div className="col-md-3 d-flex align-items-end">
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => setFilters({ type: '', status: '', category: '' })}
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="row">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              {transactions.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Description</th>
                        <th>Source</th>
                        <th>Status</th>
                        <th>Balance After</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <span className="me-2">{getTypeIcon(transaction.type)}</span>
                              <span className="text-capitalize">{transaction.type.replace('_', ' ')}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`fw-bold ${getTypeColor(transaction.type)}`}>
                              {formatAmount(transaction.amount, transaction.type)}
                            </span>
                          </td>
                          <td>
                            <div>
                              <div>{transaction.description}</div>
                              {transaction.metadata?.planName && (
                                <small className="text-muted">Plan: {transaction.metadata.planName}</small>
                              )}
                              {transaction.metadata?.referredUserEmail && (
                                <small className="text-muted">From: {transaction.metadata.referredUserEmail}</small>
                              )}
                            </div>
                          </td>
                          <td>{getSourceBadge(transaction.source)}</td>
                          <td>{getStatusBadge(transaction.status)}</td>
                          <td>₹{transaction.balanceAfter?.toFixed(2) || 'N/A'}</td>
                          <td>
                            <div>
                              <div>{new Date(transaction.createdAt).toLocaleDateString()}</div>
                              <small className="text-muted">
                                {new Date(transaction.createdAt).toLocaleTimeString()}
                              </small>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-receipt fs-1 text-muted mb-3"></i>
                  <h5 className="text-muted">No transactions found</h5>
                  <p className="text-muted">Your transaction history will appear here</p>
                </div>
              )}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <nav className="mt-4">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${pagination.current === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link"
                        onClick={() => fetchTransactions(pagination.current - 1)}
                        disabled={pagination.current === 1}
                      >
                        Previous
                      </button>
                    </li>
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                      <li key={page} className={`page-item ${pagination.current === page ? 'active' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => fetchTransactions(page)}
                        >
                          {page}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${pagination.current === pagination.pages ? 'disabled' : ''}`}>
                      <button 
                        className="page-link"
                        onClick={() => fetchTransactions(pagination.current + 1)}
                        disabled={pagination.current === pagination.pages}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
