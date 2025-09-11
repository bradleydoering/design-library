/* eslint-disable @typescript-eslint/no-require-imports */
import { google } from "googleapis";
import { OpenAI } from "openai";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Image fields to process
const IMAGE_FIELDS = ["IMAGE_MAIN", "IMAGE_00", "IMAGE_01"];

// Function to validate URLs before attempting to process them
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

// Process a single image URL
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
    console.error(
      `Image description error for ${fieldName}: ${
        e instanceof Error ? e.message : String(e)
      }`
    );
    return "";
  }
}

// Get descriptions for up to 3 images
async function getDescriptionsForImages(item: any): Promise<string[]> {
  const descriptions: string[] = [];
  let processedCount = 0;

  // Only process the first 3 valid images
  for (const field of IMAGE_FIELDS) {
    if (processedCount >= 3) break; // Stop after 3 images

    if (item[field]) {
      // Only process if it's a valid URL
      if (isValidUrl(item[field])) {
        const desc = await processImageUrl(item[field], field);
        if (desc) {
          descriptions.push(desc);
          processedCount++; // Only increment counter for valid images
        }
      } else {
        console.log(`Skipping invalid image URL in field: ${field}`);
      }
    }
  }
  return descriptions;
}

// Fetch packages data from Google Sheets
async function fetchPackagesData() {
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

    if (!response.data.values) return { headers: [], rows: [] };

    // Get header row to find column indices
    const headers = response.data.values[0];

    // Map the data to objects with column names
    return {
      headers,
      rows: response.data.values.slice(1).map((row) => {
        const item: Record<string, any> = {};
        headers.forEach((header: string, index: number) => {
          item[header] = row[index] || "";
        });
        return item;
      }),
    };
  } catch (error) {
    console.error("Error fetching packages data:", error);
    throw error;
  }
}

// Main function to process packages and update sheet
async function processPackagesWithVision() {
  try {
    console.log("Fetching packages data from Google Sheets...");
    const { headers, rows } = await fetchPackagesData();
    console.log(`Fetched ${rows.length} packages`);

    // Initialize Google Sheets API for updates
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Check if VISION column exists, if not, add it
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Packages!1:1", // Get header row
    });

    const headerRow = response.data.values?.[0] || [];
    let visionColumnIndex = headerRow.indexOf("VISION");

    // If VISION column doesn't exist, add it
    if (visionColumnIndex === -1) {
      visionColumnIndex = headers.length;

      // Update header row with new VISION column
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Packages!${String.fromCharCode(65 + visionColumnIndex)}1`,
        valueInputOption: "RAW",
        requestBody: {
          values: [["VISION"]],
        },
      });

      console.log("Added VISION column to sheet");
    }

    // Process each package
    for (const pkg of rows) {
      // Find valid image URLs
      const validImageUrls = IMAGE_FIELDS.map((field) => pkg[field])
        .filter((url) => url && isValidUrl(url))
        .slice(0, 1); // Only process the first valid image

      if (validImageUrls.length > 0) {
        // Process the first valid image
        const visionDescription = await processImageUrl(
          validImageUrls[0],
          "main image"
        );

        // Update the VISION column for this package
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `Packages!${String.fromCharCode(65 + visionColumnIndex)}${
            rows.indexOf(pkg) + 2
          }`,
          valueInputOption: "RAW",
          requestBody: {
            values: [[visionDescription]],
          },
        });

        console.log(
          `Updated vision description for package ${pkg.ID} in Google Sheet`
        );
      } else {
        console.log(`No valid images found for package ${pkg.ID}, skipping`);
      }
    }

    console.log("Successfully completed processing all packages");
  } catch (error) {
    console.error("Error processing packages with vision:", error);
    if (error instanceof Error) {
      console.error("Error details:", error.message);
      console.error("Stack trace:", error.stack);
    }
  }
}

// Execute the main function
processPackagesWithVision().catch((e) => {
  console.error("Process failed:", (e as Error).message);
});
