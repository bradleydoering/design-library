'use client';

import React from 'react';
import Image from 'next/image';
import { Button } from "../ui/button";
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
    <div className="flex items-center justify-between py-6">
      {/* Logo */}
      <div className="flex items-center">
        <Image
          src="https://img.cloudrenovation.ca/Cloud%20Renovation%20logos/Cloud_Renovation_Logo-removebg-preview.png"
          alt="CloudReno"
          width={180}
          height={50}
          className="h-12 w-auto cursor-pointer"
          onClick={() => handleNavigation('/')}
        />
      </div>

      {/* Navigation Menu */}
      <div className="flex items-center space-x-8">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-navy hover:text-coral transition font-space">
                Services
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-6 w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <div className="row-span-3">
                    <NavigationMenuLink asChild>
                      <button
                        onClick={() => handleNavigation('/services/bathroom')}
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md text-left"
                      >
                        <div className="mb-2 mt-4 text-lg font-medium font-space">
                          Bathroom Renovations
                        </div>
                        <p className="text-sm leading-tight text-muted-foreground font-inter">
                          Transform your bathroom into a modern sanctuary with our expert renovation services.
                        </p>
                      </button>
                    </NavigationMenuLink>
                  </div>
                  <div className="grid gap-2">
                    <NavigationMenuLink asChild>
                      <button
                        onClick={() => handleNavigation('/services/kitchen')}
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-left"
                      >
                        <div className="text-sm font-medium leading-none font-space">Kitchen</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground font-inter">
                          Modern kitchen renovations for every style and budget.
                        </p>
                      </button>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <button
                        onClick={() => handleNavigation('/services/full-home')}
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-left"
                      >
                        <div className="text-sm font-medium leading-none font-space">Full Home</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground font-inter">
                          Complete home renovation services and solutions.
                        </p>
                      </button>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <button
                        onClick={() => handleNavigation('/services/interior-design')}
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-left"
                      >
                        <div className="text-sm font-medium leading-none font-space">Interior Design</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground font-inter">
                          Professional interior design services for your renovation.
                        </p>
                      </button>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <button
                        onClick={() => handleNavigation('/projects')}
                        className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-left"
                      >
                        <div className="text-sm font-medium leading-none font-space">View All Projects</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground font-inter">
                          Browse our portfolio of completed renovation projects.
                        </p>
                      </button>
                    </NavigationMenuLink>
                  </div>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <button 
          onClick={() => handleNavigation('/about')} 
          className="text-navy hover:text-coral transition font-space font-medium"
        >
          About Us
        </button>
        
        <button 
          onClick={() => scrollToSection('how-it-works')} 
          className="text-navy hover:text-coral transition font-space font-medium"
        >
          How It Works
        </button>
        
        <button 
          onClick={() => scrollToSection('calculator')} 
          className="text-navy hover:text-coral transition font-space font-medium"
        >
          Cost Calculator
        </button>
        
        <button 
          onClick={() => scrollToSection('dashboard')} 
          className="text-navy hover:text-coral transition font-space font-medium"
        >
          Dashboard
        </button>
        

        <Button 
          onClick={() => handleNavigation('/get-started')}
          className="btn-coral cropped-corners font-space font-semibold"
        >
          Get started
        </Button>
      </div>
    </div>
  );
};

export default DesktopNav;