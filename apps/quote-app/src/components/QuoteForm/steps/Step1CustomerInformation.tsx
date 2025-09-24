import { QuoteStepProps } from "@/types/quote";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// Helper functions for validation
const formatPhoneNumber = (phone: string) => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Format as (XXX) XXX-XXXX
  if (cleaned.length >= 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  } else if (cleaned.length >= 6) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length >= 3) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  }
  return cleaned;
};

const isValidEmail = (email: string) => {
  if (!email) return true; // Optional field
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export function Step1CustomerInformation({ data, onUpdate, onNext, isFirst }: QuoteStepProps) {
  const [formData, setFormData] = useState({
    customer_name: data.customer_name || "",
    customer_email: data.customer_email || "",
    customer_phone: data.customer_phone || "",
    project_address: data.project_address || "",
  });

  const [errors, setErrors] = useState({
    customer_email: "",
    customer_phone: "",
  });

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setFormData({ ...formData, customer_phone: formatted });

    // Clear phone error when user starts typing
    if (errors.customer_phone) {
      setErrors({ ...errors, customer_phone: "" });
    }
  };

  const handleEmailChange = (value: string) => {
    setFormData({ ...formData, customer_email: value });

    // Validate email on change
    if (value && !isValidEmail(value)) {
      setErrors({ ...errors, customer_email: "Please enter a valid email address" });
    } else {
      setErrors({ ...errors, customer_email: "" });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate before submitting
    const newErrors = { customer_email: "", customer_phone: "" };

    if (formData.customer_email && !isValidEmail(formData.customer_email)) {
      newErrors.customer_email = "Please enter a valid email address";
    }

    // Check if there are any errors
    if (newErrors.customer_email || newErrors.customer_phone) {
      setErrors(newErrors);
      return;
    }

    onUpdate({
      customer_name: formData.customer_name.trim(),
      customer_email: formData.customer_email.trim() || undefined,
      customer_phone: formData.customer_phone.trim() || undefined,
      project_address: formData.project_address.trim(),
    });
    onNext();
  };

  const isValid = formData.customer_name.trim() &&
                  formData.project_address.trim() &&
                  !errors.customer_email &&
                  !errors.customer_phone;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Name */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-navy">Customer Name *</h3>
        <input
          type="text"
          value={formData.customer_name}
          onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-coral focus:border-coral text-base touch-target"
          placeholder="Enter customer's full name"
          required
        />
      </div>

      {/* Project Address */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-navy">Project Address *</h3>
        <textarea
          value={formData.project_address}
          onChange={(e) => setFormData({ ...formData, project_address: e.target.value })}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-coral focus:border-coral text-base touch-target resize-none"
          placeholder="Enter the complete project address"
          rows={3}
          required
        />
      </div>

      {/* Customer Email */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-navy">Email Address</h3>
        <p className="text-sm text-gray-600">Optional - for sending quote updates</p>
        <input
          type="email"
          value={formData.customer_email}
          onChange={(e) => handleEmailChange(e.target.value)}
          className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-coral focus:border-coral text-base touch-target ${
            errors.customer_email
              ? 'border-red-300 bg-red-50'
              : 'border-gray-200'
          }`}
          placeholder="customer@example.com"
        />
        {errors.customer_email && (
          <p className="text-red-600 text-sm">{errors.customer_email}</p>
        )}
      </div>

      {/* Customer Phone */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-navy">Phone Number</h3>
        <p className="text-sm text-gray-600">Optional - for project coordination</p>
        <input
          type="tel"
          value={formData.customer_phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-coral focus:border-coral text-base touch-target ${
            errors.customer_phone
              ? 'border-red-300 bg-red-50'
              : 'border-gray-200'
          }`}
          placeholder="(555) 123-4567"
          maxLength={14}
        />
        {errors.customer_phone && (
          <p className="text-red-600 text-sm">{errors.customer_phone}</p>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          size="sm"
          className="btn-coral touch-target text-sm px-4 py-2"
          disabled={!isValid}
        >
          Next: Project Details
        </Button>
      </div>
    </form>
  );
}