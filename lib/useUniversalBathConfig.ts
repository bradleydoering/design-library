/**
 * Custom hook for managing universal bathroom configuration from Supabase
 */
import { useState, useEffect } from 'react';

export type BathroomConfig = {
  size: "small" | "normal" | "large";
  type: "Bathtub" | "Walk-in Shower" | "Tub & Shower" | "Sink & Toilet";
  wallTileCoverage: "None" | "Half way up" | "Floor to ceiling";
};

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
  sqftMultipliers: {
    small: {
      floorTile: number;
      wallTile: number;
      showerFloorTile: number;
      accentTile: number;
    };
    normal: {
      floorTile: number;
      wallTile: number;
      showerFloorTile: number;
      accentTile: number;
    };
    large: {
      floorTile: number;
      wallTile: number;
      showerFloorTile: number;
      accentTile: number;
    };
  };
}

interface WallTileCoverageConfig {
  id: string;
  name: "None" | "Half way up" | "Floor to ceiling";
  multiplier: number;
  description: string;
}

interface SquareFootageConfig {
  small: {
    floorTile: number;
    wallTile: {
      "Bathtub": { none: number; halfwayUp: number; floorToCeiling: number; };
      "Walk-in Shower": { none: number; halfwayUp: number; floorToCeiling: number; };
      "Tub & Shower": { none: number; halfwayUp: number; floorToCeiling: number; };
      "Sink & Toilet": { none: number; halfwayUp: number; floorToCeiling: number; };
    };
    showerFloorTile: number;
    accentTile: number;
  };
  normal: {
    floorTile: number;
    wallTile: {
      "Bathtub": { none: number; halfwayUp: number; floorToCeiling: number; };
      "Walk-in Shower": { none: number; halfwayUp: number; floorToCeiling: number; };
      "Tub & Shower": { none: number; halfwayUp: number; floorToCeiling: number; };
      "Sink & Toilet": { none: number; halfwayUp: number; floorToCeiling: number; };
    };
    showerFloorTile: number;
    accentTile: number;
  };
  large: {
    floorTile: number;
    wallTile: {
      "Bathtub": { none: number; halfwayUp: number; floorToCeiling: number; };
      "Walk-in Shower": { none: number; halfwayUp: number; floorToCeiling: number; };
      "Tub & Shower": { none: number; halfwayUp: number; floorToCeiling: number; };
      "Sink & Toilet": { none: number; halfwayUp: number; floorToCeiling: number; };
    };
    showerFloorTile: number;
    accentTile: number;
  };
}

export interface UniversalBathConfig {
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

const DEFAULT_CONFIG: BathroomConfig = {
  size: "normal",
  type: "Tub & Shower", 
  wallTileCoverage: "Floor to ceiling"
};

const STORAGE_KEY = 'bathroom-config';

// Helper function to apply universal toggles to backend using database config
const applyUniversalToggles = async (config: BathroomConfig, universalConfig: UniversalBathConfig) => {
  try {
    // Find the bathroom type configuration
    const bathroomTypeConfig = universalConfig.bathroomTypes.find(
      bt => bt.name === config.type
    );

    if (!bathroomTypeConfig) {
      throw new Error(`Bathroom type configuration not found for: ${config.type}`);
    }

    // Find the wall tile coverage configuration
    const wallTileCoverageConfig = universalConfig.wallTileCoverages.find(
      wtc => wtc.name === config.wallTileCoverage
    );

    if (!wallTileCoverageConfig) {
      throw new Error(`Wall tile coverage configuration not found for: ${config.wallTileCoverage}`);
    }

    // Use database configuration as-is without any overrides
    const includedItems = { ...bathroomTypeConfig.includedItems };

    const universalToggles = {
      bathroomType: config.type,
      wallTileCoverage: config.wallTileCoverage,
      bathroomSize: config.size,
      includedItems
    };

    // Debug logging to help identify issues
    console.log('=== APPLYING UNIVERSAL TOGGLES DEBUG ===');
    console.log('Bathroom Type:', config.type);
    console.log('Wall Tile Coverage:', config.wallTileCoverage);  
    console.log('Database Included Items for', config.type, ':', includedItems);
    console.log('Sending to apply-universal-toggles endpoint:', universalToggles);
    console.log('=====================================');

    const response = await fetch('/api/admin/apply-universal-toggles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ universalToggles })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Universal toggles applied successfully:', result);
    return result;
  } catch (error) {
    console.error('Error applying universal toggles:', error);
    throw error;
  }
};

// Load universal configuration from database
const loadUniversalConfig = async (): Promise<UniversalBathConfig | null> => {
  try {
    console.log('=== LOADING UNIVERSAL CONFIG ===');
    const response = await fetch('/api/admin/universal-config');
    console.log('Universal config response status:', response.status);
    
    if (!response.ok) {
      console.warn(`Universal config API unavailable (status: ${response.status}). This is normal in production or if server is not running.`);
      return null;
    }
    
    // Check if response is actually JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('Universal config API returned non-JSON response. Server may not be running.');
      return null;
    }
    
    const result = await response.json();
    console.log('Universal config result:', result);
    console.log('Universal config SUCCESS:', !!result.config);
    if (result.config) {
      console.log('Bathroom types loaded:', result.config.bathroomTypes?.length);
      console.log('Sink & Toilet hook setting:', result.config.bathroomTypes?.find((bt: any) => bt.name === 'Sink & Toilet')?.includedItems?.hook);
    }
    console.log('==============================');
    return result.config;
  } catch (error) {
    // Graceful handling - don't crash the app if config loading fails
    console.warn('Universal configuration unavailable:', error instanceof Error ? error.message : String(error));
    console.log('App will continue with default behavior.');
    return null;
  }
};

