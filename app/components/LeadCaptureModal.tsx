'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "./ui/button";
import { X, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: LeadFormData) => void;
}

interface LeadFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  projectDescription: string;
}

// Stricter email regex (more comprehensive than basic /\S+@\S+\.\S+/)
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Basic disposable email domain blacklist (can be expanded)
const DISPOSABLE_EMAIL_DOMAINS = [
  'mailinator.com',
  'temp-mail.org',
  'guerrillamail.com',
  '10minutemail.com',
  'trashmail.com',
  'yopmail.com',
  'disposable.com',
  'anonaddy.com',
  'tempmail.dev',
  'sharklasers.com',
  'grr.la',
  'pokemail.net',
  'spamgourmet.com',
  'maildrop.cc',
  'meltmail.com',
  'mohmal.com',
  'emailondeck.com',
  'fakeinbox.com',
  'getnada.com',
  'harakirimail.com',
  'kasmail.com',
  'mailcatch.com',
  'mailnesia.com',
  'mytrashmail.com',
  'privacy.net',
  'rmqkr.net',
  'superrito.com',
  'teleworm.us',
  'zippymail.info',
];

const LeadCaptureModal = ({ isOpen, onClose, onComplete }: LeadCaptureModalProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<LeadFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    projectDescription: ''
  });
  const [errors, setErrors] = useState<Partial<LeadFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingVerification, setIsLoadingVerification] = useState(false);

  // Ref for debouncing API calls
  const emailValidationTimeout = useRef<NodeJS.Timeout | null>(null);
  const phoneValidationTimeout = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (emailValidationTimeout.current) {
        clearTimeout(emailValidationTimeout.current);
      }
      if (phoneValidationTimeout.current) {
        clearTimeout(phoneValidationTimeout.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  const validateStep = async (step: number): Promise<boolean> => {
    const newErrors: Partial<LeadFormData> = {};
    let isValid = true;
    
    // Client-side sync validation first
    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!EMAIL_REGEX.test(formData.email)) newErrors.email = 'Email format is invalid';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return false;
      }

      // Check disposable domain blacklist
      const emailDomain = formData.email.split('@')[1];
      if (emailDomain && DISPOSABLE_EMAIL_DOMAINS.includes(emailDomain.toLowerCase())) {
        newErrors.email = 'Disposable email addresses are not allowed';
        setErrors(newErrors);
        return false;
      }

      // Async API validation for email
      setIsLoadingVerification(true);
      try {
        const emailValidationResponse = await fetch(`https://emailvalidation.abstractapi.com/v1/?api_key=${process.env.NEXT_PUBLIC_ABSTRACT_EMAIL_API_KEY}&email=${formData.email}`);
        const emailValidationData = await emailValidationResponse.json();
        console.log('Email validation data:', emailValidationData); // For debugging

        if (emailValidationData.is_valid_format.value === 'false' || 
            emailValidationData.is_smtp_valid.value === 'false' || 
            emailValidationData.is_disposable_email.value === 'true' ||
            emailValidationData.quality_score < 0.7) { // Added quality score check
          newErrors.email = 'Please enter a valid, non-disposable email address';
          isValid = false;
        }
      } catch (error) {
        console.error('Error validating email:', error);
        newErrors.email = 'Could not validate email. Please try again.';
        isValid = false;
      } finally {
        setIsLoadingVerification(false);
        setErrors(newErrors);
        if (!isValid) return false;
      }
    } else if (step === 2) {
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return false;
      }

      // Async API validation for phone
      setIsLoadingVerification(true);
      try {
        // Client-side phone validation with libphonenumber-js
        const phoneNumber = parsePhoneNumber(formData.phone, 'US'); // Assuming US numbers, adjust as needed
        if (!phoneNumber || !phoneNumber.isValid()) {
          newErrors.phone = 'Please enter a valid phone number (e.g., +12125551234)';
          isValid = false;
        } else {
          // Abstract API for deeper validation
          const phoneValidationResponse = await fetch(`https://phonevalidation.abstractapi.com/v1/?api_key=${process.env.NEXT_PUBLIC_ABSTRACT_PHONE_API_KEY}&phone=${phoneNumber.number}`);
          const phoneValidationData = await phoneValidationResponse.json();
          console.log('Phone validation data:', phoneValidationData); // For debugging

          if (phoneValidationData.valid === false || 
              phoneValidationData.type === 'voip' || // Block VOIP numbers if desired
              phoneValidationData.carrier === null) { // Check for carrier info
            newErrors.phone = 'Please enter a valid phone number';
            isValid = false;
          }
        }
      } catch (error) {
        console.error('Error validating phone number:', error);
        newErrors.phone = 'Could not validate phone number. Please try again.';
        isValid = false;
      } finally {
        setIsLoadingVerification(false);
        setErrors(newErrors);
        if (!isValid) return false;
      }
    } else if (step === 3) {
      if (!formData.projectDescription.trim()) newErrors.projectDescription = 'Project description is required';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return false;
      }
    }
    
    setErrors(newErrors); // Final sync error update
    return isValid && Object.keys(newErrors).length === 0;
  };

  const nextStep = async () => {
    if (await validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    setErrors({});
  };

  const handleSubmit = async () => {
    if (await validateStep(currentStep)) {
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
    // Clear error for the field being updated
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    // Debounce validation for email and phone
    if (field === 'email') {
      if (emailValidationTimeout.current) {
        clearTimeout(emailValidationTimeout.current);
      }
      emailValidationTimeout.current = setTimeout(() => {
        validateStep(1); // Re-validate email after typing stops
      }, 500); // 500ms debounce
    } else if (field === 'phone') {
      if (phoneValidationTimeout.current) {
        clearTimeout(phoneValidationTimeout.current);
      }
      phoneValidationTimeout.current = setTimeout(() => {
        validateStep(2); // Re-validate phone after typing stops
      }, 500); // 500ms debounce
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
              
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-navy font-inter mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => updateFormData('firstName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md font-inter focus:ring-2 focus:ring-coral focus:border-coral ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-navy font-inter mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => updateFormData('lastName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md font-inter focus:ring-2 focus:ring-coral focus:border-coral ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                </div>
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
                disabled={isLoadingVerification || isSubmitting}
                className="btn-coral cropped-corners flex items-center space-x-2"
              >
                {isLoadingVerification ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
                <span>Next</span>
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

// Helper styles for the coral button
const styles = `
  .btn-coral {
    background-color: #FF7F50;
    color: white;
    font-weight: 600;
    padding: 10px 20px;
    border-radius: 6px;
    transition: background-color 0.3s;
  }
  .btn-coral:hover {
    background-color: #FF6347;
  }
  .cropped-corners {
    clip-path: polygon(0 8px, 8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 8px);
  }
`;

// Inject styles into the document head
if (typeof window !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}