import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || 'fissales-chatbot',
  // In production, use service account key
  ...(process.env.FIREBASE_PRIVATE_KEY && {
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  }),
};

// Initialize Firebase Admin if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);

// Collection names
export const COLLECTIONS = {
  SESSIONS: 'shopify_sessions',
  SETTINGS: 'shopify_settings',
} as const;
