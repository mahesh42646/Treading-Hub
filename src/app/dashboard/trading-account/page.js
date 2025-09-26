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
        <h3 className="fw-bold mb-0 text-white">My Trading Accounts</h3>
        <a href="/dashboard/challenges" className="btn rounded-4" style={{
          background: 'rgba(59, 130, 246, 0.2)',
          border: '1px solid rgba(59, 130, 246, 0.5)',
          color: '#3b82f6'
        }}>Get New Challenge</a>
      </div>

      {entries.length === 0 ? (
        <div className="card border-0" style={{
          background: 'rgba(60, 58, 58, 0.03)',
          border: '1px solid rgba(124, 124, 124, 0.39)',
          backdropFilter: 'blur(20px)',
          boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
        }}>
          <div className="card-body text-center py-5" style={{ color: '#e2e8f0' }}>
            <p className="mb-2 text-white">No trading accounts assigned yet.</p>
            <a href="/dashboard/challenges" className="btn rounded-4" style={{
              background: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.5)',
              color: '#3b82f6'
            }}>Get New Challenge</a>
          </div>
        </div>
      ) : (
        <div className="card border-0" style={{
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
                    <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Challenge</th>
                    <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Account</th>
                    <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Broker</th>
                    <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Platform</th>
                    <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Started</th>
                    <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Expiry</th>
                    <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}></th>
                  </tr>
                </thead>
                <tbody style={{ background: 'transparent' }}>
                  {entries.map((ch, idx) => (
                    <tr key={ch._id || idx} style={{
                      background: 'rgba(60, 58, 58, 0.03)',
                      borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
                    }}>
                      <td className="text-white" style={{ background: 'transparent' }}>{ch.name} — ${Number(ch.accountSize).toLocaleString()}</td>
                      <td className="text-white" style={{ background: 'transparent' }}>{ch.tradingAccount?.accountName || '-'}</td>
                      <td className="text-white" style={{ background: 'transparent' }}>{ch.tradingAccount?.brokerName || '-'}</td>
                      <td className="text-white" style={{ background: 'transparent' }}>{ch.tradingAccount?.platform || '-'}</td>
                      <td className="text-white-50" style={{ background: 'transparent' }}>{ch.startedAt ? new Date(ch.startedAt).toLocaleDateString() : '-'}</td>
                      <td className="text-white-50" style={{ background: 'transparent' }}>{ch.endedAt ? new Date(ch.endedAt).toLocaleDateString() : '-'}</td>
                      <td className="text-end" style={{ background: 'transparent' }}>
                        <button className="btn btn-sm rounded-4" style={{
                          background: 'rgba(59, 130, 246, 0.2)',
                          border: '1px solid rgba(59, 130, 246, 0.5)',
                          color: '#3b82f6'
                        }} onClick={() => setView(ch)}>View</button>
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
            <div className="modal-content" style={{
              background: 'rgba(60, 58, 58, 0.03)',
              border: '1px solid rgba(124, 124, 124, 0.39)',
              backdropFilter: 'blur(20px)',
              boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
            }}>
              <div className="modal-header" style={{
                background: 'rgba(60, 58, 58, 0.03)',
                borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
              }}>
                <h5 className="modal-title text-white">Trading Account for Challenge: {view.name}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setView(null)}></button>
              </div>
              <div className="modal-body" style={{ color: '#e2e8f0' }}>
                <div className="row">
                  <div className="col-12">
                    <h6 className="text-white-50 mb-3">Account Details</h6>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="card border-0" style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          backdropFilter: 'blur(20px)',
                          boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
                        }}>
                          <div className="card-body" style={{ color: '#e2e8f0' }}>
                            <h6 className="card-title mb-3" style={{ color: '#3b82f6' }}>
                              <i className="bi bi-person-circle me-2"></i>
                              Account Information
                            </h6>
                            <div className="mb-3">
                              <label className="form-label small text-white-50">Account Name</label>
                              <div className="input-group">
                                <input 
                                  type="text" 
                                  className="form-control form-control-sm" 
                                  value={view.tradingAccount?.accountName || ''} 
                                  readOnly 
                                  style={{
                                    background: 'rgba(60, 58, 58, 0.03)',
                                    border: '1px solid rgba(124, 124, 124, 0.39)',
                                    color: '#e2e8f0'
                                  }}
                                />
                                <button 
                                  className="btn btn-sm" 
                                  type="button"
                                  onClick={() => copy(view.tradingAccount?.accountName || '')}
                                  style={{
                                    background: 'rgba(59, 130, 246, 0.2)',
                                    border: '1px solid rgba(59, 130, 246, 0.5)',
                                    color: '#3b82f6'
                                  }}
                                >
                                  <i className="bi bi-copy"></i>
                                </button>
                              </div>
                            </div>
                            <div className="mb-3">
                              <label className="form-label small text-white-50">Broker</label>
                              <div className="input-group">
                                <input 
                                  type="text" 
                                  className="form-control form-control-sm" 
                                  value={view.tradingAccount?.brokerName || ''} 
                                  readOnly 
                                  style={{
                                    background: 'rgba(60, 58, 58, 0.03)',
                                    border: '1px solid rgba(124, 124, 124, 0.39)',
                                    color: '#e2e8f0'
                                  }}
                                />
                                <button 
                                  className="btn btn-sm" 
                                  type="button"
                                  onClick={() => copy(view.tradingAccount?.brokerName || '')}
                                  style={{
                                    background: 'rgba(59, 130, 246, 0.2)',
                                    border: '1px solid rgba(59, 130, 246, 0.5)',
                                    color: '#3b82f6'
                                  }}
                                >
                                  <i className="bi bi-copy"></i>
                                </button>
                              </div>
                            </div>
                            <div className="mb-3">
                              <label className="form-label small text-white-50">Platform</label>
                              <div className="input-group">
                                <input 
                                  type="text" 
                                  className="form-control form-control-sm" 
                                  value={view.tradingAccount?.platform || ''} 
                                  readOnly 
                                  style={{
                                    background: 'rgba(60, 58, 58, 0.03)',
                                    border: '1px solid rgba(124, 124, 124, 0.39)',
                                    color: '#e2e8f0'
                                  }}
                                />
                                <button 
                                  className="btn btn-sm" 
                                  type="button"
                                  onClick={() => copy(view.tradingAccount?.platform || '')}
                                  style={{
                                    background: 'rgba(59, 130, 246, 0.2)',
                                    border: '1px solid rgba(59, 130, 246, 0.5)',
                                    color: '#3b82f6'
                                  }}
                                >
                                  <i className="bi bi-copy"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="card border-0" style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          backdropFilter: 'blur(20px)',
                          boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
                        }}>
                          <div className="card-body" style={{ color: '#e2e8f0' }}>
                            <h6 className="card-title mb-3" style={{ color: '#22c55e' }}>
                              <i className="bi bi-key me-2"></i>
                              Login Credentials
                            </h6>
                            <div className="mb-3">
                              <label className="form-label small text-white-50">Server ID</label>
                              <div className="input-group">
                                <input 
                                  type="text" 
                                  className="form-control form-control-sm" 
                                  value={view.tradingAccount?.serverId || ''} 
                                  readOnly 
                                  style={{
                                    background: 'rgba(60, 58, 58, 0.03)',
                                    border: '1px solid rgba(124, 124, 124, 0.39)',
                                    color: '#e2e8f0'
                                  }}
                                />
                                <button 
                                  className="btn btn-sm" 
                                  type="button"
                                  onClick={() => copy(view.tradingAccount?.serverId || '')}
                                  style={{
                                    background: 'rgba(59, 130, 246, 0.2)',
                                    border: '1px solid rgba(59, 130, 246, 0.5)',
                                    color: '#3b82f6'
                                  }}
                                >
                                  <i className="bi bi-copy"></i>
                                </button>
                              </div>
                            </div>
                            <div className="mb-3">
                              <label className="form-label small text-white-50">Login ID</label>
                              <div className="input-group">
                                <input 
                                  type="text" 
                                  className="form-control form-control-sm" 
                                  value={view.tradingAccount?.loginId || ''} 
                                  readOnly 
                                  style={{
                                    background: 'rgba(60, 58, 58, 0.03)',
                                    border: '1px solid rgba(124, 124, 124, 0.39)',
                                    color: '#e2e8f0'
                                  }}
                                />
                                <button 
                                  className="btn btn-sm" 
                                  type="button"
                                  onClick={() => copy(view.tradingAccount?.loginId || '')}
                                  style={{
                                    background: 'rgba(59, 130, 246, 0.2)',
                                    border: '1px solid rgba(59, 130, 246, 0.5)',
                                    color: '#3b82f6'
                                  }}
                                >
                                  <i className="bi bi-copy"></i>
                                </button>
                              </div>
                            </div>
                            <div className="mb-3">
                              <label className="form-label small text-white-50">Password</label>
                              <div className="input-group">
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={view.tradingAccount?.password || ''}
                                  readOnly
                                  style={{
                                    background: 'rgba(60, 58, 58, 0.03)',
                                    border: '1px solid rgba(124, 124, 124, 0.39)',
                                    color: '#e2e8f0'
                                  }}
                                />
                                <button 
                                  className="btn btn-sm" 
                                  type="button"
                                  onClick={() => copy(view.tradingAccount?.password || '')}
                                  style={{
                                    background: 'rgba(59, 130, 246, 0.2)',
                                    border: '1px solid rgba(59, 130, 246, 0.5)',
                                    color: '#3b82f6'
                                  }}
                                >
                                  <i className="bi bi-copy"></i>
                                </button>
                              </div>
                            </div>
                            {view.tradingAccount?.serverAddress && (
                              <div className="mb-3">
                                <label className="form-label small text-white-50">Server Address</label>
                                <div className="input-group">
                                  <input 
                                    type="text" 
                                    className="form-control form-control-sm" 
                                    value={view.tradingAccount?.serverAddress || ''} 
                                    readOnly 
                                    style={{
                                      background: 'rgba(60, 58, 58, 0.03)',
                                      border: '1px solid rgba(124, 124, 124, 0.39)',
                                      color: '#e2e8f0'
                                    }}
                                  />
                                  <button 
                                    className="btn btn-sm" 
                                    type="button"
                                    onClick={() => copy(view.tradingAccount?.serverAddress || '')}
                                    style={{
                                      background: 'rgba(59, 130, 246, 0.2)',
                                      border: '1px solid rgba(59, 130, 246, 0.5)',
                                      color: '#3b82f6'
                                    }}
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
                    <div className="alert mt-3" style={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      color: '#e2e8f0'
                    }}>
                      <i className="bi bi-info-circle me-2" style={{ color: '#3b82f6' }}></i>
                      <strong className="text-white">Instructions:</strong> <span className="text-white-50">Use these credentials to log into your trading platform. Click the copy button next to each field to copy the value to your clipboard.</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{
                background: 'rgba(60, 58, 58, 0.03)',
                borderTop: '1px solid rgba(124, 124, 124, 0.39)'
              }}>
                <button type="button" className="btn" onClick={() => setView(null)} style={{
                  background: 'rgba(59, 130, 246, 0.2)',
                  border: '1px solid rgba(59, 130, 246, 0.5)',
                  color: '#3b82f6'
                }}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
