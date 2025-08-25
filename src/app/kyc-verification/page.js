'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '../contexts/AuthContext';
import RouteGuard from '../components/RouteGuard';
import Header from '../user/components/Header';
import Footer from '../user/components/Footer';
import { userApi } from '../../services/api';

// Enhanced OCR function with image validation and fake detection
const extractPANCardDetails = async (imageFile, userProfileName = '') => {
  try {
    // Validate image format and quality
    const validationResult = await validatePANCardImage(imageFile);
    if (!validationResult.isValid) {
      throw new Error(validationResult.error);
    }

    // Dynamically import Tesseract.js
    const Tesseract = await import('tesseract.js');

    console.log('🔍 Starting enhanced OCR processing...');

    // Perform OCR with enhanced settings for PAN cards
    const result = await Tesseract.recognize(
      imageFile,
      'eng', // English language
      {
        logger: m => console.log('OCR Progress:', m.status, m.progress),
        // Enhanced OCR settings for better accuracy on PAN cards
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 /:()-.नामजन्मतिथिहस्ताक्षरस्थायीलेखासंख्याआयकरविभागभारतसरकारGOVTINDIA',
        tessedit_pageseg_mode: '6', // Uniform block of text
        tessedit_ocr_engine_mode: '1', // Neural nets LSTM engine
        preserve_interword_spaces: '1',
        tessedit_do_invert: '0', // Don't invert colors
        textord_heavy_nr: '1', // Better handling of noise
        textord_min_linesize: '2.0', // Minimum line size
        tessedit_create_txt: '1',
        tessedit_create_hocr: '0',
        tessedit_create_tsv: '0',
        tessedit_create_box: '0',
        tessedit_create_unlv: '0',
        tessedit_create_osd: '0'
      }
    );

    console.log('📋 Raw OCR text:', result.data.text);
    console.log('📊 OCR Confidence:', result.data.confidence);
    console.log('🔍 OCR Text by lines:');
    result.data.text.split('\n').forEach((line, index) => {
      console.log(`  Line ${index + 1}: "${line}"`);
    });

    // Debug: Check if OCR text contains expected patterns
    const hasPANPattern = /[A-Z]{5}[0-9]{4}[A-Z]{1}/.test(result.data.text);
    const hasNamePattern = /name/i.test(result.data.text) || /नाम/i.test(result.data.text);
    console.log('🔍 Debug - Has PAN pattern:', hasPANPattern);
    console.log('🔍 Debug - Has name pattern:', hasNamePattern);

    // Validate OCR quality
    if (result.data.confidence < 30) {
      throw new Error('Image quality too low. Please upload a clearer image.');
    }

    // Enhanced PAN number extraction with validation
    const panPattern = /[A-Z]{5}[0-9]{4}[A-Z]{1}/g;
    const panMatches = result.data.text.match(panPattern);
    let panNumber = panMatches ? panMatches[0] : null;

    // If no PAN found with standard pattern, try alternative patterns
    if (!panNumber) {
      // Look for PAN in different formats
      const alternativePatterns = [
        /[A-Z]{5}\s*[0-9]{4}\s*[A-Z]{1}/g, // PAN with spaces
        /[A-Z]{5}[0-9]{4}[A-Z]{1}/g, // Standard PAN
        /[A-Z]{5}[0-9]{4}[A-Z]/g // PAN without last character
      ];

      for (const pattern of alternativePatterns) {
        const matches = result.data.text.match(pattern);
        if (matches) {
          panNumber = matches[0].replace(/\s/g, ''); // Remove spaces
          console.log('✅ Found PAN with alternative pattern:', panNumber);
          break;
        }
      }
    }

    // Validate PAN number format
    if (panNumber) {
      const isValidPAN = validatePANNumber(panNumber);
      if (!isValidPAN) {
        throw new Error('Invalid PAN number format detected. Please check the image.');
      }
    }

    // Enhanced name extraction with user profile reference
    const extractedName = extractNameFromText(result.data.text, userProfileName);

    console.log('🔍 Extracted PAN:', panNumber);
    console.log('🔍 Extracted Name:', extractedName);

    // Fallback: If name extraction failed but we have a valid PAN, try manual override
    let finalName = extractedName;
    if (!finalName || finalName === 'Not detected') {
      console.log('🔍 Name extraction failed, trying manual override...');

      // Simple manual override: Look for any line with "Name" and extract
      const lines = result.data.text.split('\n');
      console.log('🔍 Manual override: Looking for name patterns...');

      for (const line of lines) {
        if (line.toLowerCase().includes('name')) {
          // Try to extract name after "Name"
          const nameMatch = line.match(/name\s*:?\s*([A-Za-z\s]+)/i);
          if (nameMatch && nameMatch[1]) {
            const extractedName = nameMatch[1].trim();

            // Basic validation
            if (extractedName.length >= 3 &&
              extractedName.length <= 100 &&
              /[A-Za-z]/.test(extractedName) &&
              !extractedName.includes('Father') &&
              !extractedName.includes('Mother') &&
              !extractedName.includes('Date') &&
              !extractedName.includes('Birth') &&
              !extractedName.includes('Signature') &&
              !extractedName.includes('Card') &&
              !extractedName.includes('Number') &&
              !extractedName.includes('Department') &&
              !extractedName.includes('Government') &&
              !extractedName.includes('India') &&
              !extractedName.includes('Tax') &&
              !extractedName.includes('Income') &&
              !extractedName.includes('Permanent') &&
              !extractedName.includes('Account')) {

              finalName = extractedName.toUpperCase();
              console.log('✅ Manual override found valid name:', finalName);
              break;
            }
          }
        }
      }

      // Manual patterns for name extraction
      const manualPatterns = [
        /[A-Z]{2,}\s+[A-Z]{2,}\s+[A-Z]{2,}/, // 3+ word names in caps
        /[A-Z]{2,}\s+[A-Z]{2,}/, // 2 word names in caps
        /[A-Z][a-z]+\s+[A-Z][a-z]+\s+[A-Z][a-z]+/ // 3+ word names with proper case
      ];

      for (const pattern of manualPatterns) {
        const match = result.data.text.match(pattern);
        if (match) {
          finalName = match[0].toUpperCase();
          console.log('✅ Manual override found name:', finalName);
          break;
        }
      }

      // If still no name, but we have a valid PAN, use a default
      if (!finalName || finalName === 'Not detected') {
        console.log('⚠️ No name found, using default');
        finalName = 'Name to be verified';
      }
    }

    return {
      panNumber: panNumber || 'Not detected',
      name: finalName,
      confidence: result.data.confidence,
      rawText: result.data.text,
      imageQuality: validationResult.quality
    };
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error(error.message || 'Failed to extract PAN card details');
  }
};

