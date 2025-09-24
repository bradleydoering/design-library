import { QuoteStepProps } from "@/types/quote";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function Step7ElectricalWork({ data, onUpdate, onNext, onBack, isLast }: QuoteStepProps) {
  const [formData, setFormData] = useState({
    electrical_items: data.electrical_items?.toString() || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      electrical_items: parseInt(formData.electrical_items) || 0,
    });
    onNext();
  };

  const isValid = formData.electrical_items !== "" && parseInt(formData.electrical_items) >= 0;

  const selectCommonValue = (value: number) => {
    setFormData({ ...formData, electrical_items: value.toString() });
  };

  return (
    <div className="min-h-screen bg-coral text-white flex flex-col">
      {/* Header */}
      <div className="p-4 text-center">
        <h1 className="text-xl font-semibold mb-2">Electrical Work</h1>
        <p className="text-sm opacity-90">How many electrical items need to be changed or installed?</p>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white text-navy p-4 rounded-t-3xl">
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
          {/* Input */}
          <div className="space-y-3">
            <label htmlFor="electrical_items" className="block text-lg font-semibold">
              Number of Electrical Items
            </label>
            
            <div className="relative">
              <Input
                id="electrical_items"
                type="number"
                placeholder="4"
                value={formData.electrical_items}
                onChange={(e) => setFormData({ ...formData, electrical_items: e.target.value })}
                className="text-xl text-center py-3 text-navy bg-gray-50 border-2"
                min="0"
                required
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">
                items
              </div>
            </div>

            <div className="bg-blue-50 p-2 rounded border border-blue-200">
              <p className="text-blue-800 text-xs font-medium">
                Count each light, switch, outlet, fan, etc. that needs to be installed or replaced
              </p>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-blue-50 p-3 rounded border border-blue-200">
            <div className="flex items-start space-x-2">
              <div className="text-blue-600 text-sm">💡</div>
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-2">What counts as electrical items?</h4>
                <div className="grid grid-cols-2 gap-2 text-blue-800">
                  <div>
                    <h5 className="font-semibold text-blue-900 mb-1 text-xs">Lighting:</h5>
                    <ul className="space-y-0 text-xs">
                      <li>• Vanity lights</li>
                      <li>• Ceiling lights</li>
                      <li>• Recessed lights</li>
                      <li>• Light switches</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-semibold text-blue-900 mb-1 text-xs">Other Items:</h5>
                    <ul className="space-y-0 text-xs">
                      <li>• Electrical outlets</li>
                      <li>• GFCI outlets</li>
                      <li>• Exhaust fans</li>
                      <li>• Smart mirrors</li>
                    </ul>
                  </div>
                </div>
                <p className="text-xs text-blue-700 mt-1 font-medium">
                  Note: Each individual item counts as 1 unit. A 3-light vanity fixture = 1 unit.
                </p>
              </div>
            </div>
          </div>

          {/* Common Scenarios */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold">Common Scenarios:</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 0, label: "0", description: "No electrical" },
                { value: 2, label: "2", description: "Basic" },
                { value: 4, label: "4", description: "Standard" },
                { value: 6, label: "6+", description: "Full upgrade" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => selectCommonValue(option.value)}
                  className={`p-2 border-2 text-center transition-all touch-target ${
                    parseInt(formData.electrical_items) === option.value
                      ? "border-coral bg-coral/5"
                      : "border-gray-200 hover:border-coral/50"
                  }`}
                >
                  <div className="text-sm font-bold text-navy mb-1">{option.label}</div>
                  <div className="text-xs text-gray-600">{option.description}</div>
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
              {isLast ? "Next: Optional Upgrades" : "Next"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}