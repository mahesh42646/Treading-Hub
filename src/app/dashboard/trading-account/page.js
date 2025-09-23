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
                      <td>{ch.name} — ${'{'}Number(ch.accountSize).toLocaleString(){'}'}</td>
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
                <h5 className="modal-title">Trading Account for {view.name}</h5>
                <button type="button" className="btn-close" onClick={() => setView(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="list-group small">
                      <div className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Account Name</span>
                        <span className="fw-semibold">{view.tradingAccount?.accountName}</span>
                      </div>
                      <div className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Broker</span>
                        <span className="fw-semibold">{view.tradingAccount?.brokerName}</span>
                      </div>
                      <div className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Platform</span>
                        <span className="fw-semibold">{view.tradingAccount?.platform}</span>
                      </div>
                      <div className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Server ID</span>
                        <span className="fw-semibold">{view.tradingAccount?.serverId}</span>
                        <button className="btn btn-sm btn-outline-secondary ms-2" onClick={() => copy(view.tradingAccount?.serverId || '')}>Copy</button>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="list-group small">
                      <div className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Login ID</span>
                        <span className="fw-semibold">{view.tradingAccount?.loginId}</span>
                        <button className="btn btn-sm btn-outline-secondary ms-2" onClick={() => copy(view.tradingAccount?.loginId || '')}>Copy</button>
                      </div>
                      <div className="list-group-item d-flex justify-content-between align-items-center">
                        <span>Password</span>
                        <span className="fw-semibold">••••••••</span>
                        <button className="btn btn-sm btn-outline-secondary ms-2" onClick={() => copy(view.tradingAccount?.password || '')}>Copy</button>
                      </div>
                      {view.tradingAccount?.serverAddress && (
                        <div className="list-group-item d-flex justify-content-between align-items-center">
                          <span>Server</span>
                          <span className="fw-semibold">{view.tradingAccount?.serverAddress}</span>
                          <button className="btn btn-sm btn-outline-secondary ms-2" onClick={() => copy(view.tradingAccount?.serverAddress || '')}>Copy</button>
                        </div>
                      )}
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
