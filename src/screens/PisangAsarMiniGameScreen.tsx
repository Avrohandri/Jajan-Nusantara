import { useGameStore } from '../store/gameStore';
import { StepIngredientSelection } from '../features/pisangasar/StepIngredientSelection';
import { StepCutBanana } from '../features/pisangasar/StepCutBanana';
import { StepMixTopping } from '../features/pisangasar/StepMixTopping';
import { StepSpreadTopping } from '../features/pisangasar/StepSpreadTopping';
import { StepBakeOven } from '../features/pisangasar/StepBakeOven';

const STEPS = [
  { label: '', desc: '' },
  { label: 'Potong Pisang', desc: 'Belah pisang menjadi dua bagian' },
  { label: 'Campur Topping', desc: 'Aduk topping telur, kenari, margarin, gula aren' },
  { label: 'Oles Topping', desc: 'Oleskan topping ke pisang' },
  { label: 'Panggang', desc: 'Masukkan pisang ke dalam oven' },
];

export function PisangAsarMiniGameScreen() {
  const { pisangAsarStep, pisangAsarComplete, advancePisangAsarStep, resetPisangAsarGame, setScreen } = useGameStore();

  const handleBack = () => {
    resetPisangAsarGame();
    setScreen('mainMenu');
  };

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
        <button className="klepon-back-btn" onClick={handleBack}>←</button>
        <div className="klepon-topbar-title">
          <img src="/assets/pisang_asar/07_pisang asar.png" alt="icon" style={{ height: '32px', marginRight: '8px', objectFit: 'contain' }} onError={(e) => { e.currentTarget.outerHTML = '<span style="font-size: 24px; margin-right: 8px;">🍌</span>'; }} />
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
    </div>
  );
}
