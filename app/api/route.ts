import { google } from "googleapis"; // Import Google APIs
import { NextRequest, NextResponse } from "next/server";

const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

export async function POST(req: NextRequest) {
  if (req.method !== "POST") {
    return NextResponse.json(
      { error: "Invalid request method" },
      { status: 405 }
    );
  }

  const order = await req.json();

  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const values = Object.values({
    ...order,
    orderDate: new Date().toLocaleString("en-US", {
      timeZone: "America/New_York",
    }),
  }).map((value) =>
    typeof value === "object" && value !== null ? JSON.stringify(value) : value
  );

  try {
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A1:Z",
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [values],
      },
    });

    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    console.error("Error appending data to Google Sheets:", error);
    return NextResponse.json(
      { error: "Failed to append data to Google Sheets" },
      { status: 500 }
    );
  }
}
