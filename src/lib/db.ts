import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  addDoc,
  getDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { getDb, isFirebaseConfigured } from './firebase/config';
import { fallbackSnacks } from './datastore/fallbackSnacks';
import { fallbackQuizzes } from './datastore/fallbackQuizzes';
import { fallbackRecipes } from './datastore/fallbackRecipes';
import type { SnackData, QuizData, RecipeData, UserProfile, UserSession } from '../types';

// ========== Konstanta LocalStorage ==========
const LS_SNACKS = 'kuliner_snacks';
const LS_QUIZZES = 'kuliner_quizzes';
const LS_RECIPES = 'kuliner_recipes';
const LS_PROFILE = 'kuliner_profile';
const LS_SESSIONS = 'kuliner_sessions';

// ========== Game Content Fetchers ==========

export async function fetchSnacks(): Promise<SnackData[]> {
  if (isFirebaseConfigured()) {
    try {
      const db = getDb()!;
      const snap = await getDocs(collection(db, 'snacks'));
      const data = snap.docs.map(d => d.data() as SnackData).sort((a, b) => a.tier - b.tier);
      if (data.length > 0) {
        localStorage.setItem(LS_SNACKS, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn('[DB] Gagal ambil snacks dari Firestore:', e);
    }
  }
  // Try localStorage cache
  const cached = localStorage.getItem(LS_SNACKS);
  if (cached) return JSON.parse(cached);
  // Fallback to hardcoded
  return fallbackSnacks;
}

export async function fetchQuizzes(): Promise<QuizData[]> {
  if (isFirebaseConfigured()) {
    try {
      const db = getDb()!;
      const snap = await getDocs(collection(db, 'quizzes'));
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as QuizData));
      if (data.length > 0) {
        localStorage.setItem(LS_QUIZZES, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn('[DB] Gagal ambil quizzes dari Firestore:', e);
    }
  }
  const cached = localStorage.getItem(LS_QUIZZES);
  if (cached) return JSON.parse(cached);
  return fallbackQuizzes;
}

export async function fetchRecipes(): Promise<RecipeData[]> {
  if (isFirebaseConfigured()) {
    try {
      const db = getDb()!;
      const snap = await getDocs(collection(db, 'recipes'));
      const data = snap.docs.map(d => d.data() as RecipeData);
      if (data.length > 0) {
        localStorage.setItem(LS_RECIPES, JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn('[DB] Gagal ambil recipes dari Firestore:', e);
    }
  }
  const cached = localStorage.getItem(LS_RECIPES);
  if (cached) return JSON.parse(cached);
  return fallbackRecipes;
}

// ========== Player Data ==========

export async function saveProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
  if (isFirebaseConfigured()) {
    try {
      const db = getDb()!;
      const ref = doc(db, 'users', userId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await updateDoc(ref, profile);
      } else {
        await setDoc(ref, { ...profile, createdAt: Date.now() });
      }
      return;
    } catch (e) {
      console.warn('[DB] Gagal simpan profil ke Firestore:', e);
    }
  }
  // LocalStorage fallback
  const existing = localStorage.getItem(LS_PROFILE);
  const current = existing ? JSON.parse(existing) : {};
  localStorage.setItem(LS_PROFILE, JSON.stringify({ ...current, ...profile }));
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  if (isFirebaseConfigured()) {
    try {
      const db = getDb()!;
      const snap = await getDoc(doc(db, 'users', userId));
      if (snap.exists()) return snap.data() as UserProfile;
    } catch (e) {
      console.warn('[DB] Gagal ambil profil dari Firestore:', e);
    }
  }
  const cached = localStorage.getItem(LS_PROFILE);
  return cached ? JSON.parse(cached) : null;
}

export async function saveSession(userId: string, session: UserSession): Promise<void> {
  if (isFirebaseConfigured()) {
    try {
      const db = getDb()!;
      await addDoc(collection(db, 'users', userId, 'sessions'), session);
      return;
    } catch (e) {
      console.warn('[DB] Gagal simpan sesi ke Firestore:', e);
    }
  }
  // LocalStorage fallback
  const existing = localStorage.getItem(LS_SESSIONS);
  const sessions: UserSession[] = existing ? JSON.parse(existing) : [];
  sessions.unshift(session);
  // Keep only last 20 sessions
  localStorage.setItem(LS_SESSIONS, JSON.stringify(sessions.slice(0, 20)));
}

export async function getSessions(userId: string): Promise<UserSession[]> {
  if (isFirebaseConfigured()) {
    try {
      const db = getDb()!;
      const q = query(
        collection(db, 'users', userId, 'sessions'),
        orderBy('startedAt', 'desc'),
        limit(20)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as UserSession);
    } catch (e) {
      console.warn('[DB] Gagal ambil sesi dari Firestore:', e);
    }
  }
  const cached = localStorage.getItem(LS_SESSIONS);
  return cached ? JSON.parse(cached) : [];
}
