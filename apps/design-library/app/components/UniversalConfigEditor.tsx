"use client";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/app/Components";
import { Loader2, Save, RefreshCw, Plus, Trash2 } from "lucide-react";
import { getApiPath } from "../utils/apiPath";

interface WallTileCoverageValues {
  none: number;        
  halfwayUp: number;   
  floorToCeiling: number; 
}

interface BathroomTypeWallTileConfig {
  "Bathtub": WallTileCoverageValues;
  "Walk-in Shower": WallTileCoverageValues;
  "Tub & Shower": WallTileCoverageValues;
  "Sink & Toilet": WallTileCoverageValues;
}

interface SquareFootageConfig {
  small: {
    floorTile: number;
    wallTile: BathroomTypeWallTileConfig;
    showerFloorTile: number;
    accentTile: number;
  };
  normal: {
    floorTile: number;
    wallTile: BathroomTypeWallTileConfig;
    showerFloorTile: number;
    accentTile: number;
  };
  large: {
    floorTile: number;
    wallTile: BathroomTypeWallTileConfig;
    showerFloorTile: number;
    accentTile: number;
  };
}

interface BathroomTypeConfig {
  id: string;
  name: "Bathtub" | "Walk-in Shower" | "Tub & Shower" | "Sink & Toilet";
  includedItems: {
    floorTile: boolean;
    wallTile: boolean;
    showerFloorTile: boolean;
    accentTile: boolean;
    vanity: boolean;
    tub: boolean;
    tubFiller: boolean;
    toilet: boolean;
    shower: boolean;
    faucet: boolean;
    glazing: boolean;
    mirror: boolean;
    towelBar: boolean;
    toiletPaperHolder: boolean;
    hook: boolean;
    lighting: boolean;
  };
}

interface WallTileCoverageConfig {
  id: string;
  name: "None" | "Half way up" | "Floor to ceiling";
  multiplier: number;
  description: string;
}

interface UniversalBathConfig {
  bathroomTypes: BathroomTypeConfig[];
  wallTileCoverages: WallTileCoverageConfig[];
  squareFootageConfig: SquareFootageConfig;
  defaultSettings: {
    bathroomType: string;
    wallTileCoverage: string;
    bathroomSize: string;
  };
  updatedAt: string;
}

