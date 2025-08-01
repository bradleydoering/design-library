"use client";
import { Button, Card } from "../Components";
import { ChevronRight } from "lucide-react";
import { Package } from "../types";
import Image from "next/image";
import { useRouter } from "next/navigation";

type IntroProps = {
  packages: Package[];
  materials: Record<string, number>;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  sortDirection: "asc" | "desc" | "default";
  setSortDirection: (dir: "asc" | "desc" | "default") => void;
  calculatePackagePrice: (pkg: Package, materials: any) => number;
  onPackageSelect: (pkg: Package) => void;
};

export default function Intro({
  packages,
  materials,
  selectedCategory,
  setSelectedCategory,
  sortDirection,
  setSortDirection,
  calculatePackagePrice,
  onPackageSelect,
}: IntroProps) {
  const router = useRouter();
  
  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };
  // Dynamically generate categories from packages (capitalize each category)
  const CATEGORIES = ["All"].concat(
    Array.from(
      new Set(
        packages.map(
          (pkg) =>
            pkg.category.charAt(0).toUpperCase() +
            pkg.category.slice(1).toLowerCase()
        )
      )
    )
  );

  return (
    <div className="min-h-screen pt-40 pb-20 relative overflow-hidden">
      <div className="w-full px-4 sm:px-6 lg:px-8 space-y-12 pt-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-space font-bold text-navy">
            Bathroom Design Ideas
          </h1>
          <h2 className="text-2xl font-space font-medium text-gray-700">
            Choose your ready to go bathroom package
          </h2>
        </div>
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-6 relative">
          <div className="flex gap-2 flex-wrap justify-center">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat)}
                className={`min-w-[100px] font-inter font-medium ${
                  selectedCategory === cat
                    ? "btn-coral text-white border-none"
                    : "bg-white text-navy hover:bg-gray-50 border-none"
                }`}
              >
                {cat}
              </Button>
            ))}
          </div>
          <div className="flex justify-center w-full md:w-auto md:absolute md:right-0 md:top-1/2 md:-translate-y-1/2">
            <Button
              variant="outline"
              onClick={() =>
                setSortDirection(
                  sortDirection === "asc"
                    ? "desc"
                    : sortDirection === "desc"
                    ? "default"
                    : "asc"
                )
              }
              className="flex items-center gap-2 justify-center bg-white text-navy hover:bg-gray-50 border-none font-inter font-medium"
            >
              <span className="flex items-center gap-2">
                {sortDirection !== "default" && (
                  <Image
                    src="/icons/dollar.png"
                    alt="$"
                    width={12}
                    height={12}
                    className="mx-1"
                  />
                )}
                {`${
                  sortDirection === "asc"
                    ? "Low to High"
                    : sortDirection === "desc"
                    ? "High to Low"
                    : "Default"
                } (${
                  packages.filter(
                    (p) =>
                      selectedCategory === "All" ||
                      p.category === selectedCategory
                  ).length
                })`}
              </span>
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 w-full gap-6 md:gap-8 justify-items-stretch max-w-none">
          {packages
            .filter(
              (p) =>
                selectedCategory === "All" || p.category === selectedCategory
            )
            .sort((a, b) => {
              if (sortDirection === "default") return 0;
              const priceA = calculatePackagePrice(a, materials);
              const priceB = calculatePackagePrice(b, materials);
              return sortDirection === "asc"
                ? priceA - priceB
                : priceB - priceA;
            })
            .map((p) => {
              const price = calculatePackagePrice(p, materials);
              return (
                <Card
                  key={p.id}
                  className="w-full relative overflow-hidden shadow-[0px_1px_4px_1px_rgba(0,0,0,0.05)] border-none bg-white cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] group"
                  onClick={() => router.push(`/bathroom/${generateSlug(p.name)}`)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === "Enter" && router.push(`/bathroom/${generateSlug(p.name)}`)}
                >
                  <Image
                    src={p.image}
                    alt={p.name}
                    className="w-full h-[250px] md:h-[200px] lg:h-[220px] object-cover object-center"
                    width={300}
                    height={250}
                    onError={(e) => {
                      // If .jpg fails, try .png
                      const currentSrc = e.currentTarget.src;
                      if (currentSrc.endsWith('.jpg')) {
                        console.log('JPG failed, trying PNG for:', currentSrc);
                        e.currentTarget.src = currentSrc.replace('.jpg', '.png');
                      } else {
                        console.log('Image loading failed for:', currentSrc);
                      }
                    }}
                  />
                  <div className="p-3 pb-2 pt-3">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-[0.95rem] font-[500] text-gray-900">
                        {p.name}
                      </h3>
                      <div className="bg-[#EFEADF] px-3 py-1 text-[0.75rem] font-medium ml-2">
                        {p.category}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col items-start">
                        <span className="text-[0.8rem] text-gray-500 mb-0">
                          Starting at
                        </span>
                        <span className="text-[1.2rem] font-[500] text-gray-900">
                          ${" "}
                          {price.toLocaleString("en-US", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </span>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <ChevronRight
                          className="h-5 w-5 text-gray-800 transform transition-all duration-300 -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                          strokeWidth={3}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
        </div>
      </div>
    </div>
  );
}
