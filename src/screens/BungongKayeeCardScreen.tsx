import { useGameStore } from '../store/gameStore';
import backButtonImg from '../assets/universal/back button.png';
import pediaBg from '../assets/pedia/pedia_bg.png';

export function BungongKayeeCardScreen() {
  const { setScreen } = useGameStore();

  return (
    <div
      className="klepon-card-screen bungongkayee-theme"
      style={{
        backgroundImage: `url(${pediaBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Back Button */}
      <button
        className="klepon-card-back-btn"
        onClick={() => setScreen('jajanpedia')}
        title="Kembali ke Jajanpedia"
      >
        <img src={backButtonImg} alt="Back" className="klepon-card-back-icon" />
      </button>

      <div className="klepon-card-content">
        {/* Header */}
        <div className="klepon-card-header">
          <span className="klepon-card-leaf">🌸</span>
          <h1 className="klepon-card-title">Bungong Kayee</h1>
          <span className="klepon-card-leaf">🌸</span>
        </div>

        {/* Mascot */}
        <div className="klepon-card-mascot-wrapper">
          <div className="klepon-card-sparkle top-left">✦</div>
          <div className="klepon-card-sparkle top-right">✦</div>
          <div className="klepon-card-sparkle top-center">✦</div>
          <div className="klepon-card-sparkle bottom-left">✦</div>
          <div className="klepon-card-sparkle bottom-right">✦</div>
          <div className="klepon-card-sparkle mid-left">✦</div>
          <div className="klepon-card-sparkle mid-right">✦</div>
          <img src="/assets/foods_aceh/04_bungong kayee.png" alt="Bungong Kayee Mascot" className="klepon-card-mascot" />
        </div>

        {/* Tagline */}
        <div className="klepon-card-tagline">
          <span className="klepon-leaf-sm">✨</span>
          <p>Cantik seperti bunga, manis di rasa!</p>
          <span className="klepon-leaf-sm">✨</span>
        </div>

        {/* About Box */}
        <div className="klepon-card-about-box">
          <p className="klepon-card-about-text">
            Bungong kayee adalah kue tradisional berbentuk bunga dengan rasa manis. Teksturnya <span className="klepon-highlight">lembut</span> dan tampilannya sangat cantik menawan.
          </p>
        </div>

        {/* Info Row */}
        <div className="klepon-card-info-row">
          <div className="klepon-card-info-item">
            <div className="klepon-card-info-icon klepon-icon-red">📍</div>
            <p className="klepon-card-info-label">Asal</p>
            <p className="klepon-card-info-value">Aceh</p>
          </div>
          <div className="klepon-card-info-item">
            <div className="klepon-card-info-icon klepon-icon-pink">❤️</div>
            <p className="klepon-card-info-label">Rasa</p>
            <p className="klepon-card-info-value">Manis</p>
          </div>
          <div className="klepon-card-info-item">
            <div className="klepon-card-info-icon klepon-icon-brown">🥥</div>
            <p className="klepon-card-info-label">Bahan Utama</p>
            <p className="klepon-card-info-value">Tepung & Gula</p>
          </div>
        </div>

        {/* Fun Fact */}
        <div className="klepon-card-funfact">
          <span className="klepon-card-funfact-icon">🌳</span>
          <div>
            <p className="klepon-card-funfact-title">Fun Fact!</p>
            <p className="klepon-card-funfact-text">
              Nama 'bungong kayee' berarti bunga pohon dalam bahasa Aceh karena bentuknya yang indah menyerupai kuncup bunga!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
