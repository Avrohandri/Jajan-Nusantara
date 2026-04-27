import { useGameStore } from '../store/gameStore';

// --- SLOT 1: Background utama ---
import menuBackground from '../assets/menu/background.png';

// --- SLOT 2: Tombol Play ---
import btnPlay from '../assets/menu/btn_play.png';

// --- SLOT 3: Tombol Pengaturan ---
import btnPengaturan from '../assets/menu/btn_pengaturan.png';

import btnJajanpedia from '../assets/menu/btn_jajanpedia.png';

// --- SLOT 5: Tombol Peringkat (Leaderboard) ---
import btnPeringkat from '../assets/menu/btn_peringkat.png';

import { getProfileIconData } from '../utils/profileIcons';

export function MainMenuScreen() {
  const { setScreen, profileIcon } = useGameStore();
  const iconData = getProfileIconData(profileIcon);

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

          {/* Profile icon button — pojok kanan atas */}
          <button
            className="main-menu-profile-btn"
            onClick={() => setScreen('profile')}
            title="Profil"
            id="btn-profile"
            aria-label="Profil pemain"
          >
            <div className={`main-menu-profile-avatar ${iconData.bgClass}`}>
              <img src={iconData.imagePath} alt={iconData.name} className="main-menu-profile-img" />
            </div>
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

          {/* Bottom buttons row: Leaderboard | Jajanpedia | Pengaturan */}
          <div className="main-menu-bottom-buttons">
            {/* Tombol Leaderboard */}
            <button
              className="main-menu-btn main-menu-btn-leaderboard"
              onClick={() => setScreen('leaderboard')}
              id="btn-leaderboard"
            >
              {btnPeringkat ? (
                <img src={btnPeringkat} alt="Peringkat" className="menu-btn-img" />
              ) : (
                <>
                  <span className="menu-btn-icon">🏆</span>
                  <span className="menu-btn-label">PERINGKAT</span>
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
          </div>
        </div>
      </div>
    </div>
  );
}
