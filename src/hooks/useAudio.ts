/**
 * useAudio — Global audio manager hook
 *
 * - BGM  : "Gamelan Garden (BGM GAME) FINAL.mp3" — loop terus selama app berjalan
 * - SFX  : dikelola langsung di PhaserGame.tsx via Web Audio API
 *
 * Toggle musik & SFX disambungkan ke isMusicOn / isSfxOn dari gameStore
 * sehingga tombol di SettingsScreen langsung berefek.
 */

import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

const BGM_SRC = '/assets/musik/Gamelan Garden (BGM GAME) FINAL.mp3';

export function useAudio() {
  const isMusicOn = useGameStore(s => s.isMusicOn);

  const bgmRef = useRef<HTMLAudioElement | null>(null);

  // ─── Inisialisasi BGM satu kali ────────────────────────────────────────────
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

  // ─── Reaksi terhadap toggle Musik ─────────────────────────────────────────
  useEffect(() => {
    const bgm = bgmRef.current;
    if (!bgm) return;

    if (isMusicOn) {
      bgm.play().catch(() => {
        // Autoplay diblokir browser — coba lagi saat ada interaksi user pertama
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
