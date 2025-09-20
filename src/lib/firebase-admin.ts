
import admin from 'firebase-admin';
import 'server-only';

const serviceAccount = {
  projectId: "studio-2630134466-e06b1",
  clientEmail: "firebase-adminsdk-fbsvc@studio-2630134466-e06b1.iam.gserviceaccount.com",
  privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCGMQUEUbQbphl8\n0wAYA+jpWJo75+cWS/tnR+7Jk4ORjXM/7mCbMvh/ZQwHuqCGFCUk6DjDwpck/hdo\nQQphSGT1Oc9HdRGSZ/K89P+kluKMczOM2eTQNXDD6qXeStuaEMjRLpeXelSacd+S\nYDxK61Ugym7z49tN76o6ktOjW2UI0cz8wLh1Wduokq8dsEhA4R7tMfcx0k9t+v1h\nmC2kHQ9ZMYKlhjIGoKKFMth7SCj8rbZnAqxwiMgOI1foMGjMZn6tFiHeKHxWMOM5\nynQQAvXK9+fsrD+j5M+lf3qkmjyBsLtUqOPtUIeH2pWKwf25XgVxyQe5/+cJb+vL\nENvjWs6fAgMBAAECggEANxjUawAS99E8oMxPuwyL6pdnCFbAwp5i9HaL/Db1q+MM\noYDCKKcGceQuytOdSj/mOl+gwvvYLCepu7QMy4G6dheM3FWcZ+UHPP9JIa6UCT/Z\nuCjU8oomqUJkZT+OKBVhJsY/FsJzD1DXD5Y02zwB4WtMoBX7uuW/Grqja+zAMJy/\nnbub7tz6UsvAYj5sNObW+n76EBP7MFwORy9AGrobw+88b9MQC73Ty3HHcp4XLYkq\noRVvy9WX2Jw4/KeQ4Vc5TYfy6imXRqlvCrHdktunmOmfs8sJNhhLNw/XUMSUkizT\nrSmCh8ntMurweDbC2p/L/P0XQ5pJrXjapZ2NVqbIuQKBgQC6asoPbFa0XeTfqdtT\neoBp/FG/I71+gEOV0jd6QETthTRZahaHTSubX7AROo/5zzerMOR0humR19oz0W4w\nLL6zHnCW3VYWyJclGs+83P9kHwHIJy5Ug4tnHAe2KxrYu1nBzLZSAPHZNPswcUVE\nobDZ9mQqZw4ZdjdWtPmoxNnBhwKBgQC4R8X7VERHJBwO9ORg3KsAJzkyC+vY9a1V\nO/6UBgNeCQckZgxUocJ5WfbMmIMBKJPJcM68tkl0Dw9ai+8Wav76P4X8ifZNVCtC\nA2ZjrlGyNng36c7ooyTT63QyPPZ5e47fv7v20+kU+m+/aXA2OkHkXT1QR/5murFy\nxUUIUKKwKQKBgCzh90JdYEbO8IMVX1QrA24BLSFrFn21nhAda/QIM1BIqQD6NPBg\nmSYwlLChO/b2eD3EaMzRirztjoC5ZOE+dK+lnZAFPGwB4boySV/8iZTujjxFircY\ncODjc8vddvpFqWeqxR7bUV9tjSjtrLLIh08DLryy0Uc6GjrLGe0TcCZTAoGAdt5F\nRQNsL3+JYdRx5FEzNJwYdsHd1ktTDaHva0gdr/Ce3Mm+tnDJY0G2wu61wm+MNOpB\nUNU8uFJmkv+kr49A/ecv5GCRsfvTE3fh+fad2BjunxKAVuu1e8VrZGSSkHY1CPtC\nocq7lL6eipfWvAQEMOw7+qcV4OoYQHIjP2PULVECgYA6XsBoG2TlItPergpLRRlx\n/RJxNZirOP6QlbiqZi8/cp/u4fvLa07+w6mFDALYfD1SQv7qxhoHFkwvxlZxT6Ve\n3Y7hiE6eXkRnSW0zDMFDUVstnuej6QmfuD7/fXfKH6x9BuL1YZmEz2jJodD1+euV\nsm83yA3FnbKapQF6HshdYQ==\n-----END PRIVATE KEY-----\n"
};

// Initialize the app only if it hasn't been initialized yet.
if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: "studio-2630134466-e06b1.appspot.com"
      });
      console.log('Firebase Admin SDK initialized successfully.');
    } catch (error) {
      const err = error as Error;
      console.error('Firebase Admin SDK initialization error:', err.message);
    }
}


// Export the auth and db services, which will be null if initialization failed.
const auth = admin.apps.length ? admin.auth() : null;
const db = admin.apps.length ? admin.firestore() : null;

export { db, auth };
