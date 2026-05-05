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
  serverTimestamp,
} from 'firebase/firestore';
import { getDb, isFirebaseConfigured } from './firebase/config';
import { fallbackSnacks } from './datastore/fallbackSnacks';
import { fallbackQuizzes } from './datastore/fallbackQuizzes';
import { fallbackRecipes } from './datastore/fallbackRecipes';
import type { SnackData, QuizData, RecipeData, UserProfile, UserSession, IslandProgress, IslandStars, IslandMerges, RegionBestScores, LeaderboardEntry } from '../types';
import { PROFILE_ICONS } from '../utils/profileIcons';

// ========== Konstanta LocalStorage ==========
const LS_SNACKS = 'kuliner_snacks';
const LS_RECIPES = 'kuliner_recipes';
const LS_PROFILE = 'kuliner_profile_v2';

// ========== Default values ==========
const DEFAULT_ISLAND_PROGRESS: IslandProgress = {
  jogja: false,
  bali: false,
  aceh: false,
  maluku: false,
};

const DEFAULT_REGION_SCORES: RegionBestScores = {
  jogja: 0,
  bali: 0,
  aceh: 0,
  maluku: 0,
};

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
  const cached = localStorage.getItem(LS_SNACKS);
  if (cached) return JSON.parse(cached);
  return fallbackSnacks;
}

export async function fetchQuizzes(): Promise<QuizData[]> {
  localStorage.removeItem('kuliner_quizzes');
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

// ========== Username Management ==========

/** Cek apakah username sudah dipakai (di koleksi usernames) */
export async function checkUsernameExists(username: string): Promise<boolean> {
  if (!isFirebaseConfigured()) return false;
  try {
    const db = getDb()!;
    const snap = await getDoc(doc(db, 'usernames', username.toLowerCase().trim()));
    return snap.exists();
  } catch (e) {
    console.warn('[DB] Gagal cek username:', e);
    return false;
  }
}

/** Simpan mapping username → userId di koleksi usernames */
export async function saveUsername(userId: string, username: string): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    const db = getDb()!;
    await setDoc(doc(db, 'usernames', username.toLowerCase().trim()), {
      userId,
      createdAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn('[DB] Gagal simpan username:', e);
  }
}

// ========== Player Profile ==========

export async function createProfile(userId: string, username: string): Promise<void> {
  if (isFirebaseConfigured()) {
    try {
      const db = getDb()!;
      const randomIcon = PROFILE_ICONS[Math.floor(Math.random() * PROFILE_ICONS.length)].name;
      const profile: UserProfile = {
        userId,
        username,
        totalSessions: 0,
        regionBestScores: { ...DEFAULT_REGION_SCORES },
        totalBestScore: 0,
        totalMerges: 0,
        totalQuizzesCorrect: 0,
        totalQuizzesAnswered: 0,
        unlockedRecipes: [],
        islandProgress: { ...DEFAULT_ISLAND_PROGRESS },
        profileIcon: randomIcon,
        createdAt: Date.now(),
        lastPlayedAt: Date.now(),
      };
      await setDoc(doc(db, 'users', userId), profile);
      await setDoc(doc(db, 'leaderboard', userId), {
        userId,
        username,
        totalBestScore: 0,
        profileIcon: randomIcon,
      });
      return;
    } catch (e) {
      console.warn('[DB] Gagal buat profil:', e);
    }
  }
}

export async function getProfile(userId: string): Promise<UserProfile | null> {
  if (isFirebaseConfigured()) {
    try {
      const db = getDb()!;
      const snap = await getDoc(doc(db, 'users', userId));
      if (snap.exists()) return snap.data() as UserProfile;
    } catch (e) {
      console.warn('[DB] Gagal ambil profil:', e);
    }
  }
  const cached = localStorage.getItem(LS_PROFILE);
  return cached ? JSON.parse(cached) : null;
}

export async function saveProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
  if (isFirebaseConfigured()) {
    try {
      const db = getDb()!;
      const ref = doc(db, 'users', userId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await updateDoc(ref, { ...profile, lastPlayedAt: Date.now() });
      } else {
        await setDoc(ref, { ...profile, createdAt: Date.now(), lastPlayedAt: Date.now() });
      }
      return;
    } catch (e) {
      console.warn('[DB] Gagal simpan profil:', e);
    }
  }
  const existing = localStorage.getItem(LS_PROFILE);
  const current = existing ? JSON.parse(existing) : {};
  localStorage.setItem(LS_PROFILE, JSON.stringify({ ...current, ...profile }));
}

// ========== Island Progress ==========

