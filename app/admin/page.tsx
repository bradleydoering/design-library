"use client";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/app/Components";
import { Loader2, Eye, EyeOff, Save, RefreshCw } from "lucide-react";
import ImageGallery from "@/app/components/ImageGallery";
import PackageCreator from "@/app/components/PackageCreator";
import PackageEditor from "@/app/components/PackageEditor";
import ImageProcessor from "@/app/components/ImageProcessor";
import UniversalConfigEditor from "@/app/components/UniversalConfigEditor";

interface AdminData {
  packages: any[];
  materials: any;
}

interface WallTileCoverageConfig {
  none: number;        // Some wall tiles but none in dry area
  halfwayUp: number;   // Halfway up walls in dry areas  
  floorToCeiling: number; // All walls in entire bathroom
}

interface BathroomTypeConfig {
  "Bathtub": WallTileCoverageConfig;
  "Walk-in Shower": WallTileCoverageConfig;
  "Tub & Shower": WallTileCoverageConfig;
  "Sink & Toilet": WallTileCoverageConfig;
}

interface SquareFootageConfig {
  small: {
    floorTile: number;
    wallTile: BathroomTypeConfig;
    showerFloorTile: number;
    accentTile: number;
  };
  normal: {
    floorTile: number;
    wallTile: BathroomTypeConfig;
    showerFloorTile: number;
    accentTile: number;
  };
  large: {
    floorTile: number;
    wallTile: BathroomTypeConfig;
    showerFloorTile: number;
    accentTile: number;
  };
}

interface UniversalToggles {
  // Customer-facing selections (matches PackageConfiguration)
  bathroomType: "Bathtub" | "Walk-in Shower" | "Tub & Shower" | "Sink & Toilet";
  wallTileCoverage: "None" | "Half way up" | "Floor to ceiling";
  bathroomSize: "small" | "normal" | "large";
  
  // Internal item toggles
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

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [activeSection, setActiveSection] = useState<"pricing" | "gallery" | "packages" | "editor" | "processor" | "universal">("pricing");
  const [squareFootageConfig, setSquareFootageConfig] = useState<SquareFootageConfig>({
    small: {
      floorTile: 40,
      wallTile: {
        "Bathtub": {
          none: 20,        // Tub area only
          halfwayUp: 45,   // Tub + half dry walls
          floorToCeiling: 85 // Full bathroom walls
        },
        "Walk-in Shower": {
          none: 25,        // Shower area only
          halfwayUp: 50,   // Shower + half dry walls
          floorToCeiling: 100 // Full bathroom walls
        },
        "Tub & Shower": {
          none: 30,        // Tub + shower areas
          halfwayUp: 60,   // Tub + shower + half dry walls
          floorToCeiling: 110 // Full bathroom walls
        },
        "Sink & Toilet": {
          none: 0,         // No shower/tub, minimal wall tiles
          halfwayUp: 25,   // Half walls around vanity area
          floorToCeiling: 70 // Full powder room walls
        }
      },
      showerFloorTile: 9,
      accentTile: 15,
    },
    normal: {
      floorTile: 60,
      wallTile: {
        "Bathtub": {
          none: 25,
          halfwayUp: 55,
          floorToCeiling: 105
        },
        "Walk-in Shower": {
          none: 30,
          halfwayUp: 65,
          floorToCeiling: 120
        },
        "Tub & Shower": {
          none: 40,
          halfwayUp: 75,
          floorToCeiling: 130
        },
        "Sink & Toilet": {
          none: 0,
          halfwayUp: 30,
          floorToCeiling: 85
        }
      },
      showerFloorTile: 9,
      accentTile: 20,
    },
    large: {
      floorTile: 80,
      wallTile: {
        "Bathtub": {
          none: 30,
          halfwayUp: 70,
          floorToCeiling: 130
        },
        "Walk-in Shower": {
          none: 35,
          halfwayUp: 80,
          floorToCeiling: 150
        },
        "Tub & Shower": {
          none: 45,
          halfwayUp: 90,
          floorToCeiling: 160
        },
        "Sink & Toilet": {
          none: 0,
          halfwayUp: 40,
          floorToCeiling: 100
        }
      },
      showerFloorTile: 9,
      accentTile: 25,
    },
  });
  const [universalToggles, setUniversalToggles] = useState<UniversalToggles>({
    bathroomType: "Tub & Shower",
    wallTileCoverage: "Floor to ceiling",
    bathroomSize: "normal",
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
  });

