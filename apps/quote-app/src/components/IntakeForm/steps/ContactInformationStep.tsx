import { FormStepProps } from "@/types/intake";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";

export function ContactInformationStep({ data, onUpdate, onNext, onBack, isLast }: FormStepProps) {
  const [formData, setFormData] = useState({
    firstName: data.contact?.firstName || "",
    lastName: data.contact?.lastName || "",
    email: data.contact?.email || "",
    phone: data.contact?.phone || "",
    preferredContactMethod: data.contact?.preferredContactMethod || "",
    bestTimeToContact: data.contact?.bestTimeToContact || "",
    additionalNotes: data.additionalNotes || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      contact: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        preferredContactMethod: formData.preferredContactMethod as 'email' | 'phone' | 'text',
        bestTimeToContact: formData.bestTimeToContact as 'morning' | 'afternoon' | 'evening' | 'anytime',
      },
      additionalNotes: formData.additionalNotes,
    });
    onNext();
  };

  const isValid = formData.firstName && formData.lastName && formData.email && formData.phone && formData.preferredContactMethod && formData.bestTimeToContact;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-navy font-medium">
            First Name *
          </Label>
          <Input
            id="firstName"
            type="text"
            placeholder="John"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-navy font-medium">
            Last Name *
          </Label>
          <Input
            id="lastName"
            type="text"
            placeholder="Doe"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-navy font-medium">
          Email Address *
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="john.doe@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-navy font-medium">
          Phone Number *
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="(555) 123-4567"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />
      </div>

      <div className="space-y-3">
        <Label className="text-navy font-medium">Preferred Contact Method *</Label>
        <RadioGroup
          value={formData.preferredContactMethod}
          onValueChange={(value) => setFormData({ ...formData, preferredContactMethod: value })}
          className="flex flex-wrap gap-4"
        >
          {[
            { value: "email", label: "Email" },
            { value: "phone", label: "Phone Call" },
            { value: "text", label: "Text Message" },
          ].map((option) => (
            <label
              key={option.value}
              className={`flex items-center space-x-3 border-2 p-4 cursor-pointer transition-all touch-target ${
                formData.preferredContactMethod === option.value
                  ? "border-coral bg-coral/5"
                  : "border-gray-200 hover:border-coral/50"
              } [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]`}
            >
              <RadioGroupItem value={option.value} />
              <span className="font-medium text-navy">{option.label}</span>
            </label>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label className="text-navy font-medium">Best Time to Contact *</Label>
        <RadioGroup
          value={formData.bestTimeToContact}
          onValueChange={(value) => setFormData({ ...formData, bestTimeToContact: value })}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { value: "morning", label: "Morning", description: "8AM - 12PM" },
            { value: "afternoon", label: "Afternoon", description: "12PM - 5PM" },
            { value: "evening", label: "Evening", description: "5PM - 8PM" },
            { value: "anytime", label: "Anytime", description: "Flexible" },
          ].map((option) => (
            <label
              key={option.value}
              className={`flex items-center space-x-3 border-2 p-4 cursor-pointer transition-all touch-target ${
                formData.bestTimeToContact === option.value
                  ? "border-coral bg-coral/5"
                  : "border-gray-200 hover:border-coral/50"
              } [clip-path:polygon(0.5rem_0%,100%_0%,100%_calc(100%-0.5rem),calc(100%-0.5rem)_100%,0%_100%,0%_0.5rem)]`}
            >
              <RadioGroupItem value={option.value} />
              <div>
                <div className="font-medium text-navy">{option.label}</div>
                <div className="text-xs text-gray-600">{option.description}</div>
              </div>
            </label>
          ))}
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="additionalNotes" className="text-navy font-medium">
          Additional Notes (Optional)
        </Label>
        <textarea
          id="additionalNotes"
          rows={4}
          placeholder="Any specific requirements, concerns, or details you'd like to share..."
          value={formData.additionalNotes}
          onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
          className="flex w-full border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none [clip-path:polygon(0.3rem_0%,100%_0%,100%_calc(100%-0.3rem),calc(100%-0.3rem)_100%,0%_100%,0%_0.3rem)]"
        />
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
          {isLast ? "Complete & View Packages" : "Next"}
        </Button>
      </div>
    </form>
  );
}