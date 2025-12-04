export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

declare global {
  var __firebase_config: FirebaseConfig;
  var __app_id: string;
  var __initial_auth_token: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  lastCompletionDate: string | null; // YYYY-MM-DD
  createdAt: number;
}

export interface GameData {
  kisses: number;
  currentStreak: number;
  lastCompletionDate: string | null; // YYYY-MM-DD
}

export interface Gift {
  id: string;
  name: string;
  cost: number;
  icon: string;
}
