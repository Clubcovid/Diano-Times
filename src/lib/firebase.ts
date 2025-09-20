
import { initializeApp, getApps, getApp, FirebaseApp, FirebaseOptions } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  if (getApps().length === 0) {
    try {
      app = initializeApp(firebaseConfig);
      if (typeof window !== 'undefined') {
        isSupported().then(yes => {
          if (yes && firebaseConfig.measurementId) {
            getAnalytics(app!);
          }
        });
      }
    } catch (e) {
      console.error('Firebase initialization error', e);
    }
  } else {
    app = getApp();
  }

  if (app) {
    auth = getAuth(app);
    db = getFirestore(app);
  }
} else {
  console.warn('Firebase public credentials are not available. Client-side Firebase features will be disabled.');
}

export { app, auth, db };
