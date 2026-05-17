import { useRef } from 'react';
import { useGameStore } from '../store/gameStore';

// Pedia (real-photo style) images — from src/assets/pedia (imported as module)
import kleponPedia from '../assets/pedia/klepon.png';
import pieSusuPedia from '../assets/pedia/pie susu.png';
import samaloyangPedia from '../assets/pedia/samaloyang.png';
import pisangAsarPedia from '../assets/pedia/pisang asar.png';

interface RegionFood {
  name: string;
  region: string;
  regionLabel: string;
  flag: string;
  cartoonImg: string;  // from public/assets/foods_xxx/
  realImg: string;     // pedia photo (imported)
  color: string;
  accent: string;
  description: string;
}

const FOODS: RegionFood[] = [
  {
    name: 'Klepon',
    region: 'jogja',
    regionLabel: 'Yogyakarta',
    flag: '🏯',
    cartoonImg: '/assets/foods_jogja/00_Klepon.png',
    realImg: kleponPedia,
    color: '#4CAF50',
    accent: '#2E7D32',
    description: 'Bulatan ketan berisi gula merah, dibalut kelapa parut',
  },
  {
    name: 'Pie Susu',
    region: 'bali',
    regionLabel: 'Bali',
    flag: '🌺',
    cartoonImg: '/assets/foods_bali/02_pie susu.png',
    realImg: pieSusuPedia,
    color: '#FF9800',
    accent: '#E65100',
    description: 'Kue pie lembut berisi custard susu khas Pulau Dewata',
  },
  {
    name: 'Samaloyang',
    region: 'aceh',
    regionLabel: 'Aceh',
    flag: '🕌',
    cartoonImg: '/assets/foods_aceh/00_samaloyang.png',
    realImg: samaloyangPedia,
    color: '#9C27B0',
    accent: '#6A1B9A',
    description: 'Kue goreng renyah manis khas Tanah Rencong',
  },
  {
    name: 'Pisang Asar',
    region: 'maluku',
    regionLabel: 'Maluku',
    flag: '🏝️',
    cartoonImg: '/assets/foods_maluku/06_pisang asar.png',
    realImg: pisangAsarPedia,
    color: '#F44336',
    accent: '#B71C1C',
    description: 'Pisang bakar berbumbu rempah khas Kepulauan Maluku',
  },
];

function FloatingParticle({ style }: { style: React.CSSProperties }) {
  return <div className="ci-particle" style={style} />;
}

export function CookingIntroScreen() {
  const { activeRegion, startKleponGame, startPieSusuGame, startSamaloyangGame, startPisangAsarGame } = useGameStore();

  const currentFood = FOODS.find(f => f.region === activeRegion) ?? FOODS[0];

  function handleStart() {
    switch (activeRegion) {
      case 'jogja':   startKleponGame();      break;
      case 'bali':    startPieSusuGame();     break;
      case 'aceh':    startSamaloyangGame();  break;
      case 'maluku':  startPisangAsarGame();  break;
    }
  }

  // Stable floating particles
  const particles = useRef(
    Array.from({ length: 14 }, (_, i) => ({
      id: i,
      left: 5 + (i * 6.5) % 90,
      top: 5 + (i * 13) % 85,
      size: 6 + (i * 3) % 12,
      delay: (i * 0.35) % 2.8,
      dur: 2.5 + (i * 0.4) % 2,
    }))
  ).current;

  return (
    <div className="ci-overlay" role="dialog" aria-modal="true" aria-label="Minigame memasak selanjutnya">
      {/* Blurred backdrop — uses the game background colour */}
      <div className="ci-backdrop" />

      {/* Floating deco particles */}
      {particles.map(p => (
        <FloatingParticle
          key={p.id}
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
          }}
        />
      ))}

      {/* Main panel */}
      <div className="ci-panel">
        {/* ── Header ── */}
        <div className="ci-header">
          <div className="ci-header-sparkle ci-sparkle--left">✦</div>
          <div className="ci-header-inner">
            <span className="ci-badge">🍳 MINIGAME SELANJUTNYA</span>
            <h1 className="ci-title">Saatnya Memasak!</h1>
          </div>
          <div className="ci-header-sparkle ci-sparkle--right">✦</div>
        </div>

        {/* ── Food cards grid ── */}
        <div className="ci-foods-grid">
          {FOODS.map((food) => {
            const isActive = food.region === activeRegion;
            return (
              <div
                key={food.region}
                className={`ci-food-card ${isActive ? 'ci-food-card--active' : 'ci-food-card--dim'}`}
                style={{ '--card-color': food.color, '--card-accent': food.accent } as React.CSSProperties}
              >
                {/* Active glow ring */}
                {isActive && <div className="ci-active-ring" />}

                {/* Region badge */}
                <div className="ci-region-badge">
                  <span className="ci-region-flag">{food.flag}</span>
                  <span className="ci-region-label">{food.regionLabel}</span>
                </div>

                {/* Images — real (big) + cartoon thumbnail (small) */}
                <div className="ci-images-wrap">
                  <img
                    src={food.realImg}
                    alt={`Foto asli ${food.name}`}
                    className="ci-real-img"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                  <img
                    src={food.cartoonImg}
                    alt={`Kartun ${food.name}`}
                    className="ci-cartoon-img"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>

                {/* Food name */}
                <div className="ci-food-name">{food.name}</div>

                {/* Description — only on active card */}
                {isActive && (
                  <p className="ci-food-desc">{food.description}</p>
                )}

                {/* Active indicator */}
                {isActive && (
                  <div className="ci-now-badge">▶ SEKARANG</div>
                )}
              </div>
            );
          })}
        </div>



        {/* ── Action button ── */}
        <button className="ci-start-btn" onClick={handleStart}>
          <span className="ci-btn-icon">👨‍🍳</span>
          <span>MULAI MEMASAK {currentFood.name.toUpperCase()}!</span>
          <span className="ci-btn-arrow">›</span>
        </button>
      </div>
    </div>
  );
}
