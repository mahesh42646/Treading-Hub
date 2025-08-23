'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../user/components/Header';
import Footer from '../../user/components/Footer';
import Sidebar from '../../user/components/Sidebar';

export default function Profile() {
  const [user, setUser] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    country: 'United States',
    city: 'New York',
    dateOfBirth: '1990-01-01',
    tradingExperience: 'Intermediate',
    preferredMarkets: ['Forex', 'Stocks'],
    bio: 'Passionate trader with 3 years of experience in forex and stock markets.'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Simulate API call
    setTimeout(() => {
      setMessage('Profile updated successfully!');
      setIsEditing(false);
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-vh-100 d-flex">
      <Sidebar />
      
      <div className="flex-grow-1">
        <Header />
        
        <div className="container-fluid py-4">
          <div className="row">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Profile Settings</h2>
                <button
                  className={`btn ${isEditing ? 'btn-secondary' : 'btn-primary'}`}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              {message && (
                <div className="alert alert-success" role="alert">
                  {message}
                </div>
              )}

              <div className="row">
                <div className="col-lg-8">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body p-4">
                      <h4 className="mb-4">Personal Information</h4>
                      
                      <form onSubmit={handleSubmit}>
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label htmlFor="firstName" className="form-label">First Name</label>
                            <input
                              type="text"
                              className="form-control"
                              id="firstName"
                              name="firstName"
                              value={user.firstName}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label htmlFor="lastName" className="form-label">Last Name</label>
                            <input
                              type="text"
                              className="form-control"
                              id="lastName"
                              name="lastName"
                              value={user.lastName}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                            />
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label htmlFor="email" className="form-label">Email Address</label>
                            <input
                              type="email"
                              className="form-control"
                              id="email"
                              name="email"
                              value={user.email}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label htmlFor="phone" className="form-label">Phone Number</label>
                            <input
                              type="tel"
                              className="form-control"
                              id="phone"
                              name="phone"
                              value={user.phone}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                            />
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label htmlFor="country" className="form-label">Country</label>
                            <select
                              className="form-select"
                              id="country"
                              name="country"
                              value={user.country}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                            >
                              <option value="United States">United States</option>
                              <option value="Canada">Canada</option>
                              <option value="United Kingdom">United Kingdom</option>
                              <option value="Australia">Australia</option>
                              <option value="Germany">Germany</option>
                            </select>
                          </div>
                          <div className="col-md-6 mb-3">
                            <label htmlFor="city" className="form-label">City</label>
                            <input
                              type="text"
                              className="form-control"
                              id="city"
                              name="city"
                              value={user.city}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                            />
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label htmlFor="dateOfBirth" className="form-label">Date of Birth</label>
                            <input
                              type="date"
                              className="form-control"
                              id="dateOfBirth"
                              name="dateOfBirth"
                              value={user.dateOfBirth}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                            />
                          </div>
                          <div className="col-md-6 mb-3">
                            <label htmlFor="tradingExperience" className="form-label">Trading Experience</label>
                            <select
                              className="form-select"
                              id="tradingExperience"
                              name="tradingExperience"
                              value={user.tradingExperience}
                              onChange={handleInputChange}
                              disabled={!isEditing}
                            >
                              <option value="Beginner">Beginner</option>
                              <option value="Intermediate">Intermediate</option>
                              <option value="Advanced">Advanced</option>
                              <option value="Professional">Professional</option>
                            </select>
                          </div>
                        </div>

                        <div className="mb-3">
                          <label htmlFor="bio" className="form-label">Bio</label>
                          <textarea
                            className="form-control"
                            id="bio"
                            name="bio"
                            rows="3"
                            value={user.bio}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="Tell us about your trading experience and goals..."
                          ></textarea>
                        </div>

                        {isEditing && (
                          <div className="d-flex gap-2">
                            <button
                              type="submit"
                              className="btn btn-primary"
                              disabled={loading}
                            >
                              {loading ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                  Saving...
                                </>
                              ) : (
                                'Save Changes'
                              )}
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() => setIsEditing(false)}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </form>
                    </div>
                  </div>
                </div>

                <div className="col-lg-4">
                  <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-4">
                      <h5 className="mb-3">Account Statistics</h5>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Member Since:</span>
                        <span className="fw-bold">January 2024</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Account Status:</span>
                        <span className="badge bg-success">Active</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Plan:</span>
                        <span className="fw-bold">Professional</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Total Trades:</span>
                        <span className="fw-bold">156</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Win Rate:</span>
                        <span className="fw-bold text-success">68%</span>
                      </div>
                    </div>
                  </div>

                  <div className="card border-0 shadow-sm">
                    <div className="card-body p-4">
                      <h5 className="mb-3">Quick Actions</h5>
                      <div className="d-grid gap-2">
                        <button className="btn btn-outline-primary">
                          <i className="bi bi-shield-lock me-2"></i>
                          Change Password
                        </button>
                        <button className="btn btn-outline-primary">
                          <i className="bi bi-bell me-2"></i>
                          Notification Settings
                        </button>
                        <button className="btn btn-outline-primary">
                          <i className="bi bi-gear me-2"></i>
                          Privacy Settings
                        </button>
                        <button className="btn btn-outline-danger">
                          <i className="bi bi-trash me-2"></i>
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 