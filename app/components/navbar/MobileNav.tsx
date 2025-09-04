'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from "../ui/button";
import { Menu, LogIn } from 'lucide-react';

interface MobileNavProps {
  handleNavigation: (path: string) => void;
  toggleMobileMenu: () => void;
}

const MobileNav = ({ handleNavigation, toggleMobileMenu }: MobileNavProps) => {
  return (
    <div className="md:hidden flex items-center justify-between w-full">
      {/* Logo */}
      <div className="flex items-center">
        <Image
          src="https://img.cloudrenovation.ca/Cloud%20Renovation%20logos/Cloud_Renovation_Logo-removebg-preview.png"
          alt="CloudReno"
          width={150}
          height={40}
          className="h-8 md:h-14 w-auto cursor-pointer"
          onClick={() => window.open('https://cloudrenovation.ca', '_blank')}
        />
      </div>

      {/* Right side - CTA button, login, and hamburger menu */}
      <div className="md:hidden flex items-center space-x-2">
        <Button 
          onClick={() => handleNavigation('/get-started')}
          className="btn-coral px-3 py-2 text-sm"
          aria-label="Get started"
        >
          Get started
        </Button>
        
        <button 
          onClick={() => window.open('https://dashboard.cloudrenovation.ca', '_blank')}
          className="p-1 text-navy rounded-xl hover:text-coral hover:bg-coral/10 transition-colors"
          aria-label="Login to Dashboard"
        >
          <LogIn className="h-5 w-5" />
        </button>
        
        <button
          onClick={toggleMobileMenu}
          className="p-1 text-navy"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default MobileNav;