import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Layout, Card, Text, Button } from "@shopify/polaris";
import { authenticate } from "../lib/shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { admin, session } = await authenticate.admin(request);
    return json({
      message: "Welcome to Fissales Chatbot!",
      authenticated: true,
      shop: session.shop
    });
  } catch (error) {
    // Se non autenticato, mostra pagina di benvenuto senza autenticazione
    return json({ message: "Welcome to Fissales Chatbot!", authenticated: false });
  }
};

export default function Index() {
  const { message, authenticated } = useLoaderData<typeof loader>();

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card>
            <div style={{ padding: "2rem", textAlign: "center" }}>
              <Text variant="headingLg" as="h1">
                {message}
              </Text>
              <div style={{ marginTop: "2rem" }}>
                <Text variant="bodyLg" as="p">
                  Configure your AI-powered chatbot to help your customers find the perfect products.
                </Text>
              </div>
              {authenticated ? (
                <div style={{ marginTop: "2rem" }}>
                  <Button
                    variant="primary"
                    url="/app/settings"
                    size="large"
                  >
                    Configure Settings
                  </Button>
                </div>
              ) : (
                <div style={{ marginTop: "2rem" }}>
                  <Text variant="bodyMd" as="p" tone="subdued">
                    This app needs to be installed in a Shopify store to function properly.
                  </Text>
                  <div style={{ marginTop: "1rem" }}>
                    <Button
                      variant="primary"
                      url="/install"
                      size="large"
                    >
                      Install App
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
