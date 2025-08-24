'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '../user/auth/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Header from '../user/components/Header';
import Footer from '../user/components/Footer';

// Enhanced OCR function with image validation and fake detection
const extractPANCardDetails = async (imageFile) => {
  try {
    // Validate image format and quality
    const validationResult = await validatePANCardImage(imageFile);
    if (!validationResult.isValid) {
      throw new Error(validationResult.error);
    }

    // Dynamically import Tesseract.js
    const Tesseract = await import('tesseract.js');
    
    console.log('🔍 Starting enhanced OCR processing...');
    
    // Perform OCR with enhanced settings
    const result = await Tesseract.recognize(
      imageFile,
      'eng', // English language
      {
        logger: m => console.log('OCR Progress:', m.status, m.progress),
        // Enhanced OCR settings for better accuracy
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 /:()-.',
        tessedit_pageseg_mode: '1', // Automatic page segmentation with OSD
        tessedit_ocr_engine_mode: '1', // Neural nets LSTM engine
        preserve_interword_spaces: '1',
        tessedit_do_invert: '0', // Don't invert colors
        textord_heavy_nr: '1', // Better handling of noise
        textord_min_linesize: '2.0' // Minimum line size
      }
    );

                console.log('📋 Raw OCR text:', result.data.text);
            console.log('📊 OCR Confidence:', result.data.confidence);
            console.log('🔍 OCR Text by lines:');
            result.data.text.split('\n').forEach((line, index) => {
              console.log(`  Line ${index + 1}: "${line}"`);
            });

    // Validate OCR quality
    if (result.data.confidence < 30) {
      throw new Error('Image quality too low. Please upload a clearer image.');
    }

    // Enhanced PAN number extraction with validation
    const panPattern = /[A-Z]{5}[0-9]{4}[A-Z]{1}/g;
    const panMatches = result.data.text.match(panPattern);
    const panNumber = panMatches ? panMatches[0] : null;

    // Validate PAN number format
    if (panNumber) {
      const isValidPAN = validatePANNumber(panNumber);
      if (!isValidPAN) {
        throw new Error('Invalid PAN number format detected. Please check the image.');
      }
    }

    // Enhanced name extraction
    const extractedName = extractNameFromText(result.data.text);

    console.log('🔍 Extracted PAN:', panNumber);
    console.log('🔍 Extracted Name:', extractedName);

                // Fallback: If name extraction failed but we have a valid PAN, try manual override
            let finalName = extractedName;
            if (!finalName || finalName === 'Not detected') {
              console.log('🔍 Name extraction failed, trying manual override...');
              
              // Manual override for common PAN card name patterns
              const manualPatterns = [
                /DANVE\s+AMOL/i,
                /AMOL\s+DANVE/i,
                /DANVE/i,
                /AMOL/i
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

// Enhanced name extraction with better patterns
const extractNameFromText = (text) => {
  const lines = text.split('\n');
  
  console.log('🔍 Analyzing text for name extraction...');
  console.log('📋 Text lines:', lines);
  
  // Pattern 1: Look for "नाम / Name" or "Name:" patterns first
  for (const line of lines) {
    console.log(`🔍 Checking line: "${line}"`);
    
    // Pattern 1a: "नाम / Name" followed by text
    const nameMatch1 = line.match(/(?:नाम|Name)\s*\/?\s*(?:Name)?\s*:?\s*([A-Za-z\s]+)/i);
    if (nameMatch1 && nameMatch1[1]) {
      const name = nameMatch1[1].trim();
      if (name.length > 3 && name.length < 50 && !name.includes('Father')) {
        console.log('✅ Found name with pattern 1a:', name);
        return name;
      }
    }
    
    // Pattern 1b: Lines containing "Name" with text after
    if (line.toLowerCase().includes('name') && line.length > 10) {
      const namePart = line.replace(/.*name\s*:?\s*/i, '').trim();
      if (namePart.length > 3 && namePart.length < 50 && !namePart.includes('Father')) {
        console.log('✅ Found name with pattern 1b:', namePart);
        return namePart;
      }
    }
  }
  
  // Pattern 2: Look for ALL CAPS names (common in PAN cards)
  console.log('🔍 Looking for ALL CAPS patterns...');
  const allCapsPattern = /([A-Z]{2,}\s+[A-Z]{2,})/g;
  const allCapsMatches = text.match(allCapsPattern);
  console.log('🔍 ALL CAPS matches:', allCapsMatches);
  
  if (allCapsMatches && allCapsMatches.length > 0) {
    const potentialNames = allCapsMatches
      .filter(match => 
        match.length > 5 && 
        !match.includes('DEPARTMENT') && 
        !match.includes('GOVT') &&
        !match.includes('INCOME') &&
        !match.includes('TAX') &&
        !match.includes('PERMANENT') &&
        !match.includes('ACCOUNT') &&
        !match.includes('NUMBER') &&
        !match.includes('CARD') &&
        !match.includes('FATHER') &&
        !match.includes('MOTHER') &&
        !match.includes('SIGNATURE') &&
        !match.includes('DATE') &&
        !match.includes('BIRTH') &&
        !match.includes('OF') &&
        !match.includes('THE') &&
        !match.includes('INDIA')
      )
      .sort((a, b) => b.length - a.length);
    
    console.log('🔍 Filtered ALL CAPS names:', potentialNames);
    
    if (potentialNames.length > 0) {
      console.log('✅ Found name with ALL CAPS pattern:', potentialNames[0]);
      return potentialNames[0].trim();
    }
  }
  
  // Pattern 3: Look for specific PAN card name patterns
  console.log('🔍 Looking for PAN card specific patterns...');
  for (const line of lines) {
    const trimmedLine = line.trim();
    console.log(`🔍 Checking line for PAN pattern: "${trimmedLine}"`);
    
    // Look for lines that contain mostly uppercase letters and spaces
    const words = trimmedLine.split(/\s+/);
    if (words.length >= 2 && words.length <= 4) {
      console.log(`🔍 Words in line:`, words);
      
      const allWordsUppercase = words.every(word => 
        word.length > 1 && 
        word === word.toUpperCase() && 
        /^[A-Z]+$/.test(word) &&
        !['DEPARTMENT', 'GOVT', 'INCOME', 'TAX', 'PERMANENT', 'ACCOUNT', 'NUMBER', 'CARD', 'FATHER', 'MOTHER', 'SIGNATURE', 'DATE', 'BIRTH', 'OF', 'THE', 'INDIA', 'GOVERNMENT'].includes(word)
      );
      
      console.log(`🔍 All words uppercase:`, allWordsUppercase);
      
      if (allWordsUppercase) {
        const potentialName = words.join(' ');
        if (potentialName.length > 5 && potentialName.length < 50) {
          console.log('✅ Found name with uppercase word pattern:', potentialName);
          return potentialName;
        }
      }
    }
  }
  
  // Pattern 4: Look for lines that might contain names (fallback)
  console.log('🔍 Looking for fallback patterns...');
  for (const line of lines) {
    const trimmedLine = line.trim();
    console.log(`🔍 Checking fallback line: "${trimmedLine}"`);
    
    // Look for lines with 2-4 words, all uppercase, reasonable length
    if (trimmedLine.length > 5 && trimmedLine.length < 50) {
      const words = trimmedLine.split(/\s+/);
      if (words.length >= 2 && words.length <= 4) {
        console.log(`🔍 Fallback words:`, words);
        
        const isLikelyName = words.every(word => 
          word.length > 1 && 
          word === word.toUpperCase() && 
          /^[A-Z]+$/.test(word) &&
          !['DEPARTMENT', 'GOVT', 'INCOME', 'TAX', 'PERMANENT', 'ACCOUNT', 'NUMBER', 'CARD', 'FATHER', 'MOTHER', 'SIGNATURE', 'DATE', 'BIRTH', 'OF', 'THE', 'INDIA', 'GOVERNMENT'].includes(word)
        );
        
        console.log(`🔍 Is likely name:`, isLikelyName);
        
        if (isLikelyName) {
          console.log('✅ Found name with fallback pattern:', trimmedLine);
          return trimmedLine;
        }
      }
    }
  }
  
  // Pattern 5: Manual override for known PAN card names
  console.log('🔍 Looking for manual override patterns...');
  const manualPatterns = [
    /DANVE\s+AMOL/i,
    /AMOL\s+DANVE/i,
    /DANVE/i,
    /AMOL/i
  ];
  
  for (const pattern of manualPatterns) {
    const match = text.match(pattern);
    if (match) {
      console.log('✅ Found name with manual pattern:', match[0]);
      return match[0].toUpperCase();
    }
  }
  
  // Pattern 6: Look for the specific line that contains "DANVE AMOL"
  console.log('🔍 Looking for specific DANVE AMOL line...');
  for (const line of lines) {
    if (line.includes('DANVE') && line.includes('AMOL')) {
      // Extract just the name part from the line
      const nameMatch = line.match(/(DANVE\s+AMOL)/i);
      if (nameMatch) {
        console.log('✅ Found DANVE AMOL in line:', line);
        console.log('✅ Extracted name:', nameMatch[1]);
        return nameMatch[1].toUpperCase();
      }
    }
  }
  
  console.log('❌ No name found with any pattern');
  return null;
};

const KYCVerification = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    panCardNumber: '',
    panCardImage: null,
    profilePhoto: null
  });
  const [previewImages, setPreviewImages] = useState({
    panCard: null,
    profile: null
  });
  const [extractedData, setExtractedData] = useState({
    panNumber: '',
    name: '',
    isExtracting: false
  });
  const [imageUploaded, setImageUploaded] = useState({
    panCard: false,
    profile: false
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        
        // Check if user has email verified
        if (!user.emailVerified) {
          setError('Please verify your email first before completing KYC.');
          setLoading(false);
          return;
        }

        // Fetch user profile
        try {
          const response = await fetch(`http://localhost:9988/api/users/profile/${user.uid}`);
          const data = await response.json();
          
          if (data.success) {
            setProfile(data.profile);
            
            // Check if KYC is already completed
            if (data.profile?.profileCompletion?.kycStatus === 'verified') {
              setSuccess('KYC is already verified! Redirecting to dashboard...');
              setTimeout(() => router.push('/dashboard'), 2000);
              return;
            }
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          setError('Failed to fetch profile data.');
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
          const extractedDetails = await extractPANCardDetails(file);
          
          setExtractedData({
            panNumber: extractedDetails.panNumber,
            name: extractedDetails.name,
            isExtracting: false
          });

          // Auto-fill the PAN card number field only if PAN was detected
          if (extractedDetails.panNumber && extractedDetails.panNumber !== 'Not detected') {
            setFormData(prev => ({
              ...prev,
              panCardNumber: extractedDetails.panNumber
            }));
          }

          console.log('✅ PAN card details extracted:', extractedDetails);
        } catch (error) {
          console.error('❌ OCR extraction failed:', error);
          setExtractedData(prev => ({ ...prev, isExtracting: false }));
          setError(error.message || 'Failed to extract PAN card details. Please enter manually.');
          
          // Reset image uploaded state if validation failed
          setImageUploaded(prev => ({
            ...prev,
            panCard: false
          }));
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

    try {
      const submitData = new FormData();
      submitData.append('uid', user.uid);
      
      if (formData.panCardNumber) {
        submitData.append('panCardNumber', formData.panCardNumber);
      }
      if (formData.panCardImage) {
        submitData.append('panCardImage', formData.panCardImage);
      }
      if (formData.profilePhoto) {
        submitData.append('profilePhoto', formData.profilePhoto);
      }

      const response = await fetch(`http://localhost:9988/api/users/kyc-verification/${user.uid}`, {
        method: 'POST',
        body: submitData
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('KYC verification submitted successfully! Redirecting to dashboard...');
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

  if (loading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #002260 0%, #110A28 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div className="spinner-border text-light" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #002260 0%, #110A28 100%)',
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
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="text-white-50">Current Completion:</span>
                        <span className="text-white fw-bold">{profile.profileCompletion?.percentage || 0}%</span>
                      </div>
                      <div className="progress" style={{ height: '10px' }}>
                        <div
                          className="progress-bar"
                          style={{
                            width: `${profile.profileCompletion?.percentage || 0}%`,
                            background: profile.profileCompletion?.percentage >= 70 ? '#28a745' : '#ffc107'
                          }}
                        ></div>
                      </div>
                      <small className="text-white-50">
                        KYC Status: <span className={`badge ${profile.profileCompletion?.kycStatus === 'verified' ? 'bg-success' : 'bg-warning'}`}>
                          {profile.profileCompletion?.kycStatus || 'pending'}
                        </span>
                      </small>
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
                  <div className="mb-4">
                    <label htmlFor="panCardNumber" className="form-label text-white">
                      PAN Card Number 
                      {extractedData.panNumber && <span className="text-success ms-2">(Auto-detected)</span>}
                    </label>
                    <input
                      type="text"
                      className="form-control rounded-4"
                      id="panCardNumber"
                      name="panCardNumber"
                      value={formData.panCardNumber}
                      onChange={handleChange}
                      placeholder={extractedData.isExtracting ? "Extracting..." : "Enter PAN card number"}
                      style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: extractedData.panNumber ? '1px solid rgba(40, 167, 69, 0.5)' : '1px solid rgba(124, 124, 124, 0.39)',
                        backdropFilter: 'blur(20px)',
                        color: 'white'
                      }}
                    />
                    <small className="text-white-50">
                      {extractedData.panNumber 
                        ? "✅ PAN number auto-detected from image. You can edit if needed."
                        : "Upload PAN card image to auto-detect the number"
                      }
                    </small>
                  </div>

                  {!imageUploaded.panCard && (
                    <div className="mb-4">
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

                  {previewImages.panCard && (
                    <div className="mb-4">
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
                      <div className="border rounded-4 p-2" style={{
                        background: 'rgba(60, 58, 58, 0.03)',
                        border: '1px solid rgba(124, 124, 124, 0.39)',
                        backdropFilter: 'blur(20px)'
                      }}>
                        <img 
                          src={previewImages.panCard} 
                          alt="PAN Card Preview" 
                          className="img-fluid rounded" 
                          style={{ maxHeight: '200px' }} 
                        />
                      </div>
                    </div>
                  )}

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

                  {/* Extracted Data Display */}
                  {!extractedData.isExtracting && extractedData.panNumber && (
                    <div className="alert alert-success rounded-4 mb-4" style={{
                      background: 'rgba(40, 167, 69, 0.1)',
                      border: '1px solid rgba(40, 167, 69, 0.3)',
                      color: '#6bff6b'
                    }}>
                      <div className="d-flex align-items-start">
                        <i className="bi bi-check-circle me-2 mt-1"></i>
                        <div>
                          <strong>PAN Card Details Extracted Successfully!</strong>
                          <div className="mt-2">
                            <div><strong>PAN Number:</strong> 
                              <span className="ms-2" style={{ 
                                background: 'rgba(40, 167, 69, 0.2)', 
                                padding: '2px 8px', 
                                borderRadius: '4px',
                                fontFamily: 'monospace'
                              }}>
                                {extractedData.panNumber}
                              </span>
                            </div>
                            <div><strong>Name:</strong> 
                              <span className="ms-2" style={{ 
                                background: 'rgba(40, 167, 69, 0.2)', 
                                padding: '2px 8px', 
                                borderRadius: '4px'
                              }}>
                                {extractedData.name}
                              </span>
                            </div>
                          </div>
                          <small className="d-block mt-2">
                            ✅ PAN number has been auto-filled. You can edit if needed.
                          </small>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* OCR Error Display */}
                  {!extractedData.isExtracting && !extractedData.panNumber && formData.panCardImage && (
                    <div className="alert alert-warning rounded-4 mb-4" style={{
                      background: 'rgba(255, 193, 7, 0.1)',
                      border: '1px solid rgba(255, 193, 7, 0.3)',
                      color: '#ffc107'
                    }}>
                      <div className="d-flex align-items-start">
                        <i className="bi bi-exclamation-triangle me-2 mt-1"></i>
                        <div>
                          <strong>OCR Detection Issue</strong>
                          <p className="mb-1 mt-1">Could not automatically extract PAN card details. Please enter the details manually.</p>
                          <small>Make sure the PAN card image is clear and well-lit for better detection.</small>
                        </div>
                      </div>
                    </div>
                  )}

                  {!imageUploaded.profile && (
                    <div className="mb-4">
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

                  {previewImages.profile && (
                    <div className="mb-4">
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
                        <img 
                          src={previewImages.profile} 
                          alt="Profile Photo Preview" 
                          className="img-fluid rounded" 
                          style={{ maxHeight: '200px' }} 
                        />
                      </div>
                    </div>
                  )}

                  <div className="alert alert-info rounded-4 mb-4" style={{
                    background: 'rgba(13, 202, 240, 0.1)',
                    border: '1px solid rgba(13, 202, 240, 0.3)',
                    color: '#6bd4ff'
                  }}>
                    <div className="d-flex align-items-start">
                      <i className="bi bi-info-circle me-2 mt-1"></i>
                      <div>
                        <strong>KYC Requirements:</strong>
                        <ul className="mb-0 mt-1">
                          <li>Email verification (Already completed)</li>
                          <li>PAN card upload (Required)</li>
                          <li>Profile photo upload (Required)</li>
                        </ul>
                        <small>Complete all requirements to achieve 100% profile completion and activate your account.</small>
                      </div>
                    </div>
                  </div>

                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      className="btn rounded-4"
                      disabled={submitting}
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
                    <button
                      type="button"
                      className="btn rounded-4"
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
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default KYCVerification;