export default function UniversalConfigEditor() {
  const [config, setConfig] = useState<UniversalBathConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedType, setExpandedType] = useState<string | null>(null);

  // Load configuration on mount
  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(getApiPath('/api/admin/universal-config'));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setConfig(result.config);
      
      // Show setup message if using default config
      if (result.isDefault && result.message) {
        toast.error(
          'Database setup required: Create the universal_bath_config table in Supabase using the migration SQL.',
          { duration: 8000 }
        );
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
      toast.error('Failed to load configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfiguration = async () => {
    if (!config) return;

    setIsSaving(true);
    try {
      const response = await fetch(getApiPath('/api/admin/universal-config'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setConfig(result.config);
      toast.success('Universal configuration saved successfully!');
    } catch (error) {
      console.error('Error saving configuration:', error);
      toast.error('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const updateBathroomType = (typeId: string, updates: Partial<BathroomTypeConfig>) => {
    if (!config) return;

    setConfig({
      ...config,
      bathroomTypes: config.bathroomTypes.map(type =>
        type.id === typeId ? { ...type, ...updates } : type
      )
    });
  };

  const updateIncludedItem = (typeId: string, itemKey: string, included: boolean) => {
    if (!config) return;

    setConfig({
      ...config,
      bathroomTypes: config.bathroomTypes.map(type =>
        type.id === typeId 
          ? {
              ...type,
              includedItems: {
                ...type.includedItems,
                [itemKey]: included
              }
            }
          : type
      )
    });
  };


  const updateWallTileCoverage = (coverageId: string, updates: Partial<WallTileCoverageConfig>) => {
    if (!config) return;

    setConfig({
      ...config,
      wallTileCoverages: config.wallTileCoverages.map(coverage =>
        coverage.id === coverageId ? { ...coverage, ...updates } : coverage
      )
    });
  };

  const updateSquareFootage = (size: 'small' | 'normal' | 'large', itemType: string, value: number) => {
    if (!config) return;

    setConfig({
      ...config,
      squareFootageConfig: {
        ...config.squareFootageConfig,
        [size]: {
          ...config.squareFootageConfig[size],
          [itemType]: value
        }
      }
    });
  };

  const updateWallTileSquareFootage = (
    size: 'small' | 'normal' | 'large', 
    bathroomType: "Bathtub" | "Walk-in Shower" | "Tub & Shower" | "Sink & Toilet",
    coverage: 'none' | 'halfwayUp' | 'floorToCeiling',
    value: number
  ) => {
    if (!config) return;

    setConfig({
      ...config,
      squareFootageConfig: {
        ...config.squareFootageConfig,
        [size]: {
          ...config.squareFootageConfig[size],
          wallTile: {
            ...config.squareFootageConfig[size].wallTile,
            [bathroomType]: {
              ...config.squareFootageConfig[size].wallTile[bathroomType],
              [coverage]: value
            }
          }
        }
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading universal configuration...</span>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Failed to load configuration</p>
        <Button onClick={loadConfiguration} className="mt-4">
          <RefreshCw size={16} className="mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Universal Bath Configuration</h2>
            <p className="text-gray-600">Manage bathroom types, included items, and square footage calculations</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={loadConfiguration}
              disabled={isLoading || isSaving}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Reload
            </Button>
            <Button
              onClick={saveConfiguration}
              disabled={isLoading || isSaving}
              className="btn-coral cropped-corners flex items-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Save Configuration
            </Button>
          </div>
        </div>

        {config.updatedAt && (
          <p className="text-sm text-gray-500">
            Last updated: {new Date(config.updatedAt).toLocaleString()}
          </p>
        )}
      </div>

      {/* Bathroom Types Configuration */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bathroom Types</h3>
        <div className="space-y-4">
          {config.bathroomTypes.map((type) => (
            <div key={type.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900">{type.name}</h4>
                <Button
                  onClick={() => setExpandedType(expandedType === type.id ? null : type.id)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm"
                >
                  {expandedType === type.id ? 'Collapse' : 'Expand'}
                </Button>
              </div>

              {expandedType === type.id && (
                <div className="space-y-6">
                  {/* Included Items */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Included Items</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(type.includedItems).map(([itemKey, included]) => (
                        <label key={itemKey} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={included}
                            onChange={(e) => updateIncludedItem(type.id, itemKey, e.target.checked)}
                            className="rounded border-gray-300 text-coral focus:ring-coral"
                          />
                          <span className="text-sm text-gray-700 capitalize">
                            {itemKey.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Square Footage Configuration */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Square Footage Configuration</h3>
        
        {/* Basic Tile Types (Floor, Shower Floor, Accent) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-800">Floor Tile</h4>
            {(['small', 'normal', 'large'] as const).map((size) => (
              <div key={size} className="flex items-center space-x-2">
                <label className="text-sm text-gray-600 w-16 capitalize">{size}:</label>
                <input
                  type="number"
                  value={config.squareFootageConfig[size].floorTile}
                  onChange={(e) => updateSquareFootage(size, 'floorTile', parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-coral focus:border-coral"
                  min="0"
                  step="1"
                />
                <span className="text-xs text-gray-500">sqft</span>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-800">Shower Floor Tile</h4>
            {(['small', 'normal', 'large'] as const).map((size) => (
              <div key={size} className="flex items-center space-x-2">
                <label className="text-sm text-gray-600 w-16 capitalize">{size}:</label>
                <input
                  type="number"
                  value={config.squareFootageConfig[size].showerFloorTile}
                  onChange={(e) => updateSquareFootage(size, 'showerFloorTile', parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-coral focus:border-coral"
                  min="0"
                  step="1"
                />
                <span className="text-xs text-gray-500">sqft</span>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-800">Accent Tile</h4>
            {(['small', 'normal', 'large'] as const).map((size) => (
              <div key={size} className="flex items-center space-x-2">
                <label className="text-sm text-gray-600 w-16 capitalize">{size}:</label>
                <input
                  type="number"
                  value={config.squareFootageConfig[size].accentTile}
                  onChange={(e) => updateSquareFootage(size, 'accentTile', parseFloat(e.target.value) || 0)}
                  className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-coral focus:border-coral"
                  min="0"
                  step="1"
                />
                <span className="text-xs text-gray-500">sqft</span>
              </div>
            ))}
          </div>
        </div>

        {/* Wall Tile Configuration Matrix */}
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-4">Wall Tile Square Footage Matrix</h4>
          <p className="text-sm text-gray-600 mb-4">Configure wall tile square footage for each bathroom size, type, and coverage combination</p>
          
          {(['small', 'normal', 'large'] as const).map((size) => (
            <div key={size} className="mb-6">
              <h5 className="text-sm font-semibold text-gray-700 mb-3 capitalize">{size} Bathrooms</h5>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-200 px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Bathroom Type
                      </th>
                      <th className="border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                        None
                      </th>
                      <th className="border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                        Half Way Up
                      </th>
                      <th className="border border-gray-200 px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                        Floor to Ceiling
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(["Bathtub", "Walk-in Shower", "Tub & Shower", "Sink & Toilet"] as const).map((bathroomType) => (
                      <tr key={bathroomType}>
                        <td className="border border-gray-200 px-3 py-2 text-sm font-medium text-gray-900">
                          {bathroomType}
                        </td>
                        {(['none', 'halfwayUp', 'floorToCeiling'] as const).map((coverage) => (
                          <td key={coverage} className="border border-gray-200 px-3 py-2 text-center">
                            <input
                              type="number"
                              value={config.squareFootageConfig[size].wallTile[bathroomType][coverage]}
                              onChange={(e) => updateWallTileSquareFootage(size, bathroomType, coverage, parseFloat(e.target.value) || 0)}
                              className="w-16 px-2 py-1 text-sm text-center border border-gray-300 rounded focus:ring-coral focus:border-coral"
                              min="0"
                              step="1"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wall Tile Coverage Configuration */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Wall Tile Coverage Options</h3>
        <div className="space-y-4">
          {config.wallTileCoverages.map((coverage) => (
            <div key={coverage.id} className="border border-gray-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={coverage.name}
                    onChange={(e) => updateWallTileCoverage(coverage.id, { name: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-coral focus:border-coral"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Multiplier</label>
                  <input
                    type="number"
                    value={coverage.multiplier}
                    onChange={(e) => updateWallTileCoverage(coverage.id, { multiplier: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-coral focus:border-coral"
                    min="0"
                    max="1"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={coverage.description}
                    onChange={(e) => updateWallTileCoverage(coverage.id, { description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-coral focus:border-coral"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Default Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Bathroom Type</label>
            <select
              value={config.defaultSettings.bathroomType}
              onChange={(e) => setConfig({
                ...config,
                defaultSettings: { ...config.defaultSettings, bathroomType: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-coral focus:border-coral"
            >
              {config.bathroomTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Wall Tile Coverage</label>
            <select
              value={config.defaultSettings.wallTileCoverage}
              onChange={(e) => setConfig({
                ...config,
                defaultSettings: { ...config.defaultSettings, wallTileCoverage: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-coral focus:border-coral"
            >
              {config.wallTileCoverages.map((coverage) => (
                <option key={coverage.id} value={coverage.id}>{coverage.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Default Bathroom Size</label>
            <select
              value={config.defaultSettings.bathroomSize}
              onChange={(e) => setConfig({
                ...config,
                defaultSettings: { ...config.defaultSettings, bathroomSize: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-coral focus:border-coral"
            >
              <option value="small">Small</option>
              <option value="normal">Normal</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}