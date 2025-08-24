'use client';

import { useEffect, useState } from 'react';

const BootstrapProvider = ({ children }) => {
  const [bootstrapLoaded, setBootstrapLoaded] = useState(false);

  useEffect(() => {
    const loadBootstrap = async () => {
      try {
        if (typeof window !== 'undefined' && !window.bootstrap) {
          // Import Bootstrap dynamically
          const bootstrap = await import('bootstrap/dist/js/bootstrap.bundle.min.js');
          if (bootstrap && bootstrap.default) {
            window.bootstrap = bootstrap.default;
            setBootstrapLoaded(true);
            console.log('✅ Bootstrap is loaded successfully');
          }
        } else if (window.bootstrap) {
          setBootstrapLoaded(true);
          console.log('✅ Bootstrap is already loaded');
        }
      } catch (error) {
        console.error('❌ Failed to load Bootstrap:', error);
        // Try fallback CDN
        try {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js';
          script.async = true;
          script.onload = () => {
            setBootstrapLoaded(true);
            console.log('✅ Bootstrap loaded from CDN fallback');
          };
          script.onerror = () => {
            console.error('❌ Failed to load Bootstrap from CDN fallback');
          };
          document.head.appendChild(script);
        } catch (cdnError) {
          console.error('❌ All Bootstrap loading methods failed:', cdnError);
        }
      }
    };

    loadBootstrap();
  }, []);

  return (
    <>
      {children}
      {!bootstrapLoaded && (
        <div style={{ display: 'none' }}>
          Loading Bootstrap...
        </div>
      )}
    </>
  );
};

export default BootstrapProvider;
