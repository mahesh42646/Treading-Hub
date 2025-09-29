'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { buildApiUrl } from '../../../utils/config';

export default function ReferralPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [referralData, setReferralData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const referralCode = params.code;
    
    if (!referralCode) {
      setError('Invalid referral link');
      setLoading(false);
      return;
    }

    validateReferralCode(referralCode);
  }, [params.code]);

  const validateReferralCode = async (code) => {
    try {
      setLoading(true);
      
      const response = await fetch(buildApiUrl(`/referral/validate/${code}`), {
        method: 'GET'
      });

      if (response.ok) {
        const data = await response.json();
        setReferralData(data);
        
        // Store referral code in localStorage for registration
        localStorage.setItem('referralCode', code);
        localStorage.setItem('referrerName', data.referrerName || '');
        
        
        
        // Immediately redirect to registration page with referral code in URL
        
        window.location.href = `/register?ref=${code}&referrer=${encodeURIComponent(data.referrerName || '')}`;
      } else {
        const errorData = await response.json();
        
        setError(errorData.message || 'Invalid or expired referral link');
      }
    } catch (error) {
      
      setError('Failed to validate referral link');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5>Validating referral link...</h5>
          <p className="text-muted">Please wait while we verify your referral link</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="bg-danger rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
               style={{ width: '80px', height: '80px' }}>
            <i className="bi bi-exclamation-triangle text-white fs-1"></i>
          </div>
          <h4 className="text-danger mb-3">Invalid Referral Link</h4>
          <p className="text-muted mb-4">{error}</p>
          <div className="d-flex gap-3 justify-content-center">
            <button 
              className="btn btn-primary"
              onClick={() => router.push('/register')}
            >
              Continue to Registration
            </button>
            <button 
              className="btn btn-outline-secondary"
              onClick={() => router.push('/')}
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="text-center">
        <div className="bg-success rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
             style={{ width: '80px', height: '80px' }}>
          <i className="bi bi-check-circle text-white fs-1"></i>
        </div>
        <h4 className="text-success mb-3">Welcome to Xfunding Flow!</h4>
        <p className="text-muted mb-2">
          You&apos;ve been invited by <strong>{referralData?.referrerName || 'a Xfunding Flow member'}</strong>
        </p>
        <p className="text-muted mb-4">
          Creating your account...
        </p>
        
        <div className="alert alert-info d-inline-block text-start">
          <h6 className="alert-heading">🎉 Special Benefits:</h6>
          <ul className="mb-0 small">
            <li>Get started with Xfunding Flow</li>
            <li>Complete your profile to unlock features</li>
            <li>Make your first deposit to activate account</li>
            <li>Your referrer will earn ₹200 bonus when you complete setup</li>
          </ul>
        </div>
        
        <div className="mt-4">
          <div className="spinner-border text-primary me-2" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="text-muted">Setting up your account...</span>
        </div>
      </div>
    </div>
  );
}
