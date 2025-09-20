
import * as admin from 'firebase-admin';

// Check if the necessary environment variables are set
const hasServiceAccount =
  process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

let db: admin.firestore.Firestore;
let auth: admin.auth.Auth;

function initializeAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  if (hasServiceAccount) {
    const serviceAccount: admin.ServiceAccount = {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    };
    
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  
  // In development or when credentials are not available, we initialize without credentials for local testing.
  // The app will have limited functionality and will warn the user.
  if (process.env.NODE_ENV !== 'production') {
    console.warn("Firebase Admin SDK not initialized. Missing environment variables. Using mock data where available.");
    return admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'diano-times'
    });
  }

  // In production, if we still don't have credentials, something is wrong.
  // We should not initialize a mock app.
  throw new Error("Firebase Admin SDK failed to initialize in production. Environment variables are missing.");
}

const adminApp = initializeAdmin();

// Assign firestore and auth instances. If initialization failed or was partial,
// these might throw errors upon use, which is intended behavior now.
db = adminApp.firestore();
auth = adminApp.auth();


export const getFirebaseAuth = () => auth;
export { db };
