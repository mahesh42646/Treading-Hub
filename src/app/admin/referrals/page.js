'use client';

import React, { useState, useEffect } from 'react';
import { FaEye, FaShareAlt } from 'react-icons/fa';

const AdminReferrals = () => {
  const [referrals, setReferrals] = useState([]);
  const [statistics, setStatistics] = useState({
    totalReferrals: 0,
    completedReferrals: 0,
    pendingReferrals: 0,
    totalCommissionPaid: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchReferrals = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/referrals`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setReferrals(data.referrals || []);
        setStatistics(data.statistics || {});
      }
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge bg-warning">Pending</span>;
      case 'completed':
        return <span className="badge bg-success">Completed</span>;
      case 'paid':
        return <span className="badge bg-info">Paid</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
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
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">Referral Management</h1>
          <p className="text-muted mb-0">Track referral activities and commissions</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary btn-sm">
            <FaEye className="me-1" />
            Export Report
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                    <FaShareAlt className="text-primary" size={20} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title text-muted mb-1">Total Referrals</h6>
                  <h4 className="mb-0 fw-bold">{statistics.totalReferrals}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-success bg-opacity-10 rounded-circle p-3">
                    <FaEye className="text-success" size={20} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title text-muted mb-1">Completed</h6>
                  <h4 className="mb-0 fw-bold">{statistics.completedReferrals}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                    <FaShareAlt className="text-warning" size={20} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title text-muted mb-1">Pending</h6>
                  <h4 className="mb-0 fw-bold">{statistics.pendingReferrals}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-info bg-opacity-10 rounded-circle p-3">
                    <FaShareAlt className="text-info" size={20} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title text-muted mb-1">Total Commission</h6>
                  <h4 className="mb-0 fw-bold">₹{statistics.totalCommissionPaid.toLocaleString()}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {referrals.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Referrer</th>
                    <th>Referred User</th>
                    <th>Referral Code</th>
                    <th>Deposits</th>
                    <th>Commission</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((referral) => (
                    <tr key={referral._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
                            <FaShareAlt className="text-primary" size={12} />
                          </div>
                          <div>
                            <strong>{referral.referrer.email}</strong>
                            <br/>
                            <small className="text-muted">{referral.referrer.name || 'No name'}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong>{referral.referred.email}</strong>
                          <br/>
                          <small className="text-muted">{referral.referred.name || 'No name'}</small>
                        </div>
                      </td>
                      <td>
                        <code className="bg-light px-2 py-1 rounded">{referral.referralCode}</code>
                      </td>
                      <td>
                        <strong>₹{referral.totalDeposits.toLocaleString()}</strong>
                        <br/>
                        <small className={`text-${referral.hasDeposited ? 'success' : 'muted'}`}>
                          {referral.hasDeposited ? 'Has deposited' : 'No deposits yet'}
                        </small>
                      </td>
                      <td>
                        <strong>₹{referral.commission.toLocaleString()}</strong>
                        <br/>
                        <small className={`text-${referral.commissionPaid ? 'success' : 'muted'}`}>
                          {referral.commissionPaid ? 'Paid' : 'Pending'}
                        </small>
                      </td>
                      <td>
                        {getStatusBadge(referral.status)}
                      </td>
                      <td>
                        <small className="text-muted">
                          {new Date(referral.createdAt).toLocaleDateString()}
                        </small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-5">
              <p className="text-muted">No referrals found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReferrals;
