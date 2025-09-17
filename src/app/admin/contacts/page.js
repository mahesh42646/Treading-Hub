'use client';

import React, { useState, useEffect } from 'react';
import { FaEye, FaEdit, FaTrash, FaEnvelope } from 'react-icons/fa';

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchContacts = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/contacts`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts || []);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/contacts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchContacts();
      }
    } catch (error) {
      console.error('Error updating contact status:', error);
    }
  };

  const handleView = (contact) => {
    setSelectedContact(contact);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return <span className="badge bg-danger">New</span>;
      case 'read':
        return <span className="badge bg-warning">Read</span>;
      case 'replied':
        return <span className="badge bg-success">Replied</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
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
          <h1 className="h3 mb-1">Contact Management</h1>
          <p className="text-muted mb-0">Manage contact form submissions</p>
        </div>
        <div className="d-flex gap-2">
          <span className="badge bg-primary fs-6">
            Total: {contacts.length}
          </span>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {contacts.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr key={contact._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
                            <FaEnvelope className="text-primary" size={12} />
                          </div>
                          <div>
                            <strong>{contact.name}</strong>
                            {contact.phone && (
                              <>
                                <br />
                                <small className="text-muted">{contact.phone}</small>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <a href={`mailto:${contact.email}`} className="text-decoration-none">
                          {contact.email}
                        </a>
                      </td>
                      <td>
                        <div>
                          <strong>{contact.subject}</strong>
                          <br />
                          <small className="text-muted">{contact.message.substring(0, 50)}...</small>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {getStatusBadge(contact.status)}
                          <select
                            className="form-select form-select-sm"
                            style={{ width: 'auto' }}
                            value={contact.status}
                            onChange={(e) => handleStatusUpdate(contact._id, e.target.value)}
                          >
                            <option value="new">New</option>
                            <option value="read">Read</option>
                            <option value="replied">Replied</option>
                          </select>
                        </div>
                      </td>
                      <td>
                        <small className="text-muted">
                          {new Date(contact.createdAt).toLocaleDateString()}
                        </small>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button 
                            className="btn btn-outline-primary"
                            onClick={() => handleView(contact)}
                          >
                            <FaEye />
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
              <p className="text-muted">No contact submissions found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedContact && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Contact Details</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Name</label>
                    <p>{selectedContact.name}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Email</label>
                    <p>
                      <a href={`mailto:${selectedContact.email}`}>
                        {selectedContact.email}
                      </a>
                    </p>
                  </div>
                </div>
                
                {selectedContact.phone && (
                  <div className="mb-3">
                    <label className="form-label fw-bold">Phone</label>
                    <p>{selectedContact.phone}</p>
                  </div>
                )}
                
                <div className="mb-3">
                  <label className="form-label fw-bold">Subject</label>
                  <p>{selectedContact.subject}</p>
                </div>
                
                <div className="mb-3">
                  <label className="form-label fw-bold">Message</label>
                  <div className="border rounded p-3 bg-light">
                    {selectedContact.message}
                  </div>
                </div>
                
                <div className="row">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Status</label>
                    <div className="d-flex align-items-center gap-2">
                      {getStatusBadge(selectedContact.status)}
                      <select
                        className="form-select"
                        value={selectedContact.status}
                        onChange={(e) => handleStatusUpdate(selectedContact._id, e.target.value)}
                      >
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="replied">Replied</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Submitted</label>
                    <p>{new Date(selectedContact.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
                <a 
                  href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                  className="btn btn-primary"
                >
                  Reply via Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContacts;
