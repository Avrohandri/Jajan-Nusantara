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
    setDraggingSugar(true);
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
    ghost.style.cssText = `position:fixed;left:${touch.clientX - 24}px;top:${touch.clientY - 24}px;font-size:40px;pointer-events:none;z-index:999;`;
    ghost.textContent = '🟫';
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

  const shapeDegrees = [0, 33, -25];

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
              }}
            >
              <span style={{ fontSize: '48px' }}>🟤</span>
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
            Drag gula merah ke dalam setiap klepon! 🟫→🟢
          </p>
          <div className="sugar-source">
            <div
              ref={sugarRef}
              className={`sugar-block ${draggingSugar ? 'sugar-dragging' : ''}`}
              draggable
              onDragStart={handleSugarDragStart}
              onDragEnd={() => setDraggingSugar(false)}
              onTouchStart={handleSugarTouchStart}
              onTouchMove={handleSugarTouchMove}
              onTouchEnd={handleSugarTouchEnd}
            >
              <span style={{ fontSize: '40px' }}>🟫</span>
              <span style={{ fontSize: '12px', fontWeight: 700 }}>Gula Merah</span>
            </div>
          </div>

          <div className="klepon-balls-row">
            {Array.from({ length: KLEPON_COUNT }).map((_, idx) => (
              <div
                key={idx}
                className="klepon-ball"
                style={{ transform: `rotate(${shapeDegrees[idx]}deg)` }}
                onDragOver={handleKleponDragOver}
                onDrop={e => handleKleponDrop(e, idx)}
              >
                {sugarDropped[idx] ? (
                  <>
                    <span style={{ fontSize: '44px' }}>🟢</span>
                    <span className="sugar-filled-badge">✅</span>
                  </>
                ) : (
                  <span style={{ fontSize: '44px' }}>⚪</span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