// Validate PAN card image format and quality
const validatePANCardImage = async (imageFile) => {
  try {
    // Check file format
    const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif', 'image/webp'];
    if (!allowedFormats.includes(imageFile.type)) {
      return {
        isValid: false,
        error: 'Unsupported image format. Please upload JPEG, PNG, HEIC, or WebP format.'
      };
    }

    // Check file size (max 10MB)
    if (imageFile.size > 10 * 1024 * 1024) {
      return {
        isValid: false,
        error: 'Image size too large. Please upload an image smaller than 10MB.'
      };
    }

    // Check minimum size (at least 500x300 pixels)
    const imageDimensions = await getImageDimensions(imageFile);
    if (imageDimensions.width < 500 || imageDimensions.height < 300) {
      return {
        isValid: false,
        error: 'Image too small. Please upload a higher resolution image (minimum 500x300 pixels).'
      };
    }

    // Basic fake image detection
    const fakeDetectionResult = await detectFakeImage(imageFile);
    if (fakeDetectionResult.isFake) {
      return {
        isValid: false,
        error: 'This appears to be an edited or AI-generated image. Please upload an original PAN card photo.'
      };
    }

    return {
      isValid: true,
      quality: fakeDetectionResult.quality,
      dimensions: imageDimensions
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Failed to validate image. Please try again.'
    };
  }
};

// Get image dimensions
const getImageDimensions = (imageFile) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      });
    };
    img.src = URL.createObjectURL(imageFile);
  });
};

