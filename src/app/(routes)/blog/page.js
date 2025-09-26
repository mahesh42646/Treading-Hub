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
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="text-center mb-5 pt-lg-5">
              <h1 className="display-5  display-md-3 display-sm-5 fw-bold text-primary mb-3">Blog</h1>
              <p className="lead text-muted">Latest insights and updates from the trading world</p>
            </div>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {blogs.length === 0 && !error ? (
              <div className="text-center py-5">
                <h3 className="text-muted">No blog posts available at the moment</h3>
                <p className="text-muted">Please check back later for new content.</p>
              </div>
            ) : (
              <div className="row">
                {blogs.map((blog) => (
                  <div key={blog._id} className="col-md-6 col-lg-4 mb-4">
                    <div className="card h-100 shadow-sm border-0">
                      {blog.featuredImage && (
                        <div className="position-relative" style={{ height: '200px', overflow: 'hidden' }}>
                          <Image 
                            src={`${process.env.NEXT_PUBLIC_API_URL}${blog.featuredImage}`}
                            className="card-img-top" 
                            alt={blog.title}
                            style={{ objectFit: 'cover' }}
                            fill
                          />
                        </div>
                      )}
                      <div className="card-body d-flex flex-column">
                        <div className="mb-2">
                          <span className="badge bg-primary me-2">{blog.category}</span>
                          {blog.isFeatured && <span className="badge bg-warning">Featured</span>}
                        </div>
                        <h5 className="card-title">{blog.title}</h5>
                        <p className="card-text text-muted flex-grow-1">
                          {blog.excerpt || blog.content.substring(0, 150)}...
                        </p>
                        <div className="d-flex justify-content-between align-items-center mt-auto">
                          <div>
                            <small className="text-muted d-block">By {blog.author}</small>
                            <small className="text-muted">
                              {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}
                            </small>
                          </div>
                          <button className="btn btn-outline-primary btn-sm">
                            Read More
                          </button>
                        </div>
                        {blog.tags && blog.tags.length > 0 && (
                          <div className="mt-2">
                            {blog.tags.slice(0, 3).map((tag, index) => (
                              <span key={index} className="badge bg-light text-dark me-1 small">
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
