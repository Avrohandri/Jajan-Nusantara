import { useGameStore } from '../store/gameStore';

// --- SLOT 1: Background utama ---
import menuBackground from '../assets/menu/background.png';

// --- SLOT 2: Tombol Play ---
import btnPlay from '../assets/menu/btn_play.png';

// --- SLOT 3: Tombol Pengaturan ---
import btnPengaturan from '../assets/menu/btn_pengaturan.png';

// --- SLOT 4: Tombol Jajanpedia ---
import btnJajanpedia from '../assets/menu/btn_jajanpedia.png';

// --- SLOT 5: Tombol Keluar ---
import btnKeluar from '../assets/menu/btn_keluar.png';


export function MainMenuScreen() {
  const { setScreen } = useGameStore();

  return (
    <div className="main-menu-screen">
      <div className="main-menu-container">
        {/* Background Image */}
        <div className="main-menu-bg">
          <img
            src={menuBackground}
            alt="Jajan Nusantara"
            className="main-menu-bg-img"
          />
        </div>

        {/* Overlay content */}
        <div className="main-menu-overlay">
          <button
            className="uji-collider-btn"
            onClick={() => setScreen('colliderTest')}
            title="Uji Collider"
          >
            <span className="uji-icon">🧪</span>
          </button>

          {/* Play button area - centered */}
          <div className="main-menu-play-area">
            <button
              className="main-menu-play-btn"
              onClick={() => setScreen('mapSelect')}
              aria-label="Play"
              id="btn-play"
            >
              {btnPlay ? (
                <img src={btnPlay} alt="Play" className="play-btn-img" />
              ) : (
                <span className="play-icon">▶</span>
              )}
            </button>
          </div>

          {/* Bottom buttons row */}
          <div className="main-menu-bottom-buttons">
            {/* Tombol Pengaturan */}
            <button
              className="main-menu-btn main-menu-btn-settings"
              onClick={() => setScreen('settings')}
              id="btn-settings"
            >
              {btnPengaturan ? (
                <img src={btnPengaturan} alt="Pengaturan" className="menu-btn-img" />
              ) : (
                <>
                  <span className="menu-btn-icon">⚙️</span>
                  <span className="menu-btn-label">PENGATURAN</span>
                </>
              )}
            </button>

            {/* Tombol Jajanpedia */}
            <button
              className="main-menu-btn main-menu-btn-jajanpedia"
              onClick={() => setScreen('jajanpedia')}
              id="btn-jajanpedia"
            >
              {btnJajanpedia ? (
                <img src={btnJajanpedia} alt="Jajanpedia" className="menu-btn-img" />
              ) : (
                <>
                  <span className="menu-btn-icon">📖</span>
                  <span className="menu-btn-label">JAJANPEDIA</span>
                </>
              )}
            </button>

            <button
              className="main-menu-btn main-menu-btn-exit"
              onClick={() => {/* Belum berfungsi */ }}
              id="btn-exit"
            >
              {btnKeluar ? (
                <img src={btnKeluar} alt="Keluar" className="menu-btn-img" />
              ) : (
                <>
                  <span className="menu-btn-icon">🚪</span>
                  <span className="menu-btn-label">KELUAR</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
