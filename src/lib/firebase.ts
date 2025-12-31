import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import firebaseConfig from "./firebaseConfig";

// Initialize Firebase only if the API key is present
// This avoids build-time crashes when env vars are missing
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

try {
    if (firebaseConfig.apiKey) {
        app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
    } else {
        console.warn("Firebase: API key is missing. Firebase services will not be available.");
    }
} catch (error) {
    console.error("Firebase initialization error:", error);
}

export { auth, db };
