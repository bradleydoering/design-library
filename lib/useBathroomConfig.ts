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

// Helper function to apply universal toggles to backend
const applyUniversalToggles = async (config: BathroomConfig) => {
  try {
    // Define which items should be included based on bathroom type
    const getIncludedItems = (bathroomType: string) => {
      const baseItems = {
        floorTile: true,
        vanity: true,
        toilet: true,
        faucet: true,
        mirror: true,
        towelBar: true,
        toiletPaperHolder: true,
        hook: true,
        lighting: true
      };

      // Determine if this bathroom type has wet areas that need wall/accent tiles
      const hasWetArea = ["Bathtub", "Walk-in Shower", "Tub & Shower"].includes(bathroomType);
      
      // Wall and accent tiles logic:
      // - Always include for wet areas (bathtub, shower configurations)
      // - For dry areas, respect the wallTileCoverage setting
      const wallTile = hasWetArea || config.wallTileCoverage !== "None";
      const accentTile = hasWetArea || config.wallTileCoverage !== "None";

      switch (bathroomType) {
        case "Bathtub":
          return { ...baseItems, wallTile, accentTile, tub: true, tubFiller: true, shower: true, glazing: true, showerFloorTile: true };
        case "Walk-in Shower":
          return { ...baseItems, wallTile, accentTile, tub: false, tubFiller: false, shower: true, glazing: true, showerFloorTile: true };
        case "Tub & Shower":
          return { ...baseItems, wallTile, accentTile, tub: true, tubFiller: true, shower: true, glazing: true, showerFloorTile: true };
        case "Sink & Toilet":
          return { ...baseItems, wallTile, accentTile, tub: false, tubFiller: false, shower: false, glazing: false, showerFloorTile: false };
        default:
          return { ...baseItems, wallTile, accentTile };
      }
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