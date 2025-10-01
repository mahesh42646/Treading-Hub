'use client';

import React, { useState, useEffect } from 'react';
import { baseUrl } from '../../../../utils/config';

const AdminTradingDataPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive
  const [searchTerm, setSearchTerm] = useState('');
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
    },
    adminNotes: '',
    isActive: true
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(baseUrl('/admin/trading-data/users'), {
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        setUsers(result.users || []);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = async (user) => {
    setSelectedUser(user);
    try {
      const response = await fetch(baseUrl(`/admin/users/${user.uid}/trading-data`), {
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        setTradingData(result.tradingData || tradingData);
      }
    } catch (error) {
      console.error('Error fetching trading data:', error);
    }
    setShowModal(true);
  };

  const handleInputChange = (section, field, value) => {
    setTradingData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch(baseUrl(`/admin/users/${selectedUser.uid}/trading-data`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(tradingData)
      });

      if (response.ok) {
        alert('Trading data updated successfully!');
        setShowModal(false);
        fetchUsers();
      } else {
        alert('Failed to update trading data');
      }
    } catch (error) {
      console.error('Error updating trading data:', error);
      alert('Error updating trading data');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to reset this user\'s trading data? This action cannot be undone.')) {
      try {
        setSaving(true);
        const response = await fetch(baseUrl(`/admin/users/${selectedUser.uid}/trading-data`), {
          method: 'DELETE',
          credentials: 'include'
        });

        if (response.ok) {
          alert('Trading data reset successfully!');
          setShowModal(false);
          fetchUsers();
        } else {
          alert('Failed to reset trading data');
        }
      } catch (error) {
        console.error('Error resetting trading data:', error);
        alert('Error resetting trading data');
      } finally {
        setSaving(false);
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && user.hasTradingData) ||
      (filterStatus === 'inactive' && !user.hasTradingData);
    
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.uid.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

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
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-white">Trading Data Management</h2>
        <div className="d-flex gap-2">
          <span className="badge bg-primary">{users.length} Total Users</span>
          <span className="badge bg-success">{users.filter(u => u.hasTradingData).length} With Data</span>
          <span className="badge bg-secondary">{users.filter(u => !u.hasTradingData).length} Without Data</span>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-4">
          <select
            className="form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              border: '1px solid rgba(124, 124, 124, 0.39)',
              color: 'white'
            }}
          >
            <option value="all" style={{ background: 'rgba(0, 0, 0, 0.8)', color: 'white' }}>All Users</option>
            <option value="active" style={{ background: 'rgba(0, 0, 0, 0.8)', color: 'white' }}>With Trading Data</option>
            <option value="inactive" style={{ background: 'rgba(0, 0, 0, 0.8)', color: 'white' }}>Without Trading Data</option>
          </select>
        </div>
        <div className="col-md-8">
          <input
            type="text"
            className="form-control"
            placeholder="Search users by email or UID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              border: '1px solid rgba(124, 124, 124, 0.39)',
              color: 'white'
            }}
          />
        </div>
      </div>

      {/* Users List */}
      <div className="card" style={{
        background: 'rgba(60, 58, 58, 0.03)',
        border: '1px solid rgba(124, 124, 124, 0.39)',
        backdropFilter: 'blur(20px)',
        boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
      }}>
        <div className="card-body">
          {filteredUsers.length > 0 ? (
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
                    <th className="text-white" style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>User</th>
                    <th className="text-white" style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>Status</th>
                    <th className="text-white" style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>Account Type</th>
                    <th className="text-white" style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>Broker</th>
                    <th className="text-white" style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>Net Profit</th>
                    <th className="text-white" style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>Win Rate</th>
                    <th className="text-white" style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>Total Trades</th>
                    <th className="text-white" style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.uid} style={{
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      color: 'white',
                      borderColor: 'rgba(124, 124, 124, 0.39)'
                    }}>
                      <td style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>
                        <div>
                          <div className="text-white">{user.email}</div>
                          <small className="text-white-50">{user.uid}</small>
                        </div>
                      </td>
                      <td style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>
                        <span className={`badge ${user.hasTradingData ? 'bg-success' : 'bg-secondary'}`}>
                          {user.hasTradingData ? 'Active' : 'No Data'}
                        </span>
                      </td>
                      <td className="text-white-50" style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>
                        {user.tradingData?.accountInfo?.accountType || 'N/A'}
                      </td>
                      <td className="text-white-50" style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>
                        {user.tradingData?.accountInfo?.brokerName || 'N/A'}
                      </td>
                      <td className="text-white" style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>
                        ${user.tradingData?.allTimeStats?.netProfit?.toFixed(2) || '0.00'}
                      </td>
                      <td className="text-white" style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>
                        {user.tradingData?.allTimeStats?.winRate?.toFixed(1) || '0.0'}%
                      </td>
                      <td className="text-white" style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>
                        {user.tradingData?.allTimeStats?.totalTrades || 0}
                      </td>
                      <td style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-sm"
                            style={{
                              background: 'rgba(59, 130, 246, 0.2)',
                              border: '1px solid rgba(59, 130, 246, 0.5)',
                              color: '#3b82f6'
                            }}
                            onClick={() => openModal(user)}
                          >
                            {user.hasTradingData ? 'Edit' : 'Add Data'}
                          </button>
                          {user.hasTradingData && (
                            <button
                              className="btn btn-sm"
                              style={{
                                background: 'rgba(239, 68, 68, 0.2)',
                                border: '1px solid rgba(239, 68, 68, 0.5)',
                                color: '#ef4444'
                              }}
                              onClick={() => {
                                if (window.confirm('Reset trading data for this user?')) {
                                  setSelectedUser(user);
                                  handleDelete();
                                }
                              }}
                            >
                              Reset
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4">
              <i className="bi bi-graph-up text-white-50" style={{ fontSize: '3rem' }}></i>
              <p className="text-white-50 mt-3">No users found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      {/* Trading Data Modal */}
      {showModal && selectedUser && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content" style={{
              background: 'rgba(0, 0, 0, 0.95)',
              border: '1px solid rgba(124, 124, 124, 0.39)',
              backdropFilter: 'blur(20px)',
              color: 'white'
            }}>
              <div className="modal-header" style={{
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
              }}>
                <h5 className="modal-title text-white">Trading Data - {selectedUser.email}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body" style={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                maxHeight: '70vh',
                overflowY: 'auto'
              }}>
                <div className="row">
                  {/* Account Information */}
                  <div className="col-md-6 mb-4">
                    <h6 className="text-white mb-3">Account Information</h6>
                    <div className="row">
                      <div className="col-6 mb-3">
                        <label className="form-label text-white-50">Account Type</label>
                        <select
                          className="form-select"
                          value={tradingData.accountInfo.accountType}
                          onChange={(e) => handleInputChange('accountInfo', 'accountType', e.target.value)}
                          style={{
                            background: 'rgba(0, 0, 0, 0.6)',
                            border: '1px solid rgba(124, 124, 124, 0.39)',
                            color: 'white'
                          }}
                        >
                          <option value="demo" style={{ background: 'rgba(0, 0, 0, 0.8)', color: 'white' }}>Demo</option>
                          <option value="live" style={{ background: 'rgba(0, 0, 0, 0.8)', color: 'white' }}>Live</option>
                          <option value="funded" style={{ background: 'rgba(0, 0, 0, 0.8)', color: 'white' }}>Funded</option>
                        </select>
                      </div>
                      <div className="col-6 mb-3">
                        <label className="form-label text-white-50">Broker Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={tradingData.accountInfo.brokerName}
                          onChange={(e) => handleInputChange('accountInfo', 'brokerName', e.target.value)}
                          style={{
                            background: 'rgba(0, 0, 0, 0.6)',
                            border: '1px solid rgba(124, 124, 124, 0.39)',
                            color: 'white'
                          }}
                        />
                      </div>
                      <div className="col-6 mb-3">
                        <label className="form-label text-white-50">Account Number</label>
                        <input
                          type="text"
                          className="form-control"
                          value={tradingData.accountInfo.accountNumber}
                          onChange={(e) => handleInputChange('accountInfo', 'accountNumber', e.target.value)}
                          style={{
                            background: 'rgba(0, 0, 0, 0.6)',
                            border: '1px solid rgba(124, 124, 124, 0.39)',
                            color: 'white'
                          }}
                        />
                      </div>
                      <div className="col-6 mb-3">
                        <label className="form-label text-white-50">Account Balance</label>
                        <input
                          type="number"
                          className="form-control"
                          value={tradingData.accountInfo.accountBalance}
                          onChange={(e) => handleInputChange('accountInfo', 'accountBalance', parseFloat(e.target.value) || 0)}
                          style={{
                            background: 'rgba(0, 0, 0, 0.6)',
                            border: '1px solid rgba(124, 124, 124, 0.39)',
                            color: 'white'
                          }}
                        />
                      </div>
                      <div className="col-6 mb-3">
                        <label className="form-label text-white-50">Currency</label>
                        <input
                          type="text"
                          className="form-control"
                          value={tradingData.accountInfo.currency}
                          onChange={(e) => handleInputChange('accountInfo', 'currency', e.target.value)}
                          style={{
                            background: 'rgba(0, 0, 0, 0.6)',
                            border: '1px solid rgba(124, 124, 124, 0.39)',
                            color: 'white'
                          }}
                        />
                      </div>
                      <div className="col-6 mb-3">
                        <label className="form-label text-white-50">Leverage</label>
                        <input
                          type="text"
                          className="form-control"
                          value={tradingData.accountInfo.leverage}
                          onChange={(e) => handleInputChange('accountInfo', 'leverage', e.target.value)}
                          style={{
                            background: 'rgba(0, 0, 0, 0.6)',
                            border: '1px solid rgba(124, 124, 124, 0.39)',
                            color: 'white'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* All Time Stats */}
                  <div className="col-md-6 mb-4">
                    <h6 className="text-white mb-3">All Time Statistics</h6>
                    <div className="row">
                      <div className="col-6 mb-3">
                        <label className="form-label text-white-50">Total Trades</label>
                        <input
                          type="number"
                          className="form-control"
                          value={tradingData.allTimeStats.totalTrades}
                          onChange={(e) => handleInputChange('allTimeStats', 'totalTrades', parseInt(e.target.value) || 0)}
                          style={{
                            background: 'rgba(0, 0, 0, 0.6)',
                            border: '1px solid rgba(124, 124, 124, 0.39)',
                            color: 'white'
                          }}
                        />
                      </div>
                      <div className="col-6 mb-3">
                        <label className="form-label text-white-50">Winning Trades</label>
                        <input
                          type="number"
                          className="form-control"
                          value={tradingData.allTimeStats.winningTrades}
                          onChange={(e) => handleInputChange('allTimeStats', 'winningTrades', parseInt(e.target.value) || 0)}
                          style={{
                            background: 'rgba(0, 0, 0, 0.6)',
                            border: '1px solid rgba(124, 124, 124, 0.39)',
                            color: 'white'
                          }}
                        />
                      </div>
                      <div className="col-6 mb-3">
                        <label className="form-label text-white-50">Total Profit</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          value={tradingData.allTimeStats.totalProfit}
                          onChange={(e) => handleInputChange('allTimeStats', 'totalProfit', parseFloat(e.target.value) || 0)}
                          style={{
                            background: 'rgba(0, 0, 0, 0.6)',
                            border: '1px solid rgba(124, 124, 124, 0.39)',
                            color: 'white'
                          }}
                        />
                      </div>
                      <div className="col-6 mb-3">
                        <label className="form-label text-white-50">Total Loss</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          value={tradingData.allTimeStats.totalLoss}
                          onChange={(e) => handleInputChange('allTimeStats', 'totalLoss', parseFloat(e.target.value) || 0)}
                          style={{
                            background: 'rgba(0, 0, 0, 0.6)',
                            border: '1px solid rgba(124, 124, 124, 0.39)',
                            color: 'white'
                          }}
                        />
                      </div>
                      <div className="col-6 mb-3">
                        <label className="form-label text-white-50">Net Profit</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          value={tradingData.allTimeStats.netProfit}
                          onChange={(e) => handleInputChange('allTimeStats', 'netProfit', parseFloat(e.target.value) || 0)}
                          style={{
                            background: 'rgba(0, 0, 0, 0.6)',
                            border: '1px solid rgba(124, 124, 124, 0.39)',
                            color: 'white'
                          }}
                        />
                      </div>
                      <div className="col-6 mb-3">
                        <label className="form-label text-white-50">Win Rate (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          className="form-control"
                          value={tradingData.allTimeStats.winRate}
                          onChange={(e) => handleInputChange('allTimeStats', 'winRate', parseFloat(e.target.value) || 0)}
                          style={{
                            background: 'rgba(0, 0, 0, 0.6)',
                            border: '1px solid rgba(124, 124, 124, 0.39)',
                            color: 'white'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Last 7 Days */}
                  <div className="col-md-6 mb-4">
                    <h6 className="text-white mb-3">Last 7 Days</h6>
                    <div className="row">
                      <div className="col-6 mb-3">
                        <label className="form-label text-white-50">Total Trades</label>
                        <input
                          type="number"
                          className="form-control"
                          value={tradingData.last7Days.totalTrades}
                          onChange={(e) => handleInputChange('last7Days', 'totalTrades', parseInt(e.target.value) || 0)}
                          style={{
                            background: 'rgba(0, 0, 0, 0.6)',
                            border: '1px solid rgba(124, 124, 124, 0.39)',
                            color: 'white'
                          }}
                        />
                      </div>
                      <div className="col-6 mb-3">
                        <label className="form-label text-white-50">Net Profit</label>
                        <input
                          type="number"
                          step="0.01"
                          className="form-control"
                          value={tradingData.last7Days.netProfit}
                          onChange={(e) => handleInputChange('last7Days', 'netProfit', parseFloat(e.target.value) || 0)}
                          style={{
                            background: 'rgba(0, 0, 0, 0.6)',
                            border: '1px solid rgba(124, 124, 124, 0.39)',
                            color: 'white'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Admin Notes */}
                  <div className="col-12 mb-4">
                    <h6 className="text-white mb-3">Admin Notes</h6>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={tradingData.adminNotes}
                      onChange={(e) => setTradingData(prev => ({ ...prev, adminNotes: e.target.value }))}
                      placeholder="Add admin notes about this user's trading performance..."
                      style={{
                        background: 'rgba(0, 0, 0, 0.6)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        color: 'white'
                      }}
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                borderTop: '1px solid rgba(124, 124, 124, 0.39)'
              }}>
                <div className="d-flex gap-2">
                  <button
                    className="btn"
                    style={{
                      background: 'rgba(34, 197, 94, 0.2)',
                      border: '1px solid rgba(34, 197, 94, 0.5)',
                      color: '#22c55e'
                    }}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  {selectedUser?.hasTradingData && (
                    <button
                      className="btn"
                      style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.5)',
                        color: '#ef4444'
                      }}
                      onClick={handleDelete}
                      disabled={saving}
                    >
                      {saving ? 'Resetting...' : 'Reset Data'}
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTradingDataPage;
