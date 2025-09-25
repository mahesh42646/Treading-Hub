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
    <div className="container-fluid py-4">
      <div className="row mb-3">
        <div className="col-12 d-flex align-items-center justify-content-between">
          <h2 className="fw-bold mb-0">Support Tickets</h2>
          <button className="btn btn-outline-secondary" onClick={loadTickets} disabled={loading}>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-3">
              <select className="form-select" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
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
              />
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-6 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Ticket</th>
                      <th>Subject</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Last Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((t) => (
                      <tr key={t._id} onClick={() => loadTicket(t.ticketId)} style={{ cursor: 'pointer' }} className={selected?.ticket?.ticketId === t.ticketId ? 'table-active' : ''}>
                        <td><code>{t.ticketId}</code><br/><small className="text-muted">{t.userEmail}</small></td>
                        <td>{t.subject}</td>
                        <td><span className="badge bg-info">{t.category}</span></td>
                        <td>
                          <span className={`badge ${t.status === 'open' ? 'bg-warning' : t.status === 'in_progress' ? 'bg-primary' : t.status === 'resolved' ? 'bg-success' : 'bg-secondary'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td><small className="text-muted">{new Date(t.lastActivity || t.createdAt).toLocaleString()}</small></td>
                      </tr>
                    ))}
                    {tickets.length === 0 && (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-4">No tickets found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-6 mb-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              {selected?.ticket ? (
                <>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h5 className="card-title mb-1">{selected.ticket.subject}</h5>
                      <div className="text-muted"><code>{selected.ticket.ticketId}</code> • <span className="badge bg-info">{selected.ticket.category}</span></div>
                    </div>
                    <div>
                      <select className="form-select" value={selected.ticket.status} onChange={(e) => updateStatus(e.target.value)} disabled={updating}>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-3">
                    <strong>User:</strong> {selected.ticket.userEmail}
                  </div>

                  {selected.user && (
                    <div className="mb-3 p-3 bg-light rounded">
                      <div className="fw-bold mb-2">User Details</div>
                      <div className="row">
                        <div className="col-md-6">
                          <div><strong>Email:</strong> {selected.user.email}</div>
                          <div><strong>UID:</strong> {selected.user.uid}</div>
                          <div><strong>Phone:</strong> {selected.user.phone || 'N/A'}</div>
                        </div>
                        <div className="col-md-6">
                          <div><strong>KYC Status:</strong> {selected.user.kyc?.status || 'not_applied'}</div>
                          {selected.user.kyc?.panCardNumber && <div><strong>PAN:</strong> {selected.user.kyc.panCardNumber}</div>}
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
                    <div className="fw-bold mb-2">Conversation</div>
                    <div className="border rounded p-2" style={{ maxHeight: 280, overflow: 'auto' }}>
                      {selected.ticket.responses?.map((r, idx) => (
                        <div key={idx} className={`p-2 mb-2 rounded ${r.from === 'admin' ? 'bg-primary bg-opacity-10' : 'bg-secondary bg-opacity-10'}`}>
                          <div className="small text-muted mb-1">{r.from.toUpperCase()} • {new Date(r.timestamp).toLocaleString()}</div>
                          <div>{r.message}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="input-group">
                    <input className="form-control" placeholder="Type a reply..." value={reply} onChange={(e) => setReply(e.target.value)} />
                    <button className="btn btn-primary" onClick={sendReply} disabled={updating || !reply.trim()}>
                      {updating ? 'Sending...' : 'Send Reply'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted">Select a ticket to view details</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTicketsPage;


