'use client';

import React, { useState } from 'react';
import { Button } from "./ui/button";
import { X, ArrowRight, ArrowLeft } from 'lucide-react';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: LeadFormData) => void;
}

interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  city: string;
  projectDescription: string;
}

const LeadCaptureModal = ({ isOpen, onClose, onComplete }: LeadCaptureModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<LeadFormData>({
    name: '',
    email: '',
    phone: '',
    city: '',
    projectDescription: ''
  });
  const [errors, setErrors] = useState<Partial<LeadFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<LeadFormData> = {};
    
    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        break;
      case 2:
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        break;
      case 3:
        if (!formData.projectDescription.trim()) newErrors.projectDescription = 'Project description is required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (validateStep(currentStep)) {
      setIsSubmitting(true);
      await onComplete(formData);
      setIsSubmitting(false);
      
      // Update URL without full page reload
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('success', 'true');
      window.history.replaceState({}, '', currentUrl.toString());

      // Close modal
      onClose();
    }
  };

  const updateFormData = (field: keyof LeadFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-semibold font-inter text-navy">
              Get Instant Pricing
            </h2>
            <p className="text-sm text-gray-600 font-inter mt-1">
              Step {currentStep} of 3
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4">
          <div className="flex space-x-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded-full ${
                  step <= currentStep ? 'bg-coral' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="px-6 pb-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium font-inter text-navy mb-2">
                  Let's start with your contact details
                </h3>
                <p className="text-gray-600 text-sm font-inter mb-6">
                  We'll use this to send you your personalized pricing estimate.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-navy font-inter mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md font-inter focus:ring-2 focus:ring-coral focus:border-coral ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-navy font-inter mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md font-inter focus:ring-2 focus:ring-coral focus:border-coral ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your email address"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium font-inter text-navy mb-2">
                  Where are you located?
                </h3>
                <p className="text-gray-600 text-sm font-inter mb-6">
                  This helps us provide accurate pricing for your area.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy font-inter mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md font-inter focus:ring-2 focus:ring-coral focus:border-coral ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your phone number"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-navy font-inter mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => updateFormData('city', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md font-inter focus:ring-2 focus:ring-coral focus:border-coral ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your city"
                />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium font-inter text-navy mb-2">
                  Tell us about your project
                </h3>
                <p className="text-gray-600 text-sm font-inter mb-6">
                  Describe your bathroom renovation vision to get the most accurate pricing.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-navy font-inter mb-2">
                  Project Description *
                </label>
                <textarea
                  value={formData.projectDescription}
                  onChange={(e) => updateFormData('projectDescription', e.target.value)}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-md font-inter focus:ring-2 focus:ring-coral focus:border-coral resize-none ${
                    errors.projectDescription ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Describe your bathroom renovation project. What are your main goals, style preferences, and any specific requirements?"
                />
                {errors.projectDescription && <p className="text-red-500 text-sm mt-1">{errors.projectDescription}</p>}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {currentStep > 1 ? (
              <Button
                onClick={prevStep}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
            ) : (
              <div></div>
            )}

            {currentStep < 3 ? (
              <Button
                onClick={nextStep}
                className="btn-coral cropped-corners flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="btn-coral cropped-corners flex items-center space-x-2 disabled:opacity-75"
              >
                {isSubmitting ? (
                  <>
                    <span>Unlocking Pricing...</span>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  </>
                ) : (
                  <>
                    <span>Get My Pricing</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadCaptureModal;