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
}

export interface UserProfile {
  userId: string;
  displayName: string;
  totalSessions: number;
  bestScore: number;
  totalMerges: number;
  totalQuizzesCorrect: number;
  totalQuizzesAnswered: number;
  unlockedRecipes: string[];
  createdAt: number;
  lastPlayedAt: number;
}

// === App State Types ===

export type ScreenName = 'home' | 'mainMenu' | 'mapSelect' | 'settings' | 'jajanpedia' | 'kleponCard' | 'cenilCard' | 'yangkoCard' | 'geplakCard' | 'bakpiaCard' | 'lemperCard' | 'tiwulAyuCard' | 'jadahTempeCard' | 'game' | 'result' | 'cooking' | 'progress' | 'kleponGame' | 'pieSusuGame' | 'samaloyangGame' | 'pisangAsarGame' | 'colliderTest';



