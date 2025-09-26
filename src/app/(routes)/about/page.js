'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaUsers, FaLightbulb, FaHandshake, FaGraduationCap, FaTrophy, FaGlobe, FaDiscord, FaFacebook } from 'react-icons/fa';
import Header from '../../user/components/Header';
import Footer from '../../user/components/Footer';

const AboutPage = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/team`);
      if (response.ok) {
        const data = await response.json();
        setTeam(data.team || []);
      } else {
        setError('Failed to load team');
      }
    } catch (error) {
      console.error('Error fetching team:', error);
      setError('Failed to load team');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content">
      <Header />
      
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container pt-lg-4">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8 ">
              <h1 className=" display-5 display-md-3 display-sm-5 fw-bold mb-4">
                Meet the Team Behind <span className="text-info"> <br/>Xfunding Flow</span>
              </h1>
              <p className="lead mb-5">
                We are a passionate team dedicated to empowering traders with the tools, 
                knowledge, and support they need to succeed in the financial markets. 
                Our mission is to make professional trading accessible to everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Members Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">Meet Our <span className="text-info">Team</span></h2>
            <p className="lead text-muted">The passionate individuals behind Xfunding Flow&apos;s success</p>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : team.length > 0 ? (
            <div className="row g-4">
              {team.map((member) => (
                <div key={member._id} className="col-md-6 col-lg-4">
                  <div className="card h-100 border-0 shadow-sm">
                    <div className="card-body text-center p-4">
                      <div className="mb-3">
                        {member.image ? (
                          <Image 
                            src={`${process.env.NEXT_PUBLIC_API_URL}${member.image}`} 
                            alt={member.name}
                            width={120}
                            height={120}
                            className="rounded-circle"
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <div 
                            className="rounded-circle mx-auto d-flex align-items-center justify-content-center"
                            style={{
                              width: '120px',
                              height: '120px',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              fontSize: '2rem',
                              fontWeight: 'bold'
                            }}
                          >
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        )}
                      </div>
                      <h5 className="card-title fw-bold mb-2">{member.name}</h5>
                      <p className="text-info mb-3">{member.position}</p>
                      <p className="card-text text-muted mb-3">{member.bio}</p>
                      <div className="d-flex justify-content-center gap-2">
                        {member.socialLinks?.linkedin && (
                          <a href={member.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">
                            <i className="bi bi-linkedin"></i>
                          </a>
                        )}
                        {member.socialLinks?.twitter && (
                          <a href={member.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="btn btn-outline-info btn-sm">
                            <i className="bi bi-twitter"></i>
                          </a>
                        )}
                        {member.socialLinks?.github && (
                          <a href={member.socialLinks.github} target="_blank" rel="noopener noreferrer" className="btn btn-outline-dark btn-sm">
                            <i className="bi bi-github"></i>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <h3 className="text-muted">No team members available at the moment</h3>
              <p className="text-muted">Please check back later.</p>
            </div>
          )}
        </div>
      </section>

      {/* Mission and Vision Section */}
      <section className="py-5">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-6">
              <div className="value-card">
                <div className="mb-4">
                  <i className="bi bi-chat-quote text-purple" style={{ fontSize: '3rem' }}></i>
                </div>
                <h3 className="fw-bold mb-3">Our Mission</h3>
                <p className="text-muted">
                  To democratize access to professional trading opportunities by providing 
                  innovative funding solutions, comprehensive education, and unwavering 
                  support to traders worldwide.
                </p>
                <div className="mt-4" style={{
                  height: '4px',
                  background: 'linear-gradient(90deg, var(--primary-purple), var(--secondary-purple))',
                  borderRadius: '2px'
                }}></div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="value-card">
                <div className="mb-4">
                  <i className="bi bi-eye text-purple" style={{ fontSize: '3rem' }}></i>
                </div>
                <h3 className="fw-bold mb-3">Our Vision</h3>
                <p className="text-muted">
                  To become the world&apos;s leading platform for funded trading, 
                  fostering a global community of successful traders who achieve 
                  financial freedom through disciplined trading practices.
                </p>
                <div className="mt-4" style={{
                  height: '4px',
                  background: 'linear-gradient(90deg, var(--primary-purple), var(--secondary-purple))',
                  borderRadius: '2px'
                }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Purpose Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h2 className="display-5 fw-bold mb-4">
                Why We Wake Up and Come to <span className="text-info">Work Everyday</span>
              </h2>
              <p className="lead text-muted">
                Every day, we are driven by the stories of traders who have transformed 
                their lives through our platform. We believe that financial freedom 
                should be accessible to anyone with the dedication and discipline to 
                master the markets.
              </p>
              <p className="text-muted">
                Our team is committed to providing the best possible experience, 
                from cutting-edge technology to personalized support, ensuring 
                every trader has the tools they need to succeed.
              </p>
            </div>
            <div className="col-lg-6 text-center">
              <div className="brand-image" style={{
                width: '300px',
                height: '300px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '2rem',
                fontWeight: 'bold',
                margin: '0 auto'
              }}>
                Xfunding Flow
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <h2 className="display-5 fw-bold mb-4">
                Guiding Principles that <span className="text-info">Define Us</span>
              </h2>
              <div className="mb-4">
                <ul className="list-unstyled">
                  <li className="mb-3 d-flex align-items-center">
                    <i className="bi bi-check-circle-fill text-success me-3" style={{ fontSize: '1.5rem' }}></i>
                    <span className="fw-bold">Act with Integrity</span>
                  </li>
                  <li className="mb-3 d-flex align-items-center">
                    <i className="bi bi-check-circle-fill text-success me-3" style={{ fontSize: '1.5rem' }}></i>
                    <span className="fw-bold">Take Full Ownership</span>
                  </li>
                  <li className="mb-3 d-flex align-items-center">
                    <i className="bi bi-check-circle-fill text-success me-3" style={{ fontSize: '1.5rem' }}></i>
                    <span className="fw-bold">Always Learn & Grow</span>
                  </li>
                  <li className="mb-3 d-flex align-items-center">
                    <i className="bi bi-check-circle-fill text-success me-3" style={{ fontSize: '1.5rem' }}></i>
                    <span className="fw-bold">Champion Empathy</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="value-visual" style={{
                width: '100%',
                height: '300px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>
                TAKE OWNERSHIP
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Office Tour Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center display-5 fw-bold mb-5">
            <span className="text-info">Xfunding Flow</span> Office Tour
          </h2>
          <div className="row g-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="col-md-6 col-lg-3">
                <div className="office-photo" style={{
                  width: '100%',
                  height: '200px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  transform: 'rotate(-2deg)',
                  transition: 'transform 0.3s ease'
                }}>
                  Office {i}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Meetups Section */}
      <section className="py-5">
        <div className="container">
          <h2 className="text-center display-5 fw-bold mb-5">
            <span className="text-info">Xfunding Flow</span> Global Meet-Up and Conferences
          </h2>
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="conference-photo" style={{
                width: '100%',
                height: '300px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>
                Global Conference
              </div>
            </div>
            <div className="col-lg-4">
              <div className="row g-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="col-6">
                    <div className="event-photo" style={{
                      width: '100%',
                      height: '140px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.9rem',
                      fontWeight: 'bold'
                    }}>
                      Event {i}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partnerships Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h2 className="display-5 fw-bold mb-4">
                Strategic Partnership with <span className="text-info">MetaQuotes, Google and Meta</span>
              </h2>
              <p className="lead text-muted">
                We are proud to partner with industry leaders to provide our traders 
                with the best possible trading experience. Our partnerships ensure 
                access to cutting-edge technology and reliable platforms.
              </p>
            </div>
            <div className="col-lg-6 text-center">
              <div className="partnership-logos d-flex justify-content-center gap-4 flex-wrap">
                {['Google', 'Meta', 'MetaQuotes'].map((partner) => (
                  <div key={partner} className="partner-logo" style={{
                    width: '120px',
                    height: '80px',
                    background: 'white',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#333',
                    fontWeight: 'bold',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
                  }}>
                    {partner}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="text-center mb-5">
                <i className="bi bi-quote text-purple" style={{ fontSize: '4rem' }}></i>
              </div>
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="testimonial-card text-center p-4">
                                         <h4 className="fw-bold mb-3">&quot;We Empower Traders with Financial Freedom&quot;</h4>
                    <p className="text-muted mb-4">
                      Our platform is designed to give traders the tools and support 
                      they need to achieve their financial goals.
                    </p>
                    <div className="testimonial-author">
                      <div className="author-photo mx-auto mb-3" style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold'
                      }}>
                        SA
                      </div>
                      <h5 className="fw-bold">Syed Abdullah</h5>
                      <p className="text-muted">CEO & Founder</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="testimonial-card text-center p-4">
                                         <h4 className="fw-bold mb-3">&quot;We Support Traders to Conquer the Markets&quot;</h4>
                    <p className="text-muted mb-4">
                      Our comprehensive support system ensures every trader has 
                      the guidance they need to succeed.
                    </p>
                    <div className="testimonial-author">
                      <div className="author-photo mx-auto mb-3" style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold'
                      }}>
                        MA
                      </div>
                      <h5 className="fw-bold">Mahesh Kumar</h5>
                      <p className="text-muted">CTO & Co-Founder</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center display-5 fw-bold mb-5">
            Awards and <span className="text-info">Accreditations</span>
          </h2>
          <div className="row g-4 justify-content-center">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="col-md-4 col-lg-2">
                <div className="award-photo" style={{
                  width: '100%',
                  height: '150px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold'
                }}>
                  Award {i}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-5" style={{
        background: 'linear-gradient(135deg, var(--primary-purple) 0%, var(--secondary-purple) 100%)',
        color: 'white'
      }}>
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h2 className="display-5 fw-bold mb-4">
                Join the Global Community for the Traders, by the Traders
              </h2>
              <p className="lead mb-5">
                Connect with thousands of traders worldwide, share strategies, 
                and grow together in our vibrant community.
              </p>
              <div className="d-flex justify-content-center gap-4 flex-wrap">
                <button className="btn btn-light btn-lg px-4 py-3 fw-bold">
                  <FaDiscord className="me-2" />
                  Join Discord Community
                </button>
                <button className="btn btn-light btn-lg px-4 py-3 fw-bold">
                  <FaFacebook className="me-2" />
                  Join Facebook Community
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage; 