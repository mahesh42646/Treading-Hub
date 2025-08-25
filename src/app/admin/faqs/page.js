'use client';

import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';

const AdminFAQs = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general',
    isActive: true,
    priority: 1
  });

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/faqs`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setFaqs(data.faqs || []);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingFaq 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/faqs/${editingFaq._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/faqs`;
      
      const method = editingFaq ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingFaq(null);
        setFormData({
          question: '',
          answer: '',
          category: 'general',
          isActive: true,
          priority: 1
        });
        fetchFAQs();
      }
    } catch (error) {
      console.error('Error saving FAQ:', error);
    }
  };

  const handleEdit = (faq) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      isActive: faq.isActive,
      priority: faq.priority
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/faqs/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (response.ok) {
          fetchFAQs();
        }
      } catch (error) {
        console.error('Error deleting FAQ:', error);
      }
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
          <h1 className="h3 mb-1">FAQ Management</h1>
          <p className="text-muted mb-0">Manage frequently asked questions</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setEditingFaq(null);
            setFormData({
              question: '',
              answer: '',
              category: 'general',
              isActive: true,
              priority: 1
            });
            setShowModal(true);
          }}
        >
          <FaPlus className="me-2" />
          Add FAQ
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {faqs.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {faqs.map((faq) => (
                    <tr key={faq._id}>
                      <td>
                        <div>
                          <strong>{faq.question}</strong>
                          <br />
                          <small className="text-muted">{faq.answer.substring(0, 100)}...</small>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-secondary">{faq.category}</span>
                      </td>
                      <td>{faq.priority}</td>
                      <td>
                        <span className={`badge ${faq.isActive ? 'bg-success' : 'bg-danger'}`}>
                          {faq.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button 
                            className="btn btn-outline-primary"
                            onClick={() => handleEdit(faq)}
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(faq._id)}
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
          ) : (
            <div className="text-center py-5">
              <p className="text-muted">No FAQs found. Add your first FAQ!</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Question</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.question}
                      onChange={(e) => setFormData({...formData, question: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Answer</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={formData.answer}
                      onChange={(e) => setFormData({...formData, answer: e.target.value})}
                      required
                    ></textarea>
                  </div>
                  <div className="row">
                    <div className="col-md-4">
                      <label className="form-label">Category</label>
                      <select
                        className="form-select"
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                      >
                        <option value="general">General</option>
                        <option value="trading">Trading</option>
                        <option value="account">Account</option>
                        <option value="payment">Payment</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Priority</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.priority}
                        onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
                        min="1"
                        max="10"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Status</label>
                      <div className="form-check form-switch mt-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                        />
                        <label className="form-check-label">
                          Active
                        </label>
                      </div>
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
                    {editingFaq ? 'Update FAQ' : 'Add FAQ'}
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

export default AdminFAQs;
