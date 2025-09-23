import { Card, Text, Button, InlineStack, BlockStack, Badge, Thumbnail } from "@shopify/polaris";
import type { ProductRecommendation } from "../lib/session.client";

interface ProductRecommendationsProps {
  products: ProductRecommendation[];
}

export function ProductRecommendations({ products }: ProductRecommendationsProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: "1rem" }}>
      <Text variant="headingSm" as="h4" color="subdued">
        Recommended Products
      </Text>
      <BlockStack gap="300">
        {products.map((product, index) => (
          <Card key={index} sectioned>
            <BlockStack gap="200">
              <InlineStack align="space-between">
                <div style={{ flex: 1 }}>
                  <Text variant="headingMd" as="h5">
                    {product.name}
                  </Text>
                  <Text variant="bodyMd" color="subdued">
                    {product.price}
                  </Text>
                </div>
                <Button
                  primary
                  size="slim"
                  url={product.productUrl}
                  external
                >
                  View Product
                </Button>
              </InlineStack>

              {product.features && product.features.length > 0 && (
                <div>
                  <Text variant="bodySm" as="p" fontWeight="semibold">
                    Features:
                  </Text>
                  <InlineStack gap="100" wrap>
                    {product.features.map((feature, featureIndex) => (
                      <Badge key={featureIndex} tone="info">
                        {feature}
                      </Badge>
                    ))}
                  </InlineStack>
                </div>
              )}

              {product.benefits && product.benefits.length > 0 && (
                <div>
                  <Text variant="bodySm" as="p" fontWeight="semibold">
                    Benefits:
                  </Text>
                  <ul style={{ margin: "0.5rem 0", paddingLeft: "1.5rem" }}>
                    {product.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex}>
                        <Text variant="bodySm" as="span">
                          {benefit}
                        </Text>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {product.availability && (
                <div>
                  <Text variant="bodySm" as="p">
                    <strong>Availability:</strong> {product.availability}
                  </Text>
                </div>
              )}
            </BlockStack>
          </Card>
        ))}
      </BlockStack>
    </div>
  );
}
