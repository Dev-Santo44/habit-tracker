const getEnv = (key: string) => {
    // Check process.env first (build-time and server-side)
    let val = process.env[key];

    // In browser, also check window object for runtime injection
    if (typeof window !== 'undefined' && !val) {
        val = (window as any)[key];
    }

    return (val && val !== "undefined" && val !== "YOUR_KEY" && val !== "") ? val : undefined;
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
