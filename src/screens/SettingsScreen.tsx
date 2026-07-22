import { useGameStore } from '../store/gameStore';
import backButtonImg from '../assets/universal/back button.png';
import { useSfx } from '../hooks/useSfx';

export function SettingsScreen() {
  const { setScreen, isMusicOn, isSfxOn, toggleMusic, toggleSfx } = useGameStore();
  const { playButtonClick } = useSfx();

  return (
    <div className="screen settings-screen">
      {}
      <button
        className="back-btn"
        onClick={() => { playButtonClick(); setScreen('mainMenu'); }}
        id="btn-back-settings"
      >
        <img src={backButtonImg} alt="Back" className="settings-back-icon-img" />
      </button>

      {}
      <div className="settings-header">
        <h1 className="settings-title">Pengaturan</h1>
      </div>

      {}
      <div className="settings-panel">
        {}
        <div className="settings-row" id="setting-music">
          <div className="settings-row-left">
            <span className="settings-icon">🎵</span>
            <span className="settings-label">Musik</span>
          </div>
          <button
            className={`toggle-btn ${isMusicOn ? 'toggle-on' : 'toggle-off'}`}
            onClick={() => { playButtonClick(); toggleMusic(); }}
            aria-label="Toggle Musik"
          >
            <span className="toggle-knob" />
          </button>
        </div>

        {}
        <div className="settings-row" id="setting-sfx">
          <div className="settings-row-left">
            <span className="settings-icon">🔊</span>
            <span className="settings-label">Efek Suara</span>
          </div>
          <button
            className={`toggle-btn ${isSfxOn ? 'toggle-on' : 'toggle-off'}`}
            onClick={() => { playButtonClick(); toggleSfx(); }}
            aria-label="Toggle Efek Suara"
          >
            <span className="toggle-knob" />
          </button>
        </div>
      </div>

      {}
      <div className="settings-version">
        Versi 0.1.0 — Jajan Nusantara
      </div>
    </div>
  );
}
