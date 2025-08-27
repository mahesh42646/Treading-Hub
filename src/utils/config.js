// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9988',
  ENDPOINTS: {
    // User endpoints
    USERS: '/users',
    USER_PROFILE: (uid) => `/users/profile/${uid}`,
    USER_CREATE: '/users/create',
    USER_CREATE_WITH_PROFILE: '/users/create-with-profile',
    USER_PROFILE_SETUP: '/users/profile-setup',
    USER_KYC_VERIFICATION: (uid) => `/users/kyc-verification/${uid}`,
    USER_UPDATE_EMAIL_VERIFICATION: (uid) => `/users/update-email-verification/${uid}`,
    USER_PROFILE_COMPLETION: (uid) => `/users/profile-completion/${uid}`,
    USER_CHECK_PHONE: (phone) => `/users/check-phone/${phone}`,
    USER_CHECK_PAN: (panNumber) => `/users/check-pan/${panNumber}`,
    USER_CHECK_EMAIL: (email) => `/users/check-email/${email}`,
    
    // Admin endpoints
    ADMIN_KYC_APPROVE: (uid) => `/users/admin/kyc-approve/${uid}`,
    ADMIN_KYC_REJECT: (uid) => `/users/admin/kyc-reject/${uid}`,
    ADMIN_KYC_PENDING: '/users/admin/kyc-pending',
    ADMIN_KYC_STATS: '/users/admin/kyc-stats',
  }
};

// Firebase Configuration
export const FIREBASE_CONFIG = {
  API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Environment Configuration
export const ENV_CONFIG = {
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  API_URL: API_CONFIG.BASE_URL,
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint) => {
  // Ensure we don't have duplicate /api in the URL
  const baseUrl = API_CONFIG.BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // For production, use the /api/api/ structure that's currently working
  if (baseUrl === 'https://0fare.com/api') {
    return `${baseUrl}/api${cleanEndpoint}`;
  }
  
  // If base URL already ends with /api, don't add it again
  if (baseUrl.endsWith('/api')) {
    return `${baseUrl}${cleanEndpoint}`;
  }
  
  // If base URL doesn't end with /api, add it
  if (!baseUrl.includes('/api')) {
    return `${baseUrl}/api${cleanEndpoint}`;
  }
  
  return `${baseUrl}${cleanEndpoint}`;
};

// Helper function to get endpoint URL
export const getApiEndpoint = (endpointKey, ...params) => {
  const endpoint = API_CONFIG.ENDPOINTS[endpointKey];
  
  if (typeof endpoint === 'function') {
    return endpoint(...params);
  }
  return endpoint;
};
