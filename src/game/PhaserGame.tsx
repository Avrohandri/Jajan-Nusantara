import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from './config';
import { EventBus } from './EventBus';
import { useGameStore } from '../store/gameStore';

interface PhaserGameProps {
  width: number;
  height: number;
}

export function PhaserGame({ width, height }: PhaserGameProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    snacks,
  } = useGameStore();

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config = createGameConfig(width, height, 'phaser-container');
    gameRef.current = new Phaser.Game(config);

    return () => {
      EventBus.removeAll();
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [width, height]);

  // Send snack data to Phaser when ready
  useEffect(() => {
    if (snacks.length > 0) {
      // Small delay to let scene initialize
      const timer = setTimeout(() => {
        EventBus.emit('set-snacks', snacks);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [snacks]);

  const mergesSinceQuizRef = useRef(0);

  // Listen for game events
  useEffect(() => {
    const handleMerge = (data: unknown) => {
      const { tier, points } = data as { tier: number; points: number; name: string };
      const store = useGameStore.getState();
      store.addScore(points);
      store.incrementMerge(tier);
      mergesSinceQuizRef.current++;

      // Trigger quiz every 6 merges (6, 12, 18, etc.)
      if (mergesSinceQuizRef.current >= 6) {
        mergesSinceQuizRef.current = 0;
        const triggered = store.triggerQuiz();
        if (triggered) {
          EventBus.emit('pause-game');
        }
      }
    };

    const handleGameOver = () => {
      useGameStore.getState().setGameOver();
    };

    EventBus.on('on-merge', handleMerge);
    EventBus.on('game-over', handleGameOver);

    return () => {
      EventBus.off('on-merge', handleMerge);
      EventBus.off('game-over', handleGameOver);
    };
  }, []); // Empty deps: listener set up once, always reads fresh state via getState()

  return (
    <div
      id="phaser-container"
      ref={containerRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    />
  );
}
