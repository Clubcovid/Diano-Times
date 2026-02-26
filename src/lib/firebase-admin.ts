
import admin from 'firebase-admin';
import 'server-only';

const serviceAccount = {
  projectId: "talk-of-nations-db2",
  clientEmail: "firebase-adminsdk-fbsvc@talk-of-nations-db2.iam.gserviceaccount.com",
  privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCwmH8yIfLX3Xfu\nUhDcWU00iJCC+172z3aPCQuWoc3yyFl2KUomrNuoivUhCLOdpJiLPA9mDrtK4Pda\nqHxnTBPRobX3b2kEfFFwFxTXbzSk+dlqk89r3ORJDi+NU5cv24WRpfkK87kzeMSW\nGyGxY7PLCqt2dr1rfHVDEKI5+WKljnVwsmYuMREE+vc6v9smBuqCQOMgZEW2wanO\nfMKdL+9kGCX/FvdQ7TFD2C2mEHAYWdVUFgJNb3/HvMLWhk0xh4FkCqsjYJgHEthy\n6yU6RJ8ZXJtT0oaLpnEuVkoUpvUkXdxyXWvOrA73b2L8FpuNsrVH09Pztm+/Zt4u\nluzlB6zzAgMBAAECggEAHLEMysCLm+Pj1j4nds2G3C1V9q9QR17/VGTz/jYYEm/X\nt87POTJmK9+LzSFZ9sJlIGC9Nb0t/o/yJZzF6DiK6HPSxI/+1YI8ma6+WEmSmZKY\nbuxIoS3jOeAKp3ZjKXI2pNUnqHkJvYxLuwGke0AyLXUfKjZHjJz3e6fKW7X3f43n\nxjE3iS3ADBvVsL9PjXupGxvFlvN0nAyb4j3VlJqtwF9jQmPH7P6g4P/rIzk8cekD\n74QtP/8EZFZyPwtMkpUEwod/qPrW4HH43+pOxyRZ8/5nsbWzYlgSuCaRNmpHZbaN\nron3ln1QKT15Sf1gWOa2kiww+LS1qw3aXVILEVdMXQKBgQDctOFNgqhxkD1l2jKr\nkV4/6mCDuIaF4RShVzLBs5V3KB0P6+0JPxp6dNhy/NyUnbkp6JLUQ8Ezy1e5yMHI\nXw3Mx93MjtmGTeykeymWWH+kXWomRF1KrVXzwnrAvHkN/t8m10RFaQPgi4xc2eKh\nfdM7GkFv6e7403lpMpHxkzkFFwKBgQDM1dbE1y4MriUKFZVG5hj3bjOpuT2lLOy6\nJbQr2YyAHnYasT3vB1jo+mR1rwo3PM2sOof/ebdcCKLbxy+Z4dgn89saw1F4VF70\nnVkb7JTZIWvyf8VRJyXlrx0KGKCXBGXP3KuiMlxbGFP6i8gO5GH58T0wWnkpS1DD\I2YyL+04hQKBgF1YSyoDJsbRIIahYGjb1Kbns+ZB9vNMnPMX9CmkkISS/KetOtV8\nUPCV1q3bcFeS1at56A/KkD4dtH6o//yE50tDBPXtPObmsj1msdIan/GeaLTCmUpq\nQT4VdOFrVS+sKik9Rmys26zumHD03js7Akmu8xooMKAgoOrzLnKjt6wFAoGBAJQt\nKPUyOETCAVdfL6KfN3ZeiQ8BSv/fFMzAE6sY8BOKdaNvjj8I0J+Q6vVbD4fP+3TY\nzqLYOPVh5fYZDG1EPCsCtACTRK9IUXyhCuIxbaf5Dm7ZUTMYn8icueQg1qMIcmJA\n3wQxbDAV1EJNtgZX3iyB/+KnwDhIHH9db0Nk+jVFAoGAG3M0+yTagn115nODpbb0\ntukF44JLEecQdg4kafQOJESRpkAPX12xkqE8daDjOlR6Dmky4mZMf4RLTRoqsju6\nmBMoUMgnrj+k2M5t5tu4S8z1Z+jXpx+vdIighzMdvJKNvBRiKhdxnuGDidwgfgKd\n80oumgi9hSVeDn43FwYjHGU=\n-----END PRIVATE KEY-----\n",
};

if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: `${serviceAccount.projectId}.firebasestorage.app`,
      });
      console.log('Firebase Admin SDK initialized successfully.');
    } catch (error) {
      const err = error as Error;
      console.error('Firebase Admin SDK initialization error:', err.message);
    }
}

const auth = admin.apps.length ? admin.auth() : null;
const db = admin.apps.length ? admin.firestore() : null;

export { db, auth };
