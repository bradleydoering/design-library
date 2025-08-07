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

export interface UniversalBathConfig {
  bathroomTypes: BathroomTypeConfig[];
  wallTileCoverages: WallTileCoverageConfig[];
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

    // Apply wall tile coverage to the base configuration
    const includedItems = { ...bathroomTypeConfig.includedItems };
    
    // For dry-only bathrooms (Sink & Toilet), respect the wall tile coverage setting
    if (config.type === "Sink & Toilet") {
      includedItems.wallTile = config.wallTileCoverage !== "None";
      includedItems.accentTile = config.wallTileCoverage !== "None";
    }

    const universalToggles = {
      bathroomType: config.type,
      wallTileCoverage: config.wallTileCoverage,
      bathroomSize: config.size,
      includedItems
    };

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
    const response = await fetch('/api/admin/universal-config');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const result = await response.json();
    return result.config;
  } catch (error) {
    console.error('Error loading universal configuration:', error);
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
      if (typeof window !== 'undefined') {
        try {
          // Load universal configuration from database
          const universalConf = await loadUniversalConfig();
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
          console.error('Error loading configurations:', error);
        }
        setIsLoaded(true);
      }
    };

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
      } catch (error) {
        console.error('Failed to apply universal toggles:', error);
        // Note: We don't throw here to avoid breaking the UI
      } finally {
        setIsApplying(false);
      }
    }
  };

  // Apply initial configuration on load if it exists
  useEffect(() => {
    if (isLoaded && bathroomConfig && universalConfig) {
      applyUniversalToggles(bathroomConfig, universalConfig).catch(error => {
        console.error('Failed to apply initial universal toggles:', error);
      });
    }
  }, [isLoaded, universalConfig]); // Only run when first loaded and config is available

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
    refreshUniversalConfig,
    isLoaded,
    isApplying
  };
}