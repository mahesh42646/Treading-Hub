'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { baseUrl } from '../../../utils/config';

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
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Prepare form data for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('message', formData.message);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('userId', user.uid);
      formDataToSend.append('userEmail', user.email);

      // Add files to form data
      selectedFiles.forEach((file, index) => {
        formDataToSend.append(`attachments`, file);
      });

      const response = await fetch(baseUrl('/users/support/ticket'), {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        const result = await response.json();
        setMessage('Support ticket submitted successfully! We will get back to you soon.');
        setFormData({
          subject: '',
          message: '',
          category: 'general'
        });
        setSelectedFiles([]);
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
      const response = await fetch(baseUrl(`/users/support/tickets/${user.uid}`));
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
            <h1 className="page-title mb-1 text-white">Support Center</h1>
            <p className="page-subtitle text-white-50">Get help with your account and trading questions</p>
          </div>
          <div className="d-flex flex-column flex-sm-row gap-2 w-100 w-md-auto">
            <a href="/faq" className="btn rounded-4" style={{
              background: 'rgba(60, 58, 58, 0.03)',
              border: '1px solid rgba(124, 124, 124, 0.39)',
              color: '#e2e8f0'
            }}>
              <i className="bi bi-question-circle"></i> FAQ
            </a>
            <a href="/contact" className="btn rounded-4" style={{
              background: 'rgba(11, 12, 45, 0.9)',
              border: '1px solid rgba(59, 130, 246, 0.5)',
              color: '#3b82f6'
            }}>
              <i className="bi bi-envelope"></i> Contact Us
            </a>
          </div>
        </div>
      </div>

      {/* Alert Message */}
      {message && (
        <div className={`alert alert-dismissible fade show mb-4 rounded-4`} style={{
          background: message.includes('successfully') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: message.includes('successfully') ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
          color: '#e2e8f0'
        }}>
          {message}
          <button type="button" className="btn-close btn-close-white" onClick={() => setMessage('')}></button>
        </div>
      )}

      <div className="row">
        {/* Quick Help Section */}
        <div className="col-lg-4 mb-4">
          <div className="card h-100" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-header" style={{
              background: 'rgba(60, 58, 58, 0.03)',
              borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
            }}>
              <h5 className="card-title mb-0 text-white">Quick Help</h5>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <h6 className="text-white">Common Issues</h6>
                <div className="list-group list-group-flush">
                  <a href="#" className="list-group-item list-group-item-action d-flex align-items-center" style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#e2e8f0'
                  }}>
                    <i className="bi bi-person-circle me-3" style={{ color: '#3b82f6' }}></i>
                    <div>
                      <strong className="text-white">Account Issues</strong>
                      <small className="text-white-50 d-block">Login, registration, profile</small>
                    </div>
                  </a>
                  <a href="#" className="list-group-item list-group-item-action d-flex align-items-center" style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#e2e8f0'
                  }}>
                    <i className="bi bi-credit-card me-3" style={{ color: '#3b82f6' }}></i>
                    <div>
                      <strong className="text-white">Payment & Billing</strong>
                      <small className="text-white-50 d-block">Deposits, withdrawals, fees</small>
                    </div>
                  </a>
                  <a href="#" className="list-group-item list-group-item-action d-flex align-items-center" style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#e2e8f0'
                  }}>
                    <i className="bi bi-shield-check me-3" style={{ color: '#3b82f6' }}></i>
                    <div>
                      <strong className="text-white">KYC Verification</strong>
                      <small className="text-white-50 d-block">Document verification process</small>
                    </div>
                  </a>
                  <a href="#" className="list-group-item list-group-item-action d-flex align-items-center" style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#e2e8f0'
                  }}>
                    <i className="bi bi-graph-up me-3" style={{ color: '#3b82f6' }}></i>
                    <div>
                      <strong className="text-white">Trading Platform</strong>
                      <small className="text-white-50 d-block">Platform usage, features</small>
                    </div>
                  </a>
                </div>
              </div>

              <div className="alert" style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#e2e8f0'
              }}>
                <h6 className="alert-heading text-white">Need Immediate Help?</h6>
                <p className="mb-2 text-white-50">Our support team is available 24/7</p>
                <div className="d-flex gap-2">
                  <a href="mailto:support@xfundingflow.com" className="btn btn-sm" style={{
                    background: 'rgba(11, 12, 45, 0.9)',
                    border: '1px solid rgba(59, 130, 246, 0.5)',
                    color: '#3b82f6'
                  }}>
                    <i className="bi bi-envelope"></i> Email
                  </a>
                  <a href="tel:+1234567890" className="btn btn-sm" style={{
                    background: 'rgba(34, 197, 94, 0.2)',
                    border: '1px solid rgba(34, 197, 94, 0.5)',
                    color: '#22c55e'
                  }}>
                    <i className="bi bi-telephone"></i> Call
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Create Support Ticket */}
        <div className="col-lg-8 mb-4">
          <div className="card h-100" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-header" style={{
              background: 'rgba(60, 58, 58, 0.03)',
              borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
            }}>
              <h5 className="card-title mb-0 text-white">Create Support Ticket</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label text-white">Category</label>
                    <select
                      className="form-select"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        color: '#e2e8f0'
                      }}
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
                    <label className="form-label text-white">Subject</label>
                    <input
                      type="text"
                      className="form-control"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Brief description of your issue"
                      required
                      style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        color: '#e2e8f0'
                      }}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label text-white">Message</label>
                  <textarea
                    className="form-control"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="6"
                    placeholder="Please provide detailed information about your issue..."
                    required
                    style={{
                      background: 'rgba(60, 58, 58, 0.03)',
                      border: '1px solid rgba(124, 124, 124, 0.39)',
                      color: '#e2e8f0'
                    }}
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label className="form-label text-white">Attachments (Optional)</label>
                  <input
                    type="file"
                    className="form-control"
                    multiple
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    onChange={handleFileChange}
                    style={{
                      background: 'rgba(60, 58, 58, 0.03)',
                      border: '1px solid rgba(124, 124, 124, 0.39)',
                      color: '#e2e8f0'
                    }}
                  />
                  <small className="text-white-50">You can attach images, videos, or documents to help explain your issue.</small>
                  
                  {selectedFiles.length > 0 && (
                    <div className="mt-2">
                      <h6 className="text-white">Selected Files:</h6>
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="d-flex justify-content-between align-items-center mb-1 p-2 rounded" style={{
                          background: 'rgba(60, 58, 58, 0.1)',
                          border: '1px solid rgba(124, 124, 124, 0.2)'
                        }}>
                          <span className="text-white-50 small">{file.name}</span>
                          <button
                            type="button"
                            className="btn btn-sm text-danger"
                            onClick={() => removeFile(index)}
                          >
                            <i className="bi bi-x"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label text-white">Your Information</label>
                  <div className="row">
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: '#e2e8f0'
                        }}
                        value={profile?.personalInfo?.firstName ? `${profile.personalInfo.firstName} ${profile.personalInfo.lastName}` : user?.email}
                        disabled
                      />
                    </div>
                    <div className="col-md-6">
                      <input
                        type="email"
                        className="form-control"
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: '#e2e8f0'
                        }}
                        value={user?.email || ''}
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div className="text-end">
                  <button type="submit" className="btn" disabled={loading} style={{
                    background: 'rgba(11, 12, 45, 0.9)',
                    border: '1px solid rgba(59, 130, 246, 0.5)',
                    color: '#3b82f6'
                  }}>
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
          <div className="card" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-header" style={{
              background: 'rgba(60, 58, 58, 0.03)',
              borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
            }}>
              <h5 className="card-title mb-0 text-white">Recent Support Tickets</h5>
            </div>
            <div className="card-body">
              {tickets.length > 0 ? (
                <div className="table-responsive bg-dark">
                  <table className="table table-hover" style={{
                    backgroundColor: 'rgba(11, 12, 45, 0.9)',
                    color: 'white'
                  }}>
                    <thead style={{
                      backgroundColor: 'rgba(11, 12, 45, 0.9)',
                      color: 'gray'
                    }}>
                      <tr className='text-white bg-dark'>
                        <th className="text-white" style={{ backgroundColor: 'rgba(11, 12, 45, 0.9)' }}>Ticket ID</th>
                        <th className="text-white" style={{ backgroundColor: 'rgba(11, 12, 45, 0.9)' }}>Subject</th>
                        <th className="text-white" style={{ backgroundColor: 'rgba(11, 12, 45, 0.9)' }}>Category</th>
                        <th className="text-white" style={{ backgroundColor: 'rgba(11, 12, 45, 0.9)' }}>Status</th>
                        <th className="text-white" style={{ backgroundColor: 'rgba(11, 12, 45, 0.9)' }}>Created</th>
                        <th className="text-white" style={{ backgroundColor: 'rgba(11, 12, 45, 0.9)' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map((ticket) => (
                        <tr key={ticket._id} style={{
                          backgroundColor: 'rgba(11, 12, 45, 0.9)',
                          color: 'white',
                          backgroundColor: 'rgba(11, 12, 45, 0.9)'
                        }}>
                          <td style={{ backgroundColor: 'rgba(11, 12, 45, 0.9)' }}>
                            <span className="badge" style={{
                              background: 'rgba(11, 12, 45, 0.9)',
                              color: '#3b82f6'
                            }}>#{ticket.ticketId}</span>
                          </td>
                          <td className="text-white" style={{ backgroundColor: 'rgba(11, 12, 45, 0.9)' }}>{ticket.subject}</td>
                          <td className="text-white-50" style={{ backgroundColor: 'rgba(11, 12, 45, 0.9)' }}>
                            <i className={`bi ${getCategoryIcon(ticket.category)} me-1`} style={{ color: '#3b82f6' }}></i>
                            {ticket.category}
                          </td>
                          <td style={{ backgroundColor: 'rgba(11, 12, 45, 0.9)' }}>{getStatusBadge(ticket.status)}</td>
                          <td className="text-white-50" style={{ backgroundColor: 'rgba(11, 12, 45, 0.9)' }}>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                          <td style={{ backgroundColor: 'rgba(11, 12, 45, 0.9)' }}>
                            <button className="btn btn-sm" style={{
                              background: 'rgba(3, 5, 68, 0.9)',
                              border: '1px solid rgba(59, 130, 246, 0.5)',
                              color: '#3b82f6'
                            }}>
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
                  <i className="bi bi-ticket-detailed text-white-50" style={{ fontSize: '3rem' }}></i>
                  <p className="text-white-50 mt-3">No support tickets yet</p>
                  <p className="text-white-50 small">Create a ticket above if you need help</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-header" style={{
              background: 'rgba(60, 58, 58, 0.03)',
              borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
            }}>
              <h5 className="card-title mb-0 text-white">Frequently Asked Questions</h5>
            </div>
            <div className="card-body">
              <div className="accordion" id="faqAccordion">
                <div className="accordion-item" style={{
                  background: 'rgba(60, 58, 58, 0.03)',
                  border: '1px solid rgba(124, 124, 124, 0.39)'
                }}>
                  <h2 className="accordion-header">
                    <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#faq1" style={{
                      background: 'rgba(60, 58, 58, 0.03)',
                      color: '#e2e8f0'
                    }}>
                      How do I complete my KYC verification?
                    </button>
                  </h2>
                  <div id="faq1" className="accordion-collapse collapse show" data-bs-parent="#faqAccordion">
                    <div className="accordion-body" style={{
                      background: 'rgba(60, 58, 58, 0.03)',
                      color: '#e2e8f0'
                    }}>
                      To complete KYC verification, go to your profile settings and upload the required documents including PAN card, Aadhaar card, and a recent photograph. Our team will review and verify your documents within 24-48 hours.
                    </div>
                  </div>
                </div>
                
                <div className="accordion-item" style={{
                  background: 'rgba(60, 58, 58, 0.03)',
                  border: '1px solid rgba(124, 124, 124, 0.39)'
                }}>
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq2" style={{
                      background: 'rgba(60, 58, 58, 0.03)',
                      color: '#e2e8f0'
                    }}>
                      What are the minimum withdrawal requirements?
                    </button>
                  </h2>
                  <div id="faq2" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div className="accordion-body" style={{
                      background: 'rgba(60, 58, 58, 0.03)',
                      color: '#e2e8f0'
                    }}>
                      The minimum withdrawal amount is ₹500. For referral bonus withdrawals, you must have made at least one deposit to your wallet first.
                    </div>
                  </div>
                </div>
                
                <div className="accordion-item" style={{
                  background: 'rgba(60, 58, 58, 0.03)',
                  border: '1px solid rgba(124, 124, 124, 0.39)'
                }}>
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq3" style={{
                      background: 'rgba(60, 58, 58, 0.03)',
                      color: '#e2e8f0'
                    }}>
                      How does the referral program work?
                    </button>
                  </h2>
                  <div id="faq3" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div className="accordion-body" style={{
                      background: 'rgba(60, 58, 58, 0.03)',
                      color: '#e2e8f0'
                    }}>
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
