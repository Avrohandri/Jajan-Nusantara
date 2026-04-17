import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { PhaserColliderTestGame } from '../game/PhaserColliderTestGame';
import { Button } from '../components/Button';
import { EventBus } from '../game/EventBus';

const REGIONS = ['jogja', 'bali', 'aceh', 'maluku'];

export function ColliderTestScreen() {
  const { setScreen } = useGameStore();

  const [gameWidth] = useState(() => Math.min(360, window.innerWidth - 32));
  const [gameHeight] = useState(() => Math.min(560, window.innerHeight - 150));
  const [activeTab, setActiveTab] = useState('jogja');

  // When tab changes, tell the scene to respawn
  useEffect(() => {
    EventBus.emit('collider-change-region', activeTab);
  }, [activeTab]);

  return (
    <div className="screen" style={{ flexDirection: 'column', alignItems: 'center', backgroundColor: '#111' }}>
      <div style={{ width: gameWidth, display: 'flex', justifyContent: 'space-between', marginBottom: 10, marginTop: 20 }}>
        <Button variant="danger" size="sm" onClick={() => setScreen('mainMenu')}>
          ⬅ Kembali
        </Button>
      </div>

      {/* Tabs */}
      <div style={{ width: gameWidth, display: 'flex', gap: '8px', marginBottom: 10, flexWrap: 'wrap' }}>
        {REGIONS.map(region => (
          <Button
            key={region}
            variant={activeTab === region ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setActiveTab(region)}
            style={{ textTransform: 'capitalize', flexGrow: 1 }}
          >
            {region}
          </Button>
        ))}
      </div>

      <div style={{ width: gameWidth, height: gameHeight, flex: 'none', backgroundColor: '#333', borderRadius: 12 }}>
        <PhaserColliderTestGame width={gameWidth} height={gameHeight} />
      </div>
    </div>
  );
}
