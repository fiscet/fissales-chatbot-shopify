import { json, type ActionFunctionArgs } from "@remix-run/node";
import { getAppSettingsFromFirestore, saveChatSessionToFirestore, saveAnalyticsEventToFirestore } from "../lib/firestore.server";
import { ChatApiClient } from "../lib/api.client";

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { chatEnvelope } = body;
    const shopDomain = request.headers.get('X-Shop-Domain');

    // Validate input
    if (!chatEnvelope || !shopDomain) {
      return new Response(JSON.stringify({
        error: 'Missing required fields: chatEnvelope and X-Shop-Domain header'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { message, sessionId, customerId } = chatEnvelope;

    if (!message || !sessionId) {
      return new Response(JSON.stringify({
        error: 'Missing required fields in chatEnvelope: message and sessionId'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate shopDomain format
    const shopRegex = /^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/;
    if (!shopRegex.test(shopDomain)) {
      return new Response(JSON.stringify({
        error: 'Invalid shop domain format'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get app settings from Firestore
    const settings = await getAppSettingsFromFirestore(shopDomain);
    if (!settings) {
      return new Response(JSON.stringify({
        error: 'Shop not configured'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!settings.apiKey || !settings.apiUrl) {
      return new Response(JSON.stringify({
        error: 'App settings not configured. Please contact the store administrator.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!settings.isActive) {
      return new Response(JSON.stringify({
        error: 'Chatbot is currently disabled'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check message length
    if (message.length > 1000) {
      return new Response(JSON.stringify({
        error: 'Message too long (max 1000 characters)'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Forward the request to external API (matching Villma pattern)
    const response = await fetch(settings.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Fissales-Api-Key': settings.apiKey,
        'X-Shop-Domain': shopDomain,
        'X-Session-ID': sessionId,
        'X-Customer-ID': customerId || '',
      },
      body: JSON.stringify({
        message,
        sessionId,
        customerId,
        shopDomain
      })
    });

    if (!response.ok) {
      throw new Error(`External API responded with status: ${response.status}`);
    }

    const data = await response.json();

    // Save chat session to Firestore
    await saveChatSessionToFirestore({
      shopDomain,
      sessionId,
      message: {
        content: message,
        sender: 'customer',
        timestamp: new Date(),
      },
      response: {
        content: data.response || data.message || 'No response received',
        timestamp: new Date(),
      }
    });

    // Save analytics event
    await saveAnalyticsEventToFirestore({
      shopDomain,
      eventType: 'customer_message',
      sessionId,
      timestamp: new Date(),
      metadata: {
        messageLength: message.length,
        hasResponse: !!(data.response || data.message),
        customerId: customerId || null,
      }
    });

    return new Response(JSON.stringify({
      response: data.response || data.message || 'No response received'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Customer chat API error:', error);

    // Log error for debugging
    try {
      const body = await request.json();
      const shopDomain = request.headers.get('X-Shop-Domain');
      if (shopDomain) {
        await saveAnalyticsEventToFirestore({
          shopDomain,
          eventType: 'api_error',
          sessionId: body.chatEnvelope?.sessionId || 'unknown',
          timestamp: new Date(),
          metadata: {
            error: error instanceof Error ? error.message : 'Unknown error',
          }
        });
      }
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return new Response(JSON.stringify({
      error: 'Internal server error. Please try again.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Handle OPTIONS request for CORS
export const loader = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
