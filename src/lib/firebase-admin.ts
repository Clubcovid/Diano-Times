
import * as admin from 'firebase-admin';

const hasServiceAccount =
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

let db: admin.firestore.Firestore;
let auth: admin.auth.Auth;

if (hasServiceAccount) {
  if (admin.apps.length === 0) {
    const serviceAccount: admin.ServiceAccount = {
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  db = admin.firestore();
  auth = admin.auth();
} else {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      'Firebase Admin SDK not initialized. Missing environment variables. Using mock implementations.'
    );
  }
  // Provide mock implementations to avoid crashing the app during development or build
  // when environment variables are not set.
  db = {
    collection: () => ({
      get: async () => ({ docs: [], empty: true }),
      where: () => ({ get: async () => ({ docs: [], empty: true }) }),
      orderBy: () => ({ get: async () => ({ docs: [], empty: true }) }),
      doc: () => ({ get: async () => ({ exists: false }) }),
      addDoc: async () => Promise.resolve({ id: 'mock-id' }),
    }),
  } as any;

  auth = {
    listUsers: async () => ({ users: [], pageToken: undefined }),
  } as any;
}


export { db, auth };
