import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { PhaserColliderTestGame } from '../game/PhaserColliderTestGame';
import { Button } from '../components/Button';

export function ColliderTestScreen() {
  const { setScreen } = useGameStore();

  const [gameWidth] = useState(() => Math.min(360, window.innerWidth - 32));
  const [gameHeight] = useState(() => Math.min(560, window.innerHeight - 150));

  return (
    <div className="screen" style={{ flexDirection: 'column', alignItems: 'center', backgroundColor: '#111' }}>
      <div style={{ width: gameWidth, display: 'flex', justifyContent: 'space-between', marginBottom: 10, marginTop: 20 }}>
        <Button variant="danger" size="sm" onClick={() => setScreen('mainMenu')}>
          ⬅ Kembali
        </Button>
      </div>

      <div style={{ width: gameWidth, height: gameHeight, flex: 'none', backgroundColor: '#333', borderRadius: 12 }}>
        <PhaserColliderTestGame width={gameWidth} height={gameHeight} />
      </div>
    </div>
  );
}
