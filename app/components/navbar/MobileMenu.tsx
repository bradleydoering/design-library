'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from "../ui/button";
import { X, ChevronDown, ChevronRight } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  scrollToSection: (id: string) => void;
}

const MobileMenu = ({ isOpen, onClose, onNavigate, scrollToSection }: MobileMenuProps) => {
  const [servicesOpen, setServicesOpen] = useState(false);
  console.log('MobileMenu render:', { isOpen });
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

        {/* Menu content */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col space-y-1 p-4">
            {/* Services section */}
            <div className="border-b border-gray-100 pb-4 mb-4">
              <button
                onClick={() => setServicesOpen(!servicesOpen)}
                className="w-full flex items-center justify-center gap-2 text-navy text-lg py-3 hover:text-coral transition font-inter"
              >
                Services
                {servicesOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>

              {servicesOpen && (
                <div className="flex flex-col space-y-2 pl-4">
                  <button
                    onClick={() => window.open('https://cloudrenovation.ca/bathroom', '_blank')}
                    className="text-navy text-base py-2 text-left hover:text-coral transition font-inter"
                  >
                    Bathroom Renovations
                  </button>
                  <button
                    onClick={() => window.open('https://cloudrenovation.ca/kitchen', '_blank')}
                    className="text-navy text-base py-2 text-left hover:text-coral transition font-inter"
                  >
                    Kitchen Renovations
                  </button>
                  <button
                    onClick={() => window.open('https://cloudrenovation.ca/full-home', '_blank')}
                    className="text-navy text-base py-2 text-left hover:text-coral transition font-inter"
                  >
                    Full Home Renovations
                  </button>
                  <button
                    onClick={() => window.open('https://cloudrenovation.ca/design', '_blank')}
                    className="text-navy text-base py-2 text-left hover:text-coral transition font-inter"
                  >
                    Interior Design
                  </button>
                  <button
                    onClick={() => window.open('https://cloudrenovation.ca/our-work', '_blank')}
                    className="text-navy text-base py-2 text-left hover:text-coral transition font-inter"
                  >
                    View Our Projects
                  </button>
                </div>
              )}
            </div>

            {/* Main navigation links */}
            <div className="flex flex-col space-y-1">
              <button
                onClick={() => onNavigate('/about')} 
                className="text-navy text-lg py-3 text-center hover:text-coral transition font-inter"
              >
                About Us
              </button>
              
              <button
                onClick={() => window.open('https://cloudrenovation.ca/packages', '_blank')} 
                className="text-navy text-lg py-3 text-center hover:text-coral transition font-inter"
              >
                Packages
              </button>
            </div>
          </div>
        </div>

        {/* Bottom CTA button */}
        <div className="p-4 border-t border-gray-100">
          <Button 
            onClick={() => onNavigate('/get-started')}
            className="btn-coral cropped-corners font-medium w-full py-3"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;