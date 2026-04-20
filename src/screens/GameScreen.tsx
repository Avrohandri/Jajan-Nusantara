import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { PhaserGame } from '../game/PhaserGame';
import { EventBus } from '../game/EventBus';
import { QuizModal } from '../features/quiz/QuizModal';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { NpcNotification } from '../components/NpcNotification';
import type { SnackData } from '../types';
import { REGION_FOOD_CONFIGS } from '../game/characters/FoodConfig';

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
    snacks,
    highestTier,
    seenTiers,
    activeRegion,
  } = useGameStore();

  const currentConfig = REGION_FOOD_CONFIGS[activeRegion] || REGION_FOOD_CONFIGS['jogja'];
  const assetFolder = `foods_${activeRegion}`;

  const [nextItem, setNextItem] = useState<SnackData | null>(null);
  const [showInstructions, setShowInstructions] = useState(!hasSeenInstructions);

  // Get game canvas dimensions (mobile-first portrait) - Calculate ONCE on mount to prevent game engine restart
  const [gameWidth] = useState(() => Math.min(360, window.innerWidth - 32));
  const [gameHeight] = useState(() => Math.min(560, window.innerHeight - 200));

  useEffect(() => {
    // Reset game state when entering
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

  const dismissInstructions = () => {
    setShowInstructions(false);
    setHasSeenInstructions();
  };

  // Find highest snack name
  const highestSnack = snacks.find(s => s.tier === highestTier);

  return (
    <div className="screen game-screen">
      {/* HUD */}
      <div className="game-hud">
        <div className="hud-left">
          <button onClick={handlePause} className="pause-btn-top">
            ❚❚
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
              <div
                className="next-preview"
                style={{ background: 'none' }}
              >
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
            <div 
              key={item.tier} 
              className={`progress-food ${isUnlocked ? 'unlocked' : 'locked'}`}
            >
              {isUnlocked ? (
                <img src={`/assets/${assetFolder}/${item.textureKey}.png`} alt={item.name} />
              ) : (
                <span style={{color: '#8B7355', fontWeight: 'bold'}}>?</span>
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
            <h2>Permainan Selesai! 🎉</h2>
            <p>Skor Akhir: <strong>{score}</strong></p>
            {highestSnack && (
              <p>Jajanan Tertinggi: {highestSnack.emoji} {highestSnack.name}</p>
            )}
            <br />
            <Button variant="primary" size="lg" fullWidth onClick={handleEndGame}>
              📊 Lihat Hasil
            </Button>
            <div style={{marginTop: 8}}></div>
            <Button variant="danger" size="lg" fullWidth onClick={handleRestart}>
              🔄 Ulang Bermain
            </Button>
          </div>
        </div>
      )}

      {/* Pause Overlay */}
      {isPaused && !showQuiz && !isGameOver && (
        <div className="pause-overlay">
          <div className="pause-content">
            <h2>⏸️ Dijeda</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
              <Button variant="primary" onClick={handleResume}>▶️ Lanjutkan</Button>
              <Button variant="danger" onClick={handleRestart}>🔄 Ulang</Button>
              <Button variant="accent" onClick={handleEndGame}>🏁 Selesai</Button>
            </div>
          </div>
        </div>
      )}

      {/* NPC Notification Overlay */}
      <NpcNotification />
    </div>
  );
}
