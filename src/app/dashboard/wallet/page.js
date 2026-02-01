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
    todayChange: 0.00,
    transactions: []
  });
  const [referralData, setReferralData] = useState({
    referralTransactions: [],
    referredUsers: [],
    totalReferralEarnings: 0,
    totalReferred: 0,
    activeReferred: 0
  });
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawType, setWithdrawType] = useState('wallet'); // 'wallet' or 'referral'
  const [loading, setLoading] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiTxnId, setUpiTxnId] = useState('');
  const [upiAmount, setUpiAmount] = useState('');
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
  const [upiDeposits, setUpiDeposits] = useState([]);
  const [tradingData, setTradingData] = useState({
    accountInfo: {
      accountType: 'demo',
      brokerName: '',
      accountNumber: '',
      accountBalance: 0,
      currency: 'USD',
      leverage: '1:100',
      platform: 'MetaTrader 5',
      accountStatus: 'active'
    },
    allTimeStats: {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      totalProfit: 0,
      totalLoss: 0,
      netProfit: 0,
      winRate: 0,
      profitFactor: 0,
      averageWin: 0,
      averageLoss: 0,
      largestWin: 0,
      largestLoss: 0,
      maxDrawdown: 0,
      maxDrawdownPercent: 0
    },
    last7Days: {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      totalProfit: 0,
      totalLoss: 0,
      netProfit: 0,
      winRate: 0,
      profitFactor: 0,
      averageWin: 0,
      averageLoss: 0,
      largestWin: 0,
      largestLoss: 0,
      maxDrawdown: 0,
      maxDrawdownPercent: 0
    },
    last30Days: {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      totalProfit: 0,
      totalLoss: 0,
      netProfit: 0,
      winRate: 0,
      profitFactor: 0,
      averageWin: 0,
      averageLoss: 0,
      largestWin: 0,
      largestLoss: 0,
      maxDrawdown: 0,
      maxDrawdownPercent: 0
    },
    recentTrades: [],
    performanceMetrics: {
      sharpeRatio: 0,
      sortinoRatio: 0,
      calmarRatio: 0,
      recoveryFactor: 0,
      expectancy: 0,
      riskRewardRatio: 0,
      averageTradeDuration: '0h 0m',
      tradesPerDay: 0,
      consistency: 0
    },
    riskManagement: {
      maxRiskPerTrade: 0,
      maxDailyLoss: 0,
      maxDailyProfit: 0,
      maxConsecutiveLosses: 0,
      maxConsecutiveWins: 0,
      currentConsecutiveLosses: 0,
      currentConsecutiveWins: 0
    },
    goals: {
      monthlyTarget: 0,
      weeklyTarget: 0,
      dailyTarget: 0,
      maxDrawdownLimit: 0,
      profitTarget: 0
    }
  });

  const MIN_DEPOSIT_AMOUNT = 500;
  const MIN_WITHDRAWAL_AMOUNT = 500;

  // Validation functions for withdrawal
  const canWithdraw = () => {
    // Check if profile is 100% complete
    const completionPercentage = profile?.status?.completionPercentage || 0;
    if (completionPercentage < 100) {
      return {
        canWithdraw: false,
        message: 'Complete your profile to withdraw',
        type: 'profile'
      };
    }

    // Check KYC status
    const kycStatus = profile?.kyc?.status || 'not_applied';
    if (kycStatus !== 'approved') {
      const statusText = getKYCStatusText(kycStatus);
      return {
        canWithdraw: false,
        message: `Your KYC status is ${statusText}. Must wait for our team to approve it`,
        type: 'kyc'
      };
    }

    return { canWithdraw: true };
  };

  const getKYCStatusText = (status) => {
    switch (status) {
      case 'not_applied':
        return 'Not Applied';
      case 'pending':
      case 'applied':
        return 'Under Review';
      case 'under_review':
        return 'Under Review';
      case 'approved':
        return 'Approved';
      case 'verified':
        return 'Verified';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Not Applied';
    }
  };

  const handleWithdrawClick = (type) => {
    const validation = canWithdraw();
    if (!validation.canWithdraw) {
      alert(validation.message);
      return;
    }

    setWithdrawType(type);
    setShowWithdrawModal(true);
  };

  useEffect(() => {
    fetchWalletData();
    fetchTradingData();
    fetchSavedBanks();
    fetchWithdrawals();
    fetchReferralData();
    fetchUpiDeposits();

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

  const fetchUpiDeposits = async () => {
    try {
      const data = await api.get(`/wallet/upi-deposits/${user.uid}`);
      setUpiDeposits(data.deposits || []);
    } catch (error) {
      console.error('Error fetching UPI deposits:', error);
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
        todayChange: data.todayChange || 0,
        transactions: data.transactions
      });
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTradingData = async () => {
    try {
      if (user?.uid) {
        console.log('Fetching trading data for user:', user.uid);
        const response = await fetch(buildApiUrl(`/trading-data/${user.uid}`));
        if (response.ok) {
          const result = await response.json();
          console.log('Trading data response:', result);
          if (result.success && result.tradingData) {
            // Ensure all nested objects exist with default values
            const safeTradingData = {
              accountInfo: {
                accountType: 'demo',
                brokerName: '',
                accountNumber: '',
                accountBalance: 0,
                currency: 'USD',
                leverage: '1:100',
                platform: 'MetaTrader 5',
                accountStatus: 'active',
                lastUpdated: new Date(),
                ...result.tradingData.accountInfo
              },
              allTimeStats: {
                totalTrades: 0,
                winningTrades: 0,
                losingTrades: 0,
                winRate: 0,
                netProfit: 0,
                grossProfit: 0,
                grossLoss: 0,
                profitFactor: 0,
                averageWin: 0,
                averageLoss: 0,
                largestWin: 0,
                largestLoss: 0,
                maxDrawdown: 0,
                maxDrawdownPercent: 0,
                recoveryFactor: 0,
                expectancy: 0,
                sharpeRatio: 0,
                sortinoRatio: 0,
                calmarRatio: 0,
                riskRewardRatio: 0,
                ...result.tradingData.allTimeStats
              },
              last7Days: {
                totalTrades: 0,
                winningTrades: 0,
                losingTrades: 0,
                winRate: 0,
                netProfit: 0,
                grossProfit: 0,
                grossLoss: 0,
                profitFactor: 0,
                averageWin: 0,
                averageLoss: 0,
                largestWin: 0,
                largestLoss: 0,
                maxDrawdown: 0,
                maxDrawdownPercent: 0,
                recoveryFactor: 0,
                expectancy: 0,
                sharpeRatio: 0,
                sortinoRatio: 0,
                calmarRatio: 0,
                riskRewardRatio: 0,
                ...result.tradingData.last7Days
              },
              last30Days: {
                totalTrades: 0,
                winningTrades: 0,
                losingTrades: 0,
                winRate: 0,
                netProfit: 0,
                grossProfit: 0,
                grossLoss: 0,
                profitFactor: 0,
                averageWin: 0,
                averageLoss: 0,
                largestWin: 0,
                largestLoss: 0,
                maxDrawdown: 0,
                maxDrawdownPercent: 0,
                recoveryFactor: 0,
                expectancy: 0,
                sharpeRatio: 0,
                sortinoRatio: 0,
                calmarRatio: 0,
                riskRewardRatio: 0,
                ...result.tradingData.last30Days
              },
              recentTrades: result.tradingData.recentTrades || [],
              performanceMetrics: {
                sharpeRatio: 0,
                sortinoRatio: 0,
                calmarRatio: 0,
                recoveryFactor: 0,
                expectancy: 0,
                riskRewardRatio: 0,
                maxConsecutiveWins: 0,
                maxConsecutiveLosses: 0,
                averageTradeDuration: 0,
                profitPerDay: 0,
                profitPerWeek: 0,
                profitPerMonth: 0,
                ...result.tradingData.performanceMetrics
              },
              riskManagement: {
                maxRiskPerTrade: 0,
                maxDailyRisk: 0,
                maxWeeklyRisk: 0,
                maxMonthlyRisk: 0,
                riskRewardRatio: 0,
                positionSize: 0,
                stopLossPercentage: 0,
                takeProfitPercentage: 0,
                ...result.tradingData.riskManagement
              },
              goals: {
                dailyProfitTarget: 0,
                weeklyProfitTarget: 0,
                monthlyProfitTarget: 0,
                yearlyProfitTarget: 0,
                maxDrawdownLimit: 0,
                winRateTarget: 0,
                profitFactorTarget: 0,
                ...result.tradingData.goals
              },
              adminNotes: result.tradingData.adminNotes || '',
              lastUpdatedBy: result.tradingData.lastUpdatedBy || '',
              isActive: result.tradingData.isActive || false,
              createdAt: result.tradingData.createdAt || new Date(),
              updatedAt: result.tradingData.updatedAt || new Date()
            };
            
            setTradingData(safeTradingData);
            // Update wallet data with trading profit
            setWalletData(prev => ({
              ...prev,
              totalPnl: safeTradingData.allTimeStats?.netProfit || 0
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching trading data:', error);
    }
  };

  const fetchReferralData = async () => {
    try {
      const data = await api.get(`/wallet/referral-history/${user.uid}`);
      setReferralData({
        referralTransactions: data.referralTransactions,
        referredUsers: data.referredUsers,
        totalReferralEarnings: data.totalReferralEarnings,
        totalReferred: data.totalReferred,
        activeReferred: data.activeReferred
      });
    } catch (error) {
      console.error('Error fetching referral data:', error);
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
        name: 'Xfunding Flow',
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
    <div className="container-fluid py-2 py-md-4">
      {/* Header */}
      <div className="row mb-3 mb-md-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 gap-md-3">
            <div className="flex-grow-1">
              <h2 className="fw-bold mb-1 fs-4 fs-md-3 text-white">Wallet</h2>
              <p className="text-white-50 mb-0 d-none d-md-block small">Manage your funds and view transaction history</p>
            </div>
            <div className="d-flex gap-1 gap-md-2 flex-wrap">


              <button
                className="btn btn-sm px-3 rounded-4"
                style={{
                  background: 'rgba(34, 197, 94, 0.2)',
                  border: '1px solid rgba(34, 197, 94, 0.5)',
                  color: '#22c55e'
                }}
                onClick={() => setShowWithdrawModal(true)}
                disabled={loading}
                title="Withdraw Money"
              >
                <i className="bi bi-arrow-up-circle me-1 fw-bold my-auto "></i>
                Withdraw
              </button>

            </div>
          </div>
        </div>
      </div>

      {/* Wallet Overview Cards */}
      <div className="row mb-3 mb-md-4 g-2 g-md-3">
        <div className=" col-lg-4 col-md-6 col-sm-6 col-12">
          <div className="card border-0 h-100" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-body p-3 p-md-4">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-circle p-2 p-md-3" style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)'
                  }}>
                    <i className="bi bi-wallet2 text-primary fs-5 fs-md-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-2 ms-md-3">
                  <h6 className="text-white-50 mb-1 small fw-medium">Wallet Balance</h6>
                  <h4 className="fw-bold mb-0 fs-5 fs-md-4 text-truncate text-white">₹{walletData.walletBalance.toFixed(2)}</h4>
                  <small className={`${walletData.todayChange >= 0 ? "text-success" : "text-danger"} d-none d-sm-block`}>
                    {walletData.todayChange >= 0 ? '+' : ''}₹{walletData.todayChange.toFixed(2)} today
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className=" col-lg-4 col-md-6 col-sm-6 col-12">
          <div className="card border-0 h-100" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-body p-3 p-md-4">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-circle p-2 p-md-3" style={{
                    background: 'rgba(251, 191, 36, 0.1)',
                    border: '1px solid rgba(251, 191, 36, 0.3)'
                  }}>
                    <i className="bi bi-gift text-warning fs-5 fs-md-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-2 ms-md-3">
                  <h6 className="text-white-50 mb-1 small fw-medium">Referral Balance</h6>
                  <h4 className="fw-bold mb-0 fs-5 fs-md-4 text-truncate text-white">₹{walletData.referralBalance.toFixed(2)}</h4>
                  <small className="text-white-50 d-none d-sm-block">Earned from referrals</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className=" col-lg-4 col-md-6 col-sm-6 col-12">
          <div className="card border-0 h-100" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-body p-3 p-md-4">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-circle p-2 p-md-3" style={{
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)'
                  }}>
                    <i className="bi bi-arrow-down-circle text-success fs-5 fs-md-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-2 ms-md-3">
                  <h6 className="text-white-50 mb-1 small fw-medium">Total Deposits</h6>
                  <h4 className="fw-bold mb-0 fs-5 fs-md-4 text-truncate text-white">₹{walletData.totalDeposits.toFixed(2)}</h4>
                  <small className="text-white-50 d-none d-sm-block">All time</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className=" col-lg-4 col-md-6 col-sm-6 col-12">
          <div className="card border-0 h-100" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-body p-3 p-md-4">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-circle p-2 p-md-3" style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                  }}>
                    <i className="bi bi-arrow-up-circle text-danger fs-5 fs-md-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-2 ms-md-3">
                  <h6 className="text-white-50 mb-1 small fw-medium">Total Withdrawals</h6>
                  <h4 className="fw-bold mb-0 fs-5 fs-md-4 text-truncate text-white">₹{walletData.totalWithdrawals.toFixed(2)}</h4>
                  <small className="text-white-50 d-none d-sm-block">All time</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* treading profit card */}
        <div className=" col-lg-4 col-md-6 col-sm-6 col-12">
          <div className="card border-0 h-100" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-body p-3 p-md-4">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-circle p-2 p-md-3" style={{
                    background: 'rgba(85, 118, 94, 0.13)',
                    border: '1px solid rgba(0, 151, 88, 0.3)'
                  }}>
                    <i className="bi bi-graph-up text-success fs-5 fs-md-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1 ms-2 ms-md-3">
                  <h6 className="text-white-50 mb-1 small fw-medium">Treading Profit</h6>
                  <h4 className="fw-bold mb-0 fs-5 fs-md-4 text-truncate text-white">₹{walletData.totalPnl.toFixed(2)}</h4>
                  <small className="text-white-50 d-none d-sm-block">All time</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="row mb-3 mb-md-4">
        <div className="col-12">
          <div className="card border-0" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-header border-0 p-0" style={{
              background: 'transparent',
              borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
            }}>
              <ul className="nav nav-tabs card-header-tabs flex-nowrap overflow-auto border-0">
                <li className="nav-item flex-shrink-0">
                  <button
                    className={`nav-link ${activeTab === 'overview' ? 'active' : ''} px-3 py-2`}
                    style={{
                      color: activeTab === 'overview' ? '#3b82f6' : '#e2e8f0',
                      background: activeTab === 'overview' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                      border: 'none'
                    }}
                    onClick={() => setActiveTab('overview')}
                  >
                    <i className="bi bi-house me-1 d-none d-sm-inline"></i>
                    <span className="d-sm-none small">Overview</span>
                    <span className="d-none d-sm-inline small">Overview</span>
                  </button>
                </li>
                <li className="nav-item flex-shrink-0">
                  <button
                    className={`nav-link ${activeTab === 'transactions' ? 'active' : ''} px-3 py-2`}
                    style={{
                      color: activeTab === 'transactions' ? '#3b82f6' : '#e2e8f0',
                      background: activeTab === 'transactions' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                      border: 'none'
                    }}
                    onClick={() => setActiveTab('transactions')}
                  >
                    <i className="bi bi-arrow-left-right me-1 d-none d-sm-inline"></i>
                    <span className="d-sm-none small">Txns</span>
                    <span className="d-none d-sm-inline small">Transactions</span>
                  </button>
                </li>
                <li className="nav-item flex-shrink-0">
                  <button
                    className={`nav-link ${activeTab === 'referrals' ? 'active' : ''} px-3 py-2`}
                    style={{
                      color: activeTab === 'referrals' ? '#3b82f6' : '#e2e8f0',
                      background: activeTab === 'referrals' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                      border: 'none'
                    }}
                    onClick={() => setActiveTab('referrals')}
                  >
                    <i className="bi bi-people me-1 d-none d-sm-inline"></i>
                    <span className="d-sm-none small">Refs</span>
                    <span className="d-none d-sm-inline small">Referral History</span>
                  </button>
                </li>
                <li className="nav-item flex-shrink-0">
                  <button
                    className={`nav-link ${activeTab === 'trading' ? 'active' : ''} px-3 py-2`}
                    style={{
                      color: activeTab === 'trading' ? '#3b82f6' : '#e2e8f0',
                      background: activeTab === 'trading' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                      border: 'none'
                    }}
                    onClick={() => setActiveTab('trading')}
                  >
                    <i className="bi bi-graph-up me-1 d-none d-sm-inline"></i>
                    <span className="d-sm-none small">Trading</span>
                    <span className="d-none d-sm-inline small">Trading Analytics</span>
                  </button>
                </li>
                <li className="nav-item flex-shrink-0">
                  <button
                    className={`nav-link ${activeTab === 'withdrawals' ? 'active' : ''} px-3 py-2`}
                    onClick={() => setActiveTab('withdrawals')}
                  >
                    <i className="bi bi-arrow-up-circle me-1 d-none d-sm-inline"></i>
                    <span className="d-sm-none small">Withdraw</span>
                    <span className="d-none d-sm-inline small">Withdrawals</span>
                  </button>
                </li>
                <li className="nav-item flex-shrink-0">
                  <button
                    className={`nav-link ${activeTab === 'upi' ? 'active' : ''} px-3 py-2`}
                    onClick={() => setActiveTab('upi')}
                  >
                    <i className="bi bi-qr-code me-1 d-none d-sm-inline"></i>
                    <span className="d-sm-none small">UPI</span>
                    <span className="d-none d-sm-inline small">UPI Deposits</span>
                  </button>
                </li>
              </ul>
            </div>
            <div className="card-body p-3 p-md-4" style={{ color: '#e2e8f0' }}>
              {activeTab === 'overview' && (
                <div className="row g-3">
                  <div className="col-md-6">
                    <h5 className="mb-3 fs-6 fs-md-5 text-white">Quick Actions</h5>
                    <div className="d-grid gap-2 gap-md-3">
                      <button
                        className="btn btn-sm  rounded-4"
                        style={{
                          background: 'rgba(59, 130, 246, 0.2)',
                          border: '1px solid rgba(59, 130, 246, 0.5)',
                          color: '#3b82f6'
                        }}
                        onClick={() => setShowDepositModal(true)}
                      >
                        <i className="bi bi-plus-circle me-2"></i>
                        Add Money
                      </button>
                      <button
                        className="btn d-none  rounded-4"
                        style={{
                          background: 'rgba(59, 130, 246, 0.2)',
                          border: '1px solid rgba(59, 130, 246, 0.5)',
                          color: '#3b82f6'
                        }}
                        onClick={() => setShowDepositModal(true)}
                      >
                        <i className="bi bi-plus-circle me-2"></i>
                        Add Money to Wallet
                      </button>
                      <button
                        className="btn text-md-start rounded-4"
                        style={{
                          background: 'rgba(34, 197, 94, 0.2)',
                          border: '1px solid rgba(34, 197, 94, 0.5)',
                          color: '#22c55e'
                        }}
                        onClick={() => setShowUpiModal(true)}
                      >
                        <i className="bi bi-qr-code me-2"></i>
                        Deposit via UPI
                      </button>
                      <button
                        className="btn btn-sm d-md-none rounded-4"
                        style={{
                          background: 'rgba(34, 197, 94, 0.2)',
                          border: '1px solid rgba(34, 197, 94, 0.5)',
                          color: '#22c55e'
                        }}
                        onClick={() => handleWithdrawClick('wallet')}
                        disabled={walletData.walletBalance < MIN_WITHDRAWAL_AMOUNT}
                      >
                        <i className="bi bi-arrow-up-circle me-2"></i>
                        Withdraw Wallet
                      </button>
                      <button
                        className="btn d-none d-md-inline-flex rounded-4"
                        style={{
                          background: 'rgba(34, 197, 94, 0.2)',
                          border: '1px solid rgba(34, 197, 94, 0.5)',
                          color: '#22c55e'
                        }}
                        onClick={() => handleWithdrawClick('wallet')}
                        disabled={walletData.walletBalance < MIN_WITHDRAWAL_AMOUNT}
                      >
                        <i className="bi bi-arrow-up-circle me-2"></i>
                        Withdraw from Wallet
                      </button>
                      <button
                        className="btn btn-sm d-md-none rounded-4"
                        style={{
                          background: 'rgba(251, 191, 36, 0.2)',
                          border: '1px solid rgba(251, 191, 36, 0.5)',
                          color: '#fbbf24'
                        }}
                        onClick={() => handleWithdrawClick('referral')}
                        disabled={walletData.referralBalance < MIN_WITHDRAWAL_AMOUNT || walletData.totalDeposits === 0}
                      >
                        <i className="bi bi-gift me-2"></i>
                        Withdraw Bonus
                      </button>
                      <button
                        className="btn d-none d-md-inline-flex rounded-4"
                        style={{
                          background: 'rgba(251, 191, 36, 0.2)',
                          border: '1px solid rgba(251, 191, 36, 0.5)',
                          color: '#fbbf24'
                        }}
                        onClick={() => handleWithdrawClick('referral')}
                        disabled={walletData.referralBalance < MIN_WITHDRAWAL_AMOUNT || walletData.totalDeposits === 0}
                      >
                        <i className="bi bi-gift me-2"></i>
                        Withdraw Referral Bonus
                      </button>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <h5 className="mb-3 fs-6 fs-md-5 text-white">Withdrawal Rules</h5>
                    <div className="alert py-2 py-md-3 rounded-4" style={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      color: '#e2e8f0'
                    }}>
                      <ul className="mb-0 small">
                        <li>Account must be 100% complete to withdraw</li>
                        <li>KYC status must be approved to withdraw</li>
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
                  <h5 className="mb-3 fs-6 fs-md-5">Transaction History</h5>
                  {walletData.transactions.length === 0 ? (
                    <div className="text-center py-4 py-md-5">
                      <i className="bi bi-receipt fs-1 text-muted"></i>
                      <p className="text-muted mt-3 small">No transactions yet</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover" style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)'
                      }}>
                        <thead className="d-none d-md-table-header-group" style={{
                          background: 'rgba(30, 30, 30, 0.8)',
                          borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
                        }}>
                          <tr>
                            <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Type</th>
                            <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Amount</th>
                            <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Description</th>
                            <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Date</th>
                            <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody style={{ background: 'transparent' }}>
                          {walletData.transactions.map((transaction) => (
                            <tr key={transaction._id || transaction.id} style={{
                              background: 'rgba(60, 58, 58, 0.03)',
                              borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
                            }}>
                              <td className="d-md-table-cell" style={{ background: 'transparent' }}>
                                <i className={`bi ${getTransactionIcon(transaction.type)} me-2`}></i>
                                <span className="text-capitalize d-none d-md-inline text-white">
                                  {transaction.type.replace('_', ' ')}
                                </span>
                                <span className="text-capitalize d-md-none small text-white">
                                  {transaction.type.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="fw-bold" style={{ background: 'transparent' }}>
                                <span className={transaction.type === 'deposit' || transaction.type === 'referral_bonus' ? 'text-success' : 'text-danger'}>
                                  {transaction.type === 'deposit' || transaction.type === 'referral_bonus' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                                </span>
                              </td>
                              <td className="text-truncate d-none d-md-table-cell text-white" style={{ maxWidth: '200px', background: 'transparent' }} title={transaction.description}>
                                {transaction.description}
                              </td>
                              <td className="d-none d-md-table-cell" style={{ background: 'transparent' }}>
                                <small className="text-white-50">{new Date(transaction.createdAt || transaction.date).toLocaleDateString()}</small>
                                <br />
                                <small className="text-white-50">
                                  {new Date(transaction.createdAt || transaction.date).toLocaleTimeString()}
                                </small>
                              </td>
                              <td className="d-md-none" style={{ background: 'transparent' }}>
                                <div className="small text-white-50">
                                  {new Date(transaction.createdAt || transaction.date).toLocaleDateString()}
                                </div>
                                <div className="text-truncate text-white" style={{ maxWidth: '150px' }} title={transaction.description}>
                                  {transaction.description}
                                </div>
                              </td>
                              <td style={{ background: 'transparent' }}>
                                <span className={getStatusBadge(transaction.status)} style={{
                                  background: transaction.status === 'completed' ? 'rgba(34, 197, 94, 0.2)' :
                                    transaction.status === 'pending' ? 'rgba(251, 191, 36, 0.2)' :
                                      transaction.status === 'failed' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(124, 124, 124, 0.2)',
                                  color: transaction.status === 'completed' ? '#22c55e' :
                                    transaction.status === 'pending' ? '#fbbf24' :
                                      transaction.status === 'failed' ? '#ef4444' : '#9ca3af',
                                  border: transaction.status === 'completed' ? '1px solid rgba(34, 197, 94, 0.5)' :
                                    transaction.status === 'pending' ? '1px solid rgba(251, 191, 36, 0.5)' :
                                      transaction.status === 'failed' ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(124, 124, 124, 0.5)'
                                }}>
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
                  <h5 className="mb-3 fs-6 fs-md-5 text-white">Referral History</h5>

                  {/* Referral Stats */}
                  <div className="row mb-3 mb-md-4 g-2 g-md-3">
                    <div className="col-md-3 col-sm-6 col-6">
                      <div className="card border-0 h-100" style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
                      }}>
                        <div className="card-body text-center p-2 p-md-3">
                          <h4 className="text-warning fs-6 fs-md-4 mb-1">₹{referralData.totalReferralEarnings.toFixed(2)}</h4>
                          <p className="text-white-50 mb-0 small fw-medium">Total Earnings</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 col-sm-6 col-6">
                      <div className="card border-0 h-100" style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
                      }}>
                        <div className="card-body text-center p-2 p-md-3">
                          <h4 className="text-primary fs-6 fs-md-4 mb-1">{referralData.totalReferred}</h4>
                          <p className="text-white-50 mb-0 small fw-medium">Total Referred</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 col-sm-6 col-6">
                      <div className="card border-0 h-100" style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
                      }}>
                        <div className="card-body text-center p-2 p-md-3">
                          <h4 className="text-success fs-6 fs-md-4 mb-1">{referralData.activeReferred}</h4>
                          <p className="text-white-50 mb-0 small fw-medium">Active Users</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 col-sm-6 col-6">
                      <div className="card border-0 h-100" style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
                      }}>
                        <div className="card-body text-center p-2 p-md-3">
                          <h4 className="text-info fs-6 fs-md-4 mb-1">20%</h4>
                          <p className="text-white-50 mb-0 small fw-medium">Bonus Rate</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Referred Users Table */}
                  <div className="mb-3 mb-md-4">
                    <h6 className="mb-3 fs-6 text-white">Referred Users</h6>
                    {referralData.referredUsers.length === 0 ? (
                      <div className="text-center py-3 py-md-4">
                        <i className="bi bi-people fs-1 text-white-50"></i>
                        <p className="text-white-50 mt-2 small">No referrals yet</p>
                        <small className="text-white-50">Share your referral code to start earning!</small>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover" style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)'
                        }}>
                          <thead className="d-none d-md-table-header-group" style={{
                            background: 'rgba(30, 30, 30, 0.8)',
                            borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
                          }}>
                            <tr>
                              <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Name</th>
                              <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Email</th>
                              <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Joined</th>
                              <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Status</th>
                              <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Deposits</th>
                              <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Your Bonus</th>
                            </tr>
                          </thead>
                          <tbody style={{ background: 'transparent' }}>
                            {referralData.referredUsers.map((user) => (
                              <tr key={user.uid} style={{
                                background: 'rgba(60, 58, 58, 0.03)',
                                borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
                              }}>
                                <td className="d-md-table-cell" style={{ background: 'transparent' }}>
                                  <div className="d-flex align-items-center">
                                    <div className="rounded-circle p-1 p-md-2 me-2" style={{
                                      background: 'rgba(59, 130, 246, 0.1)',
                                      border: '1px solid rgba(59, 130, 246, 0.3)'
                                    }}>
                                      <i className="bi bi-person text-primary small"></i>
                                    </div>
                                    <span className="fw-medium small text-white">{user.name || 'Unknown'}</span>
                                  </div>
                                </td>
                                <td className="d-none d-md-table-cell" style={{ background: 'transparent' }}>
                                  <small className="text-white-50">{user.email}</small>
                                </td>
                                <td className="d-none d-md-table-cell" style={{ background: 'transparent' }}>
                                  <small className="text-white-50">{new Date(user.joinedAt).toLocaleDateString()}</small>
                                </td>
                                <td style={{ background: 'transparent' }}>
                                  <span className={`badge small`} style={{
                                    background: user.hasDeposited ? 'rgba(34, 197, 94, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                                    color: user.hasDeposited ? '#22c55e' : '#fbbf24',
                                    border: user.hasDeposited ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(251, 191, 36, 0.5)'
                                  }}>
                                    {user.hasDeposited ? 'Active' : 'Pending'}
                                  </span>
                                </td>
                                <td className="d-md-none" style={{ background: 'transparent' }}>
                                  <div className="small text-white-50">{user.email}</div>
                                  <div className="small text-white-50">{new Date(user.joinedAt).toLocaleDateString()}</div>
                                </td>
                                <td style={{ background: 'transparent' }}>
                                  <span className="fw-medium small text-white">₹{user.totalDeposits.toFixed(2)}</span>
                                </td>
                                <td style={{ background: 'transparent' }}>
                                  <span className="text-success fw-medium small">₹{user.referralBonus.toFixed(2)}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Referral Earnings History */}
                  <div>
                    <h6 className="mb-3 fs-6">Referral Earnings History</h6>
                    {referralData.referralTransactions.length === 0 ? (
                      <div className="text-center py-3 py-md-4">
                        <i className="bi bi-gift fs-1 text-muted"></i>
                        <p className="text-muted mt-2 small">No referral earnings yet</p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-hover" style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)'
                        }}>
                          <thead className="d-none d-md-table-header-group" style={{
                            background: 'rgba(30, 30, 30, 0.8)',
                            borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
                          }}>
                            <tr>
                              <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Date</th>
                              <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Amount</th>
                              <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>From User</th>
                              <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Description</th>
                            </tr>
                          </thead>
                          <tbody style={{ background: 'transparent' }}>
                            {referralData.referralTransactions.map((transaction) => (
                              <tr key={transaction._id} style={{
                                background: 'rgba(60, 58, 58, 0.03)',
                                borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
                              }}>
                                <td className="d-none d-md-table-cell" style={{ background: 'transparent' }}>
                                  <small className="text-white-50">{new Date(transaction.createdAt).toLocaleDateString()}</small>
                                  <br />
                                  <small className="text-white-50">
                                    {new Date(transaction.createdAt).toLocaleTimeString()}
                                  </small>
                                </td>
                                <td className="d-md-none" style={{ background: 'transparent' }}>
                                  <div className="small text-white-50">
                                    {new Date(transaction.createdAt).toLocaleDateString()}
                                  </div>
                                </td>
                                <td style={{ background: 'transparent' }}>
                                  <span className="text-success fw-bold small">+₹{transaction.amount.toFixed(2)}</span>
                                </td>
                                <td className="d-none d-md-table-cell" style={{ background: 'transparent' }}>
                                  <span className="text-white-50 small">
                                    {transaction.metadata?.referredUserName || 'Unknown User'}
                                  </span>
                                </td>
                                <td className="d-md-none" style={{ background: 'transparent' }}>
                                  <div className="small text-white-50">
                                    {transaction.metadata?.referredUserName || 'Unknown User'}
                                  </div>
                                  <div className="small text-white-50 text-truncate" style={{ maxWidth: '150px' }} title={transaction.description}>
                                    {transaction.description}
                                  </div>
                                </td>
                                <td className="d-none d-md-table-cell" style={{ background: 'transparent' }}>
                                  <small className="text-white-50">{transaction.description}</small>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'trading' && (
                <div>
                  <h5 className="mb-3 fs-6 fs-md-5 text-white">Trading Analytics</h5>

                  {/* Account Information */}
                  <div className="row mb-4">
                    <div className="col-12">
                      <div className="card border-0" style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
                      }}>
                        <div className="card-header" style={{
                          background: 'transparent',
                          borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
                        }}>
                          <h6 className="text-white mb-0">Account Information</h6>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-3 col-6 mb-3">
                              <div className="text-white-50 small">Account Type</div>
                              <div className="text-white fw-medium">{(tradingData.accountInfo?.accountType || 'demo').toUpperCase()}</div>
                            </div>
                            <div className="col-md-3 col-6 mb-3">
                              <div className="text-white-50 small">Broker</div>
                              <div className="text-white fw-medium">{tradingData.accountInfo?.brokerName || 'N/A'}</div>
                            </div>
                            <div className="col-md-3 col-6 mb-3">
                              <div className="text-white-50 small">Account Balance</div>
                              <div className="text-white fw-medium">${tradingData.accountInfo?.accountBalance?.toFixed(2) || '0.00'}</div>
                            </div>
                            <div className="col-md-3 col-6 mb-3">
                              <div className="text-white-50 small">Leverage</div>
                              <div className="text-white fw-medium">{tradingData.accountInfo?.leverage || '1:100'}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trading Statistics */}
                  <div className="row mb-4">
                    <div className="col-md-4 mb-3">
                      <div className="card border-0 h-100" style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
                      }}>
                        <div className="card-header" style={{
                          background: 'transparent',
                          borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
                        }}>
                          <h6 className="text-white mb-0">All Time Stats</h6>
                        </div>
                        <div className="card-body">
                          <div className="row text-center">
                            <div className="col-6 mb-3">
                              <div className="text-white-50 small">Total Trades</div>
                              <div className="text-white fw-bold fs-5">{tradingData.allTimeStats?.totalTrades || 0}</div>
                            </div>
                            <div className="col-6 mb-3">
                              <div className="text-white-50 small">Win Rate</div>
                              <div className="text-white fw-bold fs-5">{tradingData.allTimeStats?.winRate?.toFixed(1) || '0.0'}%</div>
                            </div>
                            <div className="col-6 mb-3">
                              <div className="text-white-50 small">Net Profit</div>
                              <div className={`fw-bold fs-5 ${(tradingData.allTimeStats?.netProfit || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                                ${tradingData.allTimeStats?.netProfit?.toFixed(2) || '0.00'}
                              </div>
                            </div>
                            <div className="col-6 mb-3">
                              <div className="text-white-50 small">Profit Factor</div>
                              <div className="text-white fw-bold fs-5">{tradingData.allTimeStats?.profitFactor?.toFixed(2) || '0.00'}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4 mb-3">
                      <div className="card border-0 h-100" style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
                      }}>
                        <div className="card-header" style={{
                          background: 'transparent',
                          borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
                        }}>
                          <h6 className="text-white mb-0">Last 7 Days</h6>
                        </div>
                        <div className="card-body">
                          <div className="row text-center">
                            <div className="col-6 mb-3">
                              <div className="text-white-50 small">Trades</div>
                              <div className="text-white fw-bold fs-5">{tradingData.last7Days?.totalTrades || 0}</div>
                            </div>
                            <div className="col-6 mb-3">
                              <div className="text-white-50 small">Win Rate</div>
                              <div className="text-white fw-bold fs-5">{tradingData.last7Days?.winRate?.toFixed(1) || '0.0'}%</div>
                            </div>
                            <div className="col-6 mb-3">
                              <div className="text-white-50 small">Net Profit</div>
                              <div className={`fw-bold fs-5 ${(tradingData.last7Days?.netProfit || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                                ${tradingData.last7Days?.netProfit?.toFixed(2) || '0.00'}
                              </div>
                            </div>
                            <div className="col-6 mb-3">
                              <div className="text-white-50 small">Profit Factor</div>
                              <div className="text-white fw-bold fs-5">{tradingData.last7Days?.profitFactor?.toFixed(2) || '0.00'}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-4 mb-3">
                      <div className="card border-0 h-100" style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
                      }}>
                        <div className="card-header" style={{
                          background: 'transparent',
                          borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
                        }}>
                          <h6 className="text-white mb-0">Last 30 Days</h6>
                        </div>
                        <div className="card-body">
                          <div className="row text-center">
                            <div className="col-6 mb-3">
                              <div className="text-white-50 small">Trades</div>
                              <div className="text-white fw-bold fs-5">{tradingData.last30Days?.totalTrades || 0}</div>
                            </div>
                            <div className="col-6 mb-3">
                              <div className="text-white-50 small">Win Rate</div>
                              <div className="text-white fw-bold fs-5">{tradingData.last30Days?.winRate?.toFixed(1) || '0.0'}%</div>
                            </div>
                            <div className="col-6 mb-3">
                              <div className="text-white-50 small">Net Profit</div>
                              <div className={`fw-bold fs-5 ${(tradingData.last30Days?.netProfit || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                                ${tradingData.last30Days?.netProfit?.toFixed(2) || '0.00'}
                              </div>
                            </div>
                            <div className="col-6 mb-3">
                              <div className="text-white-50 small">Profit Factor</div>
                              <div className="text-white fw-bold fs-5">{tradingData.last30Days?.profitFactor?.toFixed(2) || '0.00'}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div className="row mb-4">
                    <div className="col-12">
                      <div className="card border-0" style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
                      }}>
                        <div className="card-header" style={{
                          background: 'transparent',
                          borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
                        }}>
                          <h6 className="text-white mb-0">Performance Metrics</h6>
                        </div>
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-2 col-4 mb-3 text-center">
                              <div className="text-white-50 small">Sharpe Ratio</div>
                              <div className="text-white fw-bold">{tradingData.performanceMetrics?.sharpeRatio?.toFixed(2) || '0.00'}</div>
                            </div>
                            <div className="col-md-2 col-4 mb-3 text-center">
                              <div className="text-white-50 small">Sortino Ratio</div>
                              <div className="text-white fw-bold">{tradingData.performanceMetrics?.sortinoRatio?.toFixed(2) || '0.00'}</div>
                            </div>
                            <div className="col-md-2 col-4 mb-3 text-center">
                              <div className="text-white-50 small">Calmar Ratio</div>
                              <div className="text-white fw-bold">{tradingData.performanceMetrics?.calmarRatio?.toFixed(2) || '0.00'}</div>
                            </div>
                            <div className="col-md-2 col-4 mb-3 text-center">
                              <div className="text-white-50 small">Recovery Factor</div>
                              <div className="text-white fw-bold">{tradingData.performanceMetrics?.recoveryFactor?.toFixed(2) || '0.00'}</div>
                            </div>
                            <div className="col-md-2 col-4 mb-3 text-center">
                              <div className="text-white-50 small">Expectancy</div>
                              <div className="text-white fw-bold">{tradingData.performanceMetrics?.expectancy?.toFixed(2) || '0.00'}</div>
                            </div>
                            <div className="col-md-2 col-4 mb-3 text-center">
                              <div className="text-white-50 small">Risk/Reward</div>
                              <div className="text-white fw-bold">{tradingData.performanceMetrics?.riskRewardRatio?.toFixed(2) || '0.00'}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Trades */}
                  {tradingData.recentTrades && tradingData.recentTrades.length > 0 && (
                    <div className="row">
                      <div className="col-12">
                        <div className="card border-0" style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          backdropFilter: 'blur(20px)',
                          boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
                        }}>
                          <div className="card-header" style={{
                            background: 'transparent',
                            borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
                          }}>
                            <h6 className="text-white mb-0">Recent Trades</h6>
                          </div>
                          <div className="card-body">
                            <div className="table-responsive">
                              <table className="table table-hover" style={{
                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                color: 'white'
                              }}>
                                <thead style={{
                                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                                  color: 'white'
                                }}>
                                  <tr>
                                    <th className="text-white" style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>Symbol</th>
                                    <th className="text-white" style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>Type</th>
                                    <th className="text-white" style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>Volume</th>
                                    <th className="text-white" style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>Open Price</th>
                                    <th className="text-white" style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>Close Price</th>
                                    <th className="text-white" style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>Profit</th>
                                    <th className="text-white" style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>Duration</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {tradingData.recentTrades.slice(0, 10).map((trade, index) => (
                                    <tr key={index} style={{
                                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                      color: 'white',
                                      borderColor: 'rgba(124, 124, 124, 0.39)'
                                    }}>
                               <td style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>{trade.symbol || 'N/A'}</td>
                               <td style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>
                                 <span className={`badge ${(trade.type || 'buy') === 'buy' ? 'bg-success' : 'bg-danger'}`}>
                                   {(trade.type || 'buy').toUpperCase()}
                                 </span>
                               </td>
                               <td style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>{trade.volume || '0'}</td>
                               <td style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>${(trade.openPrice || 0).toFixed(5)}</td>
                               <td style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>${(trade.closePrice || 0).toFixed(5)}</td>
                               <td style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>
                                 <span className={(trade.netProfit || 0) >= 0 ? 'text-success' : 'text-danger'}>
                                   ${(trade.netProfit || 0).toFixed(2)}
                                 </span>
                               </td>
                               <td style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>{trade.duration || 'N/A'}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'withdrawals' && (
                <div>
                  <h5 className="mb-3 fs-6 fs-md-5">Withdrawal History</h5>
                  {withdrawals.length === 0 ? (
                    <div className="text-center py-4 py-md-5">
                      <i className="bi bi-arrow-up-circle fs-1 text-muted"></i>
                      <p className="text-muted mt-3 small">No withdrawal requests yet</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover" style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)'
                      }}>
                        <thead className="d-none d-md-table-header-group" style={{
                          background: 'rgba(30, 30, 30, 0.8)',
                          borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
                        }}>
                          <tr>
                            <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Type</th>
                            <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Amount</th>
                            <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Status</th>
                            <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Requested</th>
                            <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Processed</th>
                            <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Details</th>
                          </tr>
                        </thead>
                        <tbody style={{ background: 'transparent' }}>
                          {withdrawals.map((withdrawal) => (
                            <tr key={withdrawal._id} style={{
                              background: 'rgba(60, 58, 58, 0.03)',
                              borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
                            }}>
                              <td className="d-md-table-cell" style={{ background: 'transparent' }}>
                                <span className={`badge small`} style={{
                                  background: withdrawal.type === 'wallet' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                                  color: withdrawal.type === 'wallet' ? '#3b82f6' : '#fbbf24',
                                  border: withdrawal.type === 'wallet' ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(251, 191, 36, 0.5)'
                                }}>
                                  <i className={`bi ${withdrawal.type === 'wallet' ? 'bi-wallet2' : 'bi-gift'} me-1`}></i>
                                  {withdrawal.type === 'wallet' ? 'Wallet' : 'Referral'}
                                </span>
                              </td>
                              <td className="fw-bold small text-white" style={{ background: 'transparent' }}>₹{withdrawal.amount.toFixed(2)}</td>
                              <td style={{ background: 'transparent' }}>
                                <span className={`badge small`} style={{
                                  background: withdrawal.status === 'pending' ? 'rgba(251, 191, 36, 0.2)' :
                                    withdrawal.status === 'approved' ? 'rgba(59, 130, 246, 0.2)' :
                                      withdrawal.status === 'completed' ? 'rgba(34, 197, 94, 0.2)' :
                                        withdrawal.status === 'rejected' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(124, 124, 124, 0.2)',
                                  color: withdrawal.status === 'pending' ? '#fbbf24' :
                                    withdrawal.status === 'approved' ? '#3b82f6' :
                                      withdrawal.status === 'completed' ? '#22c55e' :
                                        withdrawal.status === 'rejected' ? '#ef4444' : '#9ca3af',
                                  border: withdrawal.status === 'pending' ? '1px solid rgba(251, 191, 36, 0.5)' :
                                    withdrawal.status === 'approved' ? '1px solid rgba(59, 130, 246, 0.5)' :
                                      withdrawal.status === 'completed' ? '1px solid rgba(34, 197, 94, 0.5)' :
                                        withdrawal.status === 'rejected' ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(124, 124, 124, 0.5)'
                                }}>
                                  {withdrawal.status.charAt(0).toUpperCase() + withdrawal.status.slice(1)}
                                </span>
                              </td>
                              <td className="d-none d-md-table-cell" style={{ background: 'transparent' }}>
                                <small className="text-white-50">{new Date(withdrawal.createdAt).toLocaleDateString()}</small>
                                <br />
                                <small className="text-white-50">
                                  {new Date(withdrawal.createdAt).toLocaleTimeString()}
                                </small>
                              </td>
                              <td className="d-md-none" style={{ background: 'transparent' }}>
                                <div className="small text-white-50">
                                  {new Date(withdrawal.createdAt).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="d-none d-md-table-cell" style={{ background: 'transparent' }}>
                                {withdrawal.processedAt ? (
                                  <>
                                    <small className="text-white-50">{new Date(withdrawal.processedAt).toLocaleDateString()}</small>
                                    <br />
                                    <small className="text-white-50">
                                      {new Date(withdrawal.processedAt).toLocaleTimeString()}
                                    </small>
                                  </>
                                ) : (
                                  <span className="text-white-50">-</span>
                                )}
                              </td>
                              <td className="d-md-none" style={{ background: 'transparent' }}>
                                {withdrawal.processedAt ? (
                                  <div className="small text-white-50">
                                    {new Date(withdrawal.processedAt).toLocaleDateString()}
                                  </div>
                                ) : (
                                  <span className="text-white-50 small">-</span>
                                )}
                              </td>
                              <td style={{ background: 'transparent' }}>
                                {withdrawal.type === 'wallet' && withdrawal.accountDetails && (
                                  <div>
                                    <small className="text-white-50 d-block small">
                                      {withdrawal.accountDetails.bankName}
                                    </small>
                                    <small className="text-white-50 small">
                                      ****{withdrawal.accountDetails.accountNumber?.slice(-4)}
                                    </small>
                                  </div>
                                )}
                                {withdrawal.status === 'rejected' && withdrawal.rejectionReason && (
                                  <div className="mt-1">
                                    <small className="text-danger small">
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

              {activeTab === 'upi' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0 fs-6 fs-md-5">UPI Deposit Requests</h5>
                    <button className="btn btn-success btn-sm" onClick={() => setShowUpiModal(true)}>
                      <i className="bi bi-plus-circle me-2"></i>New UPI Deposit
                    </button>
                  </div>
                  {upiDeposits.length === 0 ? (
                    <div className="text-center py-4">
                      <i className="bi bi-qr-code fs-1 text-muted"></i>
                      <p className="text-muted mt-2 small">No UPI deposits yet</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover" style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)'
                      }}>
                        <thead className="d-none d-md-table-header-group" style={{
                          background: 'rgba(30, 30, 30, 0.8)',
                          borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
                        }}>
                          <tr>
                            <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Submitted</th>
                            <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Txn ID</th>
                            <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Amount</th>
                            <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Status</th>
                            <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Processed</th>
                            <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Note</th>
                          </tr>
                        </thead>
                        <tbody style={{ background: 'transparent' }}>
                          {upiDeposits.map((d) => (
                            <tr key={d._id} style={{
                              background: 'rgba(60, 58, 58, 0.03)',
                              borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
                            }}>
                              <td className="d-none d-md-table-cell" style={{ background: 'transparent' }}>
                                <small className="text-white-50">{new Date(d.submittedAt).toLocaleString()}</small>
                              </td>
                              <td className="d-md-none" style={{ background: 'transparent' }}>
                                <div className="small text-white-50">{new Date(d.submittedAt).toLocaleDateString()}</div>
                              </td>
                              <td style={{ background: 'transparent' }}><code className="small text-white">{d.upiTransactionId}</code></td>
                              <td className="text-white" style={{ background: 'transparent' }}>₹{Number(d.amount).toFixed(2)}</td>
                              <td style={{ background: 'transparent' }}>
                                <span className={`badge`} style={{
                                  background: d.status === 'pending' ? 'rgba(251, 191, 36, 0.2)' :
                                    d.status === 'completed' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                  color: d.status === 'pending' ? '#fbbf24' :
                                    d.status === 'completed' ? '#22c55e' : '#ef4444',
                                  border: d.status === 'pending' ? '1px solid rgba(251, 191, 36, 0.5)' :
                                    d.status === 'completed' ? '1px solid rgba(34, 197, 94, 0.5)' : '1px solid rgba(239, 68, 68, 0.5)'
                                }}>{d.status}</span>
                              </td>
                              <td className="d-none d-md-table-cell" style={{ background: 'transparent' }}>
                                <small className="text-white-50">{d.processedAt ? new Date(d.processedAt).toLocaleString() : '-'}</small>
                              </td>
                              <td className="text-truncate text-white" style={{ maxWidth: '200px', background: 'transparent' }}>{d.adminNote || '-'}</td>
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
            <div className="modal-content border-0" style={{
              background: 'rgba(60, 58, 58, 0.03)',
              border: '1px solid rgba(124, 124, 124, 0.39)',
              backdropFilter: 'blur(20px)',
              boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
            }}>
              <div className="modal-header border-0" style={{
                background: 'transparent',
                borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
              }}>
                <h5 className="modal-title fs-6 fs-md-5 text-white">Deposit to Wallet</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowDepositModal(false)}
                ></button>
              </div>
              <div className="modal-body p-3 p-md-4" style={{ color: '#e2e8f0' }}>
                <div className="mb-3">
                  <label className="form-label small fw-medium text-white">Amount (₹)</label>
                  <input
                    type="number"
                    className="form-control form-control-lg rounded-4"
                    style={{
                      background: 'rgba(60, 58, 58, 0.03)',
                      border: '1px solid rgba(124, 124, 124, 0.39)',
                      color: '#e2e8f0'
                    }}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder={`Enter amount (min: ₹${MIN_DEPOSIT_AMOUNT})`}
                    min={MIN_DEPOSIT_AMOUNT}
                  />
                </div>
                <div className="alert py-2 py-md-3 rounded-4" style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  color: '#e2e8f0'
                }}>
                  <small>
                    <i className="bi bi-info-circle me-2"></i>
                    <strong>Minimum deposit: ₹{MIN_DEPOSIT_AMOUNT}</strong><br />
                    Payment will be processed securely through Razorpay
                  </small>
                </div>
              </div>
              <div className="modal-footer d-flex gap-2 p-3 p-md-4 border-0" style={{
                background: 'transparent',
                borderTop: '1px solid rgba(124, 124, 124, 0.39)'
              }}>
                <button
                  type="button"
                  className="btn flex-fill rounded-4"
                  style={{
                    background: 'rgba(60, 58, 58, 0.03)',
                    border: '1px solid rgba(124, 124, 124, 0.39)',
                    color: '#e2e8f0'
                  }}
                  onClick={() => setShowDepositModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn flex-fill rounded-4"
                  style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(59, 130, 246, 0.5)',
                    color: '#3b82f6'
                  }}
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

      {/* UPI Deposit Modal */}
      {showUpiModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0" style={{
              background: 'rgba(60, 58, 58, 0.03)',
              border: '1px solid rgba(124, 124, 124, 0.39)',
              backdropFilter: 'blur(20px)',
              boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
            }}>
              <div className="modal-header border-0" style={{
                background: 'transparent',
                borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
              }}>
                <h5 className="modal-title fs-6 fs-md-5 text-white">Deposit using UPI</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowUpiModal(false)}
                ></button>
              </div>
              <div className="modal-body p-3 p-md-4" style={{ color: '#e2e8f0' }}>
                <div className="text-center mb-3">
                  <img src="/upi.jpg" alt="UPI QR" style={{ maxWidth: '220px', width: '100%' }} />
                  <div className="small text-white-50 mt-2">Scan the QR with your UPI app and pay</div>
                </div>
                <div className="row g-2">
                  <div className="col-12">
                    <label className="form-label small fw-medium text-white">UPI Transaction ID</label>
                    <input
                      className="form-control rounded-4"
                      style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        color: '#e2e8f0'
                      }}
                      placeholder="Enter UPI transaction/reference ID"
                      value={upiTxnId}
                      onChange={(e) => setUpiTxnId(e.target.value)}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-medium text-white">Amount (₹)</label>
                    <input
                      type="number"
                      className="form-control rounded-4"
                      style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        color: '#e2e8f0'
                      }}
                      placeholder={`Enter amount (min: ₹${MIN_DEPOSIT_AMOUNT})`}
                      min={MIN_DEPOSIT_AMOUNT}
                      value={upiAmount}
                      onChange={(e) => setUpiAmount(e.target.value)}
                    />
                  </div>
                </div>
                <div className="alert mt-3 rounded-4" style={{
                  background: 'rgba(251, 191, 36, 0.1)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  color: '#e2e8f0'
                }}>
                  <small>
                    After submitting, your UPI deposit will be reviewed. Money will be added to your wallet within 24 hours once verified.
                  </small>
                </div>
              </div>
              <div className="modal-footer d-flex gap-2 p-3 p-md-4 border-0" style={{
                background: 'transparent',
                borderTop: '1px solid rgba(124, 124, 124, 0.39)'
              }}>
                <button
                  className="btn flex-fill rounded-4"
                  style={{
                    background: 'rgba(60, 58, 58, 0.03)',
                    border: '1px solid rgba(124, 124, 124, 0.39)',
                    color: '#e2e8f0'
                  }}
                  onClick={() => setShowUpiModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn flex-fill rounded-4"
                  style={{
                    background: 'rgba(34, 197, 94, 0.2)',
                    border: '1px solid rgba(34, 197, 94, 0.5)',
                    color: '#22c55e'
                  }}
                  disabled={loading || !upiTxnId || !upiAmount || parseFloat(upiAmount) < MIN_DEPOSIT_AMOUNT}
                  onClick={async () => {
                    try {
                      setLoading(true);
                      await api.post('/wallet/upi-deposit', {
                        uid: user.uid,
                        upiTransactionId: upiTxnId.trim(),
                        amount: parseFloat(upiAmount)
                      });
                      alert('UPI deposit submitted. We will verify and credit within 24 hours.');
                      setUpiTxnId('');
                      setUpiAmount('');
                      setShowUpiModal(false);
                      fetchUpiDeposits();
                    } catch (e) {
                      console.error('UPI deposit error:', e);
                      alert(e?.message || 'Failed to submit UPI deposit');
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Submit
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
            <div className="modal-content border-0" style={{
              background: 'rgba(60, 58, 58, 0.03)',
              border: '1px solid rgba(124, 124, 124, 0.39)',
              backdropFilter: 'blur(20px)',
              boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
            }}>
              <div className="modal-header border-0" style={{
                background: 'transparent',
                borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
              }}>
                <h5 className="modal-title fs-6 fs-md-5 text-white">
                  Withdraw from {withdrawType === 'wallet' ? 'Wallet' : 'Referral Balance'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowWithdrawModal(false)}
                ></button>
              </div>
              <div className="modal-body p-3 p-md-4" style={{ color: '#e2e8f0' }}>
                {/* Validation Alert */}
                {(() => {
                  const validation = canWithdraw();
                  if (!validation.canWithdraw) {
                    return (
                      <div className={`alert mb-4 rounded-4`} style={{
                        background: validation.type === 'profile' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        border: validation.type === 'profile' ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#e2e8f0'
                      }}>
                        <i className={`bi ${validation.type === 'profile' ? 'bi-person-exclamation' : 'bi-shield-exclamation'} me-2`}></i>
                        <strong className="text-white">{validation.message}</strong>
                        {validation.type === 'profile' && (
                          <div className="mt-2">
                            <button
                              className="btn btn-sm rounded-4"
                              style={{
                                background: 'rgba(251, 191, 36, 0.2)',
                                border: '1px solid rgba(251, 191, 36, 0.5)',
                                color: '#fbbf24'
                              }}
                              onClick={() => {
                                setShowWithdrawModal(false);
                                // Navigate to profile setup
                                window.location.href = '/profile-setup';
                              }}
                            >
                              Complete Profile
                            </button>
                          </div>
                        )}
                        {validation.type === 'kyc' && (
                          <div className="mt-2">
                            <button
                              className="btn btn-sm rounded-4"
                              style={{
                                background: 'rgba(239, 68, 68, 0.2)',
                                border: '1px solid rgba(239, 68, 68, 0.5)',
                                color: '#ef4444'
                              }}
                              onClick={() => {
                                setShowWithdrawModal(false);
                                // Navigate to KYC verification
                                window.location.href = '/kyc-verification';
                              }}
                            >
                              Check KYC Status
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Balance Type Selection */}
                <div className="mb-4">
                  <label className="form-label small fw-medium text-white">Select Balance Type</label>
                  <div className="d-flex flex-column flex-md-row gap-2 gap-md-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="withdrawType"
                        id="walletBalance"
                        value="wallet"
                        checked={withdrawType === 'wallet'}
                        onChange={(e) => setWithdrawType(e.target.value)}
                        style={{
                          accentColor: '#3b82f6'
                        }}
                      />
                      <label className="form-check-label small text-white" htmlFor="walletBalance">
                        Trading Profit (₹{walletData.walletBalance.toFixed(2)})
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
                        style={{
                          accentColor: '#3b82f6'
                        }}
                      />
                      <label className="form-check-label small text-white" htmlFor="referralBalance">
                        Referral Balance (₹{walletData.referralBalance.toFixed(2)})
                      </label>
                    </div>
                  </div>
                </div>

                {/* Amount Input */}
                <div className="mb-4">
                  <label className="form-label small fw-medium text-white">Amount (₹)</label>
                  <input
                    type="number"
                    className="form-control form-control-lg rounded-4"
                    style={{
                      background: 'rgba(60, 58, 58, 0.03)',
                      border: '1px solid rgba(124, 124, 124, 0.39)',
                      color: '#e2e8f0'
                    }}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder={`Enter amount (min: ₹${MIN_WITHDRAWAL_AMOUNT})`}
                    min={MIN_WITHDRAWAL_AMOUNT}
                    max={withdrawType === 'wallet' ? walletData.walletBalance : walletData.referralBalance}
                  />
                  <small className="text-white-50 small">
                    Available: ₹{withdrawType === 'wallet' ? walletData.walletBalance.toFixed(2) : walletData.referralBalance.toFixed(2)}
                  </small>
                </div>

                {/* Bank Details for Wallet Withdrawal */}
                {withdrawType === 'wallet' && (
                  <div className="mb-4">
                    <label className="form-label small fw-medium text-white">Bank Account Details</label>

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
                            style={{
                              accentColor: '#3b82f6'
                            }}
                          />
                          <label className="form-check-label text-white" htmlFor="useSavedBank">
                            Use Saved Bank Account
                          </label>
                        </div>
                        {!useNewBank && (
                          <select
                            className="form-select mt-2 rounded-4"
                            style={{
                              background: 'rgba(60, 58, 58, 0.03)',
                              border: '1px solid rgba(124, 124, 124, 0.39)',
                              color: '#e2e8f0'
                            }}
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
                        style={{
                          accentColor: '#3b82f6'
                        }}
                      />
                      <label className="form-check-label text-white" htmlFor="useNewBank">
                        Add New Bank Account
                      </label>
                    </div>

                    {/* New Bank Form */}
                    {useNewBank && (
                      <div className="mt-3 p-3 rounded-4" style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)'
                      }}>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label className="form-label text-white">Bank Name *</label>
                            <input
                              type="text"
                              className="form-control rounded-4"
                              style={{
                                background: 'rgba(60, 58, 58, 0.03)',
                                border: '1px solid rgba(124, 124, 124, 0.39)',
                                color: '#e2e8f0'
                              }}
                              value={bankDetails.bankName}
                              onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                              placeholder="Enter bank name"
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label text-white">Account Number *</label>
                            <input
                              type="text"
                              className="form-control rounded-4"
                              style={{
                                background: 'rgba(60, 58, 58, 0.03)',
                                border: '1px solid rgba(124, 124, 124, 0.39)',
                                color: '#e2e8f0'
                              }}
                              value={bankDetails.accountNumber}
                              onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                              placeholder="Enter account number"
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label text-white">IFSC Code *</label>
                            <input
                              type="text"
                              className="form-control rounded-4"
                              style={{
                                background: 'rgba(60, 58, 58, 0.03)',
                                border: '1px solid rgba(124, 124, 124, 0.39)',
                                color: '#e2e8f0'
                              }}
                              value={bankDetails.ifscCode}
                              onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value.toUpperCase() })}
                              placeholder="Enter IFSC code"
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label className="form-label text-white">Account Holder Name *</label>
                            <input
                              type="text"
                              className="form-control rounded-4"
                              style={{
                                background: 'rgba(60, 58, 58, 0.03)',
                                border: '1px solid rgba(124, 124, 124, 0.39)',
                                color: '#e2e8f0'
                              }}
                              value={bankDetails.accountHolderName}
                              onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
                              placeholder="Enter account holder name"
                            />
                          </div>
                          <div className="col-md-12 mb-3">
                            <label className="form-label text-white">UPI ID (Optional)</label>
                            <input
                              type="text"
                              className="form-control rounded-4"
                              style={{
                                background: 'rgba(60, 58, 58, 0.03)',
                                border: '1px solid rgba(124, 124, 124, 0.39)',
                                color: '#e2e8f0'
                              }}
                              value={bankDetails.upiId}
                              onChange={(e) => setBankDetails({ ...bankDetails, upiId: e.target.value })}
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
                            style={{
                              accentColor: '#3b82f6'
                            }}
                          />
                          <label className="form-check-label text-white" htmlFor="saveBankDetails">
                            <i className="bi bi-shield-check me-1"></i>
                            Save bank details securely for future withdrawals
                          </label>
                        </div>
                        <small className="text-white-50">
                          <i className="bi bi-info-circle me-1"></i>
                          Your bank details are encrypted and stored securely. You can delete them anytime from your profile.
                        </small>
                      </div>
                    )}
                  </div>
                )}

                {/* Referral Withdrawal Warning */}
                {withdrawType === 'referral' && walletData.totalDeposits === 0 && (
                  <div className="alert rounded-4" style={{
                    background: 'rgba(251, 191, 36, 0.1)',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                    color: '#e2e8f0'
                  }}>
                    <small>
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      You must make at least one deposit before withdrawing referral bonus
                    </small>
                  </div>
                )}
              </div>
              <div className="modal-footer d-flex gap-2 p-3 p-md-4 border-0" style={{
                background: 'transparent',
                borderTop: '1px solid rgba(124, 124, 124, 0.39)'
              }}>
                <button
                  type="button"
                  className="btn flex-fill rounded-4"
                  style={{
                    background: 'rgba(60, 58, 58, 0.03)',
                    border: '1px solid rgba(124, 124, 124, 0.39)',
                    color: '#e2e8f0'
                  }}
                  onClick={() => setShowWithdrawModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn flex-fill rounded-4"
                  style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(59, 130, 246, 0.5)',
                    color: '#3b82f6'
                  }}
                  onClick={handleWithdraw}
                  disabled={loading || !withdrawAmount || parseFloat(withdrawAmount) < MIN_WITHDRAWAL_AMOUNT || !canWithdraw().canWithdraw}
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
