import { useState, useEffect } from "react";
import { Card, InlineStack, BlockStack, Text, Button, Banner } from "@shopify/polaris";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { useChatSession } from "../lib/session.client";
import type { ChatMessage, ProductRecommendation } from "../lib/session.client";

interface ChatInterfaceProps {
  settings: {
    isActive: boolean;
    welcomeMessage: string;
    maxMessagesPerSession: number;
  };
  userId?: string;
}

export function ChatInterface({ settings, userId }: ChatInterfaceProps) {
  const { sessionId, messages, addMessage, clearSession } = useChatSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageCount, setMessageCount] = useState(0);

  // Check if session has reached message limit
  const hasReachedLimit = messageCount >= settings.maxMessagesPerSession;

  const sendMessage = async (content: string) => {
    if (!settings.isActive) {
      setError("Chatbot is currently disabled. Please check your settings.");
      return;
    }

    if (hasReachedLimit) {
      setError(`You've reached the maximum number of messages (${settings.maxMessagesPerSession}) for this session.`);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };
    addMessage(userMessage);
    setMessageCount(prev => prev + 1);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          sessionId,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        // Add bot response
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          sender: 'bot',
          timestamp: new Date(),
          recommendedProducts: data.recommendedProducts || [],
        };
        addMessage(botMessage);
      } else {
        throw new Error(data.error || 'Failed to get response from chatbot');
      }
    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');

      // Add error message
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble responding right now. Please try again later.",
        sender: 'bot',
        timestamp: new Date(),
      };
      addMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSession = () => {
    clearSession();
    setMessageCount(0);
    setError(null);
  };

  // Update message count when messages change
  useEffect(() => {
    setMessageCount(messages.length);
  }, [messages]);

  return (
    <Card>
      <div style={{
        height: "600px",
        display: "flex",
        flexDirection: "column",
        padding: "1rem"
      }}>
        {/* Header */}
        <div style={{
          marginBottom: "1rem",
          paddingBottom: "1rem",
          borderBottom: "1px solid #e1e3e5"
        }}>
          <InlineStack align="space-between">
            <div>
              <Text variant="headingMd" as="h3">
                AI Chatbot
              </Text>
              <Text variant="bodySm" color="subdued">
                Session: {sessionId.slice(0, 8)}... • Messages: {messageCount}/{settings.maxMessagesPerSession}
              </Text>
            </div>
            <Button onClick={handleClearSession} size="slim">
              Clear Chat
            </Button>
          </InlineStack>
        </div>

        {/* Error Banner */}
        {error && (
          <div style={{ marginBottom: "1rem" }}>
            <Banner status="critical" onDismiss={() => setError(null)}>
              <Text variant="bodyMd" as="p">
                {error}
              </Text>
            </Banner>
          </div>
        )}

        {/* Disabled Banner */}
        {!settings.isActive && (
          <div style={{ marginBottom: "1rem" }}>
            <Banner status="warning">
              <Text variant="bodyMd" as="p">
                Chatbot is currently disabled. Please enable it in the settings.
              </Text>
            </Banner>
          </div>
        )}

        {/* Messages Area */}
        <MessageList
          messages={messages}
          isLoading={isLoading}
          welcomeMessage={settings.welcomeMessage}
        />

        {/* Input Area */}
        <MessageInput
          onSend={sendMessage}
          disabled={!settings.isActive || hasReachedLimit || isLoading}
          placeholder={
            hasReachedLimit
              ? `You've reached the message limit (${settings.maxMessagesPerSession})`
              : "Type your message here..."
          }
        />
      </div>
    </Card>
  );
}
