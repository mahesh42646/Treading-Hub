'use client';

import React, { useState, useEffect } from 'react';
import Header from '../user/components/Header';
import Footer from '../user/components/Footer';
import { FaCheck, FaTimes } from 'react-icons/fa';

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
      
      <div className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan that fits your trading needs. All plans include our core features with different limits and benefits.
          </p>
        </div>

        {error && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="max-w-7xl mx-auto">
          {plans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <div key={plan._id} className={`relative bg-white rounded-lg shadow-lg overflow-hidden ${
                  plan.isActive ? 'border-2 border-blue-500' : 'border border-gray-200'
                }`}>
                  {plan.isActive && (
                    <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-sm font-medium">
                      Popular
                    </div>
                  )}
                  
                  <div className="p-8">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <div className="mb-4">
                        <span className="text-4xl font-bold text-blue-600">₹{plan.price}</span>
                        <span className="text-gray-500">/{plan.duration} days</span>
                      </div>
                      <p className="text-gray-600">{plan.description}</p>
                    </div>

                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Max Users:</span>
                        <span className="font-medium">{plan.maxUsers}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Max Transactions:</span>
                        <span className="font-medium">{plan.maxTransactions}</span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-8">
                      <h4 className="font-medium text-gray-900">Features:</h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <FaCheck className="mr-2 text-green-500" size={14} />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                        plan.isActive
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                      disabled={!plan.isActive}
                    >
                      {plan.isActive ? 'Get Started' : 'Currently Unavailable'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <FaTimes size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Plans Available</h3>
              <p className="text-gray-600">Please check back later for available plans.</p>
            </div>
          )}
        </div>

        {/* Additional Information */}
        <div className="max-w-4xl mx-auto mt-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Why Choose Our Platform?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCheck className="text-blue-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Trading</h3>
                <p className="text-gray-600">
                  Your data and transactions are protected with industry-leading security measures.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCheck className="text-green-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">24/7 Support</h3>
                <p className="text-gray-600">
                  Get help whenever you need it with our round-the-clock customer support.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCheck className="text-purple-600" size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Analytics</h3>
                <p className="text-gray-600">
                  Make informed decisions with our comprehensive trading analytics and insights.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Plans;