// Basic fake image detection
const detectFakeImage = async (imageFile) => {
  try {
    // Convert image to canvas for analysis
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    return new Promise((resolve) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Basic quality checks
        let totalPixels = 0;
        let nonZeroPixels = 0;
        let edgePixels = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          totalPixels++;
          if (r > 0 || g > 0 || b > 0) {
            nonZeroPixels++;
          }

          // Simple edge detection
          if (i > 0 && i < data.length - 4) {
            const prevR = data[i - 4];
            const prevG = data[i - 3];
            const prevB = data[i - 2];

            const diff = Math.abs(r - prevR) + Math.abs(g - prevG) + Math.abs(b - prevB);
            if (diff > 50) {
              edgePixels++;
            }
          }
        }

        const quality = (nonZeroPixels / totalPixels) * 100;
        const edgeRatio = edgePixels / totalPixels;

        // Basic fake detection (very simple - can be enhanced)
        const isFake = quality < 10 || edgeRatio < 0.01; // Too uniform or too blurry

        resolve({
          isFake,
          quality: Math.round(quality),
          edgeRatio: Math.round(edgeRatio * 100)
        });
      };
      img.src = URL.createObjectURL(imageFile);
    });
  } catch (error) {
    return { isFake: false, quality: 50 };
  }
};

// Validate PAN number format
const validatePANNumber = (panNumber) => {
  // PAN format: 5 letters + 4 digits + 1 letter
  const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panPattern.test(panNumber);
};

