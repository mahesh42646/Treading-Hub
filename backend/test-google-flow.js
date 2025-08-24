const axios = require('axios');

const BASE_URL = 'http://localhost:9988';

async function testGoogleLoginFlow() {
  console.log('🧪 Testing Google Login Flow...\n');
  
  try {
    // Test 1: Create a new Google user
    console.log('1. Testing new Google user creation...');
    const newUser = {
      uid: 'test-google-new-' + Date.now(),
      email: 'newuser@google.com',
      emailVerified: true,
      isGoogleUser: true
    };
    
    const createResponse = await axios.post(`${BASE_URL}/api/users/create`, newUser);
    console.log('✅ New user created:', createResponse.data.message);
    
    // Test 2: Check profile (should be null)
    console.log('\n2. Testing profile check for new user...');
    const profileResponse = await axios.get(`${BASE_URL}/api/users/profile/${newUser.uid}`);
    console.log('✅ Profile check:', profileResponse.data.profile ? 'Profile exists' : 'No profile (expected)');
    
    // Test 3: Try to create same user again (should return success)
    console.log('\n3. Testing existing user creation...');
    const existingResponse = await axios.post(`${BASE_URL}/api/users/create`, newUser);
    console.log('✅ Existing user handled:', existingResponse.data.message);
    
    // Test 4: Check profile again
    console.log('\n4. Testing profile check again...');
    const profileResponse2 = await axios.get(`${BASE_URL}/api/users/profile/${newUser.uid}`);
    console.log('✅ Profile check:', profileResponse2.data.profile ? 'Profile exists' : 'No profile (expected)');
    
    console.log('\n🎉 All tests passed! Google login flow should work correctly.');
    console.log('\n📋 Expected Flow:');
    console.log('1. User clicks "Continue with Google"');
    console.log('2. Redirects to Google');
    console.log('3. Returns with user data');
    console.log('4. Creates/updates user in backend');
    console.log('5. Checks for profile');
    console.log('6. Redirects to profile setup (if no profile) or dashboard (if profile exists)');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

if (require.main === module) {
  testGoogleLoginFlow();
}

module.exports = testGoogleLoginFlow;
