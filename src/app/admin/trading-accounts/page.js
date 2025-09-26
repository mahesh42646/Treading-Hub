'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaUser, 
  FaUserCheck, 
  FaEye,
  FaSpinner,
  FaSearch,
  FaFilter
} from 'react-icons/fa';

const AdminTradingAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAssigned, setFilterAssigned] = useState('');
  const [filterBroker, setFilterBroker] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [users, setUsers] = useState([]);
  const [userChallenges, setUserChallenges] = useState([]);
  const [selectedUserUid, setSelectedUserUid] = useState('');
  const [selectedChallengeEntryId, setSelectedChallengeEntryId] = useState('');
  const [formData, setFormData] = useState({
    accountName: 'Two Steps',
    brokerName: '',
    serverId: '',
    loginId: '',
    password: '',
    serverAddress: '',
    platform: 'MT5',
    accountType: 'Demo',
    balance: 0,
    leverage: '1:100',
    currency: 'USD',
    notes: ''
  });
  const [editFormData, setEditFormData] = useState({
    accountName: '',
    brokerName: '',
    serverId: '',
    loginId: '',
    password: '',
    serverAddress: '',
    platform: 'MT5',
    accountType: 'Demo',
    balance: 0,
    leverage: '1:100',
    currency: 'USD',
    notes: ''
  });

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        assigned: filterAssigned,
        broker: filterBroker
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/trading-accounts?${params}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts || []);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching trading accounts:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterAssigned, filterBroker]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users?limit=200`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        const baseUsers = Array.isArray(data.users) ? data.users : [];
        // For each user, fetch challenges and keep only those with at least one active, unassigned challenge
        const enriched = await Promise.all(baseUsers.map(async (u) => {
          try {
            const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${u.uid}/challenges`, { credentials: 'include' });
            if (!r.ok) return null;
            const d = await r.json();
            const list = Array.isArray(d.challenges) ? d.challenges : [];
            const eligible = list.filter(ch => ch.status === 'active' && !ch.tradingAccountId);
            if (eligible.length > 0) {
              return { ...u, challengesCount: eligible.length };
            }
            return null;
          } catch (_) {
            return null;
          }
        }));
        setUsers(enriched.filter(Boolean));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
    fetchUsers();
  }, [currentPage, searchTerm, filterAssigned, filterBroker, fetchAccounts, fetchUsers]);

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/trading-accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Trading account created successfully');
        setShowCreateModal(false);
        setFormData({
          accountName: '',
          brokerName: '',
          serverId: '',
          loginId: '',
          password: '',
          serverAddress: '',
          platform: 'MT4',
          accountType: 'Demo',
          balance: 0,
          leverage: '1:100',
          currency: 'USD',
          notes: ''
        });
        fetchAccounts();
      }
    } catch (error) {
      console.error('Error creating trading account:', error);
      alert('Failed to create trading account');
    }
  };

  const handleAssignAccount = async (uid, challengeEntryId) => {
    if (!selectedAccount || !uid || !challengeEntryId) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${uid}/challenges/${challengeEntryId}/assign-trading-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ accountId: selectedAccount._id })
      });

      if (response.ok) {
        alert('Trading account assigned successfully');
        setShowAssignModal(false);
        setSelectedAccount(null);
        setSelectedUserUid('');
        setSelectedChallengeEntryId('');
        setUserChallenges([]);
        fetchAccounts();
      }
    } catch (error) {
      console.error('Error assigning trading account:', error);
      alert('Failed to assign trading account');
    }
  };

  const handleUnassignAccount = async (accountId) => {
    if (!confirm('Are you sure you want to unassign this trading account?')) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/trading-accounts/${accountId}/unassign`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        alert('Trading account unassigned successfully');
        fetchAccounts();
      }
    } catch (error) {
      console.error('Error unassigning trading account:', error);
      alert('Failed to unassign trading account');
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (!confirm('Are you sure you want to delete this trading account? This action cannot be undone.')) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/trading-accounts/${accountId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        alert('Trading account deleted successfully');
        fetchAccounts();
      }
    } catch (error) {
      console.error('Error deleting trading account:', error);
      alert('Failed to delete trading account');
    }
  };

  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setEditFormData({
      accountName: account.accountName || '',
      brokerName: account.brokerName || '',
      serverId: account.serverId || '',
      loginId: account.loginId || '',
      password: account.password || '',
      serverAddress: account.serverAddress || '',
      platform: account.platform || 'MT5',
      accountType: account.accountType || 'Demo',
      balance: account.balance || 0,
      leverage: account.leverage || '1:100',
      currency: account.currency || 'USD',
      notes: account.notes || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    if (!editingAccount) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/trading-accounts/${editingAccount._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editFormData)
      });
      
      if (response.ok) {
        fetchAccounts();
        setShowEditModal(false);
        setEditingAccount(null);
      } else {
        alert('Failed to update trading account');
      }
    } catch (error) {
      console.error('Error updating trading account:', error);
      alert('Error updating trading account');
    }
  };

  const getStatusBadge = (isAssigned) => {
    return isAssigned ? (
      <span className="badge bg-success">Assigned</span>
    ) : (
      <span className="badge bg-warning">Available</span>
    );
  };

  const getAccountTypeBadge = (type) => {
    return type === 'Demo' ? (
      <span className="badge bg-info">Demo</span>
    ) : (
      <span className="badge bg-success">Live</span>
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ 
        minHeight: '50vh',
        background: 'linear-gradient(135deg, #110A28 0%, #002260 100%)',
        color: 'white'
      }}>
        <div className="spinner-border" role="status" style={{ color: '#3b82f6' }}>
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4" style={{ color: 'white' }}>
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="fw-bold mb-1 text-white">Trading Accounts Management</h2>
              <p className="text-white-50 mb-0">Manage trading accounts and assign them to users</p>
            </div>
            <button 
              className="btn"
              onClick={() => setShowCreateModal(true)}
              style={{
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.5)',
                color: '#3b82f6',
                backdropFilter: 'blur(20px)',
                boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
              }}
            >
              <FaPlus className="me-2" />
              Create Account
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 mb-4" style={{
        background: 'rgba(60, 58, 58, 0.03)',
        border: '1px solid rgba(124, 124, 124, 0.39)',
        backdropFilter: 'blur(20px)',
        boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
      }}>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text" style={{
                  background: 'rgba(60, 58, 58, 0.03)',
                  border: '1px solid rgba(124, 124, 124, 0.39)',
                  color: 'white'
                }}>
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by account name or broker"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    background: 'rgba(60, 58, 58, 0.03)',
                    border: '1px solid rgba(124, 124, 124, 0.39)',
                    color: 'white'
                  }}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select 
                className="form-select"
                value={filterAssigned}
                onChange={(e) => setFilterAssigned(e.target.value)}
                style={{
                  background: 'rgba(60, 58, 58, 0.03)',
                  border: '1px solid rgba(124, 124, 124, 0.39)',
                  color: 'white'
                }}
              >
                <option value="" style={{ background: '#1f2937', color: 'white' }}>All Accounts</option>
                <option value="true" style={{ background: '#1f2937', color: 'white' }}>Assigned</option>
                <option value="false" style={{ background: '#1f2937', color: 'white' }}>Available</option>
              </select>
            </div>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Filter by broker"
                value={filterBroker}
                onChange={(e) => setFilterBroker(e.target.value)}
                style={{
                  background: 'rgba(60, 58, 58, 0.03)',
                  border: '1px solid rgba(124, 124, 124, 0.39)',
                  color: 'white'
                }}
              />
            </div>
            <div className="col-md-2">
              <button 
                className="btn w-100"
                onClick={() => {
                  setSearchTerm('');
                  setFilterAssigned('');
                  setFilterBroker('');
                }}
                style={{
                  background: 'rgba(124, 124, 124, 0.2)',
                  border: '1px solid rgba(124, 124, 124, 0.5)',
                  color: '#9ca3af'
                }}
              >
                <FaFilter className="me-1" />
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="card border-0" style={{
        background: 'rgba(60, 58, 58, 0.03)',
        border: '1px solid rgba(124, 124, 124, 0.39)',
        backdropFilter: 'blur(20px)',
        boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
      }}>
        <div className="card-body">
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
                  <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Account Details</th>
                  <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Broker</th>
                  <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Platform</th>
                  <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Type</th>
                  <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Balance</th>
                  <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Status</th>
                  <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Assigned To</th>
                  <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ background: 'transparent' }}>
                {accounts.map((account) => (
                  <tr key={account._id} style={{
                    background: 'rgba(60, 58, 58, 0.03)',
                    borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
                  }}>
                    <td className="text-white" style={{ background: 'transparent' }}>
                      <div>
                        <strong>{account.accountName}</strong><br/>
                        <small className="text-white-50">ID: {account.loginId}</small>
                      </div>
                    </td>
                    <td className="text-white" style={{ background: 'transparent' }}>
                      <div>
                        <strong>{account.brokerName}</strong><br/>
                        <small className="text-white-50">{account.serverId}</small>
                      </div>
                    </td>
                    <td style={{ background: 'transparent' }}>
                      <span className="badge" style={{
                        background: 'rgba(59, 130, 246, 0.2)',
                        border: '1px solid rgba(59, 130, 246, 0.5)',
                        color: '#3b82f6'
                      }}>{account.platform}</span>
                    </td>
                    <td style={{ background: 'transparent' }}>
                      {getAccountTypeBadge(account.accountType)}
                    </td>
                    <td className="text-white" style={{ background: 'transparent' }}>
                      <div>
                        <strong>{account.currency} {account.balance.toLocaleString()}</strong><br/>
                        <small className="text-white-50">Leverage: {account.leverage}</small>
                      </div>
                    </td>
                    <td style={{ background: 'transparent' }}>
                      {getStatusBadge(account.isAssigned)}
                    </td>
                    <td className="text-white" style={{ background: 'transparent' }}>
                      {account.isAssigned ? (
                        <div>
                          <strong>{account.assignedTo?.userEmail || 'Unknown'}</strong><br/>
                          <small className="text-white-50">
                            {account.assignedTo?.assignedAt ? 
                              new Date(account.assignedTo.assignedAt).toLocaleDateString() : 
                              'N/A'
                            }
                          </small>
                        </div>
                      ) : (
                        <span className="text-white-50">Not assigned</span>
                      )}
                    </td>
                    <td style={{ background: 'transparent' }}>
                      <div className="btn-group btn-group-sm">
                        {!account.isAssigned ? (
                          <button 
                            className="btn"
                            onClick={() => {
                              setSelectedAccount(account);
                              setShowAssignModal(true);
                            }}
                            style={{
                              background: 'rgba(16, 185, 129, 0.2)',
                              border: '1px solid rgba(16, 185, 129, 0.5)',
                              color: '#10b981'
                            }}
                          >
                            <FaUser />
                          </button>
                        ) : (
                          <button 
                            className="btn"
                            onClick={() => handleUnassignAccount(account._id)}
                            style={{
                              background: 'rgba(245, 158, 11, 0.2)',
                              border: '1px solid rgba(245, 158, 11, 0.5)',
                              color: '#f59e0b'
                            }}
                          >
                            <FaUserCheck />
                          </button>
                        )}
                        <button 
                          className="btn"
                          onClick={() => handleEditAccount(account)}
                          title="Edit Account"
                          style={{
                            background: 'rgba(59, 130, 246, 0.2)',
                            border: '1px solid rgba(59, 130, 246, 0.5)',
                            color: '#3b82f6'
                          }}
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="btn"
                          onClick={() => handleDeleteAccount(account._id)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: '1px solid rgba(239, 68, 68, 0.5)',
                            color: '#ef4444'
                          }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <nav className="mt-3">
            <ul className="pagination justify-content-center">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    background: 'rgba(60, 58, 58, 0.03)',
                    border: '1px solid rgba(124, 124, 124, 0.39)',
                    color: 'white'
                  }}
                >
                  Previous
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setCurrentPage(page)}
                    style={{
                      background: currentPage === page ? 'rgba(59, 130, 246, 0.2)' : 'rgba(60, 58, 58, 0.03)',
                      border: '1px solid rgba(124, 124, 124, 0.39)',
                      color: currentPage === page ? '#3b82f6' : 'white'
                    }}
                  >
                    {page}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    background: 'rgba(60, 58, 58, 0.03)',
                    border: '1px solid rgba(124, 124, 124, 0.39)',
                    color: 'white'
                  }}
                >
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Create Account Modal */}
      {showCreateModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content" style={{
              background: 'rgba(60, 58, 58, 0.03)',
              border: '1px solid rgba(124, 124, 124, 0.39)',
              backdropFilter: 'blur(20px)',
              boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
            }}>
              <div className="modal-header" style={{
                background: 'rgba(30, 30, 30, 0.8)',
                borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
              }}>
                <h5 className="modal-title text-white">Create Trading Account</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateAccount}>
                <div className="modal-body" style={{ color: 'white' }}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-white-50">Account Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.accountName}
                        onChange={(e) => setFormData({...formData, accountName: e.target.value})}
                        required
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: 'white'
                        }}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-white-50">Broker Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.brokerName}
                        onChange={(e) => setFormData({...formData, brokerName: e.target.value})}
                        required
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: 'white'
                        }}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-white-50">Server ID</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.serverId}
                        onChange={(e) => setFormData({...formData, serverId: e.target.value})}
                        required
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: 'white'
                        }}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-white-50">Login ID</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.loginId}
                        onChange={(e) => setFormData({...formData, loginId: e.target.value})}
                        required
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: 'white'
                        }}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-white-50">Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: 'white'
                        }}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-white-50">Server Address</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.serverAddress}
                        onChange={(e) => setFormData({...formData, serverAddress: e.target.value})}
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: 'white'
                        }}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label text-white-50">Platform</label>
                      <select
                        className="form-select"
                        value={formData.platform}
                        onChange={(e) => setFormData({...formData, platform: e.target.value})}
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: 'white'
                        }}
                      >
                        <option value="MT4" style={{ background: '#1f2937', color: 'white' }}>MT4</option>
                        <option value="MT5" style={{ background: '#1f2937', color: 'white' }}>MT5</option>
                        <option value="TradingView" style={{ background: '#1f2937', color: 'white' }}>TradingView</option>
                        <option value="Custom" style={{ background: '#1f2937', color: 'white' }}>Custom</option>
                      </select>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label text-white-50">Account Type</label>
                      <select
                        className="form-select"
                        value={formData.accountType}
                        onChange={(e) => setFormData({...formData, accountType: e.target.value})}
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: 'white'
                        }}
                      >
                        <option value="Demo" style={{ background: '#1f2937', color: 'white' }}>Demo</option>
                        <option value="Live" style={{ background: '#1f2937', color: 'white' }}>Live</option>
                      </select>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label text-white-50">Balance</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.balance}
                        onChange={(e) => setFormData({...formData, balance: parseFloat(e.target.value) || 0})}
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: 'white'
                        }}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-white-50">Leverage</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.leverage}
                        onChange={(e) => setFormData({...formData, leverage: e.target.value})}
                        placeholder="1:100"
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: 'white'
                        }}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-white-50">Currency</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.currency}
                        onChange={(e) => setFormData({...formData, currency: e.target.value})}
                        placeholder="USD"
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: 'white'
                        }}
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label text-white-50">Notes</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: 'white'
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer" style={{
                  background: 'rgba(30, 30, 30, 0.8)',
                  borderTop: '1px solid rgba(124, 124, 124, 0.39)'
                }}>
                  <button 
                    type="button" 
                    className="btn"
                    onClick={() => setShowCreateModal(false)}
                    style={{
                      background: 'rgba(124, 124, 124, 0.2)',
                      border: '1px solid rgba(124, 124, 124, 0.5)',
                      color: '#9ca3af'
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn"
                    style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid rgba(59, 130, 246, 0.5)',
                      color: '#3b82f6'
                    }}
                  >
                    Create Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Assign Account Modal */}
      {showAssignModal && selectedAccount && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content" style={{
              background: 'rgba(60, 58, 58, 0.03)',
              border: '1px solid rgba(124, 124, 124, 0.39)',
              backdropFilter: 'blur(20px)',
              boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
            }}>
              <div className="modal-header" style={{
                background: 'rgba(30, 30, 30, 0.8)',
                borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
              }}>
                <h5 className="modal-title text-white">Assign Trading Account</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowAssignModal(false)}
                ></button>
              </div>
              <div className="modal-body" style={{ color: 'white' }}>
                <div className="mb-3">
                  <strong className="text-white">Account:</strong> <span className="text-white">{selectedAccount.accountName}</span><br/>
                  <strong className="text-white">Broker:</strong> <span className="text-white">{selectedAccount.brokerName}</span><br/>
                  <strong className="text-white">Platform:</strong> <span className="text-white">{selectedAccount.platform}</span>
                </div>
                <div className="mb-3">
                  <label className="form-label text-white-50">Select User</label>
                  <select 
                    className="form-select"
                    value={selectedUserUid}
                    onChange={async (e) => {
                      const uid = e.target.value;
                      setSelectedUserUid(uid);
                      setSelectedChallengeEntryId('');
                      setUserChallenges([]);
                      if (uid) {
                        try {
                          const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${uid}/challenges`, { credentials: 'include' });
                          const d = await r.json();
                          const list = Array.isArray(d.challenges) ? d.challenges : [];
                          // Filter: only active, without assigned trading account
                          const filtered = list.filter(ch => ch.status === 'active' && !ch.tradingAccountId);
                          setUserChallenges(filtered);
                        } catch (_) {}
                      }
                    }}
                    style={{
                      background: 'rgba(60, 58, 58, 0.03)',
                      border: '1px solid rgba(124, 124, 124, 0.39)',
                      color: 'white'
                    }}
                  >
                    <option value="" style={{ background: '#1f2937', color: 'white' }}>Choose a user</option>
                    {users.filter(u => (u.challengesCount ? u.challengesCount > 0 : true)).map(user => (
                      <option key={user._id} value={user.uid} style={{ background: '#1f2937', color: 'white' }}>
                        {user.email} ({user.uid})
                      </option>
                    ))}
                  </select>
                </div>
                {selectedUserUid && (
                  <div className="mb-3">
                    <label className="form-label text-white-50">Select Challenge</label>
                    <select
                      className="form-select"
                      value={selectedChallengeEntryId}
                      onChange={(e) => setSelectedChallengeEntryId(e.target.value)}
                      style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        color: 'white'
                      }}
                    >
                      <option value="" style={{ background: '#1f2937', color: 'white' }}>Choose a challenge</option>
                      {userChallenges.map(ch => (
                        <option key={ch._id} value={ch._id} style={{ background: '#1f2937', color: 'white' }}>
                          {ch.name} — ${'{'}Number(ch.accountSize).toLocaleString(){'}'} — {ch.status}
                        </option>
                      ))}
                    </select>
                    <small className="text-white-50">Only assigns this account to the selected challenge entry.</small>
                  </div>
                )}
              </div>
              <div className="modal-footer" style={{
                background: 'rgba(30, 30, 30, 0.8)',
                borderTop: '1px solid rgba(124, 124, 124, 0.39)'
              }}>
                <button 
                  type="button" 
                  className="btn"
                  onClick={() => setShowAssignModal(false)}
                  style={{
                    background: 'rgba(124, 124, 124, 0.2)',
                    border: '1px solid rgba(124, 124, 124, 0.5)',
                    color: '#9ca3af'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn"
                  onClick={() => handleAssignAccount(selectedUserUid, selectedChallengeEntryId)}
                  style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(59, 130, 246, 0.5)',
                    color: '#3b82f6'
                  }}
                >
                  Assign Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Account Modal */}
      {showEditModal && editingAccount && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content" style={{
              background: 'rgba(60, 58, 58, 0.03)',
              border: '1px solid rgba(124, 124, 124, 0.39)',
              backdropFilter: 'blur(20px)',
              boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
            }}>
              <div className="modal-header" style={{
                background: 'rgba(30, 30, 30, 0.8)',
                borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
              }}>
                <h5 className="modal-title text-white">Edit Trading Account</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingAccount(null);
                  }}
                ></button>
              </div>
              <form onSubmit={handleUpdateAccount}>
                <div className="modal-body" style={{ color: 'white' }}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-white-50">Account Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editFormData.accountName}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, accountName: e.target.value }))}
                        required
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: 'white'
                        }}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-white-50">Broker Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editFormData.brokerName}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, brokerName: e.target.value }))}
                        required
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: 'white'
                        }}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-white-50">Server ID</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editFormData.serverId}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, serverId: e.target.value }))}
                        required
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: 'white'
                        }}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-white-50">Login ID</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editFormData.loginId}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, loginId: e.target.value }))}
                        required
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: 'white'
                        }}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-white-50">Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={editFormData.password}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, password: e.target.value }))}
                        required
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: 'white'
                        }}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-white-50">Server Address</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editFormData.serverAddress}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, serverAddress: e.target.value }))}
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: 'white'
                        }}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label text-white-50">Platform</label>
                      <select
                        className="form-select"
                        value={editFormData.platform}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, platform: e.target.value }))}
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: 'white'
                        }}
                      >
                        <option value="MT5" style={{ background: '#1f2937', color: 'white' }}>MetaTrader 5</option>
                        <option value="MT4" style={{ background: '#1f2937', color: 'white' }}>MetaTrader 4</option>
                        <option value="cTrader" style={{ background: '#1f2937', color: 'white' }}>cTrader</option>
                        <option value="MatchTrader" style={{ background: '#1f2937', color: 'white' }}>MatchTrader</option>
                      </select>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label text-white-50">Account Type</label>
                      <select
                        className="form-select"
                        value={editFormData.accountType}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, accountType: e.target.value }))}
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: 'white'
                        }}
                      >
                        <option value="Demo" style={{ background: '#1f2937', color: 'white' }}>Demo</option>
                        <option value="Live" style={{ background: '#1f2937', color: 'white' }}>Live</option>
                      </select>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label text-white-50">Balance</label>
                      <input
                        type="number"
                        className="form-control"
                        value={editFormData.balance}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, balance: parseFloat(e.target.value) || 0 }))}
                        step="0.01"
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: 'white'
                        }}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-white-50">Leverage</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editFormData.leverage}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, leverage: e.target.value }))}
                        placeholder="1:100"
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: 'white'
                        }}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-white-50">Currency</label>
                      <select
                        className="form-select"
                        value={editFormData.currency}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, currency: e.target.value }))}
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: 'white'
                        }}
                      >
                        <option value="USD" style={{ background: '#1f2937', color: 'white' }}>USD</option>
                        <option value="EUR" style={{ background: '#1f2937', color: 'white' }}>EUR</option>
                        <option value="GBP" style={{ background: '#1f2937', color: 'white' }}>GBP</option>
                        <option value="INR" style={{ background: '#1f2937', color: 'white' }}>INR</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-white-50">Notes</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={editFormData.notes}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                      style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        color: 'white'
                      }}
                    />
                  </div>
                </div>
                <div className="modal-footer" style={{
                  background: 'rgba(30, 30, 30, 0.8)',
                  borderTop: '1px solid rgba(124, 124, 124, 0.39)'
                }}>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingAccount(null);
                    }}
                    style={{
                      background: 'rgba(124, 124, 124, 0.2)',
                      border: '1px solid rgba(124, 124, 124, 0.5)',
                      color: '#9ca3af'
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn" style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    border: '1px solid rgba(59, 130, 246, 0.5)',
                    color: '#3b82f6'
                  }}>
                    Update Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTradingAccounts;
