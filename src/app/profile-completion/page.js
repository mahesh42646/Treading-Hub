'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { auth } from '../user/auth/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Header from '../user/components/Header';
import Footer from '../user/components/Footer';
import { userApi } from '../../services/api';

const ProfileCompletion = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    panCardNumber: '',
    panCardImage: null
  });

  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        // Fetch user profile
        try {
          const data = await userApi.getProfile(user.uid);
          if (data.success && data.profile) {
            setProfile(data.profile);
            if (data.profile.profileCompletion?.percentage === 100) {
              router.push('/dashboard');
              return;
            }
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
        router.push('/login');
        return;
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        panCardImage: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Validate that at least one field is provided
      if (!formData.panCardNumber && !formData.panCardImage) {
        setError('Please provide either PAN card number or upload PAN card image');
        setSubmitting(false);
        return;
      }

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('uid', user.uid);
      if (formData.panCardNumber) {
        submitData.append('panCardNumber', formData.panCardNumber);
      }
      if (formData.panCardImage) {
        submitData.append('panCardImage', formData.panCardImage);
      }

      const data = await userApi.profileCompletion(user.uid, submitData);

      if (data.success) {
        setSuccess('Profile completed successfully! Redirecting to dashboard...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setError(data.message || 'Failed to complete profile');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error('Profile completion error:', error);
    } finally {
      setSubmitting(false);
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
          <p className="mt-3 text-white-50">Loading...</p>
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
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card border-0 rounded-4" style={{
              background: 'rgba(60, 58, 58, 0.03)',
              border: '1px solid rgba(124, 124, 124, 0.39)',
              backdropFilter: 'blur(20px)',
              boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
            }}>
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2 className="fw-bold text-white">
                    <span style={{ color: 'red', textDecoration: 'underline green' }}>Trading </span>
                    <span style={{ color: 'green', textDecoration: 'underline red' }}>Hub</span>
                  </h2>
                  <p className="text-white-50">Complete your profile to 100%</p>
                  
                  {/* Profile Completion Status */}
                  <div className="mb-4">
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="text-white-50">Current Completion:</span>
                      <span className="text-white fw-bold">{profile?.profileCompletion?.percentage || 0}%</span>
                    </div>
                    <div className="progress" style={{ height: '10px' }}>
                      <div 
                        className="progress-bar" 
                        style={{ 
                          width: `${profile?.profileCompletion?.percentage || 0}%`,
                          background: profile?.profileCompletion?.percentage >= 70 ? '#28a745' : '#ffc107'
                        }}
                      ></div>
                    </div>
                    <small className="text-white-50">
                      Upload PAN card to reach 100% completion
                    </small>
                  </div>
                </div>

                {error && (
                  <div className="alert alert-danger rounded-4" role="alert" style={{
                    background: 'rgba(220, 53, 69, 0.1)',
                    border: '1px solid rgba(220, 53, 69, 0.3)',
                    color: '#ff6b6b'
                  }}>
                    {error}
                  </div>
                )}

                {success && (
                  <div className="alert alert-success rounded-4" role="alert" style={{
                    background: 'rgba(25, 135, 84, 0.1)',
                    border: '1px solid rgba(25, 135, 84, 0.3)',
                    color: '#6bff6b'
                  }}>
                    {success}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="panCardNumber" className="form-label text-white">PAN Card Number (Optional)</label>
                    <input
                      type="text"
                      className="form-control rounded-4"
                      id="panCardNumber"
                      name="panCardNumber"
                      value={formData.panCardNumber}
                      onChange={handleChange}
                      placeholder="Enter PAN card number"
                      style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        backdropFilter: 'blur(20px)',
                        color: 'white'
                      }}
                    />
                    <small className="text-white-50">You can enter PAN number manually or upload image below</small>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="panCardImage" className="form-label text-white">PAN Card Image (Optional)</label>
                    <input
                      type="file"
                      className="form-control rounded-4"
                      id="panCardImage"
                      name="panCardImage"
                      onChange={handleImageChange}
                      accept="image/*"
                      style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        backdropFilter: 'blur(20px)',
                        color: 'white'
                      }}
                    />
                    <small className="text-white-50">
                      Upload a clear image of your PAN card (Max 5MB)
                    </small>
                  </div>

                  {previewImage && (
                    <div className="mb-3">
                      <label className="form-label text-white">Preview:</label>
                      <div className="border rounded-4 p-2" style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        backdropFilter: 'blur(20px)'
                      }}>
                        <Image 
                          src={previewImage} 
                          alt="PAN Card Preview" 
                          className="img-fluid rounded"
                          style={{ maxHeight: '200px' }}
                          width={400}
                          height={200}
                        />
                      </div>
                    </div>
                  )}

                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      className="btn rounded-4"
                      disabled={submitting}
                      style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)',
                        color: 'white'
                      }}
                    >
                      {submitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Completing Profile...
                        </>
                      ) : (
                        'Complete Profile'
                      )}
                    </button>
                    
                    <button
                      type="button"
                      className="btn rounded-4"
                      onClick={() => router.push('/dashboard')}
                      style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        backdropFilter: 'blur(20px)',
                        color: 'white'
                      }}
                    >
                      Back to Dashboard
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProfileCompletion;
