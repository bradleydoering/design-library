"use client";

import { useState } from "react";
import { QuoteFormData } from "@/types/quote";
import { Step1CustomerInformation } from "./steps/Step1CustomerInformation";
import { Step2BathroomBuildingType } from "./steps/Step2BathroomBuildingType";
import { Step3FloorArea } from "./steps/Step3FloorArea";
import { Step4WallArea } from "./steps/Step4WallArea";
import { Step5CeilingHeight } from "./steps/Step5CeilingHeight";
import { Step6VanityWidth } from "./steps/Step6VanityWidth";
import { Step7ElectricalWork } from "./steps/Step7ElectricalWork";
import { Step8OptionalUpgrades } from "./steps/Step8OptionalUpgrades";
import { useRouter } from "next/navigation";

const STEPS = [
  "Customer Information",
  "Bathroom & Building Type",
  "Floor Area",
  "Wall Area",
  "Ceiling Height",
  "Vanity Width",
  "Electrical Work",
  "Optional Upgrades"
];

export function QuoteForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<QuoteFormData>>({});

  const handleUpdate = (data: Partial<QuoteFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    let nextStep = currentStep + 1;
    
    // Skip ceiling height (step 4) for powder rooms
    if (formData.bathroom_type === 'powder' && nextStep === 4) {
      nextStep = 5;
    }
    
    if (nextStep < STEPS.length) {
      setCurrentStep(nextStep);
    } else {
      // Form complete - redirect to quote calculation
      handleComplete();
    }
  };

  const handleBack = () => {
    let prevStep = currentStep - 1;
    
    // Skip ceiling height (step 4) for powder rooms when going back
    if (formData.bathroom_type === 'powder' && prevStep === 4) {
      prevStep = 3;
    }
    
    if (prevStep >= 0) {
      setCurrentStep(prevStep);
    }
  };

  const handleComplete = () => {
    // Store form data in sessionStorage for now (later we'll save to database)
    sessionStorage.setItem('contractorQuoteData', JSON.stringify(formData));
    
    // Redirect to quote calculation/results
    router.push('/quote/calculate');
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
        return <Step1CustomerInformation {...stepProps} />;
      case 1:
        return <Step2BathroomBuildingType {...stepProps} />;
      case 2:
        return <Step3FloorArea {...stepProps} />;
      case 3:
        return <Step4WallArea {...stepProps} />;
      case 4:
        return <Step5CeilingHeight {...stepProps} />;
      case 5:
        return <Step6VanityWidth {...stepProps} />;
      case 6:
        return <Step7ElectricalWork {...stepProps} />;
      case 7:
        return <Step8OptionalUpgrades {...stepProps} />;
      default:
        return <Step1CustomerInformation {...stepProps} />;
    }
  };

  // Show progress for first step (white background), others have coral headers
  if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-offwhite">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="container-custom py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-navy">Bathroom Quote Calculator</h1>
              <div className="text-xs text-gray-600">
                Step {currentStep + 1} of {STEPS.length}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container-custom py-4">
          <div className="ipad-container">
            <div className="bg-white p-4 shadow-lg [clip-path:polygon(1rem_0%,100%_0%,100%_calc(100%-1rem),calc(100%-1rem)_100%,0%_100%,0%_1rem)]">
              {renderCurrentStep()}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Steps 2-6 have coral backgrounds
  return renderCurrentStep();
}