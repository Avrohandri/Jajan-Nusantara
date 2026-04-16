import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

import levelSelectBg from '../assets/map/level_select_bg.png';

// ============================================================
// KONFIGURASI PULAU — ubah sesuai kebutuhan Anda
// ============================================================

interface MapItem {
  id: string;
  unlocked: boolean;
  column: 'left' | 'right';
  bottomPct: number;
  /** Lebar pulau dalam px — ubah angka ini untuk resize tiap pulau */
  widthPx: number;
  offsetX?: string;
}

// ╔══════════════════════════════════════════════════════════╗
// ║          UBAH UKURAN & POSISI TIAP PULAU DI SINI        ║
// ╠══════════════════════════════════════════════════════════╣
// ║  widthPx  → ukuran pulau dalam pixel                    ║
// ║  bottomPct→ posisi vertikal (0=bawah, 100=atas)         ║
// ║  column   → 'left' atau 'right'                         ║
// ║  offsetX  → geser kiri/kanan tambahan, misal '-10px'    ║
// ╚══════════════════════════════════════════════════════════╝
const MAP_NODES: MapItem[] = [
  //         ukuran    posisi vertikal
  { id: 'jogja',  unlocked: true,  column: 'right', widthPx: 270, bottomPct: 0  },
  { id: 'bali',   unlocked: false, column: 'left',  widthPx: 275, bottomPct: 20 },
  { id: 'aceh',   unlocked: false, column: 'right', widthPx: 250, bottomPct: 42 },
  { id: 'maluku', unlocked: false, column: 'left',  widthPx: 260, bottomPct: 57 },
];

// Posisi kolom kiri/kanan (% dari kiri layar)
const COLUMN_POS = {
  left:  '21%',
  right: '77%',
};

function scaledWidth(node: MapItem): string {
  return `${node.widthPx}px`;
}
// ============================================================

export function MapSelectScreen() {
  const { setScreen, resetGame } = useGameStore();
  const [toast, setToast] = useState<string | null>(null);

  const handleMapClick = (map: MapItem) => {
    if (map.unlocked) {
      resetGame();
      setScreen('game');
    } else {
      setToast('Segera Hadir!');
      setTimeout(() => setToast(null), 1800);
    }
  };

  return (
    <div className="screen map-select-screen">
      {/* Background */}
      <div className="map-select-bg" aria-hidden>
        <img src={levelSelectBg} alt="" className="map-select-bg-img" />
      </div>

      <div className="map-select-content">
        {/* Tombol kembali */}
        <button
          type="button"
          className="map-back-minimal"
          onClick={() => setScreen('mainMenu')}
          id="btn-back-map"
          aria-label="Kembali ke menu"
        >
          <span aria-hidden>←</span>
        </button>

        {/* Area jalur pulau */}
        <div className="map-island-path">
          {MAP_NODES.map((map) => (
            <IslandNode
              key={map.id}
              map={map}
              columnPos={COLUMN_POS}
              onClick={() => handleMapClick(map)}
            />
          ))}
        </div>
      </div>

      {toast && (
        <div className="map-toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}

// ─── Sub-komponen ────────────────────────────────────────────

interface IslandNodeProps {
  map: MapItem;
  columnPos: typeof COLUMN_POS;
  onClick: () => void;
}

function IslandNode({ map, columnPos, onClick }: IslandNodeProps) {
  const centerX = map.column === 'left' ? columnPos.left : columnPos.right;

  return (
    <div
      className={`map-island-slot map-island-slot--${map.column}`}
      style={{
        bottom: `${map.bottomPct}%`,
        // Posisi horizontal: geser dari kiri, lalu koreksi dengan translateX
        // agar pusat gambar tepat di centerX, bukan tepi kirinya.
        left: centerX,
        transform: `translateX(calc(-50% + ${map.offsetX ?? '0px'}))`,
      }}
    >
      <button
        type="button"
        className={`map-island-btn ${
          map.unlocked ? 'map-island-btn-unlocked' : 'map-island-btn-locked'
        }`}
        onClick={onClick}
        id={`map-${map.id}`}
        aria-label={map.id}
      >
        <IslandFace mapId={map.id} locked={!map.unlocked} width={scaledWidth(map)} />
      </button>
    </div>
  );
}

function IslandFace({
  mapId,
  locked,
  width,
}: {
  mapId: string;
  locked: boolean;
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
    </span>
  );
}