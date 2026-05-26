/**
 * useSfx — SFX manager hook (Web Audio API)
 *
 * Menyediakan tiga fungsi SFX:
 *  - playButtonClick()  : SFX universal saat tombol ditekan         — volume 145%
 *  - playStepComplete() : SFX saat step minigame memasak selesai    — volume 110%
 *  - playDropSfx()      : SFX saat kuliner dijatuhkan di drop&merge — volume 145%
 *                         (sama dengan button click, alias dari playButtonClick)
 *
 * File SFX ditempatkan di:
 *  📁 public/assets/sfx/
 *     ├── button_click.mp3    ← SFX tombol universal & drop kuliner
 *     └── step_complete.mp3   ← SFX step minigame selesai
 *
 * ─── Prioritas buffer ────────────────────────────────────────────────────────
 * 1. Buffer yang sudah di-decode oleh useGlobalPreload (window.__sfxBuffers)
 * 2. Buffer internal _buffers yang di-decode oleh hook ini sendiri
 * 3. Fallback HTMLAudioElement jika Web Audio belum siap
 *
 * Volume melebihi 1.0 dimungkinkan dengan GainNode (HTMLAudio max 1.0).
 */

import { useCallback, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

const SFX_BUTTON = '/assets/sfx/button_click.mp3';
const SFX_STEP   = '/assets/sfx/step_complete.mp3';

// ── Internal AudioContext & buffer cache ──────────────────────────────────────
let _audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!_audioCtx) {
    _audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (_audioCtx.state === 'suspended') {
    _audioCtx.resume().catch(() => {});
  }
  return _audioCtx;
}

/** Buffer lokal — di-populate oleh loadOwnBuffer() jika preload global belum ada */
const _ownBuffers: { button: AudioBuffer | null; step: AudioBuffer | null } = {
  button: null,
  step: null,
};

async function loadOwnBuffer(key: 'button' | 'step', url: string): Promise<void> {
  if (_ownBuffers[key]) return;
  try {
    const ctx = getAudioCtx();
    const res = await fetch(url);
    if (!res.ok) return;
    const ab = await res.arrayBuffer();
    _ownBuffers[key] = await ctx.decodeAudioData(ab);
  } catch {
    // file belum ada / gagal — diabaikan
  }
}

/** Ambil buffer: prioritaskan cache preload global, lalu internal */
function getBuffer(key: 'button' | 'step'): AudioBuffer | null {
  const global = (window as any).__sfxBuffers;
  if (global && global[key]) return global[key];
  return _ownBuffers[key];
}

/** Putar AudioBuffer dengan gain tertentu (bisa > 1.0) */
function playAudioBuffer(buffer: AudioBuffer, gain: number) {
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
    // senyap
  }
}

// ── Fallback HTMLAudioElement (jika Web Audio belum siap) ─────────────────────
let _fallbackBtn: HTMLAudioElement | null = null;
let _fallbackStep: HTMLAudioElement | null = null;

function getFallbackBtn(): HTMLAudioElement {
  if (!_fallbackBtn) { _fallbackBtn = new Audio(SFX_BUTTON); _fallbackBtn.preload = 'auto'; }
  return _fallbackBtn;
}
function getFallbackStep(): HTMLAudioElement {
  if (!_fallbackStep) { _fallbackStep = new Audio(SFX_STEP); _fallbackStep.preload = 'auto'; }
  return _fallbackStep;
}

// ── Warm-up: load buffer sendiri jika useGlobalPreload belum jalan ─────────────
if (typeof window !== 'undefined') {
  setTimeout(() => {
    loadOwnBuffer('button', SFX_BUTTON).catch(() => {});
    loadOwnBuffer('step', SFX_STEP).catch(() => {});
  }, 1000);
}

// ─────────────────────────────────────────────────────────────────────────────
export function useSfx() {
  const isSfxOn = useGameStore(s => s.isSfxOn);
  const isSfxOnRef = useRef(isSfxOn);
  isSfxOnRef.current = isSfxOn;

  /**
   * Putar SFX klik tombol — volume 145%.
   * Juga dipakai sebagai SFX drop kuliner di permainan.
   */
  const playButtonClick = useCallback(() => {
    if (!isSfxOnRef.current) return;
    const buffer = getBuffer('button');
    if (buffer) {
      playAudioBuffer(buffer, 1.45);          // 145% via GainNode
    } else {
      // Fallback: HTMLAudio (dikap 1.0, plus trigger load buffer)
      try {
        const audio = getFallbackBtn();
        audio.currentTime = 0;
        audio.volume = 1.0;
        audio.play().catch(() => {});
        loadOwnBuffer('button', SFX_BUTTON).catch(() => {});
      } catch { /* senyap */ }
    }
  }, []);

  /**
   * Putar SFX selesainya satu step minigame — volume 110%.
   */
  const playStepComplete = useCallback(() => {
    if (!isSfxOnRef.current) return;
    const buffer = getBuffer('step');
    if (buffer) {
      playAudioBuffer(buffer, 1.1);          // 110% via GainNode
    } else {
      try {
        const audio = getFallbackStep();
        audio.currentTime = 0;
        audio.volume = 1.0;
        audio.play().catch(() => {});
        loadOwnBuffer('step', SFX_STEP).catch(() => {});
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
