import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

const DEFAULT_CONFIG: UniversalBathConfig = {
  bathroomTypes: [
    {
      id: "bathtub",
      name: "Bathtub",
      includedItems: {
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
        lighting: true,
      }
    },
    {
      id: "walk-in-shower",
      name: "Walk-in Shower",
      includedItems: {
        floorTile: true,
        wallTile: true,
        showerFloorTile: true,
        accentTile: true,
        vanity: true,
        tub: false,
        tubFiller: false,
        toilet: true,
        shower: true,
        faucet: true,
        glazing: true,
        mirror: true,
        towelBar: true,
        toiletPaperHolder: true,
        hook: true,
        lighting: true,
      }
    },
    {
      id: "tub-and-shower",
      name: "Tub & Shower",
      includedItems: {
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
        lighting: true,
      }
    },
    {
      id: "sink-and-toilet",
      name: "Sink & Toilet",
      includedItems: {
        floorTile: true,
        wallTile: false,
        showerFloorTile: false,
        accentTile: false,
        vanity: true,
        tub: false,
        tubFiller: false,
        toilet: true,
        shower: false,
        faucet: true,
        glazing: false,
        mirror: true,
        towelBar: true,
        toiletPaperHolder: true,
        hook: true,
        lighting: true,
      }
    },
  ],
  squareFootageConfig: {
    small: {
      floorTile: 40,
      wallTile: {
        "Bathtub": { none: 20, halfwayUp: 55, floorToCeiling: 110 },
        "Walk-in Shower": { none: 30, halfwayUp: 65, floorToCeiling: 120 },
        "Tub & Shower": { none: 40, halfwayUp: 75, floorToCeiling: 130 },
        "Sink & Toilet": { none: 0, halfwayUp: 30, floorToCeiling: 85 }
      },
      showerFloorTile: 9,
      accentTile: 15,
    },
    normal: {
      floorTile: 60,
      wallTile: {
        "Bathtub": { none: 25, halfwayUp: 60, floorToCeiling: 115 },
        "Walk-in Shower": { none: 30, halfwayUp: 65, floorToCeiling: 120 },
        "Tub & Shower": { none: 40, halfwayUp: 75, floorToCeiling: 130 },
        "Sink & Toilet": { none: 0, halfwayUp: 30, floorToCeiling: 85 }
      },
      showerFloorTile: 9,
      accentTile: 20,
    },
    large: {
      floorTile: 80,
      wallTile: {
        "Bathtub": { none: 30, halfwayUp: 70, floorToCeiling: 130 },
        "Walk-in Shower": { none: 35, halfwayUp: 80, floorToCeiling: 150 },
        "Tub & Shower": { none: 45, halfwayUp: 90, floorToCeiling: 160 },
        "Sink & Toilet": { none: 0, halfwayUp: 40, floorToCeiling: 100 }
      },
      showerFloorTile: 9,
      accentTile: 25,
    },
  },
  wallTileCoverages: [
    { id: "none", name: "None", multiplier: 0, description: "No wall tiles in dry areas" },
    { id: "half-way", name: "Half way up", multiplier: 0.5, description: "Wall tiles up to 4 feet high" },
    { id: "floor-to-ceiling", name: "Floor to ceiling", multiplier: 1.0, description: "Wall tiles from floor to ceiling" },
  ],
  defaultSettings: {
    bathroomType: "tub-and-shower",
    wallTileCoverage: "floor-to-ceiling",
    bathroomSize: "normal"
  },
  updatedAt: new Date().toISOString()
};

// GET - Retrieve current universal configuration
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Try to get existing config
    const { data, error } = await supabase
      .from('universal_bath_config')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching universal config:', error);
      return NextResponse.json({ error: 'Failed to fetch configuration' }, { status: 500 });
    }

    // If no config exists, return default
    if (!data) {
      return NextResponse.json({ 
        success: true,
        config: DEFAULT_CONFIG,
        isDefault: true
      });
    }

    return NextResponse.json({
      success: true,
      config: data.config,
      isDefault: false,
      updatedAt: data.updated_at
    });

  } catch (error) {
    console.error('Error in GET universal config:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Save universal configuration
export async function POST(request: NextRequest) {
  try {
    const { config }: { config: UniversalBathConfig } = await request.json();

    if (!config) {
      return NextResponse.json({ error: 'Configuration is required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update the timestamp
    config.updatedAt = new Date().toISOString();

    // Upsert the configuration (insert or update)
    const { data, error } = await supabase
      .from('universal_bath_config')
      .upsert({
        id: 1, // Single row configuration
        config: config,
        updated_at: config.updatedAt
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving universal config:', error);
      return NextResponse.json({ 
        error: `Failed to save configuration: ${error.message}` 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Universal bathroom configuration saved successfully',
      config: data.config,
      updatedAt: data.updated_at
    });

  } catch (error) {
    console.error('Error in POST universal config:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}