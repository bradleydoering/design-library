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
    <div className="md:hidden flex items-center justify-between py-3 md:py-4">
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

      {/* Right side - CTA button and hamburger menu */}
      <div className="md:hidden flex items-center space-x-2">
        <Button 
          onClick={() => handleNavigation('/get-started')}
          className="btn-coral cropped-corners font-medium text-sm px-3 py-2"
          aria-label="Get started"
        >
          Get started
        </Button>
        
        <button
          onClick={toggleMobileMenu}
          className="p-2 text-navy hover:text-coral transition"
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default MobileNav;