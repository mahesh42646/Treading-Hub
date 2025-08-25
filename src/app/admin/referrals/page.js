'use client';

import React, { useState, useEffect } from 'react';
import { FaEye, FaShareAlt } from 'react-icons/fa';

const AdminReferrals = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferrals();
  }, []);

  const fetchReferrals = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/referrals`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setReferrals(data.referrals || []);
      }
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setLoading(false);
    }
  };

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
          <span className="badge bg-primary fs-6">
            Total: {referrals.length}
          </span>
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
                            <strong>{referral.referrerId?.email || 'Unknown'}</strong>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong>{referral.referredId?.email || 'Unknown'}</strong>
                      </td>
                      <td>
                        <code className="bg-light px-2 py-1 rounded">{referral.referralCode}</code>
                      </td>
                      <td>
                        <strong>${referral.commission || 0}</strong>
                        {referral.commissionPaid && (
                          <br />
                          <small className="text-success">Paid</small>
                        )}
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
