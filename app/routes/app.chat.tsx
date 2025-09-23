import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Layout, Card, Text, InlineBlockStack, BlockBlockStack, Banner } from "@shopify/polaris";
import { authenticate } from "../lib/shopify.server";
import { getAppSettings } from "../lib/settings.server";
import { ChatInterface } from "../components/ChatInterface";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  try {
    const settings = await getAppSettings(session);
    return json({
      shop: session.shop,
      settings,
      userId: session.id // Use session ID as user ID for now
    });
  } catch (error) {
    console.error('Failed to load chat settings:', error);
    return json({
      shop: session.shop,
      settings: null,
      error: 'Failed to load chatbot settings'
    });
  }
};

export default function ChatPage() {
  const { shop, settings, userId, error } = useLoaderData<typeof loader>();

  if (error) {
    return (
      <Page title="Chatbot Error">
        <Layout>
          <Layout.Section>
            <Banner status="critical">
              <Text variant="bodyMd" as="p">
                {error}
              </Text>
            </Banner>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  if (!settings) {
    return (
      <Page title="Loading Chatbot...">
        <Layout>
          <Layout.Section>
            <Card>
              <div style={{ padding: "2rem", textAlign: "center" }}>
                <Text variant="bodyLg" as="p">
                  Loading chatbot settings...
                </Text>
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page
      title="Chatbot Interface"
      subtitle={`AI-powered customer support for ${shop}`}
    >
      <Layout>
        <Layout.Section>
          <ChatInterface
            settings={{
              isActive: settings.isActive,
              welcomeMessage: settings.welcomeMessage,
              maxMessagesPerSession: settings.maxMessagesPerSession,
            }}
            userId={userId}
          />
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div style={{ padding: "2rem" }}>
              <BlockStack vertical spacing="loose">
                <Text variant="headingMd" as="h2">
                  Chatbot Information
                </Text>
                <BlockStack vertical spacing="tight">
                  <Text variant="bodyMd" as="p">
                    <strong>Status:</strong> {settings.isActive ? 'Active' : 'Disabled'}
                  </Text>
                  <Text variant="bodyMd" as="p">
                    <strong>Welcome Message:</strong> {settings.welcomeMessage}
                  </Text>
                  <Text variant="bodyMd" as="p">
                    <strong>Max Messages per Session:</strong> {settings.maxMessagesPerSession}
                  </Text>
                  <Text variant="bodyMd" as="p">
                    <strong>API Configuration:</strong> {settings.apiKey && settings.apiUrl ? 'Configured' : 'Not configured'}
                  </Text>
                </BlockStack>

                {(!settings.apiKey || !settings.apiUrl) && (
                  <Banner status="warning">
                    <Text variant="bodyMd" as="p">
                      API configuration is missing. Please configure your external API in the settings page.
                    </Text>
                  </Banner>
                )}
              </BlockStack>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
