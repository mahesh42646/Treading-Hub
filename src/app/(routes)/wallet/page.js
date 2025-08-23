'use client';

import React, { useState } from 'react';
import Header from '../../user/components/Header';
import Footer from '../../user/components/Footer';
import Sidebar from '../../user/components/Sidebar';

export default function Wallet() {
  const [activeTab, setActiveTab] = useState('overview');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');

  const walletData = {
    balance: 2547.89,
    currency: 'USD',
    totalDeposits: 5000,
    totalWithdrawals: 2452.11,
    pendingWithdrawals: 150
  };

  const transactions = [
    {
      id: 1,
      type: 'deposit',
      amount: 500,
      description: 'Plan purchase - Professional',
      date: '2024-01-15',
      status: 'completed'
    },
    {
      id: 2,
      type: 'withdrawal',
      amount: -250,
      description: 'Profit withdrawal',
      date: '2024-01-10',
      status: 'completed'
    },
    {
      id: 3,
      type: 'profit',
      amount: 150,
      description: 'Trading profit',
      date: '2024-01-08',
      status: 'completed'
    },
    {
      id: 4,
      type: 'withdrawal',
      amount: -100,
      description: 'Withdrawal request',
      date: '2024-01-05',
      status: 'pending'
    }
  ];

  const handleWithdraw = (e) => {
    e.preventDefault();
    if (withdrawAmount && parseFloat(withdrawAmount) <= walletData.balance) {
      alert(`Withdrawal request submitted for $${withdrawAmount}`);
      setWithdrawAmount('');
    } else {
      alert('Invalid withdrawal amount');
    }
  };

  const handleDeposit = (e) => {
    e.preventDefault();
    if (depositAmount) {
      alert(`Deposit initiated for $${depositAmount}`);
      setDepositAmount('');
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return 'bi-arrow-down-circle text-success';
      case 'withdrawal':
        return 'bi-arrow-up-circle text-danger';
      case 'profit':
        return 'bi-graph-up text-success';
      default:
        return 'bi-circle text-muted';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return 'badge bg-success';
      case 'pending':
        return 'badge bg-warning';
      case 'failed':
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  };

  return (
    <div className="min-vh-100 d-flex">
      <Sidebar />
      
      <div className="flex-grow-1">
        <Header />
        
        <div className="container-fluid py-4">
          <div className="row">
            <div className="col-12">
              <h2 className="mb-4">Wallet</h2>

              {/* Wallet Overview Cards */}
              <div className="row mb-4">
                <div className="col-md-3 mb-3">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                          <i className="bi bi-wallet2 text-primary fs-4"></i>
                        </div>
                        <div>
                          <h6 className="mb-1">Available Balance</h6>
                          <h4 className="mb-0 text-primary">${walletData.balance.toLocaleString()}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-3 mb-3">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3">
                          <i className="bi bi-arrow-down-circle text-success fs-4"></i>
                        </div>
                        <div>
                          <h6 className="mb-1">Total Deposits</h6>
                          <h4 className="mb-0 text-success">${walletData.totalDeposits.toLocaleString()}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-3 mb-3">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="bg-danger bg-opacity-10 rounded-circle p-3 me-3">
                          <i className="bi bi-arrow-up-circle text-danger fs-4"></i>
                        </div>
                        <div>
                          <h6 className="mb-1">Total Withdrawals</h6>
                          <h4 className="mb-0 text-danger">${walletData.totalWithdrawals.toLocaleString()}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-3 mb-3">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <div className="bg-warning bg-opacity-10 rounded-circle p-3 me-3">
                          <i className="bi bi-clock text-warning fs-4"></i>
                        </div>
                        <div>
                          <h6 className="mb-1">Pending</h6>
                          <h4 className="mb-0 text-warning">${walletData.pendingWithdrawals.toLocaleString()}</h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <ul className="nav nav-tabs mb-4" id="walletTabs" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                  >
                    Overview
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'transactions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('transactions')}
                  >
                    Transactions
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'withdraw' ? 'active' : ''}`}
                    onClick={() => setActiveTab('withdraw')}
                  >
                    Withdraw
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className={`nav-link ${activeTab === 'deposit' ? 'active' : ''}`}
                    onClick={() => setActiveTab('deposit')}
                  >
                    Deposit
                  </button>
                </li>
              </ul>

              {/* Tab Content */}
              <div className="tab-content">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="row">
                    <div className="col-lg-8">
                      <div className="card border-0 shadow-sm">
                        <div className="card-body">
                          <h5 className="mb-3">Recent Activity</h5>
                          <div className="table-responsive">
                            <table className="table">
                              <thead>
                                <tr>
                                  <th>Type</th>
                                  <th>Amount</th>
                                  <th>Description</th>
                                  <th>Date</th>
                                  <th>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {transactions.slice(0, 5).map((transaction) => (
                                  <tr key={transaction.id}>
                                    <td>
                                      <i className={`bi ${getTransactionIcon(transaction.type)} me-2`}></i>
                                      {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                                    </td>
                                    <td className={transaction.amount > 0 ? 'text-success' : 'text-danger'}>
                                      ${Math.abs(transaction.amount).toLocaleString()}
                                    </td>
                                    <td>{transaction.description}</td>
                                    <td>{transaction.date}</td>
                                    <td>
                                      <span className={getStatusBadge(transaction.status)}>
                                        {transaction.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-4">
                      <div className="card border-0 shadow-sm">
                        <div className="card-body">
                          <h5 className="mb-3">Quick Actions</h5>
                          <div className="d-grid gap-2">
                            <button 
                              className="btn btn-primary"
                              onClick={() => setActiveTab('withdraw')}
                            >
                              <i className="bi bi-arrow-up-circle me-2"></i>
                              Withdraw Funds
                            </button>
                            <button 
                              className="btn btn-outline-primary"
                              onClick={() => setActiveTab('deposit')}
                            >
                              <i className="bi bi-arrow-down-circle me-2"></i>
                              Add Funds
                            </button>
                            <button className="btn btn-outline-secondary">
                              <i className="bi bi-download me-2"></i>
                              Download Statement
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Transactions Tab */}
                {activeTab === 'transactions' && (
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <h5 className="mb-3">Transaction History</h5>
                      <div className="table-responsive">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Type</th>
                              <th>Amount</th>
                              <th>Description</th>
                              <th>Date</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {transactions.map((transaction) => (
                              <tr key={transaction.id}>
                                <td>
                                  <i className={`bi ${getTransactionIcon(transaction.type)} me-2`}></i>
                                  {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                                </td>
                                <td className={transaction.amount > 0 ? 'text-success' : 'text-danger'}>
                                  ${Math.abs(transaction.amount).toLocaleString()}
                                </td>
                                <td>{transaction.description}</td>
                                <td>{transaction.date}</td>
                                <td>
                                  <span className={getStatusBadge(transaction.status)}>
                                    {transaction.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Withdraw Tab */}
                {activeTab === 'withdraw' && (
                  <div className="row justify-content-center">
                    <div className="col-lg-6">
                      <div className="card border-0 shadow-sm">
                        <div className="card-body p-4">
                          <h5 className="mb-4">Withdraw Funds</h5>
                          <form onSubmit={handleWithdraw}>
                            <div className="mb-3">
                              <label htmlFor="withdrawAmount" className="form-label">Amount to Withdraw</label>
                              <div className="input-group">
                                <span className="input-group-text">$</span>
                                <input
                                  type="number"
                                  className="form-control"
                                  id="withdrawAmount"
                                  value={withdrawAmount}
                                  onChange={(e) => setWithdrawAmount(e.target.value)}
                                  placeholder="Enter amount"
                                  min="10"
                                  max={walletData.balance}
                                  required
                                />
                              </div>
                              <div className="form-text">
                                Available balance: ${walletData.balance.toLocaleString()}
                              </div>
                            </div>

                            <div className="mb-3">
                              <label htmlFor="withdrawMethod" className="form-label">Withdrawal Method</label>
                              <select className="form-select" id="withdrawMethod" required>
                                <option value="">Select method</option>
                                <option value="bank">Bank Transfer</option>
                                <option value="paypal">PayPal</option>
                                <option value="crypto">Cryptocurrency</option>
                              </select>
                            </div>

                            <button type="submit" className="btn btn-primary w-100">
                              Request Withdrawal
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Deposit Tab */}
                {activeTab === 'deposit' && (
                  <div className="row justify-content-center">
                    <div className="col-lg-6">
                      <div className="card border-0 shadow-sm">
                        <div className="card-body p-4">
                          <h5 className="mb-4">Add Funds</h5>
                          <form onSubmit={handleDeposit}>
                            <div className="mb-3">
                              <label htmlFor="depositAmount" className="form-label">Amount to Deposit</label>
                              <div className="input-group">
                                <span className="input-group-text">$</span>
                                <input
                                  type="number"
                                  className="form-control"
                                  id="depositAmount"
                                  value={depositAmount}
                                  onChange={(e) => setDepositAmount(e.target.value)}
                                  placeholder="Enter amount"
                                  min="10"
                                  required
                                />
                              </div>
                            </div>

                            <div className="mb-3">
                              <label htmlFor="depositMethod" className="form-label">Payment Method</label>
                              <select className="form-select" id="depositMethod" required>
                                <option value="">Select method</option>
                                <option value="card">Credit/Debit Card</option>
                                <option value="bank">Bank Transfer</option>
                                <option value="paypal">PayPal</option>
                                <option value="crypto">Cryptocurrency</option>
                              </select>
                            </div>

                            <button type="submit" className="btn btn-primary w-100">
                              Proceed to Payment
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 