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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Bathroom Type */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-navy">Bathroom Type *</h3>
        <div className="grid grid-cols-2 gap-3">
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
              className={`p-3 border-2 text-left transition-all touch-target ${
                formData.bathroom_type === option.value
                  ? "border-coral bg-coral/5"
                  : "border-gray-200 hover:border-coral/50"
              }`}
            >
              <div className="text-sm font-semibold text-navy mb-1">{option.label}</div>
              <div className="text-xs text-gray-600">{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Building Type */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-navy">Building Type *</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "house", label: "House", description: "Detached/Semi/Townhouse" },
            { value: "condo", label: "Condo", description: "Apartment/Condo" },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFormData({ ...formData, building_type: option.value })}
              className={`p-3 border-2 text-left transition-all touch-target ${
                formData.building_type === option.value
                  ? "border-coral bg-coral/5"
                  : "border-gray-200 hover:border-coral/50"
              }`}
            >
              <div className="text-sm font-semibold text-navy mb-1">{option.label}</div>
              <div className="text-xs text-gray-600">{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Year Built */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-navy">When was the home built? *</h3>
        <div className="grid grid-cols-3 gap-3">
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
              description: "We'll help determine testing needs"
            },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFormData({ ...formData, year_built: option.value })}
              className={`p-3 border-2 text-left transition-all touch-target relative ${
                formData.year_built === option.value
                  ? "border-coral bg-coral/5"
                  : option.warning 
                    ? "border-orange-300 hover:border-orange-500"
                    : "border-gray-200 hover:border-coral/50"
              }`}
            >
              {option.warning && (
                <div className="absolute top-2 right-2 text-orange-500 text-sm">⚠</div>
              )}
              {option.icon && (
                <div className="absolute top-2 right-2 text-green-500 text-sm">{option.icon}</div>
              )}
              <div className="text-sm font-semibold text-navy mb-1">{option.label}</div>
              <div className={`text-xs ${option.warning ? 'text-orange-600' : 'text-gray-600'}`}>
                {option.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button
          type="button"
          onClick={onBack}
          size="sm"
          variant="outline"
          className="touch-target text-sm px-4 py-2"
        >
          ← Back
        </Button>
        <Button
          type="submit"
          size="sm"
          className="btn-coral touch-target text-sm px-4 py-2"
          disabled={!isValid}
        >
          Next: Floor Area
        </Button>
      </div>
    </form>
  );
}