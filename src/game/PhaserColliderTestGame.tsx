import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { createColliderTestConfig } from './config';

interface PhaserColliderTestGameProps {
  width: number;
  height: number;
}

export function PhaserColliderTestGame({ width, height }: PhaserColliderTestGameProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config = createColliderTestConfig(width, height, 'phaser-collider-test-container');
    gameRef.current = new Phaser.Game(config);

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [width, height]);

  return (
    <div
      id="phaser-collider-test-container"
      ref={containerRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: '12px',
        overflow: 'hidden',
        border: '2px solid #555'
      }}
    />
  );
}
