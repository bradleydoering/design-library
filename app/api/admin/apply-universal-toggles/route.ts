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

      // Apply bathroom type changes
      const bathroomType = universalToggles.bathroomType;
      
      // Reset all bathroom fixtures first
      delete pkg.items.tub;
      delete pkg.items.tubFiller;
      delete pkg.items.shower;
      delete pkg.items.glazing;
      delete pkg.items.showerFloorTile;
      
      // Apply based on bathroom type
      switch (bathroomType) {
        case "Bathtub":
          if (universalToggles.includedItems.tub && pkg.TUB_SKU) {
            pkg.items.tub = pkg.TUB_SKU;
          }
          if (universalToggles.includedItems.tubFiller && pkg.TUB_FILLER_SKU) {
            pkg.items.tubFiller = pkg.TUB_FILLER_SKU;
          }
          break;
        case "Walk-in Shower":
          if (universalToggles.includedItems.shower && pkg.SHOWER_SKU) {
            pkg.items.shower = pkg.SHOWER_SKU;
          }
          if (universalToggles.includedItems.glazing && pkg.GLAZING_SKU) {
            pkg.items.glazing = pkg.GLAZING_SKU;
          }
          if (universalToggles.includedItems.showerFloorTile && pkg.TILES_SHOWER_FLOOR_SKU) {
            pkg.items.showerFloorTile = pkg.TILES_SHOWER_FLOOR_SKU;
          }
          break;
        case "Tub & Shower":
          if (universalToggles.includedItems.tub && pkg.TUB_SKU) {
            pkg.items.tub = pkg.TUB_SKU;
          }
          if (universalToggles.includedItems.tubFiller && pkg.TUB_FILLER_SKU) {
            pkg.items.tubFiller = pkg.TUB_FILLER_SKU;
          }
          if (universalToggles.includedItems.shower && pkg.SHOWER_SKU) {
            pkg.items.shower = pkg.SHOWER_SKU;
          }
          if (universalToggles.includedItems.glazing && pkg.GLAZING_SKU) {
            pkg.items.glazing = pkg.GLAZING_SKU;
          }
          if (universalToggles.includedItems.showerFloorTile && pkg.TILES_SHOWER_FLOOR_SKU) {
            pkg.items.showerFloorTile = pkg.TILES_SHOWER_FLOOR_SKU;
          }
          break;
        case "Sink & Toilet":
          // Only vanity and toilet, no tub/shower items
          break;
      }

      // Apply wall tile coverage changes
      const wallTileMultiplier = getWallTileMultiplier(universalToggles.wallTileCoverage);
      
      // Determine if this bathroom type has wet areas that always need wall/accent tiles
      const hasWetArea = ["Bathtub", "Walk-in Shower", "Tub & Shower"].includes(bathroomType);
      
      // Wall tiles logic: always include for wet areas, respect coverage setting for dry areas only
      if (hasWetArea || universalToggles.wallTileCoverage !== "None") {
        // Include wall tiles 
        if (universalToggles.includedItems.wallTile && pkg.TILES_WALL_SKU) {
          pkg.items.wallTile = pkg.TILES_WALL_SKU;
        }
        if (universalToggles.includedItems.accentTile && pkg.TILES_ACCENT_SKU) {
          pkg.items.accentTile = pkg.TILES_ACCENT_SKU;
        }
      } else {
        // Only remove wall tiles if it's a dry-only bathroom (Sink & Toilet) with "None" coverage
        delete pkg.items.wallTile;
        delete pkg.items.accentTile;
      }

      // Apply all other included items toggles
      Object.entries(universalToggles.includedItems).forEach(([itemType, included]) => {
        if (itemType === 'wallTile' || itemType === 'accentTile') {
          // Already handled above
          return;
        }
        if (itemType === 'shower' || itemType === 'tub' || itemType === 'tubFiller' || 
            itemType === 'glazing' || itemType === 'showerFloorTile') {
          // Already handled in bathroom type section
          return;
        }

        const skuMap: { [key: string]: string } = {
          floorTile: 'TILES_FLOOR_SKU',
          vanity: 'VANITY_SKU',
          toilet: 'TOILET_SKU',
          faucet: 'FAUCET_SKU',
          mirror: 'MIRROR_SKU',
          towelBar: 'TOWEL_BAR_SKU',
          toiletPaperHolder: 'TOILET_PAPER_HOLDER_SKU',
          hook: 'HOOK_SKU',
          lighting: 'LIGHTING_SKU'
        };

        const skuField = skuMap[itemType];
        if (skuField) {
          if (included && pkg[skuField]) {
            pkg.items[itemType] = pkg[skuField];
          } else if (!included) {
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