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

/** Bintang per-island. 0 = belum, 1/2/3 = jumlah bintang dari mini game */
export interface IslandStars {
  jogja: 0 | 1 | 2 | 3;
  bali: 0 | 1 | 2 | 3;
  aceh: 0 | 1 | 2 | 3;
  maluku: 0 | 1 | 2 | 3;
}

/** Merge count saat menyelesaikan drop-and-merge per pulau (untuk hitung bintang) */
export interface IslandMerges {
  jogja: number;
  bali: number;
  aceh: number;
  maluku: number;
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
  /** Bintang per pulau — 0=belum, 1/2/3 sesuai performa merge */
  islandStars?: IslandStars;
  /** Jumlah merge terbaik per pulau saat selesai Drop & Merge */
  islandMerges?: IslandMerges;
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
