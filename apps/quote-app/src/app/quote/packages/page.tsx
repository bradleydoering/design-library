"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QuoteFormData } from "@/types/quote";
import { CalculatedQuote } from "@/lib/pricing";
import { MaterialsPricingAPI, PackageOption, CombinedQuote } from "@/lib/materials-pricing";
import { QuotesAPI } from "@/lib/quotes-api";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

function PackageSelectionContent() {
  const router = useRouter();
  const [formData, setFormData] = useState<QuoteFormData | null>(null);
  const [labourQuote, setLabourQuote] = useState<CalculatedQuote | null>(null);
  const [packageOptions, setPackageOptions] = useState<PackageOption[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [combinedQuote, setCombinedQuote] = useState<CombinedQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculatingMaterials, setCalculatingMaterials] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPackageData();
  }, []);

  const loadPackageData = async () => {
    try {
      setLoading(true);
      
      // Get stored quote data
      const storedData = sessionStorage.getItem('contractorQuoteData');
      const storedLabour = sessionStorage.getItem('calculatedLabourQuote');
      
      if (!storedData || !storedLabour) {
        setError('Quote data not found. Please start over.');
        return;
      }

      const parsedFormData: QuoteFormData = JSON.parse(storedData);
      const parsedLabour: CalculatedQuote = JSON.parse(storedLabour);
      
      setFormData(parsedFormData);
      setLabourQuote(parsedLabour);

      // Load package options
      const options = await MaterialsPricingAPI.getPackageOptions(parsedFormData);
      setPackageOptions(options);
      
      // Auto-select mid-tier package
      setSelectedPackage('mid');
      
    } catch (err) {
      console.error('Load package data error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load package options');
    } finally {
      setLoading(false);
    }
  };

  const handlePackageSelect = async (packageLevel: 'budget' | 'mid' | 'high') => {
    if (!formData || !labourQuote) return;
    
    try {
      setCalculatingMaterials(true);
      setSelectedPackage(packageLevel);
      
      // Calculate combined quote for selected package
      const combined = await MaterialsPricingAPI.calculateCombinedQuote(
        formData,
        labourQuote.totals.grand_total,
        packageLevel
      );
      
      setCombinedQuote(combined);
      
    } catch (err) {
      console.error('Package selection error:', err);
      setError(err instanceof Error ? err.message : 'Failed to calculate materials pricing');
    } finally {
      setCalculatingMaterials(false);
    }
  };

  const handleSaveQuote = async () => {
    if (!formData || !labourQuote || !combinedQuote) return;
    
    try {
      setSaving(true);
      
      // Create quote with labor data
      const quoteId = await QuotesAPI.createQuote(formData, labourQuote);
      
      // Update quote with materials data
      await MaterialsPricingAPI.updateQuoteWithMaterials(quoteId, combinedQuote);
      
      // Clear session storage
      sessionStorage.removeItem('contractorQuoteData');
      sessionStorage.removeItem('calculatedLabourQuote');
      
      // Navigate to dashboard
      router.push(`/dashboard?saved=true&quoteId=${quoteId}`);
      
    } catch (err) {
      console.error('Save quote error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save quote');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPackageColor = (level: string) => {
    switch (level) {
      case 'budget': return 'border-green-200 bg-green-50';
      case 'mid': return 'border-blue-200 bg-blue-50';
      case 'high': return 'border-purple-200 bg-purple-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getPackageAccent = (level: string) => {
    switch (level) {
      case 'budget': return 'text-green-700 border-green-300';
      case 'mid': return 'text-blue-700 border-blue-300';
      case 'high': return 'text-purple-700 border-purple-300';
      default: return 'text-gray-700 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral mx-auto mb-4"></div>
          <p className="text-navy font-semibold">Loading design packages...</p>
        </div>
      </div>
    );
  }

  if (error || !formData || !labourQuote) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-navy mb-4">Error Loading Packages</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <Button onClick={() => router.push('/quote/calculate')} className="btn-coral">
            Back to Quote
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-offwhite">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container-custom py-4">
          <h1 className="text-2xl font-bold text-navy">Choose Design Package</h1>
          <p className="text-gray-600">Select materials and finishes to complete your quote</p>
        </div>
      </header>

      <main className="container-custom py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Labor Quote Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-navy mb-4">Labor Quote Summary</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded">
                <div className="text-sm text-gray-600">Project Type</div>
                <div className="font-semibold capitalize">{formData.bathroom_type?.replace('_', ' ')}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <div className="text-sm text-gray-600">Floor Area</div>
                <div className="font-semibold">{formData.floor_sqft} sq ft</div>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <div className="text-sm text-gray-600">Labor Total</div>
                <div className="font-semibold text-coral">{formatCurrency(labourQuote.totals.grand_total)}</div>
              </div>
            </div>
          </div>

          {/* Package Selection */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-navy">Select Your Design Package</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {packageOptions.map((option) => (
                <div
                  key={option.level}
                  className={`relative rounded-lg border-2 p-6 cursor-pointer transition-all ${
                    selectedPackage === option.level
                      ? `${getPackageColor(option.level)} border-2 ${getPackageAccent(option.level)}`
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => handlePackageSelect(option.level)}
                >
                  {selectedPackage === option.level && (
                    <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full ${getPackageAccent(option.level)} flex items-center justify-center`}>
                      <span className="text-xs text-white font-bold">✓</span>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-navy mb-2">{option.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 min-h-[3rem]">{option.description}</p>
                    
                    <div className="mb-4">
                      <div className="text-2xl font-bold text-coral">
                        {formatCurrency(option.estimated_total)}
                      </div>
                      <div className="text-sm text-gray-500">Materials only</div>
                    </div>

                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePackageSelect(option.level);
                      }}
                      disabled={calculatingMaterials}
                      className={`w-full ${
                        selectedPackage === option.level
                          ? 'btn-coral' 
                          : 'btn-outline'
                      }`}
                    >
                      {calculatingMaterials && selectedPackage === option.level
                        ? 'Calculating...'
                        : selectedPackage === option.level
                        ? 'Selected'
                        : 'Select Package'
                      }
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Combined Quote Summary */}
          {combinedQuote && (
            <div className="bg-white rounded-lg shadow-lg border border-coral/20 p-6">
              <h2 className="text-xl font-bold text-navy mb-6">Complete Project Quote</h2>
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Labor Subtotal</span>
                      <span className="font-semibold">{formatCurrency(combinedQuote.labour_total)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Materials Subtotal</span>
                      <span className="font-semibold">{formatCurrency(combinedQuote.materials_total)}</span>
                    </div>
                  </div>
                  
                  <div className="bg-coral/10 p-4 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Project Total</div>
                      <div className="text-3xl font-bold text-coral">
                        {formatCurrency(combinedQuote.grand_total)}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {packageOptions.find(p => p.level === selectedPackage)?.name}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Materials Breakdown Preview */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-navy mb-3">Materials Included ({combinedQuote.materials_breakdown.items.length} items)</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    {combinedQuote.materials_breakdown.items.slice(0, 6).map((item, index) => (
                      <div key={index} className="flex justify-between py-1">
                        <span className="text-gray-600 truncate">{item.name}</span>
                        <span className="font-semibold ml-2">{formatCurrency(item.price)}</span>
                      </div>
                    ))}
                    {combinedQuote.materials_breakdown.items.length > 6 && (
                      <div className="text-gray-500 italic">
                        + {combinedQuote.materials_breakdown.items.length - 6} more items...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => router.push('/quote/calculate')} 
              variant="outline"
              disabled={saving}
            >
              ← Back to Labor Quote
            </Button>
            
            <Button
              onClick={handleSaveQuote}
              disabled={saving || !combinedQuote}
              className="btn-coral"
            >
              {saving ? 'Saving Complete Quote...' : 'Save Complete Quote'}
            </Button>
          </div>

        </div>
      </main>
    </div>
  );
}

export default function PackageSelectionPage() {
  return (
    <ProtectedRoute>
      <PackageSelectionContent />
    </ProtectedRoute>
  );
}