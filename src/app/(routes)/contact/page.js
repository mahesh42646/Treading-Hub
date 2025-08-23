'use client';

import React, { useState } from 'react';
import Header from '../../user/components/Header';
import Footer from '../../user/components/Footer';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Simulate form submission
    setTimeout(() => {
      setMessage('Thank you for your message! We will get back to you soon.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-vh-100 d-flex flex-column">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-primary text-white py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto text-center">
              <h1 className="display-4 fw-bold mb-4">Contact Us</h1>
              <p className="lead">
                Have questions? We're here to help. Get in touch with our team.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm">
                <div className="card-body p-5">
                  <h3 className="mb-4">Send us a message</h3>
                  
                  {message && (
                    <div className="alert alert-success" role="alert">
                      {message}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label htmlFor="name" className="form-label">Full Name</label>
                        <input
                          type="text"
                          className="form-control"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label htmlFor="email" className="form-label">Email Address</label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="subject" className="form-label">Subject</label>
                      <input
                        type="text"
                        className="form-control"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        placeholder="Enter subject"
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="message" className="form-label">Message</label>
                      <textarea
                        className="form-control"
                        id="message"
                        name="message"
                        rows="5"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        placeholder="Enter your message"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary px-4"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Sending...
                        </>
                      ) : (
                        'Send Message'
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body p-4">
                  <h4 className="mb-4">Get in Touch</h4>
                  
                  <div className="mb-4">
                    <h6 className="fw-bold mb-2">
                      <i className="bi bi-geo-alt text-primary me-2"></i>
                      Address
                    </h6>
                    <p className="text-muted mb-0">
                      123 Trading Street<br />
                      Financial District<br />
                      New York, NY 10001<br />
                      United States
                    </p>
                  </div>

                  <div className="mb-4">
                    <h6 className="fw-bold mb-2">
                      <i className="bi bi-envelope text-primary me-2"></i>
                      Email
                    </h6>
                    <p className="text-muted mb-0">
                      <a href="mailto:support@treadinghub.com" className="text-decoration-none">
                        support@treadinghub.com
                      </a>
                    </p>
                  </div>

                  <div className="mb-4">
                    <h6 className="fw-bold mb-2">
                      <i className="bi bi-telephone text-primary me-2"></i>
                      Phone
                    </h6>
                    <p className="text-muted mb-0">
                      <a href="tel:+1-555-123-4567" className="text-decoration-none">
                        +1 (555) 123-4567
                      </a>
                    </p>
                  </div>

                  <div className="mb-4">
                    <h6 className="fw-bold mb-2">
                      <i className="bi bi-clock text-primary me-2"></i>
                      Business Hours
                    </h6>
                    <p className="text-muted mb-0">
                      Monday - Friday: 9:00 AM - 6:00 PM EST<br />
                      Saturday: 10:00 AM - 4:00 PM EST<br />
                      Sunday: Closed
                    </p>
                  </div>

                  <div>
                    <h6 className="fw-bold mb-2">Follow Us</h6>
                    <div className="d-flex gap-2">
                      <a href="#" className="btn btn-outline-primary btn-sm">
                        <i className="bi bi-facebook"></i>
                      </a>
                      <a href="#" className="btn btn-outline-primary btn-sm">
                        <i className="bi bi-twitter"></i>
                      </a>
                      <a href="#" className="btn btn-outline-primary btn-sm">
                        <i className="bi bi-linkedin"></i>
                      </a>
                      <a href="#" className="btn btn-outline-primary btn-sm">
                        <i className="bi bi-instagram"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold">Frequently Asked Questions</h2>
            <p className="lead text-muted">Find answers to common questions</p>
          </div>
          
          <div className="row">
            <div className="col-lg-8 mx-auto">
              <div className="accordion" id="faqAccordion">
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                      How does the funding process work?
                    </button>
                  </h2>
                  <div id="faq1" className="accordion-collapse collapse show" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      Our funding process involves a two-phase evaluation where you demonstrate your trading skills. 
                      Once you pass both phases, you'll receive a funded account with real capital to trade with.
                    </div>
                  </div>
                </div>
                
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                      What are the profit sharing terms?
                    </button>
                  </h2>
                  <div id="faq2" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      Profit sharing ranges from 80% to 90% depending on your plan. 
                      You keep the majority of your profits while we take a small percentage for providing the capital.
                    </div>
                  </div>
                </div>
                
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                      Is there a minimum deposit required?
                    </button>
                  </h2>
                  <div id="faq3" className="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div className="accordion-body">
                      No minimum deposit is required for the evaluation phase. 
                      You only pay a one-time fee when you're ready to start trading with real capital.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
} 