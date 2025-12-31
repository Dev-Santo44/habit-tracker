const getEnv = (key: string) => {
    // 1. Check window object for runtime injection (The reliable Cloud Run method)
    if (typeof window !== 'undefined' && (window as any).ENV) {
        return (window as any).ENV[key];
    }

    // 2. Fallback to process.env (Local dev & Build time)
    return process.env[key];
};

const firebaseConfig = {
    apiKey: getEnv("NEXT_PUBLIC_FIREBASE_API_KEY"),
    authDomain: getEnv("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
    projectId: getEnv("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
    storageBucket: getEnv("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: getEnv("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
    appId: getEnv("NEXT_PUBLIC_FIREBASE_APP_ID"),
    measurementId: getEnv("NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID")
};

export default firebaseConfig;
