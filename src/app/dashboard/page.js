'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../user/auth/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Header from '../user/components/Header';
import Footer from '../user/components/Footer';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        // Fetch user profile
        try {
          const response = await fetch(`http://localhost:9988/api/users/profile/${user.uid}`);
          const data = await response.json();
          if (data.success && data.profile) {
            setProfile(data.profile);
          } else {
            router.push('/profile-setup');
            return;
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          router.push('/profile-setup');
          return;
        }
      } else {
        router.push('/');
        return;
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center" style={{
        background: 'linear-gradient(135deg, #002260 0%, #110A28 100%)',
        color: 'white'
      }}>
        <div className="text-center">
          <div className="spinner-border text-light" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-white-50">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #002260 0%, #110A28 100%)',
      minHeight: '100vh',
      color: 'white'
    }}>
      <Header />
      
      <div className="container py-5 mt-5">
        <div className="row">
          <div className="col-12">
            <h1 className="display-4 fw-bold text-white mb-4">Welcome to Your Dashboard</h1>
            <p className="lead text-white-50 mb-5">
              Hello {profile?.firstName} {profile?.lastName}, welcome to Trading Hub!
            </p>
          </div>
        </div>

        <div className="row g-4">
          {/* Profile Card */}
          <div className="col-lg-4">
            <div className="card border-0 rounded-4" style={{
              background: 'rgba(60, 58, 58, 0.03)',
              border: '1px solid rgba(124, 124, 124, 0.39)',
              backdropFilter: 'blur(20px)',
              boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
            }}>
              <div className="card-body p-4">
                <h5 className="card-title text-white mb-3">Profile Information</h5>
                <div className="mb-2">
                  <small className="text-white-50">Name:</small>
                  <p className="text-white mb-0">{profile?.firstName} {profile?.lastName}</p>
                </div>
                <div className="mb-2">
                  <small className="text-white-50">Email:</small>
                  <p className="text-white mb-0">{user?.email}</p>
                </div>
                <div className="mb-2">
                  <small className="text-white-50">Phone:</small>
                  <p className="text-white mb-0">{profile?.phone}</p>
                </div>
                <div className="mb-2">
                  <small className="text-white-50">Location:</small>
                  <p className="text-white mb-0">{profile?.city}, {profile?.country}</p>
                </div>
                <div className="mb-2">
                  <small className="text-white-50">Referral Code:</small>
                  <p className="text-white mb-0">{profile?.referralCode}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trading Stats */}
          <div className="col-lg-4">
            <div className="card border-0 rounded-4" style={{
              background: 'rgba(60, 58, 58, 0.03)',
              border: '1px solid rgba(124, 124, 124, 0.39)',
              backdropFilter: 'blur(20px)',
              boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
            }}>
              <div className="card-body p-4">
                <h5 className="card-title text-white mb-3">Trading Statistics</h5>
                <div className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span className="text-white-50">Account Balance:</span>
                    <span className="text-white fw-bold">$0.00</span>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span className="text-white-50">Total Trades:</span>
                    <span className="text-white fw-bold">0</span>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span className="text-white-50">Win Rate:</span>
                    <span className="text-white fw-bold">0%</span>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="d-flex justify-content-between">
                    <span className="text-white-50">Profit/Loss:</span>
                    <span className="text-white fw-bold">$0.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="col-lg-4">
            <div className="card border-0 rounded-4" style={{
              background: 'rgba(60, 58, 58, 0.03)',
              border: '1px solid rgba(124, 124, 124, 0.39)',
              backdropFilter: 'blur(20px)',
              boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
            }}>
              <div className="card-body p-4">
                <h5 className="card-title text-white mb-3">Quick Actions</h5>
                <div className="d-grid gap-2">
                  <button className="btn rounded-4" style={{
                    background: 'rgba(60, 58, 58, 0.03)',
                    border: '1px solid rgba(124, 124, 124, 0.39)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)',
                    color: 'white'
                  }}>
                    Start Trading
                  </button>
                  <button className="btn rounded-4" style={{
                    background: 'rgba(60, 58, 58, 0.03)',
                    border: '1px solid rgba(124, 124, 124, 0.39)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)',
                    color: 'white'
                  }}>
                    View History
                  </button>
                  <button className="btn rounded-4" style={{
                    background: 'rgba(60, 58, 58, 0.03)',
                    border: '1px solid rgba(124, 124, 124, 0.39)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)',
                    color: 'white'
                  }}>
                    Settings
                  </button>
                  <button 
                    className="btn rounded-4" 
                    onClick={handleLogout}
                    style={{
                      background: 'rgba(220, 53, 69, 0.1)',
                      border: '1px solid rgba(220, 53, 69, 0.3)',
                      backdropFilter: 'blur(20px)',
                      color: '#ff6b6b'
                    }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="row mt-5">
          <div className="col-12">
            <div className="card border-0 rounded-4" style={{
              background: 'rgba(60, 58, 58, 0.03)',
              border: '1px solid rgba(124, 124, 124, 0.39)',
              backdropFilter: 'blur(20px)',
              boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
            }}>
              <div className="card-body p-4">
                <h5 className="card-title text-white mb-3">Recent Activity</h5>
                <div className="text-center py-4">
                  <i className="bi bi-activity text-white-50" style={{ fontSize: '3rem' }}></i>
                  <p className="text-white-50 mt-3">No recent activity to display</p>
                  <p className="text-white-50">Start trading to see your activity here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
