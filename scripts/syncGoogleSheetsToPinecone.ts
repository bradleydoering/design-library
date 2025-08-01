/* eslint-disable @typescript-eslint/no-require-imports */
import { google } from "googleapis";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAI } from "openai";
import fs from "fs";
import dotenv from "dotenv";
import { getMaterials } from "../lib/materials.js";

// Load environment variables from .env file
dotenv.config();

const fsPromises = fs.promises;

// ---------- Interfaces and Types ----------

type VectorData = [string, number[], Record<string, any>];

interface PackageItem {
  ID: string;
  NAME: string;
  DESCRIPTION: string;
  TILES_FLOOR_SKU: string;
  TILES_WALL_SKU: string;
  TILES_SHOWER_FLOOR_SKU: string;
  TILES_ACCENT_SKU: string;
  VANITY_SKU: string;
  TUB_SKU: string;
  TUB_FILLER_SKU: string;
  TOILET_SKU: string;
  SHOWER_SKU: string;
  FAUCET_SKU: string;
  GLAZING_SKU: string;
  MIRROR_SKU: string;
  TOWEL_BAR_SKU: string;
  TOILET_PAPER_HOLDER_SKU: string;
  HOOK_SKU: string;
  LIGHTING_SKU: string;
  CATEGORY: string;
  IMAGE_MAIN: string;
  IMAGE_00?: string;
  IMAGE_01?: string;
  IMAGE_02?: string;
  IMAGE_03?: string;
  IMAGE_04?: string;
  IMAGE_05?: string;
  VISION?: string;
}

interface MaterialsData {
  tiles?: any[];
  vanities?: any[];
  tubs?: any[];
  tub_fillers?: any[];
  toilets?: any[];
  showers?: any[];
  faucets?: any[];
  shower_glazing?: any[];
  mirrors?: any[];
  towel_bars?: any[];
  toilet_paper_holders?: any[];
  hooks?: any[];
  lighting?: any[];
  colors?: Array<{ NAME: string; HEX: string }>;
}

// ---------- Configuration ----------

const PINECONE_INDEX_NAME = process.env
  .PINECONE_INDEX_NAME!.toLowerCase()
  .replace(/[^a-z0-9-]/g, "-");
const EMBEDDING_DIMENSION = +process.env.PINECONE_EMBEDDING_DIMENSION!;
const LAST_SYNC_FILE = "last_synced.txt";
const PACKAGES_SYNC_FILE = "synced_packages.json";
const ITEMS_SYNC_FILE = "synced_items.json";
const IMAGE_FIELDS = [
  "IMAGE_MAIN",
  "IMAGE_00",
  "IMAGE_01",
  "IMAGE_02",
  "IMAGE_03",
  "IMAGE_04",
  "IMAGE_05",
];

// ---------- Initialize Clients ----------

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const pineconeClient = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });

// ---------- Utility Functions ----------

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function loadLastSynced(): Promise<Date> {
  try {
    if (fs.existsSync(LAST_SYNC_FILE)) {
      const tsStr = await fsPromises.readFile(LAST_SYNC_FILE, "utf-8");
      if (tsStr.trim()) return new Date(tsStr.trim());
    }
  } catch (e) {
    console.error("Error reading last synced timestamp:", (e as Error).message);
  }
  return new Date(0);
}

async function saveLastSynced(timestamp: Date): Promise<void> {
  try {
    await fsPromises.writeFile(
      LAST_SYNC_FILE,
      timestamp.toISOString(),
      "utf-8"
    );
  } catch (e) {
    console.error("Error saving last synced timestamp:", (e as Error).message);
  }
}

async function loadSyncedPackages(): Promise<Set<string>> {
  if (!fs.existsSync(PACKAGES_SYNC_FILE)) return new Set();
  const data = await fsPromises.readFile(PACKAGES_SYNC_FILE, "utf-8");
  try {
    const arr = JSON.parse(data);
    return new Set(arr);
  } catch {
    return new Set();
  }
}

