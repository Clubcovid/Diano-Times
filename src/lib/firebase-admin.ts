
import * as admin from 'firebase-admin';

let db: admin.firestore.Firestore | null = null;
let auth: admin.auth.Auth | null = null;

// Ensure this file is only run on the server
import 'server-only';

const hasServiceAccount =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY;

if (hasServiceAccount) {
  // Initialize on first import
  if (!admin.apps.length) {
    try {
      const serviceAccount: admin.ServiceAccount = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin SDK initialized successfully.');
    } catch (error: any) {
      // This can happen in Next.js dev mode due to hot-reloading.
      // We'll check if the app already exists.
      if (error.code !== 'auth/invalid-credential' && !/already exists/i.test(error.message)) {
        console.error('Firebase Admin SDK initialization error:', error);
      }
    }
  }
  // Assign db and auth after initialization (or if already initialized)
  db = admin.firestore();
  auth = admin.auth();
} else {
  console.warn(
    'Firebase Admin credentials are not set in environment variables. Server-side Firebase functionality will be disabled.'
  );
}

export { db, auth };
