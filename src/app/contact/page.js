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
    <div className="page-content">
      <Header />
      
      <div className="container py-5">
        <div className="row">
          {/* Left Column - Contact Information */}
          <div className="col-lg-6 mb-4">
            <div className="contact-info-card">
              {/* Contact Us Section */}
              <div className="mb-5">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-purple-light rounded-circle p-3 me-3">
                    <FaEnvelope className="text-purple" size={24} />
                  </div>
                  <h3 className="mb-0 fw-bold">Contact Us</h3>
                </div>
                <div className="ms-5">
                  <p className="mb-2"><strong>Email:</strong> support@tradinghub.com</p>
                  <p className="mb-0"><strong>Phone:</strong> +91 98765 43210</p>
                </div>
              </div>

              {/* Complaint Process Section */}
              <div className="mb-5">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-purple-light rounded-circle p-3 me-3">
                    <FaExclamationTriangle className="text-purple" size={24} />
                  </div>
                  <h3 className="mb-0 fw-bold">Complaint Process</h3>
                </div>
                <div className="ms-5">
                  <p className="mb-3">
                    We have a robust complaints and reports procedure to ensure ethical conduct, 
                    legal compliance, and prompt action. Our process ensures transparency and 
                    accountability for all reports.
                  </p>
                  <div>
                    <strong>How to Report:</strong>
                    <p className="mb-2">
                      Send a detailed email to{' '}
                      <a href="mailto:support@tradinghub.com" className="text-purple">
                        support@tradinghub.com
                      </a>{' '}
                      with as much information as possible, or contact us via Live Chat.
                    </p>
                  </div>
                </div>
              </div>

              {/* Business Hours Section */}
              <div>
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-purple-light rounded-circle p-3 me-3">
                    <FaClock className="text-purple" size={24} />
                  </div>
                  <h3 className="mb-0 fw-bold">Business Hours</h3>
                </div>
                <div className="ms-5">
                  <p className="mb-0">
                    We&apos;re just one click away. You may contact us 24/7 via Email or Live Chat.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="col-lg-6">
            <div className="contact-form-card">
              <h2 className="fw-bold mb-3">Send Us a Message!</h2>
              <p className="text-muted mb-4">
                If you have any question and need our assistance, kindly submit the form. 
                One of our support agents will get back to you soon!
              </p>

              {success && (
                <div className="alert alert-success" role="alert">
                  <i className="bi bi-check-circle me-2"></i>
                  Thank you! Your message has been sent successfully. We&apos;ll get back to you soon.
                </div>
              )}

              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control border-0 border-bottom rounded-0"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={{
                      borderBottom: '2px solid #e9ecef',
                      padding: '0.75rem 0',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control border-0 border-bottom rounded-0"
                    name="subject"
                    placeholder="Subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    style={{
                      borderBottom: '2px solid #e9ecef',
                      padding: '0.75rem 0',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div className="mb-3">
                  <input
                    type="email"
                    className="form-control border-0 border-bottom rounded-0"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{
                      borderBottom: '2px solid #e9ecef',
                      padding: '0.75rem 0',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div className="mb-4">
                  <textarea
                    className="form-control border-0 border-bottom rounded-0"
                    name="message"
                    placeholder="Message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    style={{
                      borderBottom: '2px solid #e9ecef',
                      padding: '0.75rem 0',
                      fontSize: '1rem',
                      resize: 'none'
                    }}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-purple w-100 py-3 fw-bold"
                  disabled={loading}
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
