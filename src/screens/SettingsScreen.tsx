import { useGameStore } from '../store/gameStore';

export function SettingsScreen() {
  const { setScreen, isMusicOn, isSfxOn, toggleMusic, toggleSfx } = useGameStore();

  return (
    <div className="screen settings-screen">
      {/* Back button */}
      <button
        className="back-btn"
        onClick={() => setScreen('mainMenu')}
        id="btn-back-settings"
      >
        ← Kembali
      </button>

      {/* Header */}
      <div className="settings-header">
        <h1 className="settings-title">Pengaturan</h1>
      </div>

      {/* Settings panel */}
      <div className="settings-panel">
        {/* Music toggle */}
        <div className="settings-row" id="setting-music">
          <div className="settings-row-left">
            <span className="settings-icon">🎵</span>
            <span className="settings-label">Musik</span>
          </div>
          <button
            className={`toggle-btn ${isMusicOn ? 'toggle-on' : 'toggle-off'}`}
            onClick={toggleMusic}
            aria-label="Toggle Musik"
          >
            <span className="toggle-knob" />
          </button>
        </div>

        {/* SFX toggle */}
        <div className="settings-row" id="setting-sfx">
          <div className="settings-row-left">
            <span className="settings-icon">🔊</span>
            <span className="settings-label">Efek Suara</span>
          </div>
          <button
            className={`toggle-btn ${isSfxOn ? 'toggle-on' : 'toggle-off'}`}
            onClick={toggleSfx}
            aria-label="Toggle Efek Suara"
          >
            <span className="toggle-knob" />
          </button>
        </div>
      </div>

      {/* Version label */}
      <div className="settings-version">
        Versi 0.1.0 — Jajan Nusantara
      </div>
    </div>
  );
}
