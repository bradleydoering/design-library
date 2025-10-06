import { QuoteStepProps } from "@/types/quote";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Step2BathroomBuildingType({ data, onUpdate, onNext, onBack, isFirst }: QuoteStepProps) {
  const [formData, setFormData] = useState({
    bathroom_type: data.bathroom_type || "",
    building_type: data.building_type || "",
    year_built: data.year_built || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      bathroom_type: formData.bathroom_type as any,
      building_type: formData.building_type as any,
      year_built: formData.year_built as any,
    });
    onNext();
  };

  const isValid = formData.bathroom_type && formData.building_type && formData.year_built;

  return (
    <div className="min-h-screen bg-coral text-white flex flex-col">
      {/* Header */}
      <div className="p-6 text-center">
        <h1 className="text-2xl font-semibold mb-2">Bathroom Details</h1>
        <p className="text-sm opacity-90">Tell us about the bathroom you're renovating</p>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white text-navy px-6 py-8 rounded-t-3xl">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
      {/* Bathroom Type */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-navy">Bathroom Type *</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: "walk_in", label: "Walk-in Shower", description: "Shower only" },
            { value: "tub_only", label: "Bathtub", description: "Tub only" },
            { value: "tub_shower", label: "Tub & Shower", description: "Combination" },
            { value: "powder", label: "Sink & Toilet", description: "Powder room" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFormData({ ...formData, bathroom_type: option.value })}
              className={`p-4 border-2 rounded-lg text-left transition-all touch-target ${
                formData.bathroom_type === option.value
                  ? "border-coral bg-coral/5 shadow-md"
                  : "border-gray-300 hover:border-coral/50 hover:shadow"
              }`}
            >
              <div className="text-base font-semibold text-navy mb-1">{option.label}</div>
              <div className="text-sm text-gray-600">{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Building Type */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-navy">Building Type *</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: "house", label: "House", description: "Detached/Semi/Townhouse" },
            { value: "condo", label: "Condo", description: "Apartment/Condo" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFormData({ ...formData, building_type: option.value })}
              className={`p-4 border-2 rounded-lg text-left transition-all touch-target ${
                formData.building_type === option.value
                  ? "border-coral bg-coral/5 shadow-md"
                  : "border-gray-300 hover:border-coral/50 hover:shadow"
              }`}
            >
              <div className="text-base font-semibold text-navy mb-1">{option.label}</div>
              <div className="text-sm text-gray-600">{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Year Built */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-navy">When was the home built? *</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              value: "pre_1980",
              label: "Before 1980",
              description: "May require asbestos testing",
              warning: true
            },
            {
              value: "post_1980",
              label: "1980 or later",
              description: "No asbestos concerns",
              icon: "✓"
            },
            {
              value: "unknown",
              label: "Not sure",
              description: "We'll help determine needs"
            },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFormData({ ...formData, year_built: option.value })}
              className={`p-4 border-2 rounded-lg text-left transition-all touch-target relative ${
                formData.year_built === option.value
                  ? "border-coral bg-coral/5 shadow-md"
                  : option.warning
                    ? "border-orange-300 hover:border-orange-500 hover:shadow"
                    : "border-gray-300 hover:border-coral/50 hover:shadow"
              }`}
            >
              {option.warning && (
                <div className="absolute top-3 right-3 text-orange-500 text-lg">⚠️</div>
              )}
              {option.icon && (
                <div className="absolute top-3 right-3 text-green-500 text-lg">{option.icon}</div>
              )}
              <div className="text-base font-semibold text-navy mb-1 pr-8">{option.label}</div>
              <div className={`text-sm ${option.warning ? 'text-orange-600' : 'text-gray-600'}`}>
                {option.description}
              </div>
            </button>
          ))}
        </div>
      </div>

          <div className="flex justify-between pt-6">
            <Button
              type="button"
              onClick={onBack}
              variant="outline"
              className="touch-target px-6 py-3"
            >
              ← Back
            </Button>
            <Button
              type="submit"
              className="btn-coral touch-target px-6 py-3"
              disabled={!isValid}
            >
              Next: Floor Area →
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}