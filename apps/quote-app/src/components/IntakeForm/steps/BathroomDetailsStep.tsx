import { FormStepProps } from "@/types/intake";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";

export function BathroomDetailsStep({ data, onUpdate, onNext, onBack }: FormStepProps) {
  const [formData, setFormData] = useState({
    bathroomType: data.bathroom?.bathroomType || "",
    currentLayout: data.bathroom?.currentLayout || "",
    squareFootage: data.bathroom?.squareFootage?.toString() || "",
    ceilingHeight: data.bathroom?.ceilingHeight?.toString() || "",
    hasWindows: data.bathroom?.hasWindows ?? false,
    hasVentilation: data.bathroom?.hasVentilation ?? false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      bathroom: {
        bathroomType: formData.bathroomType as 'master' | 'guest' | 'powder' | 'ensuite',
        currentLayout: formData.currentLayout as 'functional' | 'needs-improvement' | 'complete-remodel',
        squareFootage: parseInt(formData.squareFootage),
        ceilingHeight: parseFloat(formData.ceilingHeight),
        hasWindows: formData.hasWindows,
        hasVentilation: formData.hasVentilation,
      },
    });
    onNext();
  };

  const isValid = formData.bathroomType && formData.currentLayout && formData.squareFootage && formData.ceilingHeight;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <Label className="text-navy font-medium">Bathroom Type *</Label>
        <RadioGroup
          value={formData.bathroomType}
          onValueChange={(value) => setFormData({ ...formData, bathroomType: value })}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {[
            { value: "master", label: "Master Bathroom", description: "Primary bedroom bathroom" },
            { value: "guest", label: "Guest Bathroom", description: "Shared or guest bathroom" },
            { value: "powder", label: "Powder Room", description: "Half bath, no shower/tub" },
            { value: "ensuite", label: "Ensuite", description: "Bedroom ensuite bathroom" },
          ].map((option) => (
            <label
              key={option.value}
              className={`flex items-center space-x-3 border-2 p-4 cursor-pointer transition-all touch-target ${
                formData.bathroomType === option.value
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

      <div className="space-y-3">
        <Label className="text-navy font-medium">Current Layout Condition *</Label>
        <RadioGroup
          value={formData.currentLayout}
          onValueChange={(value) => setFormData({ ...formData, currentLayout: value })}
          className="space-y-3"
        >
          {[
            { value: "functional", label: "Functional", description: "Works well, just needs updates" },
            { value: "needs-improvement", label: "Needs Improvement", description: "Some layout changes needed" },
            { value: "complete-remodel", label: "Complete Remodel", description: "Full layout redesign required" },
          ].map((option) => (
            <label
              key={option.value}
              className={`flex items-center space-x-3 border-2 p-4 cursor-pointer transition-all touch-target ${
                formData.currentLayout === option.value
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="squareFootage" className="text-navy font-medium">
            Square Footage *
          </Label>
          <Input
            id="squareFootage"
            type="number"
            placeholder="e.g., 60"
            min="1"
            value={formData.squareFootage}
            onChange={(e) => setFormData({ ...formData, squareFootage: e.target.value })}
            required
          />
          <div className="text-sm text-gray-600">Approximate size in square feet</div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ceilingHeight" className="text-navy font-medium">
            Ceiling Height *
          </Label>
          <Input
            id="ceilingHeight"
            type="number"
            step="0.5"
            placeholder="e.g., 8.5"
            min="7"
            max="15"
            value={formData.ceilingHeight}
            onChange={(e) => setFormData({ ...formData, ceilingHeight: e.target.value })}
            required
          />
          <div className="text-sm text-gray-600">Height in feet</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label className="text-navy font-medium">Windows</Label>
          <RadioGroup
            value={formData.hasWindows.toString()}
            onValueChange={(value) => setFormData({ ...formData, hasWindows: value === "true" })}
            className="flex space-x-6"
          >
            <label className="flex items-center space-x-2 cursor-pointer touch-target">
              <RadioGroupItem value="true" />
              <span>Yes, has windows</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer touch-target">
              <RadioGroupItem value="false" />
              <span>No windows</span>
            </label>
          </RadioGroup>
        </div>

        <div className="space-y-3">
          <Label className="text-navy font-medium">Ventilation</Label>
          <RadioGroup
            value={formData.hasVentilation.toString()}
            onValueChange={(value) => setFormData({ ...formData, hasVentilation: value === "true" })}
            className="flex space-x-6"
          >
            <label className="flex items-center space-x-2 cursor-pointer touch-target">
              <RadioGroupItem value="true" />
              <span>Has fan/vent</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer touch-target">
              <RadioGroupItem value="false" />
              <span>No ventilation</span>
            </label>
          </RadioGroup>
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
          Next: Renovation Scope
        </Button>
      </div>
    </form>
  );
}