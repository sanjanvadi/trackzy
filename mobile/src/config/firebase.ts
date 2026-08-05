import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp, getApp, getApps } from 'firebase/app';
// @ts-expect-error - getReactNativePersistence exists at runtime but is untyped in this entry point
import {Auth,getAuth,initializeAuth,getReactNativePersistence,} from "firebase/auth";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Validate Firebase configuration
const validateFirebaseConfig = () => {
  const required = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  const missing = required.filter((key) => !firebaseConfig[key as keyof typeof firebaseConfig]);

  if (missing.length > 0) {
    console.error('Missing Firebase configuration:', missing);
    throw new Error(
      `Missing Firebase configuration: ${missing.join(', ')}. Please check your .env file.`
    );
  }
};

// Validate config before initializing
validateFirebaseConfig();

const app =
  getApps().length > 0
    ? getApp()
    : initializeApp(firebaseConfig);

let auth: Auth;

if (Platform.OS === "web") {
  auth = getAuth(app);
} else {
  try {
    // This runs on the first native initialization.
    auth = initializeAuth(app, {
      persistence:
        getReactNativePersistence(AsyncStorage),
    });
  } catch (error: any) {
    if (error?.code === "auth/already-initialized") {
      // Fast Refresh or another module already initialized Auth.
      auth = getAuth(app);
    } else {
      throw error;
    }
  }
}

export { app, auth };

