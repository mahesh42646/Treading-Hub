'use client';

import React, { useState, useEffect } from 'react';
import { FaEye, FaShareAlt } from 'react-icons/fa';

const AdminReferrals = () => {
  const [referrals, setReferrals] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const fetchReferrals = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/referrals/detailed?page=${currentPage}&limit=${pageSize}`,
        {
          credentials: 'include'
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setReferrals(data.referrals || []);
        setStats(data.stats || {});
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, [currentPage, pageSize]);

  const getStatusBadge = (status) => {
    return status === 'completed' ? 'badge bg-success' : 'badge bg-warning';
  };

  const getCompletionColor = (percentage) => {
    if (percentage >= 100) return 'text-success';
    if (percentage >= 70) return 'text-warning';
    return 'text-danger';
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
          <select 
            className="form-select form-select-sm"
            value={pageSize}
            onChange={(e) => setPageSize(parseInt(e.target.value))}
            style={{ width: 'auto' }}
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
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
                  <h4 className="mb-0 fw-bold">{stats.totalReferrals || 0}</h4>
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
                  <h4 className="mb-0 fw-bold">{stats.completedReferrals || 0}</h4>
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
                  <h4 className="mb-0 fw-bold">{stats.pendingReferrals || 0}</h4>
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
                  <h6 className="card-title text-muted mb-1">Total Bonus Paid</h6>
                  <h4 className="mb-0 fw-bold">₹{(stats.totalBonusPaid || 0).toLocaleString()}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body">
          {referrals.length > 0 ? (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Referrer</th>
                      <th>Referred User</th>
                      <th>Profile %</th>
                      <th>First Deposit</th>
                      <th>Plan</th>
                      <th>Status</th>
                      <th>Bonus</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.map((referral, index) => (
                      <tr key={`${referral.referrerId}-${referral.referredUserId}-${index}`}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
                              <FaShareAlt className="text-primary" size={12} />
                            </div>
                            <div>
                              <strong>{referral.referrerName}</strong>
                              <br/>
                              <small className="text-muted">{referral.referrerEmail}</small>
                              <br/>
                              <small className="badge bg-light text-dark">Code: {referral.referralCode}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <strong>{referral.referredUserName}</strong>
                            <br/>
                            <small className="text-muted">{referral.referredUserEmail}</small>
                            <br/>
                            <small className="text-muted">{referral.referredUserPhone}</small>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="progress flex-grow-1 me-2" style={{ height: '8px', width: '60px' }}>
                              <div 
                                className="progress-bar" 
                                style={{ width: `${referral.profileCompletion}%` }}
                              ></div>
                            </div>
                            <small className={getCompletionColor(referral.profileCompletion)}>
                              {referral.profileCompletion}%
                            </small>
                          </div>
                        </td>
                        <td>
                          {referral.hasFirstDeposit ? (
                            <>
                              <span className="badge bg-success">✓ True</span>
                              <br />
                              <small className="text-muted">₹{referral.walletBalance.toLocaleString()}</small>
                            </>
                          ) : (
                            <span className="badge bg-secondary">✗ False</span>
                          )}
                        </td>
                        <td>
                          {referral.hasActivePlan ? (
                            <div>
                              <span className="badge bg-success">✓ {referral.planName}</span>
                              <br />
                              <small className="text-muted">₹{referral.planPrice.toLocaleString()}</small>
                              {referral.planExpiryDate && (
                                <>
                                  <br />
                                  <small className="text-muted">
                                    Exp: {new Date(referral.planExpiryDate).toLocaleDateString()}
                                  </small>
                                </>
                              )}
                            </div>
                          ) : (
                            <span className="badge bg-secondary">No Plan</span>
                          )}
                        </td>
                        <td>
                          <span className={getStatusBadge(referral.status)}>
                            {referral.status === 'completed' ? 'Complete' : 'Pending'}
                          </span>
                          <br />
                          <small className="text-muted">KYC: {referral.kycStatus}</small>
                        </td>
                        <td>
                          <strong className="text-success">₹{(referral.bonusEarned || 0).toLocaleString()}</strong>
                          {referral.bonusCreditedAt && (
                            <>
                              <br />
                              <small className="text-muted">
                                {new Date(referral.bonusCreditedAt).toLocaleDateString()}
                              </small>
                            </>
                          )}
                        </td>
                        <td>
                          <small className="text-muted">
                            {new Date(referral.joinedAt).toLocaleDateString()}
                          </small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-3">
                  <nav>
                    <ul className="pagination">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </button>
                      </li>
                      {[...Array(Math.min(totalPages, 10))].map((_, i) => {
                        const pageNum = i + 1;
                        return (
                          <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                            <button 
                              className="page-link"
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </button>
                          </li>
                        );
                      })}
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button 
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
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