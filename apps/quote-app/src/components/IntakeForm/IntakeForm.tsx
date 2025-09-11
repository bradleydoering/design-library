"use client";

import { useState } from "react";
import { IntakeFormData } from "@/types/intake";
import { FormProgress } from "./FormProgress";
import { PropertyDetailsStep } from "./steps/PropertyDetailsStep";
import { BathroomDetailsStep } from "./steps/BathroomDetailsStep";
import { RenovationScopeStep } from "./steps/RenovationScopeStep";
import { DesignPreferencesStep } from "./steps/DesignPreferencesStep";
import { ContactInformationStep } from "./steps/ContactInformationStep";
import { useRouter } from "next/navigation";

const STEPS = [
  "Property Details",
  "Bathroom Details", 
  "Renovation Scope",
  "Design Preferences",
  "Contact Information"
];

export function IntakeForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<IntakeFormData>>({});

  const handleUpdate = (data: Partial<IntakeFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Form complete - redirect to package selection
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    // Store form data in sessionStorage for now (later we'll save to database)
    sessionStorage.setItem('intakeFormData', JSON.stringify(formData));
    
    // Redirect to package selection
    router.push('/packages');
  };

  const renderCurrentStep = () => {
    const stepProps = {
      data: formData,
      onUpdate: handleUpdate,
      onNext: handleNext,
      onBack: handleBack,
      isFirst: currentStep === 0,
      isLast: currentStep === STEPS.length - 1,
    };

    switch (currentStep) {
      case 0:
        return <PropertyDetailsStep {...stepProps} />;
      case 1:
        return <BathroomDetailsStep {...stepProps} />;
      case 2:
        return <RenovationScopeStep {...stepProps} />;
      case 3:
        return <DesignPreferencesStep {...stepProps} />;
      case 4:
        return <ContactInformationStep {...stepProps} />;
      default:
        return <PropertyDetailsStep {...stepProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-offwhite">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-space text-navy">Bathroom Renovation Quote</h1>
            <div className="text-sm text-gray-600">
              Step {currentStep + 1} of {STEPS.length}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-8">
        <div className="ipad-container">
          <FormProgress 
            currentStep={currentStep} 
            totalSteps={STEPS.length} 
            stepLabels={STEPS} 
          />

          <div className="bg-white p-6 md:p-8 shadow-lg [clip-path:polygon(1rem_0%,100%_0%,100%_calc(100%-1rem),calc(100%-1rem)_100%,0%_100%,0%_1rem)]">
            <div className="mb-6">
              <h2 className="text-2xl font-space text-navy mb-2">
                {STEPS[currentStep]}
              </h2>
              <p className="text-gray-600">
                {currentStep === 0 && "Tell us about your property and location."}
                {currentStep === 1 && "Describe your bathroom space and current condition."}
                {currentStep === 2 && "What type of renovation are you planning?"}
                {currentStep === 3 && "Help us understand your style and preferences."}
                {currentStep === 4 && "How can we contact you with your quote?"}
              </p>
            </div>

            {renderCurrentStep()}
          </div>
        </div>
      </main>
    </div>
  );
}