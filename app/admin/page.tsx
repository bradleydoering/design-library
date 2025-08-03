"use client";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/app/Components";
import { Loader2, Eye, EyeOff, Save, RefreshCw } from "lucide-react";

interface AdminData {
  packages: any[];
  materials: any;
}

interface PriceFormula {
  basePrice: number;
  sizeMulitpliers: {
    small: number;
    medium: number;
    large: number;
  };
  laborCost: number;
  markupPercentage: number;
}

interface UniversalToggles {
  bathroomType: "shower" | "bathtub";
  wallTileCoverage: "none" | "halfway" | "full";
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
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [priceFormula, setPriceFormula] = useState<PriceFormula>({
    basePrice: 0,
    sizeMulitpliers: { small: 0.8, medium: 1.0, large: 1.3 },
    laborCost: 0,
    markupPercentage: 20
  });
  const [universalToggles, setUniversalToggles] = useState<UniversalToggles>({
    bathroomType: "shower",
    wallTileCoverage: "full",
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
  });

  const ADMIN_PASSCODE = "CloudReno2025Admin!";

  const handleBathroomTypeChange = (type: "shower" | "bathtub") => {
    const newToggles = { ...universalToggles };
    newToggles.bathroomType = type;
    
    if (type === "shower") {
      // Show shower, hide tub and tub filler
      newToggles.includedItems.shower = true;
      newToggles.includedItems.glazing = true;
      newToggles.includedItems.showerFloorTile = true;
      newToggles.includedItems.tub = false;
      newToggles.includedItems.tubFiller = false;
    } else {
      // Show tub, hide shower and glazing
      newToggles.includedItems.tub = true;
      newToggles.includedItems.tubFiller = true;
      newToggles.includedItems.shower = false;
      newToggles.includedItems.glazing = false;
      newToggles.includedItems.showerFloorTile = false;
    }
    
    setUniversalToggles(newToggles);
  };

