
import admin from 'firebase-admin';
import 'server-only';

// Check if the service account credentials are available
const hasServiceAccount =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY;

// Initialize Firebase Admin SDK only if it hasn't been initialized yet.
if (hasServiceAccount && !admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // The private key needs to have its newlines properly formatted.
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      }),
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
  }
} else if (!hasServiceAccount) {
    console.warn(
    'Firebase Admin credentials are not set in environment variables. Server-side Firebase functionality will be disabled.'
  );
}

// Export the initialized services. If initialization failed, these will throw errors when used.
const auth = admin.auth();
const db = admin.firestore();

export { db, auth };
