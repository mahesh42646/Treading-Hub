'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../../services/api';

export default function DashboardTradingAccount() {
  const { profile, user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [plans, setPlans] = useState([]);
  const [walletData, setWalletData] = useState({
    walletBalance: 0,
    referralBalance: 0
  });
  const [subscription, setSubscription] = useState(null);
  const [tradingAccount, setTradingAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState({
    walletAmount: 0,
    referralAmount: 0
  });

  // Check if profile is complete
  const isProfileComplete = () => {
    if (!profile) return false;
    const completion = profile.profileCompletion;
    return completion?.personalInfo && 
           completion?.kycDocuments && 
           completion?.kycStatus === 'approved';
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch wallet data
      const walletResponse = await api.get(`/wallet/balance/${user.uid}`);
      setWalletData({
        walletBalance: walletResponse.walletBalance || 0,
        referralBalance: walletResponse.referralBalance || 0
      });

      // Fetch current subscription
      const subResponse = await api.get(`/subscription/current/${user.uid}`);
      if (subResponse.subscription) {
        setSubscription(subResponse.subscription);
        
        // If has subscription, fetch trading account
        const tradingResponse = await api.get(`/trading-account/user/${user.uid}`);
        if (tradingResponse.tradingAccount) {
          setTradingAccount(tradingResponse.tradingAccount);
        }
      } else {
        // Fetch available plans
        const plansResponse = await api.get('/plans/active');
        setPlans(plansResponse.plans || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setPaymentMethod({
      walletAmount: Math.min(plan.price, walletData.walletBalance),
      referralAmount: Math.max(0, plan.price - Math.min(plan.price, walletData.walletBalance))
    });
    setShowPlanModal(true);
  };

  const handlePurchasePlan = async () => {
    try {
      const totalPayment = paymentMethod.walletAmount + paymentMethod.referralAmount;
      
      if (totalPayment < selectedPlan.price) {
        alert('Insufficient balance. Please add money to your wallet.');
        return;
      }

      const response = await api.post('/subscription/purchase', {
        planId: selectedPlan._id,
        paymentMethod: paymentMethod
      });

      if (response.success) {
        alert('Plan purchased successfully!');
        setShowPlanModal(false);
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error('Error purchasing plan:', error);
      alert('Failed to purchase plan. Please try again.');
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
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-1">Trading Account</h2>
              <p className="text-muted mb-0">
                {!isProfileComplete() 
                  ? "Complete your profile to access trading plans" 
                  : subscription 
                    ? "Manage your trading account and monitor performance"
                    : "Choose a plan to get started with trading"
                }
              </p>
            </div>
            {subscription && tradingAccount && (
              <div className="d-flex gap-2">
                <button className="btn btn-success">
                  <i className="bi bi-check-circle me-2"></i>
                  Active Plan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Incomplete Warning */}
      {!isProfileComplete() && (
        <div className="row">
          <div className="col-12">
            <div className="alert alert-warning">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h5 className="alert-heading">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Complete Your Profile
                  </h5>
                  <p className="mb-0">
                    You need to complete your profile and get KYC approved before you can purchase trading plans.
                  </p>
                  <small className="text-muted">
                    Make sure to fill all personal information and upload required KYC documents.
                  </small>
                </div>
                <div className="col-md-4 text-end">
                  <a href="/dashboard/profile" className="btn btn-warning">
                    <i className="bi bi-person-check me-2"></i>
                    Complete Profile
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No Subscription - Show Plans */}
      {isProfileComplete() && !subscription && (
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title mb-3">
                  <i className="bi bi-star me-2"></i>
                  Choose Your Trading Plan
                </h5>
                <p className="text-muted">
                  Select a plan that suits your trading needs. All plans include access to professional trading accounts.
                </p>
                
                {/* Wallet Balance Display */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="card border-0 bg-primary bg-opacity-10">
                      <div className="card-body text-center">
                        <h5 className="text-primary">₹{walletData.walletBalance.toFixed(2)}</h5>
                        <small className="text-muted">Wallet Balance</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card border-0 bg-warning bg-opacity-10">
                      <div className="card-body text-center">
                        <h5 className="text-warning">₹{walletData.referralBalance.toFixed(2)}</h5>
                        <small className="text-muted">Referral Balance</small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Plans Grid */}
                <div className="row">
                  {plans.map((plan) => (
                    <div key={plan._id} className="col-lg-4 col-md-6 mb-4">
                      <div className="card border-0 shadow-sm h-100">
                        <div className="card-body">
                          <div className="text-center mb-3">
                            <h5 className="card-title">{plan.name}</h5>
                            <h3 className="text-primary">₹{plan.price}</h3>
                            <small className="text-muted">{plan.duration} days</small>
                          </div>
                          
                          <p className="text-muted small">{plan.description}</p>
                          
                          {plan.features && plan.features.length > 0 && (
                            <ul className="list-unstyled small mb-3">
                              {plan.features.map((feature, idx) => (
                                <li key={idx} className="mb-1">
                                  <i className="bi bi-check-circle text-success me-2"></i>
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          )}
                          
                          <div className="d-grid">
                            <button 
                              className="btn btn-primary"
                              onClick={() => handlePlanSelect(plan)}
                              disabled={walletData.walletBalance + walletData.referralBalance < plan.price}
                            >
                              {walletData.walletBalance + walletData.referralBalance >= plan.price 
                                ? 'Get Plan' 
                                : 'Insufficient Balance'
                              }
                            </button>
                          </div>
                          
                          {walletData.walletBalance + walletData.referralBalance < plan.price && (
                            <div className="text-center mt-2">
                              <a href="/dashboard/wallet" className="btn btn-sm btn-outline-primary">
                                <i className="bi bi-plus-circle me-1"></i>
                                Add Money
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Has Subscription - Show Trading Account */}
      {subscription && (
        <div className="row">
          <div className="col-12">
            {/* Subscription Status */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <h5 className="mb-1">
                      <i className="bi bi-star-fill text-warning me-2"></i>
                      {subscription.planName} Plan
                    </h5>
                    <p className="text-muted mb-1">
                      Active until {new Date(subscription.expiryDate).toLocaleDateString()}
                    </p>
                    <small className="text-success">
                      <i className="bi bi-check-circle me-1"></i>
                      Subscription Active
                    </small>
                  </div>
                  <div className="col-md-4 text-end">
                    <span className={`badge bg-${subscription.status === 'active' ? 'success' : 'danger'} fs-6`}>
                      {subscription.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trading Account Details */}
            {tradingAccount ? (
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title mb-4">
                    <i className="bi bi-graph-up me-2"></i>
                    Your Trading Account
                  </h5>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <div className="card border-0 bg-light">
                        <div className="card-body">
                          <h6 className="card-title">Account Details</h6>
                          <table className="table table-borderless table-sm">
                            <tbody>
                              <tr>
                                <td><strong>Account Name:</strong></td>
                                <td>{tradingAccount.accountName}</td>
                              </tr>
                              <tr>
                                <td><strong>Broker:</strong></td>
                                <td>{tradingAccount.brokerName}</td>
                              </tr>
                              <tr>
                                <td><strong>Platform:</strong></td>
                                <td>{tradingAccount.platform}</td>
                              </tr>
                              <tr>
                                <td><strong>Account Type:</strong></td>
                                <td>
                                  <span className={`badge bg-${tradingAccount.accountType === 'Demo' ? 'info' : 'success'}`}>
                                    {tradingAccount.accountType}
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td><strong>Balance:</strong></td>
                                <td>{tradingAccount.currency} {tradingAccount.balance.toLocaleString()}</td>
                              </tr>
                              <tr>
                                <td><strong>Leverage:</strong></td>
                                <td>{tradingAccount.leverage}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="card border-0 bg-light">
                        <div className="card-body">
                          <h6 className="card-title">Login Credentials</h6>
                          <table className="table table-borderless table-sm">
                            <tbody>
                              <tr>
                                <td><strong>Server ID:</strong></td>
                                <td>{tradingAccount.serverId}</td>
                              </tr>
                              <tr>
                                <td><strong>Login ID:</strong></td>
                                <td>{tradingAccount.loginId}</td>
                              </tr>
                              <tr>
                                <td><strong>Password:</strong></td>
                                <td>
                                  <code className="user-select-all">{tradingAccount.password}</code>
                                </td>
                              </tr>
                              {tradingAccount.serverAddress && (
                                <tr>
                                  <td><strong>Server:</strong></td>
                                  <td>{tradingAccount.serverAddress}</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                          
                          <div className="alert alert-info mt-3">
                            <small>
                              <i className="bi bi-info-circle me-1"></i>
                              Use these credentials to log into {tradingAccount.platform} or your preferred trading platform.
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {tradingAccount.notes && (
                    <div className="mt-3">
                      <div className="alert alert-warning">
                        <strong>Important Notes:</strong><br/>
                        {tradingAccount.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="card border-0 shadow-sm">
                <div className="card-body text-center py-5">
                  <i className="bi bi-clock-history fs-1 text-muted mb-3"></i>
                  <h5>Trading Account Being Prepared</h5>
                  <p className="text-muted">
                    Your trading account is being set up by our admin team. You will receive the account details shortly.
                  </p>
                  <small className="text-muted">
                    This usually takes 24-48 hours after subscription activation.
                  </small>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Plan Purchase Modal */}
      {showPlanModal && selectedPlan && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Purchase {selectedPlan.name} Plan</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowPlanModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="card border-0 bg-light">
                      <div className="card-body">
                        <h6 className="card-title">Plan Details</h6>
                        <p><strong>Name:</strong> {selectedPlan.name}</p>
                        <p><strong>Price:</strong> ₹{selectedPlan.price}</p>
                        <p><strong>Duration:</strong> {selectedPlan.duration} days</p>
                        <p><strong>Description:</strong> {selectedPlan.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card border-0 bg-light">
                      <div className="card-body">
                        <h6 className="card-title">Payment Method</h6>
                        
                        <div className="mb-3">
                          <label className="form-label">From Wallet Balance</label>
                          <div className="input-group">
                            <span className="input-group-text">₹</span>
                            <input
                              type="number"
                              className="form-control"
                              value={paymentMethod.walletAmount}
                              onChange={(e) => {
                                const walletAmt = Math.min(parseFloat(e.target.value) || 0, walletData.walletBalance, selectedPlan.price);
                                setPaymentMethod({
                                  walletAmount: walletAmt,
                                  referralAmount: Math.max(0, selectedPlan.price - walletAmt)
                                });
                              }}
                              max={Math.min(walletData.walletBalance, selectedPlan.price)}
                            />
                          </div>
                          <small className="text-muted">Available: ₹{walletData.walletBalance}</small>
                        </div>

                        <div className="mb-3">
                          <label className="form-label">From Referral Balance</label>
                          <div className="input-group">
                            <span className="input-group-text">₹</span>
                            <input
                              type="number"
                              className="form-control"
                              value={paymentMethod.referralAmount}
                              onChange={(e) => {
                                const referralAmt = Math.min(parseFloat(e.target.value) || 0, walletData.referralBalance, selectedPlan.price);
                                setPaymentMethod({
                                  referralAmount: referralAmt,
                                  walletAmount: Math.max(0, selectedPlan.price - referralAmt)
                                });
                              }}
                              max={Math.min(walletData.referralBalance, selectedPlan.price)}
                            />
                          </div>
                          <small className="text-muted">Available: ₹{walletData.referralBalance}</small>
                        </div>

                        <div className="alert alert-info">
                          <strong>Total Payment:</strong> ₹{(paymentMethod.walletAmount + paymentMethod.referralAmount).toFixed(2)} / ₹{selectedPlan.price}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowPlanModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handlePurchasePlan}
                  disabled={paymentMethod.walletAmount + paymentMethod.referralAmount < selectedPlan.price}
                >
                  Purchase Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
