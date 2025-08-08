import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface UniversalToggles {
  bathroomType: "Bathtub" | "Walk-in Shower" | "Tub & Shower" | "Sink & Toilet";
  wallTileCoverage: "None" | "Half way up" | "Floor to ceiling";
  bathroomSize: "small" | "normal" | "large";
  includedItems: {
    [key: string]: boolean;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { universalToggles }: { universalToggles: UniversalToggles } = await request.json();

    if (!universalToggles) {
      return NextResponse.json({ error: 'Missing universal toggles' }, { status: 400 });
    }

    // Debug logging
    console.log('=== APPLY-UNIVERSAL-TOGGLES ENDPOINT DEBUG ===');
    console.log('Received universalToggles:', JSON.stringify(universalToggles, null, 2));
    console.log('============================================');

    // Read the current data.json file
    const dataPath = path.join(process.cwd(), 'data.json');
    
    if (!fs.existsSync(dataPath)) {
      return NextResponse.json({ error: 'Data file not found' }, { status: 404 });
    }

    const fileContent = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(fileContent);

    if (!data.packages || !Array.isArray(data.packages)) {
      return NextResponse.json({ error: 'No packages found in data' }, { status: 404 });
    }

    // Get wall tile multiplier based on coverage
    const getWallTileMultiplier = (coverage: string) => {
      switch (coverage) {
        case "None": return 0;
        case "Half way up": return 0.5;
        case "Floor to ceiling": return 1.0;
        default: return 1.0;
      }
    };

    // Apply universal toggles to all packages
    data.packages.forEach((pkg: any) => {
      if (!pkg.items) pkg.items = {};

      // Apply bathroom type changes - use database configuration only
      const bathroomType = universalToggles.bathroomType;

      // Store wall tile coverage multiplier for reference (used in pricing calculations)
      const wallTileMultiplier = getWallTileMultiplier(universalToggles.wallTileCoverage);

      // Apply ALL included items toggles based on database configuration only
      Object.entries(universalToggles.includedItems).forEach(([itemType, included]) => {
        const skuMap: { [key: string]: string } = {
          floorTile: 'TILES_FLOOR_SKU',
          wallTile: 'TILES_WALL_SKU',
          showerFloorTile: 'TILES_SHOWER_FLOOR_SKU',
          accentTile: 'TILES_ACCENT_SKU',
          vanity: 'VANITY_SKU',
          tub: 'TUB_SKU',
          tubFiller: 'TUB_FILLER_SKU',
          toilet: 'TOILET_SKU',
          shower: 'SHOWER_SKU',
          faucet: 'FAUCET_SKU',
          glazing: 'GLAZING_SKU',
          mirror: 'MIRROR_SKU',
          towelBar: 'TOWEL_BAR_SKU',
          toiletPaperHolder: 'TOILET_PAPER_HOLDER_SKU',
          hook: 'HOOK_SKU',
          lighting: 'LIGHTING_SKU'
        };

        const skuField = skuMap[itemType];
        if (skuField) {
          if (included && pkg[skuField]) {
            // Include the item based on database configuration
            console.log(`INCLUDING ${itemType} for package ${pkg.NAME || pkg.ID}: ${pkg[skuField]}`);
            pkg.items[itemType] = pkg[skuField];
          } else if (!included) {
            // Exclude the item based on database configuration
            console.log(`EXCLUDING ${itemType} for package ${pkg.NAME || pkg.ID} (included=${included})`);
            delete pkg.items[itemType];
          }
        }
      });

      // Store the universal toggles configuration in the package for reference
      pkg.UNIVERSAL_TOGGLES = universalToggles;
      pkg.WALL_TILE_MULTIPLIER = wallTileMultiplier;
    });

    // Write back to file
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

    return NextResponse.json({ 
      success: true, 
      message: 'Universal toggles applied to all packages',
      packagesUpdated: data.packages.length,
      appliedSettings: universalToggles
    });

  } catch (error) {
    console.error('Error applying universal toggles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}