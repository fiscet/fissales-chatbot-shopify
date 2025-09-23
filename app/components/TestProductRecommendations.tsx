import { Card, Text, Button, BlockStack } from "@shopify/polaris";
import { ProductRecommendations } from "./ProductRecommendations";
import type { ProductRecommendation } from "../lib/session.client";

const sampleProducts: ProductRecommendation[] = [
  {
    name: "Premium Wireless Headphones",
    price: "$199.99",
    features: ["Noise Cancelling", "30h Battery", "Bluetooth 5.0"],
    benefits: [
      "Crystal clear sound quality",
      "Comfortable for long listening sessions",
      "Perfect for work and travel"
    ],
    availability: "In Stock",
    productUrl: "https://example.com/products/premium-headphones"
  },
  {
    name: "Smart Fitness Tracker",
    price: "$149.99",
    features: ["Heart Rate Monitor", "GPS", "Water Resistant"],
    benefits: [
      "Track your daily activities",
      "Monitor sleep patterns",
      "Stay motivated with fitness goals"
    ],
    availability: "Limited Stock",
    productUrl: "https://example.com/products/fitness-tracker"
  },
  {
    name: "Ergonomic Office Chair",
    price: "$299.99",
    features: ["Lumbar Support", "Adjustable Height", "Mesh Back"],
    benefits: [
      "Improve your posture",
      "Reduce back pain",
      "Increase productivity"
    ],
    availability: "In Stock",
    productUrl: "https://example.com/products/office-chair"
  }
];

export function TestProductRecommendations() {
  return (
    <Card sectioned>
      <BlockStack gap="400">
        <Text variant="headingMd" as="h3">
          Product Recommendations Preview
        </Text>
        <Text variant="bodyMd" as="p" color="subdued">
          This is how product recommendations will appear in chat messages:
        </Text>
        <ProductRecommendations products={sampleProducts} />
      </BlockStack>
    </Card>
  );
}
