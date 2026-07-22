import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from './config';
import { EventBus } from './EventBus';
import { useGameStore } from '../store/gameStore';

const SFX_SRC = '/assets/musik/BUBBLE POP SOUND EFFECT.mp3';

interface PhaserGameProps {
  width: number;
  height: number;
}

export function PhaserGame({ width, height }: PhaserGameProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);


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



  const mergesSinceQuizRef = useRef(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const sfxBufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;

    fetch(SFX_SRC)
      .then(r => r.arrayBuffer())
      .then(buf => ctx.decodeAudioData(buf))
      .then(decoded => {
        sfxBufferRef.current = decoded;
      })
      .catch(() => {});

    return () => {
      ctx.close();
    };
  }, []);

  const playMergeSfx = () => {
    const { isSfxOn } = useGameStore.getState();
    if (!isSfxOn || !audioCtxRef.current || !sfxBufferRef.current) return;

    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    const source = audioCtxRef.current.createBufferSource();
    source.buffer = sfxBufferRef.current;
    source.connect(audioCtxRef.current.destination);
    source.start(0);
  };

  useEffect(() => {
    const handleMerge = (data: unknown) => {
      const { tier, points } = data as { tier: number; points: number; name: string };
      const store = useGameStore.getState();
      store.addScore(points);
      store.incrementMerge(tier);
      mergesSinceQuizRef.current++;

      playMergeSfx();

      if (mergesSinceQuizRef.current >= 6) {
        mergesSinceQuizRef.current = 0;
        const triggered = store.triggerQuiz();
        if (triggered) {
          EventBus.emit('pause-game');
        }
      }
    };

    EventBus.on('on-merge', handleMerge);

    return () => {
      EventBus.off('on-merge', handleMerge);
    };
  }, []);

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
