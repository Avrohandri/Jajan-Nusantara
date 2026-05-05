import React, { Suspense, useEffect, useState } from 'react';
import { useGameStore } from './store/gameStore';
import { initFirebase, isFirebaseConfigured } from './lib/firebase/config';
import { useAudio } from './hooks/useAudio';

// Auth & Loading (Keep static for fast initial load)
import { LoginScreen } from './screens/LoginScreen';

// Lazy loaded main screens
const MainMenuScreen = React.lazy(() => import('./screens/MainMenuScreen').then(m => ({ default: m.MainMenuScreen })));
const MapSelectScreen = React.lazy(() => import('./screens/MapSelectScreen').then(m => ({ default: m.MapSelectScreen })));
const SettingsScreen = React.lazy(() => import('./screens/SettingsScreen').then(m => ({ default: m.SettingsScreen })));
const GameScreen = React.lazy(() => import('./screens/GameScreen').then(m => ({ default: m.GameScreen })));
const ResultScreen = React.lazy(() => import('./screens/ResultScreen').then(m => ({ default: m.ResultScreen })));
const LeaderboardScreen = React.lazy(() => import('./screens/LeaderboardScreen').then(m => ({ default: m.LeaderboardScreen })));
const ProfileScreen = React.lazy(() => import('./screens/ProfileScreen').then(m => ({ default: m.ProfileScreen })));

// Lazy loaded cooking minigames
const CookingScreen = React.lazy(() => import('./screens/CookingScreen').then(m => ({ default: m.CookingScreen })));
const KleponMiniGameScreen = React.lazy(() => import('./screens/KleponMiniGameScreen').then(m => ({ default: m.KleponMiniGameScreen })));
const PieSusuMiniGameScreen = React.lazy(() => import('./screens/PieSusuMiniGameScreen').then(m => ({ default: m.PieSusuMiniGameScreen })));
const SamaloyangMiniGameScreen = React.lazy(() => import('./screens/SamaloyangMiniGameScreen').then(m => ({ default: m.SamaloyangMiniGameScreen })));
const PisangAsarMiniGameScreen = React.lazy(() => import('./screens/PisangAsarMiniGameScreen').then(m => ({ default: m.PisangAsarMiniGameScreen })));

// Other lazy screens
const ProgressScreen = React.lazy(() => import('./screens/ProgressScreen').then(m => ({ default: m.ProgressScreen })));
const ColliderTestScreen = React.lazy(() => import('./screens/ColliderTestScreen').then(m => ({ default: m.ColliderTestScreen })));
const JajanpediaScreen = React.lazy(() => import('./screens/JajanpediaScreen').then(m => ({ default: m.JajanpediaScreen })));

// Lazy loaded Jajanpedia cards
const KleponCardScreen = React.lazy(() => import('./screens/KleponCardScreen').then(m => ({ default: m.KleponCardScreen })));
const CenilCardScreen = React.lazy(() => import('./screens/CenilCardScreen').then(m => ({ default: m.CenilCardScreen })));
const YangkoCardScreen = React.lazy(() => import('./screens/YangkoCardScreen').then(m => ({ default: m.YangkoCardScreen })));
const GeplakCardScreen = React.lazy(() => import('./screens/GeplakCardScreen').then(m => ({ default: m.GeplakCardScreen })));
const BakpiaCardScreen = React.lazy(() => import('./screens/BakpiaCardScreen').then(m => ({ default: m.BakpiaCardScreen })));
const LemperCardScreen = React.lazy(() => import('./screens/LemperCardScreen').then(m => ({ default: m.LemperCardScreen })));
const TiwulAyuCardScreen = React.lazy(() => import('./screens/TiwulAyuCardScreen').then(m => ({ default: m.TiwulAyuCardScreen })));
const JadahTempeCardScreen = React.lazy(() => import('./screens/JadahTempeCardScreen').then(m => ({ default: m.JadahTempeCardScreen })));
const LaklakCardScreen = React.lazy(() => import('./screens/LaklakCardScreen').then(m => ({ default: m.LaklakCardScreen })));
const KaliadremCardScreen = React.lazy(() => import('./screens/KaliadremCardScreen').then(m => ({ default: m.KaliadremCardScreen })));
const PieSusuCardScreen = React.lazy(() => import('./screens/PieSusuCardScreen').then(m => ({ default: m.PieSusuCardScreen })));
const JajeWalikCardScreen = React.lazy(() => import('./screens/JajeWalikCardScreen').then(m => ({ default: m.JajeWalikCardScreen })));
const BenduCardScreen = React.lazy(() => import('./screens/BenduCardScreen').then(m => ({ default: m.BenduCardScreen })));
const JajeUliCardScreen = React.lazy(() => import('./screens/JajeUliCardScreen').then(m => ({ default: m.JajeUliCardScreen })));
const PisangRaiCardScreen = React.lazy(() => import('./screens/PisangRaiCardScreen').then(m => ({ default: m.PisangRaiCardScreen })));
const SamaloyangCardScreen = React.lazy(() => import('./screens/SamaloyangCardScreen').then(m => ({ default: m.SamaloyangCardScreen })));
const TimphanCardScreen = React.lazy(() => import('./screens/TimphanCardScreen').then(m => ({ default: m.TimphanCardScreen })));
const PulotIjoCardScreen = React.lazy(() => import('./screens/PulotIjoCardScreen').then(m => ({ default: m.PulotIjoCardScreen })));
const KeukarahCardScreen = React.lazy(() => import('./screens/KeukarahCardScreen').then(m => ({ default: m.KeukarahCardScreen })));
const BungongKayeeCardScreen = React.lazy(() => import('./screens/BungongKayeeCardScreen').then(m => ({ default: m.BungongKayeeCardScreen })));
const MeuseukatCardScreen = React.lazy(() => import('./screens/MeuseukatCardScreen').then(m => ({ default: m.MeuseukatCardScreen })));
const KueAdeeCardScreen = React.lazy(() => import('./screens/KueAdeeCardScreen').then(m => ({ default: m.KueAdeeCardScreen })));
const KoyabuCardScreen = React.lazy(() => import('./screens/KoyabuCardScreen').then(m => ({ default: m.KoyabuCardScreen })));
const SaguLempengCardScreen = React.lazy(() => import('./screens/SaguLempengCardScreen').then(m => ({ default: m.SaguLempengCardScreen })));
const SaguGulaCardScreen = React.lazy(() => import('./screens/SaguGulaCardScreen').then(m => ({ default: m.SaguGulaCardScreen })));
const TalamSaguBakarCardScreen = React.lazy(() => import('./screens/TalamSaguBakarCardScreen').then(m => ({ default: m.TalamSaguBakarCardScreen })));
const AsidaCardScreen = React.lazy(() => import('./screens/AsidaCardScreen').then(m => ({ default: m.AsidaCardScreen })));
const KueBageaCardScreen = React.lazy(() => import('./screens/KueBageaCardScreen').then(m => ({ default: m.KueBageaCardScreen })));
const PisangAsarCardScreen = React.lazy(() => import('./screens/PisangAsarCardScreen').then(m => ({ default: m.PisangAsarCardScreen })));

// Loading Component
const ScreenFallback = () => (
  <div className="loading-screen" style={{ background: '#FFF8EE' }}>
    <div className="loading-content">
      <div className="loading-emoji">⏳</div>
      <h2 style={{ color: '#8b4513' }}>Memuat...</h2>
    </div>
  </div>
);

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
      <Suspense fallback={<ScreenFallback />}>
        {renderScreen()}
      </Suspense>
    </div>
  );
}
