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
import { ProgressScreen } from './screens/ProgressScreen';

export default function App() {
  const { currentScreen, contentLoaded, loadContent, setUserId } = useGameStore();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    async function init() {
      // Initialize Firebase (will silently skip if not configured)
      initFirebase();

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
      case 'jajanpedia': return <MainMenuScreen />; // Placeholder — will be built later
      case 'game': return <GameScreen />;
      case 'result': return <ResultScreen />;
      case 'cooking': return <CookingScreen />; // legacy
      case 'kleponGame': return <KleponMiniGameScreen />;
      case 'progress': return <ProgressScreen />;
      default: return <MainMenuScreen />;
    }
  };

  return (
    <div className="app-container">
      {renderScreen()}
    </div>
  );
}
