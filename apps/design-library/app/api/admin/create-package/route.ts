import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const packageData = await request.json();
    
    // Generate a unique ID for the package
    const packageId = Date.now().toString();
    
    // Create the package in the format that matches existing packages
    const newPackage = {
      ID: packageId,
      NAME: packageData.name,
      CATEGORY: packageData.category,
      DESCRIPTION: packageData.description,
      TILES_FLOOR_SKU: packageData.items.floorTile || "",
      TILES_WALL_SKU: packageData.items.wallTile || "",
      TILES_SHOWER_FLOOR_SKU: packageData.items.showerFloorTile || "",
      TILES_ACCENT_SKU: packageData.items.accentTile || "",
      VANITY_SKU: packageData.items.vanity || "",
      TUB_SKU: packageData.items.tub || "",
      TUB_FILLER_SKU: packageData.items.tubFiller || "",
      TOILET_SKU: packageData.items.toilet || "",
      SHOWER_SKU: packageData.items.shower || "",
      FAUCET_SKU: packageData.items.faucet || "",
      GLAZING_SKU: packageData.items.glazing || "",
      MIRROR_SKU: packageData.items.mirror || "",
      TOWEL_BAR_SKU: packageData.items.towelBar || "",
      TOILET_PAPER_HOLDER_SKU: packageData.items.toiletPaperHolder || "",
      HOOK_SKU: packageData.items.hook || "",
      LIGHTING_SKU: packageData.items.lighting || "",
      IMAGE_MAIN: packageData.images.main || "",
      IMAGE_01: packageData.images.additional[0] || "",
      IMAGE_02: packageData.images.additional[1] || "",
      IMAGE_03: packageData.images.additional[2] || "",
      VISION: `Custom package created on ${new Date().toLocaleDateString()} with ${packageData.description}`,
      ESTIMATED_PRICE: packageData.estimatedPrice || 0,
      CREATED_AT: packageData.createdAt || new Date().toISOString(),
    };

    // For now, just log the package (in production, you'd save to database)
    console.log("New package would be saved:", newPackage);
    
    // In a real implementation, you would:
    // 1. Add the package to your database
    // 2. Update the data.json file (if using file-based storage)
    // 3. Trigger any necessary cache invalidation
    
    // Placeholder for data.json update (commented out for safety)
    /*
    const dataPath = path.join(process.cwd(), 'data.json');
    if (fs.existsSync(dataPath)) {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      data.packages.push(newPackage);
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    }
    */

    return NextResponse.json({ 
      success: true, 
      packageId: packageId,
      message: "Package created successfully",
      package: newPackage 
    });
    
  } catch (error: any) {
    console.error("Error creating package:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}