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

function initializeAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }
  
  if (!hasServiceAccount) {
    // In a production or Vercel environment, we want to fail fast if keys are missing.
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
        throw new Error('Firebase Admin SDK credentials are not available. The application cannot start.');
    }
    // For local development, we can log a warning but still allow the app to attempt to run.
    console.warn(
      'Firebase Admin SDK credentials are not set. Server-side Firebase features will not work.'
    );
    // Return a dummy object to prevent crashing, but functionality will be broken.
    return null;
  }
  
  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const app = initializeAdmin();

// Initialize services, or provide mock objects if initialization failed
const db = app ? admin.firestore(app) : ({} as admin.firestore.Firestore);
const auth = app ? admin.auth(app) : ({ listUsers: async () => ({ users: [] }) } as unknown as admin.auth.Auth);

export { db, auth };