async function saveSyncedPackages(names: Set<string>): Promise<void> {
  await fsPromises.writeFile(
    PACKAGES_SYNC_FILE,
    JSON.stringify(Array.from(names))
  );
}

async function loadSyncedItems(): Promise<Set<string>> {
  if (!fs.existsSync(ITEMS_SYNC_FILE)) return new Set();
  const data = await fsPromises.readFile(ITEMS_SYNC_FILE, "utf-8");
  try {
    const arr = JSON.parse(data);
    return new Set(arr);
  } catch {
    return new Set();
  }
}

async function saveSyncedItems(skus: Set<string>): Promise<void> {
  await fsPromises.writeFile(ITEMS_SYNC_FILE, JSON.stringify(Array.from(skus)));
}

// ---------- Google Sheets Integration for Packages ----------

async function fetchPackagesData(): Promise<PackageItem[]> {
  try {
    // Add NODE_OPTIONS environment variable to handle OpenSSL issues
    process.env.NODE_OPTIONS = "--openssl-legacy-provider";

    // Use environment variables for Google credentials
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const range = "Packages!A:Z";

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    if (!response.data.values || response.data.values.length < 2) return [];

    // Extract headers from the first row
    const headers = response.data.values[0];

    // Create a mapping of column names to indices
    const columnMap: Record<string, number> = {};
    headers.forEach((header, index) => {
      columnMap[header] = index;
    });

    // Map the data using column headers instead of fixed indices
    return response.data.values.slice(1).map((row: any[]) => {
      const item: Partial<PackageItem> = {};

      // Map each field using the column headers
      Object.keys(columnMap).forEach((header) => {
        const index = columnMap[header];
        if (index !== undefined && index < row.length) {
          // Convert header to a valid property name (e.g., "ID" or custom mapping)
          const prop = header as keyof PackageItem;
          item[prop] = row[index] || "";
        }
      });

      return item as PackageItem;
    });
  } catch (error) {
    console.error("Error fetching packages data:", error);
    throw error;
  }
}

// ---------- Vision Model: Get Image Description ----------

// Add a function to validate URLs before attempting to process them
function isValidUrl(urlString: string): boolean {
  try {
    // Check if it's a valid URL format
    new URL(urlString);

    // Additional check to ensure it's an image URL (optional)
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    return (
      imageExtensions.some((ext) => urlString.toLowerCase().includes(ext)) ||
      urlString.toLowerCase().startsWith("http")
    );
  } catch (e) {
    return false;
  }
}

// When processing image URLs, modify the code to check validity first
async function processImageUrl(
  url: string,
  fieldName: string
): Promise<string> {
  if (!url || !isValidUrl(url)) {
    console.log(`Skipping invalid image URL in field: ${fieldName}`);
    return ""; // Return empty string for invalid URLs
  }

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_VISION_MODEL || "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "What's in this image?" },
            { type: "image_url", image_url: { url: url } },
          ],
        },
      ],
      store: true,
    });
    return response.choices[0].message.content || "";
  } catch (e) {
    console.error(`Image description error for ${fieldName}: ${e instanceof Error ? e.message : String(e)}`);
    return "";
  }
}

// ---------- OpenAI Embedding Function ----------

async function getEmbeddings(text: string): Promise<number[]> {
  try {
    const cleanedText = text.replace(/\n/g, " ");
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: cleanedText,
      encoding_format: "float",
    });
    const embedding = response.data[0]?.embedding;
    if (!embedding) throw new Error("No embedding returned from OpenAI");
    return embedding;
  } catch (error: any) {
    console.error("Embedding error:", error.message);
    if (error.response?.status === 429) {
      console.log("Rate limited – waiting 20 seconds...");
      await sleep(20000);
      return getEmbeddings(text);
    }
    throw error;
  }
}

// ---------- Pinecone Index Initialization ----------

