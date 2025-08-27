'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

const RouteGuard = ({ children, requireAuth = true, requireProfile = false, redirectTo = '/login' }) => {
  const { user, profile, loading, authChecked } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && authChecked) {
      // If authentication is required but user is not authenticated
      if (requireAuth && !user) {
        console.log('🚫 Route protected: User not authenticated, redirecting to login');
        router.push(redirectTo);
        return;
      }

      // If user is authenticated but shouldn't be on this page (e.g., login page)
      if (!requireAuth && user) {
        console.log('🔄 User already authenticated, redirecting to dashboard');
        router.push('/dashboard');
        return;
      }

      // If profile is required but user doesn't have one
      if (requireProfile && user && !profile) {
        console.log('📝 Profile required but not found, redirecting to profile setup');
        router.push('/profile-setup');
        return;
      }

      // If user has profile, handle KYC workflow access control
      if (user && profile) {
        // Let individual pages handle their own KYC logic
        // No redirects from RouteGuard - let KYC page show status messages
        
        // If user has profile (even without KYC), redirect away from profile setup
        if (window.location.pathname === '/profile-setup') {
          console.log('✅ User already has profile, redirecting to dashboard');
          router.push('/dashboard');
          return;
        }
      }
    }
  }, [user, profile, loading, authChecked, requireAuth, requireProfile, redirectTo, router]);

  // Show loading spinner while checking authentication
  if (loading || !authChecked) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #002260 0%, #110A28 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="text-center">
          <div className="spinner-border text-light" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-white-50">Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated, don't render children
  if (requireAuth && !user) {
    return null;
  }

  // If user is authenticated but shouldn't be on this page, don't render children
  if (!requireAuth && user) {
    return null;
  }

  // If profile is required but user doesn't have one, don't render children
  if (requireProfile && user && !profile) {
    return null;
  }

  return children;
};

export default RouteGuard;
