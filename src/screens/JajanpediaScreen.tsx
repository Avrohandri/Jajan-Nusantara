import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { REGION_FOOD_CONFIGS_RAW } from '../game/characters/FoodConfig';
import pediaJudul from '../assets/pedia/pedia_judul.png';
import backButtonImg from '../assets/universal/back button.png';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';

const REGIONS = [
  { id: 'jogja', name: 'Jogja', folder: 'foods_jogja', icon: '🏯' },
  { id: 'bali', name: 'Bali', folder: 'foods_bali', icon: '🛕' },
  { id: 'aceh', name: 'Aceh', folder: 'foods_aceh', icon: '🛖' },
  { id: 'maluku', name: 'Maluku', folder: 'foods_maluku', icon: '🥁' }
];

// Map food textureKey to a detail screen
const FOOD_CARD_SCREENS: Record<string, string> = {
  '00_Klepon': 'kleponCard',
  '01_Cenil': 'cenilCard',
  '02_Yangko': 'yangkoCard',
  '03_Geplak': 'geplakCard',
  '04_Bakpia': 'bakpiaCard',
  '05_Lemper': 'lemperCard',
  '06_TiwulAyu': 'tiwulAyuCard',
  '07_JadahTempe': 'jadahTempeCard',
  // Bali
  '00_laklak': 'laklakCard',
  '01_kaliadrem': 'kaliadremCard',
  '02_pie susu': 'pieSusuCard',
  '03_jaje walik': 'jajeWalikCard',
  '04_bendu': 'benduCard',
  '05_jaje uli': 'jajeUliCard',
  '06_pisang rai': 'pisangRaiCard',
  // Aceh
  '00_samaloyang': 'samaloyangCard',
  '01_timphan': 'timphanCard',
  '02_pulot ijo': 'pulotIjoCard',
  '03_keukarah': 'keukarahCard',
  '04_bungong kayee': 'bungongKayeeCard',
  '05_meuseukat': 'meuseukatCard',
  '06_kue adee': 'kueAdeeCard',
  // Maluku
  '00_koyabu': 'koyabuCard',
  '01_sagu lempeng': 'saguLempengCard',
  '02_sagu gula': 'sagugulaCard',
  '03_talam sagu bakar': 'talamsaguBakarCard',
  '04_asida': 'asidaCard',
  '05_kue bagea': 'kuebageaCard',
  '06_pisang asar': 'pisangasarCard',
};



export function JajanpediaScreen() {
  const { 
    setScreen, 
    jajanpediaRegionIndex: regionIndex, 
    setJajanpediaRegionIndex: setRegionIndexStore,
    hasSeenJajanpediaInstructions,
    setHasSeenJajanpediaInstructions,
    islandCookingComplete
  } = useGameStore();

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [showInstructions, setShowInstructions] = useState(!hasSeenJajanpediaInstructions);
  const [toast, setToast] = useState<string | null>(null);

  const minSwipeDistance = 50;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const isRegionUnlocked = (id: string): boolean => {
    if (id === 'jogja') return true;
    if (id === 'bali') return islandCookingComplete.jogja;
    if (id === 'aceh') return islandCookingComplete.bali;
    if (id === 'maluku') return islandCookingComplete.aceh;
    return false;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      nextRegion();
    } else if (isRightSwipe) {
      prevRegion();
    }
  };

  const prevRegion = () => {
    const nextIdx = regionIndex > 0 ? regionIndex - 1 : REGIONS.length - 1;
    const targetRegion = REGIONS[nextIdx];
    if (!isRegionUnlocked(targetRegion.id)) {
      showToast(`🔒 Selesaikan pulau sebelumnya untuk membuka Jajanpedia ${targetRegion.name}!`);
      return;
    }
    setRegionIndexStore(nextIdx);
  };

  const nextRegion = () => {
    const nextIdx = regionIndex < REGIONS.length - 1 ? regionIndex + 1 : 0;
    const targetRegion = REGIONS[nextIdx];
    if (!isRegionUnlocked(targetRegion.id)) {
      showToast(`🔒 Selesaikan pulau sebelumnya untuk membuka Jajanpedia ${targetRegion.name}!`);
      return;
    }
    setRegionIndexStore(nextIdx);
  };

  const dismissInstructions = () => {
    setShowInstructions(false);
    setHasSeenJajanpediaInstructions();
  };

  const currentRegion = REGIONS[regionIndex];
  const foods = REGION_FOOD_CONFIGS_RAW[currentRegion.id] || [];

  return (
    <div className="screen jajanpedia-screen">
      <div className="jajanpedia-wrapper">
        {/* Back Button */}
        <button 
          className="jajan-back-btn" 
          onClick={() => setScreen('mainMenu')}
          title="Kembali ke Menu Utama"
        >
          <img src={backButtonImg} alt="Back" className="jajan-back-icon-img" />
        </button>

        {/* Title Image */}
        <img src={pediaJudul} alt="Jajanpedia Title" className="jajanpedia-top-title" />

        {/* Content Section */}
        <div 
          className="jajanpedia-content"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="jajanpedia-board-wrapper">
            <div className="jajanpedia-board">
              <div className="jajanpedia-board-header">
                <button className="jajanpedia-arrow-btn" onClick={(e) => { e.stopPropagation(); prevRegion(); }}>
                  ◀
                </button>
                <h2 className="jajanpedia-board-title">Jajanan dari {currentRegion.name}</h2>
                <button className="jajanpedia-arrow-btn" onClick={(e) => { e.stopPropagation(); nextRegion(); }}>
                  ▶
                </button>
              </div>

              <div className="jajanpedia-grid">
                {foods.map((food, index) => {
                  const imgPath = `/assets/${currentRegion.folder}/${food.textureKey}.png`;
                  
                  let cleanName = food.name;
                  if (cleanName.match(/^\d{2}_/)) {
                    cleanName = cleanName.substring(3);
                  }
                  cleanName = cleanName.replace(/([A-Z])/g, ' $1').trim();

                  const targetScreen = FOOD_CARD_SCREENS[food.textureKey];

                  return (
                    <div
                      key={index}
                      className={`jajan-card${targetScreen ? ' jajan-card-clickable' : ''}`}
                      onClick={targetScreen ? () => setScreen(targetScreen as any) : undefined}
                    >
                      <div className="jajan-card-img-wrapper">
                        <img src={imgPath} alt={cleanName} className="jajan-card-img" />
                      </div>
                      <div className="jajan-card-text-wrapper">
                        <p className="jajan-card-name">{cleanName}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions Overlay */}
      <Modal isOpen={showInstructions} title="Jajanpedia 📖">
        <div className="instructions">
          <p>🏝️ Koleksi kuliner unik dari <strong>4 Pulau</strong> besar.</p>
          <p>🔓 Mainkan game di pulau untuk <strong>Membuka</strong> kuliner baru.</p>
          <p>🔍 <strong>Ketuk</strong> jajanan untuk melihat fakta & resep rahasia!</p>
        </div>
        <Button variant="primary" fullWidth onClick={dismissInstructions}>
          Mulai Eksplorasi! 🚀
        </Button>
      </Modal>

      {toast && (
        <div className="map-toast" role="status" style={{ zIndex: 9999 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
