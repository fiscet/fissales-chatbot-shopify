import { useState } from "react";
import { Page, Layout, Card, Text, TextField, Button, BlockStack } from "@shopify/polaris";

export default function Install() {
  const [shopUrl, setShopUrl] = useState("");

  const handleInstall = () => {
    if (!shopUrl) return;

    // Assicurati che l'URL abbia il formato corretto
    let shop = shopUrl.trim();
    if (!shop.includes(".")) {
      shop = `${shop}.myshopify.com`;
    }
    if (!shop.startsWith("http")) {
      shop = `https://${shop}`;
    }

    // Estrai il nome dello shop dall'URL
    const shopName = shop.replace(/^https?:\/\//, "").replace(/\.myshopify\.com.*$/, "");

    // Reindirizza alla pagina di login con il parametro shop
    window.location.href = `/auth/login?shop=${shopName}.myshopify.com`;
  };

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card>
            <div style={{ padding: "2rem", maxWidth: "500px", margin: "0 auto" }}>
              <BlockStack gap="400">
                <div style={{ textAlign: "center" }}>
                  <Text variant="headingLg" as="h1">
                    Install Fissales Chatbot
                  </Text>
                  <Text variant="bodyLg" as="p" color="subdued">
                    Enter your Shopify store URL to install the chatbot app
                  </Text>
                </div>

                <div>
                  <TextField
                    label="Shopify Store URL"
                    value={shopUrl}
                    onChange={setShopUrl}
                    placeholder="your-store.myshopify.com"
                    helpText="Enter your store URL (e.g., your-store.myshopify.com)"
                    autoComplete="off"
                  />
                </div>

                <div style={{ textAlign: "center" }}>
                  <Button
                    primary
                    onClick={handleInstall}
                    disabled={!shopUrl.trim()}
                    size="large"
                  >
                    Install App
                  </Button>
                </div>

                <div style={{ textAlign: "center" }}>
                  <Text variant="bodySm" as="p" color="subdued">
                    Don't have a Shopify store?{" "}
                    <a href="https://www.shopify.com/trial" target="_blank" rel="noopener noreferrer">
                      Start your free trial
                    </a>
                  </Text>
                </div>
              </BlockStack>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
