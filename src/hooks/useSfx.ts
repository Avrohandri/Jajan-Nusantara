/**
 * useSfx — SFX manager hook
 *
 * Menyediakan dua fungsi SFX:
 *  - playButtonClick() : SFX universal saat tombol ditekan
 *  - playStepComplete() : SFX saat step minigame memasak selesai
 *
 * File SFX ditempatkan di:
 *  📁 public/assets/sfx/
 *     ├── button_click.mp3    ← SFX tombol universal
 *     └── step_complete.mp3   ← SFX step minigame selesai
 *
 * Keduanya tunduk pada toggle isSfxOn dari gameStore (Setting Suara).
 *
 * Cara pakai:
 *   const { playButtonClick, playStepComplete } = useSfx();
 *   <button onClick={() => { playButtonClick(); doSomething(); }} />
 */

import { useCallback, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

const SFX_BUTTON  = '/assets/sfx/button_click.mp3';
const SFX_STEP    = '/assets/sfx/step_complete.mp3';

// ── Pre-load audio objects sekali saja di module level ────────────────────────
// (Ini mencegah latensi pertama kali; browser cache-kan setelah load pertama.)
let _btnAudio: HTMLAudioElement | null = null;
let _stepAudio: HTMLAudioElement | null = null;

function getBtnAudio(): HTMLAudioElement {
  if (!_btnAudio) {
    _btnAudio = new Audio(SFX_BUTTON);
    _btnAudio.preload = 'auto';
  }
  return _btnAudio;
}

function getStepAudio(): HTMLAudioElement {
  if (!_stepAudio) {
    _stepAudio = new Audio(SFX_STEP);
    _stepAudio.preload = 'auto';
  }
  return _stepAudio;
}

export function useSfx() {
  const isSfxOn = useGameStore(s => s.isSfxOn);
  const isSfxOnRef = useRef(isSfxOn);
  isSfxOnRef.current = isSfxOn;

  /**
   * Putar SFX klik tombol (universal).
   * Panggil ini di onClick semua <button> di game.
   */
  const playButtonClick = useCallback(() => {
    if (!isSfxOnRef.current) return;
    try {
      const audio = getBtnAudio();
      // Reset posisi supaya bisa dipanggil berulang cepat
      audio.currentTime = 0;
      audio.volume = 0.7;
      audio.play().catch(() => {
        // Autoplay diblokir browser — diabaikan
      });
    } catch (_) {
      // Gagal senyap
    }
  }, []);

  /**
   * Putar SFX selesainya satu step minigame memasak.
   * Panggil ini di onComplete() setiap step.
   */
  const playStepComplete = useCallback(() => {
    if (!isSfxOnRef.current) return;
    try {
      const audio = getStepAudio();
      audio.currentTime = 0;
      audio.volume = 0.85;
      audio.play().catch(() => {});
    } catch (_) {
      // Gagal senyap
    }
  }, []);

  return { playButtonClick, playStepComplete };
}
