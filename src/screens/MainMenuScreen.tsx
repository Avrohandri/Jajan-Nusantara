import { useGameStore } from '../store/gameStore';
import { useSfx } from '../hooks/useSfx';

import menuBackground from '../assets/menu/background.png';

import btnPlay from '../assets/menu/btn_play.png';

import btnPengaturan from '../assets/menu/btn_pengaturan.png';

import btnJajanpedia from '../assets/menu/btn_jajanpedia.png';

import btnPeringkat from '../assets/menu/btn_peringkat.png';

import { getProfileIconData } from '../utils/profileIcons';

export function MainMenuScreen() {
  const { setScreen, profileIcon } = useGameStore();
  const { playButtonClick } = useSfx();
  const iconData = getProfileIconData(profileIcon);

  return (
    <div className="main-menu-screen">
      <div className="main-menu-container">
        {}
        <div className="main-menu-bg">
          <img
            src={menuBackground}
            alt="Jajan Nusantara"
            className="main-menu-bg-img"
          />
        </div>

        {}
        <div className="main-menu-overlay">

          {}
          <button
            className="main-menu-profile-btn"
            onClick={() => { playButtonClick(); setScreen('profile'); }}
            title="Profil"
            id="btn-profile"
            aria-label="Profil pemain"
          >
            <div className={`main-menu-profile-avatar ${iconData.bgClass}`}>
              <img src={iconData.imagePath} alt={iconData.name} className="main-menu-profile-img" />
            </div>
          </button>

          {}
          <div className="main-menu-play-area">
            <button
              className="main-menu-play-btn"
              onClick={() => { playButtonClick(); setScreen('mapSelect'); }}
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

          {}
          <div className="main-menu-bottom-buttons">
            {}
            <button
              className="main-menu-btn main-menu-btn-leaderboard"
              onClick={() => { playButtonClick(); setScreen('leaderboard'); }}
              id="btn-leaderboard"
            >
              {btnPeringkat ? (
                <img src={btnPeringkat} alt="Rank" className="menu-btn-img" />
              ) : (
                <>
                  <span className="menu-btn-icon">🏆</span>
                  <span className="menu-btn-label">PERINGKAT</span>
                </>
              )}
            </button>

            {}
            <button
              className="main-menu-btn main-menu-btn-jajanpedia"
              onClick={() => { playButtonClick(); setScreen('jajanpedia'); }}
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

            {}
            <button
              className="main-menu-btn main-menu-btn-settings"
              onClick={() => { playButtonClick(); setScreen('settings'); }}
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
