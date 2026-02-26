import { initializeApp, getApps, getApp, FirebaseApp, FirebaseOptions } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyBn76repAWoZbF1A2l-KeFiesadQpEV7WU",
  authDomain: "ton-safe-mode-87055725-5330a.firebaseapp.com",
  projectId: "ton-safe-mode-87055725-5330a",
  storageBucket: "ton-safe-mode-87055725-5330a.firebasestorage.app",
  messagingSenderId: "748068954779",
  appId: "1:748068954779:web:1c4b81b5127c2c4b0adc3e"
};

let app: FirebaseApp;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage = getStorage(app);

if (typeof window !== 'undefined') {
    isSupported().then(yes => {
        if (yes) {
            getAnalytics(app);
        }
    });
}

export { app, auth, db, storage };
