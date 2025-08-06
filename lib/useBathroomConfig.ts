/**
 * Custom hook for managing persistent bathroom configuration across pages
 */
import { useState, useEffect } from 'react';

export type BathroomConfig = {
  size: "small" | "normal" | "large";
  type: "Bathtub" | "Walk-in Shower" | "Tub & Shower" | "Sink & Toilet";
  wallTileCoverage: "None" | "Half way up" | "Floor to ceiling";
};

const DEFAULT_CONFIG: BathroomConfig = {
  size: "normal",
  type: "Tub & Shower", 
  wallTileCoverage: "Floor to ceiling"
};

const STORAGE_KEY = 'bathroom-config';

export function useBathroomConfig() {
  const [bathroomConfig, setBathroomConfigState] = useState<BathroomConfig>(DEFAULT_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

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

  // Save to localStorage whenever config changes
  const setBathroomConfig = (config: BathroomConfig) => {
    setBathroomConfigState(config);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      } catch (error) {
        console.error('Error saving bathroom config to localStorage:', error);
      }
    }
  };

  return {
    bathroomConfig,
    setBathroomConfig,
    isLoaded
  };
}