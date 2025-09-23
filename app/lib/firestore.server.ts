import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import type { AppSettings, SettingsData } from './settings.server';

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`,
    };

    try {
      initializeApp({
        credential: cert(serviceAccount as any),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    } catch (error) {
      console.error('Failed to initialize Firebase Admin:', error);
      throw new Error('Firebase Admin initialization failed');
    }
  }
}

// Get Firestore instance
function getFirestoreInstance() {
  try {
    initializeFirebaseAdmin();
    return getFirestore();
  } catch (error) {
    console.error('Failed to get Firestore instance:', error);
    throw new Error('Firestore connection failed');
  }
}

// Firestore Collections
const COLLECTIONS = {
  APP_SETTINGS: 'app_settings',
  CHAT_SESSIONS: 'chat_sessions',
  ANALYTICS: 'analytics',
  USERS: 'users',
} as const;

/**
 * Save app settings to Firestore
 */
export async function saveAppSettingsToFirestore(
  shopDomain: string,
  settings: SettingsData
): Promise<void> {
  try {
    const db = getFirestoreInstance();
    const settingsRef = db.collection(COLLECTIONS.APP_SETTINGS).doc(shopDomain);

    const settingsData = {
      ...settings,
      updatedAt: new Date(),
      createdAt: new Date(), // Will be overwritten if document exists
    };

    await settingsRef.set(settingsData, { merge: true });
    console.log('Settings saved to Firestore for shop:', shopDomain);
  } catch (error) {
    console.error('Failed to save settings to Firestore:', error);
    throw new Error('Failed to save settings to Firestore');
  }
}

/**
 * Get app settings from Firestore
 */
export async function getAppSettingsFromFirestore(shopDomain: string): Promise<AppSettings | null> {
  try {
    const db = getFirestoreInstance();
    const settingsRef = db.collection(COLLECTIONS.APP_SETTINGS).doc(shopDomain);
    const settingsDoc = await settingsRef.get();

    if (settingsDoc.exists) {
      const data = settingsDoc.data();
      return {
        apiKey: data?.apiKey || '',
        apiUrl: data?.apiUrl || '',
        isActive: data?.isActive ?? true,
        welcomeMessage: data?.welcomeMessage || 'Hello! How can I help you today?',
        maxMessagesPerSession: data?.maxMessagesPerSession || 100,
        createdAt: data?.createdAt?.toDate() || new Date(),
        updatedAt: data?.updatedAt?.toDate() || new Date(),
      };
    }

    return null;
  } catch (error) {
    console.error('Failed to get settings from Firestore:', error);
    throw new Error('Failed to get settings from Firestore');
  }
}

/**
 * Save chat session to Firestore
 */
export async function saveChatSessionToFirestore(sessionData: {
  sessionId: string;
  shopDomain: string;
  userId?: string;
  messages: Array<{
    id: string;
    content: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    recommendedProducts?: any[];
  }>;
  isActive: boolean;
}): Promise<void> {
  try {
    const db = getFirestoreInstance();
    const sessionRef = db.collection(COLLECTIONS.CHAT_SESSIONS).doc(sessionData.sessionId);

    const sessionDoc = {
      ...sessionData,
      updatedAt: new Date(),
      createdAt: new Date(), // Will be overwritten if document exists
    };

    await sessionRef.set(sessionDoc, { merge: true });
    console.log('Chat session saved to Firestore:', sessionData.sessionId);
  } catch (error) {
    console.error('Failed to save chat session to Firestore:', error);
    throw new Error('Failed to save chat session to Firestore');
  }
}

/**
 * Get chat session from Firestore
 */
export async function getChatSessionFromFirestore(sessionId: string): Promise<any | null> {
  try {
    const db = getFirestoreInstance();
    const sessionRef = db.collection(COLLECTIONS.CHAT_SESSIONS).doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (sessionDoc.exists) {
      return sessionDoc.data();
    }

    return null;
  } catch (error) {
    console.error('Failed to get chat session from Firestore:', error);
    throw new Error('Failed to get chat session from Firestore');
  }
}

/**
 * Save analytics event to Firestore
 */
export async function saveAnalyticsEventToFirestore(eventData: {
  shopDomain: string;
  eventType: string;
  eventData: Record<string, any>;
  sessionId: string;
  userId?: string;
}): Promise<void> {
  try {
    const db = getFirestoreInstance();
    const analyticsRef = db.collection(COLLECTIONS.ANALYTICS).doc();

    const eventDoc = {
      ...eventData,
      timestamp: new Date(),
    };

    await analyticsRef.set(eventDoc);
    console.log('Analytics event saved to Firestore:', eventData.eventType);
  } catch (error) {
    console.error('Failed to save analytics event to Firestore:', error);
    throw new Error('Failed to save analytics event to Firestore');
  }
}

/**
 * Get analytics data from Firestore
 */
export async function getAnalyticsFromFirestore(
  shopDomain: string,
  eventType?: string,
  days: number = 30
): Promise<any[]> {
  try {
    const db = getFirestoreInstance();
    let query = db.collection(COLLECTIONS.ANALYTICS)
      .where('shopDomain', '==', shopDomain);

    if (eventType) {
      query = query.where('eventType', '==', eventType);
    }

    // Add date filter
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    query = query.where('timestamp', '>=', startDate);

    const snapshot = await query.orderBy('timestamp', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Failed to get analytics from Firestore:', error);
    throw new Error('Failed to get analytics from Firestore');
  }
}

/**
 * Clean up old chat sessions
 */
export async function cleanupOldChatSessions(shopDomain: string, daysOld: number = 30): Promise<void> {
  try {
    const db = getFirestoreInstance();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const query = db.collection(COLLECTIONS.CHAT_SESSIONS)
      .where('shopDomain', '==', shopDomain)
      .where('updatedAt', '<', cutoffDate);

    const snapshot = await query.get();
    const batch = db.batch();

    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Cleaned up ${snapshot.docs.length} old chat sessions for shop:`, shopDomain);
  } catch (error) {
    console.error('Failed to cleanup old chat sessions:', error);
    throw new Error('Failed to cleanup old chat sessions');
  }
}

/**
 * Get shop statistics from Firestore
 */
export async function getShopStatisticsFromFirestore(shopDomain: string): Promise<{
  totalSessions: number;
  totalMessages: number;
  activeSessions: number;
  lastActivity: Date | null;
}> {
  try {
    const db = getFirestoreInstance();

    // Get total sessions
    const sessionsSnapshot = await db.collection(COLLECTIONS.CHAT_SESSIONS)
      .where('shopDomain', '==', shopDomain)
      .get();

    const totalSessions = sessionsSnapshot.docs.length;
    let totalMessages = 0;
    let activeSessions = 0;
    let lastActivity: Date | null = null;

    sessionsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.messages) {
        totalMessages += data.messages.length;
      }
      if (data.isActive) {
        activeSessions++;
      }
      if (data.updatedAt && (!lastActivity || data.updatedAt.toDate() > lastActivity)) {
        lastActivity = data.updatedAt.toDate();
      }
    });

    return {
      totalSessions,
      totalMessages,
      activeSessions,
      lastActivity,
    };
  } catch (error) {
    console.error('Failed to get shop statistics from Firestore:', error);
    throw new Error('Failed to get shop statistics from Firestore');
  }
}
