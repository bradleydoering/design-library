'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from "../ui/button";
import { X, LogIn } from 'lucide-react';
import { getAssetPath } from "../../utils/apiPath";

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
            src={getAssetPath("/logo-hr.png")}
            alt="CloudReno"
            width={140}
            height={40}
            className="h-10 w-auto cursor-pointer"
            onClick={() => window.open('https://cloudrenovation.ca', '_blank')}
          />
        </div>

        {/* Menu content */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col space-y-1 p-4">
            {/* Services section */}
            <div className="border-b border-gray-100 pb-4 mb-4">
              <h3 className="text-navy text-lg font-semibold mb-3 font-inter">
                Services
              </h3>
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
            </div>

            {/* Main navigation links */}
            <div className="flex flex-col space-y-1">
              <button
                onClick={() => onNavigate('/about')} 
                className="text-navy text-lg py-3 text-center hover:text-coral transition font-inter font-medium"
              >
                About Us
              </button>
              
              <button
                onClick={() => window.open('https://cloudrenovation.ca/packages', '_blank')} 
                className="text-navy text-lg py-3 text-center hover:text-coral transition font-inter font-medium"
              >
                Packages
              </button>
              
              <div className="flex justify-center py-3">
                <button 
                  onClick={() => window.open('https://dashboard.cloudrenovation.ca', '_blank')}
                  className="text-navy hover:text-coral transition p-2 rounded-lg hover:bg-coral/10 flex items-center space-x-2"
                  aria-label="Login to Dashboard"
                >
                  <LogIn className="h-5 w-5" />
                  <span className="font-inter font-medium">Login</span>
                </button>
              </div>
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