// Enhanced name extraction with user profile reference
const extractNameFromText = (text, userProfileName = '') => {
  const lines = text.split('\n');

  console.log('🔍 Analyzing text for name extraction...');
  console.log('📋 Text lines:', lines);
  console.log('👤 User profile name for reference:', userProfileName);

  // Priority 1: Look for exact match with user's profile name
  if (userProfileName) {
    const userWords = userProfileName.toUpperCase().split(' ');
    console.log('🔍 Looking for exact match with user profile name:', userWords);

    for (const line of lines) {
      const lineUpper = line.toUpperCase();
      // Check if all user name words are present in the line
      const allWordsFound = userWords.every(word =>
        word.length > 2 && lineUpper.includes(word)
      );

      if (allWordsFound) {
        console.log(`✅ Found exact match with user profile name in line: "${line}"`);
        // Extract the full name from this line
        const nameMatch = line.match(/[A-Za-z\s]+/);
        if (nameMatch) {
          const extractedName = nameMatch[0].trim();
          if (extractedName.length >= 5 && extractedName.split(' ').length >= 2) {
            console.log(`✅ Extracted name from exact match: "${extractedName}"`);
            return extractedName.toUpperCase();
          }
        }
      }
    }
  }

  // Priority 2: Look for partial match with user's profile name
  if (userProfileName) {
    const userWords = userProfileName.toUpperCase().split(' ');
    console.log('🔍 Looking for partial match with user profile name:', userWords);

    for (const line of lines) {
      const lineUpper = line.toUpperCase();
      // Check if at least 2 user name words are present in the line
      const matchingWords = userWords.filter(word =>
        word.length > 2 && lineUpper.includes(word)
      );

      if (matchingWords.length >= 2) {
        console.log(`✅ Found partial match with user profile name in line: "${line}"`);
        console.log(`✅ Matching words:`, matchingWords);
        // Extract the full name from this line
        const nameMatch = line.match(/[A-Za-z\s]+/);
        if (nameMatch) {
          const extractedName = nameMatch[0].trim();
          if (extractedName.length >= 5 && extractedName.split(' ').length >= 2) {
            console.log(`✅ Extracted name from partial match: "${extractedName}"`);
            return extractedName.toUpperCase();
          }
        }
      }
    }
  }

  // Priority 3: Traditional name extraction from "Name" lines
  for (const line of lines) {
    console.log(`🔍 Checking line: "${line}"`);

    // Look for lines containing "Name" (case insensitive)
    if (line.toLowerCase().includes('name')) {
      console.log(`✅ Found line with "name": "${line}"`);

      // Try to extract name after "Name" or "नाम"
      let extractedName = null;

      // Pattern 1: "Name" followed by text
      const nameMatch1 = line.match(/name\s*:?\s*([A-Za-z\s]+)/i);
      if (nameMatch1 && nameMatch1[1]) {
        extractedName = nameMatch1[1].trim();
        console.log(`✅ Pattern 1 extracted: "${extractedName}"`);
      }

      // Pattern 2: "नाम" followed by text
      const nameMatch2 = line.match(/नाम\s*\/?\s*name\s*:?\s*([A-Za-z\s]+)/i);
      if (nameMatch2 && nameMatch2[1]) {
        extractedName = nameMatch2[1].trim();
        console.log(`✅ Pattern 2 extracted: "${extractedName}"`);
      }

      // Pattern 3: Remove everything before "Name" and take the rest
      if (!extractedName) {
        const nameIndex = line.toLowerCase().indexOf('name');
        if (nameIndex !== -1) {
          const afterName = line.substring(nameIndex + 4).trim();
          // Remove common suffixes and clean up
          const cleanedName = afterName
            .replace(/^[:\s]+/, '') // Remove leading colons and spaces
            .replace(/[:\s]+$/, '') // Remove trailing colons and spaces
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .trim();

          if (cleanedName.length > 0) {
            extractedName = cleanedName;
            console.log(`✅ Pattern 3 extracted: "${extractedName}"`);
          }
        }
      }

      // Validate the extracted name
      if (extractedName && extractedName.length > 0) {
        // Enhanced validation: should be reasonable length, contain letters, and look like a real name
        if (extractedName.length >= 3 &&
          extractedName.length <= 100 &&
          /[A-Za-z]/.test(extractedName) &&
          extractedName.split(' ').length >= 2 && // At least 2 words
          !extractedName.includes('Father') &&
          !extractedName.includes('Mother') &&
          !extractedName.includes('Date') &&
          !extractedName.includes('Birth') &&
          !extractedName.includes('Signature') &&
          !extractedName.includes('Card') &&
          !extractedName.includes('Number') &&
          !extractedName.includes('Department') &&
          !extractedName.includes('Government') &&
          !extractedName.includes('India') &&
          !extractedName.includes('Tax') &&
          !extractedName.includes('Income') &&
          !extractedName.includes('Permanent') &&
          !extractedName.includes('Account') &&
          !extractedName.includes('ies') && // Reject "ies Be"
          !extractedName.includes('Be') &&
          !extractedName.includes('fe') && // Reject "fe PE OF"
          !extractedName.includes('PE') &&
          !extractedName.includes('OF') &&
          !extractedName.includes('RHEE') && // Reject "RHEE SEER"
          !extractedName.includes('SEER')) {

          console.log(`✅ Valid name found: "${extractedName}"`);
          return extractedName.toUpperCase();
        } else {
          console.log(`❌ Invalid name format: "${extractedName}"`);
          // Continue looking for other lines with "name"
          continue;
        }
      }
    }
  }

  // Priority 4: Fallback - Look for any line that might contain a real name
  console.log('🔍 Fallback: Looking for any line with potential names...');
  for (const line of lines) {
    // Look for lines that contain common name patterns
    const words = line.trim().split(/\s+/);
    if (words.length >= 2 && words.length <= 5) {
      // Check if all words look like name parts (letters only, reasonable length)
      const allWordsValid = words.every(word =>
        word.length >= 2 &&
        word.length <= 20 &&
        /^[A-Za-z]+$/.test(word) &&
        !['DEPARTMENT', 'GOVT', 'INCOME', 'TAX', 'PERMANENT', 'ACCOUNT', 'NUMBER', 'CARD', 'FATHER', 'MOTHER', 'SIGNATURE', 'DATE', 'BIRTH', 'OF', 'THE', 'INDIA', 'GOVERNMENT', 'IES', 'BE', 'FE', 'PE', 'OF', 'RHEE', 'SEER'].includes(word.toUpperCase())
      );

      if (allWordsValid) {
        const potentialName = words.join(' ');
        if (potentialName.length >= 5 && potentialName.length <= 50) {
          console.log(`✅ Fallback found potential name: "${potentialName}"`);
          return potentialName.toUpperCase();
        }
      }
    }
  }

  console.log('❌ No valid name found in any line');
  return null;
};

