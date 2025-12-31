import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "./firebaseConfig";

// Initialize Firebase only if the API key is present
// This avoids build-time crashes when env vars are missing
const app = (firebaseConfig.apiKey && (getApps().length > 0 ? getApp() : initializeApp(firebaseConfig))) || null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

export { auth, db };
