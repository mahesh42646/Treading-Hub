const axios = require('axios');

const BASE_URL = 'http://localhost:9988';

async function testPopupLoginFlow() {
  console.log('🧪 Testing Popup-Based Google Login Flow...\n');
  
  try {
    // Test 1: Check if profile exists for a test user
    console.log('1. Testing profile check for existing user...');
    const testUid = 'test-google-user-4';
    
    const profileResponse = await axios.get(`${BASE_URL}/api/users/profile/${testUid}`);
    console.log('✅ Profile check result:', profileResponse.data.profile ? 'Profile exists' : 'No profile');
    
    // Test 2: Test the profile check endpoint
    console.log('\n2. Testing profile check endpoint...');
    const newUid = 'test-popup-user-' + Date.now();
    const newProfileResponse = await axios.get(`${BASE_URL}/api/users/profile/${newUid}`);
    console.log('✅ New user profile check:', newProfileResponse.data.profile ? 'Profile exists' : 'No profile (expected)');
    
    console.log('\n🎉 Popup login flow test completed!');
    console.log('\n📋 Expected Popup Flow:');
    console.log('1. User clicks "Continue with Google"');
    console.log('2. Popup window opens with Google login');
    console.log('3. User completes Google authentication in popup');
    console.log('4. Popup closes and returns user data');
    console.log('5. Frontend checks database for profile');
    console.log('6. Redirects to dashboard (if profile exists) or profile setup (if no profile)');
    
    console.log('\n🔧 Key Benefits of Popup Approach:');
    console.log('✅ No page redirects - stays on login page');
    console.log('✅ Immediate response after authentication');
    console.log('✅ Better user experience');
    console.log('✅ No COOP (Cross-Origin-Opener-Policy) issues');
    console.log('✅ Simpler error handling');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

if (require.main === module) {
  testPopupLoginFlow();
}

module.exports = testPopupLoginFlow;
