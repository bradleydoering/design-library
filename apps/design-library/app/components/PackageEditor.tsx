"use client";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/app/Components";
import { Loader2, Search, Upload, X, DollarSign, Edit, Save } from "lucide-react";
import PackageConfiguration from "./PackageConfiguration";
import { calculatePackagePrice } from "@/lib/utils";

interface PackageEditorProps {
  packages: any[];
  materials: any;
  onPackageUpdate?: (packageData: any) => void;
}

interface ProductSearchResult {
  sku: string;
  name: string;
  brand: string;
  price: number;
  priceType: 'PRICE' | 'PRICE_SQF';
  category: string;
  image?: string;
}

const ITEM_TYPES = [
  { key: 'TILES_FLOOR_SKU', label: 'Floor Tile', materialKey: 'tiles' },
  { key: 'TILES_WALL_SKU', label: 'Wall Tile', materialKey: 'tiles' },
  { key: 'TILES_SHOWER_FLOOR_SKU', label: 'Shower Floor Tile', materialKey: 'tiles' },
  { key: 'TILES_ACCENT_SKU', label: 'Accent Tile', materialKey: 'tiles' },
  { key: 'VANITY_SKU', label: 'Vanity', materialKey: 'vanities' },
  { key: 'TUB_SKU', label: 'Bathtub', materialKey: 'tubs' },
  { key: 'TUB_FILLER_SKU', label: 'Tub Filler', materialKey: 'tub_fillers' },
  { key: 'TOILET_SKU', label: 'Toilet', materialKey: 'toilets' },
  { key: 'SHOWER_SKU', label: 'Shower', materialKey: 'showers' },
  { key: 'FAUCET_SKU', label: 'Faucet', materialKey: 'faucets' },
  { key: 'GLAZING_SKU', label: 'Shower Glazing', materialKey: 'shower_glazing' },
  { key: 'MIRROR_SKU', label: 'Mirror', materialKey: 'mirrors' },
  { key: 'TOWEL_BAR_SKU', label: 'Towel Bar', materialKey: 'towel_bars' },
  { key: 'TOILET_PAPER_HOLDER_SKU', label: 'Toilet Paper Holder', materialKey: 'toilet_paper_holders' },
  { key: 'HOOK_SKU', label: 'Hook', materialKey: 'hooks' },
  { key: 'LIGHTING_SKU', label: 'Lighting', materialKey: 'lighting' },
];

