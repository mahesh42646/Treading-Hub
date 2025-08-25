'use client';

import React, { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaTimes,
  FaCheck,
  FaSpinner
} from 'react-icons/fa';

const AdminPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    features: [''],
    maxUsers: 1,
    maxTransactions: 100,
    priority: 0,
    isActive: true
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/plans`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '',
      features: [''],
      maxUsers: 1,
      maxTransactions: 100,
      priority: 0,
      isActive: true
    });
  };

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, '']
    });
  };

  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      features: newFeatures
    });
  };

  const updateFeature = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({
      ...formData,
      features: newFeatures
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const planData = {
      ...formData,
      price: parseFloat(formData.price),
      duration: parseInt(formData.duration),
      maxUsers: parseInt(formData.maxUsers),
      maxTransactions: parseInt(formData.maxTransactions),
      priority: parseInt(formData.priority),
      features: formData.features.filter(feature => feature.trim() !== '')
    };

    try {
      const url = editingPlan 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/plans/${editingPlan._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/plans`;
      
      const method = editingPlan ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(planData)
      });

      if (response.ok) {
        setShowModal(false);
        setEditingPlan(null);
        resetForm();
        fetchPlans();
      }
    } catch (error) {
      console.error('Error saving plan:', error);
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price.toString(),
      duration: plan.duration.toString(),
      features: plan.features && plan.features.length > 0 ? plan.features : [''],
      maxUsers: plan.maxUsers,
      maxTransactions: plan.maxTransactions,
      priority: plan.priority,
      isActive: plan.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/plans/${planId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        fetchPlans();
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
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
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Plan Management</h1>
          <p className="text-muted mb-0">Manage subscription plans and pricing</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setEditingPlan(null);
            resetForm();
            setShowModal(true);
          }}
        >
          <FaPlus className="me-2" />
          Add Plan
        </button>
      </div>

      <div className="row">
        {plans.map((plan) => (
          <div key={plan._id} className="col-lg-6 col-xl-4 mb-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="badge bg-secondary">{plan.duration} days</span>
                  <span className={`badge ${plan.isActive ? 'bg-success' : 'bg-danger'}`}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <h5 className="card-title mb-2">{plan.name}</h5>
                <p className="text-muted small mb-3">{plan.description}</p>
                
                <div className="mb-3">
                  <h6 className="fw-bold text-primary">${plan.price}</h6>
                  <small className="text-muted">per {plan.duration} days</small>
                </div>
                
                <div className="mb-3">
                  <div className="row text-center">
                    <div className="col-6">
                      <small className="text-muted">Max Users</small>
                      <br />
                      <strong>{plan.maxUsers}</strong>
                    </div>
                    <div className="col-6">
                      <small className="text-muted">Max Transactions</small>
                      <br />
                      <strong>{plan.maxTransactions}</strong>
                    </div>
                  </div>
                </div>
                
                {plan.features && plan.features.length > 0 && (
                  <div className="mb-3">
                    <small className="text-muted">Features:</small>
                    <ul className="list-unstyled small">
                      {plan.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="text-muted">
                          • {feature}
                        </li>
                      ))}
                      {plan.features.length > 3 && (
                        <li className="text-muted">• +{plan.features.length - 3} more</li>
                      )}
                    </ul>
                  </div>
                )}
                
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    Priority: {plan.priority}
                  </small>
                  <div className="btn-group btn-group-sm">
                    <button 
                      className="btn btn-outline-primary"
                      onClick={() => handleEdit(plan)}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="btn btn-outline-danger"
                      onClick={() => handleDelete(plan._id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {plans.length === 0 && (
        <div className="text-center py-5">
          <p className="text-muted">No plans found. Add your first plan!</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingPlan ? 'Edit Plan' : 'Add New Plan'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Plan Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Price ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="form-control"
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      required
                    ></textarea>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Duration (days)</label>
                        <input
                          type="number"
                          min="1"
                          className="form-control"
                          value={formData.duration}
                          onChange={(e) => setFormData({...formData, duration: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Max Users</label>
                        <input
                          type="number"
                          min="1"
                          className="form-control"
                          value={formData.maxUsers}
                          onChange={(e) => setFormData({...formData, maxUsers: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <label className="form-label">Max Transactions</label>
                        <input
                          type="number"
                          min="1"
                          className="form-control"
                          value={formData.maxTransactions}
                          onChange={(e) => setFormData({...formData, maxTransactions: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Priority</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Features</label>
                    {formData.features.map((feature, index) => (
                      <div key={index} className="d-flex gap-2 mb-2">
                        <input
                          type="text"
                          className="form-control"
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          placeholder="Enter feature"
                        />
                        {formData.features.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => removeFeature(index)}
                          >
                            <FaTimes />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={addFeature}
                    >
                      + Add Feature
                    </button>
                  </div>
                  
                  <div className="mb-3">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      />
                      <label className="form-check-label">
                        Active Plan
                      </label>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingPlan ? 'Update Plan' : 'Create Plan'}
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

export default AdminPlans;
