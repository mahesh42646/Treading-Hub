'use client';

import React, { useState, useEffect } from 'react';
import Header from '../user/components/Header';
import Footer from '../user/components/Footer';
import { FaCheck, FaTimes } from 'react-icons/fa';
import ChoosePlanSection from '../components/ChoosePlanSection';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/plans`);
      
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
      } else {
        setError('Failed to load plans');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <ChoosePlanSection />

      <Footer />
    </div>
  );
};

export default Plans;
