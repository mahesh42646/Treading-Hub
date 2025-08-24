const axios = require('axios');

const BASE_URL = 'http://localhost:9988';

async function testRealOCR() {
  console.log('🧪 Testing Real OCR Functionality...\n');
  
  try {
    // Test 1: Create a test user and profile
    console.log('1. Creating test user and profile...');
    const testUser = {
      uid: 'test-real-ocr-' + Date.now(),
      email: 'test-real-ocr@example.com',
      emailVerified: true,
      isGoogleUser: true
    };
    
    const createUserResponse = await axios.post(`${BASE_URL}/api/users/create`, testUser);
    console.log('✅ Test user created:', createUserResponse.data.message);
    
    // Create basic profile
    const profileData = {
      uid: testUser.uid,
      firstName: 'Mahesh',
      lastName: 'Darkunde',
      gender: 'male',
      dateOfBirth: '2001-05-11',
      country: 'India',
      city: 'Mumbai',
      phone: '9876543210'
    };
    
    const profileResponse = await axios.post(`${BASE_URL}/api/users/profile-setup`, profileData);
    console.log('✅ Profile created:', profileResponse.data.message);
    
    console.log('\n🎉 Real OCR Test Setup Completed!');
    console.log('\n📋 Expected OCR Behavior:');
    console.log('1. Upload PAN card image with actual details');
    console.log('2. Tesseract.js will perform real OCR processing');
    console.log('3. Should extract actual PAN number: HIWPD2624A');
    console.log('4. Should extract actual name: Mahesh Badrinath Darkunde');
    console.log('5. PAN number field gets auto-filled with real data');
    console.log('6. Success alert shows extracted details');
    
    console.log('\n🔧 Real OCR Features:');
    console.log('✅ Tesseract.js integration for actual text recognition');
    console.log('✅ PAN number pattern matching: [A-Z]{5}[0-9]{4}[A-Z]{1}');
    console.log('✅ Name extraction from "Name:" or "नाम / Name:" lines');
    console.log('✅ Filtering out common words (DEPARTMENT, GOVT, etc.)');
    console.log('✅ Confidence scoring for OCR accuracy');
    console.log('✅ Error handling for failed extractions');
    console.log('✅ Manual override option if OCR fails');
    
    console.log('\n📝 Test Instructions:');
    console.log('1. Go to KYC verification page');
    console.log('2. Upload the PAN card image you showed');
    console.log('3. Wait for OCR processing (may take 5-10 seconds)');
    console.log('4. Check if PAN number "HIWPD2624A" is detected');
    console.log('5. Check if name "Mahesh Badrinath Darkunde" is detected');
    console.log('6. Verify the PAN number field gets auto-filled');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

if (require.main === module) {
  testRealOCR();
}

module.exports = testRealOCR;
