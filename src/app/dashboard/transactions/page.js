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
        return 'text-white';
      default:
        return 'text-white';
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { text: 'Pending', bg: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.5)' },
      'completed': { text: 'Completed', bg: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.5)' },
      'failed': { text: 'Failed', bg: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.5)' },
      'cancelled': { text: 'Cancelled', bg: 'rgba(124, 124, 124, 0.2)', color: '#9ca3af', border: '1px solid rgba(124, 124, 124, 0.5)' },
      'rejected': { text: 'Rejected', bg: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.5)' }
    };
    
    const config = statusConfig[status] || { text: 'Unknown', bg: 'rgba(124, 124, 124, 0.2)', color: '#9ca3af', border: '1px solid rgba(124, 124, 124, 0.5)' };
    return <span className="badge" style={{ background: config.bg, color: config.color, border: config.border }}>{config.text}</span>;
  };

  const getSourceBadge = (source) => {
    const sourceConfig = {
      'razorpay': { text: 'Razorpay', bg: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.5)' },
      'wallet': { text: 'Wallet', bg: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.5)' },
      'referral': { text: 'Referral', bg: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.5)' },
      'admin': { text: 'Admin', bg: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.5)' },
      'trading': { text: 'Trading', bg: 'rgba(147, 51, 234, 0.2)', color: '#9333ea', border: '1px solid rgba(147, 51, 234, 0.5)' },
      'plan_purchase': { text: 'Plan Purchase', bg: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.5)' },
      'withdrawal': { text: 'Withdrawal', bg: 'rgba(124, 124, 124, 0.2)', color: '#9ca3af', border: '1px solid rgba(124, 124, 124, 0.5)' },
      'system': { text: 'System', bg: 'rgba(30, 30, 30, 0.8)', color: '#e2e8f0', border: '1px solid rgba(124, 124, 124, 0.5)' }
    };
    
    const config = sourceConfig[source] || { text: 'Unknown', bg: 'rgba(124, 124, 124, 0.2)', color: '#9ca3af', border: '1px solid rgba(124, 124, 124, 0.5)' };
    return <span className="badge" style={{ background: config.bg, color: config.color, border: config.border }}>{config.text}</span>;
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
          <h2 className="fw-bold mb-3 text-white">Transaction History</h2>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card border-0 h-100" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-body text-center">
              <div className="text-success mb-2">
                <i className="bi bi-arrow-down-circle fs-1"></i>
              </div>
              <h4 className="text-success text-white">₹{summary.totalDeposits.toFixed(2)}</h4>
              <small className="text-white-50">Total Deposits</small>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-0 h-100" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-body text-center">
              <div className="text-danger mb-2">
                <i className="bi bi-arrow-up-circle fs-1"></i>
              </div>
              <h4 className="text-danger text-white">₹{summary.totalWithdrawals.toFixed(2)}</h4>
              <small className="text-white-50">Total Withdrawals</small>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-0 h-100" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-body text-center">
              <div className="text-warning mb-2">
                <i className="bi bi-gift fs-1"></i>
              </div>
              <h4 className="text-warning text-white">₹{summary.totalBonuses.toFixed(2)}</h4>
              <small className="text-white-50">Total Bonuses</small>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="card border-0 h-100" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-body text-center">
              <div className="text-info mb-2">
                <i className="bi bi-bag fs-1"></i>
              </div>
              <h4 className="text-info text-white">₹{summary.totalPurchases.toFixed(2)}</h4>
              <small className="text-white-50">Total Purchases</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-body" style={{ color: '#e2e8f0' }}>
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label text-white">Transaction Type</label>
                  <select 
                    className="form-select rounded-4"
                    style={{
                      background: 'rgba(60, 58, 58, 0.03)',
                      border: '1px solid rgba(124, 124, 124, 0.39)',
                      color: '#e2e8f0'
                    }}
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
                  <label className="form-label text-white">Status</label>
                  <select 
                    className="form-select rounded-4"
                    style={{
                      background: 'rgba(60, 58, 58, 0.03)',
                      border: '1px solid rgba(124, 124, 124, 0.39)',
                      color: '#e2e8f0'
                    }}
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
                  <label className="form-label text-white">Category</label>
                  <select 
                    className="form-select rounded-4"
                    style={{
                      background: 'rgba(60, 58, 58, 0.03)',
                      border: '1px solid rgba(124, 124, 124, 0.39)',
                      color: '#e2e8f0'
                    }}
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
                    className="btn rounded-4"
                    style={{
                      background: 'rgba(60, 58, 58, 0.03)',
                      border: '1px solid rgba(124, 124, 124, 0.39)',
                      color: '#e2e8f0'
                    }}
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
          <div className="card border-0" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-body" style={{ color: '#e2e8f0' }}>
              {transactions.length > 0 ? (
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
                        <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Type</th>
                        <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Amount</th>
                        <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Description</th>
                        <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Source</th>
                        <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Status</th>
                        <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Balance After</th>
                        <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Date</th>
                      </tr>
                    </thead>
                    <tbody style={{ background: 'transparent' }}>
                      {transactions.map((transaction) => (
                        <tr key={transaction._id} style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
                        }}>
                          <td style={{ background: 'transparent' }}>
                            <div className="d-flex align-items-center">
                              <span className="me-2">{getTypeIcon(transaction.type)}</span>
                              <span className="text-capitalize text-white">{transaction.type.replace('_', ' ')}</span>
                            </div>
                          </td>
                          <td style={{ background: 'transparent' }}>
                            <span className={`fw-bold ${getTypeColor(transaction.type)}`}>
                              {formatAmount(transaction.amount, transaction.type)}
                            </span>
                          </td>
                          <td style={{ background: 'transparent' }}>
                            <div>
                              <div className="text-white">{transaction.description}</div>
                              {transaction.metadata?.planName && (
                                <small className="text-white-50">Plan: {transaction.metadata.planName}</small>
                              )}
                              {transaction.metadata?.referredUserEmail && (
                                <small className="text-white-50">From: {transaction.metadata.referredUserEmail}</small>
                              )}
                            </div>
                          </td>
                          <td style={{ background: 'transparent' }}>{getSourceBadge(transaction.source)}</td>
                          <td style={{ background: 'transparent' }}>{getStatusBadge(transaction.status)}</td>
                          <td className="text-white" style={{ background: 'transparent' }}>₹{transaction.balanceAfter?.toFixed(2) || 'N/A'}</td>
                          <td style={{ background: 'transparent' }}>
                            <div>
                              <div className="text-white">{new Date(transaction.createdAt).toLocaleDateString()}</div>
                              <small className="text-white-50">
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
                  <i className="bi bi-receipt fs-1 text-white-50 mb-3"></i>
                  <h5 className="text-white-50">No transactions found</h5>
                  <p className="text-white-50">Your transaction history will appear here</p>
                </div>
              )}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <nav className="mt-4">
                  <ul className="pagination justify-content-center">
                    <li className={`page-item ${pagination.current === 1 ? 'disabled' : ''}`}>
                      <button 
                        className="page-link rounded-4"
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: '#e2e8f0'
                        }}
                        onClick={() => fetchTransactions(pagination.current - 1)}
                        disabled={pagination.current === 1}
                      >
                        Previous
                      </button>
                    </li>
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                      <li key={page} className={`page-item ${pagination.current === page ? 'active' : ''}`}>
                        <button 
                          className="page-link rounded-4"
                          style={{
                            background: pagination.current === page ? 'rgba(59, 130, 246, 0.2)' : 'rgba(60, 58, 58, 0.03)',
                            border: '1px solid rgba(124, 124, 124, 0.39)',
                            color: pagination.current === page ? '#3b82f6' : '#e2e8f0'
                          }}
                          onClick={() => fetchTransactions(page)}
                        >
                          {page}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${pagination.current === pagination.pages ? 'disabled' : ''}`}>
                      <button 
                        className="page-link rounded-4"
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: '#e2e8f0'
                        }}
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
