import { google } from "googleapis";
import { NextResponse } from "next/server";

const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

async function getAllSheetsData() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // First, get the spreadsheet metadata to verify sheet names
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const actualSheetNames =
      spreadsheet.data.sheets?.map((sheet) => sheet.properties?.title) || [];

    // Fetch data for all existing sheets in parallel
    const allData = await Promise.all(
      actualSheetNames.map(async (sheetName) => {
        if (!sheetName) return [sheetName, null];

        try {
          const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `'${sheetName}'`, // Wrap sheet name in quotes to handle special characters
          });

          const rows = response.data.values;
          if (!rows || rows.length === 0) {
            return [sheetName, null];
          }

          const headers = rows[0];
          const data = rows.slice(1).map((row) => {
            const item: { [key: string]: any } = {};
            headers.forEach((header: string, index: number) => {
              item[header] = row[index];
            });
            return item;
          });

          return [sheetName, data];
        } catch (error) {
          console.error(`Error fetching sheet ${sheetName}:`, error);
          return [sheetName, null];
        }
      })
    );

    // Convert array of [sheetName, data] pairs to an object
    return Object.fromEntries(allData);
  } catch (error) {
    console.error("Error fetching all sheets data:", error);
    throw error;
  }
}

export async function GET() {
  try {
    const data = await getAllSheetsData();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Route error:", error);

    // Check if it's a quota exceeded error
    if (error?.message?.includes("Quota exceeded")) {
      return NextResponse.json(
        {
          error:
            "The service is temporarily unavailable due to high demand. Please try again in a minute.",
        },
        { status: 429 } // Too Many Requests
      );
    }

    // Default error response
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
