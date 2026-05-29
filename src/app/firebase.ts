import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

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
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
