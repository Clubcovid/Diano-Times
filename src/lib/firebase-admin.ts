import * as admin from 'firebase-admin';

// Check if the necessary environment variables are set
const hasServiceAccount =
  process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY;

let db: admin.firestore.Firestore;
let getFirebaseAuth: () => admin.auth.Auth;

if (!admin.apps.length) {
  if (hasServiceAccount) {
    const serviceAccount: admin.ServiceAccount = {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    
    db = admin.firestore();
    getFirebaseAuth = () => admin.auth();
  } else {
    // If no service account, create dummy functions/objects to avoid crashes.
    // The parts of the app that need admin access will fail gracefully.
    console.warn("Firebase Admin SDK not initialized. Missing FIREBASE_CLIENT_EMAIL or FIREBASE_PRIVATE_KEY. Admin features will not work.");
    db = {} as admin.firestore.Firestore;
    getFirebaseAuth = () => ({} as admin.auth.Auth);
  }
} else {
    db = admin.firestore();
    getFirebaseAuth = () => admin.auth();
}


export { db, getFirebaseAuth };
