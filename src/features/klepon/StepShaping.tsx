import { useState, useRef } from 'react';

interface Props {
  onComplete: () => void;
}

const TAPS_NEEDED = 3;
const KLEPON_COUNT = 3;

export function StepShaping({ onComplete }: Props) {
  const [tapCount, setTapCount] = useState(0);
  const [sugarDropped, setSugarDropped] = useState<boolean[]>(Array(KLEPON_COUNT).fill(false));
  const [draggingSugar, setDraggingSugar] = useState(false);
  const [phase, setPhase] = useState<'tapping' | 'filling' | 'done'>('tapping');
  const sugarRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);

  const handleTap = () => {
    if (phase !== 'tapping') return;
    const next = tapCount + 1;
    setTapCount(next);
    if (next >= TAPS_NEEDED) {
      setPhase('filling');
    }
  };

  // Mouse drag sugar
  const handleSugarDragStart = (e: React.DragEvent) => {
    // Delay setting dragging state so browser can capture full-opacity drag ghost
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
      const next = [...prev];
      next[idx] = true;
      const allDone = next.every(Boolean);
      if (allDone) {
        setPhase('done');
        setTimeout(() => onComplete(), 800);
      }
      return next;
    });
  };

  // Touch support for sugar drag
  const handleSugarTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setDraggingSugar(true);
    const ghost = document.createElement('div');
    ghost.style.cssText = `position:fixed;left:${touch.clientX - 24}px;top:${touch.clientY - 24}px;width:40px;height:40px;pointer-events:none;z-index:999;`;
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


  return (
    <div className="klepon-step-content">
      {phase === 'tapping' && (
        <>
          <p className="klepon-instruction">
            Tap untuk membentuk adonan menjadi bulat! 👆
          </p>
          <div className="shaping-area" onClick={handleTap}>
            <div
              className="dough-blob"
              style={{
                borderRadius: `${30 + tapCount * 20}% ${30 + tapCount * 10}% ${30 + tapCount * 25}% ${30 + tapCount * 15}%`,
                transform: `scale(${0.85 + tapCount * 0.05})`,
                backgroundColor: '#7CAD58', // Pandan green
                width: '100px',
                height: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset -5px -5px 10px rgba(0,0,0,0.1)'
              }}
            >
            </div>
            <div className="tap-progress-row">
              {Array.from({ length: TAPS_NEEDED }).map((_, i) => (
                <span key={i} className={`tap-dot ${i < tapCount ? 'tap-dot-filled' : ''}`} />
              ))}
            </div>
            <span className="tap-hint">Tap {TAPS_NEEDED - tapCount}×</span>
          </div>
        </>
      )}

      {(phase === 'filling' || phase === 'done') && (
        <>
          <p className="klepon-instruction">
            Drag gula merah ke dalam setiap klepon!
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
              <img src="/assets/klepon/ing_gula.png" style={{ width: '90px', height: '90px', objectFit: 'contain', filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.2))' }} alt="Gula" />
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
                <img src="/assets/klepon/adonan_klepon_noalas.png" style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Adonan Klepon" />
                {sugarDropped[idx] && (
                  <span className="sugar-filled-badge">✅</span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
