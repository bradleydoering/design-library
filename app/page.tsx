"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Intro from "@/app/components/Intro";
import Customize from "@/app/components/Customize";
import { getMaterials } from "@/lib/materials";
import { Loader2, Menu, X, Sparkles, Blocks } from "lucide-react";
import { PackageFromAPI, Package } from "@/app/types";
import { calculatePackagePrice } from "@/lib/utils";
import AIAssistant from "./components/AIAssistant";

// Define common button styles as constants
const BUTTON_BASE = "py-2 rounded-t-[10px]";
const BUTTON_ACTIVE = "border-b-2 border-gray-600 text-gray-600";
const BUTTON_INACTIVE = "text-gray-400";
const MOBILE_BUTTON_BASE =
  "w-full px-4 py-2 rounded-[6px] hover:bg-gray-100 text-left";
const CONSULTATION_BUTTON_BASE = "bg-[#2d332c] text-white hover:bg-[#1a1f19]";

// Define the NavItem type
interface NavItem {
  id: "intro" | "ai";
  label: string;
  icon?: JSX.Element;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "intro",
    label: "Packages",
    icon: <Blocks className="w-4 h-4 inline-block mr-1" />,
  },
  {
    id: "ai",
    label: "AI Assistant",
    icon: <Sparkles className="w-4 h-4 inline-block mr-1" />,
  },
];

export default function Page() {
  const [step, setStep] = useState<"intro" | "customize" | "ai">("intro");
  const [packages, setPackages] = useState<Package[]>([]);
  const [materials, setMaterials] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [sortDirection, setSortDirection] = useState<
    "asc" | "desc" | "default"
  >("default");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const changeStep = (newStep: "intro" | "customize") => {
    setStep(newStep);
    window.history.pushState({ step: newStep }, "", "");
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await getMaterials();
        if (!data) {
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
      } catch (err: any) {
        toast.error(`Failed to load materials: ${err.message}`);
      } finally {
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const renderNavButton = (item: NavItem, isMobile = false) => {
    const baseStyles = isMobile ? MOBILE_BUTTON_BASE : BUTTON_BASE;
    const activeStyles = isMobile ? "text-gray-600" : BUTTON_ACTIVE;
    const inactiveStyles = isMobile ? "text-gray-400" : BUTTON_INACTIVE;

    return (
      <button
        key={item.id}
        onClick={() => {
          setStep(item.id);
          if (isMobile) setIsMobileMenuOpen(false);
        }}
        className={`${baseStyles} flex items-center justify-center  ${
          step === item.id ? activeStyles : inactiveStyles
        } min-w-[100px] ${isMobile ? "" : ""}`}
      >
        {item.icon && <span>{item.icon}</span>}
        <span>{item.label}</span>
      </button>
    );
  };

  const renderConsultationButton = (isMobile = false) => (
    <button
      key="consultation"
      className={`${CONSULTATION_BUTTON_BASE}
      text-xs min-w-[100px]
${isScrolled ? "max-w-[140px]" : "max-w-[160px]"}
      ${
        isMobile
          ? "w-full px-4 py-2 mx-auto rounded-[6px] "
          : "mx-2 px-3 py-3 rounded-[10px]"
      }`}
      onClick={() => {
        handleSubmit();
        if (isMobile) setIsMobileMenuOpen(false);
      }}
    >
      {isScrolled ? "Free Consultation" : "Book Free Consultation"}
    </button>
  );

  const NavItems = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {NAV_ITEMS.map((item) => renderNavButton(item, isMobile))}
      {renderConsultationButton(isMobile)}
    </>
  );

  if (isLoading) {
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
      {step === "intro" && (
        <div className="fixed inset-0 h-screen w-full overflow-hidden">
          <BackgroundCircles />
        </div>
      )}
      <header
        className={`fixed left-1/2 -translate-x-1/2 transition-all duration-[700ms]
          ${
            isScrolled
              ? "top-4 w-[calc(100%-32px)] max-w-[500px] rounded-2xl px-4 shadow-lg"
              : "top-0 w-[100%] shadow-sm"
          }
           z-20 bg-white/80 backdrop-blur-md `}
      >
        <div className="container mx-auto py-2 min-[1000px]:py-3 max-w-[1000px] ">
          <div className="flex justify-between items-center max-[1000px]:px-4">
            <Image
              src="/logo-hr.png"
              alt="Homerenu"
              width={120}
              height={32}
              style={{ width: "auto", maxHeight: 32, cursor: "pointer" }}
              onClick={() =>
                (window.location.href = "https://www.homerenu.com")
              }
            />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="min-[1000px]:hidden p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <Menu className="h-6 w-6 text-gray-600" />
              )}
            </button>
            <div className="hidden min-[1000px]:flex gap-3 items-center text-[0.8rem]">
              <NavItems />
            </div>
          </div>
          {isMobileMenuOpen && (
            <div className="min-[1000px]:hidden mt-4 pb-2 flex flex-col gap-2 text-sm max-[1000px]:text-[0.7rem]">
              <NavItems isMobile />
            </div>
          )}
        </div>
      </header>

      <div className="flex-grow max-w-[1000px] mx-auto px-0 w-full">
        <ToastContainer />
        {step === "intro" && (
          <Intro
            packages={packages}
            materials={materials}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            sortDirection={sortDirection}
            setSortDirection={setSortDirection}
            calculatePackagePrice={calculatePackagePrice}
            onPackageSelect={handlePackageSelect}
          />
        )}
        {step === "ai" && <AIAssistant />}
        {step === "customize" && selectedPackage && (
          <Customize selectedPackage={selectedPackage} materials={materials} />
        )}
      </div>

      <footer className="bg-white/10 backdrop-blur-md border-t border-gray-200 opacity-60">
        <div className="w-full mx-auto py-4">
          <p className="text-center text-gray-400">&copy; 2025 Homerenu.ca</p>
        </div>
      </footer>
    </div>
  );
}

const BackgroundCircles = () => {
  const colors = [
    "#8DBACE",
    "#D4B4AE",
    "#E0BF5A",
    "#9DC0C0",
    "#E6D5AC",
    "#B6D4C7",
  ];
  const numCircles = 5;

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {[...Array(numCircles)].map((_, i) => {
        const duration = 4 + Math.random() * 2;
        return (
          <div
            key={i}
            className="absolute rounded-full opacity-60"
            style={{
              background: `radial-gradient(circle at center, ${
                colors[i % colors.length]
              } 0%, rgba(255,255,255,0.2) 70%)`,
              width: `${Math.random() * 400 + 300}px`,
              height: `${Math.random() * 400 + 300}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
              filter: "blur(80px) saturate(1.5)",
              animation: `float-${i % 6} ${duration.toFixed(
                1
              )}s infinite ease-in-out`,
            }}
          />
        );
      })}
    </div>
  );
};
