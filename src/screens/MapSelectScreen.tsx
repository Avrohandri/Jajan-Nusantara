import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import type { IslandCookingComplete } from '../types';

import levelSelectBg from '../assets/map/level_select_bg.png';
import backButtonImg from '../assets/universal/back button.png';
import starIsiImg from '../assets/universal/star_isi.png';
import starKosongImg from '../assets/universal/star_kosong.png';

interface MapItem {
  id: keyof IslandProgress;
  column: 'left' | 'right';
  bottomPct: number;
  widthPx: number;
  offsetX?: string;
}

const MAP_NODES: MapItem[] = [
  { id: 'jogja',  column: 'right', widthPx: 270, bottomPct: 0  },
  { id: 'bali',   column: 'left',  widthPx: 275, bottomPct: 20 },
  { id: 'aceh',   column: 'right', widthPx: 250, bottomPct: 42 },
  { id: 'maluku', column: 'left',  widthPx: 260, bottomPct: 57 },
];

const COLUMN_POS = {
  left:  '21%',
  right: '77%',
};

/** Pulau bisa dimainkan jika minigame memasak pulau sebelumnya sudah diselesaikan */
function isUnlocked(id: keyof IslandCookingComplete, cooking: IslandCookingComplete): boolean {
  if (id === 'jogja') return true;        // pulau pertama selalu terbuka
  if (id === 'bali')   return cooking.jogja;
  if (id === 'aceh')   return cooking.bali;
  if (id === 'maluku') return cooking.aceh;
  return false;
}

const ISLAND_DISPLAY_NAMES: Record<string, string> = {
  jogja:  'Jogja',
  bali:   'Bali',
  aceh:   'Aceh',
  maluku: 'Maluku',
};

const LOCK_REQUIRES: Record<string, string> = {
  bali:   'Selesaikan Jogja dulu!',
  aceh:   'Selesaikan Bali dulu!',
  maluku: 'Selesaikan Aceh dulu!',
};

export function MapSelectScreen() {
  const { setScreen, resetGame, islandCookingComplete, islandStars } = useGameStore();
  const [toast, setToast] = useState<string | null>(null);

  const handleMapClick = (map: MapItem) => {
    const unlocked = isUnlocked(map.id, islandCookingComplete);
    if (unlocked) {
      useGameStore.getState().setActiveRegion(map.id);
      resetGame();
      setScreen('game');
    } else {
      const msg = LOCK_REQUIRES[map.id] ?? `Selesaikan minigame memasak pulau sebelumnya dulu!`;
      setToast(msg);
      setTimeout(() => setToast(null), 2500);
    }
  };

  return (
    <div className="screen map-select-screen">
      <div className="map-select-bg" aria-hidden>
        <img src={levelSelectBg} alt="" className="map-select-bg-img" />
      </div>

      <div className="map-select-content">
        <button
          type="button"
          className="map-back-minimal"
          onClick={() => setScreen('mainMenu')}
          id="btn-back-map"
          aria-label="Kembali ke menu"
        >
          <img src={backButtonImg} alt="Back" className="map-back-icon-img" />
        </button>

        <div className="map-island-path">
          {MAP_NODES.map((map) => {
            const unlocked = isUnlocked(map.id, islandCookingComplete);
            const stars = islandStars[map.id] ?? 0;
            return (
              <IslandNode
                key={map.id}
                map={map}
                unlocked={unlocked}
                stars={stars}
                columnPos={COLUMN_POS}
                displayName={ISLAND_DISPLAY_NAMES[map.id]}
                onClick={() => handleMapClick(map)}
              />
            );
          })}
        </div>
      </div>

      {toast && (
        <div className="map-toast" role="status">
          🔒 {toast}
        </div>
      )}
    </div>
  );
}

interface IslandNodeProps {
  map: MapItem;
  unlocked: boolean;
  stars: 0 | 1 | 2 | 3;
  columnPos: typeof COLUMN_POS;
  displayName: string;
  onClick: () => void;
}

function IslandNode({ map, unlocked, stars, columnPos, displayName, onClick }: IslandNodeProps) {
  const centerX = map.column === 'left' ? columnPos.left : columnPos.right;

  return (
    <div
      className={`map-island-slot map-island-slot--${map.column}`}
      style={{
        bottom: `${map.bottomPct}%`,
        left: centerX,
        transform: `translateX(calc(-50% + ${map.offsetX ?? '0px'}))`,
      }}
    >
      <button
        type="button"
        className={`map-island-btn ${unlocked ? 'map-island-btn-unlocked' : 'map-island-btn-locked'}`}
        onClick={onClick}
        id={`map-${map.id}`}
        aria-label={displayName}
      >
        <IslandFace
          mapId={map.id}
          locked={!unlocked}
          stars={stars}
          width={`${map.widthPx}px`}
        />
      </button>
    </div>
  );
}

function IslandFace({
  mapId,
  locked,
  stars,
  width,
}: {
  mapId: string;
  locked: boolean;
  stars: 0 | 1 | 2 | 3;
  width: string;
}) {
  const [useFallback, setUseFallback] = useState(false);
  const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
  const src = `${base}map-islands/${mapId}.png`;

  return (
    <span
      className="map-island-face"
      style={{ '--island-width': width } as React.CSSProperties}
    >
      {!useFallback ? (
        <img
          src={src}
          alt=""
          className={`map-island-img${locked ? ' map-island-img--locked' : ''}`}
          style={{ width }}
          onError={() => setUseFallback(true)}
        />
      ) : (
        <span
          className={`map-island-fallback${locked ? ' map-island-fallback--locked' : ''}`}
          style={{ width, display: 'inline-block', minHeight: '80px' }}
          aria-hidden
        />
      )}

      {/* Lock overlay */}
      {locked && (
        <span className="map-island-lock-overlay" aria-hidden>
          🔒
        </span>
      )}

      {/* Star rating - tampil di bawah pulau jika sudah dibuka */}
      {!locked && (
        <div className="map-island-stars" aria-label={`${stars} bintang`}>
          {[1, 2, 3].map((i) => (
            <img
              key={i}
              src={i <= stars ? starIsiImg : starKosongImg}
              alt={i <= stars ? 'bintang terisi' : 'bintang kosong'}
              className="map-star-img"
            />
          ))}
        </div>
      )}
    </span>
  );
}