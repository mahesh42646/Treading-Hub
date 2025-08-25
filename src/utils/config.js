// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9988',
  ENDPOINTS: {
    // User endpoints
    USERS: '/api/users',
    USER_PROFILE: (uid) => `/api/users/profile/${uid}`,
    USER_CREATE: '/api/users/create',
    USER_CREATE_WITH_PROFILE: '/api/users/create-with-profile',
    USER_PROFILE_SETUP: '/api/users/profile-setup',
    USER_KYC_VERIFICATION: (uid) => `/api/users/kyc-verification/${uid}`,
    USER_UPDATE_EMAIL_VERIFICATION: (uid) => `/api/users/update-email-verification/${uid}`,
    USER_PROFILE_COMPLETION: (uid) => `/api/users/profile-completion/${uid}`,
    USER_CHECK_PHONE: (phone) => `/api/users/check-phone/${phone}`,
    USER_CHECK_PAN: (panNumber) => `/api/users/check-pan/${panNumber}`,
    USER_CHECK_EMAIL: (email) => `/api/users/check-email/${email}`,
    
    // Admin endpoints
    ADMIN_KYC_APPROVE: (uid) => `/api/users/admin/kyc-approve/${uid}`,
    ADMIN_KYC_REJECT: (uid) => `/api/users/admin/kyc-reject/${uid}`,
    ADMIN_KYC_PENDING: '/api/users/admin/kyc-pending',
    ADMIN_KYC_STATS: '/api/users/admin/kyc-stats',
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
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get endpoint URL
export const getApiEndpoint = (endpointKey, ...params) => {
  const endpoint = API_CONFIG.ENDPOINTS[endpointKey];
  
  if (typeof endpoint === 'function') {
    return endpoint(...params);
  }
  return endpoint;
};
