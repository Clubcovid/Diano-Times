
import * as admin from 'firebase-admin';

let app: admin.app.App;

// Check if the service account credentials are available
const hasServiceAccount =
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// Initialize the app only if it hasn't been initialized and credentials are provided
if (admin.apps.length === 0 && hasServiceAccount) {
  const serviceAccount: admin.ServiceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // Replace escaped newlines from environment variables
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  };

  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else if (admin.apps.length > 0) {
    app = admin.apps[0]!;
}


// Export the real db and auth if the app was initialized, otherwise export mocks
const db: admin.firestore.Firestore = app
  ? admin.firestore(app)
  : ({} as admin.firestore.Firestore);

const auth: admin.auth.Auth = app
  ? admin.auth(app)
  : ({
      listUsers: async () => ({ users: [], pageToken: undefined }),
      updateUser: async () => ({} as any),
      verifyIdToken: async () => ({} as any),
    } as unknown as admin.auth.Auth);
    
if (!app && process.env.NODE_ENV !== 'production') {
    console.warn(
      'Firebase Admin SDK not initialized. Missing credentials. Using mock implementations.'
    );
}

export { db, auth };
