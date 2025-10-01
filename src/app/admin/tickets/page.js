'use client';

import React, { useState, useEffect } from 'react';
import { baseUrl } from '../../../utils/config';

const AdminTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newResponse, setNewResponse] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch(baseUrl('/admin/support/tickets'), {
        credentials: 'include'
      });

      if (response.ok) {
        const result = await response.json();
        setTickets(result.tickets || []);
      } else {
        console.error('Failed to fetch tickets');
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId, status, assignedTo = null) => {
    try {
      setUpdatingStatus(true);
      const response = await fetch(baseUrl(`/admin/support/ticket/${ticketId}/status`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ status, assignedTo })
      });

      if (response.ok) {
        await fetchTickets(); // Refresh the list
        if (selectedTicket && selectedTicket.ticketId === ticketId) {
          setSelectedTicket(prev => ({ ...prev, status }));
        }
      } else {
        console.error('Failed to update ticket status');
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const addResponse = async (ticketId, message) => {
    try {
      const response = await fetch(baseUrl(`/support/ticket/${ticketId}/response`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ message, from: 'admin' })
      });

      if (response.ok) {
        await fetchTickets(); // Refresh the list
        if (selectedTicket && selectedTicket.ticketId === ticketId) {
          const updatedTicket = tickets.find(t => t.ticketId === ticketId);
          if (updatedTicket) {
            setSelectedTicket(updatedTicket);
          }
        }
        setNewResponse('');
      } else {
        console.error('Failed to add response');
      }
    } catch (error) {
      console.error('Error adding response:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'open': { class: 'bg-warning', text: 'Open' },
      'in_progress': { class: 'bg-info', text: 'In Progress' },
      'resolved': { class: 'bg-success', text: 'Resolved' },
      'closed': { class: 'bg-secondary', text: 'Closed' }
    };
    const statusInfo = statusMap[status] || statusMap['open'];
    return <span className={`badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  const getCategoryIcon = (category) => {
    const iconMap = {
      'general': 'bi-question-circle',
      'technical': 'bi-gear',
      'billing': 'bi-credit-card',
      'account': 'bi-person',
      'trading': 'bi-graph-up',
      'kyc': 'bi-shield-check'
    };
    return iconMap[category] || 'bi-question-circle';
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || ticket.category === categoryFilter;
    const matchesSearch = searchTerm === '' || 
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.ticketId.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const openTicketModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
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
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-white">Support Tickets Management</h2>
        <div className="d-flex gap-2">
          <span className="badge bg-primary">{tickets.length} Total Tickets</span>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-md-3">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              background: 'rgba(3, 5, 68, 0.9)',
              border: '1px solid rgba(124, 124, 124, 0.39)',
              color: 'white'
            }}
          >
            <option value="all" style={{ background: 'rgba(3, 5, 68, 0.9)', color: 'white' }}>All Status</option>
            <option value="open" style={{ background: 'rgba(3, 5, 68, 0.9)', color: 'white' }}>Open</option>
            <option value="in_progress" style={{ background: 'rgba(3, 5, 68, 0.9)', color: 'white' }}>In Progress</option>
            <option value="resolved" style={{ background: 'rgba(3, 5, 68, 0.9)', color: 'white' }}>Resolved</option>
            <option value="closed" style={{ background: 'rgba(3, 5, 68, 0.9)', color: 'white' }}>Closed</option>
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              background: 'rgba(3, 5, 68, 0.9)',
              border: '1px solid rgba(124, 124, 124, 0.39)',
              color: 'white'
            }}
          >
            <option value="all" style={{ background: 'rgba(3, 5, 68, 0.9)', color: 'white' }}>All Categories</option>
            <option value="general" style={{ background: 'rgba(3, 5, 68, 0.9)', color: 'white' }}>General</option>
            <option value="technical" style={{ background: 'rgba(3, 5, 68, 0.9)', color: 'white' }}>Technical</option>
            <option value="billing" style={{ background: 'rgba(3, 5, 68, 0.9)', color: 'white' }}>Billing</option>
            <option value="account" style={{ background: 'rgba(3, 5, 68, 0.9)', color: 'white' }}>Account</option>
            <option value="trading" style={{ background: 'rgba(3, 5, 68, 0.9)', color: 'white' }}>Trading</option>
            <option value="kyc" style={{ background: 'rgba(3, 5, 68, 0.9)', color: 'white' }}>KYC</option>
          </select>
        </div>
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'rgba(3, 5, 68, 0.9)',
              border: '1px solid rgba(124, 124, 124, 0.39)',
              color: 'white'
            }}
          />
        </div>
      </div>

      {/* Tickets Table */}
      <div className="card" style={{
        background: 'rgba(60, 58, 58, 0.03)',
        border: '1px solid rgba(124, 124, 124, 0.39)',
        backdropFilter: 'blur(20px)',
        boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
      }}>
        <div className="card-body">
          {filteredTickets.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover" style={{
                backgroundColor: 'rgba(3, 5, 68, 0.9)',
                color: 'white'
              }}>
                <thead style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  color: 'white'
                }}>
                  <tr className='text-white bg-dark'>
                    <th className="text-white" style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>Ticket ID</th>
                    <th className="text-white" style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>User</th>
                    <th className="text-white" style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>Subject</th>
                    <th className="text-white" style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>Category</th>
                    <th className="text-white" style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>Status</th>
                    <th className="text-white" style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>Created</th>
                    <th className="text-white" style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket._id} style={{
                      backgroundColor: 'rgba(3, 5, 68, 0.9)',
                      color: 'white',
                      borderColor: 'rgba(124, 124, 124, 0.39)'
                    }}>
                      <td style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>
                        <span className="badge" style={{
                          background: 'rgba(59, 130, 246, 0.2)',
                          color: '#3b82f6'
                        }}>#{ticket.ticketId}</span>
                      </td>
                      <td className="text-white" style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>{ticket.userEmail}</td>
                      <td className="text-white" style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>{ticket.subject}</td>
                      <td className="text-white-50" style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>
                        <i className={`bi ${getCategoryIcon(ticket.category)} me-1`} style={{ color: '#3b82f6' }}></i>
                        {ticket.category}
                      </td>
                      <td style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>{getStatusBadge(ticket.status)}</td>
                      <td className="text-white-50" style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                      <td style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }}>
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-sm"
                            style={{
                              background: 'rgba(59, 130, 246, 0.2)',
                              border: '1px solid rgba(59, 130, 246, 0.5)',
                              color: '#3b82f6'
                            }}
                            onClick={() => openTicketModal(ticket)}
                          >
                            View
                          </button>
                          {ticket.status === 'open' && (
                            <button
                              className="btn btn-sm"
                              style={{
                                background: 'rgba(34, 197, 94, 0.2)',
                                border: '1px solid rgba(34, 197, 94, 0.5)',
                                color: '#22c55e'
                              }}
                              onClick={() => updateTicketStatus(ticket.ticketId, 'in_progress')}
                              disabled={updatingStatus}
                            >
                              Start
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
              <i className="bi bi-ticket-detailed text-white-50" style={{ fontSize: '3rem' }}></i>
              <p className="text-white-50 mt-3">No tickets found</p>
            </div>
          )}
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {showModal && selectedTicket && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-lg">
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
                <h5 className="modal-title text-white">Ticket #{selectedTicket.ticketId}</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body" style={{
                backgroundColor: 'rgba(3, 5, 68, 0.9)',
                color: 'white'
              }}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>User:</strong> {selectedTicket.userEmail}
                  </div>
                  <div className="col-md-6">
                    <strong>Status:</strong> {getStatusBadge(selectedTicket.status)}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Category:</strong> {selectedTicket.category}
                  </div>
                  <div className="col-md-6">
                    <strong>Created:</strong> {new Date(selectedTicket.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="mb-3">
                  <strong>Subject:</strong>
                  <p className="mt-1">{selectedTicket.subject}</p>
                </div>
                <div className="mb-3">
                  <strong>Message:</strong>
                  <p className="mt-1">{selectedTicket.message}</p>
                </div>

                {/* Attachments */}
                {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                  <div className="mb-3">
                    <strong>Attachments:</strong>
                    <div className="mt-2">
                      {selectedTicket.attachments.map((attachment, index) => (
                        <div key={index} className="d-flex align-items-center mb-2 p-2 rounded" style={{
                          background: 'rgba(60, 58, 58, 0.1)',
                          border: '1px solid rgba(124, 124, 124, 0.2)'
                        }}>
                          <i className="bi bi-paperclip me-2"></i>
                          <span className="text-white-50">{attachment.originalName}</span>
                          <a
                            href={`${process.env.NEXT_PUBLIC_API_URL}${attachment.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm ms-auto"
                            style={{
                              background: 'rgba(59, 130, 246, 0.2)',
                              border: '1px solid rgba(59, 130, 246, 0.5)',
                              color: '#3b82f6'
                            }}
                          >
                            View
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Responses */}
                <div className="mb-3">
                  <strong>Conversation:</strong>
                  <div className="mt-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {selectedTicket.responses && selectedTicket.responses.map((response, index) => (
                      <div key={index} className={`mb-2 p-2 rounded ${response.from === 'admin' ? 'ms-5' : 'me-5'}`} style={{
                        background: response.from === 'admin' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(60, 58, 58, 0.1)',
                        border: '1px solid rgba(124, 124, 124, 0.2)'
                      }}>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <strong className="text-white">{response.from === 'admin' ? 'Admin' : 'User'}</strong>
                          <small className="text-white-50">{new Date(response.timestamp).toLocaleString()}</small>
                        </div>
                        <p className="mb-0 text-white-50">{response.message}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Response */}
                <div className="mb-3">
                  <label className="form-label text-white">Add Response:</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={newResponse}
                    onChange={(e) => setNewResponse(e.target.value)}
                    placeholder="Type your response here..."
                    style={{
                      background: 'rgba(3, 5, 68, 0.9)',
                      border: '1px solid rgba(124, 124, 124, 0.39)',
                      color: 'white'
                    }}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer" style={{
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                borderTop: '1px solid rgba(124, 124, 124, 0.39)'
              }}>
                <div className="d-flex gap-2">
                  <select
                    className="form-select"
                    value={selectedTicket.status}
                    onChange={(e) => updateTicketStatus(selectedTicket.ticketId, e.target.value)}
                    style={{
                      background: 'rgba(3, 5, 68, 0.9)',
                      border: '1px solid rgba(124, 124, 124, 0.39)',
                      color: 'white'
                    }}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                  <button
                    className="btn"
                    style={{
                      background: 'rgba(34, 197, 94, 0.2)',
                      border: '1px solid rgba(34, 197, 94, 0.5)',
                      color: '#22c55e'
                    }}
                    onClick={() => addResponse(selectedTicket.ticketId, newResponse)}
                    disabled={!newResponse.trim()}
                  >
                    Send Response
                  </button>
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

export default AdminTicketsPage;