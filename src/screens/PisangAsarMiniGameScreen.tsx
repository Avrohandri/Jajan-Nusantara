import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { StepIngredientSelection } from '../features/pisangasar/StepIngredientSelection';
import { StepCutBanana } from '../features/pisangasar/StepCutBanana';
import { StepMixTopping } from '../features/pisangasar/StepMixTopping';
import { StepSpreadTopping } from '../features/pisangasar/StepSpreadTopping';
import { StepBakeOven } from '../features/pisangasar/StepBakeOven';
import { MiniGameBackConfirm } from '../components/MiniGameBackConfirm';
import backButtonImg from '../assets/universal/back button.png';

const STEPS = [
  { label: '', desc: '' },
  { label: 'Potong Pisang', desc: 'Belah pisang menjadi dua bagian' },
  { label: 'Campur Topping', desc: '' },
  { label: 'Oles Topping', desc: 'Oleskan topping ke pisang' },
  { label: 'Panggang', desc: 'Masukkan pisang ke dalam oven' },
];

export function PisangAsarMiniGameScreen() {
  const { pisangAsarStep, pisangAsarComplete, advancePisangAsarStep, resetPisangAsarGame, setScreen, awardStarsForRegion, completeMinigameCooking } = useGameStore();
  const [showBackConfirm, setShowBackConfirm] = useState(false);

  const handleBack = () => setShowBackConfirm(true);
  const handleConfirmBack = () => {
    resetPisangAsarGame();
    setScreen('mainMenu');
  };

  // Award stars + unlock pulau berikutnya saat pisang asar selesai
  useEffect(() => {
    if (pisangAsarComplete) {
      awardStarsForRegion('maluku');
      completeMinigameCooking('maluku');
    }
  }, [pisangAsarComplete]);

  /* ── Complete screen ── */
  if (pisangAsarComplete) {
    return (
      <div className="klepon-root">
        <img src="/assets/klepon/bg_kitchen.png" alt="" className="klepon-bg" />
        <div className="klepon-complete-screen">
          <div className="complete-confetti">✨✨✨</div>
          <img src="/assets/pisang_asar/pisang_asar.png" alt="Pisang Asar Selesai" className="complete-klepon-img" />
          <h1 className="complete-title">Pisang Asar Selesai!</h1>
          <p className="complete-subtitle">
            Kamu berhasil membuat Pisang Asar khas Maluku yang manis dan gurih!
          </p>
          <div className="complete-facts">
            <div className="fact-bubble">
              🌴 Pisang Asar adalah camilan khas Maluku yang terbuat dari pisang yang dibakar dengan isian campuran kenari dan gula aren.
            </div>
          </div>
          <div className="complete-actions">
            <button className="btn btn-primary btn-lg btn-full" onClick={() => setScreen('mainMenu')}>
              🏠 Kembali ke Menu
            </button>
            <button className="btn btn-secondary btn-full"
              onClick={() => { resetPisangAsarGame(); useGameStore.getState().startPisangAsarGame(); }}>
              🔄 Main Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Game screen ── */
  return (
    <div className="klepon-root">
      {/* Background kitchen */}
      <img src="/assets/klepon/bg_kitchen.png" alt="" className="klepon-bg" />

      {/* ── Header bar ── */}
      <div className="klepon-topbar">
        <button className="klepon-back-btn" onClick={handleBack} title="Kembali">
          <img src={backButtonImg} alt="Back" className="klepon-back-icon-img" />
        </button>
        <div className="klepon-topbar-title">
          <img src="/assets/foods_maluku/06_pisang asar.png" alt="icon" style={{ height: '32px', marginRight: '8px', objectFit: 'contain' }} onError={(e) => { e.currentTarget.outerHTML = '<span style="font-size: 24px; margin-right: 8px;">🍌</span>'; }} />
          <span>Bikin Pisang Asar</span>
        </div>
      </div>

      {/* ── Step dots ── */}
      <div className="klepon-step-dots">
        {STEPS.map((_, idx) => (
          <div
            key={idx}
            className={`kstep-dot ${idx < pisangAsarStep ? 'kstep-done' :
              idx === pisangAsarStep ? 'kstep-active' :
                'kstep-pending'
              }`}
          >
            {idx < pisangAsarStep ? '✓' : idx + 1}
          </div>
        ))}
      </div>

      {/* ── Step content ── */}
      <div className="klepon-generic-card">
        {pisangAsarStep !== 0 && (
          <div className="klepon-generic-header">
            <h2 className="klepon-generic-title">{STEPS[pisangAsarStep]?.label}</h2>
            <p className="klepon-generic-desc">{STEPS[pisangAsarStep]?.desc}</p>
          </div>
        )}
        <div className="klepon-generic-body" style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {pisangAsarStep === 0 && <StepIngredientSelection onComplete={advancePisangAsarStep} />}
          {pisangAsarStep === 1 && <StepCutBanana onComplete={advancePisangAsarStep} />}
          {pisangAsarStep === 2 && <StepMixTopping onComplete={advancePisangAsarStep} />}
          {pisangAsarStep === 3 && <StepSpreadTopping onComplete={advancePisangAsarStep} />}
          {pisangAsarStep === 4 && <StepBakeOven onComplete={advancePisangAsarStep} />}
        </div>
      </div>

      {/* Back confirm dialog */}
      {showBackConfirm && (
        <MiniGameBackConfirm
          foodName="Pisang Asar"
          onConfirm={handleConfirmBack}
          onCancel={() => setShowBackConfirm(false)}
        />
      )}
    </div>
  );
}
