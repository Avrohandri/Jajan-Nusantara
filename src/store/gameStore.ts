import { create } from 'zustand';
import type { SnackData, QuizData, RecipeData, UserSession, ScreenName, IslandProgress, IslandCookingComplete, IslandStars, IslandMerges, RegionBestScores, UserProfile } from '../types';
import { calculateStars } from '../config/starThresholds';
import {
  fetchSnacks,
  fetchQuizzes,
  fetchRecipes,
  saveSession,
  getProfile,
  getSessions,
  createProfile,
  saveUsername,
  checkUsernameExists,
  updateIslandProgress,
  updateProfileIcon,
  saveProfile,
} from '../lib/db';
import { registerWithUsername, loginWithUsername, logoutUser } from '../lib/firebase/config';

const DEFAULT_ISLAND_PROGRESS: IslandProgress = {
  jogja: false,
  bali: false,
  aceh: false,
  maluku: false,
};

const DEFAULT_ISLAND_COOKING: IslandCookingComplete = {
  jogja: false,
  bali: false,
  aceh: false,
  maluku: false,
};

const DEFAULT_ISLAND_STARS: IslandStars = {
  jogja: 0,
  bali: 0,
  aceh: 0,
  maluku: 0,
};

const DEFAULT_ISLAND_MERGES: IslandMerges = {
  jogja: 0,
  bali: 0,
  aceh: 0,
  maluku: 0,
};

const DEFAULT_REGION_SCORES: RegionBestScores = {
  jogja: 0,
  bali: 0,
  aceh: 0,
  maluku: 0,
};

interface GameStore {
  // --- Screen ---
  currentScreen: ScreenName;
  setScreen: (screen: ScreenName) => void;
  activeRegion: string;
  setActiveRegion: (region: string) => void;
  jajanpediaRegionIndex: number;
  setJajanpediaRegionIndex: (index: number) => void;

  // --- Game Content (from Firestore / fallback) ---
  snacks: SnackData[];
  quizzes: QuizData[];
  recipes: RecipeData[];
  contentLoaded: boolean;
  loadContent: () => Promise<void>;

  // --- Current Session State ---
  score: number;
  mergeCount: number;
  highestTier: number;
  seenTiers: number[];
  isPaused: boolean;
  isGameOver: boolean;
  startTime: number | null;

  addScore: (points: number) => void;
  incrementMerge: (tier: number) => void;
  markTierSeen: (tier: number) => void;
  setPaused: (paused: boolean) => void;
  setGameOver: () => void;
  resetGame: () => void;

  // --- Quiz State ---
  showQuiz: boolean;
  currentQuizIndex: number;
  quizzesCorrect: number;
  quizzesTriggered: number;
  triggerQuiz: () => boolean;
  answerQuiz: (correct: boolean) => void;
  closeQuiz: () => void;

  // --- Cooking Minigame State (Legacy) ---
  currentRecipe: RecipeData | null;
  cookingStep: number;
  cookingComplete: boolean;
  startCooking: (recipeName: string) => void;
  advanceCookingStep: () => void;
  resetCooking: () => void;

  // --- Klepon Mini-Game State ---
  kleponStep: number;
  kleponComplete: boolean;
  startKleponGame: () => void;
  advanceKleponStep: () => void;
  resetKleponGame: () => void;

  // --- Pie Susu Mini-Game State ---
  pieSusuStep: number;
  pieSusuComplete: boolean;
  startPieSusuGame: () => void;
  advancePieSusuStep: () => void;
  resetPieSusuGame: () => void;

  // --- Pisang Asar Mini-Game State ---
  pisangAsarStep: number;
  pisangAsarComplete: boolean;
  startPisangAsarGame: () => void;
  advancePisangAsarStep: () => void;
  resetPisangAsarGame: () => void;

  // --- Samaloyang Mini-Game State ---
  samaloyangStep: number;
  samaloyangComplete: boolean;
  startSamaloyangGame: () => void;
  advanceSamaloyangStep: () => void;
  resetSamaloyangGame: () => void;

