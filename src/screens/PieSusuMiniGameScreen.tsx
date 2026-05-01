import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { StepDoughMixing } from '../features/pieSusu/StepDoughMixing';
import { StepShapingMold } from '../features/pieSusu/StepShapingMold';
import { StepPouringFilling } from '../features/pieSusu/StepPouringFilling';
import { StepBakingOven } from '../features/pieSusu/StepBakingOven';
import { StepPieIngredients } from '../features/pieSusu/StepPieIngredients';
import backButtonImg from '../assets/universal/back button.png';

const STEPS = [
  { label: 'Pilih Bahan',    desc: 'Pilih bahan untuk Pie Susu' },
  { label: 'Buat Adonan',    desc: '' },
  { label: 'Bentuk Pie',     desc: 'Ratakan adonan di loyang' },
  { label: 'Tuang Susu',     desc: 'Tuang isian susu ke dalam pai' },
  { label: 'Panggang Pie',   desc: 'Masukkan ke dalam oven' },
];

export function PieSusuMiniGameScreen() {
  const { pieSusuStep, pieSusuComplete, advancePieSusuStep, resetPieSusuGame, setScreen, awardStarsForRegion } = useGameStore();

  const handleBack = () => {
    resetPieSusuGame();
    setScreen('mainMenu');
  };

  // Award stars saat pie susu selesai
  useEffect(() => {
    if (pieSusuComplete) {
      awardStarsForRegion('bali');
    }
  }, [pieSusuComplete]);

  /* ── Complete screen ── */
  if (pieSusuComplete) {
    return (
      <div className="klepon-root">
        <img src="/assets/klepon/bg_kitchen.png" alt="" className="klepon-bg" />
        <div className="klepon-complete-screen">
          <div className="complete-confetti">✨✨✨</div>
          {/* Using custom asset instead of emoji */}
          <img 
            src="/assets/pie_susu/pie susu_jadi.png" 
            alt="Pie Susu" 
            style={{ width: '120px', height: '120px', objectFit: 'contain', animation: 'floatUp 1s ease infinite alternate' }} 
          />
          <h1 className="complete-title">Pie Susu Selesai!</h1>
          <p className="complete-subtitle">
            Kamu berhasil membuat Pie Susu khas Bali yang renyah dan manis!
          </p>
          <div className="complete-facts">
            <div className="fact-bubble">
              🌴 Pie Susu adalah oleh-oleh ikonik dari Bali dengan kulit pastry renyah dan isian custard susu manis.
            </div>
          </div>
          <div className="complete-actions">
            <button className="btn btn-primary btn-lg btn-full" onClick={() => setScreen('mainMenu')}>
              🏠 Kembali ke Menu
            </button>
            <button className="btn btn-secondary btn-full"
              onClick={() => { resetPieSusuGame(); useGameStore.getState().startPieSusuGame(); }}>
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
          <img src="/assets/foods_bali/02_pie susu.png" alt="" style={{ width: '28px', height: '28px', objectFit: 'contain', marginRight: '8px' }} />
          <span>Bikin Pie Susu</span>
        </div>
      </div>

      {/* ── Step dots ── */}
      <div className="klepon-step-dots">
        {STEPS.map((_, idx) => (
          <div
            key={idx}
            className={`kstep-dot ${
              idx < pieSusuStep ? 'kstep-done' :
              idx === pieSusuStep ? 'kstep-active' :
                                   'kstep-pending'
            }`}
          >
            {idx < pieSusuStep ? '✓' : idx + 1}
          </div>
        ))}
      </div>

      {/* ── Step content ── */}
      <div className="klepon-generic-card">
        <div className="klepon-generic-header">
          <h2 className="klepon-generic-title">{STEPS[pieSusuStep]?.label}</h2>
          <p className="klepon-generic-desc">{STEPS[pieSusuStep]?.desc}</p>
        </div>
        <div className="klepon-generic-body" style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {pieSusuStep === 0 && <StepPieIngredients onComplete={advancePieSusuStep} />}
          {pieSusuStep === 1 && <StepDoughMixing onComplete={advancePieSusuStep} />}
          {pieSusuStep === 2 && <StepShapingMold onComplete={advancePieSusuStep} />}
          {pieSusuStep === 3 && <StepPouringFilling onComplete={advancePieSusuStep} />}
          {pieSusuStep === 4 && <StepBakingOven onComplete={advancePieSusuStep} />}
        </div>
      </div>
    </div>
  );
}
