import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
} from 'firebase/auth';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

function usernameToEmail(username: string): string {
  return `${username.toLowerCase().trim()}@sukikuliner.game`;
}

function getPasswordForUsername(username: string): string {
  return `SukiPass#${username.toLowerCase().trim()}`;
}

export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}

export function initFirebase() {
  if (!isFirebaseConfigured()) {
    console.warn('[Firebase] Konfigurasi tidak ditemukan. Menggunakan mode lokal.');
    return;
  }
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    console.log('[Firebase] Berhasil diinisialisasi.');
  } catch (e) {
    console.error('[Firebase] Gagal inisialisasi:', e);
  }
}

export async function registerWithUsername(username: string): Promise<string> {
  if (!auth) throw new Error('Firebase belum diinisialisasi.');
  const email = usernameToEmail(username);
  const password = getPasswordForUsername(username);
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    return cred.user.uid;
  } catch (e: unknown) {
    const code = (e as { code?: string }).code;
    if (code === 'auth/email-already-in-use') {
      try {
        const existingCred = await signInWithEmailAndPassword(auth, email, password);
        throw new Error(`AUTH_EXISTS_UID:${existingCred.user.uid}`);
      } catch (loginErr: unknown) {
        const loginMsg = loginErr instanceof Error ? loginErr.message : '';
        if (loginMsg.startsWith('AUTH_EXISTS_UID:')) throw loginErr;
        throw new Error('USERNAME_TAKEN');
      }
    }
    if (code === 'auth/weak-password') {
      throw new Error('Password terlalu lemah (minimal 6 karakter).');
    }
    console.error('[Firebase] Register gagal:', e);
    throw new Error('Gagal mendaftar. Coba lagi.');
  }
}

export async function loginWithUsername(username: string): Promise<string> {
  if (!auth) throw new Error('Firebase belum diinisialisasi.');
  const email = usernameToEmail(username);
  const password = getPasswordForUsername(username);
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user.uid;
  } catch (e: unknown) {
    const code = (e as { code?: string }).code;
    if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      throw new Error('Username tidak ditemukan.');
    }
    console.error('[Firebase] Login gagal:', e);
    throw new Error('Gagal masuk. Coba lagi.');
  }
}

export async function logoutUser(): Promise<void> {
  if (!auth) return;
  try {
    await signOut(auth);
  } catch (e) {
    console.error('[Firebase] Logout gagal:', e);
  }
}

export function getDb(): Firestore | null {
  return db;
}

export function getAppAuth(): Auth | null {
  return auth;
}
