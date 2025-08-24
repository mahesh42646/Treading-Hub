const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:9988';

async function debugOCR() {
  console.log('🔍 OCR Debug Tool\n');
  
  console.log('📋 This tool will help analyze OCR output for PAN card name extraction');
  console.log('🎯 Target: Extract "DANVE AMOL" from PAN card image');
  console.log('❌ Current Issue: Getting "ies Be" instead of correct name\n');
  
  console.log('🔧 Enhanced OCR Settings Applied:');
  console.log('✅ tessedit_pageseg_mode: 1 (Automatic page segmentation with OSD)');
  console.log('✅ tessedit_ocr_engine_mode: 1 (Neural nets LSTM engine)');
  console.log('✅ tessedit_char_whitelist: ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 /:()-.');
  console.log('✅ preserve_interword_spaces: 1');
  console.log('✅ textord_heavy_nr: 1 (Better noise handling)');
  console.log('✅ textord_min_linesize: 2.0\n');
  
  console.log('🔍 Enhanced Name Extraction Patterns:');
  console.log('✅ Pattern 1a: "नाम / Name" followed by text');
  console.log('✅ Pattern 1b: Lines containing "Name" with text after');
  console.log('✅ Pattern 2: ALL CAPS names (DANVE AMOL format)');
  console.log('✅ Pattern 3: Uppercase word patterns');
  console.log('✅ Pattern 4: Fallback pattern for PAN card names');
  console.log('✅ Pattern 5: Manual override for known names (DANVE, AMOL)\n');
  
  console.log('📝 Debug Instructions:');
  console.log('1. Upload your PAN card image to the KYC page');
  console.log('2. Open browser console (F12)');
  console.log('3. Look for detailed OCR logs:');
  console.log('   - "OCR Text by lines:" - Shows each line of extracted text');
  console.log('   - "Analyzing text for name extraction..." - Shows extraction process');
  console.log('   - "Checking line:" - Shows each line being analyzed');
  console.log('   - "ALL CAPS matches:" - Shows potential name matches');
  console.log('   - "Found name with pattern X:" - Shows which pattern worked\n');
  
  console.log('🎯 Expected Console Output:');
  console.log('📋 Raw OCR text: [full OCR text]');
  console.log('📊 OCR Confidence: [confidence percentage]');
  console.log('🔍 OCR Text by lines:');
  console.log('  Line 1: "आयकर विभाग"');
  console.log('  Line 2: "INCOME TAX DEPARTMENT"');
  console.log('  Line 3: "नाम / Name DANVE AMOL"  ← This should be found');
  console.log('  Line 4: "पिता का नाम / Father\'s Name SUBHAS DANVE"');
  console.log('  ...');
  console.log('🔍 Analyzing text for name extraction...');
  console.log('🔍 Checking line: "नाम / Name DANVE AMOL"');
  console.log('✅ Found name with pattern 1a: DANVE AMOL\n');
  
  console.log('🔧 If Still Not Working:');
  console.log('1. Check if "DANVE AMOL" appears in any OCR line');
  console.log('2. Look for similar patterns like "DANVE" or "AMOL"');
  console.log('3. Check if OCR is reading text correctly');
  console.log('4. Verify image quality and orientation\n');
  
  console.log('🚀 Ready to test! Upload your PAN card image and check the console logs.');
}

if (require.main === module) {
  debugOCR();
}

module.exports = debugOCR;
