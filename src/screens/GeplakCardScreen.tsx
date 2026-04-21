import { useGameStore } from '../store/gameStore';
import backButtonImg from '../assets/universal/back button.png';
import pediaBg from '../assets/pedia/pedia_bg.png';

export function GeplakCardScreen() {
  const { setScreen } = useGameStore();

  return (
    <div 
      className="klepon-card-screen geplak-theme"
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
          <span className="klepon-card-leaf">🍡</span>
          <h1 className="klepon-card-title">Geplak</h1>
          <span className="klepon-card-leaf">🍡</span>
        </div>

        {/* Mascot */}
        <div className="klepon-card-mascot-wrapper">
          <div className="klepon-card-sparkle top-left">✦</div>
          <div className="klepon-card-sparkle top-right">✦</div>
          <div className="klepon-card-sparkle bottom-left">✦</div>
          <img src="/assets/foods_jogja/03_Geplak.png" alt="Geplak Mascot" className="klepon-card-mascot" />
        </div>

        {/* Tagline */}
        <div className="klepon-card-tagline">
          <span className="klepon-leaf-sm">☀️</span>
          <p>Manis gurih dari parutan kelapa!</p>
          <span className="klepon-leaf-sm">☀️</span>
        </div>

        {/* About Box */}
        <div className="klepon-card-about-box">
          <p className="klepon-card-about-text">
            Geplak adalah jajanan tradisional berbentuk bulat atau kotak dengan warna cerah. 
            Terbuat dari <span className="klepon-highlight">kelapa parut dan gula</span>, memiliki tekstur agak kasar dengan 
            rasa manis yang khas dan autentik.
          </p>
        </div>

        {/* Info Row */}
        <div className="klepon-card-info-row">
          <div className="klepon-card-info-item">
            <div className="klepon-card-info-icon klepon-icon-red">📍</div>
            <p className="klepon-card-info-label">Asal</p>
            <p className="klepon-card-info-value">Yogyakarta</p>
          </div>
          <div className="klepon-card-info-item">
            <div className="klepon-card-info-icon klepon-icon-pink">❤️</div>
            <p className="klepon-card-info-label">Rasa</p>
            <p className="klepon-card-info-value">Manis</p>
          </div>
          <div className="klepon-card-info-item">
            <div className="klepon-card-info-icon klepon-icon-brown">🥥</div>
            <p className="klepon-card-info-label">Bahan Utama</p>
            <p className="klepon-card-info-value">Kelapa, Gula</p>
          </div>
        </div>

        {/* Fun Fact */}
        <div className="klepon-card-funfact">
          <span className="klepon-card-funfact-icon">🎨</span>
          <div>
            <p className="klepon-card-funfact-title">Fun Fact!</p>
            <p className="klepon-card-funfact-text">
              Geplak punya warna-warni menarik karena sering diberi pewarna alami agar terlihat lebih ceria!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
