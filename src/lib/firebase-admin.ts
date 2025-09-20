
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
  
  if (process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production') {
     console.warn("Firebase Admin SDK not initialized in production. Missing environment variables.");
  }

  // In development or when credentials are not available, we initialize without credentials.
  // This allows some functionality (like Firestore in-memory) but auth features will fail.
  return admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'diano-times'
  });
}

const adminApp = initializeAdmin();

if (hasServiceAccount) {
    db = adminApp.firestore();
    auth = adminApp.auth();
} else {
    // Provide mock objects that prevent the app from crashing when admin features are called without credentials.
    db = {
        collection: (path: string) => ({
            get: async () => ({ docs: [], empty: true, size: 0 }),
            where: () => ({ get: async () => ({ docs: [], empty: true, size: 0 }) }),
            orderBy: () => ({ get: async () => ({ docs: [], empty: true, size: 0 }) }),
            doc: () => ({ get: async () => ({ exists: false }), set: async () => {}, update: async () => {}, delete: async () => {} }),
            add: async () => ({ id: 'mock-id' }),
        }),
    } as unknown as admin.firestore.Firestore;

    auth = {
        listUsers: async () => ({ users: [], pageToken: undefined }),
    } as unknown as admin.auth.Auth;
}


export const getFirebaseAuth = () => auth;
export { db };
