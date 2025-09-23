'use client';

import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCopy, FaToggleOn, FaToggleOff, FaEye, FaEyeSlash } from 'react-icons/fa';

const AdminChallengesPage = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'One Step',
    model: 'Standard',
    profitTargets: [10],
    accountSizes: [5000, 10000, 25000],
    pricesByAccountSize: {},
    platforms: ['MetaTrader 5'],
    couponCode: '',
    coupons: [],
    isActive: true,
    priority: 1
  });

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/challenges`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setChallenges(data.challenges || []);
      } else {
        setChallenges([]);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
      setChallenges([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/challenges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setShowCreateModal(false);
        resetForm();
        fetchChallenges();
      } else {
        alert(data.message || 'Failed to create challenge');
      }
    } catch (error) {
      console.error('Error creating challenge:', error);
      alert('Failed to create challenge');
    }
  };

  const handleEditChallenge = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/challenges/${editingChallenge._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setShowEditModal(false);
        setEditingChallenge(null);
        resetForm();
        fetchChallenges();
      } else {
        alert(data.message || 'Failed to update challenge');
      }
    } catch (error) {
      console.error('Error updating challenge:', error);
      alert('Failed to update challenge');
    }
  };

  const handleDeleteChallenge = async (challengeId) => {
    if (!confirm('Are you sure you want to delete this challenge?')) return;
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/challenges/${challengeId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        fetchChallenges();
      } else {
        alert(data.message || 'Failed to delete challenge');
      }
    } catch (error) {
      console.error('Error deleting challenge:', error);
      alert('Failed to delete challenge');
    }
  };

  const handleDuplicateChallenge = async (challenge) => {
    const duplicateData = {
      name: `${challenge.name || 'Challenge'} (Copy)`,
      description: challenge.description || '',
      type: challenge.type || 'One Step',
      model: challenge.model || 'Standard',
      profitTargets: (challenge.profitTargets && challenge.profitTargets.length) ? challenge.profitTargets : [10],
      accountSizes: challenge.accountSizes || [5000, 10000, 25000],
      pricesByAccountSize: challenge.pricesByAccountSize || {},
      platforms: challenge.platforms || ['MetaTrader 5'],
      couponCode: challenge.couponCode || '',
      coupons: Array.isArray(challenge.coupons) ? challenge.coupons : [],
      isActive: false,
      priority: challenge.priority || 1
    };

    setFormData(duplicateData);
    setShowCreateModal(true);
  };

  const handleToggleStatus = async (challengeId, currentStatus) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/challenges/${challengeId}/toggle`, {
        method: 'PUT',
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        fetchChallenges();
      } else {
        alert(data.message || 'Failed to toggle challenge status');
      }
    } catch (error) {
      console.error('Error toggling challenge status:', error);
      alert('Failed to toggle challenge status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'One Step',
      model: 'Standard',
      profitTargets: [10],
      accountSizes: [5000, 10000, 25000],
      pricesByAccountSize: {},
      platforms: ['MetaTrader 5'],
      couponCode: '',
      coupons: [],
      isActive: true,
      priority: 1
    });
  };

  const openEditModal = (challenge) => {
    setEditingChallenge(challenge);
    setFormData({
      name: challenge.name || '',
      description: challenge.description || '',
      type: challenge.type || 'One Step',
      model: challenge.model || 'Standard',
      profitTargets: (challenge.profitTargets && challenge.profitTargets.length) ? challenge.profitTargets : [10],
      accountSizes: challenge.accountSizes || [5000, 10000, 25000],
      pricesByAccountSize: challenge.pricesByAccountSize || {},
      platforms: challenge.platforms || ['MetaTrader 5'],
      couponCode: challenge.couponCode || '',
      coupons: Array.isArray(challenge.coupons) ? challenge.coupons : [],
      isActive: challenge.isActive !== undefined ? challenge.isActive : true,
      priority: challenge.priority || 1
    });
    setShowEditModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleArrayChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value ? value.split(',').map(item => 
        field === 'profitTargets' || field === 'accountSizes' ? 
        parseFloat(item.trim()) : item.trim()
      ) : []
    }));
  };

  const handlePriceChange = (accountSize, price) => {
    setFormData(prev => ({
      ...prev,
      pricesByAccountSize: {
        ...prev.pricesByAccountSize,
        [accountSize]: parseFloat(price) || 0
      }
    }));
  };

  const filteredChallenges = (challenges || []).filter(challenge => {
    const matchesSearch = challenge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challenge.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && challenge.isActive) ||
                         (filterStatus === 'inactive' && !challenge.isActive);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Challenges Management</h2>
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              <FaPlus className="me-2" />
              Create Challenge
            </button>
          </div>

          {/* Filters */}
          <div className="row mb-4">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Search challenges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Challenges Table */}
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Model</th>
                      <th>Account Sizes</th>
                      <th>Platforms</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(filteredChallenges || []).map((challenge) => (
                      <tr key={challenge._id}>
                        <td>
                          <div>
                            <strong>{challenge.name}</strong>
                            {challenge.description && (
                              <small className="text-muted d-block">{challenge.description}</small>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-info">{challenge.type}</span>
                        </td>
                        <td>{challenge.model}</td>
                        <td>
                          {(challenge.accountSizes || []).map(size => (
                            <span key={size} className="badge bg-secondary me-1">
                              ${size.toLocaleString()}
                            </span>
                          ))}
                        </td>
                        <td>
                          {(challenge.platforms || []).map(platform => (
                            <span key={platform} className="badge bg-light text-dark me-1">
                              {platform}
                            </span>
                          ))}
                        </td>
                        <td>{challenge.priority}</td>
                        <td>
                          <button
                            className={`btn btn-sm ${challenge.isActive ? 'btn-success' : 'btn-secondary'}`}
                            onClick={() => handleToggleStatus(challenge._id, challenge.isActive)}
                          >
                            {challenge.isActive ? <FaToggleOn /> : <FaToggleOff />}
                            {challenge.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td>
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => openEditModal(challenge)}
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-info"
                              onClick={() => handleDuplicateChallenge(challenge)}
                              title="Duplicate"
                            >
                              <FaCopy />
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteChallenge(challenge._id)}
                              title="Delete"
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
            </div>
          </div>
        </div>
      </div>

      {/* Create Challenge Modal */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Create New Challenge</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                ></button>
              </div>
              <form onSubmit={handleCreateChallenge}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Challenge Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Type</label>
                      <select
                        className="form-select"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                      >
                        <option value="One Step">One Step</option>
                        <option value="Two Step">Two Step</option>
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Model</label>
                      <select
                        className="form-select"
                        name="model"
                        value={formData.model}
                        onChange={handleInputChange}
                      >
                        <option value="Standard">Standard</option>
                        <option value="Aggressive">Aggressive</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Priority</label>
                      <input
                        type="number"
                        className="form-control"
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Profit Targets (comma-separated)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={(formData.profitTargets || []).join(', ')}
                        onChange={(e) => handleArrayChange('profitTargets', e.target.value)}
                        placeholder="8, 5"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Account Sizes (comma-separated)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={(formData.accountSizes || []).join(', ')}
                        onChange={(e) => handleArrayChange('accountSizes', e.target.value)}
                        placeholder="5000, 10000, 25000"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Platforms (comma-separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={(formData.platforms || []).join(', ')}
                      onChange={(e) => handleArrayChange('platforms', e.target.value)}
                      placeholder="MetaTrader 5, MatchTrader, cTrader"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Coupon Code (optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      name="couponCode"
                      value={formData.couponCode}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Price Configuration */}
                  <div className="mb-3">
                    <label className="form-label">Prices by Account Size</label>
                    {(formData.accountSizes || []).map((size) => (
                      <div key={size} className="input-group mb-2">
                        <span className="input-group-text">${size.toLocaleString()}</span>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.pricesByAccountSize[size] || ''}
                          onChange={(e) => handlePriceChange(size, e.target.value)}
                          placeholder="Enter price"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label">Active</label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Challenge
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Challenge Modal */}
      {showEditModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Challenge</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingChallenge(null);
                    resetForm();
                  }}
                ></button>
              </div>
              <form onSubmit={handleEditChallenge}>
                <div className="modal-body">
                  {/* Same form fields as create modal */}
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Challenge Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Type</label>
                      <select
                        className="form-select"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                      >
                        <option value="One Step">One Step</option>
                        <option value="Two Step">Two Step</option>
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Model</label>
                      <select
                        className="form-select"
                        name="model"
                        value={formData.model}
                        onChange={handleInputChange}
                      >
                        <option value="Standard">Standard</option>
                        <option value="Aggressive">Aggressive</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Priority</label>
                      <input
                        type="number"
                        className="form-control"
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Profit Targets (comma-separated)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={(formData.profitTargets || []).join(', ')}
                        onChange={(e) => handleArrayChange('profitTargets', e.target.value)}
                        placeholder="8, 5"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Account Sizes (comma-separated)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={(formData.accountSizes || []).join(', ')}
                        onChange={(e) => handleArrayChange('accountSizes', e.target.value)}
                        placeholder="5000, 10000, 25000"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Platforms (comma-separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={(formData.platforms || []).join(', ')}
                      onChange={(e) => handleArrayChange('platforms', e.target.value)}
                      placeholder="MetaTrader 5, MatchTrader, cTrader"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Coupon Code (optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      name="couponCode"
                      value={formData.couponCode}
                      onChange={handleInputChange}
                    />
                  </div>

                  {/* Price Configuration */}
                  <div className="mb-3">
                    <label className="form-label">Prices by Account Size</label>
                    {(formData.accountSizes || []).map((size) => (
                      <div key={size} className="input-group mb-2">
                        <span className="input-group-text">${size.toLocaleString()}</span>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.pricesByAccountSize[size] || ''}
                          onChange={(e) => handlePriceChange(size, e.target.value)}
                          placeholder="Enter price"
                          step="0.01"
                          min="0"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label">Active</label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingChallenge(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update Challenge
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

export default AdminChallengesPage;
