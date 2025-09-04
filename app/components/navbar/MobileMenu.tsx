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
        <div className="flex items-center justify-end p-6">
          <button
            onClick={onClose}
            className="p-3 bg-gray-100 cropped-corners text-navy hover:text-coral transition"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Menu content - centered */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="flex flex-col space-y-8 w-full max-w-sm text-center">
            {/* Services section */}
            <div>
              <button
                onClick={() => setServicesOpen(!servicesOpen)}
                className={`w-full flex items-center justify-center gap-2 text-2xl py-4 hover:text-coral transition font-inter cropped-corners px-6 ${
                  servicesOpen 
                    ? 'text-coral border-2 border-coral bg-transparent' 
                    : 'text-navy border-2 border-transparent'
                }`}
              >
                Services
                {servicesOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
              </button>

              {servicesOpen && (
                <div className="flex flex-col space-y-3 mt-6">
                  <button
                    onClick={() => window.open('https://cloudrenovation.ca/bathroom', '_blank')}
                    className="text-navy text-2xl py-4 text-center hover:text-coral transition font-inter"
                  >
                    Bathroom Renovations
                  </button>
                  <button
                    onClick={() => window.open('https://cloudrenovation.ca/kitchen', '_blank')}
                    className="text-navy text-2xl py-4 text-center hover:text-coral transition font-inter"
                  >
                    Kitchen Renovations
                  </button>
                  <button
                    onClick={() => window.open('https://cloudrenovation.ca/full-home', '_blank')}
                    className="text-navy text-2xl py-4 text-center hover:text-coral transition font-inter"
                  >
                    Full Home Renovations
                  </button>
                  <button
                    onClick={() => window.open('https://cloudrenovation.ca/design', '_blank')}
                    className="text-navy text-2xl py-4 text-center hover:text-coral transition font-inter"
                  >
                    Interior Design
                  </button>
                  <button
                    onClick={() => window.open('https://cloudrenovation.ca/our-work', '_blank')}
                    className="text-navy text-2xl py-4 text-center hover:text-coral transition font-inter"
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
                  className="text-navy text-2xl py-4 text-center hover:text-coral transition font-inter"
                >
                  About Us
                </button>
                
                <button
                  onClick={() => window.open('https://cloudrenovation.ca/packages', '_blank')} 
                  className="text-navy text-2xl py-4 text-center hover:text-coral transition font-inter"
                >
                  Packages
                </button>
              </>
            )}

            {/* CTA button right after menu items */}
            <div className="mt-8">
              <Button 
                onClick={() => onNavigate('/get-started')}
                className="btn-coral cropped-corners font-medium w-full py-4 text-lg"
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