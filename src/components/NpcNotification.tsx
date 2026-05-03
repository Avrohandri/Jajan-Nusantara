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

  // Ref for the auto-dismiss timer so we can pause/resume it
  const timerRef = useRef<number | null>(null);
  const remainingRef = useRef<number>(0);   // ms remaining when paused
  const startedAtRef = useRef<number>(0);   // timestamp when timer last started

  /** Start or resume the dismiss countdown */
  const startTimer = (ms: number) => {
    if (timerRef.current !== null) return; // already running
    startedAtRef.current = performance.now();
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      remainingRef.current = 0;
      setActiveItem(null);
    }, ms);
  };

  /** Pause the dismiss countdown */
  const pauseTimer = () => {
    if (timerRef.current === null) return;
    window.clearTimeout(timerRef.current);
    timerRef.current = null;
    const elapsed = performance.now() - startedAtRef.current;
    remainingRef.current = Math.max(0, remainingRef.current - elapsed);
  };

  /** Resume the dismiss countdown with whatever time was left */
  const resumeTimer = () => {
    if (remainingRef.current > 0) {
      startTimer(remainingRef.current);
    }
  };

  // ── Subscribe to EventBus ──────────────────────────────────────────
  useEffect(() => {
    const handleCheckUnlock = (tier: number) => {
      if (notifiedTiers.current.has(tier)) return;

      const state = useGameStore.getState();
      const currentRegion = state.activeRegion || 'jogja';

      const configList = REGION_FOOD_CONFIGS_RAW[currentRegion];
      if (!configList) return;

      const foodConfig = configList.find((c) => c.tier === tier);

      if (foodConfig) {
        notifiedTiers.current.add(tier);

        let cleanName = foodConfig.name;
        if (cleanName.match(/^\d{2}_/)) cleanName = cleanName.substring(3);
        cleanName = cleanName.replace(/([A-Z])/g, ' $1').trim();

        let displayFact = foodConfig.funFact || 'Jajanan tradisional yang sangat lezat!';
        const separators = [' — ', ' - ', ': '];
        for (const sep of separators) {
          if (displayFact.includes(sep)) {
            displayFact = displayFact.split(sep).slice(1).join(sep).trim();
            break;
          }
        }

        setQueue(prev => [
          ...prev,
          { foodName: cleanName, funFact: displayFact, region: currentRegion, textureKey: foodConfig.textureKey },
        ]);
      }
    };

    const onFoodRevealed = (data: unknown) => handleCheckUnlock((data as any).tier);
    const onRestart = () => notifiedTiers.current.clear();

    EventBus.on('food-revealed', onFoodRevealed);
    EventBus.on('restart-game', onRestart);

    return () => {
      EventBus.off('food-revealed', onFoodRevealed);
      EventBus.off('restart-game', onRestart);
    };
  }, []);

  // ── Process queue sequentially ────────────────────────────────────
  useEffect(() => {
    if (!activeItem && queue.length > 0) {
      setActiveItem(queue[0]);
      setQueue(prev => prev.slice(1));
    }
  }, [activeItem, queue]);

  // ── Start the dismiss timer when a new item becomes active ────────
  useEffect(() => {
    if (!activeItem) return;

    const waitTime = activeItem.region === 'bali' ? 3000 : 3500;
    remainingRef.current = waitTime;

    // Only start immediately if quiz is NOT currently showing
    const { showQuiz } = useGameStore.getState();
    if (!showQuiz) {
      startTimer(waitTime);
    }

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeItem]);

  // ── Freeze / unfreeze timer when quiz opens / closes ─────────────
  const showQuiz = useGameStore((s) => s.showQuiz);

  useEffect(() => {
    if (!activeItem) return;
    if (showQuiz) {
      pauseTimer();
    } else {
      resumeTimer();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showQuiz]);

  if (!activeItem) return null;

  const isLeftSide = activeItem.region === 'bali' || activeItem.region === 'maluku';
  const npcAsset = `/assets/NPC/npc_${activeItem.region}.png`;
  const wrapperClass = isLeftSide
    ? 'npc-notification-wrapper npc-slide-left'
    : 'npc-notification-wrapper npc-slide-right';
  const bubbleClass = isLeftSide ? 'npc-bubble bubble-left' : 'npc-bubble bubble-right';

  return (
    <div key={activeItem.foodName} className={wrapperClass}>
      {isLeftSide && <img src={npcAsset} alt="NPC" className="npc-image" />}

      <div className={bubbleClass}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <img
            src={`/assets/foods_${activeItem.region}/${activeItem.textureKey}.png`}
            alt={activeItem.foodName}
            style={{ width: '28px', height: '28px', objectFit: 'contain' }}
          />
          <div style={{ color: '#8b4513', fontWeight: '800', fontSize: '15px' }}>
            {activeItem.foodName}
          </div>
        </div>
        <span>{activeItem.funFact}</span>
      </div>

      {!isLeftSide && <img src={npcAsset} alt="NPC" className="npc-image" />}
    </div>
  );
}
