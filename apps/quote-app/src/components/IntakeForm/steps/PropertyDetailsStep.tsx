import { FormStepProps } from "@/types/intake";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";

export function PropertyDetailsStep({ data, onUpdate, onNext, isFirst }: FormStepProps) {
  const [formData, setFormData] = useState({
    address: data.property?.address || "",
    buildingType: data.property?.buildingType || "",
    yearBuilt: data.property?.yearBuilt?.toString() || "",
    propertySize: data.property?.propertySize?.toString() || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      property: {
        address: formData.address,
        buildingType: formData.buildingType as 'house' | 'condo' | 'townhouse',
        yearBuilt: formData.yearBuilt && formData.yearBuilt.trim() ? parseInt(formData.yearBuilt) : undefined,
        propertySize: formData.propertySize && formData.propertySize.trim() ? parseInt(formData.propertySize) : undefined,
      },
    });
    onNext();
  };

  const isValid = formData.address && formData.buildingType;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="address" className="text-navy font-medium">
          Property Address *
        </Label>
        <Input
          id="address"
          type="text"
          placeholder="123 Main Street, City, Province"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          required
        />
      </div>

      <div className="space-y-3">
        <Label className="text-navy font-medium">Building Type *</Label>
        <RadioGroup
          value={formData.buildingType}
          onValueChange={(value) => setFormData({ ...formData, buildingType: value })}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            { value: "house", label: "Single Family House", description: "Detached house" },
            { value: "condo", label: "Condominium", description: "Apartment or condo unit" },
            { value: "townhouse", label: "Townhouse", description: "Attached townhouse" },
          ].map((option) => (
            <label
              key={option.value}
              className={`flex items-center space-x-3 border-2 p-4 cursor-pointer transition-all touch-target ${
                formData.buildingType === option.value
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
          <Label htmlFor="yearBuilt" className="text-navy font-medium">
            Year Built (Optional)
          </Label>
          <Input
            id="yearBuilt"
            type="number"
            placeholder="e.g., 1995"
            min="1900"
            max={new Date().getFullYear()}
            value={formData.yearBuilt}
            onChange={(e) => setFormData({ ...formData, yearBuilt: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="propertySize" className="text-navy font-medium">
            Property Size (sq ft, Optional)
          </Label>
          <Input
            id="propertySize"
            type="number"
            placeholder="e.g., 2000"
            min="0"
            value={formData.propertySize}
            onChange={(e) => setFormData({ ...formData, propertySize: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button
          type="submit"
          size="ipad"
          className="btn-coral touch-target"
          disabled={!isValid}
        >
          Next: Bathroom Details
        </Button>
      </div>
    </form>
  );
}