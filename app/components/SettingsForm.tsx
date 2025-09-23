import { useState } from "react";
import {
  Card,
  FormLayout,
  TextField,
  Button,
  InlineBlockStack,
  BlockBlockStack,
  Banner,
  Checkbox,
  Select,
  Text,
  Divider,
} from "@shopify/polaris";
import type { AppSettings, SettingsData } from "../lib/settings.server";

interface SettingsFormProps {
  settings: AppSettings;
  onSave: (settings: SettingsData) => Promise<void>;
  onTestConnection?: (apiUrl: string, apiKey: string) => Promise<{ success: boolean; message: string; }>;
  isLoading?: boolean;
}

export function SettingsForm({
  settings,
  onSave,
  onTestConnection,
  isLoading = false
}: SettingsFormProps) {
  const [formData, setFormData] = useState<SettingsData>({
    apiKey: settings.apiKey,
    apiUrl: settings.apiUrl,
    isActive: settings.isActive,
    welcomeMessage: settings.welcomeMessage,
    maxMessagesPerSession: settings.maxMessagesPerSession,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; } | null>(null);
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string; } | null>(null);

  const handleFieldChange = (field: keyof SettingsData, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.apiKey || formData.apiKey.trim() === '') {
      newErrors.apiKey = 'API Key is required';
    }

    if (!formData.apiUrl || formData.apiUrl.trim() === '') {
      newErrors.apiUrl = 'API URL is required';
    } else {
      try {
        new URL(formData.apiUrl);
      } catch {
        newErrors.apiUrl = 'API URL must be a valid URL';
      }
    }

    if (formData.maxMessagesPerSession && (formData.maxMessagesPerSession < 1 || formData.maxMessagesPerSession > 1000)) {
      newErrors.maxMessagesPerSession = 'Max messages per session must be between 1 and 1000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setSaveResult(null);

    try {
      // Create form data for the action
      const formDataToSend = new FormData();
      formDataToSend.append('_action', 'save');
      formDataToSend.append('apiKey', formData.apiKey);
      formDataToSend.append('apiUrl', formData.apiUrl);
      formDataToSend.append('isActive', formData.isActive?.toString() || 'false');
      formDataToSend.append('welcomeMessage', formData.welcomeMessage || '');
      formDataToSend.append('maxMessagesPerSession', formData.maxMessagesPerSession?.toString() || '100');

      const response = await fetch('/app/settings', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();

      if (result.success) {
        setSaveResult({ success: true, message: result.message });
      } else {
        setSaveResult({ success: false, message: result.message });
      }
    } catch (error) {
      setSaveResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to save settings'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!formData.apiUrl || !formData.apiKey) {
      setTestResult({ success: false, message: 'Please enter API URL and API Key first' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Create form data for the test action
      const formDataToSend = new FormData();
      formDataToSend.append('_action', 'test');
      formDataToSend.append('apiUrl', formData.apiUrl);
      formDataToSend.append('apiKey', formData.apiKey);

      const response = await fetch('/app/settings', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();
      setTestResult({ success: result.success, message: result.message });
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Connection test failed'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const maxMessagesOptions = [
    { label: '50 messages', value: '50' },
    { label: '100 messages', value: '100' },
    { label: '200 messages', value: '200' },
    { label: '500 messages', value: '500' },
    { label: '1000 messages', value: '1000' },
  ];

  return (
    <Card>
      <div style={{ padding: '2rem' }}>
        <BlockStack vertical spacing="loose">
          <Text variant="headingMd" as="h2">
            API Configuration
          </Text>

          {saveResult && (
            <Banner status={saveResult.success ? 'success' : 'critical'}>
              <Text variant="bodyMd" as="p">
                {saveResult.message}
              </Text>
            </Banner>
          )}

          {testResult && (
            <Banner status={testResult.success ? 'success' : 'critical'}>
              <Text variant="bodyMd" as="p">
                {testResult.message}
              </Text>
            </Banner>
          )}

          <FormLayout>
            <TextField
              label="API Key"
              value={formData.apiKey}
              onChange={(value) => handleFieldChange('apiKey', value)}
              placeholder="Enter your external API key"
              helpText="The API key for your external chatbot service"
              error={errors.apiKey}
              type="password"
              required
            />

            <TextField
              label="API URL"
              value={formData.apiUrl}
              onChange={(value) => handleFieldChange('apiUrl', value)}
              placeholder="https://your-external-api.com/chat"
              helpText="The URL endpoint for your external chatbot service"
              error={errors.apiUrl}
              type="url"
              required
            />

            <BlockStack>
              <Button
                onClick={handleTestConnection}
                loading={isTesting}
                disabled={!formData.apiUrl || !formData.apiKey}
              >
                Test Connection
              </Button>
            </BlockStack>

            <Divider />

            <Text variant="headingSm" as="h3">
              Chatbot Settings
            </Text>

            <Checkbox
              label="Enable chatbot"
              checked={formData.isActive || false}
              onChange={(checked) => handleFieldChange('isActive', checked)}
              helpText="Enable or disable the chatbot functionality"
            />

            <TextField
              label="Welcome Message"
              value={formData.welcomeMessage || ''}
              onChange={(value) => handleFieldChange('welcomeMessage', value)}
              placeholder="Hello! How can I help you today?"
              helpText="The initial message shown to users when they start a chat"
              multiline={2}
            />

            <Select
              label="Max Messages Per Session"
              options={maxMessagesOptions}
              value={formData.maxMessagesPerSession?.toString() || '100'}
              onChange={(value) => handleFieldChange('maxMessagesPerSession', parseInt(value))}
              helpText="Maximum number of messages allowed per chat session"
              error={errors.maxMessagesPerSession}
            />

            <BlockStack>
              <Button
                primary
                onClick={handleSave}
                loading={isSaving || isLoading}
                disabled={!formData.apiKey || !formData.apiUrl}
              >
                Save Settings
              </Button>
            </BlockStack>
          </FormLayout>
        </BlockStack>
      </div>
    </Card>
  );
}
