'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../user/auth/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Image from 'next/image';

const ProfileSetup = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    country: '',
    city: '',
    phone: '',
    panCardImage: null,
    panCardNumber: ''
  });

  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (user.emailVerified) {
          setUser(user);
          // Check if profile already exists
          try {
            const response = await fetch(`http://localhost:9988/api/users/profile/${user.uid}`);
            const data = await response.json();
            if (data.success && data.profile) {
              router.push('/dashboard');
              return;
            }
          } catch (error) {
            console.error('Error checking profile:', error);
          }
        } else {
          router.push('/login');
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

  const extractPanNumber = async (imageFile) => {
    // This is a placeholder for OCR functionality
    // In a real implementation, you would use a service like Google Vision API or Tesseract.js
    // For now, we'll return a mock function
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock PAN number extraction
        const mockPanNumber = 'ABCDE1234F';
        resolve(mockPanNumber);
      }, 1000);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.gender || 
          !formData.dateOfBirth || !formData.country || !formData.city || 
          !formData.phone || !formData.panCardImage) {
        setError('Please fill in all required fields');
        setSubmitting(false);
        return;
      }

      // Extract PAN number from image
      const extractedPanNumber = await extractPanNumber(formData.panCardImage);
      
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('uid', user.uid);
      submitData.append('firstName', formData.firstName);
      submitData.append('lastName', formData.lastName);
      submitData.append('gender', formData.gender);
      submitData.append('dateOfBirth', formData.dateOfBirth);
      submitData.append('country', formData.country);
      submitData.append('city', formData.city);
      submitData.append('phone', formData.phone);
      submitData.append('panCardImage', formData.panCardImage);
      submitData.append('panCardNumber', extractedPanNumber);

      const response = await fetch('http://localhost:9988/api/users/profile-setup', {
        method: 'POST',
        body: submitData
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Profile created successfully! Redirecting to dashboard...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setError(data.message || 'Failed to create profile');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error('Profile setup error:', error);
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
    <div className="container-fluid min-vh-100 py-5" style={{
      background: 'linear-gradient(135deg, #002260 0%, #110A28 100%)',
      color: 'white'
    }}>
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
                <p className="text-white-50">Complete your profile setup</p>
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
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="firstName" className="form-label text-white">First Name *</label>
                    <input
                      type="text"
                      className="form-control rounded-4"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      placeholder="Enter your first name"
                      style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        backdropFilter: 'blur(20px)',
                        color: 'white'
                      }}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="lastName" className="form-label text-white">Last Name *</label>
                    <input
                      type="text"
                      className="form-control rounded-4"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      placeholder="Enter your last name"
                      style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        backdropFilter: 'blur(20px)',
                        color: 'white'
                      }}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="gender" className="form-label text-white">Gender *</label>
                    <select
                      className="form-select rounded-4"
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                      style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        backdropFilter: 'blur(20px)',
                        color: 'white'
                      }}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="dateOfBirth" className="form-label text-white">Date of Birth *</label>
                    <input
                      type="date"
                      className="form-control rounded-4"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      required
                      style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        backdropFilter: 'blur(20px)',
                        color: 'white'
                      }}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="country" className="form-label text-white">Country (as per Government ID) *</label>
                    <input
                      type="text"
                      className="form-control rounded-4"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                      placeholder="Enter your country"
                      style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        backdropFilter: 'blur(20px)',
                        color: 'white'
                      }}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="city" className="form-label text-white">City *</label>
                    <input
                      type="text"
                      className="form-control rounded-4"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      placeholder="Enter your city"
                      style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        backdropFilter: 'blur(20px)',
                        color: 'white'
                      }}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="phone" className="form-label text-white">Phone Number *</label>
                  <input
                    type="tel"
                    className="form-control rounded-4"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="Enter your phone number"
                    style={{
                      background: 'rgba(60, 58, 58, 0.03)',
                      border: '1px solid rgba(124, 124, 124, 0.39)',
                      backdropFilter: 'blur(20px)',
                      color: 'white'
                    }}
                  />
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
                    Upload a clear image of your PAN card (Max 5MB). 
                    <br />
                    <strong>Profile completion: 75% without PAN card, 100% with PAN card</strong>
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
                      <img 
                        src={previewImage} 
                        alt="PAN Card Preview" 
                        className="img-fluid rounded"
                        style={{ maxHeight: '200px' }}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="btn w-100 rounded-4"
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
                      Creating Profile...
                    </>
                  ) : (
                    'Complete Profile Setup'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;
