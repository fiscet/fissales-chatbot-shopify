import { shopifyApp } from "@shopify/shopify-app-remix/server";
import { MemorySessionStorage } from "@shopify/shopify-app-session-storage-memory";

export const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY || "be1390d3612db28f0d704595a4ca17b6",
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "14fe9333d329bf873357bed97757638a",
  appUrl: process.env.SHOPIFY_APP_URL || "https://fissales-chatbot-shopify--fissales-chatbot.europe-west4.hosted.app",
  scopes: process.env.SHOPIFY_SCOPES?.split(",") || ["read_products", "read_orders", "read_customers"],
  sessionStorage: new MemorySessionStorage(),
  future: {
    v3_webhookAdminContext: true,
    v3_authenticatePublic: true,
  },
  hooks: {
    afterAuth: async ({ session }) => {
      // Handle post-authentication logic
      console.log("App authenticated for shop:", session.shop);
    },
  },
});

export const authenticate = shopify.authenticate;

export default shopify;
