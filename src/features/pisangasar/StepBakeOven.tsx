import { useState, useRef, useEffect } from 'react';

interface Props {
  onComplete: () => void;
}

export function StepBakeOven({ onComplete }: Props) {
  const [inOven, setInOven] = useState(false);
  const [bakingProgress, setBakingProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [dragging, setDragging] = useState(false);
  
  const ghostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (inOven && !isDone) {
      const timer = setInterval(() => {
        setBakingProgress((prev) => Math.min(prev + 5, 100));
      }, 100);
      return () => clearInterval(timer);
    }
  }, [inOven, isDone]);

  useEffect(() => {
    if (bakingProgress >= 100 && !isDone) {
      setIsDone(true);
      setTimeout(() => onComplete(), 1000);
    }
  }, [bakingProgress, isDone, onComplete]);

  // Mouse Drag Events
  const handleDragStart = (e: React.DragEvent) => {
    setTimeout(() => setDragging(true), 0);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleOvenDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleOvenDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (!inOven) setInOven(true);
  };

  // Touch Events
  const handleTouchStart = (e: React.TouchEvent) => {
    if (inOven) return;
    const touch = e.touches[0];
    setDragging(true);
    
    const ghost = document.createElement('div');
    ghost.innerHTML = '<img src="/assets/pisang_asar/pisang_tray.png" style="width:100%;height:100%;object-fit:contain;" />';
    ghost.style.cssText = `
      position: fixed;
      left: ${touch.clientX - 100}px;
      top: ${touch.clientY - 100}px;
      width: 200px;
      height: 200px;
      pointer-events: none; z-index: 999;
      filter: drop-shadow(0 8px 16px rgba(0,0,0,0.3));
    `;
    
    document.body.appendChild(ghost);
    ghostRef.current = ghost;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (ghostRef.current) {
      ghostRef.current.style.left = `${touch.clientX - 60}px`;
      ghostRef.current.style.top = `${touch.clientY - 60}px`;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (ghostRef.current) {
      document.body.removeChild(ghostRef.current);
      ghostRef.current = null;
    }
    setDragging(false);
    
    const touch = e.changedTouches[0];
    const oven = document.getElementById('pisang-oven-target');
    if (oven) {
      const rect = oven.getBoundingClientRect();
      if (
        touch.clientX >= rect.left && touch.clientX <= rect.right &&
        touch.clientY >= rect.top && touch.clientY <= rect.bottom
      ) {
        if (!inOven) setInOven(true);
      }
    }
  };

  return (
    <div className="klepon-step-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <p className="klepon-instruction" style={{ textAlign: 'center' }}>
        {isDone ? 'Pisang Asar selesai dipanggang! 🍌✨' : inOven ? 'Pisang sedang dipanggang...' : 'Seret pisang ke dalam oven!'}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', alignItems: 'center', width: '100%' }}>
        
        {/* Source: The Topped Bananas */}
        <div style={{ minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {!inOven && (
            <div
              draggable
              onDragStart={handleDragStart}
              onDragEnd={() => setDragging(false)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{
                width: '180px',
                height: '180px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'grab',
                touchAction: 'none',
                opacity: dragging ? 0.3 : 1,
                transform: dragging ? 'scale(0.9)' : 'scale(1)',
                transition: 'transform 0.2s',
                filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.2))'
              }}
            >
              <img src="/assets/pisang_asar/pisang_tray.png" alt="pisang tray" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.currentTarget.outerHTML = '<div style="font-size: 80px; background: rgba(255,255,255,0.5); border-radius: 16px; padding: 10px;">🍌</div>'; }} />
            </div>
          )}
        </div>

        {/* Target: The Oven */}
        <div
          id="pisang-oven-target"
          onDragOver={handleOvenDragOver}
          onDrop={handleOvenDrop}
          style={{
            width: '240px',
            height: '180px',
            background: inOven ? '#4A4A4A' : '#5A5A5A',
            border: '8px solid #333',
            borderRadius: '16px',
            borderTopLeftRadius: '30px',
            borderTopRightRadius: '30px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '20px',
            boxShadow: 'inset 0 20px 40px rgba(0,0,0,0.5), 0 10px 20px rgba(0,0,0,0.3)',
            transition: 'background 0.3s'
          }}
        >
          {/* Oven Controls Decoration */}
          <div style={{ position: 'absolute', top: '10px', right: '20px', display: 'flex', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#222' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#222' }}></div>
          </div>

          {/* Oven Inside / Glowing when baking */}
          <div style={{
            position: 'absolute',
            inset: '30px 10px 10px 10px',
            background: inOven && !isDone ? '#8B2500' : '#2A2A2A',
            border: '4px solid #111',
            borderRadius: '8px',
            transition: 'background 0.5s',
            boxShadow: inOven && !isDone ? 'inset 0 0 30px #FF4500' : 'inset 0 4px 10px rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px'
          }}>
             {inOven && (
               <img src="/assets/pisang_asar/pisang_tray.png" alt="pisang tray baked" style={{ 
                 width: '100%', height: '100%', objectFit: 'contain',
                 transition: 'all 2s ease-in-out',
                 filter: isDone ? 'brightness(0.8) sepia(0.6)' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))'
               }} onError={(e) => { e.currentTarget.outerHTML = '<span style="font-size: 80px;">🍌</span>'; }} />
             )}
          </div>
        </div>

        {/* Baking Progress Bar */}
        {inOven && (
          <div style={{ width: '200px', height: '12px', background: '#E0E0E0', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${bakingProgress}%`,
              background: '#FF8C00',
              transition: 'width 0.1s linear'
            }} />
          </div>
        )}
      </div>
    </div>
  );
}
