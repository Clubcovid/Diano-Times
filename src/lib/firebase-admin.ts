/**
 * @fileoverview
 * This file contains the server-side initialization for the Firebase Admin SDK.
 * It uses a singleton pattern to ensure that the SDK is initialized only once.
 */
import * as admin from 'firebase-admin';

// Check if the app is already initialized to prevent re-initialization
if (!admin.apps.length) {
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
  
  if (hasServiceAccount) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin SDK initialized successfully.');
    } catch (error) {
      console.error('Firebase Admin SDK initialization error:', error);
    }
  } else {
    // In a production or Vercel environment, we want to fail fast if keys are missing.
    // For local development, we can log a warning.
    const errorMessage = 'Firebase Admin SDK credentials are not available in environment variables. Server-side Firebase features will be disabled.';
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
        throw new Error(errorMessage);
    }
    console.warn(errorMessage);
  }
}

// Get the initialized app, or a default app if it exists.
const app = admin.apps.length > 0 ? admin.app() : null;

// Initialize services, or provide mock objects if initialization failed
// This is a safety net, but the primary logic relies on the early exit/throw
// if credentials are not present in production.
const db = app ? admin.firestore() : ({} as admin.firestore.Firestore);
const auth = app ? admin.auth() : ({ listUsers: async () => ({ users: [] }) } as unknown as admin.auth.Auth);

export { db, auth };
