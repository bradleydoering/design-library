import { QuoteStepProps } from "@/types/quote";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function Step5VanityWidth({ data, onUpdate, onNext, onBack }: QuoteStepProps) {
  const [formData, setFormData] = useState({
    vanity_width_in: data.vanity_width_in?.toString() || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      vanity_width_in: parseInt(formData.vanity_width_in),
    });
    onNext();
  };

  const selectCommonSize = (width: number) => {
    setFormData({ ...formData, vanity_width_in: width.toString() });
  };

  const isValid = formData.vanity_width_in && parseInt(formData.vanity_width_in) >= 0;

  return (
    <div className="min-h-screen bg-coral text-white flex flex-col">
      {/* Header */}
      <div className="p-4 text-center">
        <h1 className="text-xl font-semibold mb-2">Vanity Width</h1>
        <p className="text-sm opacity-90">What is the width of your vanity?</p>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white text-navy p-4 rounded-t-3xl">
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
          <div className="space-y-3">
            <label htmlFor="vanity_width_in" className="block text-lg font-semibold">
              Vanity Width (inches) *
            </label>
            
            <div className="relative">
              <Input
                id="vanity_width_in"
                type="number"
                placeholder="36"
                value={formData.vanity_width_in}
                onChange={(e) => setFormData({ ...formData, vanity_width_in: e.target.value })}
                className="text-xl text-center py-3 text-navy bg-gray-50 border-2"
                min="0"
                required
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                inches
              </div>
            </div>

            <div className="bg-blue-50 p-2 rounded border border-blue-200">
              <p className="text-blue-800 text-xs font-medium">
                Measure the width of your vanity from edge to edge
              </p>
            </div>
          </div>

          {/* Common Vanity Sizes */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold">Common Vanity Sizes:</h3>
            <div className="grid grid-cols-3 gap-2">
              {[24, 30, 36, 48, 60, 72].map((width) => (
                <button
                  key={width}
                  type="button"
                  onClick={() => selectCommonSize(width)}
                  className={`p-2 border-2 text-center transition-all touch-target ${
                    parseInt(formData.vanity_width_in) === width
                      ? "border-coral bg-coral/5"
                      : "border-gray-200 hover:border-coral/50"
                  }`}
                >
                  <div className="text-sm font-bold text-navy">{width}"</div>
                </button>
              ))}
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
              Next: Electrical Work
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}