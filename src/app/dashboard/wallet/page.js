'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { buildApiUrl } from '../../../utils/config';
import { api } from '../../../services/api';

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
  
  // Bank details state
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
    upiId: ''
  });
  const [savedBanks, setSavedBanks] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState('');
  const [useNewBank, setUseNewBank] = useState(false);
  const [saveBankDetails, setSaveBankDetails] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawalPage, setWithdrawalPage] = useState(1);

  const MIN_DEPOSIT_AMOUNT = 500;
  const MIN_WITHDRAWAL_AMOUNT = 500;

  useEffect(() => {
    fetchWalletData();
    fetchSavedBanks();
    fetchWithdrawals();
    
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      // Cleanup
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const fetchSavedBanks = async () => {
    try {
      // This would be an API call to get saved bank details
      // For now, using localStorage as example
      const saved = localStorage.getItem(`savedBanks_${user?.uid}`);
      if (saved) {
        setSavedBanks(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error fetching saved banks:', error);
    }
  };

  const saveBankToStorage = async (bankData) => {
    try {
      const newBank = {
        id: Date.now().toString(),
        ...bankData,
        createdAt: new Date().toISOString()
      };
      const updatedBanks = [...savedBanks, newBank];
      setSavedBanks(updatedBanks);
      localStorage.setItem(`savedBanks_${user?.uid}`, JSON.stringify(updatedBanks));
    } catch (error) {
      console.error('Error saving bank details:', error);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const data = await api.get(`/wallet/withdrawals/${user.uid}?page=${withdrawalPage}&limit=10`);
      setWithdrawals(data.withdrawals);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    }
  };

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/wallet/balance/${user.uid}`);
      setWalletData({
        walletBalance: data.walletBalance,
        referralBalance: data.referralBalance,
        totalDeposits: data.totalDeposits,
        totalWithdrawals: data.totalWithdrawals,
        totalPnl: 0, // This would come from trading data
        transactions: data.transactions
      });
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) < MIN_DEPOSIT_AMOUNT) {
      alert(`Minimum deposit amount is ₹${MIN_DEPOSIT_AMOUNT}`);
      return;
    }

    try {
      setLoading(true);
      
      // Create Razorpay order
      const orderData = await api.post('/wallet/razorpay-order', {
        amount: parseFloat(depositAmount) * 100, // Convert to paise
        currency: 'INR'
      });

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
            const verifyData = await api.post('/wallet/razorpay-verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              uid: user.uid
            });
            
            alert('Deposit successful!');
            setDepositAmount('');
            setShowDepositModal(false);
            fetchWalletData();
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

    // Validate bank details for wallet withdrawal
    if (withdrawType === 'wallet') {
      if (useNewBank) {
        if (!bankDetails.bankName || !bankDetails.accountNumber || !bankDetails.ifscCode || !bankDetails.accountHolderName) {
          alert('Please fill all required bank details');
          return;
        }
      } else if (!selectedBankId) {
        alert('Please select a bank account or add new bank details');
        return;
      }
    }

    try {
      setLoading(true);
      
      let accountDetails = {};
      
      if (withdrawType === 'wallet') {
        if (useNewBank) {
          accountDetails = bankDetails;
          // Save bank details if user opted to save
          if (saveBankDetails) {
            await saveBankToStorage(bankDetails);
          }
        } else {
          const selectedBank = savedBanks.find(bank => bank.id === selectedBankId);
          accountDetails = selectedBank;
        }
      }
      
      await api.post('/wallet/withdraw', {
        uid: user.uid,
        amount: parseFloat(withdrawAmount),
        type: withdrawType,
        accountDetails
      });

      alert('Withdrawal request submitted successfully');
      setWithdrawAmount('');
      setShowWithdrawModal(false);
      setBankDetails({
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        accountHolderName: '',
        upiId: ''
      });
      setSelectedBankId('');
      setUseNewBank(false);
      setSaveBankDetails(false);
      fetchWalletData();
      fetchWithdrawals();
    } catch (error) {
      console.error('Withdrawal error:', error);
      alert(error.message || 'Withdrawal failed');
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

  const getWithdrawalStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-warning';
      case 'approved':
        return 'bg-info';
      case 'completed':
        return 'bg-success';
      case 'rejected':
        return 'bg-danger';
      default:
        return 'bg-secondary';
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
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'withdrawals' ? 'active' : ''}`}
                    onClick={() => setActiveTab('withdrawals')}
                  >
                    Withdrawal History
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
                        <li>Referral bonus: 20% of referred user&apos;s first deposit</li>
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
                      <li>You earn 20% of their first deposit as referral bonus</li>
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
                          <h4 className="text-success">20%</h4>
                          <p className="text-muted mb-0">Referral Bonus Rate</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'withdrawals' && (
                <div>
                  <h5 className="mb-3">Withdrawal History</h5>
                  {withdrawals.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-arrow-up-circle fs-1 text-muted"></i>
                      <p className="text-muted mt-3">No withdrawal requests yet</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Requested</th>
                            <th>Processed</th>
                            <th>Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          {withdrawals.map((withdrawal) => (
                            <tr key={withdrawal._id}>
                              <td>
                                <span className={`badge ${withdrawal.type === 'wallet' ? 'bg-primary' : 'bg-warning'}`}>
                                  {withdrawal.type === 'wallet' ? 'Wallet' : 'Referral'}
                                </span>
                              </td>
                              <td className="fw-bold">₹{withdrawal.amount.toFixed(2)}</td>
                              <td>
                                <span className={`badge ${getWithdrawalStatusBadge(withdrawal.status)}`}>
                                  {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                                </span>
                              </td>
                              <td>{new Date(withdrawal.createdAt).toLocaleDateString()}</td>
                              <td>
                                {withdrawal.processedAt 
                                  ? new Date(withdrawal.processedAt).toLocaleDateString()
                                  : '-'
                                }
                              </td>
                              <td>
                                {withdrawal.type === 'wallet' && withdrawal.accountDetails && (
                                  <small className="text-muted">
                                    {withdrawal.accountDetails.bankName} - ****{withdrawal.accountDetails.accountNumber?.slice(-4)}
                                  </small>
                                )}
                                {withdrawal.status === 'rejected' && withdrawal.rejectionReason && (
                                  <div className="mt-1">
                                    <small className="text-danger">
                                      <i className="bi bi-exclamation-triangle me-1"></i>
                                      {withdrawal.rejectionReason}
                                    </small>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
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
                    placeholder={`Enter amount (min: ₹${MIN_DEPOSIT_AMOUNT})`}
                    min={MIN_DEPOSIT_AMOUNT}
                  />
                </div>
                <div className="alert alert-info">
                  <small>
                    <i className="bi bi-info-circle me-2"></i>
                    <strong>Minimum deposit: ₹{MIN_DEPOSIT_AMOUNT}</strong><br/>
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
                  disabled={loading || !depositAmount || parseFloat(depositAmount) < MIN_DEPOSIT_AMOUNT}
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
          <div className="modal-dialog modal-dialog-centered modal-lg">
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
                {/* Balance Type Selection */}
                <div className="mb-4">
                  <label className="form-label">Select Balance Type</label>
                  <div className="d-flex gap-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="withdrawType"
                        id="walletBalance"
                        value="wallet"
                        checked={withdrawType === 'wallet'}
                        onChange={(e) => setWithdrawType(e.target.value)}
                      />
                      <label className="form-check-label" htmlFor="walletBalance">
                        Wallet Balance (₹{walletData.walletBalance.toFixed(2)})
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="withdrawType"
                        id="referralBalance"
                        value="referral"
                        checked={withdrawType === 'referral'}
                        onChange={(e) => setWithdrawType(e.target.value)}
                      />
                      <label className="form-check-label" htmlFor="referralBalance">
                        Referral Balance (₹{walletData.referralBalance.toFixed(2)})
                      </label>
                    </div>
                  </div>
                </div>

                {/* Amount Input */}
                <div className="mb-4">
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

                {/* Bank Details for Wallet Withdrawal */}
                {withdrawType === 'wallet' && (
                  <div className="mb-4">
                    <label className="form-label">Bank Account Details</label>
                    
                    {/* Saved Banks Selection */}
                    {savedBanks.length > 0 && (
                      <div className="mb-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="bankOption"
                            id="useSavedBank"
                            checked={!useNewBank}
                            onChange={() => setUseNewBank(false)}
                          />
                          <label className="form-check-label" htmlFor="useSavedBank">
                            Use Saved Bank Account
                          </label>
                        </div>
                        {!useNewBank && (
                          <select
                            className="form-select mt-2"
                            value={selectedBankId}
                            onChange={(e) => setSelectedBankId(e.target.value)}
                          >
                            <option value="">Select a bank account</option>
                            {savedBanks.map((bank) => (
                              <option key={bank.id} value={bank.id}>
                                {bank.bankName} - {bank.accountNumber.slice(-4)} ({bank.accountHolderName})
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    )}

                    {/* New Bank Option */}
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="bankOption"
                        id="useNewBank"
                        checked={useNewBank}
                        onChange={() => setUseNewBank(true)}
                      />
                      <label className="form-check-label" htmlFor="useNewBank">
                        Add New Bank Account
                      </label>
                    </div>

                    {/* New Bank Form */}
                    {useNewBank && (
                      <div className="mt-3 p-3 border rounded">
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Bank Name *</label>
                            <input
                              type="text"
                              className="form-control"
                              value={bankDetails.bankName}
                              onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                              placeholder="Enter bank name"
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Account Number *</label>
                            <input
                              type="text"
                              className="form-control"
                              value={bankDetails.accountNumber}
                              onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                              placeholder="Enter account number"
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">IFSC Code *</label>
                            <input
                              type="text"
                              className="form-control"
                              value={bankDetails.ifscCode}
                              onChange={(e) => setBankDetails({...bankDetails, ifscCode: e.target.value.toUpperCase()})}
                              placeholder="Enter IFSC code"
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label">Account Holder Name *</label>
                            <input
                              type="text"
                              className="form-control"
                              value={bankDetails.accountHolderName}
                              onChange={(e) => setBankDetails({...bankDetails, accountHolderName: e.target.value})}
                              placeholder="Enter account holder name"
                            />
                          </div>
                          <div className="col-md-12 mb-3">
                            <label className="form-label">UPI ID (Optional)</label>
                            <input
                              type="text"
                              className="form-control"
                              value={bankDetails.upiId}
                              onChange={(e) => setBankDetails({...bankDetails, upiId: e.target.value})}
                              placeholder="Enter UPI ID"
                            />
                          </div>
                        </div>
                        
                        {/* Save Bank Details Toggle */}
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="saveBankDetails"
                            checked={saveBankDetails}
                            onChange={(e) => setSaveBankDetails(e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor="saveBankDetails">
                            <i className="bi bi-shield-check me-1"></i>
                            Save bank details securely for future withdrawals
                          </label>
                        </div>
                        <small className="text-muted">
                          <i className="bi bi-info-circle me-1"></i>
                          Your bank details are encrypted and stored securely. You can delete them anytime from your profile.
                        </small>
                      </div>
                    )}
                  </div>
                )}

                {/* Referral Withdrawal Warning */}
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
