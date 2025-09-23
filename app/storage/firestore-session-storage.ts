import { SessionStorage } from "@shopify/shopify-app-session-storage";
import { SessionService } from "../services/session.server";

export class FirestoreSessionStorage implements SessionStorage {
  async storeSession(session: any): Promise<boolean> {
    try {
      await SessionService.create(session);
      return true;
    } catch (error) {
      console.error("Error storing session:", error);
      return false;
    }
  }

  async loadSession(id: string): Promise<any> {
    try {
      return await SessionService.findById(id);
    } catch (error) {
      console.error("Error loading session:", error);
      return undefined;
    }
  }

  async deleteSession(id: string): Promise<boolean> {
    try {
      await SessionService.delete(id);
      return true;
    } catch (error) {
      console.error("Error deleting session:", error);
      return false;
    }
  }

  async deleteSessions(ids: string[]): Promise<boolean> {
    try {
      await Promise.all(ids.map(id => SessionService.delete(id)));
      return true;
    } catch (error) {
      console.error("Error deleting sessions:", error);
      return false;
    }
  }

  async findSessionsByShop(shop: string): Promise<any[]> {
    try {
      const session = await SessionService.findByShop(shop);
      return session ? [session] : [];
    } catch (error) {
      console.error("Error finding sessions by shop:", error);
      return [];
    }
  }
}
