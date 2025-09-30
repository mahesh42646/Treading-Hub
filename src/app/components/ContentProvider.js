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
      
      // Try to fetch from backend first
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/content/${page}`);
        if (response.ok) {
          const data = await response.json();
          setContent(prev => ({ ...prev, [page]: data }));
          setError(null);
          return;
        }
      } catch (backendErr) {
        console.warn(`Backend fetch failed for ${page}, trying default file:`, backendErr);
      }

      // Fallback to default JSON file
      try {
        const response = await fetch('/default-content.json');
        if (response.ok) {
          const data = await response.json();
          if (data[page]) {
            setContent(prev => ({ ...prev, [page]: data[page] }));
            setError(null);
            return;
          }
        }
      } catch (fileErr) {
        console.warn(`Default file fetch failed for ${page}:`, fileErr);
      }

      // If both fail, set error
      setError(`Failed to fetch ${page} content from both backend and default file`);
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
