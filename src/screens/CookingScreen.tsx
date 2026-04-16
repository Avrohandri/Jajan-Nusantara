import { useGameStore } from '../store/gameStore';
import { Button } from '../components/Button';

export function CookingScreen() {
  const {
    currentRecipe,
    cookingStep,
    cookingComplete,
    advanceCookingStep,
    resetCooking,
    setScreen,
  } = useGameStore();

  if (!currentRecipe) {
    return (
      <div className="screen cooking-screen">
        <h2>Tidak ada resep tersedia</h2>
        <Button variant="primary" onClick={() => setScreen('mainMenu')}>Kembali</Button>
      </div>
    );
  }

  const totalSteps = currentRecipe.steps.length;
  const currentStepData = currentRecipe.steps[cookingStep];
  const progress = cookingComplete
    ? 100
    : Math.round((cookingStep / totalSteps) * 100);

  const handleBack = () => {
    resetCooking();
    setScreen('mainMenu');
  };

  return (
    <div className="screen cooking-screen">
      <h1 className="cooking-title">
        🍳 Memasak: {currentRecipe.snackName}
      </h1>

      {/* Progress Bar */}
      <div className="cooking-progress-bar">
        <div
          className="cooking-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="cooking-step-count">
        Langkah {Math.min(cookingStep + 1, totalSteps)} dari {totalSteps}
      </p>

      {!cookingComplete ? (
        <div className="cooking-area">
          <div className="cooking-emoji">{currentStepData.emoji}</div>
          <p className="cooking-instruction">{currentStepData.instruction}</p>

          <button className="cooking-tap-button" onClick={advanceCookingStep}>
            <span className="tap-text">👆 Ketuk!</span>
          </button>
        </div>
      ) : (
        <div className="cooking-complete">
          <div className="cooking-complete-emoji">🎉</div>
          <h2>Berhasil Memasak!</h2>
          <p className="cooking-complete-name">
            {currentRecipe.snackName} sudah selesai dibuat!
          </p>
          <p className="cooking-complete-sub">
            Resep ini telah ditambahkan ke koleksi Anda.
          </p>
        </div>
      )}

      <div className="cooking-actions">
        <Button variant="secondary" fullWidth onClick={handleBack}>
          🏠 Kembali ke Beranda
        </Button>
      </div>
    </div>
  );
}
