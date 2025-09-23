import { db, COLLECTIONS } from '../firebase.server';

export interface Session {
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

export class SessionService {
  static async create(session: Session): Promise<void> {
    await db.collection(COLLECTIONS.SESSIONS).doc(session.id).set({
      ...session,
      expires: session.expires?.toISOString(),
    });
  }

  static async findById(id: string): Promise<Session | null> {
    const doc = await db.collection(COLLECTIONS.SESSIONS).doc(id).get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data()!;
    return {
      ...data,
      expires: data.expires ? new Date(data.expires) : undefined,
    } as Session;
  }

  static async findByShop(shop: string): Promise<Session | null> {
    const snapshot = await db
      .collection(COLLECTIONS.SESSIONS)
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
      expires: data.expires ? new Date(data.expires) : undefined,
    } as Session;
  }

  static async update(id: string, updates: Partial<Session>): Promise<void> {
    const updateData = { ...updates };
    if (updates.expires) {
      updateData.expires = updates.expires.toISOString() as any;
    }

    await db.collection(COLLECTIONS.SESSIONS).doc(id).update(updateData);
  }

  static async delete(id: string): Promise<void> {
    await db.collection(COLLECTIONS.SESSIONS).doc(id).delete();
  }

  static async deleteByShop(shop: string): Promise<void> {
    const snapshot = await db
      .collection(COLLECTIONS.SESSIONS)
      .where('shop', '==', shop)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  }
}
