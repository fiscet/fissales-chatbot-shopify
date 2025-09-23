import { db, COLLECTIONS } from '../firebase.server';

export interface Settings {
  id: string;
  shop: string;
  apiUrl: string;
  apiKey: string;
  createdAt: Date;
  updatedAt: Date;
}

export class SettingsService {
  static async create(settings: Omit<Settings, 'id' | 'createdAt' | 'updatedAt'>): Promise<Settings> {
    const now = new Date();
    const newSettings: Settings = {
      id: '', // Will be set by Firestore
      ...settings,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection(COLLECTIONS.SETTINGS).add({
      ...newSettings,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });

    return {
      ...newSettings,
      id: docRef.id,
    };
  }

  static async findByShop(shop: string): Promise<Settings | null> {
    const snapshot = await db
      .collection(COLLECTIONS.SETTINGS)
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
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    } as Settings;
  }

  static async update(shop: string, updates: Partial<Omit<Settings, 'id' | 'shop' | 'createdAt'>>): Promise<void> {
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const snapshot = await db
      .collection(COLLECTIONS.SETTINGS)
      .where('shop', '==', shop)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      await snapshot.docs[0].ref.update(updateData);
    }
  }

  static async delete(shop: string): Promise<void> {
    const snapshot = await db
      .collection(COLLECTIONS.SETTINGS)
      .where('shop', '==', shop)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }
}
