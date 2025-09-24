import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
function initializeFirebase(): Firestore {
  if (getApps().length === 0) {
    // Initialize with service account key or default credentials
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    } else {
      // Use default credentials (for Google Cloud Run, etc.)
      initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    }
  }

  return getFirestore();
}

const db = initializeFirebase();

// Data models for Firestore
export interface SessionData {
  id: string;
  shop: string;
  state: string;
  isOnline: boolean;
  scope?: string;
  expires?: Date;
  accessToken: string;
  userId?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  accountOwner: boolean;
  locale?: string;
  collaborator?: boolean;
  emailVerified?: boolean;
}

export interface SettingsData {
  id: string;
  shop: string;
  apiUrl: string;
  apiKey: string;
  createdAt: Date;
  updatedAt: Date;
}

// Firestore service class
export class FirestoreService {
  private db: Firestore;

  constructor() {
    this.db = db;
  }

  // Session operations
  async createSession(sessionData: SessionData): Promise<void> {
    await this.db.collection('sessions').doc(sessionData.id).set({
      ...sessionData,
      expires: sessionData.expires || null,
    });
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    const doc = await this.db.collection('sessions').doc(sessionId).get();
    if (!doc.exists) {
      return null;
    }

    const data = doc.data()!;
    return {
      ...data,
      expires: data.expires ? data.expires.toDate() : undefined,
    } as SessionData;
  }

  async updateSession(sessionId: string, updates: Partial<SessionData>): Promise<void> {
    await this.db.collection('sessions').doc(sessionId).update(updates);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.db.collection('sessions').doc(sessionId).delete();
  }

  async getSessionByShop(shop: string): Promise<SessionData | null> {
    const snapshot = await this.db
      .collection('sessions')
      .where('shop', '==', shop)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      expires: data.expires ? data.expires.toDate() : undefined,
    } as SessionData;
  }

  // Settings operations
  async createSettings(settingsData: Omit<SettingsData, 'id' | 'createdAt' | 'updatedAt'>): Promise<SettingsData> {
    const id = this.generateId();
    const now = new Date();
    const newSettings: SettingsData = {
      id,
      ...settingsData,
      createdAt: now,
      updatedAt: now,
    };

    await this.db.collection('settings').doc(id).set(newSettings);
    return newSettings;
  }

  async getSettings(shop: string): Promise<SettingsData | null> {
    const snapshot = await this.db
      .collection('settings')
      .where('shop', '==', shop)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as SettingsData;
  }

  async updateSettings(shop: string, updates: Partial<Omit<SettingsData, 'id' | 'shop' | 'createdAt'>>): Promise<void> {
    const snapshot = await this.db
      .collection('settings')
      .where('shop', '==', shop)
      .limit(1)
      .get();

    if (snapshot.empty) {
      throw new Error('Settings not found');
    }

    await snapshot.docs[0].ref.update({
      ...updates,
      updatedAt: new Date(),
    });
  }

  async deleteSettings(shop: string): Promise<void> {
    const snapshot = await this.db
      .collection('settings')
      .where('shop', '==', shop)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      await snapshot.docs[0].ref.delete();
    }
  }

  private generateId(): string {
    // Simple ID generator - you might want to use a more robust solution
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

// Export singleton instance
export const firestoreService = new FirestoreService();