  // --- Auth State ---
  userId: string;
  username: string;
  profileIcon: string;
  isLoggedIn: boolean;
  authError: string | null;
  authLoading: boolean;
  setUserId: (uid: string) => void;
  register: (username: string) => Promise<void>;
  login: (username: string) => Promise<void>;
  logout: () => Promise<void>;
  setAuthError: (msg: string | null) => void;
  setProfileIcon: (icon: string) => Promise<void>;

  // --- Player Profile ---
  totalSessions: number;
  regionBestScores: RegionBestScores;
  totalBestScore: number;
  totalMerges: number;
  totalQuizzesCorrect: number;
  totalQuizzesAnswered: number;
  unlockedRecipes: string[];
  sessions: UserSession[];
  islandProgress: IslandProgress;
  /** true = mini game memasak sudah diselesaikan — dipakai untuk unlock pulau berikutnya */
  islandCookingComplete: IslandCookingComplete;
  islandStars: IslandStars;
  islandMerges: IslandMerges;
  loadProfile: () => Promise<void>;
  endSession: (reason: 'board_full' | 'target_reached' | 'quit') => Promise<void>;
  completeIsland: () => Promise<void>;
  /** Dipanggil dari setiap MiniGameScreen saat cooking selesai */
  completeMinigameCooking: (region: string) => Promise<void>;
  awardStarsForRegion: (region: string) => Promise<void>;

  // --- First Launch ---
  hasSeenInstructions: boolean;
  setHasSeenInstructions: () => void;
  hasSeenJajanpediaInstructions: boolean;
  setHasSeenJajanpediaInstructions: () => void;

  // --- Settings ---
  soundEnabled: boolean;
  toggleSound: () => void;
  isMusicOn: boolean;
  isSfxOn: boolean;
  toggleMusic: () => void;
  toggleSfx: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Screen
  currentScreen: 'login',
  setScreen: (screen) => set({ currentScreen: screen }),
  activeRegion: 'jogja',
  setActiveRegion: (region) => set({ activeRegion: region }),
  jajanpediaRegionIndex: 0,
  setJajanpediaRegionIndex: (index) => set({ jajanpediaRegionIndex: index }),

  // Content
  snacks: [],
  quizzes: [],
  recipes: [],
  contentLoaded: false,
  loadContent: async () => {
    const [snacks, quizzes, recipes] = await Promise.all([
      fetchSnacks(),
      fetchQuizzes(),
      fetchRecipes(),
    ]);
    set({ snacks, quizzes, recipes, contentLoaded: true });
  },

  // Session
  score: 0,
  mergeCount: 0,
  highestTier: 0,
  seenTiers: [] as number[],
  isPaused: false,
  isGameOver: false,
  startTime: null,

  addScore: (points) => set(s => ({ score: s.score + points })),
  incrementMerge: (tier) => set(s => ({
    mergeCount: s.mergeCount + 1,
    highestTier: Math.max(s.highestTier, tier),
    seenTiers: s.seenTiers.includes(tier) ? s.seenTiers : [...s.seenTiers, tier],
  })),
  markTierSeen: (tier) => set(s => ({
    seenTiers: s.seenTiers.includes(tier) ? s.seenTiers : [...s.seenTiers, tier],
  })),
  setPaused: (paused) => set({ isPaused: paused }),
  setGameOver: () => set({ isGameOver: true }),
  resetGame: () => set({
    score: 0,
    mergeCount: 0,
    highestTier: 0,
    seenTiers: [],
    isPaused: false,
    isGameOver: false,
    startTime: Date.now(),
    showQuiz: false,
    quizzesCorrect: 0,
    quizzesTriggered: 0,
    currentQuizIndex: 0,
  }),

  // Quiz
  showQuiz: false,
  currentQuizIndex: 0,
  quizzesCorrect: 0,
  quizzesTriggered: 0,
  triggerQuiz: () => {
    const state = get();
    const regionalQuizzes = state.quizzes.filter(q => q.region === state.activeRegion);
    if (regionalQuizzes.length === 0) return false;
    if (state.currentQuizIndex >= regionalQuizzes.length) return false;
    set({ showQuiz: true, isPaused: true, currentQuizIndex: state.currentQuizIndex });
    return true;
  },
  answerQuiz: (correct) => set(s => ({
    quizzesCorrect: s.quizzesCorrect + (correct ? 1 : 0),
    quizzesTriggered: s.quizzesTriggered + 1,
    score: s.score + (correct ? 50 : 0),
  })),
  closeQuiz: () => set(s => ({ showQuiz: false, isPaused: false, currentQuizIndex: s.currentQuizIndex + 1 })),

