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

  const ADMIN_PASSCODE = "CloudReno2025Admin!";

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
      const data = await response.json();
      setAdminData(data);
      if (data.packages?.length > 0) {
        setSelectedPackage(data.packages[0].NAME);
      }
    } catch (error) {
      toast.error("Failed to load data");
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
      // Load existing price data for selected package
      const pkg = adminData.packages.find(p => p.NAME === selectedPackage);
      if (pkg && pkg.PRICE_FORMULA) {
        setPriceFormula(pkg.PRICE_FORMULA);
      } else {
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
                  {adminData?.packages?.map((pkg) => (
                    <option key={pkg.ID} value={pkg.NAME}>
                      {pkg.NAME}
                    </option>
                  ))}
                </select>
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
        )}
      </div>
    </div>
  );
}