  const ADMIN_PASSCODE = "CloudReno2025Admin!";

  const handleBathroomTypeChange = (type: "Bathtub" | "Walk-in Shower" | "Tub & Shower" | "Sink & Toilet") => {
    const newToggles = { ...universalToggles };
    newToggles.bathroomType = type;
    
    // Reset all bathroom fixtures
    newToggles.includedItems.tub = false;
    newToggles.includedItems.tubFiller = false;
    newToggles.includedItems.shower = false;
    newToggles.includedItems.glazing = false;
    newToggles.includedItems.showerFloorTile = false;
    newToggles.includedItems.vanity = true; // Always include vanity
    newToggles.includedItems.toilet = true; // Always include toilet
    
    switch (type) {
      case "Bathtub":
        newToggles.includedItems.tub = true;
        newToggles.includedItems.tubFiller = true;
        break;
      case "Walk-in Shower":
        newToggles.includedItems.shower = true;
        newToggles.includedItems.glazing = true;
        newToggles.includedItems.showerFloorTile = true;
        break;
      case "Tub & Shower":
        newToggles.includedItems.tub = true;
        newToggles.includedItems.tubFiller = true;
        newToggles.includedItems.shower = true;
        newToggles.includedItems.glazing = true;
        newToggles.includedItems.showerFloorTile = true;
        break;
      case "Sink & Toilet":
        // Only vanity and toilet (already set above)
        break;
    }
    
    setUniversalToggles(newToggles);
  };

  const handleWallTileCoverageChange = (coverage: "None" | "Half way up" | "Floor to ceiling") => {
    const newToggles = { ...universalToggles };
    newToggles.wallTileCoverage = coverage;
    
    if (coverage === "None") {
      newToggles.includedItems.wallTile = false;
      newToggles.includedItems.accentTile = false;
    } else {
      newToggles.includedItems.wallTile = true;
      newToggles.includedItems.accentTile = true;
    }
    
    setUniversalToggles(newToggles);
  };

