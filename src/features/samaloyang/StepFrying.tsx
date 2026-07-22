import { useState, useRef, useEffect } from 'react';
import { useSfx } from '../../hooks/useSfx';

interface Props {
  onComplete: () => void;
}

export function StepFrying({ onComplete }: Props) {
  const { playButtonClick } = useSfx();
  const [isDone, setIsDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDipped, setIsDipped] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const oilPanRef = useRef<HTMLDivElement>(null);

  const startDrag = (x: number, y: number) => {
    if (isDone || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setIsDragging(true);
    setPointerPos({ x: x - rect.left, y: y - rect.top });
  };

  const moveDrag = (x: number, y: number) => {
    if (!isDragging || isDone || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relX = x - rect.left;
    const relY = y - rect.top;
    setPointerPos({ x: relX, y: relY });

    if (oilPanRef.current) {
      const panRect = oilPanRef.current.getBoundingClientRect();
      const inOil =
        x >= panRect.left && x <= panRect.right &&
        y >= panRect.top && y <= panRect.bottom;
      
      setIsDipped(inOil);
    }
  };

  const endDrag = () => {
    setIsDragging(false);
    setIsDipped(false);
    if (!isDone) {
      if (progress >= 100) {
        setIsDone(true);
        setTimeout(onComplete, 1000);
      } else {
        setProgress(0);
      }
    }
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isDipped && !isDone) {
      interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) return 100;
          return p + 1;
        });
      }, 50);
    } else {
      if (progress < 100 && !isDone) setProgress(0);
    }
    return () => clearInterval(interval);
  }, [isDipped, isDone, progress]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    playButtonClick();
    startDrag(e.clientX, e.clientY);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    moveDrag(e.clientX, e.clientY);
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    endDrag();
  };

  return (
    <div className="klepon-step-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <p className="klepon-instruction" style={{ textAlign: 'center', zIndex: 11 }}>
        {isDone ? 'Samaloyang Matang! ✨' : progress >= 100 ? 'Matang! Tarik cetakan keluar!' : progress > 0 ? 'Tahan di minyak panas!' : 'Celupkan cetakan ke minyak panas hingga matang!'}
      </p>

      {}
      <div 
        ref={containerRef}
        style={{ position: 'relative', width: '300px', height: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        
        {}
        {!isDone && (
          <div style={{
            position: 'absolute',
            left: isDragging ? `${pointerPos.x}px` : '50%',
            top: isDragging ? `${pointerPos.y}px` : '20px',
            transform: isDragging ? 'translate(-50%, -80%)' : 'translateX(-50%)',
            zIndex: 5,
            pointerEvents: 'none',
            transition: isDragging ? 'none' : 'all 0.3s ease-out'
          }}>
            <img
              src="/assets/samaloyang/cetakan_berisi.png"
              alt="Cetakan Berisi"
              draggable={false}
              style={{
                height: '240px', width: '140px', objectFit: 'contain',
                filter: progress >= 100 
                  ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.5)) sepia(0.8) hue-rotate(-20deg) brightness(0.8)'
                  : 'drop-shadow(0 4px 8px rgba(0,0,0,0.5)) sepia(0.1) brightness(1.1)'
              }}
            />
          </div>
        )}

        {}
        <div 
          ref={oilPanRef}
          style={{
            position: 'absolute', bottom: 0,
            width: '260px', height: '140px',
            background: '#E65100',
            borderRadius: '20px 20px 100px 100px',
            border: '6px solid #212121',
            borderTopWidth: '10px',
            boxShadow: 'inset 0 -20px 40px rgba(0,0,0,0.4), 0 10px 20px rgba(0,0,0,0.3), 0 -10px 30px rgba(255,140,0,0.4)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            overflow: 'hidden',
            zIndex: 10
          }}
        >
          {}
          <div style={{
            position: 'absolute', top: '10px', left: '-20px', right: '-20px', height: '40px',
            background: 'rgba(255, 140, 0, 0.6)',
            borderRadius: '50%',
            boxShadow: isDipped ? 'inset 0 0 20px rgba(255,100,0,1)' : 'inset 0 -5px 10px rgba(0,0,0,0.1)',
            transition: 'box-shadow 0.3s'
          }}>
            {}
            {isDipped && (
              <div style={{ position: 'absolute', width: '100%', height: '100%', animation: 'boil 0.5s infinite alternate' }} />
            )}
          </div>
        </div>

        {}
        {isDone && (
          <div style={{ position: 'absolute', bottom: '150px', zIndex: 5, animation: 'floatUp 1s ease-out forwards' }}>
            <img
              src="/assets/samaloyang/cetakan_berisi.png"
              alt="Samaloyang Matang"
              style={{
                height: '240px', width: '140px', objectFit: 'contain',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5)) sepia(0.8) hue-rotate(-20deg) brightness(0.8)'
              }}
            />
          </div>
        )}

        {}
        <div style={{ display: 'flex', gap: '30px', position: 'absolute', bottom: '-25px', zIndex: 11 }}>
          <div style={{ fontSize: '32px', filter: 'drop-shadow(0 0 10px rgba(255,100,0,0.8))', animation: 'floatUp 0.8s ease-in-out infinite alternate', animationDelay: '0s' }}>🔥</div>
          <div style={{ fontSize: '40px', filter: 'drop-shadow(0 0 10px rgba(255,100,0,0.8))', animation: 'floatUp 0.7s ease-in-out infinite alternate', animationDelay: '0.2s', transform: 'translateY(-5px)' }}>🔥</div>
          <div style={{ fontSize: '32px', filter: 'drop-shadow(0 0 10px rgba(255,100,0,0.8))', animation: 'floatUp 0.9s ease-in-out infinite alternate', animationDelay: '0.4s' }}>🔥</div>
        </div>

      </div>

      {}
      <div style={{ width: '200px', height: '14px', background: '#FFF8E1', borderRadius: '10px', overflow: 'hidden', border: '2px solid #D4A373' }}>
        <div style={{ height: '100%', width: `${progress}%`, background: progress >= 100 ? '#4CAF50' : '#FF9800', transition: 'width 0.1s linear' }} />
      </div>

    </div>
  );
}
