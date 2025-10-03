"use client";

import { useEffect, useState } from 'react';
import { RateCardsAPI, RateLine, ProjectMultiplier } from '@/lib/rate-cards-api';
import { Button } from '@/components/ui/button';
import { ClientAuthCheck } from '@/components/auth/ClientAuthCheck';

function RateCardsAdminContent() {
  const [rateLines, setRateLines] = useState<Record<string, RateLine>>({});
  const [multipliers, setMultipliers] = useState<Record<string, ProjectMultiplier>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingRate, setEditingRate] = useState<string | null>(null);
  const [editingMultiplier, setEditingMultiplier] = useState<string | null>(null);
  const [editingMultiplierValue, setEditingMultiplierValue] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rateData, multiplierData] = await Promise.all([
        RateCardsAPI.getRateLines(),
        RateCardsAPI.getProjectMultipliers()
      ]);
      setRateLines(rateData);
      setMultipliers(multiplierData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load rate cards');
    } finally {
      setLoading(false);
    }
  };

  const handleRateUpdate = async (lineCode: string, field: 'base_price' | 'price_per_unit' | 'line_name', value: string | number) => {
    const numericValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numericValue) && field !== 'line_name') return;

    setSaving(true);
    try {
      const success = await RateCardsAPI.updateRateLine(lineCode, {
        [field]: field === 'line_name' ? value : numericValue
      });

      if (success) {
        setRateLines(prev => ({
          ...prev,
          [lineCode]: {
            ...prev[lineCode],
            [field]: field === 'line_name' ? value : numericValue
          }
        }));
      } else {
        throw new Error('Update failed');
      }
    } catch (err) {
      setError(`Failed to update ${lineCode}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const startEditingMultiplier = (code: string, currentValue: number) => {
    setEditingMultiplier(code);
    setEditingMultiplierValue(currentValue.toString());
  };

  const finishEditingMultiplier = async (code: string) => {
    const percent = parseFloat(editingMultiplierValue);
    if (isNaN(percent)) {
      setEditingMultiplier(null);
      return;
    }

    setSaving(true);
    try {
      const success = await RateCardsAPI.updateProjectMultiplier(code, percent);

      if (success) {
        setMultipliers(prev => ({
          ...prev,
          [code]: {
            ...prev[code],
            default_percent: percent
          }
        }));
        setEditingMultiplier(null);
        setError(null); // Clear any previous errors
      } else {
        throw new Error('Update failed');
      }
    } catch (err) {
      setError(`Failed to update ${code}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const cancelEditingMultiplier = () => {
    setEditingMultiplier(null);
    setEditingMultiplierValue('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral mx-auto mb-4"></div>
          <p className="text-navy font-semibold">Loading rate cards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-offwhite flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-navy mb-4">Error Loading Rate Cards</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <Button onClick={loadData} className="btn-coral">
            Try Again
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
          <h1 className="text-2xl font-bold text-navy">Rate Card Management</h1>
          <p className="text-gray-600">Edit labor pricing and project multipliers</p>
        </div>
      </header>

      <main className="container-custom py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Rate Lines */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-navy mb-6">Labor Rate Lines</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Code</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Description</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-700">Unit</th>
                    <th className="text-right py-3 px-2 font-semibold text-gray-700">Base Price</th>
                    <th className="text-right py-3 px-2 font-semibold text-gray-700">Price/Unit</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(rateLines).map((rate) => (
                    <tr key={rate.line_code} className="border-b border-gray-100">
                      <td className="py-3 px-2 font-mono text-sm">{rate.line_code}</td>
                      <td className="py-3 px-2">
                        {editingRate === `${rate.line_code}_name` ? (
                          <input
                            type="text"
                            value={rate.line_name}
                            onChange={(e) => handleRateUpdate(rate.line_code, 'line_name', e.target.value)}
                            onBlur={() => setEditingRate(null)}
                            onKeyDown={(e) => e.key === 'Enter' && setEditingRate(null)}
                            className="w-full p-1 border rounded text-sm"
                            autoFocus
                          />
                        ) : (
                          <span 
                            onClick={() => setEditingRate(`${rate.line_code}_name`)}
                            className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                          >
                            {rate.line_name}
                          </span>
                        )}
                      </td>
                      <td className="text-center py-3 px-2 text-sm">{rate.unit}</td>
                      <td className="text-right py-3 px-2">
                        {editingRate === `${rate.line_code}_base` ? (
                          <input
                            type="number"
                            step="0.01"
                            value={rate.base_price}
                            onChange={(e) => handleRateUpdate(rate.line_code, 'base_price', e.target.value)}
                            onBlur={() => setEditingRate(null)}
                            onKeyDown={(e) => e.key === 'Enter' && setEditingRate(null)}
                            className="w-24 p-1 border rounded text-sm text-right"
                            autoFocus
                          />
                        ) : (
                          <span 
                            onClick={() => setEditingRate(`${rate.line_code}_base`)}
                            className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                          >
                            ${rate.base_price.toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="text-right py-3 px-2">
                        {editingRate === `${rate.line_code}_unit` ? (
                          <input
                            type="number"
                            step="0.01"
                            value={rate.price_per_unit}
                            onChange={(e) => handleRateUpdate(rate.line_code, 'price_per_unit', e.target.value)}
                            onBlur={() => setEditingRate(null)}
                            onKeyDown={(e) => e.key === 'Enter' && setEditingRate(null)}
                            className="w-24 p-1 border rounded text-sm text-right"
                            autoFocus
                          />
                        ) : (
                          <span 
                            onClick={() => setEditingRate(`${rate.line_code}_unit`)}
                            className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                          >
                            ${rate.price_per_unit.toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="text-center py-3 px-2">
                        <button
                          onClick={() => setEditingRate(`${rate.line_code}_name`)}
                          className="text-coral hover:text-coral-dark text-sm"
                          disabled={saving}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Project Multipliers */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-navy mb-6">Project Multipliers</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Code</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Name</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-700">Basis</th>
                    <th className="text-right py-3 px-2 font-semibold text-gray-700">Default %</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(multipliers).map((mult) => (
                    <tr key={mult.code} className="border-b border-gray-100">
                      <td className="py-3 px-2 font-mono text-sm">{mult.code}</td>
                      <td className="py-3 px-2">{mult.name}</td>
                      <td className="text-center py-3 px-2 text-sm capitalize">
                        {mult.basis.replace('_', ' ')}
                      </td>
                      <td className="text-right py-3 px-2">
                        {editingMultiplier === mult.code ? (
                          <input
                            type="number"
                            step="0.1"
                            value={editingMultiplierValue}
                            onChange={(e) => setEditingMultiplierValue(e.target.value)}
                            onBlur={() => finishEditingMultiplier(mult.code)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                finishEditingMultiplier(mult.code);
                              } else if (e.key === 'Escape') {
                                cancelEditingMultiplier();
                              }
                            }}
                            className="w-20 p-1 border rounded text-sm text-right"
                            autoFocus
                            disabled={saving}
                          />
                        ) : (
                          <span 
                            onClick={() => startEditingMultiplier(mult.code, mult.default_percent)}
                            className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                          >
                            {mult.default_percent}%
                          </span>
                        )}
                      </td>
                      <td className="text-center py-3 px-2">
                        <button
                          onClick={() => startEditingMultiplier(mult.code, mult.default_percent)}
                          className="text-coral hover:text-coral-dark text-sm"
                          disabled={saving}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">How to Edit Rate Cards</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Click on any price or description to edit it inline</li>
              <li>• Press Enter or click away to save changes</li>
              <li>• Base prices are fixed costs, price/unit is per square foot or item</li>
              <li>• Project multipliers are percentages applied to labor subtotals</li>
              <li>• Changes are saved immediately to the database</li>
            </ul>
          </div>

        </div>
      </main>
    </div>
  );
}

export default function RateCardsAdminPage() {
  return (
    <ClientAuthCheck>
      <RateCardsAdminContent />
    </ClientAuthCheck>
  );
}