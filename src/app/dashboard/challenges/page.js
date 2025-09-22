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

  const walletBalance = profile?.wallet?.walletBalance || 0;
  const referralBalance = profile?.wallet?.referralBalance || 0;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/challenges/configs`, { credentials: 'include' });
        const data = await res.json();
        setConfigs(data.challenges || []);
        if ((data.challenges || []).length > 0) {
          const first = data.challenges[0];
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
  }, []);

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
    try {
      setPurchasing(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/challenges/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          uid: user.uid,
          challengeId: selected._id,
          accountSize: Number(accountSize),
          profitTarget: Number(profitTarget),
          platform,
          couponCode: couponCode || undefined,
          payFrom
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Challenge purchased successfully');
        setCouponCode('');
      } else {
        alert(data.message || 'Failed to purchase');
      }
    } catch (e) {
      console.error(e);
      alert('Failed to purchase');
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold mb-0">Challenges</h3>
        <div className="text-end small text-muted">
          Wallet: ₹{walletBalance.toFixed(2)} · Referral: ₹{referralBalance.toFixed(2)}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
        </div>
      ) : configs.length === 0 ? (
        <div className="alert alert-info">No challenges available.</div>
      ) : (
        <div className="row g-3">
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white border-0">
                <h6 className="mb-0">Select Challenge</h6>
              </div>
              <div className="list-group list-group-flush">
                {configs.map(cfg => (
                  <button
                    key={cfg._id}
                    className={`list-group-item list-group-item-action ${selected?._id === cfg._id ? 'active' : ''}`}
                    onClick={() => {
                      setSelected(cfg);
                      const firstSize = [...(cfg.pricesByAccountSize ? Object.keys(cfg.pricesByAccountSize) : ['10000'])][0];
                      setAccountSize(firstSize);
                      setProfitTarget(cfg.profitTargets?.[0] || 8);
                      setPlatform(cfg.platforms?.[0] || 'MetaTrader 5');
                    }}
                  >
                    <div className="d-flex justify-content-between">
                      <div>
                        <div className="fw-semibold">{cfg.name}</div>
                        <small className="opacity-75">{cfg.type} · {cfg.model}</small>
                      </div>
                      <i className="bi bi-trophy"></i>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            {selected && (
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0">
                  <h5 className="mb-0">{selected.name}</h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Profit Target</label>
                      <div className="d-flex gap-2">
                        {selected.profitTargets?.map(pt => (
                          <button key={pt} className={`btn btn-sm ${Number(profitTarget)===Number(pt)?'btn-primary':'btn-outline-primary'}`} onClick={() => setProfitTarget(pt)}>{pt}%</button>
                        ))}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Account Size</label>
                      <select className="form-select" value={accountSize} onChange={e=>setAccountSize(e.target.value)}>
                        {Object.keys(selected.pricesByAccountSize || {}).map(sz => (
                          <option key={sz} value={sz}>${sz.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Trading Platform</label>
                      <select className="form-select" value={platform} onChange={e=>setPlatform(e.target.value)}>
                        {selected.platforms?.map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Coupon Code</label>
                      <input className="form-control" value={couponCode} onChange={e=>setCouponCode(e.target.value)} placeholder="Enter coupon code" />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label">Pay From</label>
                      <div className="d-flex gap-3">
                        <div className="form-check">
                          <input className="form-check-input" type="radio" id="payWallet" checked={payFrom==='wallet'} onChange={()=>setPayFrom('wallet')} />
                          <label className="form-check-label" htmlFor="payWallet">Wallet (₹{walletBalance.toFixed(2)})</label>
                        </div>
                        <div className="form-check">
                          <input className="form-check-input" type="radio" id="payReferral" checked={payFrom==='referral'} onChange={()=>setPayFrom('referral')} />
                          <label className="form-check-label" htmlFor="payReferral">Referral (₹{referralBalance.toFixed(2)})</label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-semibold">Total</div>
                      <div className="fs-4">₹{price.toFixed(2)}</div>
                    </div>
                    <button className="btn btn-primary" onClick={purchase} disabled={!canAfford || purchasing}>
                      {purchasing ? 'Processing...' : 'Buy Challenge'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