async function initializePineconeIndex() {
  try {
    const existingIndexes = await pineconeClient.listIndexes();
    const indexExists = existingIndexes.indexes?.some(
      (index: { name: string }) => index.name === PINECONE_INDEX_NAME
    );
    if (!indexExists) {
      await pineconeClient.createIndex({
        name: PINECONE_INDEX_NAME,
        dimension: EMBEDDING_DIMENSION,
        metric: "cosine",
        spec: { serverless: { cloud: "aws", region: "us-east-1" } },
      });
      console.info(`Created Pinecone index: ${PINECONE_INDEX_NAME}`);
    } else {
      console.info(`Using existing Pinecone index: ${PINECONE_INDEX_NAME}`);
    }
    return pineconeClient.index(PINECONE_INDEX_NAME);
  } catch (error) {
    console.error(
      "Error initializing Pinecone index:",
      (error as Error).message
    );
    throw error;
  }
}

// ---------- SKU Mapping ----------

type PackageItemSKUFields = keyof Pick<
  PackageItem,
  | "TILES_FLOOR_SKU"
  | "TILES_WALL_SKU"
  | "TILES_SHOWER_FLOOR_SKU"
  | "TILES_ACCENT_SKU"
  | "VANITY_SKU"
  | "TUB_SKU"
  | "TUB_FILLER_SKU"
  | "TOILET_SKU"
  | "SHOWER_SKU"
  | "FAUCET_SKU"
  | "GLAZING_SKU"
  | "MIRROR_SKU"
  | "TOWEL_BAR_SKU"
  | "TOILET_PAPER_HOLDER_SKU"
  | "HOOK_SKU"
  | "LIGHTING_SKU"
>;

const skuMapping: Record<PackageItemSKUFields, keyof MaterialsData> = {
  TILES_FLOOR_SKU: "tiles",
  TILES_WALL_SKU: "tiles",
  TILES_SHOWER_FLOOR_SKU: "tiles",
  TILES_ACCENT_SKU: "tiles",
  VANITY_SKU: "vanities",
  TUB_SKU: "tubs",
  TUB_FILLER_SKU: "tub_fillers",
  TOILET_SKU: "toilets",
  SHOWER_SKU: "showers",
  FAUCET_SKU: "faucets",
  GLAZING_SKU: "shower_glazing",
  MIRROR_SKU: "mirrors",
  TOWEL_BAR_SKU: "towel_bars",
  TOILET_PAPER_HOLDER_SKU: "toilet_paper_holders",
  HOOK_SKU: "hooks",
  LIGHTING_SKU: "lighting",
};

interface NamedMaterial {
  NAME: string;
  DESCRIPTION: string;
}

function isNamedMaterial(item: any): item is NamedMaterial {
  return (
    typeof item?.NAME === "string" && typeof item?.DESCRIPTION === "string"
  );
}

// ---------- Prepare Data for Embedding ----------

async function preparePackageData(
  packages: PackageItem[],
  materials: MaterialsData,
  syncedPackageNames: Set<string>,
  syncedItemSKUs: Set<string>
): Promise<VectorData[]> {
  const vectorData: VectorData[] = [];

  for (const pkg of packages) {
    if (syncedPackageNames.has(pkg.NAME)) continue;

    // Process image descriptions if not already in VISION field
    let visionDescription = "";
    if (!pkg.VISION) {
      console.log(`Getting image descriptions for package: ${pkg.NAME}`);
      const imageDescriptions = await getDescriptionsForImages(
        pkg,
        IMAGE_FIELDS
      );
      visionDescription = imageDescriptions.join(" ");
      // Update the package with vision data for future use
      pkg.VISION = visionDescription;
    } else {
      console.log(`Using existing VISION data for package: ${pkg.NAME}`);
      visionDescription = pkg.VISION;
    }

    // Combine all text data for embedding
    let textInput = `${pkg.NAME} ${pkg.DESCRIPTION}`.trim();

    // Add the VISION field
    if (visionDescription || pkg.VISION) {
      textInput += ` ${visionDescription || pkg.VISION}`;
    }

    const linkedSkus: string[] = [];
    for (const [skuField, materialCategory] of Object.entries(skuMapping) as [
      PackageItemSKUFields,
      keyof MaterialsData
    ][]) {
      const sku = pkg[skuField];
      if (!sku || syncedItemSKUs.has(sku)) continue;

      const items = materials[materialCategory] || [];
      const item = items.find((mat: any) => mat.SKU === sku);
      if (!item) continue;

      linkedSkus.push(sku);
      if (isNamedMaterial(item)) {
        textInput += ` ${item.NAME} ${item.DESCRIPTION}`;
      }
    }

    if (materials.colors?.length) {
      const colorSummary = materials.colors
        .map((color) => `${color.NAME} (${color.HEX})`)
        .join(" ");
      textInput += " Colors available: " + colorSummary;
    }

    // Simple limit to prevent extremely large strings
    if (textInput.length > 8192) {
      textInput = textInput.slice(0, 8192);
    }

    const embedding = await getEmbeddings(textInput);

    // Minimal metadata references
    const metadata = {
      packageID: pkg.ID,
      packageName: pkg.NAME,
      linkedSKUs: linkedSkus,
    };

    vectorData.push([pkg.NAME, embedding, metadata]);
  }
  return vectorData;
}

