'use client';

import React, { useState } from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import Header from '../user/components/Header';
import Footer from '../user/components/Footer';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content contact-page" style={{
      background: 'linear-gradient(135deg, #110A28 0%, #110A28 100%)',
      minHeight: '100vh',
      color: 'white'
    }}>
      <Header />
      
      <div className="container py-5">
        <div className="row py-5 mt-lg-4">
          {/* Left Column - Contact Information - Dark Glossy Theme */}
          <div className="col-lg-6 mb-0">
            <div className="rounded-4 p-4" style={{
              background: 'rgba(60, 58, 58, 0.03)',
              border: '3px solid rgba(67, 34, 124, 0.74)',
              backdropFilter: 'blur(20px)',
              boxShadow: '5px 4px 20px 1px rgba(70, 74, 103, 0.44)',
              color: 'white'
            }}>
              {/* Contact Us Section */}
              <div className="mb-5">
                <div className="d-flex align-items-center mb-3">
                  <div className="rounded-circle p-3 me-3" style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                    color: 'white'
                  }}>
                    <FaEnvelope size={24} />
                  </div>
                  <h3 className="mb-0 fw-bold text-white">Contact Us</h3>
                </div>
                <div className="ms-5">
                  <p className="mb-2 text-white-50"><strong className="text-white">Email:</strong> support@xfundingflow.com</p>
                  <p className="mb-0 text-white-50"><strong className="text-white">Phone:</strong> +91 98765 43210</p>
                </div>
              </div>

              {/* Complaint Process Section */}
              <div className="mb-5">
                <div className="d-flex align-items-center mb-3">
                  <div className="rounded-circle p-3 me-3" style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                    color: 'white'
                  }}>
                    <FaExclamationTriangle size={24} />
                  </div>
                  <h3 className="mb-0 fw-bold text-white">Complaint Process</h3>
                </div>
                <div className="ms-5">
                  <p className="mb-3 text-white-50">
                    We have a robust complaints and reports procedure to ensure ethical conduct, 
                    legal compliance, and prompt action. Our process ensures transparency and 
                    accountability for all reports.
                  </p>
                  <div>
                    <strong className="text-white">How to Report:</strong>
                    <p className="mb-2 text-white-50">
                      Send a detailed email to{' '}
                      <a href="mailto:support@xfundingflow.com" className="text-info">
                        support@xfundingflow.com
                      </a>{' '}
                      with as much information as possible, or contact us via Live Chat.
                    </p>
                  </div>
                </div>
              </div>

              {/* Business Hours Section */}
              <div>
                <div className="d-flex align-items-center mb-3">
                  <div className="rounded-circle p-3 me-3" style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                    color: 'white'
                  }}>
                    <FaClock size={24} />
                  </div>
                  <h3 className="mb-0 fw-bold text-white">Business Hours</h3>
                </div>
                <div className="ms-5">
                  <p className="mb-0 text-white-50">
                    We&apos;re just one click away. You may contact us 24/7 via Email or Live Chat.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form - Dark Glossy Theme */}
          <div className="col-lg-6">
            <div className="contact-form-card rounded-4 p-4" style={{
              background: 'rgba(60, 58, 58, 0.03)',
              border: '3px solid rgba(67, 34, 124, 0.74)',
              backdropFilter: 'blur(20px)',
              boxShadow: '5px 4px 20px 1px rgba(70, 74, 103, 0.44)',
              color: 'white'
            }}>
              <h2 className="fw-bold mb-3 text-white">Send Us a <span className="text-info">Message!</span></h2>
              <p className="text-white-50 mb-4">
                If you have any question and need our assistance, kindly submit the form. 
                One of our support agents will get back to you soon!
              </p>

              {success && (
                <div className="alert rounded-4" role="alert" style={{
                  background: 'rgba(60, 58, 58, 0.03)',
                  border: '1px solid rgba(34, 197, 94, 0.5)',
                  backdropFilter: 'blur(20px)',
                  color: 'white'
                }}>
                  <i className="bi bi-check-circle me-2 text-success"></i>
                  Thank you! Your message has been sent successfully. We&apos;ll get back to you soon.
                </div>
              )}

              {error && (
                <div className="alert rounded-4" role="alert" style={{
                  background: 'rgba(60, 58, 58, 0.03)',
                  border: '1px solid rgba(239, 68, 68, 0.5)',
                  backdropFilter: 'blur(20px)',
                  color: 'white'
                }}>
                  <i className="bi bi-exclamation-triangle me-2 text-danger"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control rounded-4"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={{
                      background: 'rgba(60, 58, 58, 0.03)',
                      border: '1px solid rgba(124, 124, 124, 0.39)',
                      backdropFilter: 'blur(20px)',
                      color: 'white',
                      padding: '0.75rem 1rem',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control rounded-4"
                    name="subject"
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    style={{
                      background: 'rgba(60, 58, 58, 0.03)',
                      border: '1px solid rgba(124, 124, 124, 0.39)',
                      backdropFilter: 'blur(20px)',
                      color: 'white',
                      padding: '0.75rem 1rem',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div className="mb-3">
                  <input
                    type="email"
                    className="form-control rounded-4"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{
                      background: 'rgba(60, 58, 58, 0.03)',
                      border: '1px solid rgba(124, 124, 124, 0.39)',
                      backdropFilter: 'blur(20px)',
                      color: 'white',
                      padding: '0.75rem 1rem',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div className="mb-4">
                  <textarea
                    className="form-control rounded-4"
                    name="message"
                    placeholder="Message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    style={{
                      background: 'rgba(60, 58, 58, 0.03)',
                      border: '1px solid rgba(124, 124, 124, 0.39)',
                      backdropFilter: 'blur(20px)',
                      color: 'white',
                      padding: '0.75rem 1rem',
                      fontSize: '1rem',
                      resize: 'none'
                    }}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn w-100 py-3 fw-bold rounded-4"
                  disabled={loading}
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                    border: 'none',
                    color: 'white'
                  }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Sending Message...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContactPage;
