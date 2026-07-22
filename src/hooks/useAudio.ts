
import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

const BGM_SRC = '/assets/musik/Gamelan Garden (BGM GAME) FINAL.mp3';

export function useAudio() {
  const isMusicOn = useGameStore(s => s.isMusicOn);

  const bgmRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const bgm = new Audio(BGM_SRC);
    bgm.loop = true;
    bgm.volume = 0.5;
    bgmRef.current = bgm;

    return () => {
      bgm.pause();
      bgm.src = '';
    };
  }, []);

  useEffect(() => {
    const bgm = bgmRef.current;
    if (!bgm) return;

    if (isMusicOn) {
      bgm.play().catch(() => {
        const resume = () => {
          if (bgmRef.current && useGameStore.getState().isMusicOn) {
            bgmRef.current.play().catch(() => {});
          }
        };
        document.addEventListener('pointerdown', resume, { once: true });
        document.addEventListener('keydown', resume, { once: true });
      });
    } else {
      bgm.pause();
    }
  }, [isMusicOn]);
}
