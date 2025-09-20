'use server';
/**
 * @fileoverview
 * This file contains the server-side initialization for the Firebase Admin SDK.
 * It uses a singleton pattern to ensure that the SDK is initialized only once.
 */

import * as admin from 'firebase-admin';

interface FirebaseAdminServices {
  db: admin.firestore.Firestore;
  auth: admin.auth.Auth;
}

// This function initializes the Firebase Admin SDK and returns the db and auth services.
// It uses a singleton pattern to ensure that the SDK is initialized only once.
function initializeAdmin(): FirebaseAdminServices {
  // If the app is already initialized, return the existing services.
  if (admin.apps.length > 0) {
    const app = admin.app();
    return {
      db: admin.firestore(app),
      auth: admin.auth(app),
    };
  }

  // Check if the service account credentials are available in environment variables.
  const hasServiceAccount =
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!hasServiceAccount) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        'Firebase Admin SDK not initialized. Missing credentials. Using mock implementations.'
      );
    }
    // Return mock implementations if credentials are not available.
    // This allows the app to build and run without crashing.
    return {
      db: {} as admin.firestore.Firestore,
      auth: {
        listUsers: async () => ({ users: [], pageToken: undefined }),
        updateUser: async () => ({} as any),
        verifyIdToken: async () => ({} as any),
      } as unknown as admin.auth.Auth,
    };
  }

  // Initialize the app with the credentials from environment variables.
  const serviceAccount: admin.ServiceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  };

  const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  return {
    db: admin.firestore(app),
    auth: admin.auth(app),
  };
}

// Export the initialized services.
export const { db, auth } = initializeAdmin();
