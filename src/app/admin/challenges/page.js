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
    saleStatus: 'active',
    priority: 1,
    durationDays: 30
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

  const handleSaleStatusChange = async (challengeId, newStatus) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/challenges/${challengeId}/sale-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ saleStatus: newStatus })
      });
      const data = await response.json();
      if (data.success) {
        fetchChallenges();
      } else {
        alert(data.message || 'Failed to update challenge sale status');
      }
    } catch (error) {
      console.error('Error updating challenge sale status:', error);
      alert('Failed to update challenge sale status');
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
      saleStatus: 'active',
      priority: 1,
      durationDays: 30
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
      saleStatus: challenge.saleStatus || 'active',
      priority: challenge.priority || 1,
      durationDays: challenge.durationDays || 30
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
      <div className="d-flex justify-content-center align-items-center" style={{ 
        height: '50vh',
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
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0 text-white">Challenges Management</h2>
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
                style={{
                  background: 'rgba(60, 58, 58, 0.03)',
                  border: '1px solid rgba(124, 124, 124, 0.39)',
                  color: '#e2e8f0'
                }}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  background: 'rgba(60, 58, 58, 0.03)',
                  border: '1px solid rgba(124, 124, 124, 0.39)',
                  color: '#e2e8f0'
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Challenges Table */}
          <div className="card" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-body" style={{ color: '#e2e8f0' }}>
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
                      <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Name</th>
                      <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Type</th>
                      <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Model</th>
                      <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Account Sizes</th>
                      <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Platforms</th>
                      <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Sale Status</th>
                      <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Priority</th>
                      <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Status</th>
                      <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody style={{ background: 'transparent' }}>
                    {(filteredChallenges || []).map((challenge) => (
                      <tr key={challenge._id} style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
                      }}>
                        <td className="text-white" style={{ background: 'transparent' }}>
                          <div>
                            <strong>{challenge.name}</strong>
                            {challenge.description && (
                              <small className="text-white-50 d-block">{challenge.description}</small>
                            )}
                          </div>
                        </td>
                        <td style={{ background: 'transparent' }}>
                          <span className="badge" style={{
                            background: 'rgba(59, 130, 246, 0.2)',
                            border: '1px solid rgba(59, 130, 246, 0.5)',
                            color: '#3b82f6'
                          }}>{challenge.type}</span>
                        </td>
                        <td className="text-white" style={{ background: 'transparent' }}>{challenge.model}</td>
                        <td style={{ background: 'transparent' }}>
                          {(challenge.accountSizes || []).map(size => (
                            <span key={size} className="badge me-1" style={{
                              background: 'rgba(124, 124, 124, 0.2)',
                              border: '1px solid rgba(124, 124, 124, 0.5)',
                              color: '#9ca3af'
                            }}>
                              ${size.toLocaleString()}
                            </span>
                          ))}
                        </td>
                        <td style={{ background: 'transparent' }}>
                          {(challenge.platforms || []).map(platform => (
                            <span key={platform} className="badge me-1" style={{
                              background: 'rgba(59, 130, 246, 0.1)',
                              border: '1px solid rgba(59, 130, 246, 0.3)',
                              color: '#93c5fd'
                            }}>
                              {platform}
                            </span>
                          ))}
                        </td>
                        <td style={{ background: 'transparent' }}>
                          <span className={`badge ${challenge.saleStatus === 'active' ? 'bg-success' : challenge.saleStatus === 'stopped' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                            {challenge.saleStatus || 'active'}
                          </span>
                        </td>
                        <td className="text-white" style={{ background: 'transparent' }}>{challenge.priority}</td>
                        <td style={{ background: 'transparent' }}>
                          <select
                            className={`form-select form-select-sm ${challenge.saleStatus === 'active' ? 'border-success' : challenge.saleStatus === 'stopped' ? 'border-warning' : 'border-secondary'}`}
                            value={challenge.saleStatus || 'active'}
                            onChange={(e) => handleSaleStatusChange(challenge._id, e.target.value)}
                            style={{
                              background: 'rgba(60, 58, 58, 0.03)',
                              border: '1px solid rgba(124, 124, 124, 0.39)',
                              color: 'white'
                            }}
                          >
                            <option value="active" style={{ background: '#1f2937', color: 'white' }}>Active</option>
                            <option value="stopped" style={{ background: '#1f2937', color: 'white' }}>Stopped</option>
                            <option value="inactive" style={{ background: '#1f2937', color: 'white' }}>Inactive</option>
                          </select>
                        </td>
                        <td style={{ background: 'transparent' }}>
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-sm"
                              onClick={() => openEditModal(challenge)}
                              title="Edit"
                              style={{
                                background: 'rgba(59, 130, 246, 0.2)',
                                border: '1px solid rgba(59, 130, 246, 0.5)',
                                color: '#3b82f6'
                              }}
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn btn-sm"
                              onClick={() => handleDuplicateChallenge(challenge)}
                              title="Duplicate"
                              style={{
                                background: 'rgba(16, 185, 129, 0.2)',
                                border: '1px solid rgba(16, 185, 129, 0.5)',
                                color: '#10b981'
                              }}
                            >
                              <FaCopy />
                            </button>
                            <button
                              className="btn btn-sm"
                              onClick={() => handleDeleteChallenge(challenge._id)}
                              title="Delete"
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
            </div>
          </div>
        </div>
      </div>

      {/* Create Challenge Modal */}
      {showCreateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
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
                <h5 className="modal-title text-white">Create New Challenge</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                ></button>
              </div>
              <form onSubmit={handleCreateChallenge}>
                <div className="modal-body" style={{ color: 'white' }}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-white-50">Challenge Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: 'white'
                        }}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-white-50">Type</label>
                      <select
                        className="form-select"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: 'white'
                        }}
                      >
                        <option value="One Step" style={{ background: '#1f2937', color: 'white' }}>One Step</option>
                        <option value="Two Step" style={{ background: '#1f2937', color: 'white' }}>Two Step</option>
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3" style={{ display: 'none' }}>
                      <label className="form-label text-white-50">Model</label>
                      <select
                        className="form-select"
                        name="model"
                        value={formData.model}
                        onChange={handleInputChange}
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: 'white'
                        }}
                      >
                        <option value="Standard" style={{ background: '#1f2937', color: 'white' }}>Standard</option>
                        <option value="Aggressive" style={{ background: '#1f2937', color: 'white' }}>Aggressive</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-white-50">Priority</label>
                      <input
                        type="number"
                        className="form-control"
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        min="1"
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: 'white'
                        }}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-white-50">Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        color: 'white'
                      }}
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-white-50">Profit Target</label>
                      <select
                        className="form-select"
                        value={(formData.profitTargets && formData.profitTargets[0]) || 10}
                        onChange={(e) => setFormData(prev => ({ ...prev, profitTargets: [parseFloat(e.target.value)] }))}
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: 'white'
                        }}
                      >
                        <option value={8} style={{ background: '#1f2937', color: 'white' }}>8%</option>
                        <option value={10} style={{ background: '#1f2937', color: 'white' }}>10%</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-white-50">Account Sizes</label>
                      <div className="d-flex flex-wrap gap-2">
                        {[5000, 10000, 25000, 50000, 100000].map(size => (
                          <label key={size} className="form-check form-check-inline">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={(formData.accountSizes || []).includes(size)}
                              onChange={(e) => {
                                setFormData(prev => {
                                  const set = new Set(prev.accountSizes || []);
                                  if (e.target.checked) set.add(size); else set.delete(size);
                                  return { ...prev, accountSizes: Array.from(set) };
                                });
                              }}
                              style={{
                                background: 'rgba(60, 58, 58, 0.03)',
                                border: '1px solid rgba(124, 124, 124, 0.39)'
                              }}
                            />
                            <span className="form-check-label text-white">${size.toLocaleString()}</span>
                          </label>
                        ))}
                      </div>
                      <div className="input-group mt-2">
                        <span className="input-group-text" style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: 'white'
                        }}>Add size</span>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Enter custom size"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const val = parseInt(e.currentTarget.value);
                              if (!isNaN(val) && val > 0) {
                                setFormData(prev => ({ ...prev, accountSizes: Array.from(new Set([...(prev.accountSizes || []), val])) }));
                                e.currentTarget.value = '';
                              }
                            }
                          }}
                          style={{
                            background: 'rgba(60, 58, 58, 0.03)',
                            border: '1px solid rgba(124, 124, 124, 0.39)',
                            color: 'white'
                          }}
                        />
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-white-50">Duration (days)</label>
                      <input
                        type="number"
                        className="form-control"
                        name="durationDays"
                        value={formData.durationDays}
                        onChange={handleInputChange}
                        min="1"
                        required
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: 'white'
                        }}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-white-50">Platforms</label>
                    <div className="d-flex flex-wrap gap-2">
                      {['MetaTrader 5', 'MatchTrader', 'cTrader'].map(p => (
                        <label key={p} className="form-check form-check-inline">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={(formData.platforms || []).includes(p)}
                            onChange={(e) => {
                              setFormData(prev => {
                                const set = new Set(prev.platforms || []);
                                if (e.target.checked) set.add(p); else set.delete(p);
                                return { ...prev, platforms: Array.from(set) };
                              });
                            }}
                            style={{
                              background: 'rgba(60, 58, 58, 0.03)',
                              border: '1px solid rgba(124, 124, 124, 0.39)'
                            }}
                          />
                          <span className="form-check-label text-white">{p}</span>
                        </label>
                      ))}
                    </div>
                    <div className="input-group mt-2">
                      <span className="input-group-text" style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        color: 'white'
                      }}>Add platform</span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter custom platform"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = (e.currentTarget.value || '').trim();
                            if (val) {
                              setFormData(prev => ({ ...prev, platforms: Array.from(new Set([...(prev.platforms || []), val])) }));
                              e.currentTarget.value = '';
                            }
                          }
                        }}
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: 'white'
                        }}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-white-50">Coupons</label>
                    <div className="table-responsive">
                      <table className="table table-sm" style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)'
                      }}>
                        <thead style={{
                          background: 'rgba(30, 30, 30, 0.8)',
                          borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
                        }}>
                          <tr>
                            <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Code</th>
                            <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Flat Off</th>
                            <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>% Off</th>
                            <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Expires</th>
                            <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Active</th>
                            <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}></th>
                          </tr>
                        </thead>
                        <tbody style={{ background: 'transparent' }}>
                          {(formData.coupons || []).map((c, idx) => (
                            <tr key={idx} style={{
                              background: 'rgba(60, 58, 58, 0.03)',
                              borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
                            }}>
                              <td style={{ background: 'transparent' }}>
                                <input className="form-control form-control-sm" value={c.code || ''} onChange={(e) => {
                                  const coupons = [...(formData.coupons || [])];
                                  coupons[idx] = { ...coupons[idx], code: e.target.value };
                                  setFormData(prev => ({ ...prev, coupons }));
                                }} style={{
                                  background: 'rgba(60, 58, 58, 0.03)',
                                  border: '1px solid rgba(124, 124, 124, 0.39)',
                                  color: 'white'
                                }} />
                              </td>
                              <td style={{ background: 'transparent' }}>
                                <input type="number" className="form-control form-control-sm" value={c.discountFlat || 0} onChange={(e) => {
                                  const coupons = [...(formData.coupons || [])];
                                  coupons[idx] = { ...coupons[idx], discountFlat: parseFloat(e.target.value) || 0 };
                                  setFormData(prev => ({ ...prev, coupons }));
                                }} style={{
                                  background: 'rgba(60, 58, 58, 0.03)',
                                  border: '1px solid rgba(124, 124, 124, 0.39)',
                                  color: 'white'
                                }} />
                              </td>
                              <td style={{ background: 'transparent' }}>
                                <input type="number" className="form-control form-control-sm" value={c.discountPercent || 0} onChange={(e) => {
                                  const coupons = [...(formData.coupons || [])];
                                  coupons[idx] = { ...coupons[idx], discountPercent: parseFloat(e.target.value) || 0 };
                                  setFormData(prev => ({ ...prev, coupons }));
                                }} style={{
                                  background: 'rgba(60, 58, 58, 0.03)',
                                  border: '1px solid rgba(124, 124, 124, 0.39)',
                                  color: 'white'
                                }} />
                              </td>
                              <td style={{ background: 'transparent' }}>
                                <input type="date" className="form-control form-control-sm" value={c.expiresAt ? new Date(c.expiresAt).toISOString().substring(0,10) : ''} onChange={(e) => {
                                  const coupons = [...(formData.coupons || [])];
                                  coupons[idx] = { ...coupons[idx], expiresAt: e.target.value ? new Date(e.target.value) : null };
                                  setFormData(prev => ({ ...prev, coupons }));
                                }} style={{
                                  background: 'rgba(60, 58, 58, 0.03)',
                                  border: '1px solid rgba(124, 124, 124, 0.39)',
                                  color: 'white'
                                }} />
                              </td>
                              <td style={{ background: 'transparent' }}>
                                <input type="checkbox" className="form-check-input" checked={c.isActive !== false} onChange={(e) => {
                                  const coupons = [...(formData.coupons || [])];
                                  coupons[idx] = { ...coupons[idx], isActive: e.target.checked };
                                  setFormData(prev => ({ ...prev, coupons }));
                                }} style={{
                                  background: 'rgba(60, 58, 58, 0.03)',
                                  border: '1px solid rgba(124, 124, 124, 0.39)'
                                }} />
                              </td>
                              <td style={{ background: 'transparent' }}>
                                <button type="button" className="btn btn-sm" onClick={() => {
                                  const coupons = [...(formData.coupons || [])];
                                  coupons.splice(idx, 1);
                                  setFormData(prev => ({ ...prev, coupons }));
                                }} style={{
                                  background: 'rgba(239, 68, 68, 0.2)',
                                  border: '1px solid rgba(239, 68, 68, 0.5)',
                                  color: '#ef4444'
                                }}>Remove</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <button type="button" className="btn btn-sm" onClick={() => setFormData(prev => ({ ...prev, coupons: [...(prev.coupons || []), { code: '', discountFlat: 0, discountPercent: 0, expiresAt: null, isActive: true }] }))} style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid rgba(59, 130, 246, 0.5)',
                      color: '#3b82f6'
                    }}>Add Coupon</button>
                  </div>

                  {/* Price Configuration */}
                  <div className="mb-3">
                    <label className="form-label text-white-50">Prices by Account Size</label>
                    {(formData.accountSizes || []).map((size) => (
                      <div key={size} className="input-group mb-2">
                        <span className="input-group-text" style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: 'white'
                        }}>${size.toLocaleString()}</span>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.pricesByAccountSize[size] || ''}
                          onChange={(e) => handlePriceChange(size, e.target.value)}
                          placeholder="Enter price"
                          step="0.01"
                          min="0"
                          style={{
                            background: 'rgba(60, 58, 58, 0.03)',
                            border: '1px solid rgba(124, 124, 124, 0.39)',
                            color: 'white'
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="form-check mb-3">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)'
                      }}
                    />
                    <label className="form-check-label text-white">Active</label>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <label className="form-label text-white-50">Sale Status</label>
                      <select className="form-select" name="saleStatus" value={formData.saleStatus} onChange={handleInputChange} style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        color: 'white'
                      }}>
                        <option value="active" style={{ background: '#1f2937', color: 'white' }}>Active (buying allowed)</option>
                        <option value="stopped" style={{ background: '#1f2937', color: 'white' }}>Stopped (no new purchases)</option>
                        <option value="inactive" style={{ background: '#1f2937', color: 'white' }}>Inactive (hidden)</option>
                      </select>
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
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
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
                <h5 className="modal-title text-white">Edit Challenge</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
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

                  <div className="mb-3 d-none">
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
