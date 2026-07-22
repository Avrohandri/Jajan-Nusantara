import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { calculateStars, STAR_THRESHOLDS } from '../config/starThresholds';
import { useSfx } from '../hooks/useSfx';


const CONFETTI_COLORS = ['#FF6B35', '#FFD166', '#06D6A0', '#118AB2', '#EF476F', '#FFF'];
const CONFETTI_COUNT = 22;

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function StarDisplay({ earned }: { earned: 0 | 1 | 2 | 3 }) {
  return (
    <div className="result-stars-row" aria-label={`${earned} dari 3 bintang`}>
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={`result-star-icon ${n <= earned ? 'result-star-icon--filled' : 'result-star-icon--empty'}`}
          style={{ animationDelay: `${(n - 1) * 0.12}s` }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export function ResultScreen() {
  const { activeRegion, completeIsland, score, setScreen, isGameOver, resetGame } = useGameStore();
  const { playButtonClick } = useSfx();

  const REGION_CONFIG: Record<string, {
    mascot: string;
    foodName: string;
    cookAction: () => void;
    cookLabel: string;
  }> = {
    jogja: {
      mascot: '/assets/result_mascots/jadahtempe_jempol.png',
      foodName: 'Jadah Tempe',
      cookAction: () => setScreen('cookingIntro'),
      cookLabel: 'Memasak Klepon',
    },
    bali: {
      mascot: '/assets/result_mascots/pisangrai_jempol.png',
      foodName: 'Pisang Rai',
      cookAction: () => setScreen('cookingIntro'),
      cookLabel: 'Memasak Pie Susu',
    },
    aceh: {
      mascot: '/assets/result_mascots/kue adee_jempol.png',
      foodName: 'Kue Adee',
      cookAction: () => setScreen('cookingIntro'),
      cookLabel: 'Memasak Samaloyang',
    },
    maluku: {
      mascot: '/assets/result_mascots/pisang asar_jempol.png',
      foodName: 'Pisang Asar',
      cookAction: () => setScreen('cookingIntro'),
      cookLabel: 'Memasak Pisang Asar',
    },
  };

  const config = REGION_CONFIG[activeRegion] ?? REGION_CONFIG['jogja'];

  const earned: 0 | 1 | 2 | 3 = calculateStars(activeRegion, score);
  const threshold = STAR_THRESHOLDS[activeRegion];

  const confettiRef = useRef(
    Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
      id: i,
      left: randomBetween(2, 98),
      delay: randomBetween(0, 2.5),
      duration: randomBetween(2.2, 3.8),
      size: randomBetween(8, 16),
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      rotate: randomBetween(0, 360),
      wide: Math.random() > 0.5,
    }))
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!isGameOver) {
      completeIsland();
    }
  }, [isGameOver, completeIsland]);

  if (isGameOver) {
    return (
      <div className="result-hebat-screen" style={{ background: 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)' }}>
        <div className="result-hebat-title-wrap" style={{ marginTop: '40px' }}>
          <h1 className="result-hebat-title" style={{ color: '#ff4d4d', textShadow: '0px 4px 0px #b30000, 0px 8px 15px rgba(0,0,0,0.5)' }}>YAAH...</h1>
        </div>
        
        <div className="result-banner-wrap">
          <div className="result-banner" style={{ background: '#333', color: '#fff' }}>
            <span>Wadah jajananmu sudah penuh!</span>
          </div>
        </div>


        <div className="result-banner-wrap" style={{ marginTop: '20px' }}>
          <div className="result-banner" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '1.2rem', padding: '12px 24px' }}>
            <span>Skor kamu: {score.toLocaleString('id-ID')}</span>
          </div>
        </div>

        <div className="result-info-card" style={{ background: '#333', border: '3px solid #555' }}>
          <p className="result-info-main" style={{ color: '#fff' }}>Jangan menyerah!</p>
          <p className="result-info-sub" style={{ color: '#ccc' }}>Ayo coba lagi dan kumpulkan jajanan yang lebih besar.</p>
        </div>

        <div className="result-actions-wrap" style={{ flexDirection: 'column', gap: '12px', paddingBottom: '40px' }}>
          <button
            className="result-lanjut-btn"
            style={{ background: 'linear-gradient(180deg, #ff6b35 0%, #cc4a1a 100%)', boxShadow: '0 6px 0 #993311' }}
            onClick={() => { playButtonClick(); resetGame(); setScreen('game'); }}
          >
            MAIN LAGI
          </button>
          <button
            className="result-lanjut-btn"
            style={{ background: 'linear-gradient(180deg, #4ade80 0%, #16a34a 100%)', boxShadow: '0 6px 0 #15803d' }}
            onClick={() => { playButtonClick(); resetGame(); setScreen('mapSelect'); }}
          >
            PILIH DAERAH
          </button>
          <button
            className="result-lanjut-btn"
            style={{ background: 'linear-gradient(180deg, #9ca3af 0%, #4b5563 100%)', boxShadow: '0 6px 0 #374151' }}
            onClick={() => { playButtonClick(); resetGame(); setScreen('mainMenu'); }}
          >
            MENU UTAMA
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="result-hebat-screen">
      {}
      <div className="result-confetti-layer" aria-hidden="true">
        {confettiRef.current.map((p) => (
          <div
            key={p.id}
            className="result-confetti-piece"
            style={{
              left: `${p.left}%`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              width: p.wide ? p.size * 1.8 : p.size,
              height: p.size,
              background: p.color,
              transform: `rotate(${p.rotate}deg)`,
            }}
          />
        ))}
      </div>

      {}
      <div className="result-top-deco" aria-hidden="true">
        <span className="result-sparkle result-sparkle--lg">✦</span>
        <span className="result-sparkle result-sparkle--sm">✦</span>
        <span className="result-sparkle result-sparkle--md">✦</span>
      </div>

      {}
      <div className="result-hebat-title-wrap">
        <h1 className="result-hebat-title">HEBAT!</h1>
      </div>

      {}
      <div className="result-banner-wrap">
        <div className="result-banner">
          <span>Kamu berhasil meraih skor {score.toLocaleString('id-ID')}!</span>
        </div>
      </div>

      {}
      <div className="result-mascot-wrap">
        <div className="result-mascot-glow" aria-hidden="true" />
        <img
          src={config.mascot}
          alt={`Maskot ${config.foodName} jempol`}
          className="result-mascot-img"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.opacity = '0';
          }}
        />
        <span className="result-side-spark result-side-spark--left">✨</span>
        <span className="result-side-spark result-side-spark--right">⭐</span>
      </div>

      {}
      <div className="result-star-section">
        <StarDisplay earned={earned} />
        {threshold && (
          <div className="result-star-hint">
            <span>⭐ &gt;= {threshold.star1.toLocaleString('id-ID')}</span>
            <span>⭐⭐ &gt;= {threshold.star2.toLocaleString('id-ID')}</span>
            <span>⭐⭐⭐ &gt;= {threshold.star3.toLocaleString('id-ID')}</span>
          </div>
        )}
      </div>

      {}
      <div className="result-info-card">
        <p className="result-info-main">Sekarang saatnya kita memasak!</p>
        <p className="result-info-sub">Siap jadi koki hebat?</p>
      </div>

      {}
      <div className="result-actions-wrap">
        <button
          className="result-lanjut-btn"
          onClick={() => { playButtonClick(); config.cookAction(); }}
        >
          LANJUT MEMASAK
        </button>
      </div>
    </div>
  );
}