const KYCVerification = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const [formData, setFormData] = useState({
    panCardNumber: '',
    panCardImage: null,
    profilePhoto: null,
    panHolderName: '' // New field for PAN holder name
  });
  const [previewImages, setPreviewImages] = useState({
    panCard: null,
    profile: null
  });
  const [extractedData, setExtractedData] = useState({
    panNumber: '',
    name: '',
    isExtracting: false,
    userProfileName: '' // Store user's profile name for reference
  });
  const [imageUploaded, setImageUploaded] = useState({
    panCard: false,
    profile: false
  });
  const [panValidation, setPanValidation] = useState({ checking: false, available: null, message: '' });

  useEffect(() => {
    if (profile) {
      // Get user's profile name for reference
      const userFullName = `${profile.firstName} ${profile.lastName}`.trim();
      setExtractedData(prev => ({
        ...prev,
        userProfileName: userFullName
      }));
      console.log('👤 User profile name for reference:', userFullName);

      // Check if KYC is already completed
      if (profile?.profileCompletion?.kycStatus === 'verified') {
        setSuccess('KYC is already verified! Redirecting to dashboard...');
        setTimeout(() => router.push('/dashboard'), 2000);
        return;
      }
    }
  }, [profile, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Check PAN number availability when PAN field changes
    if (name === 'panCardNumber' && value.length >= 10) {
      checkPanAvailability(value);
    } else if (name === 'panCardNumber') {
      setPanValidation({ checking: false, available: null, message: '' });
    }
  };

  // Check if PAN number is available
  const checkPanAvailability = async (panNumber) => {
    if (!panNumber || panNumber.length < 10) return;

    setPanValidation({ checking: true, available: null, message: '' });

    try {
      // For PAN validation, we'll check if it exists in any profile
      const data = await userApi.checkPan(panNumber);

      if (data.success) {
        if (data.exists) {
          setPanValidation({ 
            checking: false, 
            available: false, 
            message: 'This PAN number is already registered with another account' 
          });
        } else {
          setPanValidation({ 
            checking: false, 
            available: true, 
            message: 'PAN number is available' 
          });
        }
      } else {
        setPanValidation({ 
          checking: false, 
          available: null, 
          message: 'Error checking PAN number availability' 
        });
      }
    } catch (error) {
      setPanValidation({ 
        checking: false, 
        available: null, 
        message: 'Error checking PAN number availability' 
      });
    }
  };

  const handleImageChange = async (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      setFormData(prev => ({
        ...prev,
        [type]: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImages(prev => ({
          ...prev,
          [type === 'panCardImage' ? 'panCard' : 'profile']: e.target.result
        }));
      };
      reader.readAsDataURL(file);

      // Mark image as uploaded
      setImageUploaded(prev => ({
        ...prev,
        [type === 'panCardImage' ? 'panCard' : 'profile']: true
      }));

      // Auto-extract PAN card details if it's a PAN card image
      if (type === 'panCardImage') {
        setExtractedData(prev => ({ ...prev, isExtracting: true }));
        setError('');

        try {
          console.log('🔍 Extracting PAN card details...');
          const extractedDetails = await extractPANCardDetails(file, extractedData.userProfileName);

          setExtractedData(prev => ({
            panNumber: extractedDetails.panNumber,
            name: extractedDetails.name,
            isExtracting: false,
            userProfileName: prev.userProfileName // Preserve user profile name
          }));

          // Auto-fill the PAN card number field only if PAN was detected
          if (extractedDetails.panNumber && extractedDetails.panNumber !== 'Not detected') {
            setFormData(prev => ({
              ...prev,
              panCardNumber: extractedDetails.panNumber
            }));
          }

          // Auto-fill the PAN holder name field only if name was detected
          if (extractedDetails.name && extractedDetails.name !== 'Not detected') {
            setFormData(prev => ({
              ...prev,
              panHolderName: extractedDetails.name
            }));
          }

          console.log('✅ PAN card details extracted:', extractedDetails);
        } catch (error) {
          console.error('❌ OCR extraction failed:', error);
          setExtractedData(prev => ({ ...prev, isExtracting: false }));
          setError('OCR extraction failed. Please enter PAN card details manually. If the image is clear, try uploading again.');

          // Don't reset image uploaded state - let user try again or enter manually
          console.log('⚠️ OCR failed but keeping image for manual entry');
        }
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    // Validate required fields
    if (!formData.panCardImage) {
      setError('PAN card image is required');
      setSubmitting(false);
      return;
    }

    if (!formData.profilePhoto) {
      setError('Profile photo is required');
      setSubmitting(false);
      return;
    }

    if (!formData.panCardNumber || formData.panCardNumber.trim() === '') {
      setError('PAN card number is required. Please enter it manually if not auto-detected.');
      setSubmitting(false);
      return;
    }

    if (!formData.panHolderName || formData.panHolderName.trim() === '') {
      setError('PAN holder name is required. Please enter it manually if not auto-detected.');
      setSubmitting(false);
      return;
    }

    // Validate PAN number availability
    if (panValidation.available === false) {
      setError('Please use a different PAN number. This one is already registered with another account.');
      setSubmitting(false);
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('uid', user.uid);

      if (formData.panCardNumber) {
        submitData.append('panCardNumber', formData.panCardNumber);
      }
      if (formData.panHolderName) {
        submitData.append('panHolderName', formData.panHolderName);
      }
      if (formData.panCardImage) {
        submitData.append('panCardImage', formData.panCardImage);
      }
      if (formData.profilePhoto) {
        submitData.append('profilePhoto', formData.profilePhoto);
      }

      const data = await userApi.kycVerification(user.uid, submitData);

      if (data.success) {
        setSuccess('KYC verification submitted successfully! Redirecting to dashboard...');
        
        // Refresh profile in auth context
        await refreshProfile();
        
        setTimeout(() => router.push('/dashboard'), 2000);
      } else {
        setError(data.message || 'Failed to submit KYC verification');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      console.error('KYC verification error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <RouteGuard requireAuth={true} requireProfile={true}>
      <div style={{
        background: 'linear-gradient(135deg,rgb(0, 17, 48) 0%,rgb(34, 15, 96) 100%)',
        minHeight: '100vh'
      }}>
        <Header />
        <div className="container py-5 mt-5">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-10">
              <div className="card border-0 rounded-4" style={{
                background: 'rgba(60, 58, 58, 0.03)',
                border: '1px solid rgba(124, 124, 124, 0.39)',
                backdropFilter: 'blur(20px)',
                boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)'
              }}>
                <div className="card-body p-5">
                  <div className="text-center mb-4">
                    <h2 className="fw-bold text-white">
                      <span style={{ color: 'red', textDecoration: 'underline green' }}>KYC </span>
                      <span style={{ color: 'green', textDecoration: 'underline red' }}>Verification</span>
                    </h2>
                    <p className="text-white-50">Complete your KYC to activate your account</p>

                    {profile && (
                      <div className="mb-4">

                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="alert alert-danger rounded-4" style={{
                      background: 'rgba(220, 53, 69, 0.1)',
                      border: '1px solid rgba(220, 53, 69, 0.3)',
                      color: '#ff6b6b'
                    }}>
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="alert alert-success rounded-4" style={{
                      background: 'rgba(40, 167, 69, 0.1)',
                      border: '1px solid rgba(40, 167, 69, 0.3)',
                      color: '#6bff6b'
                    }}>
                      {success}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    {/* Image Uploads in one row (desktop) */}
                    <div className="row mb-4">
                      <div className="col-12 col-md-6 mb-3 mb-md-0">
                        {!imageUploaded.panCard && (
                          <div>
                            <label htmlFor="panCardImage" className="form-label text-white">PAN Card Image *</label>
                            <input
                              type="file"
                              className="form-control rounded-4"
                              id="panCardImage"
                              name="panCardImage"
                              onChange={(e) => handleImageChange(e, 'panCardImage')}
                              accept="image/jpeg,image/jpg,image/png,image/heic,image/heif,image/webp"
                              style={{
                                background: 'rgba(60, 58, 58, 0.03)',
                                border: '1px solid rgba(124, 124, 124, 0.39)',
                                backdropFilter: 'blur(20px)',
                                color: 'white'
                              }}
                            />
                            <small className="text-white-50">
                              Upload a clear image of your PAN card (JPEG, PNG, HEIC, WebP - Max 10MB, Min 500x300px)
                            </small>
                          </div>
                        )}
                      </div>

                      <div className="col-12 col-md-6">
                        {!imageUploaded.profile && (
                          <div>
                            <label htmlFor="profilePhoto" className="form-label text-white">Profile Photo *</label>
                            <input
                              type="file"
                              className="form-control rounded-4"
                              id="profilePhoto"
                              name="profilePhoto"
                              onChange={(e) => handleImageChange(e, 'profilePhoto')}
                              accept="image/jpeg,image/jpg,image/png,image/heic,image/heif,image/webp"
                              style={{
                                background: 'rgba(60, 58, 58, 0.03)',
                                border: '1px solid rgba(124, 124, 124, 0.39)',
                                backdropFilter: 'blur(20px)',
                                color: 'white'
                              }}
                            />
                            <small className="text-white-50">
                              Upload a clear profile photo (JPEG, PNG, HEIC, WebP - Max 10MB, Min 500x300px)
                            </small>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="row">
                      {previewImages.panCard && (
                        <div className="mb-4 col-lg-6">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <label className="form-label text-white mb-0">PAN Card Preview:</label>
                            <button
                              type="button"
                              className="btn btn-sm rounded-3"
                              onClick={() => {
                                setImageUploaded(prev => ({ ...prev, panCard: false }));
                                setFormData(prev => ({ ...prev, panCardImage: null }));
                                setPreviewImages(prev => ({ ...prev, panCard: null }));
                                setExtractedData({ panNumber: '', name: '', isExtracting: false });
                              }}
                              style={{
                                background: 'rgba(255, 193, 7, 0.2)',
                                border: '1px solid rgba(255, 193, 7, 0.5)',
                                color: '#ffc107'
                              }}
                            >
                              <i className="bi bi-arrow-clockwise me-1"></i>
                              Change Image
                            </button>
                          </div>
                          <div className=" rounded-4 p-2" style={{
                            background: 'rgba(60, 58, 58, 0.03)',
                            backdropFilter: 'blur(20px)'
                          }}>
                            <Image
                              src={previewImages.panCard}
                              alt="PAN Card Preview"
                              className="img-fluid rounded"
                              style={{ maxHeight: '250px' }}
                              width={400}
                              height={250}
                            />
                          </div>
                        </div>
                      )}

                      {previewImages.profile && (
                        <div className="mb-4 col-lg-6">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <label className="form-label text-white mb-0">Profile Photo Preview:</label>
                            <button
                              type="button"
                              className="btn btn-sm rounded-3"
                              onClick={() => {
                                setImageUploaded(prev => ({ ...prev, profile: false }));
                                setFormData(prev => ({ ...prev, profilePhoto: null }));
                                setPreviewImages(prev => ({ ...prev, profile: null }));
                              }}
                              style={{
                                background: 'rgba(255, 193, 7, 0.2)',
                                border: '1px solid rgba(255, 193, 7, 0.5)',
                                color: '#ffc107'
                              }}
                            >
                              <i className="bi bi-arrow-clockwise me-1"></i>
                              Change Image
                            </button>
                          </div>
                          <div className="border rounded-4 p-2" style={{
                            background: 'rgba(60, 58, 58, 0.03)',
                            border: '1px solid rgba(124, 124, 124, 0.39)',
                            backdropFilter: 'blur(20px)'
                          }}>
                            <Image
                              src={previewImages.profile}
                              alt="Profile Photo Preview"
                              className="img-fluid rounded"
                              style={{ maxHeight: '200px' }}
                              width={400}
                              height={200}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="row mb-4">
                      <div className="col-12 col-md-6 mb-3 mb-md-0">
                        <label htmlFor="panCardNumber" className="form-label text-white">
                          PAN Card Number
                          {extractedData.panNumber && <span className="text-success ms-2">(Auto-detected)</span>}
                        </label>
                        <input
                          type="text"
                          className={`form-control rounded-4 ${
                            panValidation.available === false ? 'is-invalid' : 
                            panValidation.available === true ? 'is-valid' : ''
                          }`}
                          id="panCardNumber"
                          name="panCardNumber"
                          value={formData.panCardNumber}
                          onChange={handleChange}
                          placeholder={extractedData.isExtracting ? "Extracting..." : "Enter PAN card number"}
                          style={{
                            background: 'rgba(60, 58, 58, 0.03)',
                            border: panValidation.available === false 
                              ? '1px solid rgba(220, 53, 69, 0.5)' 
                              : panValidation.available === true 
                              ? '1px solid rgba(25, 135, 84, 0.5)' 
                              : extractedData.panNumber 
                              ? '1px solid rgba(40, 167, 69, 0.5)' 
                              : '1px solid rgba(124, 124, 124, 0.39)',
                            backdropFilter: 'blur(10px)',
                            color: 'white'
                          }}
                        />
                        {panValidation.checking && (
                          <small className="text-info">
                            <i className="bi bi-arrow-clockwise me-1"></i>
                            Checking PAN number availability...
                          </small>
                        )}
                        {panValidation.message && !panValidation.checking && (
                          <small className={`${
                            panValidation.available === false ? 'text-danger' : 
                            panValidation.available === true ? 'text-success' : 'text-warning'
                          }`}>
                            {panValidation.message}
                          </small>
                        )}
                        <small className="text-white-50">
                          {extractedData.panNumber
                            ? "✅ PAN number auto-detected from image. You can edit if needed."
                            : "Upload PAN card image to auto-detect the number"
                          }
                        </small>
                      </div>

                      <div className="col-12 col-md-6">
                        <label htmlFor="panHolderName" className="form-label text-white">
                          PAN Holder Name
                          {extractedData.name && <span className="text-success ms-2">(Auto-detected)</span>}
                        </label>
                        <input
                          type="text"
                          className="form-control rounded-4"
                          id="panHolderName"
                          name="panHolderName"
                          value={formData.panHolderName}
                          onChange={handleChange}
                          placeholder={extractedData.isExtracting ? "Extracting..." : "Enter PAN holder name"}
                          style={{
                            background: 'rgba(60, 58, 58, 0.03)',
                            border: extractedData.name ? '1px solid rgba(40, 167, 69, 0.5)' : '1px solid rgba(124, 124, 124, 0.39)',
                            backdropFilter: 'blur(20px)',
                            color: 'white'
                          }}
                        />
                        <small className="text-white-50">
                          {extractedData.name
                            ? "✅ PAN holder name auto-detected from image. You can edit if needed."
                            : "Upload PAN card image to auto-detect the name"
                          }
                        </small>
                      </div>
                    </div>

                    {/* OCR Processing Status */}
                    {extractedData.isExtracting && (
                      <div className="alert alert-info rounded-4 mb-4" style={{
                        background: 'rgba(13, 202, 240, 0.1)',
                        border: '1px solid rgba(13, 202, 240, 0.3)',
                        color: '#6bd4ff'
                      }}>
                        <div className="d-flex align-items-center">
                          <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                          <span>Extracting PAN card details...</span>
                        </div>
                      </div>
                    )}

                    {/* Submit and Back buttons in one row (desktop) */}
                    <div className="row">
                      <div className="col-12 col-md-6 mb-3 mb-md-0">
                        <button
                          type="submit"
                          className="btn rounded-4 w-100"
                          disabled={submitting || panValidation.available === false}
                          style={{
                            background: 'rgba(60, 58, 58, 0.03)',
                            border: '1px solid rgba(124, 124, 124, 0.39)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: 'inset 5px 4px 20px 1px rgba(105, 100, 100, 0.44)',
                            color: 'white'
                          }}
                        >
                          {submitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Submitting KYC...
                            </>
                          ) : (
                            'Submit KYC Verification'
                          )}
                        </button>
                      </div>
                      <div className="col-12 col-md-6">
                        <button
                          type="button"
                          className="btn rounded-4 w-100"
                          onClick={() => router.push('/dashboard')}
                          style={{
                            background: 'rgba(60, 58, 58, 0.03)',
                            border: '1px solid rgba(124, 124, 124, 0.39)',
                            backdropFilter: 'blur(20px)',
                            color: 'white'
                          }}
                        >
                          Back to Dashboard
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </RouteGuard>
  );
};

export default KYCVerification;