// ---------- Main Synchronization Function ----------

async function syncToPinecone() {
  try {
    console.info("Syncing to Pinecone...");
    const syncedPackageNames = await loadSyncedPackages();
    const syncedItemSKUs = await loadSyncedItems();

    // Initialize Pinecone with better error handling
    let pineconeIndex;
    try {
      pineconeIndex = await initializePineconeIndex();
      console.info("Successfully connected to Pinecone index");
    } catch (error) {
      console.error("Failed to initialize Pinecone index:", error);
      throw error;
    }

    // Verify embedding dimension matches configuration
    const configuredDimension = EMBEDDING_DIMENSION;
    console.info(`Using embedding dimension: ${configuredDimension}`);

    // Validate embedding dimension with a test embedding
    const testEmbedding = await getEmbeddings("Test embedding");
    if (testEmbedding.length !== configuredDimension) {
      console.error(
        `Embedding dimension mismatch! Got ${testEmbedding.length}, expected ${configuredDimension}`
      );
      console.error(
        "Please update PINECONE_EMBEDDING_DIMENSION in your .env file to match the actual dimension"
      );
      throw new Error("Embedding dimension mismatch");
    }
    console.info(`Verified embedding dimension: ${testEmbedding.length}`);

    // Fetch packages with error handling
    let packages;
    try {
      packages = await fetchPackagesData();
      console.info(`Fetched ${packages.length} packages from Google Sheets`);
    } catch (error) {
      console.error("Failed to fetch packages data:", error);
      throw error;
    }

    if (!packages.length) {
      console.info("No package data found.");
      return;
    }

    // Get materials with error handling
    let materials;
    try {
      materials = await getMaterials();
      console.info("Successfully fetched materials data");
    } catch (error) {
      console.error("Failed to fetch materials data:", error);
      throw error;
    }

    // Process packages
    for (const pkg of packages) {
      try {
        // Skip if already synced
        if (syncedPackageNames.has(pkg.NAME)) {
          console.log(`Package ${pkg.NAME} already synced, skipping`);
          continue;
        }

        // Process package
        await processPackage(pkg, materials, pineconeIndex);
        syncedPackageNames.add(pkg.NAME);
        await saveSyncedPackages(syncedPackageNames);
      } catch (error) {
        console.error(`Error processing package ${pkg.NAME}:`, error);
        continue;
      }
    }

    // Process items
    for (const item of materials.items) {
      try {
        // Skip if already synced
        if (syncedItemSKUs.has(item.SKU)) {
          console.log(`Item ${item.SKU} already synced, skipping`);
          continue;
        }

        // Process item
        await processItem(item, pineconeIndex);
        syncedItemSKUs.add(item.SKU);
        await saveSyncedItems(syncedItemSKUs);
      } catch (error) {
        console.error(`Error processing item ${item.SKU}:`, error);
        continue;
      }
    }

    console.info("Sync completed successfully");
  } catch (error) {
    console.error("Sync failed:", error);
    throw error;
  }
}

// Execute the main function
syncToPinecone().catch((e) => {
  console.error("Sync failed:", (e as Error).message);
});
