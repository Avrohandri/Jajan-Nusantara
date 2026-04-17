import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from './config';
import { EventBus } from './EventBus';
import { useGameStore } from '../store/gameStore';

interface PhaserGameProps {
  width: number;
  height: number;
  scaleFactor: number;
}

export function PhaserGame({ width, height, scaleFactor }: PhaserGameProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    snacks,
    addScore,
    incrementMerge,
    setGameOver,
    triggerQuiz,
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
        EventBus.emit('set-snacks', { snacks, scaleFactor });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [snacks, scaleFactor]);

  // Listen for game events
  useEffect(() => {
    let mergesSinceQuiz = 0;

    const handleMerge = (data: unknown) => {
      const { tier, points } = data as { tier: number; points: number; name: string };
      addScore(points);
      incrementMerge(tier);
      mergesSinceQuiz++;

      // Trigger quiz every 5 merges
      if (mergesSinceQuiz >= 5) {
        mergesSinceQuiz = 0;
        triggerQuiz();
        EventBus.emit('pause-game');
      }
    };

    const handleGameOver = () => {
      setGameOver();
    };

    EventBus.on('on-merge', handleMerge);
    EventBus.on('game-over', handleGameOver);

    return () => {
      EventBus.off('on-merge', handleMerge);
      EventBus.off('game-over', handleGameOver);
    };
  }, [addScore, incrementMerge, triggerQuiz, setGameOver]);

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
