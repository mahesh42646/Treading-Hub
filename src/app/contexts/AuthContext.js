'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../user/auth/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { userApi } from '../../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Check user profile in database
  const checkUserProfile = async (uid) => {
    try {
      const data = await userApi.getProfile(uid);
      
      if (data.success && data.profile) {
        setProfile(data.profile);
        return data.profile;
      } else {
        setProfile(null);
        return null;
      }
    } catch (error) {
      console.error('Error checking user profile:', error);
      setProfile(null);
      return null;
    }
  };

  // Create user in database if doesn't exist
  const createUserInDatabase = async (firebaseUser) => {
    try {
      const data = await userApi.createUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        emailVerified: firebaseUser.emailVerified,
        isGoogleUser: firebaseUser.providerData.some(provider => provider.providerId === 'google.com')
      });

      return data.success;
    } catch (error) {
      console.error('Error creating user in database:', error);
      return false;
    }
  };

  // Handle navigation based on user state and profile
  const handleNavigation = useCallback((firebaseUser, userProfile) => {
    if (!firebaseUser) {
      // No user, redirect to login if not already there
      if (pathname !== '/login' && pathname !== '/register' && pathname !== '/') {
        router.push('/login');
      }
      return;
    }

    // User is authenticated
    if (!userProfile) {
      // No profile, but user can access dashboard and other pages
      // Only redirect to profile setup if they're trying to access KYC
      if (pathname === '/kyc-verification') {
        router.push('/profile-setup');
        return;
      }
      // Don't redirect away from profile setup - let user complete it if they want
    } else {
      // User has profile, check KYC status
      const kycStatus = userProfile.profileCompletion?.kycStatus;
      
      // If KYC is approved, redirect away from KYC and profile setup pages
      if (kycStatus === 'approved' || kycStatus === 'verified') {
        if (pathname === '/kyc-verification' || pathname === '/profile-setup') {
          router.push('/dashboard');
          return;
        }
      }
      
      // If KYC is under review or pending, redirect away from KYC page (can't edit while under review)
      if (kycStatus === 'under_review' || kycStatus === 'pending') {
        if (pathname === '/kyc-verification') {
          router.push('/dashboard');
          return;
        }
      }
      
      // If user has profile (even without KYC), redirect away from profile setup
      if (pathname === '/profile-setup') {
        router.push('/dashboard');
        return;
      }
    }

    // If user is on login/register page but authenticated, redirect to dashboard
    if ((pathname === '/login' || pathname === '/register') && firebaseUser) {
      router.push('/dashboard');
      return;
    }
  }, [pathname, router]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Create user in database if doesn't exist
        await createUserInDatabase(firebaseUser);
        
        // Check user profile
        const userProfile = await checkUserProfile(firebaseUser.uid);
        setProfile(userProfile);
        
        // Handle navigation after profile check
        handleNavigation(firebaseUser, userProfile);
      } else {
        setUser(null);
        setProfile(null);
        handleNavigation(null, null);
      }
      
      setAuthChecked(true);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Handle navigation when profile changes
  useEffect(() => {
    if (authChecked && user) {
      handleNavigation(user, profile);
    }
  }, [profile, authChecked, user, pathname, handleNavigation]);

  // Handle browser back/forward button
  useEffect(() => {
    const handlePopState = () => {
      if (authChecked && user) {
        handleNavigation(user, profile);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [authChecked, user, profile, handleNavigation]);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Refresh user profile from backend
  const refreshProfile = async () => {
    if (!user?.uid) return;
    
    try {
      const data = await userApi.getProfile(user.uid);
      if (data.success) {
        setProfile(data.profile);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  // Check email verification status and update backend
  const checkEmailVerification = async () => {
    if (!user) return;
    
    try {
      // Reload user to get latest email verification status
      await user.reload();
      
      // If email is now verified, update backend
      if (user.emailVerified) {
        const data = await userApi.updateEmailVerification(user.uid, {
          emailVerified: true
        });
        
        if (data.success) {
          // Refresh profile to get updated data
          await refreshProfile();
        }
      }
    } catch (error) {
      console.error('Error checking email verification:', error);
    }
  };

  const value = {
    user,
    profile,
    loading,
    authChecked,
    logout,
    refreshProfile,
    checkEmailVerification
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 