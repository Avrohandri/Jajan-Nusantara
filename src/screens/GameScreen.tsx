import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { PhaserGame } from '../game/PhaserGame';
import { EventBus } from '../game/EventBus';
import { QuizModal } from '../features/quiz/QuizModal';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { NpcNotification } from '../components/NpcNotification';
import { IslandPauseConfirm } from '../components/IslandPauseConfirm';
import type { SnackData } from '../types';
import { REGION_FOOD_CONFIGS } from '../game/characters/FoodConfig';
import pauseBtnImg from '../assets/universal/pause_btn.png';
import latarapauseImg from '../assets/universal/latar_pause.png';
import homeBtnImg from '../assets/universal/home_btn.png';
import continueBtnImg from '../assets/universal/continue_btn.png';
import restartBtnImg from '../assets/universal/restart_btn.png';

export function GameScreen() {
  const {
    score,
    mergeCount,
    isPaused,
    isGameOver,
    showQuiz,
    hasSeenInstructions,
    setHasSeenInstructions,
    setPaused,
    resetGame,
    setScreen,
    endSession,
    highestTier,
    seenTiers,
    activeRegion,
  } = useGameStore();

  const currentConfig = REGION_FOOD_CONFIGS[activeRegion] || REGION_FOOD_CONFIGS['jogja'];
  const assetFolder = `foods_${activeRegion}`;

  const [nextItem, setNextItem] = useState<SnackData | null>(null);
  const [showInstructions, setShowInstructions] = useState(!hasSeenInstructions);
  const [showHomeConfirm, setShowHomeConfirm] = useState(false);

  // State untuk flash-transisi ke ResultScreen
  const [transitioning, setTransitioning] = useState(false);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Flag: max-tier sudah tercapai tapi masih menunggu quiz selesai
  const pendingResultRef = useRef(false);

  const [gameWidth] = useState(() => Math.min(360, window.innerWidth - 32));
  const [gameHeight] = useState(() => Math.min(560, window.innerHeight - 200));

  useEffect(() => {
    resetGame();

    const handleNextItem = (data: unknown) => {
      const snack = data as SnackData;
      setNextItem(snack);
      if (snack.tier !== undefined) {
        useGameStore.getState().markTierSeen(snack.tier);
      }
    };

    EventBus.on('next-item', handleNextItem);
    return () => {
      EventBus.off('next-item', handleNextItem);
    };
  }, [resetGame]);

  // Saat kuliner tertinggi terbentuk → flash putih → ResultScreen
  useEffect(() => {
    /** Jalankan animasi flash lalu pindah ke result */
    const doTransition = async () => {
      setTransitioning(true);
      transitionTimerRef.current = setTimeout(async () => {
        await endSession('target_reached');
        setScreen('result');
      }, 700);
    };

    const handleMaxTier = () => {
      // Jika quiz sedang terbuka, tunda sampai quiz ditutup
      if (useGameStore.getState().showQuiz) {
        pendingResultRef.current = true;
        return;
      }
      // Beri 600ms agar kuliner hasil merge sempat terlihat
      transitionTimerRef.current = setTimeout(() => doTransition(), 600);
    };

    EventBus.on('max-tier-reached', handleMaxTier);
    return () => {
      EventBus.off('max-tier-reached', handleMaxTier);
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, [endSession, setScreen]);

  // Pantau showQuiz: jika ada pending result dan quiz baru ditutup → lanjut result
  useEffect(() => {
    if (!showQuiz && pendingResultRef.current) {
      pendingResultRef.current = false;
      const doTransition = async () => {
        setTransitioning(true);
        transitionTimerRef.current = setTimeout(async () => {
          await endSession('target_reached');
          setScreen('result');
        }, 700);
      };
      // Beri 400ms setelah quiz tutup agar transisi terasa natural
      transitionTimerRef.current = setTimeout(() => doTransition(), 400);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showQuiz]);

  const handlePause = () => {
    setPaused(true);
    EventBus.emit('pause-game');
  };

  const handleResume = () => {
    setPaused(false);
    EventBus.emit('resume-game');
  };

  const handleRestart = () => {
    resetGame();
    EventBus.emit('restart-game');
  };

  const handleEndGame = async () => {
    await endSession(isGameOver ? 'board_full' : 'quit');
    setScreen('result');
  };

  const handleGoToMainMenu = () => {
    setShowHomeConfirm(true);
  };

  const handleConfirmHome = () => {
    resetGame();
    setScreen('mainMenu');
  };

  const dismissInstructions = () => {
    setShowInstructions(false);
    setHasSeenInstructions();
  };

  const highestFoodName = currentConfig[highestTier]?.name ?? null;

  return (
    <div className="screen game-screen">
      {/* HUD */}
      <div className="game-hud">
        <div className="hud-left">
          <button onClick={handlePause} className="pause-btn-top" aria-label="Pause">
            <img src={pauseBtnImg} alt="Pause" className="pause-btn-img" />
          </button>
          <div className="hud-stat">
            <span className="hud-label">Skor</span>
            <span className="hud-value">{score}</span>
          </div>
          <div className="hud-stat">
            <span className="hud-label">Merge</span>
            <span className="hud-value">{mergeCount}</span>
          </div>
        </div>
        <div className="hud-right">
          {nextItem && (
            <div className="hud-next">
              <span className="hud-label">Berikutnya</span>
              <div className="next-preview" style={{ background: 'none' }}>
                <img
                  src={`/assets/${assetFolder}/${currentConfig[nextItem.tier]?.textureKey || currentConfig[0].textureKey}.png`}
                  alt="Next hint"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Game Canvas */}
      <div
        className="game-canvas-wrapper"
        style={{ width: gameWidth, height: gameHeight, flex: 'none', backgroundImage: `url('/${activeRegion}BG.png')` }}
      >
        <PhaserGame width={gameWidth} height={gameHeight} />
      </div>

      {/* Bottom Controls / Progress */}
      <div className="game-progress-bar">
        {currentConfig.map((item) => {
          const isUnlocked = seenTiers.includes(item.tier);
          return (
            <div key={item.tier} className={`progress-food ${isUnlocked ? 'unlocked' : 'locked'}`}>
              {isUnlocked ? (
                <img src={`/assets/${assetFolder}/${item.textureKey}.png`} alt={item.name} />
              ) : (
                <span style={{ color: '#8B7355', fontWeight: 'bold' }}>?</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Instructions Overlay (first launch only) */}
      <Modal isOpen={showInstructions} title="Cara Bermain 🎮">
        <div className="instructions">
          <p>1. <strong>Sentuh/klik</strong> di area atas untuk menjatuhkan jajanan</p>
          <p>2. <strong>Gabungkan</strong> dua jajanan yang sama untuk naik tier</p>
          <p>3. Setiap <strong>6 merge</strong> akan muncul kuis budaya kuliner</p>
          <p>4. Permainan berakhir jika jajanan melewati garis merah</p>
          <p>5. Raih skor tertinggi!</p>
        </div>
        <Button variant="primary" fullWidth onClick={dismissInstructions}>
          Mengerti! 👍
        </Button>
      </Modal>

      {/* Quiz Modal */}
      {showQuiz && <QuizModal />}

      {/* Game Over Overlay */}
      {isGameOver && !showQuiz && (
        <div className="game-over-overlay">
          <div className="game-over-content">
            <h2>Kamu berhasil meraih skor {score}! 🏆</h2>
            {highestFoodName && (
              <p style={{ fontSize: '14px', color: 'var(--color-text-light)' }}>Jajanan Tertinggi: {highestFoodName}</p>
            )}
            <br />
            <Button variant="primary" size="lg" fullWidth onClick={handleEndGame}>
              📊 Lihat Hasil
            </Button>
            <div style={{ marginTop: 8 }} />
            <Button variant="danger" size="lg" fullWidth onClick={handleRestart}>
              🔄 Ulang Bermain
            </Button>
          </div>
        </div>
      )}

      {/* Pause Overlay */}
      {isPaused && !showQuiz && !isGameOver && (
        <div className="pause-overlay">
          <button
            onClick={handleEndGame}
            style={{
              position: 'absolute', top: '20px', right: '20px',
              fontSize: '10px', background: 'rgba(0,0,0,0.5)',
              color: 'white', border: '1px solid rgba(255,255,255,0.3)',
              padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', zIndex: 100
            }}
          >
            DEBUG FINISH
          </button>
          <div className="pause-content-wood">
            <img src={latarapauseImg} alt="Pause Background" className="pause-bg-img" />
            <div className="pause-buttons-row">
              <button className="pause-action-btn" onClick={handleGoToMainMenu} aria-label="Home">
                <img src={homeBtnImg} alt="Home" />
              </button>
              <button className="pause-action-btn" onClick={handleResume} aria-label="Lanjutkan">
                <img src={continueBtnImg} alt="Lanjutkan" />
              </button>
              <button className="pause-action-btn" onClick={handleRestart} aria-label="Ulang">
                <img src={restartBtnImg} alt="Ulang" />
              </button>
            </div>
          </div>

          {/* Home confirmation dialog */}
          {showHomeConfirm && (
            <IslandPauseConfirm
              onConfirm={handleConfirmHome}
              onCancel={() => setShowHomeConfirm(false)}
            />
          )}
        </div>
      )}

      {/* Flash transisi putih saat kuliner tertinggi tercapai */}
      {transitioning && <div className="game-win-flash" aria-hidden="true" />}

      {/* NPC Notification Overlay */}
      <NpcNotification />
    </div>
  );
}
