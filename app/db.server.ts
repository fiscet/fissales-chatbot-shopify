// Firestore-based database service
import { firestoreService, type SessionData, type SettingsData } from './firestore.server';

// Session operations
export const sessionStorage = {
  async storeSession(session: SessionData): Promise<void> {
    await firestoreService.createSession(session);
  },

  async loadSession(id: string): Promise<SessionData | undefined> {
    const session = await firestoreService.getSession(id);
    return session || undefined;
  },

  async deleteSession(id: string): Promise<void> {
    await firestoreService.deleteSession(id);
  },

  async deleteSessions(shop: string): Promise<void> {
    // Firestore doesn't have a direct equivalent to Prisma's deleteMany
    // We'll need to query and delete individually
    const session = await firestoreService.getSessionByShop(shop);
    if (session) {
      await firestoreService.deleteSession(session.id);
    }
  },

  async findSessionsByShop(shop: string): Promise<SessionData[]> {
    const session = await firestoreService.getSessionByShop(shop);
    return session ? [session] : [];
  },
};

// Settings operations
export const settingsStorage = {
  async createSettings(data: Omit<SettingsData, 'id' | 'createdAt' | 'updatedAt'>): Promise<SettingsData> {
    return await firestoreService.createSettings(data);
  },

  async getSettings(shop: string): Promise<SettingsData | null> {
    return await firestoreService.getSettings(shop);
  },

  async updateSettings(shop: string, data: Partial<Omit<SettingsData, 'id' | 'shop' | 'createdAt'>>): Promise<void> {
    await firestoreService.updateSettings(shop, data);
  },

  async deleteSettings(shop: string): Promise<void> {
    await firestoreService.deleteSettings(shop);
  },
};

// Export types for compatibility
export type { SessionData, SettingsData };

// Default export for backward compatibility
export default {
  session: sessionStorage,
  settings: settingsStorage,
};
