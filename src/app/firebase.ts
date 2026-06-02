import { initializeApp, getApps, getApp } from "firebase/app";
import { Firestore, initializeFirestore, getFirestore, setLogLevel } from "firebase/firestore";
import { Auth, getAuth, initializeAuth, indexedDBLocalPersistence, browserLocalPersistence } from "firebase/auth";

// Your web app's Firebase configuration
// Replace these with your own Firebase project's credentials from your Firebase Console.
const firebaseConfig = {
  apiKey: "AIzaSyC7XL5Mfw44TvTJDjwHFcGwtC-8zV7sAVM",
  authDomain: "pikmin-timer-shared.firebaseapp.com",
  projectId: "pikmin-timer-shared",
  storageBucket: "pikmin-timer-shared.firebasestorage.app",
  messagingSenderId: "636444111896",
  appId: "1:636444111896:web:dec7df075cd74b0fad3f6d",
  measurementId: "G-CC1DHG7GJQ"
};

// Initialize Firebase (safely checks for server-side vs client-side hot-reloading)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let db: Firestore;
try {
  db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  });
} catch (e) {
  db = getFirestore(app);
}

// Enable debug logging for deeper insights in Xcode console
try {
  setLogLevel("debug");
} catch (e) {
  console.error("Failed to set Firestore log level:", e);
}

let auth: Auth;
if (typeof window !== "undefined") {
  try {
    auth = initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence]
    });
  } catch (e) {
    auth = getAuth(app);
  }
} else {
  auth = getAuth(app);
}

export { app, db, auth };
