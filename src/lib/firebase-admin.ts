
import admin from 'firebase-admin';
import 'server-only';

const hasServiceAccount =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY;

let db: admin.firestore.Firestore | null = null;
let auth: admin.auth.Auth | null = null;

if (hasServiceAccount) {
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
      if (!/already exists/i.test(error.message)) {
        console.error('Firebase Admin SDK initialization error:', error);
      }
    }
  }
  
  db = admin.firestore();
  auth = admin.auth();
} else {
  console.warn(
    'Firebase Admin credentials are not set in environment variables. Server-side Firebase functionality will be disabled.'
  );
}

export { db, auth };
