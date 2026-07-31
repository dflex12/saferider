// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "safe-ride-app.firebaseapp.com",
  databaseURL: "https://safe-ride-app-default-rtdb.firebaseio.com",
  projectId: "safe-ride-app",
  storageBucket: "safe-ride-app.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;