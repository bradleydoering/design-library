import { FormStepProps } from "@/types/intake";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";

export function RenovationScopeStep({ data, onUpdate, onNext, onBack }: FormStepProps) {
  const [formData, setFormData] = useState({
    renovationType: data.scope?.renovationType || "",
    includeFlooring: data.scope?.includeFlooring ?? false,
    includePlumbing: data.scope?.includePlumbing ?? false,
    includeElectrical: data.scope?.includeElectrical ?? false,
    includeTiling: data.scope?.includeTiling ?? false,
    includePainting: data.scope?.includePainting ?? false,
    accessibilityFeatures: data.scope?.accessibilityFeatures || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      scope: {
        renovationType: formData.renovationType as 'full-renovation' | 'partial-update' | 'fixtures-only',
        includeFlooring: formData.includeFlooring,
        includePlumbing: formData.includePlumbing,
        includeElectrical: formData.includeElectrical,
        includeTiling: formData.includeTiling,
        includePainting: formData.includePainting,
        accessibilityFeatures: formData.accessibilityFeatures,
      },
    });
    onNext();
  };

  const handleAccessibilityChange = (feature: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        accessibilityFeatures: [...formData.accessibilityFeatures, feature]
      });
    } else {
      setFormData({
        ...formData,
        accessibilityFeatures: formData.accessibilityFeatures.filter(f => f !== feature)
      });
    }
  };

  const isValid = formData.renovationType;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <Label className="text-navy font-medium">Renovation Type *</Label>
        <RadioGroup
          value={formData.renovationType}
          onValueChange={(value) => setFormData({ ...formData, renovationType: value })}
          className="space-y-3"
        >
          {[
            { value: "full-renovation", label: "Full Renovation", description: "Complete bathroom overhaul" },
            { value: "partial-update", label: "Partial Update", description: "Update key elements" },
            { value: "fixtures-only", label: "Fixtures Only", description: "Replace fixtures and finishes" },
          ].map((option) => (
            <label
              key={option.value}
              className={`flex items-center space-x-3 border-2 p-4 cursor-pointer transition-all touch-target ${
                formData.renovationType === option.value
                  ? "border-coral bg-coral/5"
                  : "border-gray-200 hover:border-coral/50"
              } [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]`}
            >
              <RadioGroupItem value={option.value} />
              <div>
                <div className="font-medium text-navy">{option.label}</div>
                <div className="text-sm text-gray-600">{option.description}</div>
              </div>
            </label>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <Label className="text-navy font-medium">What's Included? (Check all that apply)</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: "includeFlooring", label: "Flooring", description: "Tile, vinyl, or other flooring" },
            { key: "includePlumbing", label: "Plumbing", description: "Pipes, fixtures, water lines" },
            { key: "includeElectrical", label: "Electrical", description: "Lighting, outlets, fans" },
            { key: "includeTiling", label: "Wall Tiling", description: "Shower, backsplash tiles" },
            { key: "includePainting", label: "Painting", description: "Walls and ceiling paint" },
          ].map((option) => (
            <label
              key={option.key}
              className={`flex items-center space-x-3 border-2 p-4 cursor-pointer transition-all touch-target ${
                formData[option.key as keyof typeof formData]
                  ? "border-coral bg-coral/5"
                  : "border-gray-200 hover:border-coral/50"
              } [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]`}
            >
              <input
                type="checkbox"
                checked={formData[option.key as keyof typeof formData] as boolean}
                onChange={(e) => setFormData({ ...formData, [option.key]: e.target.checked })}
                className="w-4 h-4 text-coral border-gray-300 rounded focus:ring-coral"
              />
              <div>
                <div className="font-medium text-navy">{option.label}</div>
                <div className="text-sm text-gray-600">{option.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-navy font-medium">Accessibility Features (Optional)</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            "Grab bars",
            "Walk-in shower",
            "Comfort-height toilet",
            "Non-slip flooring",
            "Wider doorways",
            "Other (specify in notes)",
          ].map((feature) => (
            <label
              key={feature}
              className={`flex items-center space-x-3 border-2 p-4 cursor-pointer transition-all touch-target ${
                formData.accessibilityFeatures.includes(feature)
                  ? "border-coral bg-coral/5"
                  : "border-gray-200 hover:border-coral/50"
              } [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]`}
            >
              <input
                type="checkbox"
                checked={formData.accessibilityFeatures.includes(feature)}
                onChange={(e) => handleAccessibilityChange(feature, e.target.checked)}
                className="w-4 h-4 text-coral border-gray-300 rounded focus:ring-coral"
              />
              <span className="font-medium text-navy">{feature}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          size="ipad"
          onClick={onBack}
          className="touch-target"
        >
          Back
        </Button>
        <Button
          type="submit"
          size="ipad"
          className="btn-coral touch-target"
          disabled={!isValid}
        >
          Next: Design Preferences
        </Button>
      </div>
    </form>
  );
}