"use client";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/app/Components";
import { Loader2, Plus, Search, Upload, X, DollarSign } from "lucide-react";
import PackageConfiguration from "./PackageConfiguration";
import { calculatePackagePrice } from "@/lib/utils";

interface PackageCreatorProps {
  materials: any;
  onPackageCreate?: (packageData: any) => void;
}

interface NewPackage {
  name: string;
  description: string;
  category: string;
  items: {
    floorTile: string;
    wallTile: string;
    showerFloorTile: string;
    accentTile: string;
    vanity: string;
    tub: string;
    tubFiller: string;
    toilet: string;
    shower: string;
    faucet: string;
    glazing: string;
    mirror: string;
    towelBar: string;
    toiletPaperHolder: string;
    hook: string;
    lighting: string;
  };
  images: {
    main: string;
    additional: string[];
  };
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
  { key: 'floorTile', label: 'Floor Tile', materialKey: 'tiles' },
  { key: 'wallTile', label: 'Wall Tile', materialKey: 'tiles' },
  { key: 'showerFloorTile', label: 'Shower Floor Tile', materialKey: 'tiles' },
  { key: 'accentTile', label: 'Accent Tile', materialKey: 'tiles' },
  { key: 'vanity', label: 'Vanity', materialKey: 'vanities' },
  { key: 'tub', label: 'Bathtub', materialKey: 'tubs' },
  { key: 'tubFiller', label: 'Tub Filler', materialKey: 'tub_fillers' },
  { key: 'toilet', label: 'Toilet', materialKey: 'toilets' },
  { key: 'shower', label: 'Shower', materialKey: 'showers' },
  { key: 'faucet', label: 'Faucet', materialKey: 'faucets' },
  { key: 'glazing', label: 'Shower Glazing', materialKey: 'shower_glazing' },
  { key: 'mirror', label: 'Mirror', materialKey: 'mirrors' },
  { key: 'towelBar', label: 'Towel Bar', materialKey: 'towel_bars' },
  { key: 'toiletPaperHolder', label: 'Toilet Paper Holder', materialKey: 'toilet_paper_holders' },
  { key: 'hook', label: 'Hook', materialKey: 'hooks' },
  { key: 'lighting', label: 'Lighting', materialKey: 'lighting' },
];

