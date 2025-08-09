'use client';

import { useState, useEffect } from 'react';

interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  city: string;
  projectDescription: string;
}

export const usePricingGate = () => {
  const [isPricingUnlocked, setIsPricingUnlocked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if pricing is already unlocked in localStorage
    const unlocked = localStorage.getItem('pricing-unlocked');
    if (unlocked === 'true') {
      setIsPricingUnlocked(true);
    }
    setIsLoading(false);
  }, []);

  const unlockPricing = async (formData: LeadFormData) => {
    try {
      // Immediately update state to unlock pricing
      setIsPricingUnlocked(true);
      localStorage.setItem('pricing-unlocked', 'true');
      localStorage.setItem('lead-data', JSON.stringify(formData));
      
      // Send lead data to API in background
      const response = await fetch('/api/leads', { 
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData) 
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit lead');
      }
      
      const result = await response.json();
      console.log('Lead submitted successfully:', result);
      
    } catch (error) {
      console.error('Error submitting lead:', error);
      // Pricing is already unlocked, just log the error
    }
  };

  const openPricingGate = () => {
    setIsModalOpen(true);
  };

  const closePricingGate = () => {
    setIsModalOpen(false);
  };

  return {
    isPricingUnlocked,
    isModalOpen,
    isLoading,
    unlockPricing,
    openPricingGate,
    closePricingGate,
  };
};