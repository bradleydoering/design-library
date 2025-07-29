"use client";
import { Button, Card } from "@/app/Components";
import { ChevronRight } from "lucide-react";
import { Package } from "@/app/types";
import Image from "next/image";

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
      <div className="container mx-auto px-0 space-y-12 pt-8">
        <h3 className="text-4xl text-center">
          Choose your ready to go bathroom package
        </h3>
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-6 relative">
          <div className="flex gap-2 flex-wrap justify-center">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat)}
                className={`min-w-[100px] rounded-[12px] ${
                  selectedCategory === cat
                    ? "bg-[#EFEADF] border-[#EFEADF] text-black hover:bg-[#EFEADF]/90"
                    : "border-2 border-black hover:bg-black/5"
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
              style={{ backgroundColor: "#F6f7f9", fontWeight: "500" }}
              className="flex items-center gap-2 justify-center border-none"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 max-w-[1100px] mx-auto gap-6 justify-items-center">
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
                  className="max-w-[280px] md:max-w-[260px] relative overflow-hidden rounded-[20px] shadow-[0px_1px_4px_1px_rgba(0,0,0,0.05)] border-none bg-white cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 hover:scale-[1.02] rounded-tr-[24px] group "
                  onClick={() => onPackageSelect(p)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === "Enter" && onPackageSelect(p)}
                >
                  <div className="absolute top-1 right-1 bg-[#EFEADF] px-6 py-3 rounded-tr-[24px] rounded-bl-[20px] border-[8px] border-white text-[0.9rem] font-medium">
                    {p.category}
                  </div>
                  <Image
                    src={p.image}
                    alt={p.name}
                    className="w-[300px]  h-[300px] md:h-[250px] object-cover object-center rounded-[24px] p-3"
                    width={280}
                    height={200}
                  />
                  <div className="p-3 pb-2 pt-0">
                    <h3 className="text-[0.95rem] font-[500] text-gray-900 mb-2">
                      {p.name}
                    </h3>
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
