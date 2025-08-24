const axios = require('axios');

const BASE_URL = 'http://localhost:9988';

async function testBackend() {
  console.log('🧪 Testing Trading Hub Backend...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    console.log('');

    // Test user creation endpoint
    console.log('2. Testing user creation endpoint...');
    const testUser = {
      uid: 'test-uid-' + Date.now(),
      email: 'test@example.com',
      emailVerified: true,
      isGoogleUser: false
    };

    const createResponse = await axios.post(`${BASE_URL}/api/users/create`, testUser);
    console.log('✅ User creation test passed:', createResponse.data.message);
    console.log('');

    // Test profile fetch endpoint
    console.log('3. Testing profile fetch endpoint...');
    const profileResponse = await axios.get(`${BASE_URL}/api/users/profile/${testUser.uid}`);
    console.log('✅ Profile fetch test passed:', profileResponse.data.message);
    console.log('');

    console.log('🎉 All tests passed! Backend is working correctly.');
    console.log('📡 API is ready to handle requests from the frontend.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.log('🔧 Please check if the server is running and MongoDB is connected.');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testBackend();
}

module.exports = testBackend;
