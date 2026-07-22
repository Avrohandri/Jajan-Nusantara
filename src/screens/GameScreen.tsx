import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { PhaserGame } from '../game/PhaserGame';
import { EventBus } from '../game/EventBus';
import { QuizModal } from '../features/quiz/QuizModal';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { NpcNotification } from '../components/NpcNotification';
import { IslandPauseConfirm } from '../components/IslandPauseConfirm';

import { REGION_FOOD_CONFIGS } from '../game/characters/FoodConfig';
import pauseBtnImg from '../assets/universal/pause_btn.png';
import latarapauseImg from '../assets/universal/latar_pause.png';
import homeBtnImg from '../assets/universal/home_btn.png';
import continueBtnImg from '../assets/universal/continue_btn.png';
import restartBtnImg from '../assets/universal/restart_btn.png';
import { useSfx } from '../hooks/useSfx';

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
    highestTier: _highestTier,
    seenTiers,
    activeRegion,
  } = useGameStore();
  const { playButtonClick, playDropSfx } = useSfx();

  const currentConfig = REGION_FOOD_CONFIGS[activeRegion] || REGION_FOOD_CONFIGS['jogja'];
  const assetFolder = `foods_${activeRegion}`;

  const [nextItem, setNextItem] = useState<{ tier: number } | null>(null);
  const [showInstructions, setShowInstructions] = useState(!hasSeenInstructions);
  const [showHomeConfirm, setShowHomeConfirm] = useState(false);

  const [transitioning, setTransitioning] = useState(false);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingResultRef = useRef(false);
  const hasTransitionedRef = useRef(false);

  const [gameWidth] = useState(() => Math.min(360, window.innerWidth - 32));
  const [gameHeight] = useState(() => Math.min(560, window.innerHeight - 200));

  useEffect(() => {
    resetGame();

    const handleNextItem = (data: unknown) => {
      const snack = data as { tier: number };
      setNextItem(snack);
      if (snack.tier !== undefined) {
        useGameStore.getState().markTierSeen(snack.tier);
      }
    };

    const handleGameOver = async () => {
      if (useGameStore.getState().isGameOver) return;
      useGameStore.getState().setGameOver();
      await useGameStore.getState().endSession('board_full');
      useGameStore.getState().setScreen('result');
    };

    EventBus.on('next-item', handleNextItem);
    EventBus.on('game-over', handleGameOver);
    return () => {
      EventBus.off('next-item', handleNextItem);
      EventBus.off('game-over', handleGameOver);
    };
  }, [resetGame]);

  useEffect(() => {
    const handleDropSfx = () => playDropSfx();
    EventBus.on('drop-sfx', handleDropSfx);
    return () => {
      EventBus.off('drop-sfx', handleDropSfx);
    };
  }, [playDropSfx]);

  useEffect(() => {
    const doTransition = async () => {
      if (hasTransitionedRef.current) return;
      hasTransitionedRef.current = true;
      setTransitioning(true);
      transitionTimerRef.current = setTimeout(async () => {
        await endSession('target_reached');
        setScreen('result');
      }, 700);
    };

    const handleMaxTier = () => {
      if (useGameStore.getState().showQuiz) {
        pendingResultRef.current = true;
        return;
      }
      transitionTimerRef.current = setTimeout(() => doTransition(), 600);
    };

    EventBus.on('max-tier-reached', handleMaxTier);
    return () => {
      EventBus.off('max-tier-reached', handleMaxTier);
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, [endSession, setScreen]);

  useEffect(() => {
    if (!showQuiz && pendingResultRef.current) {
      pendingResultRef.current = false;
      if (hasTransitionedRef.current) return;
      const doTransition = async () => {
        if (hasTransitionedRef.current) return;
        hasTransitionedRef.current = true;
        setTransitioning(true);
        transitionTimerRef.current = setTimeout(async () => {
          await endSession('target_reached');
          setScreen('result');
        }, 700);
      };
      transitionTimerRef.current = setTimeout(() => doTransition(), 400);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showQuiz]);

  const handlePause = () => {
    playButtonClick();
    setPaused(true);
    EventBus.emit('pause-game');
  };

  const handleResume = () => {
    playButtonClick();
    setPaused(false);
    EventBus.emit('resume-game');
  };

  const handleRestart = () => {
    playButtonClick();
    resetGame();
    EventBus.emit('restart-game');
  };

  const handleEndGame = async () => {
    playButtonClick();
    await endSession(isGameOver ? 'board_full' : 'quit');
    setScreen('result');
  };

  const handleGoToMainMenu = () => {
    playButtonClick();
    setShowHomeConfirm(true);
  };

  const handleConfirmHome = () => {
    playButtonClick();
    resetGame();
    setScreen('mainMenu');
  };

  const dismissInstructions = () => {
    playButtonClick();
    setShowInstructions(false);
    setHasSeenInstructions();
  };

  return (
    <div className="screen game-screen">
      {}
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
            <span className="hud-label">Gabungan</span>
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
                  alt="Petunjuk selanjutnya"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {}
      <div
        className="game-canvas-wrapper"
        style={{ width: gameWidth, height: gameHeight, flex: 'none', backgroundImage: `url('/${activeRegion}BG.png')` }}
      >
        <PhaserGame width={gameWidth} height={gameHeight} />
      </div>

      {}
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

      {}
      <Modal isOpen={showInstructions} title="Cara Bermain 🎮">
        <div className="instructions">
          <p>🤝 <strong>Gabungkan</strong> jajanan yang sama untuk naik ke tier lebih tinggi.</p>
          <p>🧠 Jawab <strong>Kuis</strong> setiap 6 gabungan untuk poin tambahan.</p>
          <p>⚠️ Jangan biarkan jajanan melewati <strong>Garis Merah</strong>!</p>
        </div>
        <Button variant="primary" fullWidth onClick={dismissInstructions}>
          Main Sekarang! 🚀
        </Button>
      </Modal>

      {}
      {showQuiz && <QuizModal />}

      {}

      {}
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
            FINISH
          </button>
          <button
            onClick={async () => {
              playButtonClick();
              useGameStore.getState().setGameOver();
              await endSession('board_full');
              setScreen('result');
            }}
            style={{
              position: 'absolute', top: '50px', right: '20px',
              fontSize: '10px', background: 'rgba(255,0,0,0.5)',
              color: 'white', border: '1px solid rgba(255,255,255,0.3)',
              padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', zIndex: 100
            }}
          >
            GAME OVER
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

          {}
          {showHomeConfirm && (
            <IslandPauseConfirm
              onConfirm={handleConfirmHome}
              onCancel={() => setShowHomeConfirm(false)}
            />
          )}
        </div>
      )}

      {}
      {transitioning && <div className="game-win-flash" aria-hidden="true" />}

      {}
      <NpcNotification />
    </div>
  );
}
