import { create } from 'zustand';
import type { SnackData, QuizData, UserSession, ScreenName, IslandProgress, IslandCookingComplete, IslandStars, IslandMerges, RegionBestScores, UserProfile } from '../types';
import { calculateStars } from '../config/starThresholds';
import {
  fetchSnacks,
  fetchQuizzes,
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
  currentScreen: ScreenName;
  setScreen: (screen: ScreenName) => void;
  activeRegion: string;
  setActiveRegion: (region: string) => void;
  jajanpediaRegionIndex: number;
  setJajanpediaRegionIndex: (index: number) => void;

  snacks: SnackData[];
  quizzes: QuizData[];
  contentLoaded: boolean;
  loadContent: () => Promise<void>;

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

  showQuiz: boolean;
  currentQuizIndex: number;
  quizzesCorrect: number;
  quizzesTriggered: number;
  triggerQuiz: () => boolean;
  answerQuiz: (correct: boolean) => void;
  closeQuiz: () => void;


  kleponStep: number;
  kleponComplete: boolean;
  startKleponGame: () => void;
  advanceKleponStep: () => void;
  resetKleponGame: () => void;

  pieSusuStep: number;
  pieSusuComplete: boolean;
  startPieSusuGame: () => void;
  advancePieSusuStep: () => void;
  resetPieSusuGame: () => void;

  pisangAsarStep: number;
  pisangAsarComplete: boolean;
  startPisangAsarGame: () => void;
  advancePisangAsarStep: () => void;
  resetPisangAsarGame: () => void;

  samaloyangStep: number;
  samaloyangComplete: boolean;
  startSamaloyangGame: () => void;
  advanceSamaloyangStep: () => void;
  resetSamaloyangGame: () => void;

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

  totalSessions: number;
  regionBestScores: RegionBestScores;
  totalBestScore: number;
  totalMerges: number;
  totalQuizzesCorrect: number;
  totalQuizzesAnswered: number;
  unlockedRecipes: string[];
  sessions: UserSession[];
  islandProgress: IslandProgress;
  islandCookingComplete: IslandCookingComplete;
  islandStars: IslandStars;
  islandMerges: IslandMerges;
  loadProfile: () => Promise<void>;
  endSession: (reason: 'board_full' | 'target_reached' | 'quit') => Promise<void>;
  completeIsland: () => Promise<void>;
  completeMinigameCooking: (region: string) => Promise<void>;
  awardStarsForRegion: (region: string) => Promise<void>;

  hasSeenInstructions: boolean;
  setHasSeenInstructions: () => void;
  hasSeenJajanpediaInstructions: boolean;
  setHasSeenJajanpediaInstructions: () => void;

  soundEnabled: boolean;
  toggleSound: () => void;
  isMusicOn: boolean;
  isSfxOn: boolean;
  toggleMusic: () => void;
  toggleSfx: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  currentScreen: 'login',
  setScreen: (screen) => set({ currentScreen: screen }),
  activeRegion: 'jogja',
  setActiveRegion: (region) => set({ activeRegion: region }),
  jajanpediaRegionIndex: 0,
  setJajanpediaRegionIndex: (index) => set({ jajanpediaRegionIndex: index }),

  snacks: [],
  quizzes: [],
  contentLoaded: false,
  loadContent: async () => {
    const [snacks, quizzes] = await Promise.all([
      fetchSnacks(),
      fetchQuizzes(),
    ]);
    set({ snacks, quizzes, contentLoaded: true });
  },

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


  kleponStep: 0,
  kleponComplete: false,
  startKleponGame: () => {
    set({ kleponStep: 0, kleponComplete: false, currentScreen: 'kleponGame' });
  },
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

  pieSusuStep: 0,
  pieSusuComplete: false,
  startPieSusuGame: () => {
    set({ pieSusuStep: 0, pieSusuComplete: false, currentScreen: 'pieSusuGame' });
  },
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

  pisangAsarStep: 0,
  pisangAsarComplete: false,
  startPisangAsarGame: () => {
    set({ pisangAsarStep: 0, pisangAsarComplete: false, currentScreen: 'pisangAsarGame' });
  },
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

  samaloyangStep: 0,
  samaloyangComplete: false,
  startSamaloyangGame: () => {
    set({ samaloyangStep: 0, samaloyangComplete: false, currentScreen: 'samaloyangGame' });
  },
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
      const taken = await checkUsernameExists(username);
      if (taken) {
        set({ authError: 'USERNAME_TAKEN', authLoading: false });
        return;
      }

      let uid: string;
      try {
        uid = await registerWithUsername(username);
      } catch (authErr: unknown) {
        const authMsg = authErr instanceof Error ? authErr.message : '';
        if (authMsg.startsWith('AUTH_EXISTS_UID:')) {
          uid = authMsg.replace('AUTH_EXISTS_UID:', '');
        } else {
          throw authErr;
        }
      }

      await saveUsername(uid, username);
      await createProfile(uid, username);
      const profile = await getProfile(uid);

      set({
        userId: uid,
        username,
        profileIcon: profile?.profileIcon ?? 'Klepon',
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

  completeIsland: async () => {
    const s = get();
    const region = s.activeRegion as keyof IslandProgress;

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

  awardStarsForRegion: async (region: string) => {
    const s = get();
    const key = region as keyof IslandStars;

    const score = s.regionBestScores[key] ?? s.score;

    const earned = calculateStars(region, score);

    if (earned === 0) return;

    const currentStars = s.islandStars[key] as 0 | 1 | 2 | 3;
    if (earned <= currentStars) return;

    const newIslandStars: IslandStars = {
      ...s.islandStars,
      [key]: earned,
    };

    set({ islandStars: newIslandStars });

    if (s.userId) {
      const { saveIslandStars } = await import('../lib/db');
      await saveIslandStars(s.userId, newIslandStars, s.islandMerges);
    }
  },

  completeMinigameCooking: async (region: string) => {
    const s = get();
    const key = region as keyof IslandCookingComplete;

    if (s.islandCookingComplete[key]) return;

    const newCooking: IslandCookingComplete = {
      ...s.islandCookingComplete,
      [key]: true,
    };

    set({ islandCookingComplete: newCooking });

    if (s.userId) {
      await saveProfile(s.userId, { islandCookingComplete: newCooking } as any);
    }
  },

  hasSeenInstructions: false,
  setHasSeenInstructions: () => set({ hasSeenInstructions: true }),
  
  hasSeenJajanpediaInstructions: false,
  setHasSeenJajanpediaInstructions: () => set({ hasSeenJajanpediaInstructions: true }),

  soundEnabled: true,
  toggleSound: () => set(s => ({ soundEnabled: !s.soundEnabled })),
  isMusicOn: true,
  isSfxOn: true,
  toggleMusic: () => set(s => ({ isMusicOn: !s.isMusicOn })),
  toggleSfx: () => set(s => ({ isSfxOn: !s.isSfxOn })),
}));
