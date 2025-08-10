'use client';

import React from 'react';
// Button component removed - using plain HTML button to eliminate shadows
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
      </div>
      
      {/* Completely separate button container to avoid blur inheritance */}
      {showButton && (
        <div 
          className={`absolute inset-0 flex items-center justify-center ${className}`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10,
            boxShadow: 'none',
            filter: 'none',
            backdropFilter: 'none',
            background: 'transparent'
          }}
        >
          <button
            onClick={openPricingGate}
            className="font-medium text-sm text-white transition-opacity hover:opacity-90"
            style={{
              background: 'linear-gradient(90deg, #FF5C39 0%, #FF7348 100%)',
              border: 'none',
              borderRadius: '0',
              padding: '12px 16px',
              width: '100%',
              maxWidth: '300px',
              boxShadow: 'none',
              filter: 'none',
              backdropFilter: 'none',
              textShadow: 'none',
              outline: 'none',
              WebkitBoxShadow: 'none',
              MozBoxShadow: 'none',
              WebkitFilter: 'none',
              clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)'
            } as React.CSSProperties}
          >
            {ctaText}
          </button>
        </div>
      )}

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