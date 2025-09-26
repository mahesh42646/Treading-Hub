'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaEdit, FaTrash, FaBlog } from 'react-icons/fa';

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    author: '',
    category: 'general',
    tags: '',
    featuredImage: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    slug: '',
    isPublished: true,
    isFeatured: false
  });
  const [imagePreview, setImagePreview] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchBlogs = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/blogs`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setBlogs(data.blogs || []);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const handleTitleChange = (title) => {
    setFormData({
      ...formData,
      title,
      slug: formData.slug || generateSlug(title),
      metaTitle: formData.metaTitle || title
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingBlog 
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/admin/blogs/${editingBlog._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/admin/blogs`;
      
      const method = editingBlog ? 'PUT' : 'POST';
      
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      if (selectedImage) {
        formDataToSend.append('featuredImage', selectedImage);
      }
      
      const response = await fetch(url, {
        method,
        credentials: 'include',
        body: formDataToSend,
      });

      if (response.ok) {
        setShowModal(false);
        setEditingBlog(null);
        setSelectedImage(null);
        setImagePreview('');
        setFormData({
          title: '',
          content: '',
          excerpt: '',
          author: '',
          category: 'general',
          tags: '',
          featuredImage: '',
          metaTitle: '',
          metaDescription: '',
          metaKeywords: '',
          slug: '',
          isPublished: true,
          isFeatured: false
        });
        fetchBlogs();
      }
    } catch (error) {
      console.error('Error saving blog:', error);
    }
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      content: blog.content,
      excerpt: blog.excerpt,
      author: blog.author,
      category: blog.category,
      tags: blog.tags?.join(', ') || '',
      featuredImage: blog.featuredImage || '',
      metaTitle: blog.metaTitle || '',
      metaDescription: blog.metaDescription || '',
      metaKeywords: blog.metaKeywords || '',
      slug: blog.slug || '',
      isPublished: blog.isPublished,
      isFeatured: blog.isFeatured || false
    });
    setImagePreview(blog.featuredImage ? `${process.env.NEXT_PUBLIC_API_URL}/api${blog.featuredImage}` : '');
    setSelectedImage(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/blogs/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        if (response.ok) {
          fetchBlogs();
        }
      } catch (error) {
        console.error('Error deleting blog:', error);
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
          <h1 className="h3 mb-1">Blog Management</h1>
          <p className="text-muted mb-0">Manage blog posts and content</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setEditingBlog(null);
            setSelectedImage(null);
            setImagePreview('');
            setFormData({
              title: '',
              content: '',
              excerpt: '',
              author: '',
              category: 'trading',
              tags: '',
              featuredImage: '',
              metaTitle: '',
              metaDescription: '',
              metaKeywords: '',
              slug: '',
              isPublished: true,
              isFeatured: false
            });
            setShowModal(true);
          }}
        >
          <FaPlus className="me-2" />
          Add Blog
        </button>
      </div>

      <div className="row">
        {blogs.map((blog) => (
          <div key={blog._id} className="col-lg-6 col-xl-4 mb-4">
            <div className="card border-0 shadow-sm h-100">
              {blog.featuredImage && (
                <div className="card-img-top" style={{ height: '200px', overflow: 'hidden' }}>
                  <img 
                    src={`${process.env.NEXT_PUBLIC_API_URL}/api${blog.featuredImage}`}
                    alt={blog.title}
                    className="w-100 h-100"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              )}
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="badge bg-secondary">{blog.category}</span>
                  <div className="d-flex gap-1">
                    {blog.isFeatured && <span className="badge bg-warning">Featured</span>}
                    <span className={`badge ${blog.isPublished ? 'bg-success' : 'bg-warning'}`}>
                      {blog.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
                <h5 className="card-title mb-2">{blog.title}</h5>
                <p className="text-muted small mb-2">{blog.excerpt}</p>
                <p className="text-muted small mb-3">By {blog.author}</p>
                
                {blog.tags && blog.tags.length > 0 && (
                  <div className="mb-3">
                    {blog.tags.map((tag, index) => (
                      <span key={index} className="badge bg-light text-dark me-1">{tag}</span>
                    ))}
                  </div>
                )}
                
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </small>
                  <div className="btn-group btn-group-sm">
                    <button 
                      className="btn btn-outline-primary"
                      onClick={() => handleEdit(blog)}
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="btn btn-outline-danger"
                      onClick={() => handleDelete(blog._id)}
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

      {blogs.length === 0 && (
        <div className="text-center py-5">
          <p className="text-muted">No blogs found. Add your first blog post!</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingBlog ? 'Edit Blog' : 'Add New Blog'}
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
                    <label className="form-label">Featured Image</label>
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    {imagePreview && (
                      <div className="mt-2">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="img-fluid"
                          style={{ maxHeight: '200px', borderRadius: '8px' }}
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Excerpt</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={formData.excerpt}
                      onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
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
                          <option value="trading">Trading</option>
                          <option value="technology">Technology</option>
                          <option value="finance">Finance</option>
                          <option value="education">Education</option>
                          <option value="news">News</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Slug</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.slug}
                          onChange={(e) => setFormData({...formData, slug: e.target.value})}
                          placeholder="auto-generated-from-title"
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Tags (comma separated)</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.tags}
                          onChange={(e) => setFormData({...formData, tags: e.target.value})}
                          placeholder="trading, education, tips"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Content</label>
                    <textarea
                      className="form-control"
                      rows="10"
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                      required
                      placeholder="Write your blog content here..."
                    ></textarea>
                  </div>
                  
                  {/* SEO Fields */}
                  <div className="accordion mb-3" id="seoAccordion">
                    <div className="accordion-item">
                      <h2 className="accordion-header">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#seoCollapse">
                          SEO Settings (Optional)
                        </button>
                      </h2>
                      <div id="seoCollapse" className="accordion-collapse collapse">
                        <div className="accordion-body">
                          <div className="mb-3">
                            <label className="form-label">Meta Title</label>
                            <input
                              type="text"
                              className="form-control"
                              value={formData.metaTitle}
                              onChange={(e) => setFormData({...formData, metaTitle: e.target.value})}
                              placeholder="SEO title for search engines"
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Meta Description</label>
                            <textarea
                              className="form-control"
                              rows="2"
                              value={formData.metaDescription}
                              onChange={(e) => setFormData({...formData, metaDescription: e.target.value})}
                              placeholder="Brief description for search engines"
                            ></textarea>
                          </div>
                          <div className="mb-3">
                            <label className="form-label">Meta Keywords</label>
                            <input
                              type="text"
                              className="form-control"
                              value={formData.metaKeywords}
                              onChange={(e) => setFormData({...formData, metaKeywords: e.target.value})}
                              placeholder="keywords, separated, by, commas"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6">
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
                    <div className="col-md-6">
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={formData.isFeatured}
                          onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                        />
                        <label className="form-check-label">
                          Featured post
                        </label>
                      </div>
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
                    {editingBlog ? 'Update Blog' : 'Add Blog'}
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

export default AdminBlogs;
