import { useGameStore } from '../store/gameStore';
import backButtonImg from '../assets/universal/back button.png';
import { useSfx } from '../hooks/useSfx';
import pediaBg from '../assets/pedia/pedia_bg.png';
import pisangAsarImg from '../assets/pedia/pisang asar.png';

export function PisangAsarCardScreen() {
  const { setScreen } = useGameStore();
  const { playButtonClick } = useSfx();

  return (
    <div
      className="klepon-card-screen pisangasar-theme"
      style={{
        backgroundImage: `url(${pediaBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {}
      <button
        className="klepon-card-back-btn"
        onClick={() => { playButtonClick(); setScreen('jajanpedia'); }}
        title="Kembali ke Jajanpedia"
      >
        <img src={backButtonImg} alt="Back" className="klepon-card-back-icon" />
      </button>

      <div className="klepon-card-content">
        {}
        <div className="klepon-card-header">
          <span className="klepon-card-leaf">🍌</span>
          <h1 className="klepon-card-title">Pisang Asar</h1>
          <span className="klepon-card-leaf">🍌</span>
        </div>

        {}
        <div className="klepon-card-mascot-wrapper">
          <div className="klepon-card-sparkle top-left">✦</div>
          <div className="klepon-card-sparkle top-right">✦</div>
          <div className="klepon-card-sparkle top-center">✦</div>
          <div className="klepon-card-sparkle bottom-left">✦</div>
          <div className="klepon-card-sparkle bottom-right">✦</div>
          <div className="klepon-card-sparkle mid-left">✦</div>
          <div className="klepon-card-sparkle mid-right">✦</div>
          <img src={pisangAsarImg} alt="Pisang Asar Mascot" className="klepon-card-mascot" />
        </div>

        {}
        <div className="klepon-card-tagline">
          <span className="klepon-leaf-sm">✨</span>
          <p>Manis alami, harum menggoda!</p>
          <span className="klepon-leaf-sm">✨</span>
        </div>

        {}
        <div className="klepon-card-about-box">
          <p className="klepon-card-about-text">
            Pisang asar adalah pisang yang dipanggang hingga matang sempurna dan disajikan dengan rasa <span className="klepon-highlight">manis alami</span>. Teksturnya lembut dengan cita rasa sedikit terkaramelisasi.
          </p>
        </div>

        {}
        <div className="klepon-card-info-row">
          <div className="klepon-card-info-item">
            <div className="klepon-card-info-icon klepon-icon-red">📍</div>
            <p className="klepon-card-info-label">Asal</p>
            <p className="klepon-card-info-value">Maluku</p>
          </div>
          <div className="klepon-card-info-item">
            <div className="klepon-card-info-icon klepon-icon-pink">❤️</div>
            <p className="klepon-card-info-label">Rasa</p>
            <p className="klepon-card-info-value">Manis</p>
          </div>
          <div className="klepon-card-info-item">
            <div className="klepon-card-info-icon klepon-icon-brown">🥥</div>
            <p className="klepon-card-info-label">Bahan Utama</p>
            <p className="klepon-card-info-value">Pisang & Gula Merah</p>
          </div>
        </div>

        {}
        <div className="klepon-card-funfact">
          <span className="klepon-card-funfact-icon">🍌</span>
          <div>
            <p className="klepon-card-funfact-title">Fun Fact!</p>
            <p className="klepon-card-funfact-text">
              Proses pemanggangan (asar) memberikan aroma khas yang membuat pisang asar sangat digemari sebagai teman minum kopi sore!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
