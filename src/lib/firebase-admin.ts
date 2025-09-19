import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    const serviceAccount: admin.ServiceAccount = {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const getFirebaseAuth = () => admin.auth();

export { db, getFirebaseAuth };
