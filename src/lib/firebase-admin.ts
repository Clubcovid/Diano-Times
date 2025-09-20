/**
 * @fileoverview
 * This file contains the server-side initialization for the Firebase Admin SDK.
 * It uses a singleton pattern to ensure that the SDK is initialized only once.
 */
import * as admin from 'firebase-admin';

// Check if the service account credentials are available in environment variables.
const serviceAccount: admin.ServiceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
};

const hasServiceAccount =
  serviceAccount.projectId &&
  serviceAccount.clientEmail &&
  serviceAccount.privateKey;

let db: admin.firestore.Firestore | null = null;
let auth: admin.auth.Auth | null = null;

if (hasServiceAccount) {
  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin SDK initialized successfully.');
    } catch (error: any) {
      // This can happen in environments where the SDK is initialized multiple times.
      if (error.code !== 'auth/already-exists') {
          console.error('Firebase Admin SDK initialization error:', error);
      }
    }
  }
  db = admin.firestore();
  auth = admin.auth();
} else {
  console.warn('Firebase Admin SDK credentials are not available. Server-side Firebase features will be disabled.');
}

export { db, auth };