  // Cooking
  currentRecipe: null,
  cookingStep: 0,
  cookingComplete: false,
  startCooking: (recipeName) => {
    const recipe = get().recipes.find(r => r.snackName === recipeName) || get().recipes[0] || null;
    set({ currentRecipe: recipe, cookingStep: 0, cookingComplete: false, currentScreen: 'cooking' });
  },
  advanceCookingStep: () => {
    const s = get();
    if (!s.currentRecipe) return;
    if (s.cookingStep + 1 >= s.currentRecipe.steps.length) {
      const recipeName = s.currentRecipe.snackName;
      const isNew = !s.unlockedRecipes.includes(recipeName);
      const newUnlocked = isNew ? [...s.unlockedRecipes, recipeName] : s.unlockedRecipes;
      set({
        cookingComplete: true,
        cookingStep: s.cookingStep + 1,
        unlockedRecipes: newUnlocked,
      });
      if (isNew && s.userId) {
        saveProfile(s.userId, { unlockedRecipes: newUnlocked });
      }
    } else {
      set({ cookingStep: s.cookingStep + 1 });
    }
  },
  resetCooking: () => set({ currentRecipe: null, cookingStep: 0, cookingComplete: false }),

  // Klepon Mini-Game
  kleponStep: 0,
  kleponComplete: false,
  startKleponGame: () => set({ kleponStep: 0, kleponComplete: false, currentScreen: 'kleponGame' }),
  advanceKleponStep: () => {
    const s = get();
    const nextStep = s.kleponStep + 1;
    if (nextStep >= 5) {
      const isNew = !s.unlockedRecipes.includes('Klepon');
      const newUnlocked = isNew ? [...s.unlockedRecipes, 'Klepon'] : s.unlockedRecipes;
      set({
        kleponComplete: true,
        kleponStep: nextStep,
        unlockedRecipes: newUnlocked,
      });
      if (isNew && s.userId) {
        saveProfile(s.userId, { unlockedRecipes: newUnlocked });
      }
    } else {
      set({ kleponStep: nextStep });
    }
  },
  resetKleponGame: () => set({ kleponStep: 0, kleponComplete: false }),

  // Pie Susu Mini-Game
  pieSusuStep: 0,
  pieSusuComplete: false,
  startPieSusuGame: () => set({ pieSusuStep: 0, pieSusuComplete: false, currentScreen: 'pieSusuGame' }),
  advancePieSusuStep: () => {
    const s = get();
    const nextStep = s.pieSusuStep + 1;
    if (nextStep >= 5) {
      const isNew = !s.unlockedRecipes.includes('Pie Susu');
      const newUnlocked = isNew ? [...s.unlockedRecipes, 'Pie Susu'] : s.unlockedRecipes;
      set({
        pieSusuComplete: true,
        pieSusuStep: nextStep,
        unlockedRecipes: newUnlocked,
      });
      if (isNew && s.userId) {
        saveProfile(s.userId, { unlockedRecipes: newUnlocked });
      }
    } else {
      set({ pieSusuStep: nextStep });
    }
  },
  resetPieSusuGame: () => set({ pieSusuStep: 0, pieSusuComplete: false }),

  // Pisang Asar Mini-Game
  pisangAsarStep: 0,
  pisangAsarComplete: false,
  startPisangAsarGame: () => set({ pisangAsarStep: 0, pisangAsarComplete: false, currentScreen: 'pisangAsarGame' }),
  advancePisangAsarStep: () => {
    const s = get();
    const nextStep = s.pisangAsarStep + 1;
    if (nextStep >= 5) {
      const isNew = !s.unlockedRecipes.includes('Pisang Asar');
      const newUnlocked = isNew ? [...s.unlockedRecipes, 'Pisang Asar'] : s.unlockedRecipes;
      set({
        pisangAsarComplete: true,
        pisangAsarStep: nextStep,
        unlockedRecipes: newUnlocked,
      });
      if (isNew && s.userId) {
        saveProfile(s.userId, { unlockedRecipes: newUnlocked });
      }
    } else {
      set({ pisangAsarStep: nextStep });
    }
  },
  resetPisangAsarGame: () => set({ pisangAsarStep: 0, pisangAsarComplete: false }),

