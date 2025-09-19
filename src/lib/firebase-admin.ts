
import * as admin from 'firebase-admin';

// Check if the necessary environment variables are set
const hasServiceAccount =
  process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY;

let db: admin.firestore.Firestore;
let auth: admin.auth.Auth;

if (!admin.apps.length) {
  if (hasServiceAccount) {
    const serviceAccount: admin.ServiceAccount = {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    
    db = admin.firestore();
    auth = admin.auth();
  } else {
    // If no service account, create dummy functions/objects to avoid crashes.
    // The parts of the app that need admin access will fail gracefully.
    console.warn("Firebase Admin SDK not initialized. Missing FIREBASE_CLIENT_EMAIL or FIREBASE_PRIVATE_KEY. Admin features will not work.");
    
    // Provide a mock db object that prevents crashes on collection() calls
    db = {
      collection: () => ({
        get: async () => ({
          docs: [],
          empty: true,
        }),
        where: () => ({
          get: async () => ({
            docs: [],
            empty: true,
          }),
        }),
        orderBy: () => ({
            get: async () => ({
                docs: [],
                empty: true,
            })
        }),
        doc: () => ({
            get: async () => ({
                exists: false
            })
        })
      }),
    } as unknown as admin.firestore.Firestore;

    // Provide a mock auth object with an empty listUsers function
    auth = {
        listUsers: async () => ({ users: [], pageToken: undefined }),
    } as unknown as admin.auth.Auth;
  }
} else {
    db = admin.firestore();
    auth = admin.auth();
}

export const getFirebaseAuth = () => auth;
export { db };
