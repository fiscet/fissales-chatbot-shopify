import { Text, BlockStack, Badge } from "@shopify/polaris";
import type { ChatMessage } from "../lib/session.client";
import { ProductRecommendations } from "./ProductRecommendations";

interface MessageBubbleProps {
  message: ChatMessage;
  isUser: boolean;
}

export function MessageBubble({ message, isUser }: MessageBubbleProps) {
  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '1rem',
      }}
    >
      <div
        style={{
          maxWidth: '70%',
          padding: '0.75rem 1rem',
          borderRadius: '12px',
          backgroundColor: isUser ? '#0070f3' : '#ffffff',
          color: isUser ? '#ffffff' : '#000000',
          border: isUser ? 'none' : '1px solid #e1e3e5',
          boxShadow: isUser ? '0 2px 4px rgba(0, 112, 243, 0.2)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
          position: 'relative',
        }}
      >
        <BlockStack gap="200">
          <Text
            variant="bodyMd"
            as="p"
            color={isUser ? 'base' : 'base'}
          >
            {message.content}
          </Text>

          {/* Show product recommendations for bot messages */}
          {!isUser && message.recommendedProducts && message.recommendedProducts.length > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              <ProductRecommendations products={message.recommendedProducts} />
            </div>
          )}

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '0.25rem'
          }}>
            <Text
              variant="bodySm"
              as="span"
              color={isUser ? 'subdued' : 'subdued'}
              style={{
                opacity: 0.7,
                fontSize: '0.75rem'
              }}
            >
              {formatTimestamp(message.timestamp)}
            </Text>

            {!isUser && (
              <Badge status="info" size="small">
                AI
              </Badge>
            )}
          </div>
        </BlockStack>
      </div>
    </div>
  );
}
