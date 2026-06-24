import { useGameStore } from '../store/gameStore';
import { Button } from '../components/Button';

export function HomeScreen() {
  const { setScreen, soundEnabled, toggleSound } = useGameStore();

  return (
    <div className="screen home-screen">
      {/* Wind breeze decoration */}
      <div className="wind-breeze-container">
        <div className="wind-line wind-line-1"></div>
        <div className="wind-line wind-line-2"></div>
        <div className="wind-line wind-line-3"></div>
      </div>

      <div className="home-decoration">🍡🥟🍢🥮🍘</div>
      <h1 className="home-title">Kuliner Nusantara</h1>
      <p className="home-subtitle">Game Edukasi Jajanan Tradisional</p>

      <div className="home-buttons">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => setScreen('game')}
        >
          🎮 Mulai Bermain
        </Button>

        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={() => setScreen('progress')}
        >
          📊 Lihat Progres
        </Button>

        <Button
          variant="accent"
          size="md"
          onClick={toggleSound}
        >
          {soundEnabled ? '🔊 Suara: Aktif' : '🔇 Suara: Mati'}
        </Button>
      </div>

      <div className="home-footer">
        <p>Gabungkan jajanan yang sama untuk naik level!</p>
        <p className="home-version">v1.0 — Prototipe MVP</p>
      </div>
    </div>
  );
}
