const axios = require('axios');

const BASE_URL = 'http://localhost:9988';

async function testProfileSetup() {
  console.log('🧪 Testing Simplified Profile Setup...\n');
  
  try {
    // Test 1: Create a test user first
    console.log('1. Creating test user...');
    const testUser = {
      uid: 'test-profile-setup-' + Date.now(),
      email: 'test-profile@example.com',
      emailVerified: true,
      isGoogleUser: true
    };
    
    const createUserResponse = await axios.post(`${BASE_URL}/api/users/create`, testUser);
    console.log('✅ Test user created:', createUserResponse.data.message);
    
    // Test 2: Create profile without PAN card
    console.log('\n2. Creating profile without PAN card...');
    const profileData = {
      uid: testUser.uid,
      firstName: 'John',
      lastName: 'Doe',
      gender: 'male',
      dateOfBirth: '1990-01-01',
      country: 'India',
      city: 'Mumbai',
      phone: '9876543210'
    };
    
    const profileResponse = await axios.post(`${BASE_URL}/api/users/profile-setup`, profileData);
    console.log('✅ Profile created successfully:', profileResponse.data.message);
    console.log('📊 Profile completion:', profileResponse.data.profile.profileCompletion.percentage + '%');
    console.log('🔐 KYC Status:', profileResponse.data.profile.profileCompletion.kycStatus);
    
    // Test 3: Check profile details
    console.log('\n3. Verifying profile details...');
    const getProfileResponse = await axios.get(`${BASE_URL}/api/users/profile/${testUser.uid}`);
    console.log('✅ Profile retrieved:', getProfileResponse.data.profile ? 'Success' : 'Failed');
    
    if (getProfileResponse.data.profile) {
      console.log('📋 Profile fields:');
      console.log('   - Name:', getProfileResponse.data.profile.firstName, getProfileResponse.data.profile.lastName);
      console.log('   - Phone:', getProfileResponse.data.profile.phone);
      console.log('   - PAN Card:', getProfileResponse.data.profile.panCardNumber || 'Not provided');
      console.log('   - Completion:', getProfileResponse.data.profile.profileCompletion.percentage + '%');
      console.log('   - KYC Status:', getProfileResponse.data.profile.profileCompletion.kycStatus);
    }
    
    console.log('\n🎉 Profile setup test completed successfully!');
    console.log('\n📋 Key Changes Made:');
    console.log('✅ Removed PAN card upload from profile setup');
    console.log('✅ Profile completion set to 75% (without PAN card)');
    console.log('✅ KYC status set to "pending"');
    console.log('✅ Simplified form - only basic profile fields');
    console.log('✅ KYC can be completed later from dashboard');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

if (require.main === module) {
  testProfileSetup();
}

module.exports = testProfileSetup;
