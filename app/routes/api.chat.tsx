import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { settingsStorage } from "../db.server";

export const action = async ({ request }: LoaderFunctionArgs) => {
  // Authenticate the request (optional for public endpoints, but recommended)
  try {
    await authenticate.admin(request);
  } catch (error) {
    // For public access, you might want to skip authentication
    // or implement a different auth mechanism
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const body = await request.json();
    const { chatEnvelope } = body;
    const shopDomain = request.headers.get("X-Shop-Domain");

    if (!shopDomain) {
      return new Response(JSON.stringify({ error: "Shop domain required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Get the API settings for this shop
    const settings = await settingsStorage.getSettings(shopDomain);

    if (!settings) {
      return new Response(JSON.stringify({ error: "Shop not configured" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Forward the request to Villma API
    const response = await fetch(settings.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Villma-Api-Key": settings.apiKey,
        "X-Shop-Domain": shopDomain
      },
      body: JSON.stringify({ chatEnvelope })
    });

    if (!response.ok) {
      throw new Error(`Villma API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Proxy error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}; 