
import { initializeApp, getApps, getApp, FirebaseApp, FirebaseOptions } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyD-hGBE5N3gzZHIwvq1bsTtegURUlZUt7w",
  authDomain: "studio-2630134466-e06b1.firebaseapp.com",
  databaseURL: "https://studio-2630134466-e06b1-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "studio-2630134466-e06b1",
  storageBucket: "studio-2630134466-e06b1.firebasestorage.app",
  messagingSenderId: "1036795142239",
  appId: "1:1036795142239:web:1a32fd0ddba4ff2fe97bea"
};


// Singleton pattern to initialize and get Firebase services
let app: FirebaseApp;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

if (typeof window !== 'undefined') {
    isSupported().then(yes => {
        if (yes && firebaseConfig.measurementId) {
            getAnalytics(app);
        }
    });
}


export { app, auth, db };
