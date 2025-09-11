/**
 * Custom hook for managing persistent bathroom configuration across pages
 */
import { useState, useEffect } from 'react';

export type BathroomConfig = {
  size: "small" | "normal" | "large";
  type: "Bathtub" | "Walk-in Shower" | "Tub & Shower" | "Sink & Toilet";
  wallTileCoverage: "None" | "Half way up" | "Floor to ceiling";
};

interface UniversalToggles {
  bathroomType: "Bathtub" | "Walk-in Shower" | "Tub & Shower" | "Sink & Toilet";
  wallTileCoverage: "None" | "Half way up" | "Floor to ceiling";
  bathroomSize: "small" | "normal" | "large";
  includedItems: {
    [key: string]: boolean;
  };
}

const DEFAULT_CONFIG: BathroomConfig = {
  size: "normal",
  type: "Tub & Shower", 
  wallTileCoverage: "Floor to ceiling"
};

const STORAGE_KEY = 'bathroom-config';

// Helper function to get database configuration and apply it to backend
const applyUniversalToggles = async (config: BathroomConfig) => {
  try {
    // Fetch the current database configuration to respect it
    let databaseConfig = null;
    try {
      const configResponse = await fetch('/api/admin/universal-config');
      if (configResponse.ok) {
        const result = await configResponse.json();
        if (result.success && result.config) {
          databaseConfig = result.config;
        }
      }
    } catch (error) {
      console.warn('Could not load database config, using fallback logic:', error);
    }

    // Define which items should be included based on database configuration OR fallback logic
    const getIncludedItems = (bathroomType: string) => {
      // Use database configuration as single source of truth if available
      if (databaseConfig && databaseConfig.bathroomTypes) {
        const bathroomTypeConfig = databaseConfig.bathroomTypes.find(
          (bt: any) => bt.name === bathroomType
        );
        
        if (bathroomTypeConfig && bathroomTypeConfig.includedItems) {
          return { ...bathroomTypeConfig.includedItems };
        }
      }

      // Fallback logic only if database config is not available
      // Default to including ALL items to avoid excluding anything the user expects
      console.warn(`Using fallback logic for ${bathroomType} - database config not available. Defaulting to include all items.`);
      
      return {
        floorTile: true,
        wallTile: true,
        showerFloorTile: true,
        accentTile: true,
        vanity: true,
        tub: true,
        tubFiller: true,
        toilet: true,
        shower: true,
        faucet: true,
        glazing: true,
        mirror: true,
        towelBar: true,
        toiletPaperHolder: true,
        hook: true,
        lighting: true
      };
    };

    const universalToggles: UniversalToggles = {
      bathroomType: config.type,
      wallTileCoverage: config.wallTileCoverage,
      bathroomSize: config.size,
      includedItems: getIncludedItems(config.type)
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

export function useBathroomConfig() {
  const [bathroomConfig, setBathroomConfigState] = useState<BathroomConfig>(DEFAULT_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedConfig = localStorage.getItem(STORAGE_KEY);
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig);
          setBathroomConfigState(parsedConfig);
        }
      } catch (error) {
        console.error('Error loading bathroom config from localStorage:', error);
      }
      setIsLoaded(true);
    }
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

    // Apply changes to backend packages
    setIsApplying(true);
    try {
      await applyUniversalToggles(config);
    } catch (error) {
      console.error('Failed to apply universal toggles:', error);
      // Note: We don't throw here to avoid breaking the UI
    } finally {
      setIsApplying(false);
    }
  };

  // Apply initial configuration on load if it exists
  useEffect(() => {
    if (isLoaded && bathroomConfig) {
      applyUniversalToggles(bathroomConfig).catch(error => {
        console.error('Failed to apply initial universal toggles:', error);
      });
    }
  }, [isLoaded]); // Only run when first loaded

  return {
    bathroomConfig,
    setBathroomConfig,
    isLoaded,
    isApplying
  };
}