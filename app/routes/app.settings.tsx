import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, useNavigation } from "@remix-run/react";
import { Page, Layout, Card, Text, InlineBlockStack, BlockBlockStack, Banner } from "@shopify/polaris";
import { authenticate } from "../lib/shopify.server";
import { getAppSettings, saveAppSettings, testApiConnection, validateApiSettings } from "../lib/settings.server";
import { SettingsForm } from "../components/SettingsForm";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  try {
    const settings = await getAppSettings(session);
    return json({ shop: session.shop, settings });
  } catch (error) {
    console.error('Failed to load settings:', error);
    return json({
      shop: session.shop,
      settings: null,
      error: 'Failed to load settings'
    });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  try {
    const formData = await request.formData();
    const action = formData.get("_action") as string;

    if (action === "save") {
      const settings = {
        apiKey: formData.get("apiKey") as string,
        apiUrl: formData.get("apiUrl") as string,
        isActive: formData.get("isActive") === "true",
        welcomeMessage: formData.get("welcomeMessage") as string,
        maxMessagesPerSession: parseInt(formData.get("maxMessagesPerSession") as string) || 100,
      };

      // Validate settings
      const validation = validateApiSettings(settings);
      if (!validation.isValid) {
        return json({
          success: false,
          message: validation.errors.join(', '),
          errors: validation.errors
        }, { status: 400 });
      }

      await saveAppSettings(session, settings);

      return json({
        success: true,
        message: "Settings saved successfully!"
      });
    }

    if (action === "test") {
      const apiUrl = formData.get("apiUrl") as string;
      const apiKey = formData.get("apiKey") as string;

      const result = await testApiConnection(apiUrl, apiKey);
      return json({
        success: result.success,
        message: result.message
      });
    }

    return json({
      success: false,
      message: "Invalid action"
    }, { status: 400 });

  } catch (error) {
    console.error('Settings action failed:', error);
    return json({
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred'
    }, { status: 500 });
  }
};

export default function SettingsPage() {
  const { shop, settings, error } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";

  if (error) {
    return (
      <Page title="Settings Error">
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
      <Page title="Loading Settings...">
        <Layout>
          <Layout.Section>
            <Card>
              <div style={{ padding: "2rem", textAlign: "center" }}>
                <Text variant="bodyLg" as="p">
                  Loading settings...
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
      title="Chatbot Settings"
      subtitle={`Configure your chatbot for ${shop}`}
    >
      <Layout>
        <Layout.Section>
          <SettingsForm
            settings={settings}
            onSave={async () => { }} // Handled by the form itself
            isLoading={isSubmitting}
          />
        </Layout.Section>

        <Layout.Section>
          <Card>
            <div style={{ padding: "2rem" }}>
              <BlockStack vertical spacing="loose">
                <Text variant="headingMd" as="h2">
                  Configuration Help
                </Text>
                <Text variant="bodyLg" as="p">
                  To use this chatbot, you need to configure the external API that will handle the chat requests.
                </Text>
                <BlockStack vertical spacing="tight">
                  <Text variant="bodyMd" as="p">
                    <strong>API Key:</strong> Your authentication key for the external chatbot service
                  </Text>
                  <Text variant="bodyMd" as="p">
                    <strong>API URL:</strong> The endpoint where chat messages will be sent
                  </Text>
                </BlockStack>
                <Text variant="bodyMd" as="p">
                  The chatbot will send requests with the following headers:
                </Text>
                <div style={{
                  backgroundColor: "#f6f6f7",
                  padding: "1rem",
                  borderRadius: "4px",
                  fontFamily: "monospace",
                  fontSize: "0.875rem"
                }}>
                  <div>sessionId: [generated session ID]</div>
                  <div>userId: [Shopify user ID if logged in]</div>
                  <div>apiKey: [your configured API key]</div>
                  <div>Content-Type: application/json</div>
                </div>

                <Text variant="bodyMd" as="p">
                  <strong>Storage:</strong> Settings are saved to Shopify app configuration first, with Firestore as fallback.
                </Text>
              </BlockStack>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
