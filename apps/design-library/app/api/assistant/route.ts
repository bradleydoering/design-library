import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // 1. Parse user messages from the request body
    const { messages } = await req.json();

    // 2. Prepare the request to Pinecone's Assistant API
    const apiKey = process.env.PINECONE_API_KEY!;
    const assistantName = process.env.PINECONE_ASSISTANT_NAME || "hr-assistant";
    const apiUrl = `${process.env.PINECONE_API_URL}/assistant/chat/${assistantName}`;

    // Add retry logic
    const maxRetries = 3;
    const timeout = 30000; // 30 seconds timeout

    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Api-Key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: messages,
            stream: false,
            model: process.env.OPENAI_MODEL || "gpt-4",
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Log detailed response information
        console.log(`Attempt ${attempt} - Status: ${response.status}`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            `Attempt ${attempt} - Pinecone API error: ${response.status}`,
            errorText
          );

          // If it's a 504, throw an error to trigger retry
          if (response.status === 504) {
            throw new Error(`Gateway timeout on attempt ${attempt}`);
          }

          return new Response(
            JSON.stringify({
              error: `Pinecone API error: ${response.status}`,
              details: errorText,
            }),
            {
              status: response.status,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          console.log(`Attempt ${attempt} failed, retrying...`);
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw lastError;
  } catch (error) {
    console.error("Error in assistant route:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
