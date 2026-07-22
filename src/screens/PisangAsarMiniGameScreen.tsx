import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { StepIngredientSelection } from '../features/pisangasar/StepIngredientSelection';
import { StepCutBanana } from '../features/pisangasar/StepCutBanana';
import { StepMixTopping } from '../features/pisangasar/StepMixTopping';
import { StepSpreadTopping } from '../features/pisangasar/StepSpreadTopping';
import { StepBakeOven } from '../features/pisangasar/StepBakeOven';
import { MiniGameBackConfirm } from '../components/MiniGameBackConfirm';
import backButtonImg from '../assets/universal/back button.png';
import { usePreloadImages } from '../hooks/usePreloadImages';
import { useSfx } from '../hooks/useSfx';

const STEPS = [
  { label: '', desc: '' },
  { label: 'Potong Pisang', desc: 'Belah pisang menjadi dua bagian' },
  { label: 'Campur Topping', desc: '' },
  { label: 'Oles Topping', desc: 'Oleskan topping ke pisang' },
  { label: 'Panggang', desc: 'Masukkan pisang ke dalam oven' },
];

export function PisangAsarMiniGameScreen() {
  usePreloadImages([
    '/assets/pisang_asar/pisang_terpotong.png',
    '/assets/pisang_asar/pisang_utuh.png',
    '/assets/pisang_asar/pisang_tray.png',
    '/assets/pisang_asar/pisang_topping.png',
    '/assets/pisang_asar/pisang_siap.png',
  ]);

  const { pisangAsarStep, pisangAsarComplete, advancePisangAsarStep, resetPisangAsarGame, setScreen, awardStarsForRegion, completeMinigameCooking } = useGameStore();
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const { playButtonClick, playStepComplete } = useSfx();

  const handleStepComplete = useCallback(() => {
    playStepComplete();
    advancePisangAsarStep();
  }, [playStepComplete, advancePisangAsarStep]);

  const handleBack = () => { playButtonClick(); setShowBackConfirm(true); };
  const handleConfirmBack = () => {
    playButtonClick();
    resetPisangAsarGame();
    setScreen('mainMenu');
  };

  useEffect(() => {
    if (pisangAsarComplete) {
      awardStarsForRegion('maluku');
      completeMinigameCooking('maluku');
    }
  }, [pisangAsarComplete]);

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
          <img src="/assets/foods_maluku/06_pisang asar.png" alt="icon" style={{ height: '32px', marginRight: '8px', objectFit: 'contain' }} onError={(e) => { e.currentTarget.outerHTML = '<span style="font-size: 24px; margin-right: 8px;">🍌</span>'; }} />
          <span>Bikin Pisang Asar</span>
        </div>
      </div>

      {}
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

      {}
      <div className="klepon-generic-card">
        {pisangAsarStep !== 0 && (
          <div className="klepon-generic-header">
            <h2 className="klepon-generic-title">{STEPS[pisangAsarStep]?.label}</h2>
            <p className="klepon-generic-desc">{STEPS[pisangAsarStep]?.desc}</p>
          </div>
        )}
        <div className="klepon-generic-body" style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {pisangAsarStep === 0 && <StepIngredientSelection onComplete={handleStepComplete} />}
          {pisangAsarStep === 1 && <StepCutBanana onComplete={handleStepComplete} />}
          {pisangAsarStep === 2 && <StepMixTopping onComplete={handleStepComplete} />}
          {pisangAsarStep === 3 && <StepSpreadTopping onComplete={handleStepComplete} />}
          {pisangAsarStep === 4 && <StepBakeOven onComplete={handleStepComplete} />}
        </div>
      </div>

      {}
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
