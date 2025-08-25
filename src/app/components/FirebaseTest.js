'use client';

import React, { useState } from 'react';
import { auth } from '../user/auth/firebase';
import { sendEmailVerification, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { userApi } from '../../services/api';

const FirebaseTest = () => {
  const [testEmail, setTestEmail] = useState('');
  const [testPassword, setTestPassword] = useState('test123456');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  const testFirebaseConnection = async () => {
    setLoading(true);
    setResult('Testing Firebase connection...');
    
    try {
      // Test if Firebase is properly initialized
      if (!auth) {
        setResult('❌ Firebase auth is not initialized');
        return;
      }
      
      setResult('✅ Firebase auth is initialized');
      
      // Test creating a user
      const email = `test-${Date.now()}@example.com`;
      const password = 'test123456';
      
      setResult('📧 Creating test user...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setCurrentUser(user);
      
      setResult(`✅ Test user created: ${user.uid}`);
      
      // Test sending verification email
      setResult('📧 Sending verification email...');
      await sendEmailVerification(user);
      
      setResult('✅ Verification email sent successfully! Check Firebase console for logs.');
      
    } catch (error) {
      setResult(`❌ Error: ${error.code} - ${error.message}`);
      console.error('Firebase test error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testWithCustomEmail = async () => {
    if (!testEmail) {
      setResult('❌ Please enter a test email address');
      return;
    }
    
    setLoading(true);
    setResult('Testing with custom email...');
    
    try {
      // Create user with custom email
      const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      const user = userCredential.user;
      setCurrentUser(user);
      
      setResult(`✅ User created: ${user.uid}`);
      
      // Send verification email
      await sendEmailVerification(user);
      setResult('✅ Verification email sent to your custom email!');
      
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setResult('⚠️ Email already exists. Trying to send verification email to existing user...');
        
        // Try to sign in and send verification
        try {
          const signInResult = await signInWithEmailAndPassword(auth, testEmail, testPassword);
          const existingUser = signInResult.user;
          
          if (!existingUser.emailVerified) {
            await sendEmailVerification(existingUser);
            setResult('✅ Verification email sent to existing user!');
          } else {
            setResult('✅ Email is already verified for this user');
          }
        } catch (signInError) {
          setResult(`❌ Sign in failed: ${signInError.message}`);
        }
      } else {
        setResult(`❌ Error: ${error.code} - ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const resendTestEmail = async () => {
    if (!currentUser) {
      setResult('❌ No user available. Please create a test user first.');
      return;
    }
    
    setLoading(true);
    setResult('Resending verification email...');
    
    try {
      await sendEmailVerification(currentUser);
      setResult('✅ Verification email resent successfully!');
    } catch (error) {
      setResult(`❌ Error resending: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h4>Firebase Email Verification Test</h4>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Test Email (optional):</label>
                <input
                  type="email"
                  className="form-control"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Enter your email to test verification"
                />
              </div>
              
              <div className="d-flex gap-2 mb-3">
                <button
                  className="btn btn-primary"
                  onClick={testFirebaseConnection}
                  disabled={loading}
                >
                  {loading ? 'Testing...' : 'Test Firebase Connection'}
                </button>
                
                {testEmail && (
                  <button
                    className="btn btn-success"
                    onClick={testWithCustomEmail}
                    disabled={loading}
                  >
                    {loading ? 'Testing...' : 'Test with Custom Email'}
                  </button>
                )}
                
                {currentUser && (
                  <button
                    className="btn btn-warning"
                    onClick={resendTestEmail}
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Resend Test Email'}
                  </button>
                )}
              </div>
              
              <div className="alert alert-info">
                <strong>Test Result:</strong>
                <pre className="mt-2 mb-0">{result}</pre>
              </div>
              
              <div className="alert alert-warning">
                <strong>Firebase Console Checklist:</strong>
                <ul className="mb-0 mt-2">
                  <li>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener">Firebase Console</a></li>
                  <li>Select project: <strong>tradinghub-43221</strong></li>
                  <li>Go to Authentication → Sign-in method</li>
                  <li>Enable Email/Password authentication</li>
                  <li>Go to Authentication → Templates</li>
                  <li>Configure verification email template</li>
                  <li>Go to Authentication → Settings</li>
                  <li>Add 'localhost' to authorized domains</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseTest;
