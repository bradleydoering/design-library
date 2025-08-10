'use client';

import React from 'react';
import { Button } from './ui/button';
import { usePricingGate } from '../hooks/usePricingGate';
import LeadCaptureModal from './LeadCaptureModal';

interface PricingDisplayProps {
  children: React.ReactNode;
  className?: string;
  ctaText?: string;
  showButton?: boolean;
  buttonClassName?: string;
}

const PricingDisplay = ({ 
  children, 
  className = '', 
  ctaText = "Get Instant Pricing for Your Bathroom Renovation",
  showButton = true,
  buttonClassName = ''
}: PricingDisplayProps) => {
  const {
    isPricingUnlocked,
    isModalOpen,
    isLoading,
    unlockPricing,
    openPricingGate,
    closePricingGate,
  } = usePricingGate();

  if (isLoading) {
    return (
      <div className={className}>
        <div className="animate-pulse bg-gray-200 rounded h-8 w-24"></div>
      </div>
    );
  }

  if (isPricingUnlocked) {
    return <div className={className}>{children}</div>;
  }

  return (
    <>
      <div className={`relative ${className}`}>
        {/* Blurred pricing content */}
        <div className="filter blur-sm select-none pointer-events-none">
          {children}
        </div>
        
        {/* Overlay with CTA */}
        <div className="absolute inset-0 flex items-center justify-center" style={{ filter: 'none', backdropFilter: 'none' }}>
          {showButton && (
            <Button
              variant="ghost"
              onClick={openPricingGate}
              className={`btn-coral cropped-corners font-medium text-sm px-4 py-2 !shadow-none !border-none !backdrop-blur-none transition-all ${buttonClassName}`}
              style={{ filter: 'none', backdropFilter: 'none', boxShadow: 'none' }}
            >
              {ctaText}
            </Button>
          )}
        </div>
      </div>

      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={isModalOpen}
        onClose={closePricingGate}
        onComplete={unlockPricing}
      />
    </>
  );
};

export default PricingDisplay;