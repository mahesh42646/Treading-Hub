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
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users?limit=100`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
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

  const handleAssignAccount = async (uid, extendPlanValidity = false) => {
    if (!selectedAccount || !uid) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/trading-accounts/${selectedAccount._id}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          uid,
          extendPlanValidity 
        })
      });

      if (response.ok) {
        alert('Trading account assigned successfully');
        setShowAssignModal(false);
        setSelectedAccount(null);
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
              <h2 className="fw-bold mb-1">Trading Accounts Management</h2>
              <p className="text-muted mb-0">Manage trading accounts and assign them to users</p>
            </div>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              <FaPlus className="me-2" />
              Create Account
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text">
                  <FaSearch />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by account name or broker"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select 
                className="form-select"
                value={filterAssigned}
                onChange={(e) => setFilterAssigned(e.target.value)}
              >
                <option value="">All Accounts</option>
                <option value="true">Assigned</option>
                <option value="false">Available</option>
              </select>
            </div>
            <div className="col-md-3">
              <input
                type="text"
                className="form-control"
                placeholder="Filter by broker"
                value={filterBroker}
                onChange={(e) => setFilterBroker(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <button 
                className="btn btn-outline-secondary w-100"
                onClick={() => {
                  setSearchTerm('');
                  setFilterAssigned('');
                  setFilterBroker('');
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
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Account Details</th>
                  <th>Broker</th>
                  <th>Platform</th>
                  <th>Type</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <tr key={account._id}>
                    <td>
                      <div>
                        <strong>{account.accountName}</strong><br/>
                        <small className="text-muted">ID: {account.loginId}</small>
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>{account.brokerName}</strong><br/>
                        <small className="text-muted">{account.serverId}</small>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-primary">{account.platform}</span>
                    </td>
                    <td>
                      {getAccountTypeBadge(account.accountType)}
                    </td>
                    <td>
                      <div>
                        <strong>{account.currency} {account.balance.toLocaleString()}</strong><br/>
                        <small className="text-muted">Leverage: {account.leverage}</small>
                      </div>
                    </td>
                    <td>
                      {getStatusBadge(account.isAssigned)}
                    </td>
                    <td>
                      {account.isAssigned ? (
                        <div>
                          <strong>{account.assignedTo?.userEmail || 'Unknown'}</strong><br/>
                          <small className="text-muted">
                            {account.assignedTo?.assignedAt ? 
                              new Date(account.assignedTo.assignedAt).toLocaleDateString() : 
                              'N/A'
                            }
                          </small>
                        </div>
                      ) : (
                        <span className="text-muted">Not assigned</span>
                      )}
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        {!account.isAssigned ? (
                          <button 
                            className="btn btn-outline-success"
                            onClick={() => {
                              setSelectedAccount(account);
                              setShowAssignModal(true);
                            }}
                          >
                            <FaUser />
                          </button>
                        ) : (
                          <button 
                            className="btn btn-outline-warning"
                            onClick={() => handleUnassignAccount(account._id)}
                          >
                            <FaUserCheck />
                          </button>
                        )}
                        <button 
                          className="btn btn-outline-danger"
                          onClick={() => handleDeleteAccount(account._id)}
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
                >
                  Previous
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setCurrentPage(page)}
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
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create Trading Account</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowCreateModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateAccount}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Account Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.accountName}
                        onChange={(e) => setFormData({...formData, accountName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Broker Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.brokerName}
                        onChange={(e) => setFormData({...formData, brokerName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Server ID</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.serverId}
                        onChange={(e) => setFormData({...formData, serverId: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Login ID</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.loginId}
                        onChange={(e) => setFormData({...formData, loginId: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Password</label>
                      <input
                        type="password"
                        className="form-control"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Server Address</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.serverAddress}
                        onChange={(e) => setFormData({...formData, serverAddress: e.target.value})}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Platform</label>
                      <select
                        className="form-select"
                        value={formData.platform}
                        onChange={(e) => setFormData({...formData, platform: e.target.value})}
                      >
                        <option value="MT4">MT4</option>
                        <option value="MT5">MT5</option>
                        <option value="TradingView">TradingView</option>
                        <option value="Custom">Custom</option>
                      </select>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Account Type</label>
                      <select
                        className="form-select"
                        value={formData.accountType}
                        onChange={(e) => setFormData({...formData, accountType: e.target.value})}
                      >
                        <option value="Demo">Demo</option>
                        <option value="Live">Live</option>
                      </select>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Balance</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.balance}
                        onChange={(e) => setFormData({...formData, balance: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Leverage</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.leverage}
                        onChange={(e) => setFormData({...formData, leverage: e.target.value})}
                        placeholder="1:100"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Currency</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.currency}
                        onChange={(e) => setFormData({...formData, currency: e.target.value})}
                        placeholder="USD"
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label className="form-label">Notes</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
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
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Assign Trading Account</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowAssignModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <strong>Account:</strong> {selectedAccount.accountName}<br/>
                  <strong>Broker:</strong> {selectedAccount.brokerName}<br/>
                  <strong>Platform:</strong> {selectedAccount.platform}
                </div>
                <div className="mb-3">
                  <label className="form-label">Select User</label>
                  <select 
                    className="form-select"
                    id="userSelect"
                  >
                    <option value="">Choose a user</option>
                    {users.map(user => (
                      <option key={user._id} value={user.uid}>
                        {user.email} ({user.uid})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <div className="form-check">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id="extendPlanValidity"
                    />
                    <label className="form-check-label" htmlFor="extendPlanValidity">
                      Extend plan validity to 100% from now
                    </label>
                  </div>
                  <small className="text-muted">
                    This will reset the user&apos;s subscription start date to now and extend the validity to full plan duration.
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowAssignModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={() => {
                    const userSelect = document.getElementById('userSelect');
                    const extendValidity = document.getElementById('extendPlanValidity').checked;
                    if (userSelect.value) {
                      handleAssignAccount(userSelect.value, extendValidity);
                    }
                  }}
                >
                  Assign Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTradingAccounts;
