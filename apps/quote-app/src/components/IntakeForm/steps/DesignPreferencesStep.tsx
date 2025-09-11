import { FormStepProps } from "@/types/intake";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";

export function DesignPreferencesStep({ data, onUpdate, onNext, onBack }: FormStepProps) {
  const [formData, setFormData] = useState({
    stylePreference: data.preferences?.stylePreference || "",
    colorScheme: data.preferences?.colorScheme || "",
    budgetRange: data.preferences?.budgetRange || "",
    timeframe: data.preferences?.timeframe || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      preferences: {
        stylePreference: formData.stylePreference as 'modern' | 'traditional' | 'transitional' | 'contemporary',
        colorScheme: formData.colorScheme as 'light' | 'dark' | 'neutral' | 'bold',
        budgetRange: formData.budgetRange as 'budget' | 'mid' | 'high' | 'luxury',
        timeframe: formData.timeframe as 'asap' | '1-3-months' | '3-6-months' | 'flexible',
      },
    });
    onNext();
  };

  const isValid = formData.stylePreference && formData.colorScheme && formData.budgetRange && formData.timeframe;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-4">
        <Label className="text-navy font-medium text-lg">Style Preference *</Label>
        <RadioGroup
          value={formData.stylePreference}
          onValueChange={(value) => setFormData({ ...formData, stylePreference: value })}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {[
            { value: "modern", label: "Modern", description: "Clean lines, minimalist, sleek" },
            { value: "traditional", label: "Traditional", description: "Classic, timeless, ornate details" },
            { value: "transitional", label: "Transitional", description: "Blend of modern and traditional" },
            { value: "contemporary", label: "Contemporary", description: "Current trends, bold statements" },
          ].map((option) => (
            <label
              key={option.value}
              className={`flex items-center space-x-3 border-2 p-4 cursor-pointer transition-all touch-target ${
                formData.stylePreference === option.value
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
        <Label className="text-navy font-medium text-lg">Color Scheme *</Label>
        <RadioGroup
          value={formData.colorScheme}
          onValueChange={(value) => setFormData({ ...formData, colorScheme: value })}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {[
            { value: "light", label: "Light & Bright", description: "Whites, light grays, soft tones" },
            { value: "dark", label: "Dark & Dramatic", description: "Dark colors, rich tones" },
            { value: "neutral", label: "Neutral & Warm", description: "Beiges, taupes, earth tones" },
            { value: "bold", label: "Bold & Colorful", description: "Vibrant colors, statement pieces" },
          ].map((option) => (
            <label
              key={option.value}
              className={`flex items-center space-x-3 border-2 p-4 cursor-pointer transition-all touch-target ${
                formData.colorScheme === option.value
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
        <Label className="text-navy font-medium text-lg">Budget Range *</Label>
        <RadioGroup
          value={formData.budgetRange}
          onValueChange={(value) => setFormData({ ...formData, budgetRange: value })}
          className="space-y-3"
        >
          {[
            { value: "budget", label: "Budget-Friendly", description: "$15,000 - $25,000", subtitle: "Quality basics, smart choices" },
            { value: "mid", label: "Mid-Range", description: "$25,000 - $40,000", subtitle: "Good quality, some premium options" },
            { value: "high", label: "High-End", description: "$40,000 - $60,000", subtitle: "Premium materials and fixtures" },
            { value: "luxury", label: "Luxury", description: "$60,000+", subtitle: "Top-tier everything, custom features" },
          ].map((option) => (
            <label
              key={option.value}
              className={`flex items-center space-x-3 border-2 p-4 cursor-pointer transition-all touch-target ${
                formData.budgetRange === option.value
                  ? "border-coral bg-coral/5"
                  : "border-gray-200 hover:border-coral/50"
              } [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]`}
            >
              <RadioGroupItem value={option.value} />
              <div>
                <div className="font-medium text-navy">{option.label}</div>
                <div className="text-sm font-medium text-coral">{option.description}</div>
                <div className="text-sm text-gray-600">{option.subtitle}</div>
              </div>
            </label>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <Label className="text-navy font-medium text-lg">Timeline *</Label>
        <RadioGroup
          value={formData.timeframe}
          onValueChange={(value) => setFormData({ ...formData, timeframe: value })}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {[
            { value: "asap", label: "ASAP", description: "Ready to start immediately" },
            { value: "1-3-months", label: "1-3 Months", description: "Planning phase, start soon" },
            { value: "3-6-months", label: "3-6 Months", description: "Still researching options" },
            { value: "flexible", label: "Flexible", description: "No rush, when timing is right" },
          ].map((option) => (
            <label
              key={option.value}
              className={`flex items-center space-x-3 border-2 p-4 cursor-pointer transition-all touch-target ${
                formData.timeframe === option.value
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
          Next: Contact Information
        </Button>
      </div>
    </form>
  );
}