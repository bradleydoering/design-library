"use client";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import Intro from "@/app/components/Intro";
import Customize from "@/app/components/Customize";
import Navbar from "@/app/components/navbar/NavbarContainer";
import { getMaterials } from "@/lib/materials";
import { Loader2 } from "lucide-react";
import { PackageFromAPI, Package } from "@/app/types";
import { useUniversalBathConfig } from "@/lib/useUniversalBathConfig";


export default function Page() {
  const [step, setStep] = useState<"intro" | "customize">("intro");
  const [packages, setPackages] = useState<Package[]>([]);
  const [materials, setMaterials] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [sortDirection, setSortDirection] = useState<
    "asc" | "desc" | "default"
  >("default");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { bathroomConfig, setBathroomConfig, squareFootageConfig, universalConfig, isLoaded, isApplying } = useUniversalBathConfig();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const changeStep = (newStep: "intro" | "customize") => {
    setStep(newStep);
    window.history.pushState({ step: newStep }, "", "");
  };

  useEffect(() => {
    (async () => {
      try {
        console.log('Starting to load materials...');
        const data = await getMaterials();
        console.log('Materials loaded:', !!data, 'Packages:', data?.packages?.length);
        if (!data) {
          console.log('No data received, setting empty packages');
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
              // Prioritize new items format, fallback to old SKU format
              floorTile: pkg.items?.floorTile || pkg.TILES_FLOOR_SKU,
              wallTile: pkg.items?.wallTile || pkg.TILES_WALL_SKU,
              showerFloorTile: pkg.items?.showerFloorTile || pkg.TILES_SHOWER_FLOOR_SKU,
              accentTile: pkg.items?.accentTile || pkg.TILES_ACCENT_SKU,
              vanity: pkg.items?.vanity || pkg.VANITY_SKU,
              tub: pkg.items?.tub || pkg.TUB_SKU,
              tubFiller: pkg.items?.tubFiller || pkg.TUB_FILLER_SKU,
              toilet: pkg.items?.toilet || pkg.TOILET_SKU,
              shower: pkg.items?.shower || pkg.SHOWER_SKU,
              faucet: pkg.items?.faucet || pkg.FAUCET_SKU,
              glazing: pkg.items?.glazing || pkg.GLAZING_SKU,
              mirror: pkg.items?.mirror || pkg.MIRROR_SKU,
              towelBar: pkg.items?.towelBar || pkg.TOWEL_BAR_SKU,
              toiletPaperHolder: pkg.items?.toiletPaperHolder || pkg.TOILET_PAPER_HOLDER_SKU,
              hook: pkg.items?.hook || pkg.HOOK_SKU,
              lighting: pkg.items?.lighting || pkg.LIGHTING_SKU,
            },
            universalToggles: pkg.UNIVERSAL_TOGGLES,
            // Add product data for direct access to images
            productData: pkg._productData || {},
          })) || [];
        console.log('Transformed packages:', transformed.length);
        setPackages(transformed);
      } catch (err: any) {
        console.error('Error loading materials:', err);
        toast.error(`Failed to load materials: ${err.message}`);
      } finally {
        console.log('Setting loading to false');
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      setStep(e.state?.step || "intro");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (step === "intro") setSelectedPackage(null);
  }, [step]);

  const handlePackageSelect = (pkg: Package) => {
    setSelectedPackage(pkg);
    changeStep("customize");
  };

  const handleSubmit = () => {
    window.location.href = "https://calendar.app.google/s299ACy2AU96HjLo6";
    setTimeout(() => {
      changeStep("intro");
      setFormData({ name: "", email: "", phone: "", address: "" });
    }, 500);
  };

  if (isLoading || !isLoaded) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onStepChange={changeStep} currentStep={step} />
      
      {step === "intro" && (
        <div className="fixed inset-0 h-screen w-full -z-10">
          <CloudRenoBackground />
        </div>
      )}

      <div className="flex-grow w-full pt-20">
        {step === "intro" && (
          <Intro
            packages={packages}
            materials={materials}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            sortDirection={sortDirection}
            setSortDirection={setSortDirection}
            onPackageSelect={handlePackageSelect}
            bathroomConfig={bathroomConfig}
            setBathroomConfig={setBathroomConfig}
            isApplying={isApplying}
            squareFootageConfig={squareFootageConfig}
            universalConfig={universalConfig}
          />
        )}
        {step === "customize" && selectedPackage && (
          <Customize 
            selectedPackage={selectedPackage} 
            materials={materials}
            bathroomConfig={bathroomConfig}
            setBathroomConfig={setBathroomConfig}
            isApplying={isApplying}
            squareFootageConfig={squareFootageConfig}
            universalConfig={universalConfig}
          />
        )}
      </div>

      <footer className="bg-offwhite border-t border-gray-200">
        <div className="w-full mx-auto py-6">
          <p className="text-center text-navy font-space font-medium">&copy; 2025 CloudRenovation.ca</p>
        </div>
      </footer>
    </div>
  );
}

const CloudRenoBackground = () => {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      {/* CloudReno dotted pattern background */}
      <div className="absolute inset-0 dotted-pattern"></div>
    </div>
  );
};
