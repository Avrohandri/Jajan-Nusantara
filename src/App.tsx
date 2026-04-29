import { useEffect, useState } from 'react';
import { useGameStore } from './store/gameStore';
import { initFirebase, isFirebaseConfigured } from './lib/firebase/config';
import { useAudio } from './hooks/useAudio';

// Auth
import { LoginScreen } from './screens/LoginScreen';
import { ProfileScreen } from './screens/ProfileScreen';

// Main screens
import { MainMenuScreen } from './screens/MainMenuScreen';
import { MapSelectScreen } from './screens/MapSelectScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { GameScreen } from './screens/GameScreen';
import { ResultScreen } from './screens/ResultScreen';
import { LeaderboardScreen } from './screens/LeaderboardScreen';

// Cooking
import { CookingScreen } from './screens/CookingScreen';
import { KleponMiniGameScreen } from './screens/KleponMiniGameScreen';
import { PieSusuMiniGameScreen } from './screens/PieSusuMiniGameScreen';
import { SamaloyangMiniGameScreen } from './screens/SamaloyangMiniGameScreen';
import { PisangAsarMiniGameScreen } from './screens/PisangAsarMiniGameScreen';

// Other screens
import { ProgressScreen } from './screens/ProgressScreen';
import { ColliderTestScreen } from './screens/ColliderTestScreen';
import { JajanpediaScreen } from './screens/JajanpediaScreen';

// Jajanpedia cards
import { KleponCardScreen } from './screens/KleponCardScreen';
import { CenilCardScreen } from './screens/CenilCardScreen';
import { YangkoCardScreen } from './screens/YangkoCardScreen';
import { GeplakCardScreen } from './screens/GeplakCardScreen';
import { BakpiaCardScreen } from './screens/BakpiaCardScreen';
import { LemperCardScreen } from './screens/LemperCardScreen';
import { TiwulAyuCardScreen } from './screens/TiwulAyuCardScreen';
import { JadahTempeCardScreen } from './screens/JadahTempeCardScreen';
import { LaklakCardScreen } from './screens/LaklakCardScreen';
import { KaliadremCardScreen } from './screens/KaliadremCardScreen';
import { PieSusuCardScreen } from './screens/PieSusuCardScreen';
import { JajeWalikCardScreen } from './screens/JajeWalikCardScreen';
import { BenduCardScreen } from './screens/BenduCardScreen';
import { JajeUliCardScreen } from './screens/JajeUliCardScreen';
import { PisangRaiCardScreen } from './screens/PisangRaiCardScreen';
import { SamaloyangCardScreen } from './screens/SamaloyangCardScreen';
import { TimphanCardScreen } from './screens/TimphanCardScreen';
import { PulotIjoCardScreen } from './screens/PulotIjoCardScreen';
import { KeukarahCardScreen } from './screens/KeukarahCardScreen';
import { BungongKayeeCardScreen } from './screens/BungongKayeeCardScreen';
import { MeuseukatCardScreen } from './screens/MeuseukatCardScreen';
import { KueAdeeCardScreen } from './screens/KueAdeeCardScreen';
import { KoyabuCardScreen } from './screens/KoyabuCardScreen';
import { SaguLempengCardScreen } from './screens/SaguLempengCardScreen';
import { SaguGulaCardScreen } from './screens/SaguGulaCardScreen';
import { TalamSaguBakarCardScreen } from './screens/TalamSaguBakarCardScreen';
import { AsidaCardScreen } from './screens/AsidaCardScreen';
import { KueBageaCardScreen } from './screens/KueBageaCardScreen';
import { PisangAsarCardScreen } from './screens/PisangAsarCardScreen';

export default function App() {
  const { currentScreen, isLoggedIn, contentLoaded, loadContent } = useGameStore();
  const [initializing, setInitializing] = useState(true);

  // 🎵 Global audio manager — BGM loop + SFX drop/merge
  useAudio();

  useEffect(() => {
    async function init() {
      // Initialize Firebase
      initFirebase();

      // Force-clear stale quiz cache
      try {
        const raw = localStorage.getItem('kuliner_quizzes');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0 && !parsed[0].region) {
            localStorage.removeItem('kuliner_quizzes');
          }
        }
      } catch (_) {}

      // Load game content
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

  // Jika belum login, selalu tampilkan layar login
  if (!isLoggedIn) {
    return (
      <div className="app-container">
        <LoginScreen />
      </div>
    );
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login': return <LoginScreen />;
      case 'mainMenu':
      case 'home': return <MainMenuScreen />;
      case 'mapSelect': return <MapSelectScreen />;
      case 'settings': return <SettingsScreen />;
      case 'jajanpedia': return <JajanpediaScreen />;
      case 'leaderboard': return <LeaderboardScreen />;
      case 'profile': return <ProfileScreen />;
      case 'kleponCard': return <KleponCardScreen />;
      case 'cenilCard': return <CenilCardScreen />;
      case 'yangkoCard': return <YangkoCardScreen />;
      case 'geplakCard': return <GeplakCardScreen />;
      case 'bakpiaCard': return <BakpiaCardScreen />;
      case 'lemperCard': return <LemperCardScreen />;
      case 'tiwulAyuCard': return <TiwulAyuCardScreen />;
      case 'jadahTempeCard': return <JadahTempeCardScreen />;
      case 'laklakCard': return <LaklakCardScreen />;
      case 'kaliadremCard': return <KaliadremCardScreen />;
      case 'pieSusuCard': return <PieSusuCardScreen />;
      case 'jajeWalikCard': return <JajeWalikCardScreen />;
      case 'benduCard': return <BenduCardScreen />;
      case 'jajeUliCard': return <JajeUliCardScreen />;
      case 'pisangRaiCard': return <PisangRaiCardScreen />;
      case 'samaloyangCard': return <SamaloyangCardScreen />;
      case 'timphanCard': return <TimphanCardScreen />;
      case 'pulotIjoCard': return <PulotIjoCardScreen />;
      case 'keukarahCard': return <KeukarahCardScreen />;
      case 'bungongKayeeCard': return <BungongKayeeCardScreen />;
      case 'meuseukatCard': return <MeuseukatCardScreen />;
      case 'kueAdeeCard': return <KueAdeeCardScreen />;
      case 'koyabuCard': return <KoyabuCardScreen />;
      case 'saguLempengCard': return <SaguLempengCardScreen />;
      case 'sagugulaCard': return <SaguGulaCardScreen />;
      case 'talamsaguBakarCard': return <TalamSaguBakarCardScreen />;
      case 'asidaCard': return <AsidaCardScreen />;
      case 'kuebageaCard': return <KueBageaCardScreen />;
      case 'pisangasarCard': return <PisangAsarCardScreen />;
      case 'game': return <GameScreen />;
      case 'result': return <ResultScreen />;
      case 'cooking': return <CookingScreen />;
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
