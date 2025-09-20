
import admin from 'firebase-admin';
import 'server-only';

// Check for the existence of each required environment variable.
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

const hasServiceAccount = projectId && clientEmail && privateKey;

// Initialize the app only if it hasn't been initialized yet and all credentials are present.
if (!admin.apps.length) {
  if (hasServiceAccount) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: projectId,
          clientEmail: clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
      console.log('Firebase Admin SDK initialized successfully.');
    } catch (error) {
      console.error('Firebase Admin SDK initialization error:', error);
    }
  } else {
    let missingVars = [];
    if (!projectId) missingVars.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
    if (!clientEmail) missingVars.push('FIREBASE_CLIENT_EMAIL');
    if (!privateKey) missingVars.push('FIREBASE_PRIVATE_KEY');
    
    console.warn(
      `Firebase Admin SDK is not initialized. The following environment variables are missing: [${missingVars.join(', ')}]. Server-side Firebase features will be disabled.`
    );
  }
}


// Export the auth and db services, which will be null if initialization failed.
const auth = admin.apps.length ? admin.auth() : null;
const db = admin.apps.length ? admin.firestore() : null;

export { db, auth };
