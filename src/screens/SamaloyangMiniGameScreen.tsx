import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { StepMatchIngredients } from '../features/samaloyang/StepMatchIngredients';
import { StepDoughMixing } from '../features/samaloyang/StepDoughMixing';
import { StepDippingMold } from '../features/samaloyang/StepDippingMold';
import { StepFrying } from '../features/samaloyang/StepFrying';
import { MiniGameBackConfirm } from '../components/MiniGameBackConfirm';
import backButtonImg from '../assets/universal/back button.png';
import { usePreloadImages } from '../hooks/usePreloadImages';
import { useSfx } from '../hooks/useSfx';

const STEPS = [
  { label: 'Kumpulkan Bahan', desc: 'Cocokkan tulisan dengan gambar bahan!' },
  { label: 'Buat Adonan',     desc: 'Putar hingga rata' },
  { label: 'Cetakan',         desc: 'Lapisi cetakan dengan adonan' },
  { label: 'Goreng',          desc: 'Goreng samaloyang' },
];

export function SamaloyangMiniGameScreen() {
  usePreloadImages([
    '/assets/samaloyang/cetakan_berisi.png',
    '/assets/samaloyang/samaloyang_mold.png',
    '/assets/samaloyang/wajan.png',
  ]);

  const { samaloyangStep, samaloyangComplete, resetSamaloyangGame, advanceSamaloyangStep, setScreen, awardStarsForRegion, completeMinigameCooking } = useGameStore();
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const { playButtonClick, playStepComplete } = useSfx();

  const handleStepComplete = useCallback(() => {
    playStepComplete();
    advanceSamaloyangStep();
  }, [playStepComplete, advanceSamaloyangStep]);

  const handleBack = () => { playButtonClick(); setShowBackConfirm(true); };
  const handleConfirmBack = () => {
    playButtonClick();
    resetSamaloyangGame();
    setScreen('mainMenu');
  };

  useEffect(() => {
    if (samaloyangComplete) {
      awardStarsForRegion('aceh');
      completeMinigameCooking('aceh');
    }
  }, [samaloyangComplete]);

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
              📌 Samaloyang adalah kue kembang goyang khas Aceh berbentuk bunga renyah yang digoreng dengan cara digoyang.
            </div>
          </div>
          <div className="mgbc-actions" style={{ marginTop: '14px', gap: '10px', padding: '0 10px 22px' }}>
            <button className="mgbc-btn mgbc-btn--cancel" onClick={() => { playButtonClick(); setScreen('mapSelect'); }} style={{ width: '100%', padding: '15px 20px', fontSize: '18px' }}>
              🗺️ Pilih Level Selanjutnya
            </button>
            <button className="mgbc-btn mgbc-btn--confirm" onClick={() => { playButtonClick(); setScreen('mainMenu'); }} style={{ width: '100%', padding: '15px 20px', fontSize: '18px', color: '#5D4037' }}>
              🏠 Kembali ke Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="klepon-root">
      {}
      <img src="/assets/klepon/bg_kitchen.png" alt="" className="klepon-bg" />

      {}
      <div className="klepon-topbar">
        <button className="klepon-back-btn" onClick={handleBack} title="Kembali">
          <img src={backButtonImg} alt="Back" className="klepon-back-icon-img" />
        </button>
        <div className="klepon-topbar-title">
          <img 
            src="/assets/foods_aceh/00_samaloyang.png" 
            alt="Samaloyang" 
            className="klepon-topbar-img" 
            style={{ width: '32px', height: '32px', objectFit: 'contain', marginRight: '8px' }} 
          />
          <span>Bikin Samaloyang</span>
        </div>
      </div>

      {}
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

      {}
      <div className="klepon-generic-card">
        <div className="klepon-generic-header">
          <h2 className="klepon-generic-title">{STEPS[samaloyangStep]?.label}</h2>
          <p className="klepon-generic-desc">{STEPS[samaloyangStep]?.desc}</p>
        </div>
        <div className="klepon-generic-body" style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {samaloyangStep === 0 && <StepMatchIngredients onComplete={handleStepComplete} />}
          {samaloyangStep === 1 && <StepDoughMixing onComplete={handleStepComplete} />}
          {samaloyangStep === 2 && <StepDippingMold onComplete={handleStepComplete} />}
          {samaloyangStep === 3 && <StepFrying onComplete={handleStepComplete} />}
        </div>
      </div>

      {}
      {showBackConfirm && (
        <MiniGameBackConfirm
          foodName="Samaloyang"
          onConfirm={handleConfirmBack}
          onCancel={() => setShowBackConfirm(false)}
        />
      )}
    </div>
  );
}