  // Samaloyang Mini-Game
  samaloyangStep: 0,
  samaloyangComplete: false,
  startSamaloyangGame: () => set({ samaloyangStep: 0, samaloyangComplete: false, currentScreen: 'samaloyangGame' }),
  advanceSamaloyangStep: () => {
    const s = get();
    const nextStep = s.samaloyangStep + 1;
    if (nextStep >= 4) {
      const isNew = !s.unlockedRecipes.includes('Samaloyang');
      const newUnlocked = isNew ? [...s.unlockedRecipes, 'Samaloyang'] : s.unlockedRecipes;
      set({
        samaloyangComplete: true,
        samaloyangStep: nextStep,
        unlockedRecipes: newUnlocked,
      });
      if (isNew && s.userId) {
        saveProfile(s.userId, { unlockedRecipes: newUnlocked });
      }
    } else {
      set({ samaloyangStep: nextStep });
    }
  },
  resetSamaloyangGame: () => set({ samaloyangStep: 0, samaloyangComplete: false }),

  // Auth
  userId: '',
  username: '',
  profileIcon: 'Klepon',
  isLoggedIn: false,
  authError: null,
  authLoading: false,
  setUserId: (uid) => set({ userId: uid }),
  setAuthError: (msg) => set({ authError: msg }),
  setProfileIcon: async (icon) => {
    const { userId, username } = get();
    set({ profileIcon: icon });
    await updateProfileIcon(userId, username, icon);
  },

