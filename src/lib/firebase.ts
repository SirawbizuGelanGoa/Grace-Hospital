// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAnalytics, Analytics } from "firebase/analytics";

// Your web app's Firebase configuration should be sourced from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let analytics: Analytics | null = null;

// Basic check for essential environment variables
if (
    !firebaseConfig.apiKey ||
    !firebaseConfig.projectId ||
    !firebaseConfig.authDomain
) {
    console.error(
        'Firebase configuration is missing or incomplete. ' +
        'Ensure NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID, and NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ' +
        'are set in your .env.local file in the project root and that the development server was restarted.'
    );
    // You might throw an error here in development to make it more obvious
    // For now, we'll let it proceed but Firebase services will likely fail to initialize.
}

if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    console.log("[Firebase] Initialized successfully. Project ID:", firebaseConfig.projectId);
  } catch (error) {
    console.error("[Firebase] Error initializing Firebase app:", error);
    // Fallback or rethrow, depending on desired behavior
    // For now, we'll allow the app to continue so other parts aren't blocked during setup,
    // but Firebase functionality will be broken.
    // A better approach might be to show a specific error page or component.
    // For simplicity in this context, we create a dummy app object if init fails,
    // so subsequent getAuth etc. don't immediately crash, though they won't work.
    app = {} as FirebaseApp; // This is a risky fallback, real app needs better error handling
  }
} else {
  app = getApp(); // if already initialized, use that one
  console.log("[Firebase] Using existing app instance. Project ID:", firebaseConfig.projectId);
}

try {
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
    // Initialize Analytics only on the client side and if measurementId is present
    analytics = getAnalytics(app);
  }
} catch (error) {
    console.error("[Firebase] Error initializing Firebase services (Auth, Firestore, Storage, Analytics):", error);
    // Provide dummy objects if initialization fails to prevent immediate crashes elsewhere,
    // though these services will not be functional.
    auth = {} as Auth;
    db = {} as Firestore;
    storage = {} as FirebaseStorage;
    analytics = null;
}

export { app, auth, db, storage, analytics };
