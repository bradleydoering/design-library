import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const { squareFootageConfig } = await request.json();

    if (!squareFootageConfig) {
      return NextResponse.json(
        { error: "Square footage configuration is required" },
        { status: 400 }
      );
    }

    // Read the current data
    const dataPath = path.join(process.cwd(), "data.json");
    if (!fs.existsSync(dataPath)) {
      return NextResponse.json(
        { error: "Data file not found" },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(dataPath, "utf8");
    const data = JSON.parse(fileContent);

    // Update the global square footage configuration
    data.SQUARE_FOOTAGE_CONFIG = squareFootageConfig;

    // Also update the BATHROOM_SIZES_SQFT for backward compatibility
    data.BATHROOM_SIZES_SQFT = squareFootageConfig;

    // Save the updated data
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf8");

    return NextResponse.json({
      success: true,
      message: "Square footage configuration updated successfully",
      squareFootageConfig
    });

  } catch (error) {
    console.error("Error updating square footage configuration:", error);
    return NextResponse.json(
      { error: "Failed to update square footage configuration" },
      { status: 500 }
    );
  }
}