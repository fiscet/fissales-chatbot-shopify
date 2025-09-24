import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Layout, Card, Text, Button, BlockStack, InlineStack, Banner } from "@shopify/polaris";
import { authenticate } from "../lib/shopify.server";
import { getAppSettings } from "../lib/settings.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  try {
    const settings = await getAppSettings(session);
    return json({
      shop: session.shop,
      settings,
      appUrl: process.env.SHOPIFY_APP_URL || 'https://fissales-chatbot-shopify--fissales-chatbot.europe-west4.hosted.app'
    });
  } catch (error) {
    console.error('Failed to load integration data:', error);
    return json({
      shop: session.shop,
      settings: null,
      error: 'Failed to load integration data'
    });
  }
};

export default function IntegrationPage() {
  const data = useLoaderData<typeof loader>();
  const { shop, settings } = data;
  const appUrl = 'appUrl' in data ? data.appUrl : '';
  const error = 'error' in data ? data.error : null;

  if (error) {
    return (
      <Page title="Integration Error">
        <Layout>
          <Layout.Section>
            <Banner tone="critical">
              <Text variant="bodyMd" as="p">
                {error}
              </Text>
            </Banner>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  const integrationCode = `<script src="${appUrl}/fissales-chatbot.js"></script>`;

  const customCode = `<script src="${appUrl}/fissales-chatbot.js"></script>
<script>
  // Configurazione personalizzata
  window.FissalesChatbot.config.position = 'bottom-right'; // 'bottom-right' o 'bottom-left'
  window.FissalesChatbot.config.theme = 'light'; // 'light' o 'dark'
  window.FissalesChatbot.init();
</script>`;

  return (
    <Page
      title="Theme Integration"
      subtitle="Integrate the chatbot into your store theme"
    >
      <Layout>
        <Layout.Section>
          <Card>
            <div style={{ padding: "2rem" }}>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Theme Extension (Recommended)
                </Text>

                {!settings?.isActive && (
                  <Banner tone="warning">
                    <Text variant="bodyMd" as="p">
                      The chatbot is currently disabled. Please enable it in settings before integrating.
                    </Text>
                  </Banner>
                )}

                <Text variant="bodyLg" as="p">
                  The easiest way to add the chatbot is through the theme editor:
                </Text>

                <BlockStack gap="200">
                  <Text variant="bodyMd" as="p">
                    <strong>1. Go to Online Store → Themes</strong>
                  </Text>
                  <Text variant="bodyMd" as="p">
                    <strong>2. Click "Customize" on your active theme</strong>
                  </Text>
                  <Text variant="bodyMd" as="p">
                    <strong>3. In the theme editor, look for "Fissales Chatbot" in the app blocks</strong>
                  </Text>
                  <Text variant="bodyMd" as="p">
                    <strong>4. Drag and drop the chatbot block to your desired location</strong>
                  </Text>
                  <Text variant="bodyMd" as="p">
                    <strong>5. Customize the appearance using the settings panel</strong>
                  </Text>
                </BlockStack>

                <Text variant="headingMd" as="h2">
                  Manual Integration (Alternative)
                </Text>

                <Text variant="bodyLg" as="p">
                  If you prefer manual integration, add this code to your theme:
                </Text>

                <div style={{
                  backgroundColor: "#f6f6f7",
                  padding: "1rem",
                  borderRadius: "4px",
                  border: "1px solid #e1e3e5"
                }}>
                  <pre style={{
                    backgroundColor: "#f6f6f7",
                    padding: "1rem",
                    borderRadius: "4px",
                    border: "1px solid #e1e3e5",
                    fontFamily: "monospace",
                    fontSize: "0.875rem",
                    overflow: "auto"
                  }}>{integrationCode}</pre>
                </div>

                <Text variant="bodyMd" as="p">
                  <strong>Where to add this code:</strong>
                </Text>

                <BlockStack gap="200">
                  <Text variant="bodyMd" as="p">
                    • <strong>Theme 2.0:</strong> Theme Settings → Custom Code → Add to Header
                  </Text>
                  <Text variant="bodyMd" as="p">
                    • <strong>Theme 1.0:</strong> Edit Code → theme.liquid → Add before &lt;/head&gt;
                  </Text>
                </BlockStack>
              </BlockStack>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div style={{ padding: "2rem" }}>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Advanced Configuration
                </Text>

                <Text variant="bodyLg" as="p">
                  For custom positioning and theming, use this enhanced code:
                </Text>

                <div style={{
                  backgroundColor: "#f6f6f7",
                  padding: "1rem",
                  borderRadius: "4px",
                  border: "1px solid #e1e3e5"
                }}>
                  <pre style={{
                    backgroundColor: "#f6f6f7",
                    padding: "1rem",
                    borderRadius: "4px",
                    border: "1px solid #e1e3e5",
                    fontFamily: "monospace",
                    fontSize: "0.875rem",
                    overflow: "auto"
                  }}>{customCode}</pre>
                </div>

                <BlockStack gap="200">
                  <Text variant="bodyMd" as="p">
                    <strong>Configuration Options:</strong>
                  </Text>
                  <Text variant="bodyMd" as="p">
                    • <strong>position:</strong> 'bottom-right' or 'bottom-left'
                  </Text>
                  <Text variant="bodyMd" as="p">
                    • <strong>theme:</strong> 'light' or 'dark'
                  </Text>
                  <Text variant="bodyMd" as="p">
                    • <strong>enabled:</strong> true or false
                  </Text>
                </BlockStack>
              </BlockStack>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div style={{ padding: "2rem" }}>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Integration Steps
                </Text>

                <BlockStack gap="300">
                  <div>
                    <Text variant="bodyMd" as="p">
                      <strong>1. Configure the Chatbot</strong>
                    </Text>
                    <Text variant="bodyMd" as="p">
                      Make sure your chatbot is configured and enabled in the settings page.
                    </Text>
                  </div>

                  <div>
                    <Text variant="bodyMd" as="p">
                      <strong>2. Add the Code</strong>
                    </Text>
                    <Text variant="bodyMd" as="p">
                      Copy and paste the integration code into your theme.
                    </Text>
                  </div>

                  <div>
                    <Text variant="bodyMd" as="p">
                      <strong>3. Test the Integration</strong>
                    </Text>
                    <Text variant="bodyMd" as="p">
                      Visit your storefront and verify the chatbot widget appears.
                    </Text>
                  </div>

                  <div>
                    <Text variant="bodyMd" as="p">
                      <strong>4. Customize (Optional)</strong>
                    </Text>
                    <Text variant="bodyMd" as="p">
                      Adjust the position and theme to match your store's design.
                    </Text>
                  </div>
                </BlockStack>
              </BlockStack>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div style={{ padding: "2rem" }}>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Troubleshooting
                </Text>

                <BlockStack gap="200">
                  <Text variant="bodyMd" as="p">
                    <strong>Chatbot not appearing?</strong>
                  </Text>
                  <Text variant="bodyMd" as="p">
                    • Check that the code was added correctly
                  </Text>
                  <Text variant="bodyMd" as="p">
                    • Verify the chatbot is enabled in settings
                  </Text>
                  <Text variant="bodyMd" as="p">
                    • Check browser console for JavaScript errors
                  </Text>
                </BlockStack>

                <BlockStack gap="200">
                  <Text variant="bodyMd" as="p">
                    <strong>Chatbot not responding?</strong>
                  </Text>
                  <Text variant="bodyMd" as="p">
                    • Ensure API configuration is correct in settings
                  </Text>
                  <Text variant="bodyMd" as="p">
                    • Check that external API is accessible
                  </Text>
                  <Text variant="bodyMd" as="p">
                    • Verify network connectivity
                  </Text>
                </BlockStack>
              </BlockStack>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <InlineStack gap="400" align="space-between">
            <Button url="/app/settings">
              Settings
            </Button>
            <Button
              url={`https://${shop}`}
              external
              variant="primary"
            >
              View Store
            </Button>
          </InlineStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
