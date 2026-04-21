import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { REGION_FOOD_CONFIGS_RAW } from '../game/characters/FoodConfig';
import pediaJudul from '../assets/pedia/pedia_judul.png';
import backButtonImg from '../assets/universal/back button.png';

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
};



export function JajanpediaScreen() {
  const { setScreen } = useGameStore();
  const [regionIndex, setRegionIndex] = useState(0);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

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
    setRegionIndex((prev) => (prev > 0 ? prev - 1 : REGIONS.length - 1));
  };

  const nextRegion = () => {
    setRegionIndex((prev) => (prev < REGIONS.length - 1 ? prev + 1 : 0));
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
    </div>
  );
}