export function useUniversalBathConfig() {
  const [bathroomConfig, setBathroomConfigState] = useState<BathroomConfig>(DEFAULT_CONFIG);
  const [universalConfig, setUniversalConfig] = useState<UniversalBathConfig | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  // Load universal config and user settings on mount
  useEffect(() => {
    const loadConfigurations = async () => {
      console.log('useUniversalBathConfig: Starting loadConfigurations...');
      if (typeof window !== 'undefined') {
        try {
          // Load universal configuration from database
          console.log('useUniversalBathConfig: About to call loadUniversalConfig...');
          const universalConf = await loadUniversalConfig();
          console.log('useUniversalBathConfig: Received config:', !!universalConf);
          setUniversalConfig(universalConf);

          // Load user's current selection from localStorage
          const savedConfig = localStorage.getItem(STORAGE_KEY);
          if (savedConfig) {
            const parsedConfig = JSON.parse(savedConfig);
            setBathroomConfigState(parsedConfig);
          } else if (universalConf?.defaultSettings) {
            // Use default from database
            const defaultFromDB: BathroomConfig = {
              size: universalConf.defaultSettings.bathroomSize as any,
              type: universalConf.bathroomTypes.find(bt => bt.id === universalConf.defaultSettings.bathroomType)?.name || "Tub & Shower",
              wallTileCoverage: universalConf.wallTileCoverages.find(wtc => wtc.id === universalConf.defaultSettings.wallTileCoverage)?.name || "Floor to ceiling"
            };
            setBathroomConfigState(defaultFromDB);
          }
        } catch (error) {
          console.error('useUniversalBathConfig: Error loading configurations:', error);
        }
        console.log('useUniversalBathConfig: Setting isLoaded to true');
        setIsLoaded(true);
      } else {
        console.log('useUniversalBathConfig: window is undefined, skipping load');
      }
    };

    console.log('useUniversalBathConfig: useEffect triggered');
    loadConfigurations();
  }, []);

  // Save to localStorage and apply to backend whenever config changes
  const setBathroomConfig = async (config: BathroomConfig) => {
    setBathroomConfigState(config);
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      } catch (error) {
        console.error('Error saving bathroom config to localStorage:', error);
      }
    }

    // Apply changes to backend packages using database config
    if (universalConfig) {
      setIsApplying(true);
      try {
        await applyUniversalToggles(config, universalConfig);
        
        // Clear caches to force refresh of materials and package data
        if (typeof window !== 'undefined') {
          localStorage.removeItem('materials-data');
          console.log('Cleared materials cache after applying bathroom config changes');
        }
      } catch (error) {
        console.error('Failed to apply universal toggles:', error);
        // Note: We don't throw here to avoid breaking the UI
      } finally {
        setIsApplying(false);
      }
    }
  };

  // Apply initial configuration on load if it exists (only once)
  useEffect(() => {
    if (isLoaded && bathroomConfig && universalConfig) {
      console.log('Applying initial universal toggles once...');
      applyUniversalToggles(bathroomConfig, universalConfig).catch(error => {
        console.error('Failed to apply initial universal toggles:', error);
      });
    }
  }, [isLoaded]); // Only run when first loaded, not on every config change

  // Function to refresh universal configuration from database
  const refreshUniversalConfig = async () => {
    try {
      const universalConf = await loadUniversalConfig();
      setUniversalConfig(universalConf);
      return universalConf;
    } catch (error) {
      console.error('Error refreshing universal configuration:', error);
      return null;
    }
  };

  return {
    bathroomConfig,
    setBathroomConfig,
    universalConfig,
    squareFootageConfig: universalConfig?.squareFootageConfig,
    refreshUniversalConfig,
    isLoaded,
    isApplying
  };
}