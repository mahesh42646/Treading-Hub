# Environment Setup Guide

## Overview
This project uses environment variables to manage API URLs and configuration across different environments (development, staging, production).

## Environment Files

### `.env.local` (Development)
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:9988

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Environment
NODE_ENV=development
```

### `.env.production` (Production)
```env
# API Configuration
NEXT_PUBLIC_API_URL=https://your-production-api.com

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Environment
NODE_ENV=production
```

## API Service Usage

### Import the API Service
```javascript
import { userApi, adminApi, api } from '../services/api';
```

### User API Examples
```javascript
// Check phone number availability
const phoneCheck = await userApi.checkPhone('1234567890');

// Create user with profile
const userData = await userApi.createWithProfile({
  uid: 'user123',
  email: 'user@example.com',
  // ... other fields
});

// Profile setup
const profileData = await userApi.profileSetup({
  uid: 'user123',
  firstName: 'John',
  // ... other fields
});

// KYC verification
const formData = new FormData();
formData.append('panCardImage', file);
const kycData = await userApi.kycVerification('user123', formData);

// Get user profile
const profile = await userApi.getProfile('user123');
```

### Admin API Examples
```javascript
// Approve KYC
await adminApi.approveKyc('user123');

// Reject KYC
await adminApi.rejectKyc('user123', 'Invalid documents');

// Get pending KYC
const pendingKyc = await adminApi.getPendingKyc();

// Get KYC stats
const stats = await adminApi.getKycStats();
```

### Generic API Examples
```javascript
// GET request
const data = await api.get('/custom/endpoint');

// POST request
const response = await api.post('/custom/endpoint', { data: 'value' });

// PUT request
const update = await api.put('/custom/endpoint', { data: 'new value' });

// DELETE request
await api.delete('/custom/endpoint');

// File upload
const formData = new FormData();
formData.append('file', file);
const upload = await api.upload('/upload/endpoint', formData);
```

## Configuration Utilities

### Import Configuration
```javascript
import { API_CONFIG, FIREBASE_CONFIG, ENV_CONFIG, buildApiUrl, getApiEndpoint } from '../utils/config';
```

### Usage Examples
```javascript
// Get API base URL
console.log(API_CONFIG.BASE_URL); // http://localhost:9988

// Build full API URL
const url = buildApiUrl('/api/users/profile/123');
// Result: http://localhost:9988/api/users/profile/123

// Get endpoint URL with parameters
const endpoint = getApiEndpoint('USER_PROFILE', 'user123');
// Result: http://localhost:9988/api/users/profile/user123

// Check environment
if (ENV_CONFIG.IS_DEVELOPMENT) {
  console.log('Running in development mode');
}
```

## Switching Environments

### Development
```bash
npm run dev
# Uses .env.local
```

### Production Build
```bash
npm run build
npm start
# Uses .env.production
```

### Custom Environment
```bash
# Create .env.staging
NEXT_PUBLIC_API_URL=https://staging-api.com

# Run with custom environment
NODE_ENV=staging npm run dev
```

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:9988` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | `AIzaSy...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | `my-project` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | `project.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | `123456789` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | `1:123456789:web:abc123` |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase measurement ID | `G-XXXXXXXXXX` |
| `NODE_ENV` | Node environment | `development`, `production` |

## Benefits

1. **Centralized Configuration**: All API URLs and settings in one place
2. **Environment Switching**: Easy to switch between dev/staging/production
3. **Type Safety**: Structured API service with consistent error handling
4. **Maintainability**: Easy to update endpoints and add new features
5. **Security**: Sensitive data kept in environment files (not in code)

## Migration from Direct Fetch Calls

### Before (Direct fetch)
```javascript
const response = await fetch('http://localhost:9988/api/users/profile/123');
const data = await response.json();
```

### After (API Service)
```javascript
const data = await userApi.getProfile('123');
```

This approach provides better error handling, consistent API structure, and easier environment management.
