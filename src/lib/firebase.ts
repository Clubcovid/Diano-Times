import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
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

function initializeFirebase() {
    if (getApps().length > 0) {
        return getApp();
    }
    // Check if all required public keys are present
    if (firebaseConfig.apiKey && firebaseConfig.projectId) {
        return initializeApp(firebaseConfig);
    }
    // If keys are not present, return null. This can happen during build time.
    return null;
}

const app = initializeFirebase();

const auth = app ? getAuth(app) : ({} as any); // Provide a mock to prevent crashes, though it won't work
const db = app ? getFirestore(app) : ({} as any);

// Initialize Analytics only on the client and if supported
if (typeof window !== 'undefined' && app) {
  isSupported().then(yes => {
    if (yes && firebaseConfig.measurementId) {
      getAnalytics(app);
    }
  });
}

export { app, auth, db };
