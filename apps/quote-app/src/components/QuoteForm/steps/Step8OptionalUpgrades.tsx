import { QuoteStepProps } from "@/types/quote";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Step8OptionalUpgrades({ data, onUpdate, onNext, onBack, isLast }: QuoteStepProps) {
  const [formData, setFormData] = useState({
    heated_floors: data.upgrades?.heated_floors ?? false,
    heated_towel_rack: data.upgrades?.heated_towel_rack ?? false,
    bidet_addon: data.upgrades?.bidet_addon ?? false,
    smart_mirror: data.upgrades?.smart_mirror ?? false,
    premium_exhaust_fan: data.upgrades?.premium_exhaust_fan ?? false,
    built_in_niche: data.upgrades?.built_in_niche ?? false,
    shower_bench: data.upgrades?.shower_bench ?? false,
    safety_grab_bars: data.upgrades?.safety_grab_bars ?? false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      upgrades: formData,
    });
    onNext();
  };

  const handleUpgradeChange = (upgrade: keyof typeof formData, checked: boolean) => {
    setFormData(prev => ({ ...prev, [upgrade]: checked }));
  };

  const selectedUpgrades = Object.values(formData).filter(Boolean).length;

  const upgradeOptions = [
    {
      key: 'heated_floors' as const,
      title: 'Heated Floors',
      description: 'Electric underfloor heating system',
      icon: '🔥'
    },
    {
      key: 'heated_towel_rack' as const,
      title: 'Heated Towel Rack', 
      description: 'Electric heated towel warmer',
      icon: '🏠'
    },
    {
      key: 'bidet_addon' as const,
      title: 'Bidet Add-on',
      description: 'Bidet attachment or smart toilet seat',
      icon: '🚿'
    },
    {
      key: 'smart_mirror' as const,
      title: 'Smart Mirror',
      description: 'LED mirror with anti-fog and touch controls',
      icon: '🪞'
    },
    {
      key: 'premium_exhaust_fan' as const,
      title: 'Premium Exhaust Fan',
      description: 'Quiet, high-efficiency ventilation fan',
      icon: '💨'
    },
    {
      key: 'built_in_niche' as const,
      title: 'Built-in Niche/Shelving',
      description: 'Recessed shower niche or wall shelving',
      icon: '📦'
    },
    {
      key: 'shower_bench' as const,
      title: 'Shower Bench',
      description: 'Built-in tiled shower bench seating',
      icon: '🪑'
    },
    {
      key: 'safety_grab_bars' as const,
      title: 'Safety Grab Bars',
      description: 'ADA-compliant grab bars for accessibility',
      icon: '🤝'
    }
  ];

  return (
    <div className="min-h-screen bg-coral text-white flex flex-col">
      {/* Header */}
      <div className="p-4 text-center">
        <h1 className="text-xl font-semibold mb-2">Optional Upgrades</h1>
        <p className="text-sm opacity-90">Select any additional features you'd like to include</p>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white text-navy p-4 rounded-t-3xl">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
          
          {/* Upgrade Options Grid */}
          <div className="grid grid-cols-1 gap-3">
            {upgradeOptions.map((option) => (
              <label
                key={option.key}
                className={`flex items-start space-x-3 p-3 border-2 cursor-pointer transition-all touch-target ${
                  formData[option.key]
                    ? "border-coral bg-coral/5"
                    : "border-gray-200 hover:border-coral/50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData[option.key]}
                  onChange={(e) => handleUpgradeChange(option.key, e.target.checked)}
                  className="w-4 h-4 text-coral border-2 border-gray-300 rounded focus:ring-coral focus:ring-1 mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm">{option.icon}</span>
                    <h3 className="text-sm font-semibold text-navy">{option.title}</h3>
                  </div>
                  <p className="text-xs text-gray-600">{option.description}</p>
                </div>
              </label>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-gray-50 p-3 rounded border">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-10 h-10 bg-coral/10 rounded-full flex items-center justify-center">
                <span className="text-lg">✓</span>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-navy">
                  {selectedUpgrades === 0 ? "No upgrades selected" : `${selectedUpgrades} upgrade${selectedUpgrades > 1 ? 's' : ''} selected`}
                </div>
                <div className="text-xs text-gray-600">
                  {selectedUpgrades === 0 ? "You can always add these later" : "Great choices! These will be included in your quote."}
                </div>
              </div>
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
            >
              {isLast ? "Calculate Quote" : "Next"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}