'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaSearch, 
  FaEye, 
  FaCheck, 
  FaTimes, 
  FaUserCheck,
  FaUserTimes,
  FaSpinner
} from 'react-icons/fa';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [kycActionLoading, setKycActionLoading] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        search: searchTerm
      });

      const response = await fetch(`http://localhost:9988/api/admin/users?${params}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setTotalPages(data.pagination?.total || 1);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleKycAction = async (uid, action) => {
    setKycActionLoading(uid);
    try {
      const response = await fetch(`http://localhost:9988/api/admin/kyc-${action}/${uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(action === 'reject' ? { reason: 'Admin rejection' } : {})
      });

      if (response.ok) {
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      console.error(`Error ${action}ing KYC:`, error);
    } finally {
      setKycActionLoading(null);
    }
  };

  const viewUserDetails = async (uid) => {
    try {
      const response = await fetch(`http://localhost:9988/api/admin/users/${uid}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedUser(data.user);
        setShowUserModal(true);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const getKycStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge bg-warning">Pending</span>;
      case 'under_review':
        return <span className="badge bg-info">Under Review</span>;
      case 'approved':
        return <span className="badge bg-success">Approved</span>;
      case 'rejected':
        return <span className="badge bg-danger">Rejected</span>;
      case 'verified':
        return <span className="badge bg-success">Verified</span>;
      default:
        return <span className="badge bg-secondary">Unknown</span>;
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
          <h1 className="h3 mb-1">User Management</h1>
          <p className="text-muted mb-0">Manage users and their KYC status</p>
        </div>
        <div className="d-flex gap-2">
          <span className="badge bg-primary fs-6">
            Total: {users.length}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="input-group">
            <span className="input-group-text">
              <FaSearch />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search users by email or name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Profile Status</th>
                  <th>KYC Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-2" style={{ width: '32px', height: '32px' }}>
                          <span className="text-primary fw-bold">{user.email?.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <strong>{user.email}</strong>
                          <br />
                          <small className="text-muted">UID: {user.uid}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      {user.profile ? (
                        <span className="badge bg-success">Complete</span>
                      ) : (
                        <span className="badge bg-warning">Incomplete</span>
                      )}
                    </td>
                    <td>
                      {user.profile?.profileCompletion?.kycStatus ? (
                        getKycStatusBadge(user.profile.profileCompletion.kycStatus)
                      ) : (
                        <span className="badge bg-secondary">Not Started</span>
                      )}
                    </td>
                    <td>
                      <small className="text-muted">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </small>
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button 
                          className="btn btn-outline-primary"
                          onClick={() => viewUserDetails(user.uid)}
                        >
                          <FaEye />
                        </button>
                        {user.profile?.profileCompletion?.kycStatus === 'under_review' && (
                          <>
                            <button 
                              className="btn btn-outline-success"
                              onClick={() => handleKycAction(user.uid, 'approve')}
                              disabled={kycActionLoading === user.uid}
                            >
                              {kycActionLoading === user.uid ? (
                                <FaSpinner className="fa-spin" />
                              ) : (
                                <FaCheck />
                              )}
                            </button>
                            <button 
                              className="btn btn-outline-danger"
                              onClick={() => handleKycAction(user.uid, 'reject')}
                              disabled={kycActionLoading === user.uid}
                            >
                              {kycActionLoading === user.uid ? (
                                <FaSpinner className="fa-spin" />
                              ) : (
                                <FaTimes />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3">
              <small className="text-muted">
                Page {currentPage} of {totalPages}
              </small>
              <div className="btn-group">
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">User Details</h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowUserModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="fw-bold">Basic Information</h6>
                    <p><strong>Email:</strong> {selectedUser.email}</p>
                    <p><strong>UID:</strong> {selectedUser.uid}</p>
                    <p><strong>Email Verified:</strong> {selectedUser.emailVerified ? 'Yes' : 'No'}</p>
                    <p><strong>Joined:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</p>
                  </div>
                  
                  {selectedUser.profile && (
                    <div className="col-md-6">
                      <h6 className="fw-bold">Profile Information</h6>
                      <p><strong>Name:</strong> {selectedUser.profile.personalDetails?.fullName || 'N/A'}</p>
                      <p><strong>Phone:</strong> {selectedUser.profile.personalDetails?.phoneNumber || 'N/A'}</p>
                      <p><strong>Date of Birth:</strong> {selectedUser.profile.personalDetails?.dateOfBirth || 'N/A'}</p>
                      <p><strong>Address:</strong> {selectedUser.profile.personalDetails?.address || 'N/A'}</p>
                    </div>
                  )}
                </div>
                
                {selectedUser.profile && (
                  <div className="mt-3">
                    <h6 className="fw-bold">KYC Information</h6>
                    <div className="row">
                      <div className="col-md-6">
                        <p><strong>PAN Number:</strong> {selectedUser.profile.kycDetails?.panNumber || 'N/A'}</p>
                        <p><strong>Aadhar Number:</strong> {selectedUser.profile.kycDetails?.aadharNumber || 'N/A'}</p>
                        <p><strong>KYC Status:</strong> {getKycStatusBadge(selectedUser.profile.profileCompletion?.kycStatus)}</p>
                      </div>
                      <div className="col-md-6">
                        {selectedUser.profile.kycDetails?.rejectionReason && (
                          <p><strong>Rejection Reason:</strong> {selectedUser.profile.kycDetails.rejectionReason}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowUserModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
