import { useState, useRef, useEffect } from 'react';
import { useSfx } from '../../hooks/useSfx';
import { CognitiveInfoPopup } from './CognitiveInfoPopup';

interface Props {
  onComplete: () => void;
}

const TAPS_NEEDED = 3;
const KLEPON_COUNT = 3;

export function StepShaping({ onComplete }: Props) {
  const { playButtonClick } = useSfx();
  const [tapCount, setTapCount] = useState(0);
  const [sugarDropped, setSugarDropped] = useState<boolean[]>(Array(KLEPON_COUNT).fill(false));
  const [draggingSugar, setDraggingSugar] = useState(false);
  const [phase, setPhase] = useState<'tapping' | 'filling' | 'done'>('tapping');
  const [showSugarPopup, setShowSugarPopup] = useState(false);
  const sugarRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const completedRef = useRef(false);
  const sugarPopupShownRef = useRef(false);

  useEffect(() => {
    if (phase === 'filling' && sugarDropped.every(Boolean) && !completedRef.current) {
      completedRef.current = true;
      setPhase('done');
      setTimeout(() => onComplete(), 800);
    }
  }, [sugarDropped, phase, onComplete]);

  // Tampilkan popup ketika masuk fase filling
  useEffect(() => {
    if (phase === 'filling' && !sugarPopupShownRef.current) {
      sugarPopupShownRef.current = true;
      setTimeout(() => setShowSugarPopup(true), 300);
    }
  }, [phase]);

  const handleTap = () => {
    if (phase !== 'tapping') return;
    playButtonClick();
    const next = tapCount + 1;
    setTapCount(next);
    if (next >= TAPS_NEEDED) {
      setPhase('filling');
    }
  };

  const handleSugarDragStart = (e: React.DragEvent) => {
    playButtonClick();
    setTimeout(() => setDraggingSugar(true), 0);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleKleponDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleKleponDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDraggingSugar(false);
    dropSugar(idx);
  };

  const dropSugar = (idx: number) => {
    setSugarDropped(prev => {
      if (prev[idx]) return prev;
      const next = [...prev];
      next[idx] = true;
      return next;
    });
  };

  const handleSugarTouchStart = (e: React.TouchEvent) => {
    playButtonClick();
    const touch = e.touches[0];
    setDraggingSugar(true);
    const ghost = document.createElement('div');
    ghost.style.cssText = `position:fixed;left:${touch.clientX - 50}px;top:${touch.clientY - 50}px;width:100px;height:100px;pointer-events:none;z-index:999;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.3))`;
    ghost.innerHTML = `<img src="/assets/klepon/ing_gula.png" style="width:100%;height:100%;object-fit:contain;" />`;
    document.body.appendChild(ghost);
    ghostRef.current = ghost;
  };

  const handleSugarTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (ghostRef.current) {
      ghostRef.current.style.left = `${touch.clientX - 24}px`;
      ghostRef.current.style.top = `${touch.clientY - 24}px`;
    }
  };

  const handleSugarTouchEnd = (e: React.TouchEvent) => {
    if (ghostRef.current) {
      document.body.removeChild(ghostRef.current);
      ghostRef.current = null;
    }
    setDraggingSugar(false);
    const touch = e.changedTouches[0];
    const balls = document.querySelectorAll('.klepon-ball');
    balls.forEach((ball, idx) => {
      const rect = ball.getBoundingClientRect();
      if (
        touch.clientX >= rect.left && touch.clientX <= rect.right &&
        touch.clientY >= rect.top && touch.clientY <= rect.bottom &&
        !sugarDropped[idx]
      ) {
        dropSugar(idx);
      }
    });
  };

  const filledCount = sugarDropped.filter(Boolean).length;

  return (
    <div className="klepon-step-content">
      {phase === 'tapping' && (
        <>
          {/* Static info card — takaran adonan per klepon */}
          <div className="cog-static-card cog-static-card--compact">
            <div className="cog-static-label">🤲 Cara Membentuk Klepon</div>
            <div className="cog-static-rows">
              <div className="cog-static-row"><span>⚖️ Per 1 klepon</span><strong>±25 gram adonan</strong></div>
              <div className="cog-static-row"><span>📏 Ukuran</span><strong>Sebesar bola pingpong kecil</strong></div>
              <div className="cog-static-row"><span>👋 Teknik</span><strong>Pipihkan, buat cekungan di tengah</strong></div>
            </div>
          </div>

          <p className="klepon-instruction">
            Ketuk untuk membentuk adonan menjadi bulat! 👆
          </p>
          <div className="shaping-area" onClick={handleTap}>
            <img
              src={`/assets/klepon/${tapCount === 0 ? 'adonan 1' : tapCount === 1 ? 'adonan 2' : 'adonan_bundar'}.png`}
              alt="Adonan"
              style={{
                width: '120px',
                height: '120px',
                objectFit: 'contain',
                transform: `scale(${0.85 + tapCount * 0.05})`,
                transition: 'transform 0.2s ease-in-out'
              }}
            />
            <div className="tap-progress-row">
              {Array.from({ length: TAPS_NEEDED }).map((_, i) => (
                <span key={i} className={`tap-dot ${i < tapCount ? 'tap-dot-filled' : ''}`} />
              ))}
            </div>
            <span className="tap-hint">Ketuk {TAPS_NEEDED - tapCount}×</span>
          </div>
        </>
      )}

      {(phase === 'filling' || phase === 'done') && (
        <>
          {/* Static info saat fase isi gula */}
          <div className="cog-static-card cog-static-card--compact cog-static-card--sugar">
            <div className="cog-static-label">🍬 Cara Mengisi Gula Merah</div>
            <div className="cog-static-rows">
              <div className="cog-static-row"><span>⚖️ Per 1 klepon</span><strong>±1 sdt / ±5 gram</strong></div>
              <div className="cog-static-row"><span>👆 Langkah</span><strong>Lubangi dulu → isi gula → tutup rapat</strong></div>
              <div className="cog-static-row"><span>📊 Progress</span><strong>{filledCount}/{KLEPON_COUNT} klepon terisi</strong></div>
            </div>
          </div>

          <p className="klepon-instruction">
            Seret gula merah ke dalam setiap klepon!
          </p>
          <div className="sugar-source">
            <div
              ref={sugarRef}
              className={draggingSugar ? 'sugar-dragging' : ''}
              style={{ cursor: 'grab', touchAction: 'none', transition: 'transform 0.15s, opacity 0.15s', display: 'flex', justifyContent: 'center' }}
              draggable
              onDragStart={handleSugarDragStart}
              onDragEnd={() => setDraggingSugar(false)}
              onTouchStart={handleSugarTouchStart}
              onTouchMove={handleSugarTouchMove}
              onTouchEnd={handleSugarTouchEnd}
            >
              <img src="/assets/klepon/ing_gula.png" style={{ width: '120px', height: '120px', objectFit: 'contain', filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.25))' }} alt="Gula" />
            </div>
          </div>

          <div className="klepon-balls-row">
            {Array.from({ length: KLEPON_COUNT }).map((_, idx) => (
              <div
                key={idx}
                className="klepon-ball"
                style={{ border: 'none', background: 'transparent' }}
                onDragOver={handleKleponDragOver}
                onDrop={e => handleKleponDrop(e, idx)}
              >
                <img src={`/assets/klepon/${sugarDropped[idx] ? 'adonan_isi' : 'adonan_bolong'}.png`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Adonan Klepon" />
                {sugarDropped[idx] && (
                  <span className="sugar-filled-badge">✅</span>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Popup info saat masuk fase isi gula merah */}
      {showSugarPopup && (
        <CognitiveInfoPopup
          title="🍬 Cara Mengisi Gula Merah"
          subtitle="Rahasia isian klepon yang tidak bocor!"
          accentColor="#8B4513"
          items={[
            { icon: '⚖️', label: 'Takaran gula per 1 klepon', value: '±1 sdt / ±5 gram', highlight: true },
            { icon: '👆', label: 'Langkah 1', value: 'Lubangi adonan dengan ibu jari hingga setengah kedalaman' },
            { icon: '🍬', label: 'Langkah 2', value: 'Masukkan gula merah sisir ke dalam lubang' },
            { icon: '🤲', label: 'Langkah 3', value: 'Tutup lubang rapat-rapat & bulatkan kembali' },
            { icon: '⚠️', label: 'Penting!', value: 'Pastikan tidak ada celah agar gula tidak bocor saat dikukus', highlight: true },
          ]}
          tip="Gunakan gula merah yang sudah disisir halus agar lebih mudah masuk ke dalam adonan!"
          onClose={() => setShowSugarPopup(false)}
        />
      )}
    </div>
  );
}
