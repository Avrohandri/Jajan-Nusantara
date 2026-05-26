/**
 * useSfx — SFX manager hook (Web Audio API)
 *
 * Menyediakan tiga fungsi SFX:
 *  - playButtonClick()  : SFX universal saat tombol ditekan         — volume 120%
 *  - playStepComplete() : SFX saat step minigame memasak selesai    — volume 110%
 *  - playDropSfx()      : SFX saat kuliner dijatuhkan di drop&merge — volume 120%
 *                         (sama dengan button click, alias dari playButtonClick)
 *
 * File SFX ditempatkan di:
 *  📁 public/assets/sfx/
 *     ├── button_click.mp3    ← SFX tombol universal & drop kuliner
 *     └── step_complete.mp3   ← SFX step minigame selesai
 *
 * Semua SFX tunduk pada toggle isSfxOn dari gameStore (Setting Suara).
 *
 * Volume MELEBIHI 1.0 dimungkinkan dengan Web Audio API GainNode.
 * HTMLAudioElement.volume dibatasi 0–1, namun GainNode.gain.value bisa > 1.
 *
 * Cara pakai:
 *   const { playButtonClick, playStepComplete, playDropSfx } = useSfx();
 *   <button onClick={() => { playButtonClick(); doSomething(); }} />
 */

import { useCallback, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

const SFX_BUTTON = '/assets/sfx/button_click.mp3';
const SFX_STEP   = '/assets/sfx/step_complete.mp3';

// ── Web Audio API context — dibuat sekali di module level ─────────────────────
let _audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!_audioCtx) {
    _audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  // Resume jika suspended (autoplay policy browser)
  if (_audioCtx.state === 'suspended') {
    _audioCtx.resume().catch(() => {});
  }
  return _audioCtx;
}

// ── Cache decoded buffer ───────────────────────────────────────────────────────
const _buffers: Record<string, AudioBuffer | null> = {
  button: null,
  step: null,
};

async function loadBuffer(key: 'button' | 'step', url: string): Promise<AudioBuffer | null> {
  if (_buffers[key]) return _buffers[key];
  try {
    const ctx = getAudioCtx();
    const res = await fetch(url);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    const decoded = await ctx.decodeAudioData(arrayBuffer);
    _buffers[key] = decoded;
    return decoded;
  } catch {
    return null;
  }
}

// Preload kedua buffer di background saat module pertama kali di-import
if (typeof window !== 'undefined') {
  // Delay kecil agar AudioContext tidak dibuat sebelum ada interaksi user
  setTimeout(() => {
    loadBuffer('button', SFX_BUTTON).catch(() => {});
    loadBuffer('step', SFX_STEP).catch(() => {});
  }, 500);
}

/**
 * Putar buffer dengan gain (volume) tertentu.
 * gain > 1.0 = lebih keras dari normal (120% = 1.2, 110% = 1.1)
 */
function playBuffer(buffer: AudioBuffer, gain: number) {
  try {
    const ctx = getAudioCtx();
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gainNode = ctx.createGain();
    gainNode.gain.value = gain;

    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start(0);
  } catch {
    // Gagal senyap
  }
}

/**
 * Fallback HTMLAudioElement — dipakai saat Web Audio belum berhasil decode buffer
 */
let _fallbackBtn: HTMLAudioElement | null = null;
let _fallbackStep: HTMLAudioElement | null = null;

function getFallbackBtn(): HTMLAudioElement {
  if (!_fallbackBtn) {
    _fallbackBtn = new Audio(SFX_BUTTON);
    _fallbackBtn.preload = 'auto';
  }
  return _fallbackBtn;
}
function getFallbackStep(): HTMLAudioElement {
  if (!_fallbackStep) {
    _fallbackStep = new Audio(SFX_STEP);
    _fallbackStep.preload = 'auto';
  }
  return _fallbackStep;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useSfx() {
  const isSfxOn = useGameStore(s => s.isSfxOn);
  const isSfxOnRef = useRef(isSfxOn);
  isSfxOnRef.current = isSfxOn;

  /**
   * Putar SFX klik tombol — volume 120%.
   * Juga dipakai sebagai SFX drop kuliner di permainan.
   */
  const playButtonClick = useCallback(() => {
    if (!isSfxOnRef.current) return;
    if (_buffers.button) {
      // Web Audio — bisa > 1.0
      playBuffer(_buffers.button, 1.2);
    } else {
      // Fallback HTMLAudio (volume dikap 1.0)
      try {
        const audio = getFallbackBtn();
        audio.currentTime = 0;
        audio.volume = 1.0;
        audio.play().catch(() => {});
        // Coba load buffer untuk kali berikutnya
        loadBuffer('button', SFX_BUTTON).catch(() => {});
      } catch { /* senyap */ }
    }
  }, []);

  /**
   * Putar SFX selesainya satu step minigame — volume 110%.
   */
  const playStepComplete = useCallback(() => {
    if (!isSfxOnRef.current) return;
    if (_buffers.step) {
      playBuffer(_buffers.step, 1.1);
    } else {
      try {
        const audio = getFallbackStep();
        audio.currentTime = 0;
        audio.volume = 1.0;
        audio.play().catch(() => {});
        loadBuffer('step', SFX_STEP).catch(() => {});
      } catch { /* senyap */ }
    }
  }, []);

  /**
   * Alias playButtonClick — dipakai di GameScreen untuk SFX drop kuliner.
   * Dipanggil dari React ketika EventBus emit 'drop-sfx'.
   */
  const playDropSfx = playButtonClick;

  return { playButtonClick, playStepComplete, playDropSfx };
}
