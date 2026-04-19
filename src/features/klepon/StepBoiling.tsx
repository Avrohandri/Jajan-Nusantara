import { useState, useRef, useEffect } from 'react';

interface Props {
  onComplete: () => void;
}

const KLEPON_COUNT = 3;

export function StepBoiling({ onComplete }: Props) {
  const [inPan, setInPan] = useState<boolean[]>(Array(KLEPON_COUNT).fill(false));
  const [boiling, setBoiling] = useState(false);
  const [done, setDone] = useState(false);
  const [bubbles, setBubbles] = useState<{ id: number; x: number }[]>([]);
  const panRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const bubbleIdRef = useRef(0);
  const bubbleInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);
  const boilingStartedRef = useRef(false);

  const allIn = inPan.every(Boolean);

  useEffect(() => {
    if (allIn && !boilingStartedRef.current) {
      boilingStartedRef.current = true;
      setBoiling(true);
      // Start bubble animation
      bubbleInterval.current = setInterval(() => {
        setBubbles(prev => {
          const newBubble = { id: bubbleIdRef.current++, x: 20 + Math.random() * 60 };
          return [...prev.slice(-8), newBubble];
        });
      }, 250);
      // Complete after 2.5s
      setTimeout(() => {
        if (bubbleInterval.current) clearInterval(bubbleInterval.current);
        setDone(true);
        setTimeout(() => {
          if (!completedRef.current) {
            completedRef.current = true;
            onComplete();
          }
        }, 500);
      }, 2500);
    }
    return () => { if (bubbleInterval.current) clearInterval(bubbleInterval.current); };
  }, [allIn, onComplete]);

  const dropKlepon = (idx: number) => {
    if (inPan[idx]) return;
    setInPan(prev => { const n = [...prev]; n[idx] = true; return n; });
  };

  // Mouse drag
  const handleDragStart = (e: React.DragEvent, idx: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('kleponIdx', String(idx));
  };

  const handlePanDragOver = (e: React.DragEvent) => e.preventDefault();

  const handlePanDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const idx = parseInt(e.dataTransfer.getData('kleponIdx'));
    if (!isNaN(idx)) dropKlepon(idx);
  };

  // Touch drag
  const handleTouchStart = (e: React.TouchEvent, idx: number) => {
    const touch = e.touches[0];
    const ghost = document.createElement('div');
    ghost.style.cssText = `position:fixed;left:${touch.clientX - 45}px;top:${touch.clientY - 45}px;width:90px;height:90px;pointer-events:none;z-index:999;filter:drop-shadow(0 6px 12px rgba(0,0,0,0.3))`;
    ghost.innerHTML = `<img src="/assets/klepon/adonan_isi.png" style="width:100%;height:100%;object-fit:contain;" />`;
    ghost.dataset.idx = String(idx);
    document.body.appendChild(ghost);
    ghostRef.current = ghost;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (ghostRef.current) {
      ghostRef.current.style.left = `${touch.clientX - 25}px`;
      ghostRef.current.style.top = `${touch.clientY - 25}px`;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!ghostRef.current) return;
    const idx = parseInt(ghostRef.current.dataset.idx || '');
    document.body.removeChild(ghostRef.current);
    ghostRef.current = null;

    const touch = e.changedTouches[0];
    const pan = panRef.current;
    if (pan) {
      const rect = pan.getBoundingClientRect();
      if (
        touch.clientX >= rect.left && touch.clientX <= rect.right &&
        touch.clientY >= rect.top && touch.clientY <= rect.bottom
      ) {
        dropKlepon(idx);
      }
    }
  };

  return (
    <div className="klepon-step-content">
      <p className="klepon-instruction">
        Drag klepon ke dalam panci perebus! 🫕
      </p>

      {/* Kompor & Panci */}
      <div className="boiling-scene">
        <div className="stove-area">

          <div
            ref={panRef}
            className={`pan ${boiling ? 'pan-boiling' : ''}`}
            onDragOver={handlePanDragOver}
            onDrop={handlePanDrop}
          >
            <span className="pan-emoji">🫕</span>
            <div className="pan-contents">
              {inPan.map((inn, i) =>
                inn ? (
                  <img
                    key={i}
                    src="/assets/klepon/adonan_isi.png"
                    alt="adonan"
                    className={`pan-klepon-img ${boiling ? 'klepon-floating' : ''}`}
                    style={{ animationDelay: `${i * 0.3}s` }}
                  />
                ) : null
              )}
              {boiling && bubbles.map(b => (
                <span
                  key={b.id}
                  className="bubble"
                  style={{ left: `${b.x}%` }}
                >
                  💧
                </span>
              ))}
            </div>
            {allIn || (
              <span className="pan-hint">Drop di sini</span>
            )}
          </div>
          <div className="flame-row">
            {['🔥', '🔥', '🔥'].map((f, i) => (
              <span key={i} className="flame" style={{ animationDelay: `${i * 0.15}s` }}>{f}</span>
            ))}
          </div>
        </div>

        {/* Klepon yang belum masuk */}
        <div className="klepon-source-row">
          {inPan.map((inn, idx) =>
            !inn ? (
              <div
                key={idx}
                className="klepon-draggable"
                draggable
                onDragStart={e => handleDragStart(e, idx)}
                onTouchStart={e => handleTouchStart(e, idx)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <img src="/assets/klepon/adonan_isi.png" alt="adonan" className="source-klepon-img" />
              </div>
            ) : null
          )}
        </div>
      </div>

      {boiling && !done && (
        <p className="boiling-status">💧 Merebus... tunggu sebentar!</p>
      )}
      {done && (
        <p className="boiling-status" style={{ color: '#7CAD58' }}>✅ Klepon matang!</p>
      )}
    </div>
  );
}
