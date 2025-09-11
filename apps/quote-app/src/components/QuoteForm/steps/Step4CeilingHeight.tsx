import { QuoteStepProps } from "@/types/quote";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function Step4CeilingHeight({ data, onUpdate, onNext, onBack }: QuoteStepProps) {
  const [formData, setFormData] = useState({
    ceiling_height: data.ceiling_height || null,
    ceiling_height_custom: data.ceiling_height_custom?.toString() || "",
    use_custom: data.ceiling_height ? ![7, 8, 9].includes(data.ceiling_height as number) : false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const height = formData.use_custom 
      ? parseFloat(formData.ceiling_height_custom)
      : formData.ceiling_height;
    
    onUpdate({
      ceiling_height: height as any,
      ceiling_height_custom: formData.use_custom ? parseFloat(formData.ceiling_height_custom) : undefined,
    });
    onNext();
  };

  const isValid = formData.use_custom 
    ? formData.ceiling_height_custom && parseFloat(formData.ceiling_height_custom) > 0
    : formData.ceiling_height !== null;

  return (
    <div className="min-h-screen bg-coral text-white flex flex-col">
      {/* Header */}
      <div className="p-4 text-center">
        <h1 className="text-xl font-semibold mb-2">Ceiling Height</h1>
        <p className="text-sm opacity-90">How high are the ceilings in this bathroom?</p>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white text-navy p-4 rounded-t-3xl">
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
          {/* Standard Heights */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold">Select Standard Height</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 7, label: "7'", description: "Older homes" },
                { value: 8, label: "8'", description: "Standard" },
                { value: 9, label: "9'", description: "Modern" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData({ 
                    ...formData, 
                    ceiling_height: option.value, 
                    use_custom: false,
                    ceiling_height_custom: ""
                  })}
                  className={`p-3 border-2 text-center transition-all touch-target ${
                    formData.ceiling_height === option.value && !formData.use_custom
                      ? "border-coral bg-coral/5"
                      : "border-gray-200 hover:border-coral/50"
                  }`}
                >
                  <div className="text-lg font-bold text-navy mb-1">{option.label}</div>
                  <div className="text-xs text-gray-600">{option.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Height */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold">Other Height (feet)</h3>
            
            <div className="relative">
              <Input
                id="ceiling_height_custom"
                type="number"
                step="0.5"
                placeholder="8"
                value={formData.ceiling_height_custom}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  ceiling_height_custom: e.target.value,
                  use_custom: true,
                  ceiling_height: null
                })}
                onFocus={() => setFormData({ 
                  ...formData, 
                  use_custom: true,
                  ceiling_height: null
                })}
                className={`text-xl text-center py-3 text-navy bg-gray-50 border-2 ${
                  formData.use_custom ? 'border-coral bg-coral/5' : ''
                }`}
                min="0"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                feet
              </div>
            </div>

            <div className="bg-blue-50 p-2 rounded border border-blue-200">
              <p className="text-blue-800 text-xs font-medium">
                Measure from floor to ceiling
              </p>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onBack}
              className="touch-target text-sm px-4 py-2"
            >
              Back
            </Button>
            <Button
              type="submit"
              size="sm"
              className="btn-coral touch-target text-sm px-4 py-2"
              disabled={!isValid}
            >
              Next: Vanity Width
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}