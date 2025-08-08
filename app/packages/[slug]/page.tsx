"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { getMaterials } from "@/lib/materials";
import { PackageFromAPI, Package } from "@/app/types";
import { calculatePackagePrice } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useUniversalBathConfig } from "@/lib/useUniversalBathConfig";
import Image from "next/image";
import { Button } from "@/app/Components";
import Navbar from "@/app/components/navbar/NavbarContainer";
import Customize from "@/app/components/Customize";

export default function PackagePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const [packages, setPackages] = useState<Package[]>([]);
  const [materials, setMaterials] = useState<any>(null);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCustomize, setShowCustomize] = useState(true);
  const { bathroomConfig, setBathroomConfig, universalConfig, squareFootageConfig, isLoaded, isApplying } = useUniversalBathConfig();

  useEffect(() => {
    (async () => {
      try {
        console.log('Loading materials for package page...');
        const data = await getMaterials();
        if (!data) {
          console.log('No data received');
          setPackages([]);
          return;
        }
        setMaterials(data);
        
        const transformed =
          data.packages?.map((pkg: PackageFromAPI) => ({
            id: pkg.ID,
            name: pkg.NAME,
            description: pkg.DESCRIPTION,
            image: pkg.IMAGE_MAIN,
            category: pkg.CATEGORY,
            additionalImages: [pkg.IMAGE_01, pkg.IMAGE_02, pkg.IMAGE_03].filter(
              Boolean
            ) as string[],
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
            },
          })) || [];
        
        setPackages(transformed);
        
        // Find the package by slug (convert name to slug format)
        const packageBySlug = transformed.find((pkg: Package) => 
          pkg.name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+$/, '') === slug
        );
        
        if (packageBySlug) {
          setSelectedPackage(packageBySlug);
        } else {
          toast.error('Package not found');
          router.push('/packages');
        }
      } catch (err: any) {
        console.error('Error loading materials:', err);
        toast.error(`Failed to load package: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [slug, router]);


  if (isLoading || !isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading package...</p>
        </div>
      </div>
    );
  }

  if (!selectedPackage) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Package not found</p>
          <Button onClick={() => router.push('/packages')} className="mt-4">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onStepChange={() => {}} currentStep="customize" />
      <div className="flex-grow w-full pt-20">
        <Customize 
          selectedPackage={selectedPackage} 
          materials={materials} 
          onBack={() => router.push('/packages')}
          bathroomConfig={bathroomConfig}
          setBathroomConfig={setBathroomConfig}
          isApplying={isApplying}
          squareFootageConfig={squareFootageConfig}
          universalConfig={universalConfig}
        />
      </div>
      <footer className="bg-offwhite border-t border-gray-200">
        <div className="w-full mx-auto py-6">
          <p className="text-center text-navy font-space font-medium">&copy; 2025 CloudRenovation.ca</p>
        </div>
      </footer>
    </div>
  );
}