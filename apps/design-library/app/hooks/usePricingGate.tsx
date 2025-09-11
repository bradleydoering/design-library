'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  const isMounted = useRef(false);

  const checkUnlockedStatus = useCallback(() => {
    if (!isMounted.current) return; // Prevent state update on unmounted component
    const unlocked = localStorage.getItem('pricing-unlocked');
    setIsPricingUnlocked(unlocked === 'true');
  }, []);

  const handleStorageChange = useCallback((e: StorageEvent) => {
    if (e.key === 'pricing-unlocked') {
      checkUnlockedStatus();
    }
  }, [checkUnlockedStatus]);

  const handlePricingUnlock = useCallback(() => {
    checkUnlockedStatus();
  }, [checkUnlockedStatus]);

  useEffect(() => {
    isMounted.current = true;
    checkUnlockedStatus();
    if (isMounted.current) setIsLoading(false);

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('pricing-unlocked', handlePricingUnlock);

    return () => {
      isMounted.current = false;
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('pricing-unlocked', handlePricingUnlock);
    };
  }, [checkUnlockedStatus, handleStorageChange, handlePricingUnlock]);

  const unlockPricing = async (formData: LeadFormData) => {
    try {
      // Immediately update state to unlock pricing
      if (isMounted.current) setIsPricingUnlocked(true);
      localStorage.setItem('pricing-unlocked', 'true');
      localStorage.setItem('lead-data', JSON.stringify(formData));
      
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
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('pricing-unlocked'));
      
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