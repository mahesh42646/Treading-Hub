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
      
      {/* Hero Section - Dark Glossy Theme */}
      <section className="about-hero" style={{
        background: 'linear-gradient(135deg, #110A28 0%, #110A28 100%)',
        color: 'white',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div className="container pt-lg-4">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8 ">
              <h1 className=" display-5 display-md-3 display-sm-5 fw-bold mb-4 text-white">
                Meet the Team Behind <span className="text-info"> <br/>Xfunding Flow</span>
              </h1>
              <p className="lead mb-5 text-white-50">
                We are a passionate team dedicated to empowering traders with the tools, 
                knowledge, and support they need to succeed in the financial markets. 
                Our mission is to make professional trading accessible to everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Members Section - Dark Glossy Theme */}
      <section className="py-5" style={{
        background: 'linear-gradient(135deg, #110A28 0%, #110A28 100%)',
        color: 'white'
      }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3 text-white">Meet Our <span className="text-info">Team</span></h2>
            <p className="lead text-white-50">The passionate individuals behind Xfunding Flow&apos;s success</p>
          </div>

          {error && (
            <div className="alert rounded-4" role="alert" style={{
              background: 'rgba(60, 58, 58, 0.03)',
              border: '1px solid rgba(124, 124, 124, 0.39)',
              backdropFilter: 'blur(20px)',
              boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)',
              color: 'white'
            }}>
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : team.length > 0 ? (
            <div className="row g-4">
              {team.map((member) => (
                <div key={member._id} className="col-md-6 col-lg-4">
                  <div className="card h-100 border-0 rounded-4" style={{
                    background: 'rgba(60, 58, 58, 0.03)',
                    border: '3px solid rgba(67, 34, 124, 0.74)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '5px 4px 20px 1px rgba(70, 74, 103, 0.44)',
                    color: 'white'
                  }}>
                    <div className="card-body text-center p-4">
                      <div className="mb-3">
                        {member.image ? (
                          <Image 
                            src={`${process.env.NEXT_PUBLIC_API_URL}/api${member.image}`} 
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
                              background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                              color: 'white',
                              fontSize: '2rem',
                              fontWeight: 'bold'
                            }}
                          >
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        )}
                      </div>
                      <h5 className="card-title fw-bold mb-2 text-white">{member.name}</h5>
                      <p className="text-info mb-3 fw-bold">{member.position}</p>
                      <p className="card-text text-white-50 mb-3">{member.bio}</p>
                      <div className="d-flex justify-content-center gap-2">
                        {member.socialLinks?.linkedin && (
                          <a href={member.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-sm rounded-4" style={{
                            background: 'rgba(60, 58, 58, 0.03)',
                            border: '1px solid rgba(124, 124, 124, 0.39)',
                            backdropFilter: 'blur(20px)',
                            color: 'white'
                          }}>
                            <i className="bi bi-linkedin"></i>
                          </a>
                        )}
                        {member.socialLinks?.twitter && (
                          <a href={member.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="btn btn-sm rounded-4" style={{
                            background: 'rgba(60, 58, 58, 0.03)',
                            border: '1px solid rgba(124, 124, 124, 0.39)',
                            backdropFilter: 'blur(20px)',
                            color: 'white'
                          }}>
                            <i className="bi bi-twitter"></i>
                          </a>
                        )}
                        {member.socialLinks?.github && (
                          <a href={member.socialLinks.github} target="_blank" rel="noopener noreferrer" className="btn btn-sm rounded-4" style={{
                            background: 'rgba(60, 58, 58, 0.03)',
                            border: '1px solid rgba(124, 124, 124, 0.39)',
                            backdropFilter: 'blur(20px)',
                            color: 'white'
                          }}>
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
              <h3 className="text-white-50">No team members available at the moment</h3>
              <p className="text-white-50">Please check back later.</p>
            </div>
          )}
        </div>
      </section>

      {/* Mission and Vision Section - Dark Glossy Theme */}
      <section className="py-5" style={{
        background: 'linear-gradient(135deg, #110A28 0%, #110A28 100%)',
        color: 'white'
      }}>
        <div className="container">
          <div className="row g-4">
            <div className="col-md-6">
              <div className="value-card rounded-4 p-4" style={{
                background: 'rgba(60, 58, 58, 0.03)',
                border: '3px solid rgba(67, 34, 124, 0.74)',
                backdropFilter: 'blur(20px)',
                boxShadow: '5px 4px 20px 1px rgba(70, 74, 103, 0.44)',
                color: 'white'
              }}>
                <div className="mb-4">
                  <i className="bi bi-chat-quote text-info" style={{ fontSize: '3rem' }}></i>
                </div>
                <h3 className="fw-bold mb-3 text-white">Our Mission</h3>
                <p className="text-white-50">
                  To democratize access to professional trading opportunities by providing 
                  innovative funding solutions, comprehensive education, and unwavering 
                  support to traders worldwide.
                </p>
                <div className="mt-4" style={{
                  height: '4px',
                  background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)',
                  borderRadius: '2px'
                }}></div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="value-card rounded-4 p-4" style={{
                background: 'rgba(60, 58, 58, 0.03)',
                border: '3px solid rgba(67, 34, 124, 0.74)',
                backdropFilter: 'blur(20px)',
                boxShadow: '5px 4px 20px 1px rgba(70, 74, 103, 0.44)',
                color: 'white'
              }}>
                <div className="mb-4">
                  <i className="bi bi-eye text-info" style={{ fontSize: '3rem' }}></i>
                </div>
                <h3 className="fw-bold mb-3 text-white">Our Vision</h3>
                <p className="text-white-50">
                  To become the world&apos;s leading platform for funded trading, 
                  fostering a global community of successful traders who achieve 
                  financial freedom through disciplined trading practices.
                </p>
                <div className="mt-4" style={{
                  height: '4px',
                  background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)',
                  borderRadius: '2px'
                }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Purpose Section - Dark Glossy Theme */}
      <section className="py-5" style={{
        background: 'linear-gradient(135deg, #110A28 0%, #110A28 100%)',
        color: 'white'
      }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h2 className="display-5 fw-bold mb-4 text-white">
                Why We Wake Up and Come to <span className="text-info">Work Everyday</span>
              </h2>
              <p className="lead text-white-50">
                Every day, we are driven by the stories of traders who have transformed 
                their lives through our platform. We believe that financial freedom 
                should be accessible to anyone with the dedication and discipline to 
                master the markets.
              </p>
              <p className="text-white-50">
                Our team is committed to providing the best possible experience, 
                from cutting-edge technology to personalized support, ensuring 
                every trader has the tools they need to succeed.
              </p>
            </div>
            <div className="col-lg-6 text-center">
              <div className="brand-image rounded-4" style={{
                width: '300px',
                height: '300px',
                background: 'rgba(60, 58, 58, 0.03)',
                border: '3px solid rgba(67, 34, 124, 0.74)',
                backdropFilter: 'blur(20px)',
                boxShadow: '5px 4px 20px 1px rgba(70, 74, 103, 0.44)',
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

      {/* Core Values Section - Dark Glossy Theme */}
      <section className="py-5" style={{
        background: 'linear-gradient(135deg, #110A28 0%, #110A28 100%)',
        color: 'white'
      }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <h2 className="display-5 fw-bold mb-4 text-white">
                Guiding Principles that <span className="text-info">Define Us</span>
              </h2>
              <div className="mb-4">
                <ul className="list-unstyled">
                  <li className="mb-3 d-flex align-items-center">
                    <i className="bi bi-check-circle-fill text-info me-3" style={{ fontSize: '1.5rem' }}></i>
                    <span className="fw-bold text-white">Act with Integrity</span>
                  </li>
                  <li className="mb-3 d-flex align-items-center">
                    <i className="bi bi-check-circle-fill text-info me-3" style={{ fontSize: '1.5rem' }}></i>
                    <span className="fw-bold text-white">Take Full Ownership</span>
                  </li>
                  <li className="mb-3 d-flex align-items-center">
                    <i className="bi bi-check-circle-fill text-info me-3" style={{ fontSize: '1.5rem' }}></i>
                    <span className="fw-bold text-white">Always Learn & Grow</span>
                  </li>
                  <li className="mb-3 d-flex align-items-center">
                    <i className="bi bi-check-circle-fill text-info me-3" style={{ fontSize: '1.5rem' }}></i>
                    <span className="fw-bold text-white">Champion Empathy</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="value-visual rounded-4" style={{
                width: '100%',
                height: '300px',
                background: 'rgba(60, 58, 58, 0.03)',
                border: '3px solid rgba(67, 34, 124, 0.74)',
                backdropFilter: 'blur(20px)',
                boxShadow: '5px 4px 20px 1px rgba(70, 74, 103, 0.44)',
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

      {/* Office Tour Section - Dark Glossy Theme */}
      <section className="py-5" style={{
        background: 'linear-gradient(135deg, #110A28 0%, #110A28 100%)',
        color: 'white'
      }}>
        <div className="container">
          <h2 className="text-center display-5 fw-bold mb-5 text-white">
            <span className="text-info">Xfunding Flow</span> Office Tour
          </h2>
          <div className="row g-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="col-md-6 col-lg-3">
                <div className="office-photo rounded-4" style={{
                  width: '100%',
                  height: '200px',
                  background: 'rgba(60, 58, 58, 0.03)',
                  border: '3px solid rgba(67, 34, 124, 0.74)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '5px 4px 20px 1px rgba(70, 74, 103, 0.44)',
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

      {/* Global Meetups Section - Dark Glossy Theme */}
      <section className="py-5" style={{
        background: 'linear-gradient(135deg, #110A28 0%, #110A28 100%)',
        color: 'white'
      }}>
        <div className="container">
          <h2 className="text-center display-5 fw-bold mb-5 text-white">
            <span className="text-info">Xfunding Flow</span> Global Meet-Up and Conferences
          </h2>
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="conference-photo rounded-4" style={{
                width: '100%',
                height: '300px',
                background: 'rgba(60, 58, 58, 0.03)',
                border: '3px solid rgba(67, 34, 124, 0.74)',
                backdropFilter: 'blur(20px)',
                boxShadow: '5px 4px 20px 1px rgba(70, 74, 103, 0.44)',
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
                    <div className="event-photo rounded-4" style={{
                      width: '100%',
                      height: '140px',
                      background: 'rgba(60, 58, 58, 0.03)',
                      border: '3px solid rgba(67, 34, 124, 0.74)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: '5px 4px 20px 1px rgba(70, 74, 103, 0.44)',
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

      {/* Partnerships Section - Dark Glossy Theme */}
      <section className="py-5" style={{
        background: 'linear-gradient(135deg, #110A28 0%, #110A28 100%)',
        color: 'white'
      }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h2 className="display-5 fw-bold mb-4 text-white">
                Strategic Partnership with <span className="text-info">MetaQuotes, Google and Meta</span>
              </h2>
              <p className="lead text-white-50">
                We are proud to partner with industry leaders to provide our traders 
                with the best possible trading experience. Our partnerships ensure 
                access to cutting-edge technology and reliable platforms.
              </p>
            </div>
            <div className="col-lg-6 text-center">
              <div className="partnership-logos d-flex justify-content-center gap-4 flex-wrap">
                {['Google', 'Meta', 'MetaQuotes'].map((partner) => (
                  <div key={partner} className="partner-logo rounded-4" style={{
                    width: '120px',
                    height: '80px',
                    background: 'rgba(60, 58, 58, 0.03)',
                    border: '3px solid rgba(67, 34, 124, 0.74)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '5px 4px 20px 1px rgba(70, 74, 103, 0.44)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    {partner}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Dark Glossy Theme */}
      <section className="py-5" style={{
        background: 'linear-gradient(135deg, #110A28 0%, #110A28 100%)',
        color: 'white'
      }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="text-center mb-5">
                <i className="bi bi-quote text-info" style={{ fontSize: '4rem' }}></i>
              </div>
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="testimonial-card text-center p-4 rounded-4" style={{
                    background: 'rgba(60, 58, 58, 0.03)',
                    border: '3px solid rgba(67, 34, 124, 0.74)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '5px 4px 20px 1px rgba(70, 74, 103, 0.44)',
                    color: 'white'
                  }}>
                    <h4 className="fw-bold mb-3 text-white">&quot;We Empower Traders with Financial Freedom&quot;</h4>
                    <p className="text-white-50 mb-4">
                      Our platform is designed to give traders the tools and support 
                      they need to achieve their financial goals.
                    </p>
                    <div className="testimonial-author">
                      <div className="author-photo mx-auto mb-3" style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold'
                      }}>
                        SA
                      </div>
                      <h5 className="fw-bold text-white">Syed Abdullah</h5>
                      <p className="text-white-50">CEO & Founder</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="testimonial-card text-center p-4 rounded-4" style={{
                    background: 'rgba(60, 58, 58, 0.03)',
                    border: '3px solid rgba(67, 34, 124, 0.74)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '5px 4px 20px 1px rgba(70, 74, 103, 0.44)',
                    color: 'white'
                  }}>
                    <h4 className="fw-bold mb-3 text-white">&quot;We Support Traders to Conquer the Markets&quot;</h4>
                    <p className="text-white-50 mb-4">
                      Our comprehensive support system ensures every trader has 
                      the guidance they need to succeed.
                    </p>
                    <div className="testimonial-author">
                      <div className="author-photo mx-auto mb-3" style={{
                        width: '80px',
                        height: '80px',
                        background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold'
                      }}>
                        MA
                      </div>
                      <h5 className="fw-bold text-white">Mahesh Kumar</h5>
                      <p className="text-white-50">CTO & Co-Founder</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Awards Section - Dark Glossy Theme */}
      <section className="py-5" style={{
        background: 'linear-gradient(135deg, #110A28 0%, #110A28 100%)',
        color: 'white'
      }}>
        <div className="container">
          <h2 className="text-center display-5 fw-bold mb-5 text-white">
            Awards and <span className="text-info">Accreditations</span>
          </h2>
          <div className="row g-4 justify-content-center">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="col-md-4 col-lg-2">
                <div className="award-photo rounded-4" style={{
                  width: '100%',
                  height: '150px',
                  background: 'rgba(60, 58, 58, 0.03)',
                  border: '3px solid rgba(67, 34, 124, 0.74)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '5px 4px 20px 1px rgba(70, 74, 103, 0.44)',
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

      {/* Call to Action Section - Dark Glossy Theme */}
      <section className="py-5" style={{
        background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
        color: 'white'
      }}>
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h2 className="display-5 fw-bold mb-4 text-white">
                Join the Global Community for the Traders, by the Traders
              </h2>
              <p className="lead mb-5 text-white-50">
                Connect with thousands of traders worldwide, share strategies, 
                and grow together in our vibrant community.
              </p>
              <div className="d-flex justify-content-center gap-4 flex-wrap">
                <button className="btn btn-lg px-4 py-3 fw-bold rounded-4" style={{
                  background: 'rgba(60, 58, 58, 0.03)',
                  border: '1px solid rgba(124, 124, 124, 0.39)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)',
                  color: 'white'
                }}>
                  <FaDiscord className="me-2" />
                  Join Discord Community
                </button>
                <button className="btn btn-lg px-4 py-3 fw-bold rounded-4" style={{
                  background: 'rgba(60, 58, 58, 0.03)',
                  border: '1px solid rgba(124, 124, 124, 0.39)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)',
                  color: 'white'
                }}>
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