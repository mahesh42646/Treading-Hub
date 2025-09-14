'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { buildApiUrl } from '../../../utils/config';

export default function DashboardWallet() {
  const { profile, user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [walletData, setWalletData] = useState({
    walletBalance: 0.00,
    referralBalance: 0.00,
    totalDeposits: 0.00,
    totalWithdrawals: 0.00,
    totalPnl: 0.00,
    transactions: []
  });
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawType, setWithdrawType] = useState('wallet'); // 'wallet' or 'referral'
  const [loading, setLoading] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const MIN_WITHDRAWAL_AMOUNT = 500;
  const REFERRAL_BONUS_AMOUNT = 200;

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl(`/wallet/balance/${user.uid}`), {
        headers: {
          'Authorization': `Bearer ${await user.getIdToken()}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWalletData({
          walletBalance: data.walletBalance,
          referralBalance: data.referralBalance,
          totalDeposits: data.totalDeposits,
          totalWithdrawals: data.totalWithdrawals,
          totalPnl: 0, // This would come from trading data
          transactions: data.transactions
        });
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      
      // Create Razorpay order
      const orderResponse = await fetch(buildApiUrl('/wallet/razorpay-order'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          amount: parseFloat(depositAmount) * 100, // Convert to paise
          currency: 'INR'
        })
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create payment order');
      }

      const orderData = await orderResponse.json();

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Trading Hub',
        description: 'Wallet Deposit',
        order_id: orderData.id,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await fetch(buildApiUrl('/wallet/razorpay-verify'), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await user.getIdToken()}`
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            if (verifyResponse.ok) {
              const verifyData = await verifyResponse.json();
              
              // Process deposit
              const depositResponse = await fetch(buildApiUrl('/wallet/deposit'), {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${await user.getIdToken()}`
                },
                body: JSON.stringify({
                  uid: user.uid,
                  amount: verifyData.amount,
                  paymentId: response.razorpay_payment_id
                })
              });

              if (depositResponse.ok) {
                alert('Deposit successful!');
                setDepositAmount('');
                setShowDepositModal(false);
                fetchWalletData();
              } else {
                alert('Deposit processing failed');
              }
            } else {
              alert('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: profile?.personalInfo?.firstName + ' ' + profile?.personalInfo?.lastName,
          email: user?.email,
          contact: profile?.personalInfo?.phone
        },
        theme: {
          color: '#3B82F6'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Deposit error:', error);
      alert('Failed to initiate deposit');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) < MIN_WITHDRAWAL_AMOUNT) {
      alert(`Minimum withdrawal amount is ₹${MIN_WITHDRAWAL_AMOUNT}`);
      return;
    }

    const maxAmount = withdrawType === 'wallet' ? walletData.walletBalance : walletData.referralBalance;
    
    if (parseFloat(withdrawAmount) > maxAmount) {
      alert(`Insufficient ${withdrawType} balance`);
      return;
    }

    // Check if user has made at least one deposit for referral withdrawal
    if (withdrawType === 'referral' && walletData.totalDeposits === 0) {
      alert('You must make at least one deposit before withdrawing referral bonus');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(buildApiUrl('/wallet/withdraw'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify({
          uid: user.uid,
          amount: parseFloat(withdrawAmount),
          type: withdrawType,
          accountDetails: {
            // You can add account details collection here
            bankName: 'Your Bank',
            accountNumber: '****1234',
            ifscCode: 'BANK0001234'
          }
        })
      });

      if (response.ok) {
        alert('Withdrawal request submitted successfully');
        setWithdrawAmount('');
        setShowWithdrawModal(false);
        fetchWalletData();
      } else {
        const error = await response.json();
        alert(error.message || 'Withdrawal failed');
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      alert('Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'deposit':
        return 'bi-arrow-down-circle text-success';
      case 'withdrawal':
        return 'bi-arrow-up-circle text-danger';
      case 'referral_bonus':
        return 'bi-gift text-warning';
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
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h2 className="fw-bold mb-1">Wallet</h2>
              <p className="text-muted mb-0">Manage your funds and view transaction history</p>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <button 
                className="btn btn-primary"
                onClick={() => setShowDepositModal(true)}
                disabled={loading}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Deposit
              </button>
              <button 
                className="btn btn-outline-primary"
                onClick={() => setShowWithdrawModal(true)}
                disabled={loading}
              >
                <i className="bi bi-arrow-up-circle me-2"></i>
                Withdraw
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Overview Cards */}
      <div className="row mb-4">
        <div className="col-xl-3 col-lg-4 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-wallet2 text-primary fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Wallet Balance</h6>
                  <h4 className="fw-bold mb-0">₹{walletData.walletBalance.toFixed(2)}</h4>
                  <small className="text-success">+₹0.00 today</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-lg-4 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-gift text-warning fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Referral Balance</h6>
                  <h4 className="fw-bold mb-0">₹{walletData.referralBalance.toFixed(2)}</h4>
                  <small className="text-muted">Earned from referrals</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-lg-4 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-success bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-arrow-down-circle text-success fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Total Deposits</h6>
                  <h4 className="fw-bold mb-0">₹{walletData.totalDeposits.toFixed(2)}</h4>
                  <small className="text-muted">All time</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-lg-4 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-danger bg-opacity-10 rounded-circle p-3">
                    <i className="bi bi-arrow-up-circle text-danger fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="text-muted mb-1">Total Withdrawals</h6>
                  <h4 className="fw-bold mb-0">₹{walletData.totalWithdrawals.toFixed(2)}</h4>
                  <small className="text-muted">All time</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0">
              <ul className="nav nav-tabs card-header-tabs">
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                  >
                    Overview
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'transactions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('transactions')}
                  >
                    Transactions
                  </button>
                </li>
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'referrals' ? 'active' : ''}`}
                    onClick={() => setActiveTab('referrals')}
                  >
                    Referral Earnings
                  </button>
                </li>
              </ul>
            </div>
            <div className="card-body">
              {activeTab === 'overview' && (
                <div className="row">
                  <div className="col-md-6 mb-4">
                    <h5 className="mb-3">Quick Actions</h5>
                    <div className="d-grid gap-3">
                      <button 
                        className="btn btn-primary"
                        onClick={() => setShowDepositModal(true)}
                      >
                        <i className="bi bi-plus-circle me-2"></i>
                        Add Money to Wallet
                      </button>
                      <button 
                        className="btn btn-outline-primary"
                        onClick={() => {
                          setWithdrawType('wallet');
                          setShowWithdrawModal(true);
                        }}
                        disabled={walletData.walletBalance < MIN_WITHDRAWAL_AMOUNT}
                      >
                        <i className="bi bi-arrow-up-circle me-2"></i>
                        Withdraw from Wallet
                      </button>
                      <button 
                        className="btn btn-outline-warning"
                        onClick={() => {
                          setWithdrawType('referral');
                          setShowWithdrawModal(true);
                        }}
                        disabled={walletData.referralBalance < MIN_WITHDRAWAL_AMOUNT || walletData.totalDeposits === 0}
                      >
                        <i className="bi bi-gift me-2"></i>
                        Withdraw Referral Bonus
                      </button>
                    </div>
                  </div>
                  <div className="col-md-6 mb-4">
                    <h5 className="mb-3">Withdrawal Rules</h5>
                    <div className="alert alert-info">
                      <ul className="mb-0">
                        <li>Minimum withdrawal amount: ₹{MIN_WITHDRAWAL_AMOUNT}</li>
                        <li>Referral bonus can only be withdrawn after making at least one deposit</li>
                        <li>Withdrawal requests are processed within 24-48 hours</li>
                        <li>Referral bonus: ₹{REFERRAL_BONUS_AMOUNT} per successful referral</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'transactions' && (
                <div>
                  <h5 className="mb-3">Transaction History</h5>
                  {walletData.transactions.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-receipt fs-1 text-muted"></i>
                      <p className="text-muted mt-3">No transactions yet</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
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
                          {walletData.transactions.map((transaction) => (
                            <tr key={transaction.id}>
                              <td>
                                <i className={`bi ${getTransactionIcon(transaction.type)} me-2`}></i>
                                {transaction.type.replace('_', ' ').toUpperCase()}
                              </td>
                              <td className="fw-bold">
                                ₹{transaction.amount.toFixed(2)}
                              </td>
                              <td>{transaction.description}</td>
                              <td>{new Date(transaction.date).toLocaleDateString()}</td>
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
                  )}
                </div>
              )}

              {activeTab === 'referrals' && (
                <div>
                  <h5 className="mb-3">Referral Earnings</h5>
                  <div className="alert alert-success">
                    <h6>How it works:</h6>
                    <ul className="mb-0">
                      <li>Share your referral link with friends</li>
                      <li>When they complete their profile and make their first deposit</li>
                      <li>You earn ₹{REFERRAL_BONUS_AMOUNT} as referral bonus</li>
                      <li>Referral bonus is added to your referral balance</li>
                    </ul>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <div className="card border-0 bg-light">
                        <div className="card-body text-center">
                          <h4 className="text-warning">₹{walletData.referralBalance.toFixed(2)}</h4>
                          <p className="text-muted mb-0">Total Referral Earnings</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card border-0 bg-light">
                        <div className="card-body text-center">
                          <h4 className="text-success">₹{REFERRAL_BONUS_AMOUNT}</h4>
                          <p className="text-muted mb-0">Per Referral Bonus</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Deposit to Wallet</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowDepositModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Amount (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Enter amount"
                    min="1"
                  />
                </div>
                <div className="alert alert-info">
                  <small>
                    <i className="bi bi-info-circle me-2"></i>
                    Payment will be processed securely through Razorpay
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowDepositModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleDeposit}
                  disabled={loading || !depositAmount}
                >
                  {loading ? 'Processing...' : 'Proceed to Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Withdraw from {withdrawType === 'wallet' ? 'Wallet' : 'Referral Balance'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowWithdrawModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Amount (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder={`Enter amount (min: ₹${MIN_WITHDRAWAL_AMOUNT})`}
                    min={MIN_WITHDRAWAL_AMOUNT}
                    max={withdrawType === 'wallet' ? walletData.walletBalance : walletData.referralBalance}
                  />
                  <small className="text-muted">
                    Available: ₹{withdrawType === 'wallet' ? walletData.walletBalance.toFixed(2) : walletData.referralBalance.toFixed(2)}
                  </small>
                </div>
                {withdrawType === 'referral' && walletData.totalDeposits === 0 && (
                  <div className="alert alert-warning">
                    <small>
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      You must make at least one deposit before withdrawing referral bonus
                    </small>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowWithdrawModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleWithdraw}
                  disabled={loading || !withdrawAmount || parseFloat(withdrawAmount) < MIN_WITHDRAWAL_AMOUNT}
                >
                  {loading ? 'Processing...' : 'Submit Withdrawal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
