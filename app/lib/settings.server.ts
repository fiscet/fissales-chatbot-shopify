import { Session } from "@shopify/shopify-app-remix/server";
import { shopify } from "./shopify.server";
import {
  getAppSettingsFromFirestore,
  saveAppSettingsToFirestore
} from "./firestore.server";

export interface AppSettings {
  apiKey: string;
  apiUrl: string;
  isActive: boolean;
  welcomeMessage: string;
  maxMessagesPerSession: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SettingsData {
  apiKey: string;
  apiUrl: string;
  isActive?: boolean;
  welcomeMessage?: string;
  maxMessagesPerSession?: number;
}

// Default settings
const DEFAULT_SETTINGS: AppSettings = {
  apiKey: "",
  apiUrl: "",
  isActive: true,
  welcomeMessage: "Hello! How can I help you today?",
  maxMessagesPerSession: 100,
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * Get app settings from Shopify app configuration
 * Falls back to Firestore, then to default settings if not found
 */
export async function getAppSettings(session: Session): Promise<AppSettings> {
  try {
    // Try to get settings from Shopify app configuration first
    const settings = await shopify.rest.Settings.get({
      session,
      path: 'app_settings'
    });

    if (settings && settings.value) {
      const parsedSettings = JSON.parse(settings.value);
      return {
        ...DEFAULT_SETTINGS,
        ...parsedSettings,
        updatedAt: new Date(),
      };
    }
  } catch (error) {
    console.warn('Failed to get Shopify app settings, trying Firestore:', error);
  }

  try {
    // Fallback to Firestore
    const firestoreSettings = await getAppSettingsFromFirestore(session.shop);
    if (firestoreSettings) {
      return firestoreSettings;
    }
  } catch (error) {
    console.warn('Failed to get Firestore settings, using defaults:', error);
  }

  return DEFAULT_SETTINGS;
}

/**
 * Save app settings to Shopify app configuration
 * Falls back to Firestore if Shopify storage fails
 */
export async function saveAppSettings(
  session: Session,
  settings: SettingsData
): Promise<void> {
  try {
    const currentSettings = await getAppSettings(session);
    const updatedSettings: AppSettings = {
      ...currentSettings,
      ...settings,
      updatedAt: new Date(),
    };

    // Try to save to Shopify app configuration first
    await shopify.rest.Settings.save({
      session,
      path: 'app_settings',
      value: JSON.stringify(updatedSettings),
    });

    console.log('Settings saved to Shopify for shop:', session.shop);
  } catch (error) {
    console.warn('Failed to save Shopify app settings, trying Firestore:', error);

    try {
      // Fallback to Firestore
      await saveAppSettingsToFirestore(session.shop, settings);
      console.log('Settings saved to Firestore for shop:', session.shop);
    } catch (firestoreError) {
      console.error('Failed to save settings to both Shopify and Firestore:', firestoreError);
      throw new Error('Failed to save settings. Please try again.');
    }
  }
}

/**
 * Validate API settings
 */
export function validateApiSettings(settings: SettingsData): { isValid: boolean; errors: string[]; } {
  const errors: string[] = [];

  if (!settings.apiKey || settings.apiKey.trim() === '') {
    errors.push('API Key is required');
  }

  if (!settings.apiUrl || settings.apiUrl.trim() === '') {
    errors.push('API URL is required');
  } else {
    try {
      new URL(settings.apiUrl);
    } catch {
      errors.push('API URL must be a valid URL');
    }
  }

  if (settings.maxMessagesPerSession && (settings.maxMessagesPerSession < 1 || settings.maxMessagesPerSession > 1000)) {
    errors.push('Max messages per session must be between 1 and 1000');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Test API connection
 */
export async function testApiConnection(apiUrl: string, apiKey: string): Promise<{ success: boolean; message: string; }> {
  try {
    const { ChatApiClient } = await import('./api.client');
    const apiClient = new ChatApiClient(apiUrl, apiKey, 10000); // 10 second timeout

    const result = await apiClient.testConnection();
    return result;
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, message: `Connection failed: ${error.message}` };
    }
    return { success: false, message: 'Unknown connection error' };
  }
}

/**
 * Get settings for a specific shop (for admin use)
 */
export async function getShopSettings(shopDomain: string): Promise<AppSettings | null> {
  try {
    // This would typically require a database lookup
    // For now, we'll return null and let the app handle it
    return null;
  } catch (error) {
    console.error('Failed to get shop settings:', error);
    return null;
  }
}
