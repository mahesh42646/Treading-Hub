'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function ChallengesPage() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [configs, setConfigs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [accountSize, setAccountSize] = useState('10000');
  const [profitTarget, setProfitTarget] = useState(8);
  const [platform, setPlatform] = useState('MetaTrader 5');
  const [couponCode, setCouponCode] = useState('');
  const [payFrom, setPayFrom] = useState('wallet');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [myChallenges, setMyChallenges] = useState([]);
  const [showBuy, setShowBuy] = useState(false);

  const walletBalance = profile?.wallet?.walletBalance || 0;
  const referralBalance = profile?.wallet?.referralBalance || 0;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [cfgRes, myRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/challenges/configs`, { credentials: 'include' }),
          user?.uid ? fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${user.uid}/challenges`) : Promise.resolve({ ok: false, json: async () => ({}) })
        ]);
        const cfgData = await cfgRes.json();
        setConfigs(cfgData.challenges || []);
        if (myRes.ok) {
          const myData = await myRes.json();
          const list = Array.isArray(myData.challenges) ? myData.challenges : [];
          // Sort: recent first by startedAt/createdAt
          list.sort((a,b) => new Date(b.startedAt || b.createdAt || 0) - new Date(a.startedAt || a.createdAt || 0));
          setMyChallenges(list);
          setShowBuy(list.length === 0);
        } else {
          setShowBuy(true);
        }
        if ((cfgData.challenges || []).length > 0) {
          const first = cfgData.challenges[0];
          setSelected(first);
          const firstSize = [...(first.pricesByAccountSize ? Object.keys(first.pricesByAccountSize) : ['10000'])][0];
          setAccountSize(firstSize);
          setProfitTarget(first.profitTargets?.[0] || 8);
          setPlatform(first.platforms?.[0] || 'MetaTrader 5');
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const price = useMemo(() => {
    if (!selected) return 0;
    const p = selected.pricesByAccountSize?.[accountSize] ?? selected.pricesByAccountSize?.get?.(String(accountSize));
    return Number(p || 0);
  }, [selected, accountSize]);

  const canAfford = useMemo(() => {
    const bal = payFrom === 'referral' ? referralBalance : walletBalance;
    return bal >= price && price > 0;
  }, [payFrom, walletBalance, referralBalance, price]);

  const purchase = async () => {
    if (!user?.uid || !selected) return;
    if (!canAfford) {
      alert('Insufficient balance');
      return;
    }
    if (!agreeTerms) {
      alert('Please agree to the terms to continue');
      return;
    }
    try {
      setPurchasing(true);
      setErrorMsg('');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/challenges/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          uid: user.uid,
          challengeId: selected._id,
          accountSize: Number(accountSize),
          platform,
          couponCode: couponCode || undefined,
          paymentSource: payFrom
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Challenge purchased successfully');
        setCouponCode('');
        // Soft reset of purchase UI
        setAgreeTerms(true);
        // Refresh challenges list
        try {
          const myRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${user.uid}/challenges`);
          const myData = await myRes.json();
          const list = Array.isArray(myData.challenges) ? myData.challenges : [];
          list.sort((a,b) => new Date(b.startedAt || b.createdAt || 0) - new Date(a.startedAt || a.createdAt || 0));
          setMyChallenges(list);
          setShowBuy(false);
        } catch (_) {}
      } else {
        setErrorMsg(data.message || 'Failed to purchase');
        alert(data.message || 'Failed to purchase');
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('Failed to purchase');
      alert('Failed to purchase');
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold mb-0 text-white">Challenges</h3>
        <div className="text-end small text-white-50">
          Wallet: ₹{walletBalance.toFixed(2)} · Referral: ₹{referralBalance.toFixed(2)}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
        </div>
      ) : configs.length === 0 ? (
        <div className="alert rounded-4" style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          color: '#e2e8f0'
        }}>No challenges available.</div>
      ) : (
        <div className="row g-3">
          {(showBuy || myChallenges.length === 0) && (
            <div className="col-lg-4">
              <div className="card border-0 h-100" style={{
                background: 'rgba(60, 58, 58, 0.03)',
                border: '1px solid rgba(124, 124, 124, 0.39)',
                backdropFilter: 'blur(20px)',
                boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
              }}>
                <div className="card-header border-0" style={{
                  background: 'transparent',
                  borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
                }}>
                  <h6 className="mb-0 text-white">Select Challenge</h6>
                </div>
                <div className="list-group list-group-flush">
                  {configs.map(cfg => (
                    <button
                      key={cfg._id}
                      className={`list-group-item list-group-item-action border-0 px-3 ${selected?._id === cfg._id ? 'active' : ''}`}
                      style={{
                        background: selected?._id === cfg._id ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                        color: selected?._id === cfg._id ? '#3b82f6' : '#e2e8f0',
                        borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
                      }}
                      onClick={() => {
                        setSelected(cfg);
                        const firstSize = [...(cfg.pricesByAccountSize ? Object.keys(cfg.pricesByAccountSize) : ['10000'])][0];
                        setAccountSize(firstSize);
                        setProfitTarget(cfg.profitTargets?.[0] || 8);
                        setPlatform(cfg.platforms?.[0] || 'MetaTrader 5');
                        setShowBuy(true);
                      }}
                    >
                      <div className="d-flex justify-content-between">
                        <div>
                          <div className="fw-semibold text-white">{cfg.name}</div>
                          <small className="text-white-50">{cfg.type} · {cfg.model}</small>
                        </div>
                        <i className="bi bi-trophy text-warning"></i>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="col-lg-8">
            {showBuy || myChallenges.length === 0 ? selected && (
              <div className="card border-0 p-2" style={{
                background: 'rgba(60, 58, 58, 0.03)',
                border: '1px solid rgba(124, 124, 124, 0.39)',
                backdropFilter: 'blur(20px)',
                boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
              }}>
                <div className="card-header border-0" style={{
                  background: 'transparent',
                  borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
                }}>
                  <h5 className="mb-0 text-white">{selected.name}</h5>
                </div>
                <div className="card-body" style={{ color: '#e2e8f0' }}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label text-white">Profit Target</label>
                      <div className="d-flex gap-2">
                        {selected.profitTargets?.map(pt => (
                          <button 
                            key={pt} 
                            className={`btn btn-sm rounded-4 ${Number(profitTarget)===Number(pt)?'':'btn-outline-'}`} 
                            style={Number(profitTarget)===Number(pt) ? {
                              background: 'rgba(59, 130, 246, 0.2)',
                              border: '1px solid rgba(59, 130, 246, 0.5)',
                              color: '#3b82f6'
                            } : {
                              background: 'rgba(60, 58, 58, 0.03)',
                              border: '1px solid rgba(124, 124, 124, 0.39)',
                              color: '#e2e8f0'
                            }}
                            onClick={() => setProfitTarget(pt)}
                          >
                            {pt}%
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-white">Account Size</label>
                      <select 
                        className="form-select rounded-4" 
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: '#e2e8f0'
                        }}
                        value={accountSize} 
                        onChange={e=>setAccountSize(e.target.value)}
                      >
                        {Object.keys(selected.pricesByAccountSize || {}).map(sz => (
                          <option key={sz} value={sz}>${sz.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-white">Trading Platform</label>
                      <select 
                        className="form-select rounded-4" 
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: '#e2e8f0'
                        }}
                        value={platform} 
                        onChange={e=>setPlatform(e.target.value)}
                      >
                        {selected.platforms?.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-white">Coupon Code</label>
                      <input 
                        className="form-control rounded-4" 
                        style={{
                          background: 'rgba(60, 58, 58, 0.03)',
                          border: '1px solid rgba(124, 124, 124, 0.39)',
                          color: '#e2e8f0'
                        }}
                        value={couponCode} 
                        onChange={e=>setCouponCode(e.target.value)} 
                        placeholder="Enter coupon code" 
                      />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label text-white">Pay From</label>
                      <div className="d-flex gap-3">
                        <div className="form-check">
                          <input 
                            className="form-check-input" 
                            type="radio" 
                            id="payWallet" 
                            checked={payFrom==='wallet'} 
                            onChange={()=>setPayFrom('wallet')}
                            style={{
                              accentColor: '#3b82f6'
                            }}
                          />
                          <label className="form-check-label text-white" htmlFor="payWallet">Wallet (₹{walletBalance.toFixed(2)})</label>
                        </div>
                        <div className="form-check">
                          <input 
                            className="form-check-input" 
                            type="radio" 
                            id="payReferral" 
                            checked={payFrom==='referral'} 
                            onChange={()=>setPayFrom('referral')}
                            style={{
                              accentColor: '#3b82f6'
                            }}
                          />
                          <label className="form-check-label text-white" htmlFor="payReferral">Referral (₹{referralBalance.toFixed(2)})</label>
                        </div>
                      </div>
                    </div>
                    {errorMsg ? (
                      <div className="col-12">
                        <div className="alert py-2 mb-0 rounded-4" style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#e2e8f0'
                        }}>{errorMsg}</div>
                      </div>
                    ) : null}
                  </div>
                  <hr style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }} />
                  <div className="row g-3 align-items-start">
                    <div className="col-md-7">
                      <div className="form-check">
                        <input 
                          className="form-check-input" 
                          type="checkbox" 
                          id="agree" 
                          checked={agreeTerms} 
                          onChange={()=>setAgreeTerms(v=>!v)}
                          style={{
                            accentColor: '#3b82f6'
                          }}
                        />
                        <label className="form-check-label text-white" htmlFor="agree">
                          I agree with the Terms of Use and confirm my information is correct
                        </label>
                      </div>
                    </div>
                    <div className="col-md-5">
                      <div className="card border-0" style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)'
                      }}>
                        <div className="card-body py-3">
                          <div className="d-flex justify-content-between small text-white">
                            <span>{selected.name} — ${Number(accountSize).toLocaleString()}</span>
                            <span>₹{price.toFixed(2)}</span>
                          </div>
                          <div className="d-flex justify-content-between small text-white-50">
                            <span>Platform</span>
                            <span>{platform}</span>
                          </div>
                          <hr className="my-2" style={{ borderColor: 'rgba(124, 124, 124, 0.39)' }} />
                          <div className="d-flex justify-content-between fw-semibold text-white">
                            <span>Total</span>
                            <span>₹{price.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-12 d-flex justify-content-end">
                      <button 
                        className="btn rounded-4" 
                        style={{
                          background: 'rgba(59, 130, 246, 0.2)',
                          border: '1px solid rgba(59, 130, 246, 0.5)',
                          color: '#3b82f6'
                        }}
                        onClick={purchase} 
                        disabled={!canAfford || purchasing || !agreeTerms}
                      >
                        {purchasing ? 'Processing...' : 'Continue to Payment'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card border-0" style={{
                background: 'rgba(60, 58, 58, 0.03)',
                border: '1px solid rgba(124, 124, 124, 0.39)',
                backdropFilter: 'blur(20px)',
                boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
              }}>
                <div className="card-header border-0 d-flex justify-content-between align-items-center" style={{
                  background: 'transparent',
                  borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
                }}>
                  <h5 className="mb-0 text-white">My Challenges</h5>
                  <button 
                    className="btn btn-sm rounded-4" 
                    style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid rgba(59, 130, 246, 0.5)',
                      color: '#3b82f6'
                    }}
                    onClick={() => setShowBuy(true)}
                  >
                    New Challenge
                  </button>
                </div>
                <div className="card-body" style={{ color: '#e2e8f0' }}>
                  {myChallenges.length === 0 ? (
                    <div className="alert mb-0 rounded-4" style={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      color: '#e2e8f0'
                    }}>&#39;You don&#39;t have any challenges yet.&#39;</div>
                  ) : (
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
                            <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Name</th>
                            <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Account</th>
                            <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Platform</th>
                            <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Price</th>
                            <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Status</th>
                            <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Started</th>
                            <th className="text-white-50" style={{ background: 'rgba(30, 30, 30, 0.8)' }}>Expiry</th>
                          </tr>
                        </thead>
                        <tbody style={{ background: 'transparent' }}>
                          {myChallenges.map((ch, idx) => (
                            <tr key={ch._id || idx} style={{
                              background: 'rgba(60, 58, 58, 0.03)',
                              borderBottom: '1px solid rgba(124, 124, 124, 0.39)'
                            }}>
                              <td className="text-white" style={{ background: 'transparent' }}>{ch.name}</td>
                              <td className="text-white" style={{ background: 'transparent' }}>${Number(ch.accountSize).toLocaleString()}</td>
                              <td className="text-white" style={{ background: 'transparent' }}>{ch.platform}</td>
                              <td className="text-white" style={{ background: 'transparent' }}>₹{Number(ch.price || 0).toFixed(2)}</td>
                              <td style={{ background: 'transparent' }}>
                                <span className="badge" style={{
                                  background: ch.status === 'active' ? 'rgba(34, 197, 94, 0.2)' : 
                                            ch.status === 'failed' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(124, 124, 124, 0.2)',
                                  color: ch.status === 'active' ? '#22c55e' : 
                                        ch.status === 'failed' ? '#ef4444' : '#9ca3af',
                                  border: ch.status === 'active' ? '1px solid rgba(34, 197, 94, 0.5)' : 
                                         ch.status === 'failed' ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(124, 124, 124, 0.5)'
                                }}>{ch.status}</span>
                              </td>
                              <td className="text-white-50" style={{ background: 'transparent' }}>{ch.startedAt ? new Date(ch.startedAt).toLocaleDateString() : '-'}</td>
                              <td className="text-white-50" style={{ background: 'transparent' }}>{ch.endedAt ? new Date(ch.endedAt).toLocaleDateString() : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