  register: async (username) => {
    set({ authLoading: true, authError: null });
    try {
      // Cek dulu apakah username sudah dipakai
      const taken = await checkUsernameExists(username);
      if (taken) {
        set({ authError: 'USERNAME_TAKEN', authLoading: false });
        return;
      }
      const uid = await registerWithUsername(username);
      // Simpan mapping username → userId
      await saveUsername(uid, username);
      // Buat profil default
      await createProfile(uid, username);
      // Load profil
      set({
        userId: uid,
        username,
        isLoggedIn: true,
        currentScreen: 'mainMenu',
        islandProgress: { ...DEFAULT_ISLAND_PROGRESS },
        regionBestScores: { ...DEFAULT_REGION_SCORES },
        totalBestScore: 0,
        authLoading: false,
        authError: null,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Gagal mendaftar.';
      set({ authError: msg, authLoading: false });
    }
  },

  login: async (username) => {
    set({ authLoading: true, authError: null });
    try {
      const uid = await loginWithUsername(username);
      const profile = await getProfile(uid);
      if (!profile) {
        set({ authError: 'Profil tidak ditemukan.', authLoading: false });
        return;
      }
      set({
        userId: uid,
        username: profile.username,
        profileIcon: profile.profileIcon ?? 'Klepon',
        isLoggedIn: true,
        currentScreen: 'mainMenu',
        islandProgress: profile.islandProgress ?? { ...DEFAULT_ISLAND_PROGRESS },
        islandCookingComplete: (profile.islandCookingComplete ?? { ...DEFAULT_ISLAND_COOKING }) as IslandCookingComplete,
        islandStars: (profile.islandStars ?? { ...DEFAULT_ISLAND_STARS }) as IslandStars,
        islandMerges: profile.islandMerges ?? { ...DEFAULT_ISLAND_MERGES },
        regionBestScores: profile.regionBestScores ?? { ...DEFAULT_REGION_SCORES },
        totalBestScore: profile.totalBestScore ?? 0,
        totalSessions: profile.totalSessions ?? 0,
        totalMerges: profile.totalMerges ?? 0,
        totalQuizzesCorrect: profile.totalQuizzesCorrect ?? 0,
        totalQuizzesAnswered: profile.totalQuizzesAnswered ?? 0,
        unlockedRecipes: profile.unlockedRecipes ?? [],
        authLoading: false,
        authError: null,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Gagal masuk.';
      set({ authError: msg, authLoading: false });
    }
  },

  logout: async () => {
    await logoutUser();
    set({
      userId: '',
      username: '',
      isLoggedIn: false,
      islandProgress: { ...DEFAULT_ISLAND_PROGRESS },
      regionBestScores: { ...DEFAULT_REGION_SCORES },
      totalBestScore: 0,
      totalSessions: 0,
      totalMerges: 0,
      totalQuizzesCorrect: 0,
      totalQuizzesAnswered: 0,
      unlockedRecipes: [],
      sessions: [],
      currentScreen: 'login',
    });
  },

  // Profile
  totalSessions: 0,
  regionBestScores: { ...DEFAULT_REGION_SCORES },
  totalBestScore: 0,
  totalMerges: 0,
  totalQuizzesCorrect: 0,
  totalQuizzesAnswered: 0,
  unlockedRecipes: [],
  sessions: [],
  islandProgress: { ...DEFAULT_ISLAND_PROGRESS },
  islandCookingComplete: { ...DEFAULT_ISLAND_COOKING },
  islandStars: { ...DEFAULT_ISLAND_STARS },
  islandMerges: { ...DEFAULT_ISLAND_MERGES },

  loadProfile: async () => {
    const { userId } = get();
    if (!userId) return;
    const profile = await getProfile(userId);
    const sessions = await getSessions(userId);
    if (profile) {
      set({
        totalSessions: profile.totalSessions ?? 0,
        regionBestScores: profile.regionBestScores ?? { ...DEFAULT_REGION_SCORES },
        totalBestScore: profile.totalBestScore ?? 0,
        totalMerges: profile.totalMerges ?? 0,
        totalQuizzesCorrect: profile.totalQuizzesCorrect ?? 0,
        totalQuizzesAnswered: profile.totalQuizzesAnswered ?? 0,
        unlockedRecipes: profile.unlockedRecipes ?? [],
        islandProgress: profile.islandProgress ?? { ...DEFAULT_ISLAND_PROGRESS },
        islandCookingComplete: (profile.islandCookingComplete ?? { ...DEFAULT_ISLAND_COOKING }) as IslandCookingComplete,
        islandStars: (profile.islandStars ?? { ...DEFAULT_ISLAND_STARS }) as IslandStars,
        islandMerges: profile.islandMerges ?? { ...DEFAULT_ISLAND_MERGES },
        username: profile.username ?? '',
      });
    }
    set({ sessions });
  },

  endSession: async (reason) => {
    const s = get();
    const session: UserSession = {
      sessionId: `s_${Date.now()}`,
      startedAt: s.startTime ?? Date.now(),
      endedAt: Date.now(),
      score: s.score,
      merges: s.mergeCount,
      quizzesCorrect: s.quizzesCorrect,
      quizzesTriggered: s.quizzesTriggered,
      highestTier: s.highestTier,
      endReason: reason,
      region: s.activeRegion,
    };
    if (s.userId) await saveSession(s.userId, session);

    const newTotalSessions = s.totalSessions + 1;
    const newTotalMerges = s.totalMerges + s.mergeCount;
    const newTotalQuizzesCorrect = s.totalQuizzesCorrect + s.quizzesCorrect;
    const newTotalQuizzesAnswered = s.totalQuizzesAnswered + s.quizzesTriggered;

    set({
      totalSessions: newTotalSessions,
      totalMerges: newTotalMerges,
      totalQuizzesCorrect: newTotalQuizzesCorrect,
      totalQuizzesAnswered: newTotalQuizzesAnswered,
      sessions: [session, ...s.sessions].slice(0, 20),
    });

    if (s.userId) {
      await saveProfile(s.userId, {
        totalSessions: newTotalSessions,
        totalMerges: newTotalMerges,
        totalQuizzesCorrect: newTotalQuizzesCorrect,
        totalQuizzesAnswered: newTotalQuizzesAnswered,
      });
    }
  },

  /** 
   * Dipanggil dari ResultScreen ketika player berhasil menyelesaikan Drop & Merge.
   * Menandai pulau saat ini sebagai selesai dan update skor + leaderboard.
   */
  completeIsland: async () => {
    const s = get();
    const region = s.activeRegion as keyof IslandProgress;

    // Buat partial profile yang dibutuhkan updateIslandProgress
    const currentProfile: UserProfile = {
      userId: s.userId,
      username: s.username,
      totalSessions: s.totalSessions,
      regionBestScores: s.regionBestScores,
      totalBestScore: s.totalBestScore,
      totalMerges: s.totalMerges,
      totalQuizzesCorrect: s.totalQuizzesCorrect,
      totalQuizzesAnswered: s.totalQuizzesAnswered,
      unlockedRecipes: s.unlockedRecipes,
      islandProgress: s.islandProgress,
      islandStars: s.islandStars,
      islandMerges: s.islandMerges,
      profileIcon: s.profileIcon ?? 'Klepon',
      createdAt: Date.now(),
      lastPlayedAt: Date.now(),
    };

    // Simpan merge count saat selesai untuk hitung bintang nanti
    const newIslandMerges: IslandMerges = {
      ...s.islandMerges,
      [region]: s.mergeCount,
    };

    const { newRegionBestScores, newTotalBestScore } = await updateIslandProgress(
      s.userId,
      region,
      s.score,
      currentProfile,
    );

    const newIslandProgress: IslandProgress = {
      ...s.islandProgress,
      [region]: true,
    };

    set({
      islandProgress: newIslandProgress,
      islandMerges: newIslandMerges,
      regionBestScores: newRegionBestScores,
      totalBestScore: newTotalBestScore,
    });
  },

  /**
   * Dihitung & disimpan setelah player menyelesaikan mini game memasak.
   * Bintang dihitung dari SKOR pemain di Drop & Merge berdasarkan threshold
   * yang bisa diatur manual di: src/config/starThresholds.ts
   */
  awardStarsForRegion: async (region: string) => {
    const s = get();
    const key = region as keyof IslandStars;

    // Ambil skor terbaik region ini (sudah disimpan oleh completeIsland)
    const score = s.regionBestScores[key] ?? s.score;

    // Hitung bintang berdasarkan skor dan threshold per-pulau
    const earned = calculateStars(region, score);

    // Tidak ada bintang jika skor terlalu rendah
    if (earned === 0) return;

    // Hanya update jika bintang baru lebih baik dari sebelumnya
    const currentStars = s.islandStars[key] as 0 | 1 | 2 | 3;
    if (earned <= currentStars) return;

    const newIslandStars: IslandStars = {
      ...s.islandStars,
      [key]: earned,
    };

    set({ islandStars: newIslandStars });

    // Persist ke Firestore / localStorage
    if (s.userId) {
      const { saveIslandStars } = await import('../lib/db');
      await saveIslandStars(s.userId, newIslandStars, s.islandMerges);
    }
  },

  /**
   * Dipanggil ketika player menyelesaikan mini game memasak suatu pulau.
   * Menandai pulau sebagai FULLY COMPLETE sehingga pulau berikutnya terbuka di peta.
   */
  completeMinigameCooking: async (region: string) => {
    const s = get();
    const key = region as keyof IslandCookingComplete;

    // Sudah selesai sebelumnya — tidak perlu update
    if (s.islandCookingComplete[key]) return;

    const newCooking: IslandCookingComplete = {
      ...s.islandCookingComplete,
      [key]: true,
    };

    set({ islandCookingComplete: newCooking });

    // Persist ke Firestore
    if (s.userId) {
      await saveProfile(s.userId, { islandCookingComplete: newCooking } as any);
    }
  },

  // First launch (session based)
  hasSeenInstructions: false,
  setHasSeenInstructions: () => set({ hasSeenInstructions: true }),
  
  hasSeenJajanpediaInstructions: false,
  setHasSeenJajanpediaInstructions: () => set({ hasSeenJajanpediaInstructions: true }),

  // Settings
  soundEnabled: true,
  toggleSound: () => set(s => ({ soundEnabled: !s.soundEnabled })),
  isMusicOn: true,
  isSfxOn: true,
  toggleMusic: () => set(s => ({ isMusicOn: !s.isMusicOn })),
  toggleSfx: () => set(s => ({ isSfxOn: !s.isSfxOn })),
}));
