'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '../../user/components/Header';
import Footer from '../../user/components/Footer';

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news`);
      if (response.ok) {
        const data = await response.json();
        setNews(data.news || []);
      } else {
        setError('Failed to load news');
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setError('Failed to load news');
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
                Latest <span className="text-info">News</span>
              </h1>
              <p className="lead text-white-50">Stay updated with the latest market news and trading insights</p>
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

            {news.length === 0 && !error ? (
              <div className="text-center py-5">
                <div className="rounded-4 p-5" style={{
                  background: 'rgba(60, 58, 58, 0.03)',
                  border: '3px solid rgba(67, 34, 124, 0.74)',
                  backdropFilter: 'blur(20px)',
                  boxShadow: '5px 4px 20px 1px rgba(70, 74, 103, 0.44)'
                }}>
                  <h3 className="text-white-50">No news articles available at the moment</h3>
                  <p className="text-white-50">Please check back later for updates.</p>
                </div>
              </div>
            ) : (
              <div className="row">
                {news.map((article) => (
                  <div key={article._id} className="col-md-6 col-lg-4 mb-4">
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
                      {article.featuredImage && (
                        <Image 
                          src={article.featuredImage} 
                          className="card-img-top rounded-top-4" 
                          alt={article.title}
                          style={{ height: '200px', objectFit: 'cover' }}
                          width={400}
                          height={200}
                        />
                      )}
                      <div className="card-body">
                        <h5 className="card-title text-white">{article.title}</h5>
                        <p className="card-text text-white-50">
                          {article.excerpt || article.content.substring(0, 150)}...
                        </p>
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-white-50">
                            {new Date(article.createdAt).toLocaleDateString()}
                          </small>
                          <button className="btn btn-sm rounded-4" style={{
                            background: 'rgba(60, 58, 58, 0.03)',
                            border: '1px solid rgba(124, 124, 124, 0.39)',
                            backdropFilter: 'blur(20px)',
                            color: 'white'
                          }}>
                            Read More
                          </button>
                        </div>
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

export default NewsPage;
