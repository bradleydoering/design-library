import { QuoteStepProps } from "@/types/quote";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function Step2FloorArea({ data, onUpdate, onNext, onBack }: QuoteStepProps) {
  const [formData, setFormData] = useState({
    floor_sqft: data.floor_sqft?.toString() || "",
    shower_floor_sqft: data.shower_floor_sqft?.toString() || "",
  });

  const hasShower = data.bathroom_type === 'walk_in' || data.bathroom_type === 'tub_shower';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      floor_sqft: parseInt(formData.floor_sqft),
      shower_floor_sqft: hasShower && formData.shower_floor_sqft ? parseInt(formData.shower_floor_sqft) : undefined,
    });
    onNext();
  };

  const isValid = formData.floor_sqft && parseInt(formData.floor_sqft) > 0 &&
    (!hasShower || (formData.shower_floor_sqft && parseInt(formData.shower_floor_sqft) > 0));

  return (
    <div className="min-h-screen bg-coral text-white flex flex-col">
      {/* Header */}
      <div className="p-4 text-center">
        <h1 className="text-xl font-semibold mb-2">Floor Area</h1>
        <p className="text-sm opacity-90">How many square feet of floor will be tiled?</p>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white text-navy p-4 rounded-t-3xl">
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
          <div className="space-y-3">
            <label htmlFor="floor_sqft" className="block text-lg font-semibold">
              Tiled Floor Area (sq ft) *
            </label>
            
            <div className="relative">
              <Input
                id="floor_sqft"
                type="number"
                placeholder="60"
                value={formData.floor_sqft}
                onChange={(e) => setFormData({ ...formData, floor_sqft: e.target.value })}
                className="text-2xl text-center py-4 text-navy bg-gray-50 border-2"
                min="1"
                required
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                sq ft
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-blue-800 text-sm font-medium">
                Measure only the area that will have tile flooring installed
              </p>
            </div>
          </div>

          {/* Shower Floor Area - Only for walk-in shower and tub & shower */}
          {hasShower && (
            <div className="space-y-3">
              <label htmlFor="shower_floor_sqft" className="block text-lg font-semibold">
                Shower Floor Area (sq ft) *
              </label>
              
              <div className="relative">
                <Input
                  id="shower_floor_sqft"
                  type="number"
                  placeholder="15"
                  value={formData.shower_floor_sqft}
                  onChange={(e) => setFormData({ ...formData, shower_floor_sqft: e.target.value })}
                  className="text-xl text-center py-3 text-navy bg-gray-50 border-2"
                  min="1"
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                  sq ft
                </div>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-blue-800 text-sm font-medium">
                  Measure the shower floor area separately from the main bathroom floor
                </p>
              </div>
            </div>
          )}

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
              Next: {data.bathroom_type === 'powder' ? 'Ceiling Height' : 'Wall Area'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}