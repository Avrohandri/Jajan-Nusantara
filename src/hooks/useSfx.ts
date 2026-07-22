
import { useCallback, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

const SFX_BUTTON = '/assets/sfx/button_click.mp3';
const SFX_STEP   = '/assets/sfx/step_complete.mp3';

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
  }
}

function getBuffer(key: 'button' | 'step'): AudioBuffer | null {
  const global = (window as any).__sfxBuffers;
  if (global && global[key]) return global[key];
  return _ownBuffers[key];
}

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
  }
}

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

if (typeof window !== 'undefined') {
  setTimeout(() => {
    loadOwnBuffer('button', SFX_BUTTON).catch(() => {});
    loadOwnBuffer('step', SFX_STEP).catch(() => {});
  }, 1000);
}

export function useSfx() {
  const isSfxOn = useGameStore(s => s.isSfxOn);
  const isSfxOnRef = useRef(isSfxOn);
  isSfxOnRef.current = isSfxOn;

  const playButtonClick = useCallback(() => {
    if (!isSfxOnRef.current) return;
    const buffer = getBuffer('button');
    if (buffer) {
      playAudioBuffer(buffer, 1.45);
    } else {
      try {
        const audio = getFallbackBtn();
        audio.currentTime = 0;
        audio.volume = 1.0;
        audio.play().catch(() => {});
        loadOwnBuffer('button', SFX_BUTTON).catch(() => {});
      } catch {  }
    }
  }, []);

  const playStepComplete = useCallback(() => {
    if (!isSfxOnRef.current) return;
    const buffer = getBuffer('step');
    if (buffer) {
      playAudioBuffer(buffer, 1.1);
    } else {
      try {
        const audio = getFallbackStep();
        audio.currentTime = 0;
        audio.volume = 1.0;
        audio.play().catch(() => {});
        loadOwnBuffer('step', SFX_STEP).catch(() => {});
      } catch {  }
    }
  }, []);

  const playDropSfx = playButtonClick;

  return { playButtonClick, playStepComplete, playDropSfx };
}
