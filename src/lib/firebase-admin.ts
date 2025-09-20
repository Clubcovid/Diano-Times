
import * as admin from 'firebase-admin';

let app: admin.app.App;

const hasServiceAccount =
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

if (hasServiceAccount && admin.apps.length === 0) {
  const serviceAccount: admin.ServiceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  };

  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else if (admin.apps.length > 0) {
  app = admin.apps[0]!;
} else {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      'Firebase Admin SDK not initialized. Missing environment variables. Using mock implementations.'
    );
  }
}

// @ts-ignore
const db: admin.firestore.Firestore = app ? admin.firestore(app) : {
    collection: () => ({
      get: async () => ({ docs: [], empty: true }),
      where: () => ({ get: async () => ({ docs: [], empty: true }) }),
      orderBy: () => ({ get: async () => ({ docs: [], empty: true }) }),
      doc: () => ({ 
          get: async () => ({ exists: false, data: () => null }),
          delete: async () => {},
          update: async () => {},
      }),
      add: async () => ({ id: 'mock-id' }),
    }),
};

// @ts-ignore
const auth: admin.auth.Auth = app ? admin.auth(app) : {
    listUsers: async () => ({ users: [], pageToken: undefined }),
    updateUser: async () => ({} as any),
    verifyIdToken: async () => ({} as any),
};


export { db, auth };
