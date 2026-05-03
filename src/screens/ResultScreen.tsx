import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { calculateStars, STAR_THRESHOLDS } from '../config/starThresholds';

/* Map each region to its mascot image and cooking action */
const REGION_CONFIG: Record<string, {
  mascot: string;
  foodName: string;
  cookAction: () => void;
  cookLabel: string;
}> = {
  jogja: {
    mascot: '/assets/result_mascots/jadahtempe_jempol.png',
    foodName: 'Jadah Tempe',
    cookAction: () => useGameStore.getState().startKleponGame(),
    cookLabel: 'Memasak Klepon',
  },
  bali: {
    mascot: '/assets/result_mascots/pisangrai_jempol.png',
    foodName: 'Pisang Rai',
    cookAction: () => useGameStore.getState().startPieSusuGame(),
    cookLabel: 'Memasak Pie Susu',
  },
  aceh: {
    mascot: '/assets/result_mascots/kue adee_jempol.png',
    foodName: 'Kue Adee',
    cookAction: () => useGameStore.getState().startSamaloyangGame(),
    cookLabel: 'Memasak Samaloyang',
  },
  maluku: {
    mascot: '/assets/result_mascots/pisang asar_jempol.png',
    foodName: 'Pisang Asar',
    cookAction: () => useGameStore.getState().startPisangAsarGame(),
    cookLabel: 'Memasak Pisang Asar',
  },
};

/* Confetti particle data */
const CONFETTI_COLORS = ['#FF6B35', '#FFD166', '#06D6A0', '#118AB2', '#EF476F', '#FFF'];
const CONFETTI_COUNT = 22;

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

/* Komponen bintang — menampilkan 3 ikon bintang, aktif sesuai jumlah earned */
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
  const { activeRegion, completeIsland, score } = useGameStore();
  const config = REGION_CONFIG[activeRegion] ?? REGION_CONFIG['jogja'];

  /* Hitung bintang dari skor sesi ini */
  const earned: 0 | 1 | 2 | 3 = calculateStars(activeRegion, score);
  const threshold = STAR_THRESHOLDS[activeRegion];

  /* Stable confetti */
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

  /* Scroll to top + mark island complete on mount */
  useEffect(() => {
    window.scrollTo(0, 0);
    // Tandai pulau ini sebagai selesai dan update skor/leaderboard di Firestore
    completeIsland();
  }, []);

  return (
    <div className="result-hebat-screen">
      {/* Confetti */}
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

      {/* Top sparkle decoration */}
      <div className="result-top-deco" aria-hidden="true">
        <span className="result-sparkle result-sparkle--lg">✦</span>
        <span className="result-sparkle result-sparkle--sm">✦</span>
        <span className="result-sparkle result-sparkle--md">✦</span>
      </div>

      {/* HEBAT! title */}
      <div className="result-hebat-title-wrap">
        <h1 className="result-hebat-title">HEBAT!</h1>
      </div>

      {/* Subtitle banner */}
      <div className="result-banner-wrap">
        <div className="result-banner">
          <span>Kamu berhasil meraih skor {score.toLocaleString('id-ID')}!</span>
        </div>
      </div>

      {/* Mascot image */}
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

      {/* Star rating */}
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

      {/* Info card */}
      <div className="result-info-card">
        <p className="result-info-main">Sekarang saatnya kita memasak!</p>
        <p className="result-info-sub">Siap jadi koki hebat?</p>
      </div>

      {/* Action buttons */}
      <div className="result-actions-wrap">
        <button
          className="result-lanjut-btn"
          onClick={config.cookAction}
        >
          LANJUT MEMASAK
        </button>
      </div>
    </div>
  );
}
