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
    <div className="fixed inset-0 z-50 bg-white" style={{
      backgroundImage: `radial-gradient(circle, #e5e7eb 1px, transparent 1px)`,
      backgroundSize: '20px 20px'
    }}>
      <div className="flex flex-col h-full">
        {/* Header with close button */}
        <div className="flex items-center justify-end p-4">
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 cropped-corners text-navy hover:text-coral transition"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Menu content - starts higher up */}
        <div className="flex flex-col items-center pt-8 px-6">
          <div className="flex flex-col space-y-4 w-full max-w-sm text-center">
            {/* Services section */}
            <div>
              <button
                onClick={() => setServicesOpen(!servicesOpen)}
                className={`w-full flex items-center justify-center gap-2 text-lg py-3 hover:text-coral transition font-inter cropped-corners px-4 ${
                  servicesOpen 
                    ? 'text-coral border-2 border-coral bg-transparent' 
                    : 'text-navy border-2 border-transparent'
                }`}
              >
                Services
                {servicesOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>

              {servicesOpen && (
                <div className="flex flex-col space-y-2 mt-3">
                  <button
                    onClick={() => window.open('https://cloudrenovation.ca/bathroom', '_blank')}
                    className="text-navy text-lg py-3 text-center hover:text-coral transition font-inter"
                  >
                    Bathroom Renovations
                  </button>
                  <button
                    onClick={() => window.open('https://cloudrenovation.ca/kitchen', '_blank')}
                    className="text-navy text-lg py-3 text-center hover:text-coral transition font-inter"
                  >
                    Kitchen Renovations
                  </button>
                  <button
                    onClick={() => window.open('https://cloudrenovation.ca/full-home', '_blank')}
                    className="text-navy text-lg py-3 text-center hover:text-coral transition font-inter"
                  >
                    Full Home Renovations
                  </button>
                  <button
                    onClick={() => window.open('https://cloudrenovation.ca/design', '_blank')}
                    className="text-navy text-lg py-3 text-center hover:text-coral transition font-inter"
                  >
                    Interior Design
                  </button>
                  <button
                    onClick={() => window.open('https://cloudrenovation.ca/our-work', '_blank')}
                    className="text-navy text-lg py-3 text-center hover:text-coral transition font-inter"
                  >
                    View Our Projects
                  </button>
                </div>
              )}
            </div>

            {/* Main navigation links - only show when services is closed */}
            {!servicesOpen && (
              <>
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
              </>
            )}

            {/* CTA button right after menu items */}
            <div className="mt-6">
              <Button 
                onClick={() => onNavigate('/get-started')}
                className="btn-coral cropped-corners font-medium w-full py-2 text-base"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;