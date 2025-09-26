'use client';

import React, { useEffect, useState } from 'react';

const AdminTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ status: '', category: '', search: '' });
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/support/tickets?${params.toString()}`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok && data.success) setTickets(data.tickets || []);
    } catch (e) {
      console.error('Load tickets error:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadTicket = async (ticketId) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/support/ticket/${ticketId}`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok && data.success) setSelected(data);
    } catch (e) {
      console.error('Load ticket error:', e);
    }
  };

  const sendReply = async () => {
    if (!selected?.ticket || !reply.trim()) return;
    setUpdating(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/support/ticket/${selected.ticket.ticketId}/response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: reply.trim() })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReply('');
        await loadTicket(selected.ticket.ticketId);
        await loadTickets();
      }
    } catch (e) {
      console.error('Reply error:', e);
    } finally {
      setUpdating(false);
    }
  };

  const updateStatus = async (status) => {
    if (!selected?.ticket) return;
    setUpdating(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/support/ticket/${selected.ticket.ticketId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await loadTicket(selected.ticket.ticketId);
        await loadTickets();
      }
    } catch (e) {
      console.error('Update status error:', e);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    loadTickets();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.category]);

  return (
    <div className="container-fluid py-4" style={{ color: 'white' }}>
      <div className="row mb-3">
        <div className="col-12 d-flex align-items-center justify-content-between">
          <h2 className="fw-bold mb-0 text-white">Support Tickets</h2>
          <button 
            className="btn" 
            onClick={loadTickets} 
            disabled={loading}
            style={{
              background: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.5)',
              color: '#3b82f6',
              backdropFilter: 'blur(20px)',
              boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
            }}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="card border-0 mb-4" style={{
        background: 'rgba(60, 58, 58, 0.03)',
        border: '1px solid rgba(124, 124, 124, 0.39)',
        backdropFilter: 'blur(20px)',
        boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
      }}>
        <div className="card-body" style={{ color: '#e2e8f0' }}>
          <div className="row g-2">
            <div className="col-md-3">
              <select 
                className="form-select" 
                value={filters.status} 
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                style={{
                  background: 'rgba(60, 58, 58, 0.03)',
                  border: '1px solid rgba(124, 124, 124, 0.39)',
                  color: '#e2e8f0'
                }}
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="col-md-3">
              <select 
                className="form-select" 
                value={filters.category} 
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                style={{
                  background: 'rgba(60, 58, 58, 0.03)',
                  border: '1px solid rgba(124, 124, 124, 0.39)',
                  color: '#e2e8f0'
                }}
              >
                <option value="">All Categories</option>
                <option value="general">General</option>
                <option value="technical">Technical</option>
                <option value="billing">Billing</option>
                <option value="account">Account</option>
                <option value="trading">Trading</option>
                <option value="kyc">KYC</option>
              </select>
            </div>
            <div className="col-md-6">
              <input
                type="text"
                className="form-control"
                placeholder="Search by subject, message, email, or ticket ID"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') loadTickets(); }}
                style={{
                  background: 'rgba(60, 58, 58, 0.03)',
                  border: '1px solid rgba(124, 124, 124, 0.39)',
                  color: '#e2e8f0'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="card border-0 h-100" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-body p-0" style={{ color: '#e2e8f0' }}>
              <div className="table-responsive">
                <table className="table table-hover mb-0" style={{
                  background: 'rgba(60, 58, 58, 0.03)',
                  border: '1px solid rgba(124, 124, 124, 0.39)'
                }}>
                  <thead style={{
                    background: 'rgba(30, 30, 30, 0.8)',
                    borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
                  }}>
                    <tr>
                      <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Ticket</th>
                      <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Subject</th>
                      <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Category</th>
                      <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Status</th>
                      <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Last Activity</th>
                    </tr>
                  </thead>
                  <tbody style={{ background: 'transparent' }}>
                    {tickets.map((t) => (
                      <tr 
                        key={t._id} 
                        onClick={() => loadTicket(t.ticketId)} 
                        style={{ 
                          cursor: 'pointer',
                          background: selected?.ticket?.ticketId === t.ticketId ? 'rgba(59, 130, 246, 0.1)' : 'rgba(60, 58, 58, 0.03)',
                          borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
                        }}
                      >
                        <td className="text-white" style={{ background: 'transparent' }}>
                          <code>{t.ticketId}</code><br/>
                          <small className="text-white-50">{t.userEmail}</small>
                        </td>
                        <td className="text-white" style={{ background: 'transparent' }}>{t.subject}</td>
                        <td style={{ background: 'transparent' }}>
                          <span className="badge" style={{
                            background: 'rgba(59, 130, 246, 0.2)',
                            border: '1px solid rgba(59, 130, 246, 0.5)',
                            color: '#3b82f6'
                          }}>{t.category}</span>
                        </td>
                        <td style={{ background: 'transparent' }}>
                          <span className={`badge ${
                            t.status === 'open' ? 'bg-warning' : 
                            t.status === 'in_progress' ? 'bg-primary' : 
                            t.status === 'resolved' ? 'bg-success' : 'bg-secondary'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="text-white-50" style={{ background: 'transparent' }}>
                          <small>{new Date(t.lastActivity || t.createdAt).toLocaleString()}</small>
                        </td>
                      </tr>
                    ))}
                    {tickets.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center text-white-50 py-4" style={{ background: 'transparent' }}>No tickets found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6 mb-4">
          <div className="card border-0 h-100" style={{
            background: 'rgba(60, 58, 58, 0.03)',
            border: '1px solid rgba(124, 124, 124, 0.39)',
            backdropFilter: 'blur(20px)',
            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
          }}>
            <div className="card-body" style={{ color: '#e2e8f0' }}>
              {selected?.ticket ? (
                <>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="card-title mb-1 text-white">{selected.ticket.subject}</h5>
                      <div className="text-white-50">
                        <code>{selected.ticket.ticketId}</code> • 
                        <span className="badge ms-1" style={{
                          background: 'rgba(59, 130, 246, 0.2)',
                          border: '1px solid rgba(59, 130, 246, 0.5)',
                          color: '#3b82f6'
                        }}>{selected.ticket.category}</span>
                      </div>
                    </div>
                    <div>
                      <select 
                        className="form-select" 
                        value={selected.ticket.status} 
                        onChange={(e) => updateStatus(e.target.value)} 
                        disabled={updating}
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: '#e2e8f0'
                        }}
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <strong className="text-white">User:</strong> <span className="text-white-50">{selected.ticket.userEmail}</span>
                  </div>

                  {selected.user && (
                    <div className="mb-3 p-3 rounded" style={{
                      background: 'rgba(60, 58, 58, 0.03)',
                      border: '1px solid rgba(124, 124, 124, 0.39)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
                    }}>
                      <div className="fw-bold mb-2 text-white">User Details</div>
                      <div className="row">
                        <div className="col-md-6">
                          <div><strong className="text-white">Email:</strong> <span className="text-white-50">{selected.user.email}</span></div>
                          <div><strong className="text-white">UID:</strong> <span className="text-white-50">{selected.user.uid}</span></div>
                          <div><strong className="text-white">Phone:</strong> <span className="text-white-50">{selected.user.phone || 'N/A'}</span></div>
                        </div>
                        <div className="col-md-6">
                          <div><strong className="text-white">KYC Status:</strong> <span className="text-white-50">{selected.user.kyc?.status || 'not_applied'}</span></div>
                          {selected.user.kyc?.panCardNumber && <div><strong className="text-white">PAN:</strong> <span className="text-white-50">{selected.user.kyc.panCardNumber}</span></div>}
                        </div>
                      </div>
                      {(selected.user.kyc?.panCardImage || selected.user.kyc?.profilePhoto) && (
                        <div className="row mt-2 g-2">
                          {selected.user.kyc?.panCardImage && (
                            <div className="col-6">
                              <div className="small text-muted mb-1">PAN Card</div>
                              <img src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${selected.user.kyc.panCardImage}`} alt="PAN" className="img-fluid rounded border" />
                            </div>
                          )}
                          {selected.user.kyc?.profilePhoto && (
                            <div className="col-6">
                              <div className="small text-muted mb-1">Profile Photo</div>
                              <img src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${selected.user.kyc.profilePhoto}`} alt="Profile" className="img-fluid rounded border" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mb-3">
                    <div className="fw-bold mb-2 text-white">Conversation</div>
                    <div className="rounded p-2" style={{ 
                      maxHeight: 280, 
                      overflow: 'auto',
                      background: 'rgba(60, 58, 58, 0.03)',
                      border: '1px solid rgba(124, 124, 124, 0.39)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
                    }}>
                      {selected.ticket.responses?.map((r, idx) => (
                        <div key={idx} className={`p-2 mb-2 rounded ${r.from === 'admin' ? 'bg-primary bg-opacity-10' : 'bg-secondary bg-opacity-10'}`}>
                          <div className="small text-white-50 mb-1">{r.from.toUpperCase()} • {new Date(r.timestamp).toLocaleString()}</div>
                          <div className="text-white">{r.message}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="input-group">
                    <input 
                      className="form-control" 
                      placeholder="Type a reply..." 
                      value={reply} 
                      onChange={(e) => setReply(e.target.value)}
                      style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        color: '#e2e8f0'
                      }}
                    />
                    <button 
                      className="btn" 
                      onClick={sendReply} 
                      disabled={updating || !reply.trim()}
                      style={{
                        background: 'rgba(59, 130, 246, 0.2)',
                        border: '1px solid rgba(59, 130, 246, 0.5)',
                        color: '#3b82f6',
                        backdropFilter: 'blur(20px)',
                        boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
                      }}
                    >
                      {updating ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center text-white-50">Select a ticket to view details</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTicketsPage;


