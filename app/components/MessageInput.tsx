import { useState, useRef, useEffect } from "react";
import { TextField, Button, InlineStack } from "@shopify/polaris";
import { SendMajor } from "@shopify/polaris-icons";

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  placeholder?: string;
  maxLength?: number;
}

export function MessageInput({
  onSend,
  disabled,
  placeholder = "Type your message here...",
  maxLength = 1000
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!message.trim() || disabled) return;

    onSend(message.trim());
    setMessage("");

    // Focus back to input after sending
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey && !isComposing) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  const canSend = message.trim().length > 0 && !disabled;
  const characterCount = message.length;
  const isNearLimit = characterCount > maxLength * 0.8;

  return (
    <div style={{
      padding: '1rem',
      borderTop: '1px solid #e1e3e5',
      backgroundColor: '#fafafa'
    }}>
      <InlineStack gap="200">
        <div style={{ flex: 1 }}>
          <TextField
            ref={inputRef}
            label=""
            value={message}
            onChange={setMessage}
            placeholder={placeholder}
            multiline={2}
            maxLength={maxLength}
            onKeyPress={handleKeyPress}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            disabled={disabled}
            helpText={
              isNearLimit ?
                `${characterCount}/${maxLength} characters` :
                undefined
            }
            error={characterCount > maxLength ? 'Message too long' : undefined}
          />
        </div>

        <div style={{ alignSelf: 'flex-end' }}>
          <Button
            primary
            onClick={handleSend}
            disabled={!canSend}
            icon={SendMajor}
            size="large"
          >
            Send
          </Button>
        </div>
      </InlineStack>

      {disabled && (
        <div style={{
          marginTop: '0.5rem',
          textAlign: 'center'
        }}>
          <Text variant="bodySm" color="subdued">
            Chatbot is currently disabled. Please check your settings.
          </Text>
        </div>
      )}
    </div>
  );
}