  const handleWallTileCoverageChange = (coverage: "none" | "halfway" | "full") => {
    const newToggles = { ...universalToggles };
    newToggles.wallTileCoverage = coverage;
    
    if (coverage === "none") {
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

  const getWallTileMultiplier = (coverage: string) => {
    switch (coverage) {
      case "none": return 0;
      case "halfway": return 0.5;
      case "full": return 1.0;
      default: return 1.0;
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
      
      setAdminData({ packages, materials: data.materials || data.data?.materials });
      
      if (packages.length > 0) {
        const firstPackageName = packages[0].NAME || packages[0].name;
        setSelectedPackage(firstPackageName);
        console.log("Selected first package:", firstPackageName);
      } else {
        toast.error("No packages found in data");
      }
    } catch (error) {
      console.error("Failed to load admin data:", error);
      toast.error(`Failed to load data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePackagePrice = async () => {
    if (!selectedPackage) return;
    
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/update-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageName: selectedPackage,
          priceFormula
        })
      });

      if (response.ok) {
        toast.success("Price updated successfully");
        loadAdminData(); // Refresh data
      } else {
        toast.error("Failed to update price");
      }
    } catch (error) {
      toast.error("Error updating price");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateEstimatedPrice = (size: "small" | "medium" | "large"): number => {
    const { basePrice, sizeMulitpliers, laborCost, markupPercentage } = priceFormula;
    const sizedPrice = basePrice * sizeMulitpliers[size];
    const totalBeforeMarkup = sizedPrice + laborCost;
    return totalBeforeMarkup * (1 + markupPercentage / 100);
  };

  useEffect(() => {
    const authStatus = localStorage.getItem("adminAuth");
    if (authStatus === "true") {
      setIsAuthenticated(true);
      loadAdminData();
    }
  }, []);

  useEffect(() => {
    if (adminData && selectedPackage) {
      console.log("Loading price data for package:", selectedPackage);
      // Load existing price data for selected package
      const pkg = adminData.packages.find(p => (p.NAME || p.name) === selectedPackage);
      console.log("Found package:", pkg);
      
      if (pkg && pkg.PRICE_FORMULA) {
        console.log("Using existing price formula:", pkg.PRICE_FORMULA);
        setPriceFormula(pkg.PRICE_FORMULA);
      } else {
        console.log("Setting default price formula");
        // Set defaults based on package if no formula exists
        setPriceFormula({
          basePrice: 15000,
          sizeMulitpliers: { small: 0.8, medium: 1.0, large: 1.3 },
          laborCost: 5000,
          markupPercentage: 20
        });
      }
    }
  }, [selectedPackage, adminData]);

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
              <h1 className="text-2xl font-bold text-gray-900">CloudReno Pricing Admin</h1>
              <p className="text-gray-600">Manage package pricing and calculations</p>
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
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && !adminData ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading admin data...</span>
          </div>
        ) : (
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Bathroom Type Toggle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Bathroom Type
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="bathroomType"
                        value="shower"
                        checked={universalToggles.bathroomType === "shower"}
                        onChange={() => handleBathroomTypeChange("shower")}
                        className="mr-2"
                      />
                      Shower (includes glazing, shower floor tile)
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="bathroomType"
                        value="bathtub"
                        checked={universalToggles.bathroomType === "bathtub"}
                        onChange={() => handleBathroomTypeChange("bathtub")}
                        className="mr-2"
                      />
                      Bathtub (includes tub and filler)
                    </label>
                  </div>
                </div>

                {/* Wall Tile Coverage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Wall Tile Coverage
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="wallTileCoverage"
                        value="none"
                        checked={universalToggles.wallTileCoverage === "none"}
                        onChange={() => handleWallTileCoverageChange("none")}
                        className="mr-2"
                      />
                      No Wall Tile
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="wallTileCoverage"
                        value="halfway"
                        checked={universalToggles.wallTileCoverage === "halfway"}
                        onChange={() => handleWallTileCoverageChange("halfway")}
                        className="mr-2"
                      />
                      Halfway Up (50% coverage)
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="wallTileCoverage"
                        value="full"
                        checked={universalToggles.wallTileCoverage === "full"}
                        onChange={() => handleWallTileCoverageChange("full")}
                        className="mr-2"
                      />
                      Full Wall Coverage
                    </label>
                  </div>
                </div>

                {/* Included Items Checklist */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Items Included in Packages
                  </label>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
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
                          className="mr-2"
                        />
                        {item.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Existing Package-Specific Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Package Selection */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Select Package</h2>
                <select
                  value={selectedPackage}
                  onChange={(e) => setSelectedPackage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-coral focus:border-transparent"
                >
                  <option value="">Select a package...</option>
                  {adminData?.packages?.map((pkg, index) => {
                    const id = pkg.ID || pkg.id || index;
                    const name = pkg.NAME || pkg.name || `Package ${index + 1}`;
                    return (
                      <option key={id} value={name}>
                        {name}
                      </option>
                    );
                  })}
                </select>
                {adminData?.packages?.length === 0 && (
                  <p className="text-sm text-red-600 mt-2">No packages found. Check your data source.</p>
                )}
                {!adminData && !isLoading && (
                  <p className="text-sm text-gray-600 mt-2">Loading packages...</p>
                )}
                
                {/* Debug info */}
                <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
                  <strong>Debug Info:</strong><br/>
                  Admin Data: {adminData ? 'Loaded' : 'Not loaded'}<br/>
                  Packages Count: {adminData?.packages?.length || 0}<br/>
                  Selected: {selectedPackage || 'None'}<br/>
                  Loading: {isLoading ? 'Yes' : 'No'}
                </div>
              </div>
            </div>

            {/* Price Formula Editor */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Price Formula Editor</h2>
                  <Button
                    onClick={loadAdminData}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded flex items-center gap-2"
                  >
                    <RefreshCw size={16} />
                    Refresh
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Base Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Base Price ($)
                    </label>
                    <input
                      type="number"
                      value={priceFormula.basePrice}
                      onChange={(e) => setPriceFormula({
                        ...priceFormula,
                        basePrice: Number(e.target.value)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-coral focus:border-transparent"
                    />
                  </div>

                  {/* Size Multipliers */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Size Multipliers
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Small</label>
                        <input
                          type="number"
                          step="0.1"
                          value={priceFormula.sizeMulitpliers.small}
                          onChange={(e) => setPriceFormula({
                            ...priceFormula,
                            sizeMulitpliers: {
                              ...priceFormula.sizeMulitpliers,
                              small: Number(e.target.value)
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-coral focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Medium</label>
                        <input
                          type="number"
                          step="0.1"
                          value={priceFormula.sizeMulitpliers.medium}
                          onChange={(e) => setPriceFormula({
                            ...priceFormula,
                            sizeMulitpliers: {
                              ...priceFormula.sizeMulitpliers,
                              medium: Number(e.target.value)
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-coral focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Large</label>
                        <input
                          type="number"
                          step="0.1"
                          value={priceFormula.sizeMulitpliers.large}
                          onChange={(e) => setPriceFormula({
                            ...priceFormula,
                            sizeMulitpliers: {
                              ...priceFormula.sizeMulitpliers,
                              large: Number(e.target.value)
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-coral focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Labor Cost */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Labor Cost ($)
                    </label>
                    <input
                      type="number"
                      value={priceFormula.laborCost}
                      onChange={(e) => setPriceFormula({
                        ...priceFormula,
                        laborCost: Number(e.target.value)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-coral focus:border-transparent"
                    />
                  </div>

                  {/* Markup Percentage */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Markup Percentage (%)
                    </label>
                    <input
                      type="number"
                      value={priceFormula.markupPercentage}
                      onChange={(e) => setPriceFormula({
                        ...priceFormula,
                        markupPercentage: Number(e.target.value)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-coral focus:border-transparent"
                    />
                  </div>

                  {/* Price Preview */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 mb-3">Price Preview</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-gray-600">Small</div>
                        <div className="font-semibold text-lg">
                          ${calculateEstimatedPrice("small").toLocaleString()}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-600">Medium</div>
                        <div className="font-semibold text-lg">
                          ${calculateEstimatedPrice("medium").toLocaleString()}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-600">Large</div>
                        <div className="font-semibold text-lg">
                          ${calculateEstimatedPrice("large").toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <Button
                    onClick={updatePackagePrice}
                    disabled={isLoading || !selectedPackage}
                    className="w-full btn-coral cropped-corners flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    Save Price Formula
                  </Button>
                </div>
              </div>
            </div>
          </div>
          </div>
        )}
      </div>
    </div>
  );
}