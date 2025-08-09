'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from "../ui/button";
import { LogIn } from 'lucide-react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../ui/navigation-menu";

interface DesktopNavProps {
  handleNavigation: (path: string) => void;
  scrollToSection: (id: string) => void;
  onStepChange?: (step: "intro" | "customize") => void;
  currentStep?: "intro" | "customize" | "package";
  packageName?: string;
}

const DesktopNav = ({ handleNavigation, scrollToSection, onStepChange, currentStep, packageName }: DesktopNavProps) => {
  return (
    <div className="hidden md:flex items-center justify-between py-3 md:py-4">
      {/* Logo */}
      <div className="flex items-center">
        <Image
          src="https://img.cloudrenovation.ca/Cloud%20Renovation%20logos/Cloud_Renovation_Logo-removebg-preview.png"
          alt="CloudReno"
          width={180}
          height={50}
          className="h-8 md:h-14 w-auto cursor-pointer"
          onClick={() => window.open('https://cloudrenovation.ca', '_blank')}
        />
      </div>

      {/* Navigation Menu */}
      <div className="hidden md:flex space-x-6 items-center">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-navy hover:text-coral transition font-inter">
                Services
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="p-6 w-[500px] bg-white">
                  {/* Top row: Left bathroom + Right services */}
                  <div className="grid grid-cols-[1fr_1fr] gap-4 mb-4">
                    {/* Left column - Bathroom (large) */}
                    <NavigationMenuLink asChild>
                      <button
                        onClick={() => window.open('https://cloudrenovation.ca/bathroom', '_blank')}
                        className="flex flex-col justify-end cropped-corners bg-gradient-to-br from-coral to-coral-light p-6 no-underline outline-none focus:shadow-md text-left h-48 hover:from-coral-dark hover:to-coral transition-all"
                      >
                        <div className="text-lg font-medium font-inter text-white">
                          Bathroom Renovations
                        </div>
                        <p className="text-sm leading-tight text-white/90 font-inter mt-2">
                          Transform your bathroom into a modern sanctuary with our expert renovation services.
                        </p>
                      </button>
                    </NavigationMenuLink>

                    {/* Right column - 3 services stacked */}
                    <div className="grid grid-rows-3 gap-2 h-48">
                      <NavigationMenuLink asChild>
                        <button
                          onClick={() => window.open('https://cloudrenovation.ca/kitchen', '_blank')}
                          className="flex flex-col justify-center rounded-md p-4 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-left h-full"
                        >
                          <div className="text-sm font-medium leading-none font-inter">Kitchen</div>
                          <p className="text-xs leading-snug text-muted-foreground font-inter mt-1">
                            Modern kitchen renovations
                          </p>
                        </button>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <button
                          onClick={() => window.open('https://cloudrenovation.ca/full-home', '_blank')}
                          className="flex flex-col justify-center rounded-md p-4 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-left h-full"
                        >
                          <div className="text-sm font-medium leading-none font-inter">Full Home</div>
                          <p className="text-xs leading-snug text-muted-foreground font-inter mt-1">
                            Complete home renovations
                          </p>
                        </button>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <button
                          onClick={() => window.open('https://cloudrenovation.ca/design', '_blank')}
                          className="flex flex-col justify-center rounded-md p-4 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-left h-full"
                        >
                          <div className="text-sm font-medium leading-none font-inter">Interior Design</div>
                          <p className="text-xs leading-snug text-muted-foreground font-inter mt-1">
                            Professional design services
                          </p>
                        </button>
                      </NavigationMenuLink>
                    </div>
                  </div>
                  
                  {/* Bottom row - View All Projects */}
                  <NavigationMenuLink asChild>
                    <button
                      onClick={() => window.open('https://cloudrenovation.ca/our-work', '_blank')}
                      className="w-full rounded-md p-4 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-center border-t border-gray-100 pt-4"
                    >
                      <div className="text-sm font-medium leading-none font-inter">View All Projects</div>
                      <p className="text-xs leading-snug text-muted-foreground font-inter mt-1">
                        Browse our portfolio of completed renovation projects
                      </p>
                    </button>
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <button 
          onClick={() => handleNavigation('/about')} 
          className="text-navy hover:text-coral transition font-inter font-medium"
        >
          About Us
        </button>
        
        <button 
          onClick={() => window.open('https://cloudrenovation.ca/packages', '_blank')}
          className="text-navy hover:text-coral transition font-inter font-medium"
        >
          Packages
        </button>

        <button 
          onClick={() => window.open('https://dashboard.cloudrenovation.ca', '_blank')}
          className="text-navy hover:text-coral transition p-2 rounded-lg hover:bg-coral/10"
          aria-label="Login to Dashboard"
        >
          <LogIn className="h-5 w-5" />
        </button>

        <Button 
          onClick={() => handleNavigation('/get-started')}
          className="btn-coral cropped-corners font-medium"
        >
          Get started
        </Button>
      </div>
    </div>
  );
};

export default DesktopNav;