import { useGameStore } from '../store/gameStore';
import backButtonImg from '../assets/universal/back button.png';
import { useSfx } from '../hooks/useSfx';
import pediaBg from '../assets/pedia/pedia_bg.png';
import kleponImg from '../assets/pedia/klepon.png';

export function KleponCardScreen() {
  const { setScreen } = useGameStore();
  const { playButtonClick } = useSfx();

  return (
    <div 
      className="klepon-card-screen"
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
          <span className="klepon-card-leaf">🍃</span>
          <h1 className="klepon-card-title">Klepon</h1>
          <span className="klepon-card-leaf">🍃</span>
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
          <img src={kleponImg} alt="Klepon Mascot" className="klepon-card-mascot" />
        </div>

        {}
        <div className="klepon-card-tagline">
          <span className="klepon-leaf-sm">🍃</span>
          <p>Manis di luar, meledak di dalam!</p>
          <span className="klepon-leaf-sm">🍃</span>
        </div>

        {}
        <div className="klepon-card-about-box">
          <p className="klepon-card-about-text">
            Klepon adalah jajanan tradisional berbentuk bulat
            hijau dengan isi gula merah cair yang manis.
            Saat digigit, gulanya akan{' '}
            <span className="klepon-highlight">"meledak"</span> di mulut!
            Ditaburi kelapa parut, rasanya kenyal dan gurih.
          </p>
        </div>

        {}
        <div className="klepon-card-info-row">
          <div className="klepon-card-info-item">
            <div className="klepon-card-info-icon klepon-icon-red">📍</div>
            <p className="klepon-card-info-label">Asal</p>
            <p className="klepon-card-info-value">Jawa</p>
          </div>
          <div className="klepon-card-info-item">
            <div className="klepon-card-info-icon klepon-icon-pink">❤️</div>
            <p className="klepon-card-info-label">Rasa</p>
            <p className="klepon-card-info-value">Manis & Gurih</p>
          </div>
          <div className="klepon-card-info-item">
            <div className="klepon-card-info-icon klepon-icon-brown">🥥</div>
            <p className="klepon-card-info-label">Bahan Utama</p>
            <p className="klepon-card-info-value">Ketan, Gula Merah</p>
          </div>
        </div>

        {}
        <div className="klepon-card-funfact">
          <span className="klepon-card-funfact-icon">✳️</span>
          <div>
            <p className="klepon-card-funfact-title">Fun Fact!</p>
            <p className="klepon-card-funfact-text">
              Klepon disebut "meledak manis"
              karena isi gula cairnya keluar saat digigit!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