  const applyUniversalToggles = async () => {
    if (!adminData?.packages) return;
    
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/apply-universal-toggles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ universalToggles })
      });

      if (response.ok) {
        toast.success("Universal settings applied to all packages");
        loadAdminData(); // Refresh data
      } else {
        toast.error("Failed to apply universal settings");
      }
    } catch (error) {
      toast.error("Error applying universal settings");
    } finally {
      setIsLoading(false);
    }
  };

  const getWallTileSqft = (
    coverage: string, 
    size: "small" | "normal" | "large",
    bathroomType: "Bathtub" | "Walk-in Shower" | "Tub & Shower" | "Sink & Toilet"
  ): number => {
    const wallTileConfig = squareFootageConfig[size].wallTile[bathroomType];
    switch (coverage) {
      case "None": return wallTileConfig.none;
      case "Half way up": return wallTileConfig.halfwayUp;
      case "Floor to ceiling": return wallTileConfig.floorToCeiling;
      default: return wallTileConfig.floorToCeiling;
    }
  };

  const handleLogin = () => {
    if (passcode === ADMIN_PASSCODE) {
      setIsAuthenticated(true);
      localStorage.setItem("adminAuth", "true");
      loadAdminData();
      toast.success("Access granted");
    } else {
      toast.error("Invalid passcode");
    }
  };

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/data");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Admin data loaded:", data);
      
      // Handle different possible data structures
      let packages = [];
      if (data.packages) {
        packages = data.packages;
      } else if (data.data?.packages) {
        packages = data.data.packages;
      } else if (Array.isArray(data)) {
        packages = data;
      }
      
      console.log("Packages found:", packages.length, packages);
      
      // Map individual material arrays to a materials object
      const materials = {
        tiles: data.tiles || [],
        vanities: data.vanities || [],
        tubs: data.tubs || [],
        tub_fillers: data.tub_fillers || [],
        toilets: data.toilets || [],
        faucets: data.faucets || [],
        showers: data.showers || [],
        shower_glazing: data.shower_glazing || [],
        mirrors: data.mirrors || [],
        towel_bars: data.towel_bars || [],
        toilet_paper_holders: data.toilet_paper_holders || [],
        hooks: data.hooks || [],
        lighting: data.lighting || [],
        logos: data.logos || [],
        colors: data.colors || []
      };
      
      setAdminData({ packages, materials });
      
      if (packages.length === 0) {
        toast.error("No packages found in data");
      }
    } catch (error) {
      console.error("Failed to load admin data:", error);
      toast.error(`Failed to load data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const transformPackageData = (pkg: any) => {
    // Transform raw package data to expected format
    return {
      ...pkg,
      items: {
        floorTile: pkg.TILES_FLOOR_SKU,
        wallTile: pkg.TILES_WALL_SKU,
        showerFloorTile: pkg.TILES_SHOWER_FLOOR_SKU,
        accentTile: pkg.TILES_ACCENT_SKU,
        vanity: pkg.VANITY_SKU,
        tub: pkg.TUB_SKU,
        tubFiller: pkg.TUB_FILLER_SKU,
        toilet: pkg.TOILET_SKU,
        shower: pkg.SHOWER_SKU,
        faucet: pkg.FAUCET_SKU,
        glazing: pkg.GLAZING_SKU,
        mirror: pkg.MIRROR_SKU,
        towelBar: pkg.TOWEL_BAR_SKU,
        toiletPaperHolder: pkg.TOILET_PAPER_HOLDER_SKU,
        hook: pkg.HOOK_SKU,
        lighting: pkg.LIGHTING_SKU,
      }
    };
  };

  const calculateSamplePackagePrice = (rawPkg: any, size: "small" | "normal" | "large"): number => {
    if (!adminData?.materials) return 0;
    
    const pkg = transformPackageData(rawPkg);
    let total = 0;
    const items = pkg.items || {};

    // Calculate tile prices using current universal configuration
    const tileItems = ["floorTile", "wallTile", "showerFloorTile", "accentTile"] as const;
    tileItems.forEach((tile) => {
      const sku = items[tile];
      if (sku && universalToggles.includedItems[tile]) {
        total += calculateTilePrice(pkg, tile, size);
      }
    });

    // Calculate other items
    total += calculateOtherItemsPrice(pkg);

    return total;
  };

  const calculateTilePrice = (rawPkg: any, tileType: string, size: "small" | "normal" | "large"): number => {
    if (!adminData?.materials) return 0;
    
    const pkg = transformPackageData(rawPkg);
    const items = pkg.items || {};
    const sku = items[tileType];
    if (!sku) return 0;

    const unitPrice = getMaterialPrice(adminData.materials, tileType, sku);
    let sqft: number;

    if (tileType === "wallTile") {
      sqft = getWallTileSqft(universalToggles.wallTileCoverage, size, universalToggles.bathroomType);
    } else {
      sqft = squareFootageConfig[size][tileType as keyof typeof squareFootageConfig[typeof size]] as number;
    }

    return unitPrice * sqft;
  };

  const calculateOtherItemsPrice = (rawPkg: any): number => {
    if (!adminData?.materials) return 0;
    
    const pkg = transformPackageData(rawPkg);
    let total = 0;
    const items = pkg.items || {};
    const otherItems = ["vanity", "tub", "tubFiller", "toilet", "shower", "faucet", "glazing", "mirror", "towelBar", "toiletPaperHolder", "hook", "lighting"];
    
    otherItems.forEach((item) => {
      const sku = items[item];
      if (sku && universalToggles.includedItems[item as keyof typeof universalToggles.includedItems]) {
        total += getMaterialPrice(adminData.materials, item, sku);
      }
    });

    return total;
  };

  const getMaterialPrice = (materials: any, itemType: string, sku?: string): number => {
    if (!sku) return 0;
    const matKey = mapItemTypeToMaterialKey(itemType);
    if (!matKey) return 0;
    const arr = materials[matKey] || [];
    const material = arr.find((m: any) => m.SKU?.toLowerCase() === sku.toLowerCase());
    if (!material) return 0;
    const tileItems = ["floorTile", "wallTile", "showerFloorTile", "accentTile"];
    
    // Remove commas from price strings before parsing
    const priceValue = tileItems.includes(itemType) 
      ? (material.PRICE_SQF || "0").toString().replace(/,/g, "")
      : (material.PRICE || "0").toString().replace(/,/g, "");
    
    return parseFloat(priceValue);
  };

  const mapItemTypeToMaterialKey = (itemType: string): string => {
    switch (itemType) {
      case "floorTile":
      case "wallTile":
      case "showerFloorTile":
      case "accentTile":
        return "tiles";
      case "vanity":
        return "vanities";
      case "tub":
        return "tubs";
      case "tubFiller":
        return "tub_fillers";
      case "toilet":
        return "toilets";
      case "shower":
        return "showers";
      case "faucet":
        return "faucets";
      case "glazing":
        return "shower_glazing";
      case "mirror":
        return "mirrors";
      case "towelBar":
        return "towel_bars";
      case "toiletPaperHolder":
        return "toilet_paper_holders";
      case "hook":
        return "hooks";
      case "lighting":
        return "lighting";
      default:
        return "";
    }
  };

  const updateSquareFootage = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/update-square-footage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          squareFootageConfig
        })
      });

      if (response.ok) {
        toast.success("Square footage configuration updated successfully");
        loadAdminData(); // Refresh data
      } else {
        toast.error("Failed to update square footage configuration");
      }
    } catch (error) {
      toast.error("Error updating square footage configuration");
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    const authStatus = localStorage.getItem("adminAuth");
    if (authStatus === "true") {
      setIsAuthenticated(true);
      loadAdminData();
    }
  }, []);


  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">CloudReno Admin</h1>
            <p className="text-gray-600 mt-2">Enter passcode to access pricing tools</p>
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <input
                type={showPasscode ? "text" : "password"}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter admin passcode"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coral focus:border-transparent"
                onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPasscode ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            <Button
              onClick={handleLogin}
              className="w-full btn-coral cropped-corners"
              disabled={!passcode}
            >
              Access Admin Panel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">CloudReno Admin Dashboard</h1>
              <p className="text-gray-600">Manage pricing, packages, and review images</p>
            </div>
            <Button
              onClick={() => {
                setIsAuthenticated(false);
                localStorage.removeItem("adminAuth");
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
            >
              Logout
            </Button>
          </div>
          
          {/* Navigation Tabs */}
          <div className="border-t border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveSection("pricing")}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeSection === "pricing"
                    ? "border-coral text-coral"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Pricing Configuration
              </button>
              <button
                onClick={() => setActiveSection("gallery")}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeSection === "gallery"
                    ? "border-coral text-coral"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Image Gallery
              </button>
              <button
                onClick={() => setActiveSection("packages")}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeSection === "packages"
                    ? "border-coral text-coral"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Package Creator
              </button>
              <button
                onClick={() => setActiveSection("editor")}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeSection === "editor"
                    ? "border-coral text-coral"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Package Editor
              </button>
              <button
                onClick={() => setActiveSection("processor")}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeSection === "processor"
                    ? "border-coral text-coral"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Image Processor
              </button>
              <button
                onClick={() => setActiveSection("universal")}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeSection === "universal"
                    ? "border-coral text-coral"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Universal Config
              </button>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && !adminData ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading admin data...</span>
          </div>
        ) : (
          <>
            {/* Pricing Configuration Section */}
            {activeSection === "pricing" && (
              <div className="space-y-8">
            {/* Universal Toggles Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Universal Package Settings</h2>
                  <p className="text-gray-600">These settings will apply to ALL packages</p>
                </div>
                <Button
                  onClick={applyUniversalToggles}
                  disabled={isLoading}
                  className="btn-coral cropped-corners flex items-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  Apply to All Packages
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Bathroom Configuration */}
                <div className="space-y-6">
                  {/* Bathroom Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Default Bathroom Size
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["small", "normal", "large"] as const).map((size) => (
                        <button
                          key={size}
                          onClick={() => setUniversalToggles({
                            ...universalToggles,
                            bathroomSize: size
                          })}
                          className={`py-2 px-4 border-2 transition-all text-sm capitalize ${
                            universalToggles.bathroomSize === size
                              ? "border-coral bg-coral text-white"
                              : "border-gray-300 hover:border-coral"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {universalToggles.bathroomSize === "small" && "< 40 sqft"}
                      {universalToggles.bathroomSize === "normal" && "40-80 sqft"}
                      {universalToggles.bathroomSize === "large" && "> 80 sqft"}
                    </p>
                  </div>

                  {/* Bathroom Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Bathroom Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {([
                        { label: "Bathtub", icon: "/icons/bathtub.png" },
                        { label: "Walk-in Shower", icon: "/icons/walk-shower.png" },
                        { label: "Tub & Shower", icon: "/icons/tub-shower.png" },
                        { label: "Sink & Toilet", icon: "/icons/sink-toilet.png" },
                      ] as const).map(({ label, icon }) => (
                        <div key={label} className="flex flex-col items-center gap-2">
                          <button
                            onClick={() => handleBathroomTypeChange(label)}
                            className={`p-4 border-2 transition-all w-full ${
                              universalToggles.bathroomType === label
                                ? "border-coral bg-white shadow-sm"
                                : "border-gray-300 hover:border-coral"
                            }`}
                          >
                            <img src={icon} alt={label} className="w-8 h-auto mx-auto" />
                          </button>
                          <span className="text-xs text-center">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column - Wall Tile & Items */}
                <div className="space-y-6">
                  {/* Wall Tile Coverage */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Wall Tile Coverage
                    </label>
                    <div className="space-y-2">
                      {(["None", "Half way up", "Floor to ceiling"] as const).map((coverage) => (
                        <label key={coverage} className="flex items-center">
                          <input
                            type="radio"
                            name="wallTileCoverage"
                            value={coverage}
                            checked={universalToggles.wallTileCoverage === coverage}
                            onChange={() => handleWallTileCoverageChange(coverage)}
                            className="mr-3 text-coral focus:ring-coral"
                          />
                          <span className="text-sm">
                            {coverage}
                            {coverage === "Half way up" && " (50% coverage)"}
                            {coverage === "Floor to ceiling" && " (100% coverage)"}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Included Items Checklist */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Items Included in Packages
                    </label>
                    <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded p-3">
                      {Object.entries(universalToggles.includedItems).map(([item, included]) => (
                        <label key={item} className="flex items-center text-sm">
                          <input
                            type="checkbox"
                            checked={included}
                            onChange={(e) => setUniversalToggles({
                              ...universalToggles,
                              includedItems: {
                                ...universalToggles.includedItems,
                                [item]: e.target.checked
                              }
                            })}
                            className="mr-3 text-coral focus:ring-coral"
                          />
                          <span className={included ? "text-gray-900" : "text-gray-500"}>
                            {item.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Items are automatically managed based on bathroom type selection above.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Universal Square Footage Configuration */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Universal Square Footage Configuration</h2>
                  <p className="text-gray-600">Configure tile square footage for all packages. Individual package pricing is calculated by multiplying these values by each package's specific tile prices.</p>
                </div>
                <Button
                  onClick={loadAdminData}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded flex items-center gap-2"
                >
                  <RefreshCw size={16} />
                  Refresh
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Square Footage Configuration Grid */}
                {(["small", "normal", "large"] as const).map((size) => (
                  <div key={size} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-4 capitalize">{size} Bathroom</h3>
                    
                    {/* Floor Tile */}
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-700 mb-2">Floor Tile (sqft)</label>
                      <input
                        type="number"
                        value={squareFootageConfig[size].floorTile}
                        onChange={(e) => setSquareFootageConfig({
                          ...squareFootageConfig,
                          [size]: {
                            ...squareFootageConfig[size],
                            floorTile: Number(e.target.value)
                          }
                        })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-coral focus:border-transparent"
                      />
                    </div>

                    {/* Wall Tile by Bathroom Type */}
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-gray-700 mb-2">Wall Tile by Bathroom Type (sqft)</label>
                      <div className="space-y-3">
                        {(["Bathtub", "Walk-in Shower", "Tub & Shower", "Sink & Toilet"] as const).map((bathroomType) => (
                          <div key={bathroomType} className="border border-gray-200 rounded p-2">
                            <label className="block text-xs font-medium text-gray-600 mb-2">{bathroomType}</label>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-400 w-16">None:</label>
                                <input
                                  type="number"
                                  value={squareFootageConfig[size].wallTile[bathroomType].none}
                                  onChange={(e) => setSquareFootageConfig({
                                    ...squareFootageConfig,
                                    [size]: {
                                      ...squareFootageConfig[size],
                                      wallTile: {
                                        ...squareFootageConfig[size].wallTile,
                                        [bathroomType]: {
                                          ...squareFootageConfig[size].wallTile[bathroomType],
                                          none: Number(e.target.value)
                                        }
                                      }
                                    }
                                  })}
                                  className="flex-1 px-1 py-0.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-coral focus:border-transparent"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-400 w-16">Half:</label>
                                <input
                                  type="number"
                                  value={squareFootageConfig[size].wallTile[bathroomType].halfwayUp}
                                  onChange={(e) => setSquareFootageConfig({
                                    ...squareFootageConfig,
                                    [size]: {
                                      ...squareFootageConfig[size],
                                      wallTile: {
                                        ...squareFootageConfig[size].wallTile,
                                        [bathroomType]: {
                                          ...squareFootageConfig[size].wallTile[bathroomType],
                                          halfwayUp: Number(e.target.value)
                                        }
                                      }
                                    }
                                  })}
                                  className="flex-1 px-1 py-0.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-coral focus:border-transparent"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-400 w-16">Full:</label>
                                <input
                                  type="number"
                                  value={squareFootageConfig[size].wallTile[bathroomType].floorToCeiling}
                                  onChange={(e) => setSquareFootageConfig({
                                    ...squareFootageConfig,
                                    [size]: {
                                      ...squareFootageConfig[size],
                                      wallTile: {
                                        ...squareFootageConfig[size].wallTile,
                                        [bathroomType]: {
                                          ...squareFootageConfig[size].wallTile[bathroomType],
                                          floorToCeiling: Number(e.target.value)
                                        }
                                      }
                                    }
                                  })}
                                  className="flex-1 px-1 py-0.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-coral focus:border-transparent"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Other Tile Types */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Shower Floor (sqft)</label>
                        <input
                          type="number"
                          value={squareFootageConfig[size].showerFloorTile}
                          onChange={(e) => setSquareFootageConfig({
                            ...squareFootageConfig,
                            [size]: {
                              ...squareFootageConfig[size],
                              showerFloorTile: Number(e.target.value)
                            }
                          })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-coral focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Accent Tile (sqft)</label>
                        <input
                          type="number"
                          value={squareFootageConfig[size].accentTile}
                          onChange={(e) => setSquareFootageConfig({
                            ...squareFootageConfig,
                            [size]: {
                              ...squareFootageConfig[size],
                              accentTile: Number(e.target.value)
                            }
                          })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-coral focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Material Cost Preview for Sample Packages */}
              <div className="mt-8 bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Universal Configuration Preview</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Current settings: {universalToggles.bathroomType} • {universalToggles.wallTileCoverage} • {universalToggles.bathroomSize}
                </p>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-gray-600">Small Bathroom</div>
                    <div className="font-semibold text-lg">
                      {getWallTileSqft(universalToggles.wallTileCoverage, "small", universalToggles.bathroomType)} sqft
                    </div>
                    <div className="text-xs text-gray-500">wall tiles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600">Normal Bathroom</div>
                    <div className="font-semibold text-lg">
                      {getWallTileSqft(universalToggles.wallTileCoverage, "normal", universalToggles.bathroomType)} sqft
                    </div>
                    <div className="text-xs text-gray-500">wall tiles</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600">Large Bathroom</div>
                    <div className="font-semibold text-lg">
                      {getWallTileSqft(universalToggles.wallTileCoverage, "large", universalToggles.bathroomType)} sqft
                    </div>
                    <div className="text-xs text-gray-500">wall tiles</div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-white rounded border text-xs">
                  <strong>How it works:</strong><br/>
                  Each package's price = (Package's Floor Tile Price × {squareFootageConfig[universalToggles.bathroomSize].floorTile} sqft) + 
                  (Package's Wall Tile Price × {getWallTileSqft(universalToggles.wallTileCoverage, universalToggles.bathroomSize, universalToggles.bathroomType)} sqft) + 
                  (Package's other tiles and fixtures)
                </div>

                {/* Sample Package Calculations */}
                {adminData?.packages && adminData.packages.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-50 rounded border">
                    <h4 className="font-medium text-gray-900 mb-3">Sample Package Calculations</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {adminData.packages.map((pkg, index) => {
                        const packageName = pkg.NAME || pkg.name || `Package ${index + 1}`;
                        const currentPrice = calculateSamplePackagePrice(pkg, universalToggles.bathroomSize);
                        
                        // Light debug logging for anomaly detection
                        if (currentPrice === 0 || isNaN(currentPrice)) {
                          console.warn(`⚠️ Package "${packageName}" has suspicious price: $${currentPrice}`);
                        }
                        
                        return (
                          <div key={index} className="bg-white p-3 rounded border">
                            <div className="font-semibold text-sm text-gray-900 mb-2">{packageName}</div>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span>Floor Tile ({squareFootageConfig[universalToggles.bathroomSize].floorTile} sqft):</span>
                                <span>${calculateTilePrice(pkg, "floorTile", universalToggles.bathroomSize).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Wall Tile ({getWallTileSqft(universalToggles.wallTileCoverage, universalToggles.bathroomSize, universalToggles.bathroomType)} sqft):</span>
                                <span>${calculateTilePrice(pkg, "wallTile", universalToggles.bathroomSize).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Other Items:</span>
                                <span>${calculateOtherItemsPrice(pkg).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between font-semibold border-t pt-1">
                                <span>Total ({universalToggles.bathroomSize}):</span>
                                <span>${currentPrice.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Save Button */}
              <div className="mt-6">
                <Button
                  onClick={updateSquareFootage}
                  disabled={isLoading}
                  className="w-full btn-coral cropped-corners flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  Save Universal Square Footage Configuration
                </Button>
              </div>
            </div>
              </div>
            )}

            {/* Image Gallery Section */}
            {activeSection === "gallery" && adminData?.packages && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Package Image Gallery</h2>
                  <p className="text-gray-600 mb-6">Review all package images and their associated data</p>
                  
                  <ImageGallery 
                    packages={adminData.packages.map(pkg => ({
                      id: pkg.ID,
                      name: pkg.NAME,
                      description: pkg.DESCRIPTION,
                      image: pkg.IMAGE_MAIN,
                      category: pkg.CATEGORY,
                      additionalImages: [pkg.IMAGE_01, pkg.IMAGE_02, pkg.IMAGE_03].filter(Boolean) as string[],
                      items: {
                        floorTile: pkg.TILES_FLOOR_SKU,
                        wallTile: pkg.TILES_WALL_SKU,
                        showerFloorTile: pkg.TILES_SHOWER_FLOOR_SKU,
                        accentTile: pkg.TILES_ACCENT_SKU,
                        vanity: pkg.VANITY_SKU,
                        tub: pkg.TUB_SKU,
                        tubFiller: pkg.TUB_FILLER_SKU,
                        toilet: pkg.TOILET_SKU,
                        shower: pkg.SHOWER_SKU,
                        faucet: pkg.FAUCET_SKU,
                        glazing: pkg.GLAZING_SKU,
                        mirror: pkg.MIRROR_SKU,
                        towelBar: pkg.TOWEL_BAR_SKU,
                        toiletPaperHolder: pkg.TOILET_PAPER_HOLDER_SKU,
                        hook: pkg.HOOK_SKU,
                        lighting: pkg.LIGHTING_SKU,
                      }
                    }))} 
                  />
                </div>
              </div>
            )}

            {/* Package Creator Section */}
            {activeSection === "packages" && adminData?.materials && (
              <div className="space-y-6">
                <PackageCreator 
                  materials={adminData.materials}
                  onPackageCreate={(packageData) => {
                    console.log("New package created:", packageData);
                    toast.success(`Package "${packageData.name}" created with estimated price of $${packageData.estimatedPrice.toLocaleString()}`);
                  }}
                />
              </div>
            )}

            {/* Package Editor Section */}
            {activeSection === "editor" && adminData?.packages && adminData?.materials && (
              <div className="space-y-6">
                <PackageEditor 
                  packages={adminData.packages}
                  materials={adminData.materials}
                  onPackageUpdate={(packageData) => {
                    console.log("Package updated:", packageData);
                    toast.success(`Package "${packageData.NAME}" updated successfully!`);
                  }}
                />
              </div>
            )}

            {/* Image Processor Section */}
            {activeSection === "processor" && (
              <div className="space-y-6">
                <ImageProcessor 
                  onImagesProcessed={(results) => {
                    console.log("Images processed:", results);
                    const successCount = results.filter(img => !img.error).length;
                    const errorCount = results.filter(img => img.error).length;
                    toast.success(`${successCount} images processed successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}!`);
                  }}
                />
              </div>
            )}

            {/* Universal Config Section */}
            {activeSection === "universal" && (
              <div className="space-y-6">
                <UniversalConfigEditor />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}