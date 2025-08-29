'use client';

import { useState, useEffect } from 'react';
import { getApiPath } from '../utils/apiPath';

interface LeadFormData {
  firstName: string;
  lastName: string;
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
    const checkUnlockedStatus = () => {
      const unlocked = localStorage.getItem('pricing-unlocked');
      setIsPricingUnlocked(unlocked === 'true');
    };

    // Initial check
    checkUnlockedStatus();
    setIsLoading(false);

    // Listen for storage changes (when pricing is unlocked in other components)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pricing-unlocked') {
        checkUnlockedStatus();
      }
    };

    // Listen for custom events (for same-window updates)
    const handlePricingUnlock = () => {
      checkUnlockedStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('pricing-unlocked', handlePricingUnlock);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('pricing-unlocked', handlePricingUnlock);
    };
  }, []);

  const unlockPricing = async (formData: LeadFormData) => {
    try {
      // Immediately update state to unlock pricing
      setIsPricingUnlocked(true);
      localStorage.setItem('pricing-unlocked', 'true');
      localStorage.setItem('lead-data', JSON.stringify(formData));
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('pricing-unlocked'));
      
      // Send lead data to API in background
      const response = await fetch(getApiPath('/api/leads'), { 
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