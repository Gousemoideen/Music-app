import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, onSnapshot, Firestore } from 'firebase/firestore';
import { getAuth, signInWithCustomToken, Auth } from 'firebase/auth';

// Ensure configuration exists
if (typeof window !== 'undefined' && !window.__firebase_config) {
  console.error("Firebase config missing. Application may not function correctly.");
}

const app = initializeApp(window.__firebase_config || {});
export const db: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);

export const getAppId = () => window.__app_id || 'default-app';

// Helper to ensure authentication before data access
export const initializeAuth = async () => {
  if (window.__initial_auth_token) {
    try {
      await signInWithCustomToken(auth, window.__initial_auth_token);
    } catch (e) {
      console.error("Auth failed", e);
    }
  }
};

// Data Paths
export const getUserPath = (uid: string) => `artifacts/${getAppId()}/users/${uid}`;
export const getTasksPath = (uid: string) => `${getUserPath(uid)}/tasks`;
export const getGameDataPath = (uid: string) => `${getUserPath(uid)}/game_data`;
