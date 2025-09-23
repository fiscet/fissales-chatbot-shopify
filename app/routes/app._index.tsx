import { useState } from 'react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData, useSubmit } from '@remix-run/react';
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Form,
  FormLayout,
  TextField
} from '@shopify/polaris';
import { authenticate } from '../shopify.server';
import { SettingsService } from '../services/settings.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const settings = await SettingsService.findByShop(session.shop);

  return { settings };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const apiUrl = formData.get('apiUrl') as string;
  const apiKey = formData.get('apiKey') as string;

  // Save to Firestore
  const existingSettings = await SettingsService.findByShop(session.shop);

  let settings;
  if (existingSettings) {
    await SettingsService.update(session.shop, { apiUrl, apiKey });
    settings = { ...existingSettings, apiUrl, apiKey };
  } else {
    settings = await SettingsService.create({
      shop: session.shop,
      apiUrl,
      apiKey
    });
  }

  return new Response(JSON.stringify({ settings }), {
    headers: { "Content-Type": "application/json" }
  });
};

export default function Index() {
  const { settings } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const [formState, setFormState] = useState({
    apiUrl: settings?.apiUrl || '',
    apiKey: settings?.apiKey || ''
  });

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append('apiUrl', formState.apiUrl);
    formData.append('apiKey', formState.apiKey);
    submit(formData, { method: 'post' });
  };

  return (
    <Page
      title="AI Chatbot Settings"
      primaryAction={
        <Button variant="primary" onClick={handleSubmit}>
          Save
        </Button>
      }
    >
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    AI API Configuration
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Configure your AI API settings to enable the chatbot
                    functionality. Your API credentials are stored securely on our servers and are never exposed to the client.
                  </Text>
                </BlockStack>
                <Form onSubmit={handleSubmit}>
                  <FormLayout>
                    <TextField
                      label="API URL"
                      value={formState.apiUrl}
                      onChange={(value) =>
                        setFormState((prev) => ({ ...prev, apiUrl: value }))
                      }
                      autoComplete="off"
                      helpText="The URL of your AI API server (stored securely server-side)"
                    />
                    <TextField
                      label="API Key"
                      value={formState.apiKey}
                      onChange={(value) =>
                        setFormState((prev) => ({ ...prev, apiKey: value }))
                      }
                      type="password"
                      autoComplete="off"
                      helpText="Your AI API authentication key (stored securely server-side)"
                    />
                  </FormLayout>
                </Form>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
