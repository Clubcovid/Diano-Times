
import admin from 'firebase-admin';
import 'server-only';

const hasServiceAccount =
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY;

if (!hasServiceAccount) {
    console.warn(
    'Firebase Admin credentials are not set in environment variables. Server-side Firebase functionality will be disabled.'
  );
}

// Function to initialize and/or get the Firebase Admin app
function getAdminApp() {
    if (admin.apps.length > 0) {
        return admin.app();
    }

    if (hasServiceAccount) {
        try {
            return admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
                }),
            });
        } catch (error) {
            console.error('Firebase Admin SDK initialization error:', error);
            return null;
        }
    }
    return null;
}

const adminApp = getAdminApp();

const auth = adminApp ? admin.auth() : null;
const db = adminApp ? admin.firestore() : null;

export { db, auth };
