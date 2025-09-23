import { useEffect, useRef } from "react";
import { Text, Spinner, BlockStack, InlineStack } from "@shopify/polaris";
import { MessageBubble } from "./MessageBubble";
import type { ChatMessage } from "../lib/session.client";

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  welcomeMessage?: string;
}

export function MessageList({ messages, isLoading, welcomeMessage }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Show welcome message if no messages
  if (messages.length === 0 && !isLoading) {
    return (
      <div
        ref={messagesContainerRef}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          backgroundColor: '#fafafa',
          borderRadius: '8px',
          border: '1px solid #e1e3e5',
        }}
      >
        <BlockStack gap="400" align="center">
          <div style={{ textAlign: 'center' }}>
            <Text variant="headingMd" as="h3" color="subdued">
              {welcomeMessage || "Welcome to the Chatbot!"}
            </Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text variant="bodyLg" as="p" color="subdued">
              Start a conversation by typing a message below.
            </Text>
          </div>
        </BlockStack>
      </div>
    );
  }

  return (
    <div
      ref={messagesContainerRef}
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '1rem',
        backgroundColor: '#fafafa',
        borderRadius: '8px',
        border: '1px solid #e1e3e5',
        minHeight: '400px',
        maxHeight: '600px',
      }}
    >
      <BlockStack gap="200">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isUser={message.sender === 'user'}
          />
        ))}

        {isLoading && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-start',
            marginBottom: '1rem',
          }}>
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              border: '1px solid #e1e3e5',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}>
              <InlineStack gap="200" align="center">
                <Spinner size="small" />
                <Text variant="bodyMd" color="subdued">
                  AI is thinking...
                </Text>
              </InlineStack>
            </div>
          </div>
        )}
      </BlockStack>

      {/* Invisible element to scroll to */}
      <div ref={messagesEndRef} />
    </div>
  );
}
