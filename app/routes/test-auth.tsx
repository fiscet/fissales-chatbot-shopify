import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Layout, Card, Text, Button } from "@shopify/polaris";
import { authenticate } from "../lib/shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    const { admin, session } = await authenticate.admin(request);

    // Test API call
    const products = await admin.rest.Product.all({ session });

    return json({
      success: true,
      shop: session.shop,
      productCount: products.data.length,
      message: "Authentication successful!"
    });
  } catch (error) {
    return json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      message: "Authentication failed"
    });
  }
};

export default function TestAuth() {
  const data = useLoaderData<typeof loader>();

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card>
            <div style={{ padding: "2rem" }}>
              <Text variant="headingLg" as="h1">
                Test Authentication
              </Text>

              {data.success ? (
                <div>
                  <Text variant="bodyLg" as="p" color="success">
                    ✅ {data.message}
                  </Text>
                  <Text variant="bodyMd" as="p">
                    <strong>Shop:</strong> {data.shop}
                  </Text>
                  <Text variant="bodyMd" as="p">
                    <strong>Products found:</strong> {data.productCount}
                  </Text>
                  <div style={{ marginTop: "2rem" }}>
                    <Button primary url="/app">
                      Go to Dashboard
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <Text variant="bodyLg" as="p" color="critical">
                    ❌ {data.message}
                  </Text>
                  <Text variant="bodyMd" as="p">
                    <strong>Error:</strong> {data.error}
                  </Text>
                  <div style={{ marginTop: "2rem" }}>
                    <Button primary url="/auth/login">
                      Try Authentication Again
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
