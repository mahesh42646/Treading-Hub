'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const ContentContext = createContext();

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};

export const ContentProvider = ({ children }) => {
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchContent = async (page) => {
    try {
      setLoading(true);

      // Build API base to intentionally use two /api segments (e.g., /api/api)
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
      const apiBase = `${baseUrl}/api`;

      const response = await fetch(`${apiBase}/content/${page}`, { credentials: 'include' });
      if (!response.ok) {
        throw new Error(`Failed to fetch ${page} content (${response.status})`);
      }
      const data = await response.json();
      setContent(prev => ({ ...prev, [page]: data }));
      setError(null);
    } catch (err) {
      setError(`Error fetching ${page} content: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getContent = (page, section = null) => {
    if (section) {
      return content[page]?.[section] || null;
    }
    return content[page] || null;
  };

  const hasContent = (page) => {
    return !!content[page];
  };

  useEffect(() => {
    // Fetch home content by default
    fetchContent('home');
  }, []);

  const value = {
    content,
    loading,
    error,
    fetchContent,
    getContent,
    hasContent
  };

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
};
