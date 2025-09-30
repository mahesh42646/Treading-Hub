'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useRouter } from 'next/navigation';

export default function ContentManagement() {
  const { isAuthenticated, loading } = useAdminAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('home');
  const [content, setContent] = useState({});
  const [loadingContent, setLoadingContent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchContent(activeTab);
    }
  }, [activeTab, isAuthenticated]);

  const fetchContent = async (page) => {
    setLoadingContent(true);
    try {
      const response = await fetch(`/api/content/${page}`);
      if (response.ok) {
        const data = await response.json();
        setContent(data);
      } else {
        setMessage('Failed to fetch content');
      }
    } catch (error) {
      setMessage('Error fetching content');
    } finally {
      setLoadingContent(false);
    }
  };

  const saveContent = async (section, data) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/content/${activeTab}/${section}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        setContent(result.content);
        setMessage('Content saved successfully');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to save content');
      }
    } catch (error) {
      setMessage('Error saving content');
    } finally {
      setSaving(false);
    }
  };

  const addArrayItem = async (section, arrayField, item) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/content/${activeTab}/${section}/${arrayField}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(item)
      });

      if (response.ok) {
        const result = await response.json();
        setContent(result.content);
        setMessage('Item added successfully');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to add item');
      }
    } catch (error) {
      setMessage('Error adding item');
    } finally {
      setSaving(false);
    }
  };

  const updateArrayItem = async (section, arrayField, itemId, data) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/content/${activeTab}/${section}/${arrayField}/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        setContent(result.content);
        setMessage('Item updated successfully');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to update item');
      }
    } catch (error) {
      setMessage('Error updating item');
    } finally {
      setSaving(false);
    }
  };

  const deleteArrayItem = async (section, arrayField, itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/content/${activeTab}/${section}/${arrayField}/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setContent(result.content);
        setMessage('Item deleted successfully');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to delete item');
      }
    } catch (error) {
      setMessage('Error deleting item');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="d-flex justify-content-center p-5"><div className="spinner-border" role="status"></div></div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container-fluid p-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Content Management</h2>
            {message && (
              <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'}`}>
                {message}
              </div>
            )}
          </div>

          {/* Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'home' ? 'active' : ''}`}
                onClick={() => setActiveTab('home')}
              >
                Home
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'about' ? 'active' : ''}`}
                onClick={() => setActiveTab('about')}
              >
                About
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'contact' ? 'active' : ''}`}
                onClick={() => setActiveTab('contact')}
              >
                Contact
              </button>
            </li>
          </ul>

          {/* Content Forms */}
          {loadingContent ? (
            <div className="d-flex justify-content-center p-5">
              <div className="spinner-border" role="status"></div>
            </div>
          ) : (
            <div className="tab-content">
              {activeTab === 'home' && <HomeContent content={content} saveContent={saveContent} addArrayItem={addArrayItem} updateArrayItem={updateArrayItem} deleteArrayItem={deleteArrayItem} saving={saving} />}
              {activeTab === 'about' && <AboutContent content={content} saveContent={saveContent} addArrayItem={addArrayItem} updateArrayItem={updateArrayItem} deleteArrayItem={deleteArrayItem} saving={saving} />}
              {activeTab === 'contact' && <ContactContent content={content} saveContent={saveContent} saving={saving} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Home Content Component
function HomeContent({ content, saveContent, addArrayItem, updateArrayItem, deleteArrayItem, saving }) {
  const [heroData, setHeroData] = useState({
    tagline: '',
    rating: { text: '', count: 0, platform: '' }
  });
  const [bottomStats, setBottomStats] = useState({
    accounts: { value: '', label: '' },
    traders: { value: '', label: '' },
    totalRewarded: { value: '', label: '' }
  });
  const [topTraders, setTopTraders] = useState({
    title: '',
    stats: {
      fundedTraders: { value: '', label: '' },
      activeTraders: { value: '', label: '' },
      totalPayouts: { value: '', label: '' }
    },
    traders: []
  });
  const [testimonials, setTestimonials] = useState({
    title: '',
    subtitle: '',
    rating: { text: '', platform: '' },
    testimonials: []
  });

  useEffect(() => {
    if (content.home) {
      setHeroData(content.home.hero || { tagline: '', rating: { text: '', count: 0, platform: '' } });
      setBottomStats(content.home.bottomStats || {});
      setTopTraders(content.home.topTraders || { title: '', stats: {}, traders: [] });
      setTestimonials(content.home.testimonials || { title: '', subtitle: '', rating: {}, testimonials: [] });
    }
  }, [content]);

  const handleSaveHero = () => {
    saveContent('home.hero', heroData);
  };

  const handleSaveBottomStats = () => {
    saveContent('home.bottomStats', bottomStats);
  };

  const handleSaveTopTraders = () => {
    saveContent('home.topTraders', topTraders);
  };

  const handleSaveTestimonials = () => {
    saveContent('home.testimonials', testimonials);
  };

  const addHeroFeature = () => {
    const newFeature = {
      title: '',
      subtitle: '',
      image: '',
      order: (content.home?.hero?.features?.length || 0)
    };
    addArrayItem('home.hero', 'features', newFeature);
  };

  const addTrader = () => {
    const newTrader = {
      name: '',
      payout: '',
      order: (content.home?.topTraders?.traders?.length || 0)
    };
    addArrayItem('home.topTraders', 'traders', newTrader);
  };

  const addTestimonial = () => {
    const newTestimonial = {
      rating: 5,
      text: '',
      verified: true,
      order: (content.home?.testimonials?.testimonials?.length || 0)
    };
    addArrayItem('home.testimonials', 'testimonials', newTestimonial);
  };

  return (
    <div className="row">
      {/* Hero Section */}
      <div className="col-12 mb-4">
        <div className="card">
          <div className="card-header">
            <h5>Hero Section</h5>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">Tagline</label>
              <input
                type="text"
                className="form-control"
                value={heroData.tagline}
                onChange={(e) => setHeroData({ ...heroData, tagline: e.target.value })}
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label">Rating Text</label>
              <input
                type="text"
                className="form-control"
                value={heroData.rating.text}
                onChange={(e) => setHeroData({ ...heroData, rating: { ...heroData.rating, text: e.target.value } })}
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label">Rating Count</label>
              <input
                type="number"
                className="form-control"
                value={heroData.rating.count}
                onChange={(e) => setHeroData({ ...heroData, rating: { ...heroData.rating, count: parseInt(e.target.value) } })}
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label">Platform</label>
              <input
                type="text"
                className="form-control"
                value={heroData.rating.platform}
                onChange={(e) => setHeroData({ ...heroData, rating: { ...heroData.rating, platform: e.target.value } })}
              />
            </div>

            <button className="btn btn-primary" onClick={handleSaveHero} disabled={saving}>
              {saving ? 'Saving...' : 'Save Hero Section'}
            </button>
          </div>
        </div>
      </div>

      {/* Hero Features */}
      <div className="col-12 mb-4">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5>Hero Features</h5>
            <button className="btn btn-sm btn-success" onClick={addHeroFeature}>
              Add Feature
            </button>
          </div>
          <div className="card-body">
            {content.home?.hero?.features?.map((feature, index) => (
              <div key={feature._id || index} className="border p-3 mb-3 rounded">
                <div className="row">
                  <div className="col-md-4">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={feature.title}
                      onChange={(e) => {
                        const newFeatures = [...(content.home?.hero?.features || [])];
                        newFeatures[index] = { ...newFeatures[index], title: e.target.value };
                        updateArrayItem('home.hero', 'features', feature._id, newFeatures[index]);
                      }}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Subtitle</label>
                    <input
                      type="text"
                      className="form-control"
                      value={feature.subtitle}
                      onChange={(e) => {
                        const newFeatures = [...(content.home?.hero?.features || [])];
                        newFeatures[index] = { ...newFeatures[index], subtitle: e.target.value };
                        updateArrayItem('home.hero', 'features', feature._id, newFeatures[index]);
                      }}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Image URL</label>
                    <input
                      type="text"
                      className="form-control"
                      value={feature.image}
                      onChange={(e) => {
                        const newFeatures = [...(content.home?.hero?.features || [])];
                        newFeatures[index] = { ...newFeatures[index], image: e.target.value };
                        updateArrayItem('home.hero', 'features', feature._id, newFeatures[index]);
                      }}
                    />
                  </div>
                  <div className="col-md-1">
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteArrayItem('home.hero', 'features', feature._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {feature.image && (
                  <div className="mt-2">
                    <img src={feature.image} alt="Preview" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Statistics */}
      <div className="col-12 mb-4">
        <div className="card">
          <div className="card-header">
            <h5>Bottom Statistics Panel</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-4">
                <label className="form-label">Accounts Value</label>
                <input
                  type="text"
                  className="form-control"
                  value={bottomStats.accounts?.value || ''}
                  onChange={(e) => setBottomStats({ ...bottomStats, accounts: { ...bottomStats.accounts, value: e.target.value } })}
                />
                <label className="form-label mt-2">Accounts Label</label>
                <input
                  type="text"
                  className="form-control"
                  value={bottomStats.accounts?.label || ''}
                  onChange={(e) => setBottomStats({ ...bottomStats, accounts: { ...bottomStats.accounts, label: e.target.value } })}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Traders Value</label>
                <input
                  type="text"
                  className="form-control"
                  value={bottomStats.traders?.value || ''}
                  onChange={(e) => setBottomStats({ ...bottomStats, traders: { ...bottomStats.traders, value: e.target.value } })}
                />
                <label className="form-label mt-2">Traders Label</label>
                <input
                  type="text"
                  className="form-control"
                  value={bottomStats.traders?.label || ''}
                  onChange={(e) => setBottomStats({ ...bottomStats, traders: { ...bottomStats.traders, label: e.target.value } })}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Total Rewarded Value</label>
                <input
                  type="text"
                  className="form-control"
                  value={bottomStats.totalRewarded?.value || ''}
                  onChange={(e) => setBottomStats({ ...bottomStats, totalRewarded: { ...bottomStats.totalRewarded, value: e.target.value } })}
                />
                <label className="form-label mt-2">Total Rewarded Label</label>
                <input
                  type="text"
                  className="form-control"
                  value={bottomStats.totalRewarded?.label || ''}
                  onChange={(e) => setBottomStats({ ...bottomStats, totalRewarded: { ...bottomStats.totalRewarded, label: e.target.value } })}
                />
              </div>
            </div>
            <button className="btn btn-primary mt-3" onClick={handleSaveBottomStats} disabled={saving}>
              {saving ? 'Saving...' : 'Save Bottom Stats'}
            </button>
          </div>
        </div>
      </div>

      {/* Top Traders */}
      <div className="col-12 mb-4">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5>Top Traders Section</h5>
            <button className="btn btn-sm btn-success" onClick={addTrader}>
              Add Trader
            </button>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">Section Title</label>
              <input
                type="text"
                className="form-control"
                value={topTraders.title}
                onChange={(e) => setTopTraders({ ...topTraders, title: e.target.value })}
              />
            </div>
            
            <div className="row mb-3">
              <div className="col-md-4">
                <label className="form-label">Funded Traders Value</label>
                <input
                  type="text"
                  className="form-control"
                  value={topTraders.stats?.fundedTraders?.value || ''}
                  onChange={(e) => setTopTraders({ ...topTraders, stats: { ...topTraders.stats, fundedTraders: { ...topTraders.stats?.fundedTraders, value: e.target.value } } })}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Active Traders Value</label>
                <input
                  type="text"
                  className="form-control"
                  value={topTraders.stats?.activeTraders?.value || ''}
                  onChange={(e) => setTopTraders({ ...topTraders, stats: { ...topTraders.stats, activeTraders: { ...topTraders.stats?.activeTraders, value: e.target.value } } })}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Total Payouts Value</label>
                <input
                  type="text"
                  className="form-control"
                  value={topTraders.stats?.totalPayouts?.value || ''}
                  onChange={(e) => setTopTraders({ ...topTraders, stats: { ...topTraders.stats, totalPayouts: { ...topTraders.stats?.totalPayouts, value: e.target.value } } })}
                />
              </div>
            </div>

            {content.home?.topTraders?.traders?.map((trader, index) => (
              <div key={trader._id || index} className="border p-3 mb-3 rounded">
                <div className="row">
                  <div className="col-md-5">
                    <label className="form-label">Trader Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={trader.name}
                      onChange={(e) => {
                        const newTraders = [...(content.home?.topTraders?.traders || [])];
                        newTraders[index] = { ...newTraders[index], name: e.target.value };
                        updateArrayItem('home.topTraders', 'traders', trader._id, newTraders[index]);
                      }}
                    />
                  </div>
                  <div className="col-md-5">
                    <label className="form-label">Payout</label>
                    <input
                      type="text"
                      className="form-control"
                      value={trader.payout}
                      onChange={(e) => {
                        const newTraders = [...(content.home?.topTraders?.traders || [])];
                        newTraders[index] = { ...newTraders[index], payout: e.target.value };
                        updateArrayItem('home.topTraders', 'traders', trader._id, newTraders[index]);
                      }}
                    />
                  </div>
                  <div className="col-md-2">
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteArrayItem('home.topTraders', 'traders', trader._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button className="btn btn-primary" onClick={handleSaveTopTraders} disabled={saving}>
              {saving ? 'Saving...' : 'Save Top Traders'}
            </button>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="col-12 mb-4">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5>Testimonials Section</h5>
            <button className="btn btn-sm btn-success" onClick={addTestimonial}>
              Add Testimonial
            </button>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">Section Title</label>
              <input
                type="text"
                className="form-control"
                value={testimonials.title}
                onChange={(e) => setTestimonials({ ...testimonials, title: e.target.value })}
              />
            </div>
            
            <div className="mb-3">
              <label className="form-label">Section Subtitle</label>
              <textarea
                className="form-control"
                rows="3"
                value={testimonials.subtitle}
                onChange={(e) => setTestimonials({ ...testimonials, subtitle: e.target.value })}
              />
            </div>

            {content.home?.testimonials?.testimonials?.map((testimonial, index) => (
              <div key={testimonial._id || index} className="border p-3 mb-3 rounded">
                <div className="row">
                  <div className="col-md-1">
                    <label className="form-label">Rating</label>
                    <select
                      className="form-control"
                      value={testimonial.rating}
                      onChange={(e) => {
                        const newTestimonials = [...(content.home?.testimonials?.testimonials || [])];
                        newTestimonials[index] = { ...newTestimonials[index], rating: parseInt(e.target.value) };
                        updateArrayItem('home.testimonials', 'testimonials', testimonial._id, newTestimonials[index]);
                      }}
                    >
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                      <option value={4}>4</option>
                      <option value={5}>5</option>
                    </select>
                  </div>
                  <div className="col-md-9">
                    <label className="form-label">Testimonial Text</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={testimonial.text}
                      onChange={(e) => {
                        const newTestimonials = [...(content.home?.testimonials?.testimonials || [])];
                        newTestimonials[index] = { ...newTestimonials[index], text: e.target.value };
                        updateArrayItem('home.testimonials', 'testimonials', testimonial._id, newTestimonials[index]);
                      }}
                    />
                  </div>
                  <div className="col-md-2">
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteArrayItem('home.testimonials', 'testimonials', testimonial._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button className="btn btn-primary" onClick={handleSaveTestimonials} disabled={saving}>
              {saving ? 'Saving...' : 'Save Testimonials'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// About Content Component
function AboutContent({ content, saveContent, addArrayItem, updateArrayItem, deleteArrayItem, saving }) {
  // Similar structure for About page content management
  return (
    <div className="row">
      <div className="col-12">
        <div className="card">
          <div className="card-body">
            <h5>About Page Content Management</h5>
            <p>About page content management will be implemented here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Contact Content Component
function ContactContent({ content, saveContent, saving }) {
  // Similar structure for Contact page content management
  return (
    <div className="row">
      <div className="col-12">
        <div className="card">
          <div className="card-body">
            <h5>Contact Page Content Management</h5>
            <p>Contact page content management will be implemented here.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
