import { useState, useRef } from 'react';

interface Props {
  onComplete: () => void;
}

const KLEPON_COUNT = 3;

export function StepCoating({ onComplete }: Props) {
  const [coated, setCoated] = useState<boolean[]>(Array(KLEPON_COUNT).fill(false));
  const [dragging, setDragging] = useState(false);
  const ghostRef = useRef<HTMLDivElement | null>(null);

  const coatKlepon = (idx: number) => {
    setCoated(prev => {
      const next = [...prev];
      next[idx] = true;
      if (next.every(Boolean)) {
        setTimeout(() => onComplete(), 700);
      }
      return next;
    });
  };

  // Mouse drag from coconut source
  const handleDragStart = (e: React.DragEvent) => {
    setDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('coconut', '1');
  };

  const handleKleponDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleKleponDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDragging(false);
    if (!coated[idx]) coatKlepon(idx);
  };

  // Touch drag
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setDragging(true);
    const ghost = document.createElement('div');
    ghost.style.cssText = `position:fixed;left:${touch.clientX - 60}px;top:${touch.clientY - 60}px;width:120px;height:120px;pointer-events:none;z-index:999;filter:drop-shadow(0 6px 12px rgba(0,0,0,0.3))`;
    ghost.innerHTML = `<img src="/assets/klepon/kelapa_parut.png" style="width:100%;height:100%;object-fit:contain;" />`;
    document.body.appendChild(ghost);
    ghostRef.current = ghost;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (ghostRef.current) {
      ghostRef.current.style.left = `${touch.clientX - 28}px`;
      ghostRef.current.style.top = `${touch.clientY - 28}px`;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (ghostRef.current) {
      document.body.removeChild(ghostRef.current);
      ghostRef.current = null;
    }
    setDragging(false);
    const touch = e.changedTouches[0];
    const balls = document.querySelectorAll('.coatable-klepon');
    balls.forEach((ball, idx) => {
      const rect = ball.getBoundingClientRect();
      if (
        touch.clientX >= rect.left && touch.clientX <= rect.right &&
        touch.clientY >= rect.top && touch.clientY <= rect.bottom &&
        !coated[idx]
      ) {
        coatKlepon(idx);
      }
    });
  };

  const allCoated = coated.every(Boolean);
  const coatedCount = coated.filter(Boolean).length;

  return (
    <div className="klepon-step-content">
      <p className="klepon-instruction">
        Taburi setiap klepon dengan kelapa parut!
      </p>

      {/* Coconut source */}
      <div className="coconut-source">
        <div
          className={`coconut-bowl ${dragging ? 'coconut-dragging' : ''}`}
          draggable
          onDragStart={handleDragStart}
          onDragEnd={() => setDragging(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img src="/assets/klepon/kelapa_parut.png" alt="kelapa parut" className="source-coconut-img" />
        </div>
      </div>

      {/* Plate with klepon */}
      <div className="plate-area">
        <div className="serving-plate">
          <div className="plate-klepon-row">
            {Array.from({ length: KLEPON_COUNT }).map((_, idx) => (
              <div
                key={idx}
                className={`coatable-klepon ${coated[idx] ? 'klepon-coated' : ''}`}
                onDragOver={handleKleponDragOver}
                onDrop={e => handleKleponDrop(e, idx)}
              >
                {coated[idx] ? (
                  <img src="/assets/klepon/adonan_kelapa.png" alt="klepon kelapa" className="plate-klepon-img" draggable={false} />
                ) : (
                  <img src="/assets/klepon/adonan_bundar.png" alt="klepon" className="plate-klepon-img" draggable={false} />
                )}
              </div>
            ))}
          </div>

        </div>
      </div>

      <div className="coat-progress">
        {Array.from({ length: KLEPON_COUNT }).map((_, i) => (
          <span key={i} className={`coat-dot ${i < coatedCount ? 'coat-dot-filled' : ''}`} />
        ))}
      </div>

      {allCoated && (
        <p className="coating-done">Klepon siap disajikan!</p>
      )}
    </div>
  );
}