/**
 * Update progress pulau setelah berhasil menyelesaikan Drop & Merge di region tersebut.
 * Juga update skor terbaik per-pulau dan totalBestScore di leaderboard.
 */
export async function updateIslandProgress(
  userId: string,
  region: keyof IslandProgress,
  sessionScore: number,
  currentProfile: UserProfile,
): Promise<{ newRegionBestScores: RegionBestScores; newTotalBestScore: number }> {
  const newRegionBestScores: RegionBestScores = {
    ...currentProfile.regionBestScores,
    [region]: Math.max(currentProfile.regionBestScores[region] ?? 0, sessionScore),
  };
  const newTotalBestScore = Object.values(newRegionBestScores).reduce((a, b) => a + b, 0);

  const updatedProgress: IslandProgress = {
    ...currentProfile.islandProgress,
    [region]: true,
  };

  if (isFirebaseConfigured()) {
    try {
      const db = getDb()!;
      await updateDoc(doc(db, 'users', userId), {
        islandProgress: updatedProgress,
        regionBestScores: newRegionBestScores,
        totalBestScore: newTotalBestScore,
        lastPlayedAt: Date.now(),
      });
      // Update leaderboard
      await setDoc(doc(db, 'leaderboard', userId), {
        userId,
        username: currentProfile.username,
        totalBestScore: newTotalBestScore,
        profileIcon: currentProfile.profileIcon ?? 'Klepon',
      });
    } catch (e) {
      console.warn('[DB] Gagal update island progress:', e);
    }
  }

  return { newRegionBestScores, newTotalBestScore };
}

// ========== Leaderboard ==========

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  if (isFirebaseConfigured()) {
    try {
      const db = getDb()!;
      const q = query(collection(db, 'leaderboard'), orderBy('totalBestScore', 'desc'), limit(50));
      const snap = await getDocs(q);
      return snap.docs.map((d, i) => ({
        ...(d.data() as Omit<LeaderboardEntry, 'rank'>),
        profileIcon: (d.data() as { profileIcon?: string }).profileIcon ?? 'Klepon',
        rank: i + 1,
      }));
    } catch (e) {
      console.warn('[DB] Gagal ambil leaderboard:', e);
    }
  }
  return [];
}

/** Update icon profil user di koleksi users dan leaderboard */
export async function updateProfileIcon(userId: string, username: string, icon: string): Promise<void> {
  if (!isFirebaseConfigured()) return;
  try {
    const db = getDb()!;
    await updateDoc(doc(db, 'users', userId), { profileIcon: icon });
    // Sync ke leaderboard juga (merge agar totalBestScore tidak hilang)
    const lbSnap = await getDoc(doc(db, 'leaderboard', userId));
    if (lbSnap.exists()) {
      await updateDoc(doc(db, 'leaderboard', userId), { profileIcon: icon });
    } else {
      await setDoc(doc(db, 'leaderboard', userId), { userId, username, totalBestScore: 0, profileIcon: icon });
    }
  } catch (e) {
    console.warn('[DB] Gagal update profile icon:', e);
  }
}

// ========== Sessions ==========

export async function saveSession(userId: string, session: UserSession): Promise<void> {
  if (isFirebaseConfigured()) {
    try {
      const db = getDb()!;
      await addDoc(collection(db, 'users', userId, 'sessions'), session);
      return;
    } catch (e) {
      console.warn('[DB] Gagal simpan sesi:', e);
    }
  }
}

export async function getSessions(userId: string): Promise<UserSession[]> {
  if (isFirebaseConfigured()) {
    try {
      const db = getDb()!;
      const q = query(
        collection(db, 'users', userId, 'sessions'),
        orderBy('startedAt', 'desc'),
        limit(20),
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as UserSession);
    } catch (e) {
      console.warn('[DB] Gagal ambil sesi:', e);
    }
  }
  return [];
}

/** Simpan data bintang (islandStars) dan merge count per pulau ke Firestore / localStorage */
export async function saveIslandStars(
  userId: string,
  islandStars: IslandStars,
  islandMerges: IslandMerges,
): Promise<void> {
  if (isFirebaseConfigured()) {
    try {
      const db = getDb()!;
      await updateDoc(doc(db, 'users', userId), {
        islandStars,
        islandMerges,
        lastPlayedAt: Date.now(),
      });
      return;
    } catch (e) {
      console.warn('[DB] Gagal simpan island stars:', e);
    }
  }
  // Fallback: simpan ke localStorage
  const existing = localStorage.getItem('kuliner_profile_v2');
  const current = existing ? JSON.parse(existing) : {};
  localStorage.setItem('kuliner_profile_v2', JSON.stringify({ ...current, islandStars, islandMerges }));
}
