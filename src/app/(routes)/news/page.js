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
            <div className="text-center mb-5">
              <h1 className="display-4 fw-bold text-primary mb-3">Latest News</h1>
              <p className="lead text-muted">Stay updated with the latest market news and trading insights</p>
            </div>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {news.length === 0 && !error ? (
              <div className="text-center py-5">
                <h3 className="text-muted">No news articles available at the moment</h3>
                <p className="text-muted">Please check back later for updates.</p>
              </div>
            ) : (
              <div className="row">
                {news.map((article) => (
                  <div key={article._id} className="col-md-6 col-lg-4 mb-4">
                    <div className="card h-100 shadow-sm">
                      {article.featuredImage && (
                        <Image 
                          src={article.featuredImage} 
                          className="card-img-top" 
                          alt={article.title}
                          style={{ height: '200px', objectFit: 'cover' }}
                          width={400}
                          height={200}
                        />
                      )}
                      <div className="card-body">
                        <h5 className="card-title">{article.title}</h5>
                        <p className="card-text text-muted">
                          {article.excerpt || article.content.substring(0, 150)}...
                        </p>
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">
                            {new Date(article.createdAt).toLocaleDateString()}
                          </small>
                          <button className="btn btn-outline-primary btn-sm">
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
