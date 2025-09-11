// calculatePriceBracket.ts
export function calculatePriceBracket(
  price: number | string,
  items: any[]
): string {
  // Convert to numeric, removing commas if present
  const p =
    typeof price === "string" ? parseFloat(price.replace(/,/g, "")) : price;

  if (isNaN(p) || p <= 0) return "";

  // Gather all prices from these items
  const allPrices = items
    .map((it: any) =>
      parseFloat((it.PRICE || it.PRICE_SQF || "0").replace(/,/g, ""))
    )
    .filter((val) => !isNaN(val) && val > 0);

  if (allPrices.length === 0) return "";

  // If we have a specific type, only look at prices for that type
  const typePrices = items
    .map((it: any) =>
      parseFloat((it.PRICE || it.PRICE_SQF || "0").replace(/,/g, ""))
    )
    .filter((val) => !isNaN(val) && val > 0)
    .sort((a, b) => a - b); // Sort prices in ascending order

  if (typePrices.length > 0) {
    const minPrice = typePrices[0];
    const maxPrice = typePrices[typePrices.length - 1];

    // If all prices are the same
    if (minPrice === maxPrice) return "$";

    // Calculate thresholds at 33% and 66% of the sorted array
    const firstThreshold = typePrices[Math.floor(typePrices.length * 0.33)];
    const secondThreshold = typePrices[Math.floor(typePrices.length * 0.66)];

    if (p <= firstThreshold) {
      return "$";
    } else if (p <= secondThreshold) {
      return "$$";
    } else {
      return "$$$";
    }
  }

  return "";
}
