import { create } from 'zustand';
import type { SnackData, QuizData, RecipeData, UserSession, ScreenName } from '../types';
import { fetchSnacks, fetchQuizzes, fetchRecipes, saveSession, saveProfile, getProfile, getSessions } from '../lib/db';

interface GameStore {
  // --- Screen ---
  currentScreen: ScreenName;
  setScreen: (screen: ScreenName) => void;
  activeRegion: string;
  setActiveRegion: (region: string) => void;

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
  triggerQuiz: () => void;
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

  // --- Player Profile ---
  userId: string;
  totalSessions: number;
  bestScore: number;
  totalMerges: number;
  totalQuizzesCorrect: number;
  totalQuizzesAnswered: number;
  unlockedRecipes: string[];
  sessions: UserSession[];
  setUserId: (uid: string) => void;
  loadProfile: () => Promise<void>;
  endSession: (reason: 'board_full' | 'target_reached' | 'quit') => Promise<void>;

  // --- First Launch ---
  hasSeenInstructions: boolean;
  setHasSeenInstructions: () => void;

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
  currentScreen: 'mainMenu',
  setScreen: (screen) => set({ currentScreen: screen }),
  activeRegion: 'jogja',
  setActiveRegion: (region) => set({ activeRegion: region }),

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
    const { quizzes, currentQuizIndex } = get();
    if (quizzes.length === 0) return;
    set({
      showQuiz: true,
      isPaused: true,
      currentQuizIndex: currentQuizIndex % quizzes.length,
    });
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
    set({
      currentRecipe: recipe,
      cookingStep: 0,
      cookingComplete: false,
      currentScreen: 'cooking',
    });
  },
  advanceCookingStep: () => {
    const { currentRecipe, cookingStep } = get();
    if (!currentRecipe) return;
    if (cookingStep + 1 >= currentRecipe.steps.length) {
      // Complete!
      const recipeName = currentRecipe.snackName;
      set(s => ({
        cookingComplete: true,
        cookingStep: cookingStep + 1,
        unlockedRecipes: s.unlockedRecipes.includes(recipeName)
          ? s.unlockedRecipes
          : [...s.unlockedRecipes, recipeName],
      }));
    } else {
      set({ cookingStep: cookingStep + 1 });
    }
  },
  resetCooking: () => set({ currentRecipe: null, cookingStep: 0, cookingComplete: false }),

  // Klepon Mini-Game
  kleponStep: 0,
  kleponComplete: false,
  startKleponGame: () => set({ kleponStep: 0, kleponComplete: false, currentScreen: 'kleponGame' }),
  advanceKleponStep: () => set(s => {
    const nextStep = s.kleponStep + 1;
    if (nextStep >= 5) {
      // All 5 steps done
      return {
        kleponComplete: true,
        kleponStep: nextStep,
        unlockedRecipes: s.unlockedRecipes.includes('Klepon')
          ? s.unlockedRecipes
          : [...s.unlockedRecipes, 'Klepon'],
      };
    }
    return { kleponStep: nextStep };
  }),
  resetKleponGame: () => set({ kleponStep: 0, kleponComplete: false }),

  // Profile
  userId: 'local_player',
  totalSessions: 0,
  bestScore: 0,
  totalMerges: 0,
  totalQuizzesCorrect: 0,
  totalQuizzesAnswered: 0,
  unlockedRecipes: [],
  sessions: [],
  setUserId: (uid) => set({ userId: uid }),
  loadProfile: async () => {
    const { userId } = get();
    const profile = await getProfile(userId);
    const sessions = await getSessions(userId);
    if (profile) {
      set({
        totalSessions: profile.totalSessions || 0,
        bestScore: profile.bestScore || 0,
        totalMerges: profile.totalMerges || 0,
        totalQuizzesCorrect: profile.totalQuizzesCorrect || 0,
        totalQuizzesAnswered: profile.totalQuizzesAnswered || 0,
        unlockedRecipes: profile.unlockedRecipes || [],
      });
    }
    set({ sessions });
  },
  endSession: async (reason) => {
    const s = get();
    const session: UserSession = {
      sessionId: `s_${Date.now()}`,
      startedAt: s.startTime || Date.now(),
      endedAt: Date.now(),
      score: s.score,
      merges: s.mergeCount,
      quizzesCorrect: s.quizzesCorrect,
      quizzesTriggered: s.quizzesTriggered,
      highestTier: s.highestTier,
      endReason: reason,
    };
    await saveSession(s.userId, session);

    const newTotalSessions = s.totalSessions + 1;
    const newBestScore = Math.max(s.bestScore, s.score);
    const newTotalMerges = s.totalMerges + s.mergeCount;
    const newTotalQuizzesCorrect = s.totalQuizzesCorrect + s.quizzesCorrect;
    const newTotalQuizzesAnswered = s.totalQuizzesAnswered + s.quizzesTriggered;

    await saveProfile(s.userId, {
      userId: s.userId,
      displayName: 'Pemain',
      totalSessions: newTotalSessions,
      bestScore: newBestScore,
      totalMerges: newTotalMerges,
      totalQuizzesCorrect: newTotalQuizzesCorrect,
      totalQuizzesAnswered: newTotalQuizzesAnswered,
      unlockedRecipes: s.unlockedRecipes,
      lastPlayedAt: Date.now(),
    });

    set({
      totalSessions: newTotalSessions,
      bestScore: newBestScore,
      totalMerges: newTotalMerges,
      totalQuizzesCorrect: newTotalQuizzesCorrect,
      totalQuizzesAnswered: newTotalQuizzesAnswered,
      sessions: [session, ...s.sessions].slice(0, 20),
    });
  },

  // First launch
  hasSeenInstructions: localStorage.getItem('kuliner_seen_instructions') === 'true',
  setHasSeenInstructions: () => {
    localStorage.setItem('kuliner_seen_instructions', 'true');
    set({ hasSeenInstructions: true });
  },

  // Settings
  soundEnabled: true,
  toggleSound: () => set(s => ({ soundEnabled: !s.soundEnabled })),
  isMusicOn: true,
  isSfxOn: true,
  toggleMusic: () => set(s => ({ isMusicOn: !s.isMusicOn })),
  toggleSfx: () => set(s => ({ isSfxOn: !s.isSfxOn })),
}));
