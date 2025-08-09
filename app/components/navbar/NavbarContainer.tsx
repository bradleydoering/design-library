'use client';

import React, { useState, useEffect } from 'react';
import { cn } from "../../../lib/utils";
import DesktopNav from './DesktopNav';
import MobileNav from './MobileNav';
import MobileMenu from './MobileMenu';

interface NavbarContainerProps {
  onStepChange?: (step: "intro" | "customize") => void;
  currentStep?: "intro" | "customize" | "package";
  packageName?: string;
}

const NavbarContainer = ({ onStepChange, currentStep, packageName }: NavbarContainerProps) => {
  const [isSticky, setIsSticky] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Handle client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle screen size detection
  useEffect(() => {
    if (!isClient) return;
    
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;
    
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isClient]);

  // Function to smoothly scroll to sections on the home page
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      // Close mobile menu after navigation
      setMobileMenuOpen(false);
    }
  };

  const handleNavigation = (path: string) => {
    // For Next.js, we'll use window.location for now
    // In a real app, you'd use Next.js router
    if (path.startsWith('/')) {
      window.location.href = path;
    }
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    // Prevent body scrolling when menu is open
    if (!mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300",
        isSticky 
          ? "bg-white/80 backdrop-blur-md border-b border-white/25 shadow-sm" 
          : "bg-transparent"
      )}
      onClick={(e) => e.target === e.currentTarget && setMobileMenuOpen(false)}
    >
      <div className="container-custom mx-auto px-4 sm:px-6">
        {/* Only render after client-side hydration to prevent hydration mismatch */}
        {isClient && (
          <>
            {/* Always render both - they handle their own visibility */}
            <DesktopNav 
              handleNavigation={handleNavigation}
              scrollToSection={scrollToSection}
              onStepChange={onStepChange}
              currentStep={currentStep}
              packageName={packageName}
            />
            <MobileNav 
              handleNavigation={handleNavigation}
              toggleMobileMenu={toggleMobileMenu}
            />
          </>
        )}
      </div>

      {/* Mobile Menu Fullscreen Dropdown - only render on mobile */}
      {isClient && isMobile && (
        <MobileMenu 
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          onNavigate={handleNavigation}
          scrollToSection={scrollToSection}
        />
      )}
    </nav>
  );
};

export default NavbarContainer;