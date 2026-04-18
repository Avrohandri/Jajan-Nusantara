import { useState, useRef, useEffect } from 'react';

interface Props {
  onComplete: () => void;
}

export function StepBakingOven({ onComplete }: Props) {
  const [pieInOven, setPieInOven] = useState(false);
  const [bakingProgress, setBakingProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [draggingPie, setDraggingPie] = useState(false);
  
  const ghostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (pieInOven && !isDone) {
      const timer = setInterval(() => {
        setBakingProgress((prev) => Math.min(prev + 5, 100)); // Takes 2 seconds (5% every 100ms)
      }, 100);
      return () => clearInterval(timer);
    }
  }, [pieInOven, isDone]);

  useEffect(() => {
    if (bakingProgress >= 100 && !isDone) {
      setIsDone(true);
      setTimeout(() => onComplete(), 1000);
    }
  }, [bakingProgress, isDone, onComplete]);

  // Mouse Drag Events
  const handlePieDragStart = (e: React.DragEvent) => {
    setTimeout(() => setDraggingPie(true), 0);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleOvenDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleOvenDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggingPie(false);
    if (!pieInOven) setPieInOven(true);
  };

  // Touch Events
  const handlePieTouchStart = (e: React.TouchEvent) => {
    if (pieInOven) return;
    const touch = e.touches[0];
    setDraggingPie(true);
    
    // Create a ghost image for the pie
    const ghost = document.createElement('img');
    ghost.src = '/assets/pie_susu/ing_adonan susu.png';
    ghost.style.cssText = `
      position: fixed;
      left: ${touch.clientX - 60}px;
      top: ${touch.clientY - 60}px;
      width: 120px; height: 120px;
      object-fit: contain;
      pointer-events: none; z-index: 999;
      filter: drop-shadow(0 8px 16px rgba(0,0,0,0.3));
    `;
    
    document.body.appendChild(ghost);
    ghostRef.current = ghost;
  };

  const handlePieTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (ghostRef.current) {
      ghostRef.current.style.left = `${touch.clientX - 60}px`;
      ghostRef.current.style.top = `${touch.clientY - 60}px`;
    }
  };

  const handlePieTouchEnd = (e: React.TouchEvent) => {
    if (ghostRef.current) {
      document.body.removeChild(ghostRef.current);
      ghostRef.current = null;
    }
    setDraggingPie(false);
    
    const touch = e.changedTouches[0];
    const oven = document.getElementById('oven-target');
    if (oven) {
      const rect = oven.getBoundingClientRect();
      if (
        touch.clientX >= rect.left && touch.clientX <= rect.right &&
        touch.clientY >= rect.top && touch.clientY <= rect.bottom
      ) {
        if (!pieInOven) setPieInOven(true);
      }
    }
  };

  return (
    <div className="klepon-step-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <p className="klepon-instruction" style={{ textAlign: 'center' }}>
        {isDone ? 'Panggang selesai! 🥧' : pieInOven ? 'Sedang memanggang...' : 'Drag pie ke dalam oven!'}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', alignItems: 'center', width: '100%' }}>
        
        {/* Source: The Pie Image */}
        <div style={{ minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {!pieInOven && (
            <img
              src="/assets/pie_susu/ing_adonan susu.png"
              alt="Pie"
              draggable
              onDragStart={handlePieDragStart}
              onDragEnd={() => setDraggingPie(false)}
              onTouchStart={handlePieTouchStart}
              onTouchMove={handlePieTouchMove}
              onTouchEnd={handlePieTouchEnd}
              style={{
                width: '140px',
                height: '140px',
                objectFit: 'contain',
                cursor: 'grab',
                opacity: draggingPie ? 0.3 : 1,
                transform: draggingPie ? 'scale(0.9)' : 'scale(1)',
                transition: 'transform 0.2s',
                filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.2))'
              }}
            />
          )}
        </div>

        {/* Target: The Oven */}
        <div
          id="oven-target"
          onDragOver={handleOvenDragOver}
          onDrop={handleOvenDrop}
          style={{
            width: '240px',
            height: '180px',
            background: pieInOven ? '#4A4A4A' : '#5A5A5A',
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
            background: pieInOven && !isDone ? '#8B2500' : '#2A2A2A',
            border: '4px solid #111',
            borderRadius: '8px',
            transition: 'background 0.5s',
            boxShadow: pieInOven && !isDone ? 'inset 0 0 30px #FF4500' : 'inset 0 4px 10px rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
             {pieInOven && (
               <img 
                 src="/assets/pie_susu/ing_adonan susu.png"
                 alt="Baking pie"
                 style={{
                   width: '120px',
                   height: '120px',
                   objectFit: 'contain',
                   transition: 'filter 2s ease-in-out',
                   filter: isDone ? 'brightness(0.7) sepia(0.5)' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))'
                 }}
               />
             )}
          </div>
        </div>

        {/* Baking Progress Bar */}
        {pieInOven && (
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
