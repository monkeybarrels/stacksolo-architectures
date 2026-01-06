/**
 * Firebase Configuration
 *
 * Firebase Auth only - data stored in PostgreSQL.
 * Auto-detects development mode and connects to emulators.
 */

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Firebase configuration - in production, these come from environment
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '{{gcpProjectId}}',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth only (data lives in PostgreSQL)
export const auth = getAuth(app);

// Connect to emulators in development
if (import.meta.env.DEV) {
  const authHost = import.meta.env.VITE_AUTH_EMULATOR_HOST || 'localhost:9099';

  try {
    connectAuthEmulator(auth, `http://${authHost}`, { disableWarnings: true });
    console.log(`Connected to Auth emulator at ${authHost}`);
  } catch (e) {
    // Already connected
  }
}

export default app;