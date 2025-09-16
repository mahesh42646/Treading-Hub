'use client';

import React, { useState, useEffect } from 'react';
import { FaEye, FaCreditCard } from 'react-icons/fa';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/transactions`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge bg-warning">Pending</span>;
      case 'completed':
        return <span className="badge bg-success">Completed</span>;
      case 'failed':
        return <span className="badge bg-danger">Failed</span>;
      case 'cancelled':
        return <span className="badge bg-secondary">Cancelled</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'deposit':
        return <span className="badge bg-success">Deposit</span>;
      case 'withdrawal':
        return <span className="badge bg-warning">Withdrawal</span>;
      case 'refund':
        return <span className="badge bg-info">Refund</span>;
      default:
        return <span className="badge bg-secondary">{type}</span>;
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Transaction Management</h1>
          <p className="text-muted mb-0">Manage user transactions and payments</p>
        </div>
        <div className="d-flex gap-2">
          <span className="badge bg-primary fs-6">
            Total: {transactions.length}
          </span>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {transactions.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Payment Method</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
                            <FaCreditCard className="text-primary" size={12} />
                          </div>
                          <div>
                            <strong>{transaction.userId?.email || 'Unknown'}</strong>
                            {transaction.transactionId && (
                       
                              <small className="text-muted">ID: {transaction.transactionId}</small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        {getTypeBadge(transaction.type)}
                      </td>
                      <td>
                        <strong>${transaction.amount}</strong>
                        <br />
                        <small className="text-muted">{transaction.currency || 'USD'}</small>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark">
                          {transaction.paymentMethod || 'N/A'}
                        </span>
                      </td>
                      <td>
                        {getStatusBadge(transaction.status)}
                      </td>
                      <td>
                        <small className="text-muted">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted">No transactions found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTransactions;