export default function PackageEditor({ packages, materials, onPackageUpdate }: PackageEditorProps) {
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [editedPackage, setEditedPackage] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [bathroomConfig, setBathroomConfig] = useState({
    size: "normal" as "small" | "normal" | "large",
    type: "Tub & Shower" as "Bathtub" | "Walk-in Shower" | "Tub & Shower" | "Sink & Toilet",
    wallTileCoverage: "Floor to ceiling" as "None" | "Half way up" | "Floor to ceiling",
  });


  // Search products in materials
  const searchProducts = (term: string, materialKey: string) => {
    if (!term.trim() || !materials[materialKey]) return [];

    const products = materials[materialKey] || [];
    return products
      .filter((product: any) => 
        product.NAME?.toLowerCase().includes(term.toLowerCase()) ||
        product.BRAND?.toLowerCase().includes(term.toLowerCase()) ||
        product.SKU?.toLowerCase().includes(term.toLowerCase())
      )
      .slice(0, 10) // Limit results
      .map((product: any) => ({
        sku: product.SKU,
        name: product.NAME,
        brand: product.BRAND,
        price: parseFloat((product.PRICE || product.PRICE_SQF || "0").toString().replace(/,/g, "")),
        priceType: product.PRICE ? 'PRICE' : 'PRICE_SQF',
        category: materialKey,
        image: product.IMAGE_MAIN || product.IMAGE_01,
      }));
  };

  // Handle product search
  useEffect(() => {
    if (!searchTerm.trim() || !editingItem) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const itemType = ITEM_TYPES.find(t => t.key === editingItem);
    if (itemType) {
      const results = searchProducts(searchTerm, itemType.materialKey);
      setSearchResults(results);
    }
    setIsSearching(false);
  }, [searchTerm, editingItem, materials]);

  // Calculate estimated price based on current configuration
  useEffect(() => {
    if (!editedPackage || !materials) {
      setEstimatedPrice(0);
      return;
    }

    // Transform edited package to match the main page format for price calculation
    const transformedPackage = {
      ...editedPackage,
      items: {
        floorTile: editedPackage.TILES_FLOOR_SKU,
        wallTile: editedPackage.TILES_WALL_SKU,
        showerFloorTile: editedPackage.TILES_SHOWER_FLOOR_SKU,
        accentTile: editedPackage.TILES_ACCENT_SKU,
        vanity: editedPackage.VANITY_SKU,
        tub: editedPackage.TUB_SKU,
        tubFiller: editedPackage.TUB_FILLER_SKU,
        toilet: editedPackage.TOILET_SKU,
        shower: editedPackage.SHOWER_SKU,
        faucet: editedPackage.FAUCET_SKU,
        glazing: editedPackage.GLAZING_SKU,
        mirror: editedPackage.MIRROR_SKU,
        towelBar: editedPackage.TOWEL_BAR_SKU,
        toiletPaperHolder: editedPackage.TOILET_PAPER_HOLDER_SKU,
        hook: editedPackage.HOOK_SKU,
        lighting: editedPackage.LIGHTING_SKU,
      },
      UNIVERSAL_TOGGLES: {
        bathroomType: bathroomConfig.type,
        wallTileCoverage: bathroomConfig.wallTileCoverage,
        bathroomSize: bathroomConfig.size,
      }
    };

    // Use the same calculation function as the main page
    const price = calculatePackagePrice(transformedPackage, materials, bathroomConfig.size);
    setEstimatedPrice(price);
  }, [editedPackage, materials, bathroomConfig]);

  const handlePackageSelect = (pkg: any) => {
    setSelectedPackage(pkg);
    setEditedPackage({ ...pkg });
  };

  const handleProductSelect = (product: ProductSearchResult) => {
    if (!editingItem || !editedPackage) return;
    
    setEditedPackage((prev: any) => ({
      ...prev,
      [editingItem]: product.sku,
    }));
    
    setEditingItem(null);
    setSearchTerm("");
    setSearchResults([]);
    toast.success(`Updated ${ITEM_TYPES.find(t => t.key === editingItem)?.label} to ${product.name}`);
  };

  const handleImageUpdate = (field: string, value: string) => {
    if (!editedPackage) return;
    
    setEditedPackage((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSavePackage = async () => {
    if (!editedPackage) return;
    
    setIsSaving(true);
    try {
      // Here you would typically call an API to update the package
      // For now, we'll just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Package "${editedPackage.NAME}" updated successfully!`);
      
      if (onPackageUpdate) {
        onPackageUpdate(editedPackage);
      }
      
      // Update the selected package to reflect changes
      setSelectedPackage(editedPackage);
      
    } catch (error) {
      console.error("Error updating package:", error);
      toast.error("Failed to update package");
    } finally {
      setIsSaving(false);
    }
  };

  const getProductInfo = (sku: string, itemType: string) => {
    if (!sku) return null;
    
    const itemConfig = ITEM_TYPES.find(t => t.key === itemType);
    if (!itemConfig || !materials[itemConfig.materialKey]) return null;
    
    const product = materials[itemConfig.materialKey].find((p: any) => p.SKU === sku);
    return product;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Package Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Package to Edit</h3>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {packages.map((pkg) => (
                <button
                  key={pkg.ID}
                  onClick={() => handlePackageSelect(pkg)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedPackage?.ID === pkg.ID
                      ? "border-coral bg-coral/10"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium text-gray-900">{pkg.NAME}</div>
                  <div className="text-sm text-gray-600">{pkg.CATEGORY}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Package Editor */}
        <div className="lg:col-span-2">
          {selectedPackage ? (
            <div className="space-y-6">
              {/* Package Details */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Edit Package: {selectedPackage.NAME}</h3>
                  <Button
                    onClick={handleSavePackage}
                    disabled={isSaving || !editedPackage}
                    className="btn-coral cropped-corners flex items-center gap-2"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Changes
                  </Button>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                    <input
                      type="text"
                      value={editedPackage?.NAME || ""}
                      onChange={(e) => setEditedPackage((prev: any) => ({ ...prev, NAME: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-coral focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={editedPackage?.CATEGORY || ""}
                      onChange={(e) => setEditedPackage((prev: any) => ({ ...prev, CATEGORY: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-coral focus:border-transparent"
                    >
                      <option value="Modern">Modern</option>
                      <option value="Traditional">Traditional</option>
                      <option value="Contemporary">Contemporary</option>
                      <option value="Luxury">Luxury</option>
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editedPackage?.DESCRIPTION || ""}
                    onChange={(e) => setEditedPackage((prev: any) => ({ ...prev, DESCRIPTION: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-coral focus:border-transparent"
                  />
                </div>

                {/* Images */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3">Images</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Main Image URL</label>
                      <input
                        type="url"
                        value={editedPackage?.IMAGE_MAIN || ""}
                        onChange={(e) => handleImageUpdate("IMAGE_MAIN", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-coral focus:border-transparent"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image 1 URL</label>
                      <input
                        type="url"
                        value={editedPackage?.IMAGE_01 || ""}
                        onChange={(e) => handleImageUpdate("IMAGE_01", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-coral focus:border-transparent"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image 2 URL</label>
                      <input
                        type="url"
                        value={editedPackage?.IMAGE_02 || ""}
                        onChange={(e) => handleImageUpdate("IMAGE_02", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-coral focus:border-transparent"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image 3 URL</label>
                      <input
                        type="url"
                        value={editedPackage?.IMAGE_03 || ""}
                        onChange={(e) => handleImageUpdate("IMAGE_03", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-coral focus:border-transparent"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Selection */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Package Products</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ITEM_TYPES.map((itemType) => {
                    const currentSku = editedPackage?.[itemType.key] || "";
                    const productInfo = getProductInfo(currentSku, itemType.key);
                    
                    return (
                      <div key={itemType.key} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium text-gray-900">{itemType.label}</h5>
                          <Button
                            onClick={() => {
                              setEditingItem(itemType.key);
                              setSearchTerm("");
                            }}
                            className="btn-coral cropped-corners text-xs px-2 py-1 h-auto"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Change
                          </Button>
                        </div>
                        
                        {productInfo ? (
                          <div className="text-sm text-gray-600">
                            <p className="font-medium">{productInfo.NAME}</p>
                            <p>Brand: {productInfo.BRAND}</p>
                            <p>SKU: {productInfo.SKU}</p>
                            <p className="text-green-600 font-medium">
                              ${parseFloat((productInfo.PRICE || productInfo.PRICE_SQF || "0").toString().replace(/,/g, "")).toFixed(2)}
                              {productInfo.PRICE_SQF ? '/sqft' : ''}
                            </p>
                          </div>
                        ) : currentSku ? (
                          <div className="text-sm text-gray-400">
                            <p>SKU: {currentSku}</p>
                            <p className="text-red-500">Product not found in catalog</p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">No product selected</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <p className="text-gray-500">Select a package from the left to start editing</p>
            </div>
          )}
        </div>

        {/* Pricing Configuration Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <PackageConfiguration
              totalPrice={estimatedPrice}
              selectedPackage={{
                name: selectedPackage?.NAME || "Select Package"
              } as any}
              selectedSize={bathroomConfig.size}
              onSizeChange={(size) => setBathroomConfig(prev => ({ ...prev, size }))}
              selectedType={bathroomConfig.type}
              onTypeChange={(type) => setBathroomConfig(prev => ({ ...prev, type: type as any }))}
              selectedTileConfig={bathroomConfig.wallTileCoverage}
              onTileConfigChange={(config) => setBathroomConfig(prev => ({ ...prev, wallTileCoverage: config as any }))}
              onDownload={() => {}}
              showButton={false}
              priceLabel="Estimated Price"
            />
          </div>
        </div>
      </div>

      {/* Product Search Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">
                Select {ITEM_TYPES.find(t => t.key === editingItem)?.label}
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-coral focus:border-transparent"
                  placeholder="Search by name, brand, or SKU..."
                  autoFocus
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((product) => (
                    <div
                      key={product.sku}
                      onClick={() => handleProductSelect(product)}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{product.name}</h4>
                        <p className="text-sm text-gray-600">{product.brand} • {product.sku}</p>
                        <p className="text-sm font-medium text-green-600">
                          ${product.price.toFixed(2)}{product.priceType === 'PRICE_SQF' ? '/sqft' : ''}
                        </p>
                      </div>
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : searchTerm.trim() ? (
                <div className="text-center py-8 text-gray-500">
                  No products found for "{searchTerm}"
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Start typing to search for products
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}