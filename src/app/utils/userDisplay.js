// Utility functions for user display information
import Image from 'next/image';

export const getUserDisplayInfo = (user, profile) => {
  if (!user) {
    return {
      name: 'User',
      initials: 'U',
      avatar: null,
      email: '',
      displayType: 'none'
    };
  }

  // Get the correct upload URL based on environment
  const uploadBaseUrl = process.env.NEXT_PUBLIC_API_URL 
    ? `${process.env.NEXT_PUBLIC_API_URL}/uploads` 
    : 'http://localhost:9988/uploads';

  // Check if user has completed profile setup
  if (profile?.personalInfo?.firstName && profile?.personalInfo?.lastName) {
    const firstName = profile.personalInfo.firstName;
    const lastName = profile.personalInfo.lastName;
    
    return {
      name: `${firstName} ${lastName}`,
      initials: `${firstName[0]}${lastName[0]}`.toUpperCase(),
      avatar: profile.kyc?.profilePhoto ? `${uploadBaseUrl}/${profile.kyc.profilePhoto}` : null,
      email: user.email,
      displayType: 'profile'
    };
  }

  // Check if user has basic profile (old schema)
  if (profile?.firstName && profile?.lastName) {
    const firstName = profile.firstName;
    const lastName = profile.lastName;
    
    return {
      name: `${firstName} ${lastName}`,
      initials: `${firstName[0]}${lastName[0]}`.toUpperCase(),
      avatar: profile.profilePhoto ? `${uploadBaseUrl}/${profile.profilePhoto}` : null,
      email: user.email,
      displayType: 'basic_profile'
    };
  }

  // Check if user is Google user (has displayName from Firebase)
  if (user.displayName) {
    const displayName = user.displayName;
    const nameParts = displayName.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
    
    return {
      name: displayName,
      initials: `${firstName[0]}${lastName ? lastName[0] : ''}`.toUpperCase(),
      avatar: user.photoURL,
      email: user.email,
      displayType: 'google'
    };
  }

  // Fallback to email-based display
  const email = user.email;
  const emailName = email.split('@')[0]; // Get part before @
  
  return {
    name: emailName,
    initials: emailName[0].toUpperCase(),
    avatar: null,
    email: email,
    displayType: 'email'
  };
};

export const getUserAvatar = (user, profile, size = 50) => {
  // Priority order: KYC photo > Google photo > Default icon
  let avatarSrc = null;
  
  // Get the correct upload URL based on environment
  const uploadBaseUrl = process.env.NEXT_PUBLIC_API_URL 
    ? `${process.env.NEXT_PUBLIC_API_URL}/uploads` 
    : 'http://localhost:9988/uploads';
  
  // 1. Check for KYC profile photo first
  if (profile?.kyc?.profilePhoto) {
    avatarSrc = `${uploadBaseUrl}/${profile.kyc.profilePhoto}`;
    console.log('🎯 Selected KYC profile photo:', avatarSrc);
  }
  // 2. Check for basic profile photo (old schema)
  else if (profile?.profilePhoto) {
    avatarSrc = `${uploadBaseUrl}/${profile.profilePhoto}`;
    console.log('🎯 Selected basic profile photo:', avatarSrc);
  }
  // 3. Check for Google avatar from Firebase
  else if (user?.photoURL) {
    avatarSrc = user.photoURL;
    console.log('🎯 Selected Google photo:', avatarSrc);
  }
  else {
    console.log('🎯 No photo found, using default icon');
  }
  
  if (avatarSrc) {
    console.log('🖼️ Rendering avatar with src:', avatarSrc);
    return (
      <img  
        src={avatarSrc} 
        alt="Profile"
        className="rounded-circle"
        style={{ 
          width: `${size}px`, 
          height: `${size}px`, 
          objectFit: 'cover',
          display: 'block'
        }}
        onError={(e) => {
          console.log('❌ Image failed to load, falling back to default icon');
          // Replace the img with default icon
          const parent = e.target.parentElement;
          if (parent) {
            parent.innerHTML = `
              <div class="bg-primary rounded-circle d-flex align-items-center justify-content-center" 
                   style="width: ${size}px; height: ${size}px;">
                <svg width="${size * 0.6}" height="${size * 0.6}" viewBox="0 0 24 24" fill="white">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            `;
          }
        }}
      />
    );
  }
  
  // 4. Default icon (never show initials)
  return (
    <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" 
         style={{ width: `${size}px`, height: `${size}px` }}>
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="white">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
    </div>
  );
};

export const getProfileCompletionStatus = (profile) => {
  if (!profile) return { percentage: 0, status: 'Not Started' };
  
  const percentage = profile.status?.completionPercentage || 0;
  
  let status = 'Not Started';
  if (percentage >= 100) status = 'Complete';
  else if (percentage >= 75) status = 'Almost Complete';
  else if (percentage >= 50) status = 'In Progress';
  else if (percentage >= 25) status = 'Started';
  
  return { percentage, status };
};
