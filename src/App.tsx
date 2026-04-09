import { useEffect, useState } from 'react';
import { useGameStore } from './store/gameStore';
import { initFirebase, signInAnon, isFirebaseConfigured } from './lib/firebase/config';
import { HomeScreen } from './screens/HomeScreen';
import { GameScreen } from './screens/GameScreen';
import { ResultScreen } from './screens/ResultScreen';
import { CookingScreen } from './screens/CookingScreen';
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
      case 'home': return <HomeScreen />;
      case 'game': return <GameScreen />;
      case 'result': return <ResultScreen />;
      case 'cooking': return <CookingScreen />;
      case 'progress': return <ProgressScreen />;
      default: return <HomeScreen />;
    }
  };

  return (
    <div className="app-container">
      {renderScreen()}
    </div>
  );
}
