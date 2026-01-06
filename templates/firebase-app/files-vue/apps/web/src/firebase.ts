/**
 * Firebase Configuration
 *
 * Auto-detects development mode and connects to emulators.
 */

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Firebase configuration - in production, these come from environment
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '{{gcpProjectId}}',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Connect to emulators in development
if (import.meta.env.DEV) {
  const authHost = import.meta.env.VITE_AUTH_EMULATOR_HOST || 'localhost:9099';
  const firestoreHost = import.meta.env.VITE_FIRESTORE_EMULATOR_HOST || 'localhost:8080';

  try {
    connectAuthEmulator(auth, `http://${authHost}`, { disableWarnings: true });
    console.log(`🔥 Connected to Auth emulator at ${authHost}`);
  } catch (e) {
    // Already connected
  }

  try {
    const [host, port] = firestoreHost.split(':');
    connectFirestoreEmulator(db, host, parseInt(port, 10));
    console.log(`🔥 Connected to Firestore emulator at ${firestoreHost}`);
  } catch (e) {
    // Already connected
  }
}

export default app;
