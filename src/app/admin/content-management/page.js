'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useRouter } from 'next/navigation';

export default function ContentManagement() {
  const { isAuthenticated, loading } = useAdminAuth();
  const router = useRouter();
  // Build base like:
  // - NEXT_PUBLIC_API_URL = https://xfundingflow.com      => https://xfundingflow.com/api/api/content
  // - NEXT_PUBLIC_API_URL = https://xfundingflow.com/api  => https://xfundingflow.com/api/api/content (no double /api)
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
  const API_BASE = `${baseUrl}/api/content`;
  const [activeTab, setActiveTab] = useState('home');
  const [homeSubtab, setHomeSubtab] = useState('hero'); // 'hero' | 'bottomStats' | 'topTraders' | 'testimonials'
  const [content, setContent] = useState({});
  const [loadingContent, setLoadingContent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [savingDefaults, setSavingDefaults] = useState(false);
  const [resettingDefaults, setResettingDefaults] = useState(false);

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
      const response = await fetch(`${API_BASE}/${page}`, { credentials: 'include' });
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
      const response = await fetch(`${API_BASE}/${activeTab}/${section}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
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
      const response = await fetch(`${API_BASE}/${activeTab}/${section}/${arrayField}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
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
      const response = await fetch(`${API_BASE}/${activeTab}/${section}/${arrayField}/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
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
      const response = await fetch(`${API_BASE}/${activeTab}/${section}/${arrayField}/${itemId}`, {
        method: 'DELETE',
        credentials: 'include'
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

  // Defaults system removed: database is the single source of truth
  const saveAsDefault = async () => {
    setMessage('Defaults are disabled. Database is the only source of content.');
    setTimeout(() => setMessage(''), 3000);
  };

  const resetToDefault = async () => {
    setMessage('Defaults are disabled. Database is the only source of content.');
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) {
    return <div className="d-flex justify-content-center p-5"><div className="spinner-border" role="status"></div></div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container-fluid p-4" onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}>
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Content Management</h2>
            {/* Default save/reset removed: DB is single source of truth */}
          </div>
          
          {message && (
            <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'}`}>
              {message}
            </div>
          )}

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

          {/* Home Subtabs */}
          {activeTab === 'home' && (
            <ul className="nav nav-pills mb-4">
              <li className="nav-item">
                <button type="button" className={`nav-link ${homeSubtab === 'hero' ? 'active' : ''}`} onClick={() => setHomeSubtab('hero')}>Hero</button>
              </li>
              <li className="nav-item">
                <button type="button" className={`nav-link ${homeSubtab === 'bottomStats' ? 'active' : ''}`} onClick={() => setHomeSubtab('bottomStats')}>Bottom Stats</button>
              </li>
              <li className="nav-item">
                <button type="button" className={`nav-link ${homeSubtab === 'topTraders' ? 'active' : ''}`} onClick={() => setHomeSubtab('topTraders')}>Top Traders</button>
              </li>
              <li className="nav-item">
                <button type="button" className={`nav-link ${homeSubtab === 'testimonials' ? 'active' : ''}`} onClick={() => setHomeSubtab('testimonials')}>Testimonials</button>
              </li>
            </ul>
          )}

          {/* Content Forms */}
          {loadingContent ? (
            <div className="d-flex justify-content-center p-5">
              <div className="spinner-border" role="status"></div>
            </div>
          ) : (
            <div className="tab-content">
              {activeTab === 'home' && <HomeContent content={content} saveContent={saveContent} saving={saving} homeSubtab={homeSubtab} />}
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
function HomeContent({ content, saveContent, saving, homeSubtab }) {
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

  const addHeroFeatureLocal = () => {
    const next = [...(content.home?.hero?.features || []), {
      title: '', subtitle: '', image: '', order: (content.home?.hero?.features?.length || 0)
    }];
    setHeroData(prev => ({ ...prev, features: next }));
  };

  const removeHeroFeatureLocal = (index) => {
    const next = [...(heroData.features || [])];
    next.splice(index, 1);
    setHeroData(prev => ({ ...prev, features: next }));
  };

  const addTraderLocal = () => {
    const next = [...(topTraders.traders || []), { name: '', payout: '', order: (topTraders.traders?.length || 0) }];
    setTopTraders(prev => ({ ...prev, traders: next }));
  };

  const removeTraderLocal = (index) => {
    const next = [...(topTraders.traders || [])];
    next.splice(index, 1);
    setTopTraders(prev => ({ ...prev, traders: next }));
  };

  const addTestimonialLocal = () => {
    const next = [...(testimonials.testimonials || []), { rating: 5, text: '', verified: true, order: (testimonials.testimonials?.length || 0) }];
    setTestimonials(prev => ({ ...prev, testimonials: next }));
  };

  const removeTestimonialLocal = (index) => {
    const next = [...(testimonials.testimonials || [])];
    next.splice(index, 1);
    setTestimonials(prev => ({ ...prev, testimonials: next }));
  };

  return (
    <div className="row">
      {/* Hero Section */}
      {homeSubtab === 'hero' && (
      <div className="col-12 mb-4">
        <div className="card">
          <div className="card-heade d-flex justify-content-between align-items-center">
            <h5>Hero Section</h5>
            <button type="button" className="btn btn-primary" onClick={handleSaveHero} disabled={saving}>
              {saving ? 'Saving...' : 'Save Hero Section'}
            </button>
          </div>
          <div className="card-body">
            <div className="mb-3 col-lg-6 col-12">
              <label className="form-label">Tagline</label>
              <input
                type="text"
                className="form-control"
                value={heroData.tagline}
                onChange={(e) => setHeroData({ ...heroData, tagline: e.target.value })}
              />
            </div>
            
            <div className="mb-3 col-lg-6 col-12">
              <label className="form-label">Rating Text</label>
              <input
                type="text"
                className="form-control"
                value={heroData.rating.text}
                onChange={(e) => setHeroData({ ...heroData, rating: { ...heroData.rating, text: e.target.value } })}
              />
            </div>
            
            <div className="mb-3 col-lg-6 col-12">
              <label className="form-label">Rating Count</label>
              <input
                type="number"
                className="form-control"
                value={heroData.rating.count}
                onChange={(e) => setHeroData({ ...heroData, rating: { ...heroData.rating, count: parseInt(e.target.value) } })}
              />
            </div>
            
            <div className="mb-3 col-lg-6 col-12">
              <label className="form-label">Platform</label>
              <input
                type="text"
                className="form-control"
                value={heroData.rating.platform}
                onChange={(e) => setHeroData({ ...heroData, rating: { ...heroData.rating, platform: e.target.value } })}
              />
            </div>

           
          </div>
        </div>
      </div>
      )}

      {/* Hero Features */}
      {homeSubtab === 'hero' && (
      <div className="col-12 mb-4">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5>Hero Features</h5>
            <button type="button" className="btn btn-sm btn-success" onClick={addHeroFeatureLocal}>
              Add Feature
            </button>
          </div>
          <div className="card-body">
            {(heroData.features || content.home?.hero?.features || []).map((feature, index) => (
              <div key={feature._id || index} className="border p-3 mb-3 rounded">
                <div className="row">
                  <div className="col-md-4">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={feature.title}
                      onChange={(e) => {
                        const list = [...(heroData.features || content.home?.hero?.features || [])];
                        list[index] = { ...list[index], title: e.target.value };
                        setHeroData(prev => ({ ...prev, features: list }));
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
                        const list = [...(heroData.features || content.home?.hero?.features || [])];
                        list[index] = { ...list[index], subtitle: e.target.value };
                        setHeroData(prev => ({ ...prev, features: list }));
                      }}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Image</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="form-control"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const formData = new FormData();
                        formData.append('file', file);
                        try {
                          const res = await fetch(`${API_BASE.replace('/content','')}/upload`, {
                            method: 'POST',
                            credentials: 'include',
                            body: formData
                          });
                          if (res.ok) {
                            const data = await res.json();
                            const imageUrl = data.url; // e.g., /api/uploads/filename.ext
                            const list = [...(heroData.features || content.home?.hero?.features || [])];
                            list[index] = { ...list[index], image: imageUrl };
                            setHeroData(prev => ({ ...prev, features: list }));
                          }
                        } catch (_) {}
                      }}
                    />
                    {feature.image && (
                      <div className="mt-2">
                        <img src={feature.image} alt="Preview" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                      </div>
                    )}
                  </div>
                  <div className="col-md-1">
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => removeHeroFeatureLocal(index)}>Delete</button>
                  </div>
                </div>
                {feature.image && (
                  <div className="mt-2">
                    <img src={feature.image} alt="Preview" style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                  </div>
                )}
              </div>
            ))}
            <button type="button" className="btn btn-primary" onClick={() => saveContent('home.hero', { ...heroData, features: (heroData.features || content.home?.hero?.features || []) })} disabled={saving}>
              {saving ? 'Saving...' : 'Save Features'}
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Bottom Statistics */}
      {homeSubtab === 'bottomStats' && (
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
            <button type="button" className="btn btn-primary mt-3" onClick={handleSaveBottomStats} disabled={saving}>
              {saving ? 'Saving...' : 'Save Bottom Stats'}
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Top Traders */}
      {homeSubtab === 'topTraders' && (
      <div className="col-12 mb-4">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5>Top Traders Section</h5>
            <button type="button" className="btn btn-sm btn-success" onClick={addTraderLocal}>
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

            {(topTraders.traders || content.home?.topTraders?.traders || []).map((trader, index) => (
              <div key={trader._id || index} className="border p-3 mb-3 rounded">
                <div className="row">
                  <div className="col-md-5">
                    <label className="form-label">Trader Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={trader.name}
                      onChange={(e) => {
                        const next = [...(topTraders.traders || content.home?.topTraders?.traders || [])];
                        next[index] = { ...next[index], name: e.target.value };
                        setTopTraders(prev => ({ ...prev, traders: next }));
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
                        const next = [...(topTraders.traders || content.home?.topTraders?.traders || [])];
                        next[index] = { ...next[index], payout: e.target.value };
                        setTopTraders(prev => ({ ...prev, traders: next }));
                      }}
                    />
                  </div>
                  <div className="col-md-2">
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => removeTraderLocal(index)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}

            <button type="button" className="btn btn-primary" onClick={handleSaveTopTraders} disabled={saving}>
              {saving ? 'Saving...' : 'Save Top Traders'}
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Testimonials */}
      {homeSubtab === 'testimonials' && (
      <div className="col-12 mb-4">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5>Testimonials Section</h5>
            <button type="button" className="btn btn-sm btn-success" onClick={addTestimonialLocal}>
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

            {(testimonials.testimonials || content.home?.testimonials?.testimonials || []).map((testimonial, index) => (
              <div key={testimonial._id || index} className="border p-3 mb-3 rounded">
                <div className="row">
                  <div className="col-md-1">
                    <label className="form-label">Rating</label>
                    <select
                      className="form-control"
                      value={testimonial.rating}
                      onChange={(e) => {
                        const list = [...(testimonials.testimonials || content.home?.testimonials?.testimonials || [])];
                        list[index] = { ...list[index], rating: parseInt(e.target.value) };
                        setTestimonials(prev => ({ ...prev, testimonials: list }));
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
                        const list = [...(testimonials.testimonials || content.home?.testimonials?.testimonials || [])];
                        list[index] = { ...list[index], text: e.target.value };
                        setTestimonials(prev => ({ ...prev, testimonials: list }));
                      }}
                    />
                  </div>
                  <div className="col-md-2">
                    <button type="button" className="btn btn-sm btn-danger" onClick={() => removeTestimonialLocal(index)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}

            <button type="button" className="btn btn-primary" onClick={handleSaveTestimonials} disabled={saving}>
              {saving ? 'Saving...' : 'Save Testimonials'}
            </button>
          </div>
        </div>
      </div>
      )}
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
