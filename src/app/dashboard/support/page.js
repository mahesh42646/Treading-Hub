'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { buildApiUrl } from '../../../utils/config';

const SupportPage = () => {
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    category: 'general'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [tickets, setTickets] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(buildApiUrl('/users/support/ticket'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: formData.subject,
          message: formData.message,
          category: formData.category,
          userId: user.uid,
          userEmail: user.email
        })
      });

      if (response.ok) {
        const result = await response.json();
        setMessage('Support ticket submitted successfully! We will get back to you soon.');
        setFormData({
          subject: '',
          message: '',
          category: 'general'
        });
        // Refresh tickets list
        fetchTickets();
      } else {
        const error = await response.json();
        setMessage(error.message || 'Failed to submit ticket');
      }
    } catch (error) {
      console.error('Error submitting ticket:', error);
      setMessage('Error submitting ticket');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user's tickets
  const fetchTickets = async () => {
    try {
      const response = await fetch(buildApiUrl(`/users/support/tickets/${user.uid}`));
      if (response.ok) {
        const result = await response.json();
        setTickets(result.tickets || []);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  // Fetch tickets on component mount
  useEffect(() => {
    if (user?.uid) {
      fetchTickets();
    }
  }, [user]);

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

  return (
    <div className="container py-4 px-lg-4">
   
        <div className="col-12">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
          <div className="mb-3 mb-md-0">
            <h1 className="page-title mb-1">Support Center</h1>
            <p className="page-subtitle text-muted">Get help with your account and trading questions</p>
          </div>
          <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto">
            <a href="/faq" className="btn btn-outline-primary">
              <i className="bi bi-question-circle"></i> FAQ
            </a>
            <a href="/contact" className="btn btn-primary">
              <i className="bi bi-envelope"></i> Contact Us
            </a>
          </div>
        </div>
      </div>

      {/* Alert Message */}
      {message && (
        <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'} alert-dismissible fade show mb-4`}>
          {message}
          <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
        </div>
      )}

      <div className="row">
        {/* Quick Help Section */}
        <div className="col-lg-4 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">Quick Help</h5>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <h6>Common Issues</h6>
                <div className="list-group list-group-flush">
                  <a href="#" className="list-group-item list-group-item-action d-flex align-items-center">
                    <i className="bi bi-person-circle text-primary me-3"></i>
                    <div>
                      <strong>Account Issues</strong>
                      <small className="text-muted d-block">Login, registration, profile</small>
                    </div>
                  </a>
                  <a href="#" className="list-group-item list-group-item-action d-flex align-items-center">
                    <i className="bi bi-credit-card text-primary me-3"></i>
                    <div>
                      <strong>Payment & Billing</strong>
                      <small className="text-muted d-block">Deposits, withdrawals, fees</small>
                    </div>
                  </a>
                  <a href="#" className="list-group-item list-group-item-action d-flex align-items-center">
                    <i className="bi bi-shield-check text-primary me-3"></i>
                    <div>
                      <strong>KYC Verification</strong>
                      <small className="text-muted d-block">Document verification process</small>
                    </div>
                  </a>
                  <a href="#" className="list-group-item list-group-item-action d-flex align-items-center">
                    <i className="bi bi-graph-up text-primary me-3"></i>
                    <div>
                      <strong>Trading Platform</strong>
                      <small className="text-muted d-block">Platform usage, features</small>
                    </div>
                  </a>
                </div>
              </div>

              <div className="alert alert-info">
                <h6 className="alert-heading">Need Immediate Help?</h6>
                <p className="mb-2">Our support team is available 24/7</p>
                <div className="d-flex gap-2">
                  <a href="mailto:support@tradinghub.com" className="btn btn-sm btn-outline-primary">
                    <i className="bi bi-envelope"></i> Email
                  </a>
                  <a href="tel:+1234567890" className="btn btn-sm btn-outline-success">
                    <i className="bi bi-telephone"></i> Call
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Support Ticket */}
        <div className="col-lg-8 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">Create Support Ticket</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="general">General Inquiry</option>
                      <option value="technical">Technical Issue</option>
                      <option value="billing">Billing & Payment</option>
                      <option value="account">Account Issues</option>
                      <option value="trading">Trading Platform</option>
                      <option value="kyc">KYC Verification</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Subject</label>
                    <input
                      type="text"
                      className="form-control"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Message</label>
                  <textarea
                    className="form-control"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="6"
                    placeholder="Please provide detailed information about your issue..."
                    required
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label className="form-label">Your Information</label>
                  <div className="row">
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control bg-light"
                        value={profile?.personalInfo?.firstName ? `${profile.personalInfo.firstName} ${profile.personalInfo.lastName}` : user?.email}
                        disabled
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="email"
                        className="form-control bg-light"
                        value={user?.email || ''}
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div className="text-end">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Submitting...
                      </>
                    ) : (
                      'Submit Ticket'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Recent Support Tickets</h5>
            </div>
            <div className="card-body">
              {tickets.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Ticket ID</th>
                        <th>Subject</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map((ticket) => (
                        <tr key={ticket._id}>
                          <td>
                            <span className="badge bg-light text-dark">#{ticket.ticketId}</span>
                          </td>
                          <td>{ticket.subject}</td>
                          <td>
                            <i className={`bi ${getCategoryIcon(ticket.category)} text-primary me-1`}></i>
                            {ticket.category}
                          </td>
                          <td>{getStatusBadge(ticket.status)}</td>
                          <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button className="btn btn-sm btn-outline-primary">
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-ticket-detailed text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="text-muted mt-3">No support tickets yet</p>
                  <p className="text-muted small">Create a ticket above if you need help</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Frequently Asked Questions</h5>
            </div>
            <div className="card-body">
              <div className="accordion" id="faqAccordion">
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                      How do I complete my KYC verification?
                    </button>
                  </h2>
                  <div id="faq1" className="accordion-collapse collapse show" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      To complete KYC verification, go to your profile settings and upload the required documents including PAN card, Aadhaar card, and a recent photograph. Our team will review and verify your documents within 24-48 hours.
                    </div>
                  </div>
                </div>
                
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                      What are the minimum withdrawal requirements?
                    </button>
                  </h2>
                  <div id="faq2" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      The minimum withdrawal amount is ₹500. For referral bonus withdrawals, you must have made at least one deposit to your wallet first.
                    </div>
                  </div>
                </div>
                
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                      How does the referral program work?
                    </button>
                  </h2>
                  <div id="faq3" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      Share your referral link with friends. When they register using your link and complete their profile and first deposit, you earn ₹200 as a referral bonus. The bonus is added to your referral balance in the wallet.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
