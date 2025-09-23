import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Layout, Card, Text, Button } from "@shopify/polaris";
import { authenticate } from "../lib/shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    await authenticate.admin(request);
    return json({ message: "Welcome to Fissales Chatbot!", authenticated: true });
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
                  Your AI-powered chatbot is ready to help your customers find the perfect products.
                </Text>
              </div>
              {authenticated ? (
                <div style={{ marginTop: "2rem" }}>
                  <Button
                    primary
                    url="/app"
                    size="large"
                  >
                    Open Chatbot
                  </Button>
                </div>
              ) : (
                <div style={{ marginTop: "2rem" }}>
                  <Text variant="bodyMd" as="p" color="subdued">
                    This app needs to be installed in a Shopify store to function properly.
                  </Text>
                  <div style={{ marginTop: "1rem" }}>
                    <Button
                      primary
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
