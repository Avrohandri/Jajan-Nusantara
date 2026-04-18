import { useGameStore } from '../store/gameStore';
import { StepMatchIngredients } from '../features/samaloyang/StepMatchIngredients';
import { StepDoughMixing } from '../features/samaloyang/StepDoughMixing';
import { StepDippingMold } from '../features/samaloyang/StepDippingMold';
import { StepFrying } from '../features/samaloyang/StepFrying';

const STEPS = [
  { label: 'Kumpulkan Bahan', desc: 'Cocokkan tulisan dengan gambar bahan!' },
  { label: 'Buat Adonan',     desc: 'Putar hingga rata' },
  { label: 'Cetakan',         desc: 'Lapisi cetakan dengan adonan' },
  { label: 'Goreng',          desc: 'Goreng samaloyang' },
];

export function SamaloyangMiniGameScreen() {
  const { samaloyangStep, samaloyangComplete, resetSamaloyangGame, advanceSamaloyangStep, setScreen } = useGameStore();

  const handleBack = () => {
    resetSamaloyangGame();
    setScreen('mainMenu');
  };

  /* ── Complete screen ── */
  if (samaloyangComplete) {
    return (
      <div className="klepon-root">
        <img src="/assets/klepon/bg_kitchen.png" alt="" className="klepon-bg" />
        <div className="klepon-complete-screen">
          <div className="complete-confetti">✨✨✨</div>
          <div style={{ animation: 'floatUp 1s ease infinite alternate' }}>
            <img src="/assets/samaloyang/samaloyang_jadi.png" alt="Samaloyang Jadi" style={{ height: '180px', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))' }} />
          </div>
          <h1 className="complete-title">Samaloyang Selesai!</h1>
          <p className="complete-subtitle">
            Kamu berhasil membuat Kembang Goyang (Samaloyang) khas Aceh yang renyah dan gurih!
          </p>
          <div className="complete-facts">
            <div className="fact-bubble">
              📌 Samaloyang (Kembang Goyang) adalah kue tradisional khas Aceh berbentuk seperti bunga yang dibuat dengan cara dicetak dan digoyang-goyang di dalam minyak panas.
            </div>
          </div>
          <div className="complete-actions">
            <button className="btn btn-primary btn-lg btn-full" onClick={() => setScreen('mainMenu')}>
              🏠 Kembali ke Menu
            </button>
            <button className="btn btn-secondary btn-full"
              onClick={() => { resetSamaloyangGame(); useGameStore.getState().startSamaloyangGame(); }}>
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
          <span style={{ fontSize: '24px', marginRight: '8px' }}>🥨</span>
          <span>Bikin Samaloyang</span>
        </div>
      </div>

      {/* ── Step dots ── */}
      <div className="klepon-step-dots">
        {STEPS.map((_, idx) => (
          <div
            key={idx}
            className={`kstep-dot ${
              idx < samaloyangStep ? 'kstep-done' :
              idx === samaloyangStep ? 'kstep-active' :
                                   'kstep-pending'
            }`}
          >
            {idx < samaloyangStep ? '✓' : idx + 1}
          </div>
        ))}
      </div>

      {/* ── Step content ── */}
      <div className="klepon-generic-card">
        <div className="klepon-generic-header">
          <h2 className="klepon-generic-title">{STEPS[samaloyangStep]?.label}</h2>
          <p className="klepon-generic-desc">{STEPS[samaloyangStep]?.desc}</p>
        </div>
        <div className="klepon-generic-body" style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {samaloyangStep === 0 && <StepMatchIngredients onComplete={advanceSamaloyangStep} />}
          {samaloyangStep === 1 && <StepDoughMixing onComplete={advanceSamaloyangStep} />}
          {samaloyangStep === 2 && <StepDippingMold onComplete={advanceSamaloyangStep} />}
          {samaloyangStep === 3 && <StepFrying onComplete={advanceSamaloyangStep} />}
        </div>
      </div>
    </div>
  );
}
