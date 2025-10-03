"use client";

import { QuoteFormData } from "@/types/quote";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface StepProps {
  data: Partial<QuoteFormData>;
  onUpdate: (data: Partial<QuoteFormData>) => void;
  onNext: () => void;
  onBack?: () => void;
  isFirst?: boolean;
}

export function Step0QuoteName({ data, onUpdate, onNext, isFirst }: StepProps) {
  const [quoteName, setQuoteName] = useState(data.quote_name || "");
  const [error, setError] = useState("");

  const handleContinue = () => {
    if (!quoteName.trim()) {
      setError("Please enter a name for your quote");
      return;
    }

    onUpdate({ quote_name: quoteName.trim() });
    onNext();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-navy mb-4">Name Your Quote</h2>
        <p className="text-gray-600">
          Give this quote a memorable name to help you identify it later.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="quote_name" className="block text-sm font-medium text-gray-700 mb-2">
            Quote Name *
          </label>
          <input
            type="text"
            id="quote_name"
            value={quoteName}
            onChange={(e) => {
              setQuoteName(e.target.value);
              setError("");
            }}
            placeholder="e.g., Main Floor Bathroom, Master Ensuite, Condo Unit 4B"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-transparent"
            autoFocus
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
          <p className="mt-2 text-sm text-gray-500">
            This name is for your reference only and won't be shown to the customer.
          </p>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <div>
          {/* Empty div for spacing */}
        </div>
        <Button onClick={handleContinue} className="btn-coral">
          Continue →
        </Button>
      </div>
    </div>
  );
}
