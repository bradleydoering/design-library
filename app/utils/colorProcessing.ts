// colorProcessing.ts
type ColorMap = Record<string, { name: string; hex: string }>;

interface ProcessedColor {
  color: string;
  isSelected: boolean;
  key: string;
  name: string;
}

export function processItemColors(
  item: Record<string, any>,
  colors: ColorMap = {},
  fallbackColor: string = "#CCCCCC"
): ProcessedColor[] {
  // Extract color keys in their natural order
  const colorKeys = Object.keys(item).filter(
    (key) => key.startsWith("COLOR_") && item[key]?.length > 0
  );

  let availableColors = colorKeys.map((key) => ({
    color: colors[key]?.hex || fallbackColor,
    isSelected: item[key] === "DEFAULT",
    key,
    name: colors[key]?.name || "Unknown",
  }));

  if (!availableColors.length) {
    availableColors = [
      {
        color: fallbackColor,
        isSelected: true,
        key: "DEFAULT",
        name: "Default",
      },
    ];
  }

  // Do not sort—preserve the natural order.
  return availableColors;
}
