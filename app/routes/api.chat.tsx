import { json, type ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../lib/shopify.server";
import { getAppSettingsFromFirestore, saveChatSessionToFirestore, saveAnalyticsEventToFirestore } from "../lib/firestore.server";
import { ChatApiClient } from "../lib/api.client";

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    // Authenticate the request
    const { admin, session } = await authenticate.admin(request);

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, { status: 405 });
    }

    const body = await request.json();
    const { message, sessionId, userId } = body;

    // Validate input
    if (!message || !sessionId) {
      return json({
        error: 'Missing required fields: message and sessionId'
      }, { status: 400 });
    }

    // Get app settings from Firestore
    const settings = await getAppSettingsFromFirestore(session.shop);
    if (!settings || !settings.apiKey || !settings.apiUrl) {
      return json({
        error: 'App settings not configured. Please configure API key and URL in settings.'
      }, { status: 400 });
    }

    if (!settings.isActive) {
      return json({
        error: 'Chatbot is currently disabled. Please enable it in settings.'
      }, { status: 400 });
    }

    // Create API client
    const apiClient = new ChatApiClient(settings.apiUrl, settings.apiKey);

    // Send message to external API
    const response = await apiClient.sendMessage(message, sessionId, userId);

    // Save chat session to Firestore
    await saveChatSessionToFirestore({
      sessionId,
      shopDomain: session.shop,
      userId,
      messages: [
        {
          id: Date.now().toString(),
          content: message,
          sender: 'user',
          timestamp: new Date(),
        },
        {
          id: (Date.now() + 1).toString(),
          content: response.response,
          sender: 'bot',
          timestamp: new Date(),
          recommendedProducts: response.recommendedProducts,
        }
      ],
      isActive: true,
    });

    // Save analytics event
    await saveAnalyticsEventToFirestore({
      shopDomain: session.shop,
      eventType: 'message_sent',
      eventData: {
        messageLength: message.length,
        hasRecommendations: response.recommendedProducts.length > 0,
        recommendationCount: response.recommendedProducts.length,
      },
      sessionId,
      userId,
    });

    return json({
      success: true,
      response: response.response,
      recommendedProducts: response.recommendedProducts,
    });

  } catch (error) {
    console.error('Chat API error:', error);

    if (error instanceof Error) {
      return json({
        error: error.message
      }, { status: 500 });
    }

    return json({
      error: 'An unexpected error occurred'
    }, { status: 500 });
  }
};
