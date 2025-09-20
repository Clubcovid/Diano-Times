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

if (hasServiceAccount && !admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin SDK initialized successfully.');
    } catch (error) {
      console.error('Firebase Admin SDK initialization error:', error);
    }
} else if (!hasServiceAccount) {
    console.warn('Firebase Admin SDK credentials are not available in environment variables. Server-side Firebase features will be disabled.');
}

// Get the initialized app.
const app = admin.apps.length > 0 ? admin.app() : null;

// Initialize services if the app was initialized.
// If not, these will be objects that will cause errors if used,
// which is intended to make it clear that the Admin SDK is not configured.
const db = app ? admin.firestore() : ({} as admin.firestore.Firestore);
const auth = app ? admin.auth() : ({} as admin.auth.Auth);


export { db, auth };
