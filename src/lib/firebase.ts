
import { initializeApp, getApps, getApp, FirebaseApp, FirebaseOptions } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyCWbN8et30foJxjRjiTNiNdbVusSD2FP8U",
  authDomain: "talk-of-nations-db2.firebaseapp.com",
  projectId: "talk-of-nations-db2",
  storageBucket: "talk-of-nations-db2.firebasestorage.app",
  messagingSenderId: "1093050725893",
  appId: "1:1093050725893:web:1de54809a71d2b573b0e6c",
  measurementId: "G-K65F7LS96Q"
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
        if (yes && firebaseConfig.measurementId) {
            getAnalytics(app);
        }
    });
}

export { app, auth, db, storage };
