import { useGameStore } from '../store/gameStore';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export function ResultScreen() {
  const {
    score,
    mergeCount,
    quizzesCorrect,
    quizzesTriggered,
    highestTier,
    startTime,
    snacks,
    setScreen,
    startKleponGame,
  } = useGameStore();

  const highestSnack = snacks.find(s => s.tier === highestTier);
  const timePlayed = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
  const minutes = Math.floor(timePlayed / 60);
  const seconds = timePlayed % 60;
  const quizAccuracy = quizzesTriggered > 0
    ? Math.round((quizzesCorrect / quizzesTriggered) * 100)
    : 0;

  return (
    <div className="screen result-screen">
      <h1 className="result-title">📊 Hasil Permainan</h1>

      <div className="result-cards">
        <Card title="Skor">
          <p className="result-big-number">{score}</p>
        </Card>
        <Card title="Total Merge">
          <p className="result-big-number">{mergeCount}</p>
        </Card>
        <Card title="Kuis">
          <p className="result-big-number">{quizzesCorrect}/{quizzesTriggered}</p>
          <p className="result-sub">{quizAccuracy}% akurasi</p>
        </Card>
        <Card title="Waktu">
          <p className="result-big-number">{minutes}:{seconds.toString().padStart(2, '0')}</p>
        </Card>
      </div>

      {highestSnack && (
        <div className="result-highlight">
          <p>Jajanan Tertinggi Dicapai:</p>
          <div className="result-snack">
            <span
              className="result-snack-circle"
              style={{ backgroundColor: highestSnack.color }}
            >
              {highestSnack.emoji}
            </span>
            <span className="result-snack-name">{highestSnack.name}</span>
          </div>
        </div>
      )}

      <div className="result-actions">
        {/* Always offer Klepon mini-game */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={startKleponGame}
          >
            🍡 Memasak Klepon — Minigame!
          </Button>
        <Button variant="secondary" fullWidth onClick={() => setScreen('game')}>
          🔄 Main Lagi
        </Button>
        <Button variant="accent" fullWidth onClick={() => setScreen('mainMenu')}>
          🏠 Kembali
        </Button>
      </div>
    </div>
  );
}
