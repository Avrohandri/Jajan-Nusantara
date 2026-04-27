// === Data Types (matches Firestore document structure) ===

export interface SnackData {
  tier: number;
  name: string;
  emoji: string;
  color: string;
  radius: number;
  points: number;
}

export interface QuizData {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  region?: string;
}

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
  emoji: string;
}

export interface RecipeData {
  snackName: string;
  steps: RecipeStep[];
}

// === Player Data Types ===

export interface UserSession {
  sessionId: string;
  startedAt: number;
  endedAt: number;
  score: number;
  merges: number;
  quizzesCorrect: number;
  quizzesTriggered: number;
  highestTier: number;
  endReason: 'board_full' | 'target_reached' | 'quit';
  region?: string;
}

/** Progress per-island. true = sudah pernah menyelesaikan game di pulau itu */
export interface IslandProgress {
  jogja: boolean;
  bali: boolean;
  aceh: boolean;
  maluku: boolean;
}

/** Skor terbaik per-pulau */
export interface RegionBestScores {
  jogja: number;
  bali: number;
  aceh: number;
  maluku: number;
}

export interface UserProfile {
  userId: string;
  username: string;
  totalSessions: number;
  /** Skor terbaik per-pulau */
  regionBestScores: RegionBestScores;
  /** Total dari semua skor terbaik per-pulau (untuk leaderboard) */
  totalBestScore: number;
  totalMerges: number;
  totalQuizzesCorrect: number;
  totalQuizzesAnswered: number;
  unlockedRecipes: string[];
  islandProgress: IslandProgress;
  /** Icon profil — nama kuliner, misal 'Klepon', 'Pisang Asar', dll */
  profileIcon: string;
  createdAt: number;
  lastPlayedAt: number;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  totalBestScore: number;
  profileIcon: string;
  rank: number;
}

// === App State Types ===

export type ScreenName =
  | 'home'
  | 'login'
  | 'mainMenu'
  | 'mapSelect'
  | 'settings'
  | 'jajanpedia'
  | 'leaderboard'
  | 'profile'
  | 'kleponCard'
  | 'cenilCard'
  | 'yangkoCard'
  | 'geplakCard'
  | 'bakpiaCard'
  | 'lemperCard'
  | 'tiwulAyuCard'
  | 'jadahTempeCard'
  | 'laklakCard'
  | 'kaliadremCard'
  | 'pieSusuCard'
  | 'jajeWalikCard'
  | 'benduCard'
  | 'jajeUliCard'
  | 'pisangRaiCard'
  | 'samaloyangCard'
  | 'timphanCard'
  | 'pulotIjoCard'
  | 'keukarahCard'
  | 'bungongKayeeCard'
  | 'meuseukatCard'
  | 'kueAdeeCard'
  | 'koyabuCard'
  | 'saguLempengCard'
  | 'sagugulaCard'
  | 'talamsaguBakarCard'
  | 'asidaCard'
  | 'kuebageaCard'
  | 'pisangasarCard'
  | 'game'
  | 'result'
  | 'cooking'
  | 'progress'
  | 'kleponGame'
  | 'pieSusuGame'
  | 'samaloyangGame'
  | 'pisangAsarGame'
  | 'colliderTest';
