// Default design configurations for different price levels
import { DefaultDesignLevel, DesignConfig } from './types';

export const DEFAULT_DESIGNS: Record<'budget' | 'mid' | 'high', DesignConfig> = {
  budget: {
    bathroomType: "Sink & Toilet",
    wallTileCoverage: "Half way up",
    bathroomSize: "small",
    items: {
      floorTile: "FL-CER-12X12-WHI",
      wallTile: "WL-CER-3X6-WHI", 
      vanity: "VAN-24-WHI-LAM",
      toilet: "TOI-ROUND-WHI-STD",
      faucet: "FAU-CHR-SING-BAS",
      mirror: "MIR-24-REC-BAS",
      lighting: "LIT-VAN-CHR-BAS"
    }
  },
  
  mid: {
    bathroomType: "Tub & Shower",
    wallTileCoverage: "Floor to ceiling",
    bathroomSize: "normal",
    items: {
      floorTile: "FL-POR-12X24-GRY",
      wallTile: "WL-POR-3X6-GRY",
      showerFloorTile: "SF-MOS-2X2-GRY",
      accentTile: "AC-NAT-6X12-MAR",
      vanity: "VAN-36-ESP-QUA",
      tub: "TUB-ALC-60-WHI",
      tubFiller: "TF-BRU-FLR-STD",
      toilet: "TOI-ELONG-WHI-COM",
      shower: "SHO-GLZ-60-CLR",
      faucet: "FAU-BRU-SING-MID",
      glazing: "GLZ-FRA-CHR-STD",
      mirror: "MIR-36-REC-LED",
      towelBar: "TB-BRU-24-STD",
      toiletPaperHolder: "TP-BRU-STD",
      hook: "HK-BRU-SING-STD",
      lighting: "LIT-VAN-BRU-LED"
    }
  },

  high: {
    bathroomType: "Walk-in Shower",
    wallTileCoverage: "Floor to ceiling", 
    bathroomSize: "large",
    items: {
      floorTile: "FL-NAT-12X24-MAR",
      wallTile: "WL-NAT-6X12-MAR",
      showerFloorTile: "SF-NAT-HEX-MAR",
      accentTile: "AC-NAT-12X12-VEI",
      vanity: "VAN-48-WAL-QUA",
      shower: "SHO-CUS-72-FRA",
      faucet: "FAU-MAT-RAI-PRM",
      glazing: "GLZ-FRA-MAT-PRM",
      mirror: "MIR-48-LED-BAC",
      towelBar: "TB-MAT-30-PRM",
      toiletPaperHolder: "TP-MAT-PRM",
      hook: "HK-MAT-DBL-PRM",
      lighting: "LIT-PEN-MAT-LED"
    }
  }
};

export function getDefaultDesign(level: 'budget' | 'mid' | 'high'): DefaultDesignLevel {
  return {
    level,
    config: DEFAULT_DESIGNS[level]
  };
}