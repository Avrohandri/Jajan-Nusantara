import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { StepIngredients } from '../features/klepon/StepIngredients';
import { StepMixing } from '../features/klepon/StepMixing';
import { StepShaping } from '../features/klepon/StepShaping';
import { StepSteaming } from '../features/klepon/StepSteaming';
import { StepCoating } from '../features/klepon/StepCoating';
import backButtonImg from '../assets/universal/back button.png';

const STEPS = [
  { label: '🌾 Pilih Bahan',    desc: 'Pilih bahan yang tepat'   },
  { label: '🥄 Aduk Adonan',    desc: 'Campur hingga merata'      },
  { label: 'Bentuk Klepon',  desc: 'Bulatkan & isi gula merah' },
  { label: 'Kukus Klepon',   desc: 'Kukus hingga matang'       },
  { label: 'Taburi Kelapa',  desc: 'Balut dengan kelapa parut' },
];

export function KleponMiniGameScreen() {
  const { kleponStep, kleponComplete, advanceKleponStep, resetKleponGame, setScreen, awardStarsForRegion } = useGameStore();

  const handleBack = () => {
    resetKleponGame();
    setScreen('mainMenu');
  };

  // Award stars saat klepon selesai
  useEffect(() => {
    if (kleponComplete) {
      awardStarsForRegion('jogja');
    }
  }, [kleponComplete]);

  /* ── Complete screen ── */
  if (kleponComplete) {
    return (
      <div className="klepon-root">
        <img src="/assets/klepon/bg_kitchen.png" alt="" className="klepon-bg" />
        <div className="klepon-complete-screen">
          <div className="complete-confetti">✨✨✨</div>
          <img src="/assets/klepon/klepon_jadi.png" alt="Klepon Selesai" className="complete-klepon-img" />
          <h1 className="complete-title">Klepon Selesai!</h1>
          <p className="complete-subtitle">
            Kamu berhasil membuat Klepon Pandan dengan sempurna!
          </p>
          <div className="complete-facts">
            <div className="fact-bubble">
              🌿 Klepon adalah jajanan tradisional khas Jawa yang terbuat dari tepung
              ketan berisi gula merah dan dibalut kelapa parut.
            </div>
          </div>
          <div className="complete-actions">
            <button className="btn btn-primary btn-lg btn-full" onClick={() => setScreen('mainMenu')}>
              🏠 Kembali ke Menu
            </button>
            <button className="btn btn-secondary btn-full"
              onClick={() => { resetKleponGame(); useGameStore.getState().startKleponGame(); }}>
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
          <img src="/assets/foods_jogja/00_Klepon.png" alt="" className="klepon-topbar-img" />
          <span>Bikin Klepon</span>
        </div>
      </div>

      {/* ── Step dots ── */}
      <div className="klepon-step-dots">
        {STEPS.map((_, idx) => (
          <div
            key={idx}
            className={`kstep-dot ${
              idx < kleponStep  ? 'kstep-done'    :
              idx === kleponStep ? 'kstep-active'  :
                                   'kstep-pending'
            }`}
          >
            {idx < kleponStep ? '✓' : idx + 1}
          </div>
        ))}
      </div>

      {/* ── Step content ── */}
      {/* Step 0 owns its own layout (matches kitchen reference) */}
      {kleponStep === 0 && <StepIngredients onComplete={advanceKleponStep} />}

      {/* Steps 1-4: generic card wrapper */}
      {kleponStep > 0 && (
        <div className="klepon-generic-card">
          <div className="klepon-generic-header">
            <h2 className="klepon-generic-title">{STEPS[kleponStep].label}</h2>
            <p className="klepon-generic-desc">{STEPS[kleponStep].desc}</p>
          </div>
          <div className="klepon-generic-body">
            {kleponStep === 1 && <StepMixing   onComplete={advanceKleponStep} />}
            {kleponStep === 2 && <StepShaping  onComplete={advanceKleponStep} />}
            {kleponStep === 3 && <StepSteaming  onComplete={advanceKleponStep} />}
            {kleponStep === 4 && <StepCoating  onComplete={advanceKleponStep} />}
          </div>
        </div>
      )}
    </div>
  );
}
