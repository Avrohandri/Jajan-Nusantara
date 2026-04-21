import { useEffect, useState } from 'react';
import { useGameStore } from './store/gameStore';
import { initFirebase, signInAnon, isFirebaseConfigured } from './lib/firebase/config';
import { MainMenuScreen } from './screens/MainMenuScreen';
import { MapSelectScreen } from './screens/MapSelectScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { GameScreen } from './screens/GameScreen';
import { ResultScreen } from './screens/ResultScreen';
import { CookingScreen } from './screens/CookingScreen'; // legacy, kept for fallback
import { KleponMiniGameScreen } from './screens/KleponMiniGameScreen';
import { PieSusuMiniGameScreen } from './screens/PieSusuMiniGameScreen';
import { SamaloyangMiniGameScreen } from './screens/SamaloyangMiniGameScreen';
import { PisangAsarMiniGameScreen } from './screens/PisangAsarMiniGameScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { ColliderTestScreen } from './screens/ColliderTestScreen';
import { JajanpediaScreen } from './screens/JajanpediaScreen';
import { KleponCardScreen } from './screens/KleponCardScreen';
import { CenilCardScreen } from './screens/CenilCardScreen';
import { YangkoCardScreen } from './screens/YangkoCardScreen';
import { GeplakCardScreen } from './screens/GeplakCardScreen';
import { BakpiaCardScreen } from './screens/BakpiaCardScreen';
import { LemperCardScreen } from './screens/LemperCardScreen';
import { TiwulAyuCardScreen } from './screens/TiwulAyuCardScreen';
import { JadahTempeCardScreen } from './screens/JadahTempeCardScreen';

export default function App() {
  const { currentScreen, contentLoaded, loadContent, setUserId } = useGameStore();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    async function init() {
      // Initialize Firebase (will silently skip if not configured)
      initFirebase();

      // Force-clear stale quiz cache (old data without 'region' field)
      try {
        const raw = localStorage.getItem('kuliner_quizzes');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0 && !parsed[0].region) {
            localStorage.removeItem('kuliner_quizzes');
          }
        }
      } catch (_) {}

      // Try anonymous login
      if (isFirebaseConfigured()) {
        const uid = await signInAnon();
        if (uid) setUserId(uid);
      }

      // Load game content (from Firestore or fallback)
      await loadContent();
      setInitializing(false);
    }
    init();
  }, []);

  if (initializing || !contentLoaded) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-emoji">🍡</div>
          <h2>Memuat Kuliner Nusantara...</h2>
          <div className="loading-bar">
            <div className="loading-bar-fill" />
          </div>
          {!isFirebaseConfigured() && (
            <p className="loading-notice">
              Mode lokal — Firebase belum dikonfigurasi
            </p>
          )}
        </div>
      </div>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'mainMenu': return <MainMenuScreen />;
      case 'home': return <MainMenuScreen />; // Redirect old 'home' to MainMenu
      case 'mapSelect': return <MapSelectScreen />;
      case 'settings': return <SettingsScreen />;
      case 'jajanpedia': return <JajanpediaScreen />;
      case 'kleponCard': return <KleponCardScreen />;
      case 'cenilCard': return <CenilCardScreen />;
      case 'yangkoCard': return <YangkoCardScreen />;
      case 'geplakCard': return <GeplakCardScreen />;
      case 'bakpiaCard': return <BakpiaCardScreen />;
      case 'lemperCard': return <LemperCardScreen />;
      case 'tiwulAyuCard': return <TiwulAyuCardScreen />;
      case 'jadahTempeCard': return <JadahTempeCardScreen />;
      case 'game': return <GameScreen />;
      case 'result': return <ResultScreen />;
      case 'cooking': return <CookingScreen />; // legacy
      case 'kleponGame': return <KleponMiniGameScreen />;
      case 'pieSusuGame': return <PieSusuMiniGameScreen />;
      case 'samaloyangGame': return <SamaloyangMiniGameScreen />;
      case 'pisangAsarGame': return <PisangAsarMiniGameScreen />;
      case 'progress': return <ProgressScreen />;
      case 'colliderTest': return <ColliderTestScreen />;
      default: return <MainMenuScreen />;
    }
  };

  return (
    <div className="app-container">
      {renderScreen()}
    </div>
  );
}

