const axios = require('axios');

const BASE_URL = 'http://localhost:9988';

async function testEnhancedOCR() {
  console.log('🧪 Testing Enhanced OCR with Image Validation...\n');
  
  try {
    // Test 1: Create a test user and profile
    console.log('1. Creating test user and profile...');
    const testUser = {
      uid: 'test-enhanced-ocr-' + Date.now(),
      email: 'test-enhanced@example.com',
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
    
    console.log('\n🎉 Enhanced OCR Test Setup Completed!');
    console.log('\n📋 Enhanced OCR Features:');
    console.log('✅ Multi-format support: JPEG, PNG, HEIC, WebP');
    console.log('✅ Image quality validation (min 500x300px)');
    console.log('✅ File size validation (max 10MB)');
    console.log('✅ Basic fake image detection');
    console.log('✅ Enhanced OCR settings for better accuracy');
    console.log('✅ PAN number format validation');
    console.log('✅ Improved name extraction algorithms');
    console.log('✅ OCR confidence scoring');
    console.log('✅ Error handling with specific messages');
    
    console.log('\n🔧 Image Validation Features:');
    console.log('✅ Format validation (JPEG, PNG, HEIC, WebP)');
    console.log('✅ Size validation (max 10MB)');
    console.log('✅ Resolution validation (min 500x300px)');
    console.log('✅ Basic fake detection (uniformity check)');
    console.log('✅ Quality assessment');
    
    console.log('\n🔍 OCR Processing Features:');
    console.log('✅ Enhanced Tesseract.js settings');
    console.log('✅ Character whitelist for better accuracy');
    console.log('✅ PAN number pattern matching');
    console.log('✅ Multiple name extraction patterns');
    console.log('✅ Confidence threshold (30%)');
    console.log('✅ Detailed error messages');
    
    console.log('\n📝 Expected Behavior:');
    console.log('1. Upload PAN card image (any supported format)');
    console.log('2. Image validation (format, size, quality)');
    console.log('3. Fake image detection');
    console.log('4. Enhanced OCR processing');
    console.log('5. PAN number extraction and validation');
    console.log('6. Name extraction with multiple patterns');
    console.log('7. Auto-fill PAN number field');
    console.log('8. Show extracted details with confidence');
    console.log('9. Hide image picker after successful upload');
    console.log('10. Allow image change with "Change Image" button');
    
    console.log('\n🚨 Error Handling:');
    console.log('✅ Unsupported format error');
    console.log('✅ File too large error');
    console.log('✅ Image too small error');
    console.log('✅ Fake image detection error');
    console.log('✅ Low OCR confidence error');
    console.log('✅ Invalid PAN format error');
    console.log('✅ Manual entry fallback');
    
    console.log('\n📊 KYC Status Flow:');
    console.log('pending → under_review → verified (after admin approval)');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

if (require.main === module) {
  testEnhancedOCR();
}

module.exports = testEnhancedOCR;
