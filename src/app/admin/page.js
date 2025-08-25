'use client';

import React, { useState, useEffect } from 'react';
import { FaUsers, FaUserCheck, FaClock, FaDollarSign, FaChartLine, FaPlus, FaEye, FaEdit, FaEnvelope } from 'react-icons/fa';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalProfiles: 0,
    pendingKyc: 0,
    totalRevenue: 0,
    recentUsers: [],
    recentTransactions: [],
    recentContacts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/dashboard`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
        <h1 className="h3 mb-0">Dashboard</h1>
        <div className="d-flex gap-2">
          <button className="btn btn-primary btn-sm">
            <FaPlus className="me-1" />
            Add User
          </button>
          <button className="btn btn-outline-primary btn-sm">
            <FaEye className="me-1" />
            View Reports
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                    <FaUsers className="text-primary" size={24} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title text-muted mb-1">Total Users</h6>
                  <h4 className="mb-0 fw-bold">{dashboardData.totalUsers}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-success bg-opacity-10 rounded-circle p-3">
                    <FaUserCheck className="text-success" size={24} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title text-muted mb-1">Profiles</h6>
                  <h4 className="mb-0 fw-bold">{dashboardData.totalProfiles}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                    <FaClock className="text-warning" size={24} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title text-muted mb-1">Pending KYC</h6>
                  <h4 className="mb-0 fw-bold">{dashboardData.pendingKyc}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6 mb-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-info bg-opacity-10 rounded-circle p-3">
                    <FaDollarSign className="text-info" size={24} />
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="card-title text-muted mb-1">Revenue</h6>
                  <h4 className="mb-0 fw-bold">${dashboardData.totalRevenue}</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="row">
        <div className="col-lg-4 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-0">
              <h5 className="card-title mb-0">Recent Users</h5>
            </div>
            <div className="card-body">
              {dashboardData.recentUsers?.length > 0 ? (
                <div className="list-group list-group-flush">
                  {dashboardData.recentUsers.map((user, index) => (
                    <div key={index} className="list-group-item border-0 px-0">
                      <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                          <FaUsers className="text-primary" size={16} />
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{user.email}</h6>
                          <small className="text-muted">{user.createdAt}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center mb-0">No recent users</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-0">
              <h5 className="card-title mb-0">Recent Transactions</h5>
            </div>
            <div className="card-body">
              {dashboardData.recentTransactions?.length > 0 ? (
                <div className="list-group list-group-flush">
                  {dashboardData.recentTransactions.map((transaction, index) => (
                    <div key={index} className="list-group-item border-0 px-0">
                      <div className="d-flex align-items-center">
                        <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                          <FaChartLine className="text-success" size={16} />
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1">${transaction.amount}</h6>
                          <small className="text-muted">{transaction.type} - {transaction.date}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center mb-0">No recent transactions</p>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-transparent border-0">
              <h5 className="card-title mb-0">Recent Contacts</h5>
            </div>
            <div className="card-body">
              {dashboardData.recentContacts?.length > 0 ? (
                <div className="list-group list-group-flush">
                  {dashboardData.recentContacts.map((contact, index) => (
                    <div key={index} className="list-group-item border-0 px-0">
                      <div className="d-flex align-items-center">
                        <div className="bg-info bg-opacity-10 rounded-circle p-2 me-3">
                          <FaEnvelope className="text-info" size={16} />
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{contact.name}</h6>
                          <small className="text-muted">{contact.subject} - {contact.date}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted text-center mb-0">No recent contacts</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
