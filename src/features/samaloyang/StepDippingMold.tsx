import { useState, useRef } from 'react';

interface Props {
  onComplete: () => void;
}

export function StepDippingMold({ onComplete }: Props) {
  const [moldCoated, setMoldCoated] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const ghostRef = useRef<HTMLImageElement | null>(null);

  // Desktop Drag
  const handleDragStart = (e: React.DragEvent) => {
    setTimeout(() => setIsDragging(true), 0);
  };
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!moldCoated) {
      setMoldCoated(true);
      setTimeout(onComplete, 3000); // Wait 3 seconds to let animation finish!
    }
  };
  const handleDragEnd = () => setIsDragging(false);

    // Mobile Touch
  const handleTouchStart = (e: React.TouchEvent) => {
    if (moldCoated) return;
    setIsDragging(true);
    const touch = e.touches[0];

    const ghost = document.createElement('img');
    ghost.src = '/assets/samaloyang/samaloyang_mold.png';
    ghost.style.cssText = `
      position: fixed; left: ${touch.clientX - 40}px; top: ${touch.clientY - 100}px;
      width: 80px; height: 160px; object-fit: contain;
      pointer-events: none; z-index: 999;
    `;
    document.body.appendChild(ghost);
    ghostRef.current = ghost;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!ghostRef.current) return;
    const touch = e.touches[0];
    ghostRef.current.style.left = `${touch.clientX - 40}px`;
    ghostRef.current.style.top = `${touch.clientY - 100}px`;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (ghostRef.current) {
      document.body.removeChild(ghostRef.current);
      ghostRef.current = null;
    }
    setIsDragging(false);

    if (moldCoated) return;
    const touch = e.changedTouches[0];
    const bowl = document.getElementById('dough-bowl-target');
    if (bowl) {
      const rect = bowl.getBoundingClientRect();
      if (
        touch.clientX >= rect.left && touch.clientX <= rect.right &&
        touch.clientY >= rect.top && touch.clientY <= rect.bottom
      ) {
        setMoldCoated(true);
        setTimeout(onComplete, 3000); // Wait 3 seconds to let animation finish!
      }
    }
  };

  return (
    <div className="klepon-step-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <style>
        {`
          @keyframes dipAndRise {
            0% { transform: translateY(-60px); opacity: 1; }
            20% { transform: translateY(40px); } /* Dip deeper */
            60% { transform: translateY(40px); } /* Hold in dough */
            100% { transform: translateY(-160px); } /* Pull up */
          }
        `}
      </style>
      <p className="klepon-instruction" style={{ textAlign: 'center' }}>
        {moldCoated ? 'Cetakan terisi adonan! ✨' : 'Tarik cetakan ke dalam mangkok adonan!'}
      </p>

      {/* Container area */}
      <div style={{ position: 'relative', width: '300px', height: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
        
        {/* Upper Zone: Mold Original Location */}
        <div style={{ height: '200px', display: 'flex', alignItems: 'center' }}>
          {!moldCoated && (
            <img
              src="/assets/samaloyang/samaloyang_mold.png"
              alt="Cetakan Samaloyang"
              draggable
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{
                height: '200px', width: '120px', objectFit: 'contain',
                cursor: 'grab',
                opacity: isDragging ? 0.3 : 1,
                transform: isDragging ? 'scale(0.95)' : 'scale(1)',
                transition: 'transform 0.2s',
                filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))'
              }}
            />
          )}
        </div>

        {/* Lower Zone: Dough Bowl Target */}
        <div 
          id="dough-bowl-target"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{
            position: 'relative',
            width: '240px', height: '160px',
            background: '#F5DEB3', // Dough color representation inside
            borderRadius: '10px 10px 100px 100px',
            border: '6px solid #B0BEC5', // Metal bowl border
            borderTopWidth: '12px',
            boxShadow: 'inset 0 -20px 40px rgba(0,0,0,0.2), 0 10px 20px rgba(0,0,0,0.3)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            overflow: 'visible' // Allow the mold to animate outside of the bowl upwards
          }}
        >
          {/* Inner Dough liquid representation */}
          <div style={{
            position: 'absolute', top: '0px', left: '0px', right: '0px', height: '30px',
            background: 'rgba(245, 222, 179, 0.9)',
            borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)',
            boxShadow: 'inset 0 -5px 10px rgba(0,0,0,0.1)'
          }} />

          {/* When mold is successfully dipped */}
          {moldCoated && (
            <div style={{ position: 'relative', marginTop: '-40px', animation: 'dipAndRise 2.5s ease-in-out forwards', zIndex: 10 }}>
              <img
                src="/assets/samaloyang/cetakan_berisi.png"
                alt="Cetakan Berisi"
                style={{
                  height: '200px', width: '120px', objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
                }}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
