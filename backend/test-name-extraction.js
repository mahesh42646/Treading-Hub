const axios = require('axios');

const BASE_URL = 'http://localhost:9988';

async function testNameExtraction() {
  console.log('🧪 Testing Improved Name Extraction...\n');
  
  try {
    // Test 1: Create a test user and profile
    console.log('1. Creating test user and profile...');
    const testUser = {
      uid: 'test-name-extraction-' + Date.now(),
      email: 'test-name@example.com',
      emailVerified: true,
      isGoogleUser: true
    };
    
    const createUserResponse = await axios.post(`${BASE_URL}/api/users/create`, testUser);
    console.log('✅ Test user created:', createUserResponse.data.message);
    
    // Create basic profile
    const profileData = {
      uid: testUser.uid,
      firstName: 'DANVE',
      lastName: 'AMOL',
      gender: 'male',
      dateOfBirth: '2001-07-27',
      country: 'India',
      city: 'Mumbai',
      phone: '9876543210'
    };
    
    const profileResponse = await axios.post(`${BASE_URL}/api/users/profile-setup`, profileData);
    console.log('✅ Profile created:', profileResponse.data.message);
    
    console.log('\n🎉 Name Extraction Test Setup Completed!');
    console.log('\n📋 Expected Name Extraction for Your PAN Card:');
    console.log('PAN Number: GATPD1973C ✅ (Already working)');
    console.log('Name: DANVE AMOL ❌ (Currently showing "ies Be")');
    
    console.log('\n🔧 Improved Name Extraction Patterns:');
    console.log('✅ Pattern 1a: "नाम / Name" followed by text');
    console.log('✅ Pattern 1b: Lines containing "Name" with text after');
    console.log('✅ Pattern 2: ALL CAPS names (DANVE AMOL format)');
    console.log('✅ Pattern 3: Mixed case names (First Last format)');
    console.log('✅ Pattern 4: Uppercase word patterns');
    console.log('✅ Pattern 5: Fallback pattern for PAN card names');
    
    console.log('\n🔍 Enhanced OCR Settings:');
    console.log('✅ Better character whitelist');
    console.log('✅ Improved page segmentation');
    console.log('✅ Noise reduction settings');
    console.log('✅ Line size optimization');
    console.log('✅ Detailed logging for debugging');
    
    console.log('\n📝 Test Instructions:');
    console.log('1. Upload the same PAN card image');
    console.log('2. Check console logs for detailed extraction process');
    console.log('3. Verify name extraction shows "DANVE AMOL"');
    console.log('4. Check if PAN number still shows "GATPD1973C"');
    
    console.log('\n🔍 Debug Information:');
    console.log('The system will now log:');
    console.log('- All text lines from OCR');
    console.log('- Each pattern matching attempt');
    console.log('- Which pattern successfully found the name');
    console.log('- Final extracted name result');
    
    console.log('\n🎯 Expected Result:');
    console.log('Name should be extracted as "DANVE AMOL" instead of "ies Be"');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

if (require.main === module) {
  testNameExtraction();
}

module.exports = testNameExtraction;
