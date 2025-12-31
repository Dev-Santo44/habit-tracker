/**
 * This script injects Firebase configuration into the browser at runtime.
 * It reads from server environment variables and makes them available to the client.
 */

export function generateFirebaseConfigScript() {
    const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ''
    };

    return `
    window.FIREBASE_CONFIG = ${JSON.stringify(firebaseConfig)};
    window.NEXT_PUBLIC_FIREBASE_API_KEY = "${firebaseConfig.apiKey}";
    window.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = "${firebaseConfig.authDomain}";
    window.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "${firebaseConfig.projectId}";
    window.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = "${firebaseConfig.storageBucket}";
    window.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = "${firebaseConfig.messagingSenderId}";
    window.NEXT_PUBLIC_FIREBASE_APP_ID = "${firebaseConfig.appId}";
    window.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID = "${firebaseConfig.measurementId}";
  `;
}
