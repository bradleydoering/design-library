'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from "../ui/button";
import { X } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  scrollToSection: (id: string) => void;
}

const MobileMenu = ({ isOpen, onClose, onNavigate, scrollToSection }: MobileMenuProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white">
      <div className="flex flex-col h-full">
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          {/* Close button positioned at top right */}
          <div></div>
          <button
            onClick={onClose}
            className="p-2 text-navy hover:text-coral transition"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Logo at top */}
        <div className="flex justify-center py-6 border-b border-gray-100">
          <Image
            src="/logo-hr.png"
            alt="CloudReno"
            width={140}
            height={40}
            className="h-10 w-auto cursor-pointer"
            onClick={() => onNavigate('/')}
          />
        </div>

        {/* Menu content */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col space-y-1 p-4">
            {/* Services section */}
            <div className="border-b border-gray-100 pb-4 mb-4">
              <h3 className="text-navy text-lg font-semibold mb-3 font-space">
                Services
              </h3>
              <div className="flex flex-col space-y-2 pl-4">
                <button
                  onClick={() => onNavigate('/services/bathroom')}
                  className="text-navy text-base py-2 text-left hover:text-coral transition font-inter"
                >
                  Bathroom Renovations
                </button>
                <button
                  onClick={() => onNavigate('/services/kitchen')}
                  className="text-navy text-base py-2 text-left hover:text-coral transition font-inter"
                >
                  Kitchen Renovations
                </button>
                <button
                  onClick={() => onNavigate('/services/full-home')}
                  className="text-navy text-base py-2 text-left hover:text-coral transition font-inter"
                >
                  Full Home Renovations
                </button>
                <button
                  onClick={() => onNavigate('/services/interior-design')}
                  className="text-navy text-base py-2 text-left hover:text-coral transition font-inter"
                >
                  Interior Design
                </button>
                <button
                  onClick={() => onNavigate('/projects')}
                  className="text-navy text-base py-2 text-left hover:text-coral transition font-inter"
                >
                  View Our Projects
                </button>
              </div>
            </div>

            {/* Main navigation links */}
            <div className="flex flex-col space-y-1">
              <button
                onClick={() => onNavigate('/about')} 
                className="text-navy text-lg py-3 text-center hover:text-coral transition font-space font-medium"
              >
                About Us
              </button>
              
              <button
                onClick={() => scrollToSection('how-it-works')} 
                className="text-navy text-lg py-3 text-center hover:text-coral transition font-space font-medium"
              >
                How It Works
              </button>
              
              <button
                onClick={() => scrollToSection('calculator')} 
                className="text-navy text-lg py-3 text-center hover:text-coral transition font-space font-medium"
              >
                Cost Calculator
              </button>
              
              <button
                onClick={() => scrollToSection('dashboard')} 
                className="text-navy text-lg py-3 text-center hover:text-coral transition font-space font-medium"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Bottom CTA button */}
        <div className="p-4 border-t border-gray-100">
          <Button 
            onClick={() => onNavigate('/get-started')}
            className="btn-coral cropped-corners font-space font-semibold w-full py-3"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;