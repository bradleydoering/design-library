import { NextResponse } from "next/server";

// HubSpot API key should be in your environment variables
const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Create contact in HubSpot
    const response = await fetch(
      "https://api.hubapi.com/crm/v3/objects/contacts",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${HUBSPOT_API_KEY}`,
        },
        body: JSON.stringify({
          properties: {
            firstname: name.split(" ")[0],
            lastname: name.split(" ").slice(1).join(" ") || "",
            email: email,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create contact in HubSpot");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating contact:", error);
    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 }
    );
  }
}
