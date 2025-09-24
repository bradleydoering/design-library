import { QuoteStepProps } from "@/types/quote";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function Step4WallArea({ data, onUpdate, onNext, onBack }: QuoteStepProps) {
  const [formData, setFormData] = useState({
    wet_wall_sqft: data.wet_wall_sqft?.toString() || "",
    tile_other_walls: data.tile_other_walls ?? false,
    tile_other_walls_sqft: data.tile_other_walls_sqft?.toString() || "",
    add_accent_feature: data.add_accent_feature ?? false,
    accent_feature_sqft: data.accent_feature_sqft?.toString() || "",
  });

  const isPowderRoom = data.bathroom_type === 'powder';
  const hasWetWalls = !isPowderRoom;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      wet_wall_sqft: hasWetWalls ? parseInt(formData.wet_wall_sqft) : 0,
      tile_other_walls: formData.tile_other_walls,
      tile_other_walls_sqft: formData.tile_other_walls ? parseInt(formData.tile_other_walls_sqft) : undefined,
      add_accent_feature: formData.add_accent_feature,
      accent_feature_sqft: formData.add_accent_feature ? parseInt(formData.accent_feature_sqft) : undefined,
    });
    onNext();
  };

  const isValid = (!hasWetWalls || (formData.wet_wall_sqft && parseInt(formData.wet_wall_sqft) > 0)) &&
    (!formData.tile_other_walls || (formData.tile_other_walls_sqft && parseInt(formData.tile_other_walls_sqft) > 0)) &&
    (!formData.add_accent_feature || (formData.accent_feature_sqft && parseInt(formData.accent_feature_sqft) > 0));

  const totalWallArea = (hasWetWalls ? (parseInt(formData.wet_wall_sqft) || 0) : 0) + 
    (formData.tile_other_walls ? (parseInt(formData.tile_other_walls_sqft) || 0) : 0) +
    (formData.add_accent_feature ? (parseInt(formData.accent_feature_sqft) || 0) : 0);

  return (
    <div className="min-h-screen bg-coral text-white flex flex-col">
      {/* Header */}
      <div className="p-4 text-center">
        <h1 className="text-xl font-semibold mb-2">Wall Area</h1>
        <p className="text-sm opacity-90">{isPowderRoom ? 'How many square feet of wall will be tiled?' : 'How many square feet of wall will be tiled?'}</p>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white text-navy p-4 rounded-t-3xl">
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
          {/* Wet Wall Area - Hidden for powder rooms */}
          {hasWetWalls && (
          <div className="space-y-3">
            <label htmlFor="wet_wall_sqft" className="block text-lg font-semibold">
              Wet Wall Area (sq ft) *
            </label>
            
            <div className="relative">
              <Input
                id="wet_wall_sqft"
                type="number"
                placeholder="120"
                value={formData.wet_wall_sqft}
                onChange={(e) => setFormData({ ...formData, wet_wall_sqft: e.target.value })}
                className="text-xl text-center py-3 text-navy bg-gray-50 border-2"
                min="1"
                required
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                sq ft
              </div>
            </div>

            <div className="bg-blue-50 p-2 rounded border border-blue-200">
              <p className="text-blue-800 text-xs font-medium">
                Walls around tub/shower area that need waterproofing
              </p>
            </div>
          </div>
          )}

          {/* Tile Other Walls */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold">{isPowderRoom ? 'Will you be tiling the walls?' : 'Will you be tiling the dry walls?'}</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: true, label: "Yes", description: "Tile other walls" },
                { value: false, label: "No", description: "Paint only" },
              ].map((option) => (
                <button
                  key={option.value.toString()}
                  type="button"
                  onClick={() => setFormData({ 
                    ...formData, 
                    tile_other_walls: option.value,
                    tile_other_walls_sqft: option.value ? formData.tile_other_walls_sqft : ""
                  })}
                  className={`p-3 border-2 text-left transition-all touch-target ${
                    formData.tile_other_walls === option.value
                      ? "border-coral bg-coral/5"
                      : "border-gray-200 hover:border-coral/50"
                  }`}
                >
                  <div className="text-sm font-semibold text-navy mb-1">{option.label}</div>
                  <div className="text-xs text-gray-600">{option.description}</div>
                </button>
              ))}
            </div>

            {/* Dry Wall Square Footage */}
            {formData.tile_other_walls && (
              <div className="mt-3">
                <label htmlFor="tile_other_walls_sqft" className="block text-sm font-medium text-navy mb-1">
                  Dry Wall Area (sq ft) *
                </label>
                <div className="relative">
                  <Input
                    id="tile_other_walls_sqft"
                    type="number"
                    placeholder="50"
                    value={formData.tile_other_walls_sqft}
                    onChange={(e) => setFormData({ ...formData, tile_other_walls_sqft: e.target.value })}
                    className="text-base text-center py-2 text-navy bg-gray-50 border-2"
                    min="1"
                    required
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                    sq ft
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Accent Feature */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold">Would you like to add an accent tile feature?</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: true, label: "Yes", description: "Feature wall/strip" },
                { value: false, label: "No", description: "Standard only" },
              ].map((option) => (
                <button
                  key={option.value.toString()}
                  type="button"
                  onClick={() => setFormData({ 
                    ...formData, 
                    add_accent_feature: option.value,
                    accent_feature_sqft: option.value ? formData.accent_feature_sqft : ""
                  })}
                  className={`p-3 border-2 text-left transition-all touch-target ${
                    formData.add_accent_feature === option.value
                      ? "border-coral bg-coral/5"
                      : "border-gray-200 hover:border-coral/50"
                  }`}
                >
                  <div className="text-sm font-semibold text-navy mb-1">{option.label}</div>
                  <div className="text-xs text-gray-600">{option.description}</div>
                </button>
              ))}
            </div>

            {/* Accent Feature Square Footage */}
            {formData.add_accent_feature && (
              <div className="mt-3">
                <label htmlFor="accent_feature_sqft" className="block text-sm font-medium text-navy mb-1">
                  Accent Feature Area (sq ft) *
                </label>
                <div className="relative">
                  <Input
                    id="accent_feature_sqft"
                    type="number"
                    placeholder="25"
                    value={formData.accent_feature_sqft}
                    onChange={(e) => setFormData({ ...formData, accent_feature_sqft: e.target.value })}
                    className="text-base text-center py-2 text-navy bg-gray-50 border-2"
                    min="1"
                    required
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                    sq ft
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Powder Room Info */}
          {isPowderRoom && totalWallArea === 0 && (
            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <p className="text-blue-800 text-xs font-medium">
                Wall tiling is optional for powder rooms. You can proceed without selecting any wall tiles.
              </p>
            </div>
          )}

          {/* Total Display */}
          {totalWallArea > 0 && (
            <div className="bg-coral text-white p-3 rounded">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">Total Wall Area:</span>
                <span className="text-base font-bold">{totalWallArea}.0 sq ft</span>
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
              Next: {isPowderRoom ? 'Vanity Width' : 'Ceiling Height'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}