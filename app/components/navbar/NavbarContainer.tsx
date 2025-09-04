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

  useEffect(() => {
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
  }, []);

  // Function to smoothly scroll to sections on the home page
  const scrollToSection = (id: string) => {
    // Check if we're on the home page
    const isHomePage = window.location.pathname === '/';

    if (isHomePage) {
      // If we're on the home page, scroll to the section
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        // Close mobile menu after navigation
        setMobileMenuOpen(false);
      }
    } else {
      // If we're not on the home page, navigate to the home page with the section hash
      window.location.href = `/#${id}`;
      setMobileMenuOpen(false);
    }
  };

  const handleNavigation = (path: string) => {
    window.location.href = path;
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const toggleMobileMenu = () => {
    const newState = !mobileMenuOpen;
    console.log('Toggling mobile menu:', { current: mobileMenuOpen, new: newState });
    setMobileMenuOpen(newState);

    // Prevent body scrolling when menu is open
    if (newState) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  // Clean up body overflow when component unmounts or menu state changes
  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Ensure body overflow is managed properly when menu closes
  useEffect(() => {
    if (!mobileMenuOpen) {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
        <nav
          className="transition-all duration-300 max-w-[1120px] mx-auto bg-white/40 backdrop-blur-xl shadow-2xl shadow-black/20"
          style={{
            clipPath: 'polygon(0.5rem 0%, 100% 0%, 100% calc(100% - 0.5rem), calc(100% - 0.5rem) 100%, 0% 100%, 0% 0.5rem)'
          }}
          onClick={(e) => e.target === e.currentTarget && setMobileMenuOpen(false)}
        >
          <div className="container-custom py-3 md:py-4 flex items-center justify-between">
            {/* Desktop Navigation */}
            <DesktopNav 
              handleNavigation={handleNavigation}
              scrollToSection={scrollToSection}
            />

            {/* Mobile Navigation */}
            <MobileNav 
              handleNavigation={handleNavigation}
              toggleMobileMenu={toggleMobileMenu}
            />
          </div>
        </nav>
      </div>

      {/* Mobile Menu Fullscreen Dropdown */}
      <MobileMenu 
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onNavigate={handleNavigation}
        scrollToSection={scrollToSection}
      />
    </>
  );
};

export default NavbarContainer;