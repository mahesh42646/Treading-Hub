'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '../../user/components/Header';
import Footer from '../../user/components/Footer';

const BlogPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/blogs`);
      if (response.ok) {
        const data = await response.json();
        setBlogs(data.blogs || []);
      } else {
        setError('Failed to load blogs');
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setError('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content" style={{
        background: 'linear-gradient(135deg, #110A28 0%, #110A28 100%)',
        minHeight: '100vh',
        color: 'white'
      }}>
        <Header />
        <div className="d-flex align-items-center justify-content-center" style={{ height: '50vh' }}>
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-content" style={{
      background: 'linear-gradient(135deg, #110A28 0%, #110A28 100%)',
      minHeight: '100vh',
      color: 'white'
    }}>
      <Header />
      
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="text-center mb-5 pt-lg-5">
              <h1 className="display-5 display-md-3 display-sm-5 fw-bold text-white mb-3">
                <span className="text-info">Blog</span>
              </h1>
              <p className="lead text-white-50">Latest insights and updates from the trading world</p>
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

            {blogs.length === 0 && !error ? (
              <div className="text-center py-5">
                <div className="rounded-4 p-5" style={{
                  background: 'rgba(60, 58, 58, 0.03)',
                  border: '3px solid rgba(67, 34, 124, 0.74)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '5px 4px 20px 1px rgba(70, 74, 103, 0.44)'
                }}>
                  <h3 className="text-white-50">No blog posts available at the moment</h3>
                  <p className="text-white-50">Please check back later for new content.</p>
                </div>
              </div>
            ) : (
              <div className="row">
                {blogs.map((blog) => (
                  <div key={blog._id} className="col-md-6 col-lg-4 mb-4">
                    <div className="card h-100 border-0 rounded-4" style={{
                      background: 'rgba(60, 58, 58, 0.03)',
                      border: '3px solid rgba(67, 34, 124, 0.74)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: '5px 4px 20px 1px rgba(70, 74, 103, 0.44)',
                      color: 'white',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 15px 35px rgba(139, 92, 246, 0.3)';
                      e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.8)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '5px 4px 20px 1px rgba(70, 74, 103, 0.44)';
                      e.currentTarget.style.borderColor = 'rgba(67, 34, 124, 0.74)';
                    }}>
                      {blog.featuredImage && (
                        <div className="position-relative" style={{ height: '200px', overflow: 'hidden' }}>
                          <Image 
                            src={`${process.env.NEXT_PUBLIC_API_URL}/api${blog.featuredImage}`}
                            className="card-img-top" 
                            alt={blog.title}
                            style={{ objectFit: 'cover' }}
                            fill
                          />
                        </div>
                      )}
                      <div className="card-body d-flex flex-column">
                        <div className="mb-2">
                          <span className="badge rounded-4 me-2" style={{
                            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                            color: 'white'
                          }}>{blog.category}</span>
                          {blog.isFeatured && <span className="badge rounded-4" style={{
                            background: 'rgba(139, 92, 246, 0.2)',
                            color: 'white',
                            border: '1px solid rgba(139, 92, 246, 0.5)'
                          }}>Featured</span>}
                        </div>
                        <h5 className="card-title text-white">{blog.title}</h5>
                        <p className="card-text text-white-50 flex-grow-1">
                          {blog.excerpt || blog.content.substring(0, 150)}...
                        </p>
                        <div className="d-flex justify-content-between align-items-center mt-auto">
                          <div>
                            <small className="text-white-50 d-block">By {blog.author}</small>
                            <small className="text-white-50">
                              {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}
                            </small>
                          </div>
                          <button className="btn btn-sm rounded-4" style={{
                            background: 'rgba(60, 58, 58, 0.03)',
                            border: '1px solid rgba(124, 124, 124, 0.39)',
                            backdropFilter: 'blur(20px)',
                            color: 'white'
                          }}>
                            Read More
                          </button>
                        </div>
                        {blog.tags && blog.tags.length > 0 && (
                          <div className="mt-2">
                            {blog.tags.slice(0, 3).map((tag, index) => (
                              <span key={index} className="badge rounded-4 me-1 small" style={{
                                background: 'rgba(60, 58, 58, 0.03)',
                                border: '1px solid rgba(124, 124, 124, 0.39)',
                                color: 'white'
                              }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BlogPage;
