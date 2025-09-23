'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function TradingAccountsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState([]);
  const [view, setView] = useState(null); // challenge entry to view

  useEffect(() => {
    const load = async () => {
      if (!user?.uid) return;
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${user.uid}/challenges`);
        const data = await res.json();
        const now = Date.now();
        const list = (data.challenges || [])
          .filter(ch => ch.status === 'active' && ch.tradingAccountId && (!ch.endedAt || new Date(ch.endedAt).getTime() > now))
          .sort((a,b) => new Date(b.startedAt || b.createdAt || 0) - new Date(a.startedAt || a.createdAt || 0));
        setEntries(list);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); alert('Copied'); } catch (_) {}
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold mb-0">My Trading Accounts</h3>
        <a href="/dashboard/challenges" className="btn btn-primary">Get New Challenge</a>
      </div>

      {entries.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <p className="mb-2">No trading accounts assigned yet.</p>
            <a href="/dashboard/challenges" className="btn btn-primary">Get New Challenge</a>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Challenge</th>
                    <th>Account</th>
                    <th>Broker</th>
                    <th>Platform</th>
                    <th>Started</th>
                    <th>Expiry</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((ch, idx) => (
                    <tr key={ch._id || idx}>
                      <td>{ch.name} — ${Number(ch.accountSize).toLocaleString()}</td>
                      <td>{ch.tradingAccount?.accountName || '-'}</td>
                      <td>{ch.tradingAccount?.brokerName || '-'}</td>
                      <td>{ch.tradingAccount?.platform || '-'}</td>
                      <td>{ch.startedAt ? new Date(ch.startedAt).toLocaleDateString() : '-'}</td>
                      <td>{ch.endedAt ? new Date(ch.endedAt).toLocaleDateString() : '-'}</td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => setView(ch)}>View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {view && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Trading Account for Challenge: {view.name}</h5>
                <button type="button" className="btn-close" onClick={() => setView(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-12">
                    <h6 className="text-muted mb-3">Account Details</h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="card border-0 bg-light">
                          <div className="card-body">
                            <h6 className="card-title text-primary mb-3">
                              <i className="bi bi-person-circle me-2"></i>
                              Account Information
                            </h6>
                            <div className="mb-3">
                              <label className="form-label small text-muted">Account Name</label>
                              <div className="input-group">
                                <input 
                                  type="text" 
                                  className="form-control form-control-sm" 
                                  value={view.tradingAccount?.accountName || ''} 
                                  readOnly 
                                />
                                <button 
                                  className="btn btn-outline-secondary btn-sm" 
                                  type="button"
                                  onClick={() => copy(view.tradingAccount?.accountName || '')}
                                >
                                  <i className="bi bi-copy"></i>
                                </button>
                              </div>
                            </div>
                            <div className="mb-3">
                              <label className="form-label small text-muted">Broker</label>
                              <div className="input-group">
                                <input 
                                  type="text" 
                                  className="form-control form-control-sm" 
                                  value={view.tradingAccount?.brokerName || ''} 
                                  readOnly 
                                />
                                <button 
                                  className="btn btn-outline-secondary btn-sm" 
                                  type="button"
                                  onClick={() => copy(view.tradingAccount?.brokerName || '')}
                                >
                                  <i className="bi bi-copy"></i>
                                </button>
                              </div>
                            </div>
                            <div className="mb-3">
                              <label className="form-label small text-muted">Platform</label>
                              <div className="input-group">
                                <input 
                                  type="text" 
                                  className="form-control form-control-sm" 
                                  value={view.tradingAccount?.platform || ''} 
                                  readOnly 
                                />
                                <button 
                                  className="btn btn-outline-secondary btn-sm" 
                                  type="button"
                                  onClick={() => copy(view.tradingAccount?.platform || '')}
                                >
                                  <i className="bi bi-copy"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="card border-0 bg-light">
                          <div className="card-body">
                            <h6 className="card-title text-success mb-3">
                              <i className="bi bi-key me-2"></i>
                              Login Credentials
                            </h6>
                            <div className="mb-3">
                              <label className="form-label small text-muted">Server ID</label>
                              <div className="input-group">
                                <input 
                                  type="text" 
                                  className="form-control form-control-sm" 
                                  value={view.tradingAccount?.serverId || ''} 
                                  readOnly 
                                />
                                <button 
                                  className="btn btn-outline-secondary btn-sm" 
                                  type="button"
                                  onClick={() => copy(view.tradingAccount?.serverId || '')}
                                >
                                  <i className="bi bi-copy"></i>
                                </button>
                              </div>
                            </div>
                            <div className="mb-3">
                              <label className="form-label small text-muted">Login ID</label>
                              <div className="input-group">
                                <input 
                                  type="text" 
                                  className="form-control form-control-sm" 
                                  value={view.tradingAccount?.loginId || ''} 
                                  readOnly 
                                />
                                <button 
                                  className="btn btn-outline-secondary btn-sm" 
                                  type="button"
                                  onClick={() => copy(view.tradingAccount?.loginId || '')}
                                >
                                  <i className="bi bi-copy"></i>
                                </button>
                              </div>
                            </div>
                            <div className="mb-3">
                              <label className="form-label small text-muted">Password</label>
                              <div className="input-group">
                                <input
                                  type="password"
                                  className="form-control form-control-sm"
                                  value={view.tradingAccount?.password ? '********' : ''}
                                  readOnly
                                />
                                <button 
                                  className="btn btn-outline-secondary btn-sm" 
                                  type="button"
                                  onClick={() => copy(view.tradingAccount?.password || '')}
                                >
                                  <i className="bi bi-copy"></i>
                                </button>
                              </div>
                            </div>
                            {view.tradingAccount?.serverAddress && (
                              <div className="mb-3">
                                <label className="form-label small text-muted">Server Address</label>
                                <div className="input-group">
                                  <input 
                                    type="text" 
                                    className="form-control form-control-sm" 
                                    value={view.tradingAccount?.serverAddress || ''} 
                                    readOnly 
                                  />
                                  <button 
                                    className="btn btn-outline-secondary btn-sm" 
                                    type="button"
                                    onClick={() => copy(view.tradingAccount?.serverAddress || '')}
                                  >
                                    <i className="bi bi-copy"></i>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="alert alert-info mt-3">
                      <i className="bi bi-info-circle me-2"></i>
                      <strong>Instructions:</strong> Use these credentials to log into your trading platform. Click the copy button next to each field to copy the value to your clipboard.
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setView(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
