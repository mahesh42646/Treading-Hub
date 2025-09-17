'use client';

import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaNewspaper } from 'react-icons/fa';

const AdminNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    author: '',
    category: 'general',
    tags: '',
    source: '',
    sourceUrl: '',
    isPublished: true
  });

  const fetchNews = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/news`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setNews(data.news || []);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingNews 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/news/${editingNews._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/news`;
      
      const method = editingNews ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingNews(null);
        setFormData({
          title: '',
          content: '',
          summary: '',
          author: '',
          category: 'general',
          tags: '',
          source: '',
          sourceUrl: '',
          isPublished: true
        });
        fetchNews();
      }
    } catch (error) {
      console.error('Error saving news:', error);
    }
  };

  const handleEdit = (newsItem) => {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title,
      content: newsItem.content,
      summary: newsItem.summary,
      author: newsItem.author,
      category: newsItem.category,
      tags: newsItem.tags?.join(', ') || '',
      source: newsItem.source,
      sourceUrl: newsItem.sourceUrl,
      isPublished: newsItem.isPublished
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this news article?')) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/news/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (response.ok) {
          fetchNews();
        }
      } catch (error) {
        console.error('Error deleting news:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">News Management</h1>
          <p className="text-muted mb-0">Manage news articles and updates</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setEditingNews(null);
            setFormData({
              title: '',
              content: '',
              summary: '',
              author: '',
              category: 'general',
              tags: '',
              source: '',
              sourceUrl: '',
              isPublished: true
            });
            setShowModal(true);
          }}
        >
          <FaPlus className="me-2" />
          Add News
        </button>
      </div>

      <div className="row">
        {news.map((newsItem) => (
          <div key={newsItem._id} className="col-lg-6 col-xl-4 mb-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="badge bg-secondary">{newsItem.category}</span>
                  <span className={`badge ${newsItem.isPublished ? 'bg-success' : 'bg-warning'}`}>
                    {newsItem.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                <h5 className="card-title mb-2">{newsItem.title}</h5>
                <p className="text-muted small mb-2">{newsItem.summary}</p>
                <p className="text-muted small mb-3">By {newsItem.author}</p>
                
                {newsItem.source && (
                  <p className="text-muted small mb-2">
                    Source: {newsItem.source}
                  </p>
                )}
                
                {newsItem.tags && newsItem.tags.length > 0 && (
                  <div className="mb-3">
                    {newsItem.tags.map((tag, index) => (
                      <span key={index} className="badge bg-light text-dark me-1">{tag}</span>
                    ))}
                  </div>
                )}
                
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    {new Date(newsItem.createdAt).toLocaleDateString()}
                  </small>
                  <div className="btn-group btn-group-sm">
                    <button 
                      className="btn btn-outline-primary"
                      onClick={() => handleEdit(newsItem)}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="btn btn-outline-danger"
                      onClick={() => handleDelete(newsItem._id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {news.length === 0 && (
        <div className="text-center py-5">
          <p className="text-muted">No news articles found. Add your first news article!</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingNews ? 'Edit News' : 'Add New News'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Summary</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={formData.summary}
                      onChange={(e) => setFormData({...formData, summary: e.target.value})}
                      required
                    ></textarea>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Author</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.author}
                          onChange={(e) => setFormData({...formData, author: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Category</label>
                        <select
                          className="form-select"
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                        >
                          <option value="general">General</option>
                          <option value="trading">Trading</option>
                          <option value="market">Market</option>
                          <option value="technology">Technology</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Source</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.source}
                          onChange={(e) => setFormData({...formData, source: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Source URL</label>
                        <input
                          type="url"
                          className="form-control"
                          value={formData.sourceUrl}
                          onChange={(e) => setFormData({...formData, sourceUrl: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Tags (comma separated)</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.tags}
                      onChange={(e) => setFormData({...formData, tags: e.target.value})}
                      placeholder="trading, market, news"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Content</label>
                    <textarea
                      className="form-control"
                      rows="10"
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                      required
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={formData.isPublished}
                        onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
                      />
                      <label className="form-check-label">
                        Publish immediately
                      </label>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingNews ? 'Update News' : 'Add News'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNews;
