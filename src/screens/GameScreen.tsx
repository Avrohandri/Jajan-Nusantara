import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { PhaserGame } from '../game/PhaserGame';
import { EventBus } from '../game/EventBus';
import { QuizModal } from '../features/quiz/QuizModal';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import type { SnackData } from '../types';

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
  } = useGameStore();

  const [nextItem, setNextItem] = useState<SnackData | null>(null);
  const [showInstructions, setShowInstructions] = useState(!hasSeenInstructions);

  // Get game canvas dimensions (mobile-first portrait)
  const gameWidth = Math.min(360, window.innerWidth - 32);
  const gameHeight = Math.min(560, window.innerHeight - 200);

  useEffect(() => {
    // Reset game state when entering
    resetGame();

    const handleNextItem = (data: unknown) => {
      setNextItem(data as SnackData);
    };

    EventBus.on('next-item', handleNextItem);

    return () => {
      EventBus.off('next-item', handleNextItem);
    };
  }, []);

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
                style={{ backgroundColor: nextItem.color }}
              >
                {nextItem.emoji}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Game Canvas */}
      <div className="game-canvas-wrapper">
        <PhaserGame width={gameWidth} height={gameHeight} />
      </div>

      {/* Bottom Controls */}
      <div className="game-controls">
        {!isGameOver ? (
          <>
            <Button variant="secondary" size="sm" onClick={isPaused ? handleResume : handlePause}>
              {isPaused ? '▶️ Lanjut' : '⏸️ Jeda'}
            </Button>
            <Button variant="danger" size="sm" onClick={handleRestart}>
              🔄 Ulang
            </Button>
            <Button variant="accent" size="sm" onClick={handleEndGame}>
              🏁 Selesai
            </Button>
          </>
        ) : (
          <Button variant="primary" size="lg" fullWidth onClick={handleEndGame}>
            📊 Lihat Hasil
          </Button>
        )}
      </div>

      {/* Instructions Overlay (first launch only) */}
      <Modal isOpen={showInstructions} title="Cara Bermain 🎮">
        <div className="instructions">
          <p>1. <strong>Sentuh/klik</strong> di area atas untuk menjatuhkan jajanan</p>
          <p>2. <strong>Gabungkan</strong> dua jajanan yang sama untuk naik tier</p>
          <p>3. Setiap <strong>5 merge</strong> akan muncul kuis budaya kuliner</p>
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
          </div>
        </div>
      )}

      {/* Pause Overlay */}
      {isPaused && !showQuiz && !isGameOver && (
        <div className="pause-overlay">
          <div className="pause-content">
            <h2>⏸️ Dijeda</h2>
            <Button variant="primary" onClick={handleResume}>▶️ Lanjutkan</Button>
          </div>
        </div>
      )}
    </div>
  );
}
