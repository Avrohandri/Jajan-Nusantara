import { useState, useEffect, useRef } from 'react';
import { EventBus } from '../game/EventBus';
import { useGameStore } from '../store/gameStore';
import { REGION_FOOD_CONFIGS_RAW } from '../game/characters/FoodConfig';

type NotificationData = { foodName: string; funFact: string; region: string; textureKey: string };

export function NpcNotification() {
  const [queue, setQueue] = useState<NotificationData[]>([]);
  const [activeItem, setActiveItem] = useState<NotificationData | null>(null);
  
  // Track tiers we've already shown the NPC for in this session
  const notifiedTiers = useRef(new Set<number>());

  useEffect(() => {
    const handleCheckUnlock = (tier: number) => {
      // 1. Check if we already notified for this tier
      if (notifiedTiers.current.has(tier)) return;

      // 2. Check region
      const state = useGameStore.getState();
      const currentRegion = state.activeRegion || 'jogja';
      
      // 3. Find config for this tier
      const configList = REGION_FOOD_CONFIGS_RAW[currentRegion];
      if (!configList) return;
      
      const foodConfig = configList.find((c) => c.tier === tier);
      
      if (foodConfig) {
        // Mark as notified
        notifiedTiers.current.add(tier);

        // Clean name up
        let cleanName = foodConfig.name;
        if (cleanName.match(/^\d{2}_/)) {
          cleanName = cleanName.substring(3);
        }
        // "JadahTempe" -> "Jadah Tempe"
        cleanName = cleanName.replace(/([A-Z])/g, ' $1').trim();
        
        console.log(`NPC showing for ${cleanName} (tier ${tier}) in ${currentRegion}: "${foodConfig.funFact}"`);
        
        // Clean up funFact: remove everything before the first " — ", " - ", or ":"
        let displayFact = foodConfig.funFact || "Jajanan tradisional yang sangat lezat!";
        const separators = [' — ', ' - ', ': '];
        
        for (const sep of separators) {
          if (displayFact.includes(sep)) {
            displayFact = displayFact.split(sep).slice(1).join(sep).trim();
            break;
          }
        }
        
        // Add to queue instead of displaying immediately
        setQueue(prev => [...prev, { foodName: cleanName, funFact: displayFact, region: currentRegion, textureKey: foodConfig.textureKey }]);
      }
    };

    // Hanya terpicu saat kuliner benar-benar muncul di papan (drop atau hasil merge)
    const onFoodRevealed = (data: unknown) => handleCheckUnlock((data as any).tier);
    // Restart session clears the cache
    const onRestart = () => notifiedTiers.current.clear();

    EventBus.on('food-revealed', onFoodRevealed);
    EventBus.on('restart-game', onRestart);
    
    return () => {
      EventBus.off('food-revealed', onFoodRevealed);
      EventBus.off('restart-game', onRestart);
    };
  }, []);

  // Effect to process the queue sequentially
  useEffect(() => {
    if (!activeItem && queue.length > 0) {
      // Pop the first item from queue and show it
      setActiveItem(queue[0]);
      setQueue(prev => prev.slice(1));
    }
  }, [activeItem, queue]);

  // Effect to handle the animation timeout
  useEffect(() => {
    let timeoutId: number;
    if (activeItem) {
      // Tunggu sesuai durasi animasi CSS secara presisi (bali=kiri=3s, jogja=kanan=3.5s)
      const waitTime = activeItem.region === 'bali' ? 3000 : 3500;
      timeoutId = window.setTimeout(() => {
        setActiveItem(null);
      }, waitTime);
    }
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [activeItem]);

  if (!activeItem) return null;

  // Configuration based on region
  const isLeftSide = activeItem.region === 'bali' || activeItem.region === 'maluku';
  const npcAsset = `/assets/NPC/npc_${activeItem.region}.png`;
  const wrapperClass = isLeftSide ? 'npc-notification-wrapper npc-slide-left' : 'npc-notification-wrapper npc-slide-right';
  const bubbleClass = isLeftSide ? 'npc-bubble bubble-left' : 'npc-bubble bubble-right';

  return (
    <div key={activeItem.foodName} className={wrapperClass}>
      {/* If Left side (Bali), show NPC first, then bubble */}
      {isLeftSide && <img src={npcAsset} alt="NPC" className="npc-image" />}
      
      <div className={bubbleClass}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <img src={`/assets/foods_${activeItem.region}/${activeItem.textureKey}.png`} alt={activeItem.foodName} style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          <div style={{ color: '#8b4513', fontWeight: '800', fontSize: '15px' }}>
            {activeItem.foodName}
          </div>
        </div>
        <span>{activeItem.funFact}</span>
      </div>
      
      {/* If Right side (Jogja), show bubble first, then NPC */}
      {!isLeftSide && <img src={npcAsset} alt="NPC" className="npc-image" />}
    </div>
  );
}