export default function PackageCreator({ materials, onPackageCreate }: PackageCreatorProps) {
  const [newPackage, setNewPackage] = useState<NewPackage>({
    name: "",
    description: "",
    category: "Modern",
    items: {
      floorTile: "",
      wallTile: "",
      showerFloorTile: "",
      accentTile: "",
      vanity: "",
      tub: "",
      tubFiller: "",
      toilet: "",
      shower: "",
      faucet: "",
      glazing: "",
      mirror: "",
      towelBar: "",
      toiletPaperHolder: "",
      hook: "",
      lighting: "",
    },
    images: {
      main: "",
      additional: [],
    },
  });

  const [selectedItemType, setSelectedItemType] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
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
        price: parseFloat((product.PRICE || product.PRICE_SQF || "0").toString().replace(",", "")),
        priceType: product.PRICE ? 'PRICE' : 'PRICE_SQF',
        category: materialKey,
        image: product.IMAGE_MAIN || product.IMAGE_01,
      }));
  };

  // Handle product search
  useEffect(() => {
    if (!searchTerm.trim() || !selectedItemType) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const itemType = ITEM_TYPES.find(t => t.key === selectedItemType);
    if (itemType) {
      const results = searchProducts(searchTerm, itemType.materialKey);
      setSearchResults(results);
    }
    setIsSearching(false);
  }, [searchTerm, selectedItemType, materials]);

  // Calculate estimated price based on current configuration
  useEffect(() => {
    if (!materials) {
      setEstimatedPrice(0);
      return;
    }

    // Transform new package to match the main page format for price calculation
    const transformedPackage = {
      items: newPackage.items,
      UNIVERSAL_TOGGLES: {
        bathroomType: bathroomConfig.type,
        wallTileCoverage: bathroomConfig.wallTileCoverage,
        bathroomSize: bathroomConfig.size,
      }
    };

    // Use the same calculation function as the main page
    const price = calculatePackagePrice(transformedPackage, materials, bathroomConfig.size);
    setEstimatedPrice(price);
  }, [newPackage.items, materials, bathroomConfig]);

  const handleItemSelect = (itemType: string) => {
    setSelectedItemType(itemType);
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleProductSelect = (product: ProductSearchResult) => {
    setNewPackage(prev => ({
      ...prev,
      items: {
        ...prev.items,
        [selectedItemType!]: product.sku,
      }
    }));
    setSelectedItemType(null);
    setSearchTerm("");
    setSearchResults([]);
    toast.success(`Selected ${product.name} for ${ITEM_TYPES.find(t => t.key === selectedItemType)?.label}`);
  };

  const handleCreatePackage = async () => {
    if (!newPackage.name.trim()) {
      toast.error("Package name is required");
      return;
    }

    const packageData = {
      ...newPackage,
      estimatedPrice,
      createdAt: new Date().toISOString(),
    };

    try {
      // Save to API
      const response = await fetch("/api/admin/create-package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(packageData),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success(`Package "${packageData.name}" created successfully!`);
        
        if (onPackageCreate) {
          onPackageCreate({...packageData, id: result.packageId});
        }
        
        // Reset form
        setNewPackage({
          name: "",
          description: "",
          category: "Modern",
          items: {
            floorTile: "", wallTile: "", showerFloorTile: "", accentTile: "",
            vanity: "", tub: "", tubFiller: "", toilet: "", shower: "", faucet: "",
            glazing: "", mirror: "", towelBar: "", toiletPaperHolder: "", hook: "", lighting: "",
          },
          images: { main: "", additional: [] },
        });
      } else {
        toast.error("Failed to create package: " + result.error);
      }
    } catch (error) {
      console.error("Error creating package:", error);
      toast.error("Failed to create package");
    }
  };

  const getSelectedProductInfo = (itemType: string) => {
    const sku = newPackage.items[itemType as keyof typeof newPackage.items];
    if (!sku) return null;

    const itemConfig = ITEM_TYPES.find(t => t.key === itemType);
    if (!itemConfig || !materials[itemConfig.materialKey]) return null;

    const product = materials[itemConfig.materialKey].find((p: any) => p.SKU === sku);
    return product;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Package Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Package Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                <input
                  type="text"
                  value={newPackage.name}
                  onChange={(e) => setNewPackage(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-coral focus:border-transparent"
                  placeholder="Enter package name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newPackage.description}
                  onChange={(e) => setNewPackage(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-coral focus:border-transparent"
                  placeholder="Enter package description"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newPackage.category}
                  onChange={(e) => setNewPackage(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-coral focus:border-transparent"
                >
                  <option value="Modern">Modern</option>
                  <option value="Traditional">Traditional</option>
                  <option value="Contemporary">Contemporary</option>
                  <option value="Luxury">Luxury</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Selection */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Selection</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ITEM_TYPES.map((itemType) => {
                const selectedProduct = getSelectedProductInfo(itemType.key);
                return (
                  <div key={itemType.key} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">{itemType.label}</h4>
                      <Button
                        onClick={() => handleItemSelect(itemType.key)}
                        className="btn-coral cropped-corners text-xs px-2 py-1 h-auto"
                      >
                        {selectedProduct ? "Change" : "Select"}
                      </Button>
                    </div>
                    
                    {selectedProduct ? (
                      <div className="text-sm text-gray-600">
                        <p className="font-medium">{selectedProduct.NAME}</p>
                        <p>Brand: {selectedProduct.BRAND}</p>
                        <p>SKU: {selectedProduct.SKU}</p>
                        <p className="text-green-600 font-medium">
                          ${parseFloat((selectedProduct.PRICE || selectedProduct.PRICE_SQF || "0").toString().replace(",", "")).toFixed(2)}
                          {selectedProduct.PRICE_SQF ? '/sqft' : ''}
                        </p>
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

        {/* Sidebar - Interactive Pricing Configuration */}
        <div className="space-y-6">
          <PackageConfiguration
            totalPrice={estimatedPrice}
            selectedPackage={{
              name: newPackage.name || "New Package"
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

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Images</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Main Image URL</label>
                <input
                  type="url"
                  value={newPackage.images.main}
                  onChange={(e) => setNewPackage(prev => ({ 
                    ...prev, 
                    images: { ...prev.images, main: e.target.value } 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-coral focus:border-transparent"
                  placeholder="https://..."
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> Image upload functionality coming soon. For now, use direct URLs.
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleCreatePackage}
            className="w-full btn-coral cropped-corners flex items-center justify-center gap-2"
            disabled={!newPackage.name.trim()}
          >
            <Plus className="w-4 h-4" />
            Create Package
          </Button>
        </div>
      </div>

      {/* Product Search Modal */}
      {selectedItemType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">
                Select {ITEM_TYPES.find(t => t.key === selectedItemType)?.label}
              </h3>
              <button
                onClick={() => setSelectedItemType(null)}
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