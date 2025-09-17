import { getApiEndpoint, buildApiUrl } from '../utils/config';

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = typeof endpoint === 'string' ? buildApiUrl(endpoint) : endpoint;
  
  console.log('🌐 HTTP: Making request to:', url);
  console.log('🌐 HTTP: Options:', options);
  
  // Don't set Content-Type for FormData (browser will set it automatically with boundary)
  const defaultOptions = {
    headers: {
      ...options.headers,
    },
  };

  // Only set Content-Type for JSON requests
  if (!(options.body instanceof FormData)) {
    defaultOptions.headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, { ...defaultOptions, ...options });
  
  console.log('📡 HTTP: Response status:', response.status);
  console.log('📡 HTTP: Response ok:', response.ok);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.log('❌ HTTP: Error data:', errorData);
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  const responseData = await response.json();
  console.log('✅ HTTP: Response data:', responseData);
  return responseData;
};

// User API Service
export const userApi = {
  // Check if phone number exists
  checkPhone: (phone) => 
    apiRequest(getApiEndpoint('USER_CHECK_PHONE', phone)),

  // Check if PAN number exists
  checkPan: (panNumber) => 
    apiRequest(getApiEndpoint('USER_CHECK_PAN', panNumber)),

  // Check if email exists
  checkEmail: (email) => 
    apiRequest(getApiEndpoint('USER_CHECK_EMAIL', email)),

  // Get user profile
  getProfile: (uid) => 
    apiRequest(getApiEndpoint('USER_PROFILE', uid)),

  // Create user
  create: (userData) =>
    apiRequest(getApiEndpoint('USER_CREATE'), {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  // Create user (alias for backward compatibility - redirects to create)
  createUser: (userData) => userApi.create(userData),

  // Create user with profile
  createWithProfile: (userData) => 
    apiRequest(getApiEndpoint('USER_CREATE_WITH_PROFILE'), {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  // Profile setup
  profileSetup: (profileData) => {
    const endpoint = getApiEndpoint('USER_PROFILE_SETUP');
    const fullUrl = buildApiUrl(endpoint);
    console.log('🌐 API: Profile setup endpoint:', endpoint);
    console.log('🌐 API: Full URL:', fullUrl);
    console.log('📤 API: Sending data:', profileData);
    
    return apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  },

  // KYC verification
  kycVerification: (uid, formData) => 
    apiRequest(getApiEndpoint('USER_KYC_VERIFICATION', uid), {
      method: 'POST',
      body: formData, // FormData for file uploads
    }),

  // Update email verification
  updateEmailVerification: (uid, data) => 
    apiRequest(getApiEndpoint('USER_UPDATE_EMAIL_VERIFICATION', uid), {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Profile completion
  profileCompletion: (uid, formData) => 
    apiRequest(getApiEndpoint('USER_PROFILE_COMPLETION', uid), {
      method: 'POST',
      body: formData, // FormData for file uploads
    }),
};

// Admin API Service
export const adminApi = {
  // Approve KYC
  approveKyc: (uid) => 
    apiRequest(getApiEndpoint('ADMIN_KYC_APPROVE', uid), {
      method: 'PUT',
    }),

  // Reject KYC
  rejectKyc: (uid, reason) => 
    apiRequest(getApiEndpoint('ADMIN_KYC_REJECT', uid), {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    }),

  // Get pending KYC
  getPendingKyc: () => 
    apiRequest(getApiEndpoint('ADMIN_KYC_PENDING')),

  // Get KYC stats
  getKycStats: () => 
    apiRequest(getApiEndpoint('ADMIN_KYC_STATS')),
};

// Generic API service for custom endpoints
export const api = {
  get: (endpoint) => apiRequest(endpoint),
  post: (endpoint, data) => apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  put: (endpoint, data) => apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (endpoint) => apiRequest(endpoint, {
    method: 'DELETE',
  }),
  upload: (endpoint, formData) => apiRequest(endpoint, {
    method: 'POST',
    body: formData,
  }),
};
