import admin from 'firebase-admin';
import 'server-only';

const projectId = "ton-safe-mode-87055725-5330a";

if (!admin.apps.length) {
    try {
      if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
          admin.initializeApp({
            credential: admin.credential.cert({
                projectId: projectId,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            }),
            storageBucket: `${projectId}.firebasestorage.app`,
          });
      } else {
          // Fallback for development if keys aren't in .env but project ID is known
          admin.initializeApp({
            projectId: projectId,
            storageBucket: `${projectId}.firebasestorage.app`,
          });
      }
      console.log('Firebase Admin SDK initialized successfully for project:', projectId);
    } catch (error) {
      console.error('Firebase Admin SDK initialization error:', error);
    }
}

const auth = admin.apps.length ? admin.auth() : null;
const db = admin.apps.length ? admin.firestore() : null;

export { db, auth };
