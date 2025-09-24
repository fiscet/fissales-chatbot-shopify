import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Layout, Card, Text, Button, InlineStack, BlockStack, Banner } from "@shopify/polaris";
import { authenticate } from "../lib/shopify.server";
import { getAppSettings } from "../lib/settings.server";
import { getShopStatisticsFromFirestore } from "../lib/firestore.server";
import { TestProductRecommendations } from "../components/TestProductRecommendations";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  try {
    const settings = await getAppSettings(session);
    const stats = await getShopStatisticsFromFirestore(session.shop);

    return json({
      shop: session.shop,
      settings,
      stats
    });
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
    return json({
      shop: session.shop,
      settings: null,
      stats: null,
      error: 'Failed to load dashboard data'
    });
  }
};

export default function AppIndex() {
  const data = useLoaderData<typeof loader>();
  const { shop, settings, stats } = data;
  const error = 'error' in data ? data.error : null;

  if (error) {
    return (
      <Page title="Dashboard Error">
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

  return (
    <Page
      title="Fissales Chatbot"
      subtitle={`Welcome to your chatbot dashboard for ${shop}`}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <div style={{ padding: "2rem" }}>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Chatbot Dashboard
                </Text>
                <Text variant="bodyLg" as="p">
                  Manage your AI-powered chatbot settings and monitor customer interactions.
                </Text>

                {settings && (
                  <BlockStack gap="200">
                    <Text variant="bodyMd" as="p">
                      <strong>Status:</strong> {settings.isActive ? 'Active' : 'Disabled'}
                    </Text>
                    <Text variant="bodyMd" as="p">
                      <strong>API Configuration:</strong> {settings.apiKey && settings.apiUrl ? 'Configured' : 'Not configured'}
                    </Text>
                  </BlockStack>
                )}

                <InlineStack gap="400" align="space-between">
                  <Button
                    variant="primary"
                    url="/app/chat"
                    size="large"
                    disabled={!settings?.isActive}
                  >
                    Open Chatbot
                  </Button>
                  <Button
                    url="/app/settings"
                    size="large"
                  >
                    Settings
                  </Button>
                </InlineStack>

                <InlineStack gap="400" align="space-between">
                  <Button
                    url="/app/integration"
                    size="large"
                  >
                    Theme Integration
                  </Button>
                  <div></div>
                </InlineStack>
              </BlockStack>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div style={{ padding: "2rem" }}>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Quick Stats
                </Text>
                <InlineStack gap="400" align="space-between">
                  <div style={{ textAlign: "center" }}>
                    <Text variant="headingLg" as="p">
                      {stats?.totalMessages || 0}
                    </Text>
                    <Text variant="bodyMd" as="p">Total Messages</Text>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <Text variant="headingLg" as="p">
                      {stats?.activeSessions || 0}
                    </Text>
                    <Text variant="bodyMd" as="p">Active Sessions</Text>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <Text variant="headingLg" as="p">
                      {stats?.totalSessions || 0}
                    </Text>
                    <Text variant="bodyMd" as="p">Total Sessions</Text>
                  </div>
                </InlineStack>

                {stats?.lastActivity && (
                  <div style={{ textAlign: "center", marginTop: "1rem" }}>
                    <Text variant="bodySm" tone="subdued" as="p">
                      Last activity: {new Date(stats.lastActivity).toLocaleString()}
                    </Text>
                  </div>
                )}
              </BlockStack>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <TestProductRecommendations />
        </Layout.Section>

        {(!settings?.apiKey || !settings?.apiUrl) && (
          <Layout.Section>
            <Banner tone="warning">
              <Text variant="bodyMd" as="p">
                Your chatbot is not configured yet. Please set up your external API in the settings page to start using the chatbot.
              </Text>
            </Banner>
          </Layout.Section>
        )}
      </Layout>
    </Page>
  );
}
