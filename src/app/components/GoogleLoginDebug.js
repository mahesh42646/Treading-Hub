'use client';

import { useEffect, useState } from 'react';
import { auth } from '../user/auth/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const GoogleLoginDebug = () => {
  const [debugInfo, setDebugInfo] = useState({
    currentUser: null,
    authState: 'checking',
    urlParams: {},
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const params = {};
    for (const [key, value] of urlParams.entries()) {
      params[key] = value;
    }

    setDebugInfo(prev => ({
      ...prev,
      urlParams: params,
      timestamp: new Date().toISOString()
    }));

    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setDebugInfo(prev => ({
        ...prev,
        currentUser: user ? {
          uid: user.uid,
          email: user.email,
          emailVerified: user.emailVerified,
          providerData: user.providerData.map(p => p.providerId)
        } : null,
        authState: user ? 'authenticated' : 'unauthenticated',
        timestamp: new Date().toISOString()
      }));
    });

    return () => unsubscribe();
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>🔍 Google Login Debug</div>
      <div>Auth State: {debugInfo.authState}</div>
      <div>User: {debugInfo.currentUser?.email || 'None'}</div>
      <div>UID: {debugInfo.currentUser?.uid || 'None'}</div>
      <div>Email Verified: {debugInfo.currentUser?.emailVerified ? 'Yes' : 'No'}</div>
      <div>Providers: {debugInfo.currentUser?.providerData?.join(', ') || 'None'}</div>
      <div>URL Params: {Object.keys(debugInfo.urlParams).length > 0 ? JSON.stringify(debugInfo.urlParams) : 'None'}</div>
      <div>Time: {debugInfo.timestamp}</div>
    </div>
  );
};

export default GoogleLoginDebug;
