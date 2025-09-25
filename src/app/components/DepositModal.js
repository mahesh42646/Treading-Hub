'use client';

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { buildApiUrl } from '../../utils/config';

const DepositModal = ({ show, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      
      // Create Razorpay order
      const orderResponse = await fetch(buildApiUrl('/wallet/razorpay-order'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount) * 100, // Convert to paise
          currency: 'INR'
        })
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create payment order');
      }

      const orderData = await orderResponse.json();

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Xfunding Flow',
        description: 'Wallet Deposit',
        order_id: orderData.id,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await fetch(buildApiUrl('/wallet/razorpay-verify'), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${await user.getIdToken()}`
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            if (verifyResponse.ok) {
              const verifyData = await verifyResponse.json();
              
              // Process deposit
              const depositResponse = await fetch(buildApiUrl('/wallet/deposit'), {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${await user.getIdToken()}`
                },
                body: JSON.stringify({
                  uid: user.uid,
                  amount: verifyData.amount,
                  paymentId: response.razorpay_payment_id
                })
              });

              if (depositResponse.ok) {
                alert('Deposit successful!');
                setAmount('');
                onClose();
                if (onSuccess) onSuccess();
              } else {
                alert('Deposit processing failed');
              }
            } else {
              alert('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: user?.displayName || 'User',
          email: user?.email,
        },
        theme: {
          color: '#3B82F6'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Deposit error:', error);
      alert('Failed to initiate deposit');
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Deposit to Wallet</h5>
            <button 
              type="button" 
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Amount (₹)</label>
              <input
                type="number"
                className="form-control"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
              />
            </div>
            <div className="alert alert-info">
              <small>
                <i className="bi bi-info-circle me-2"></i>
                Payment will be processed securely through Razorpay
              </small>
            </div>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleDeposit}
              disabled={loading || !amount}
            >
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositModal;
