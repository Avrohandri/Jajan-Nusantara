import { useState, useRef } from 'react';
import { useSfx } from '../../hooks/useSfx';

interface Props {
  onComplete: () => void;
}

export function StepDippingMold({ onComplete }: Props) {
  const { playButtonClick } = useSfx();
  const [moldCoated, setMoldCoated] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const ghostRef = useRef<HTMLImageElement | null>(null);

  // Desktop Drag
  const handleDragStart = () => {
    playButtonClick();
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
    playButtonClick();
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
            0%   { transform: translateY(0px); opacity: 1; }
            25%  { transform: translateY(120px); } /* Celup ke dalam mangkok */
            65%  { transform: translateY(120px); } /* Tahan di dalam */
            100% { transform: translateY(-160px); } /* Angkat ke atas */
          }
        `}
      </style>
      <p className="klepon-instruction" style={{ textAlign: 'center' }}>
        {moldCoated ? 'Cetakan terisi adonan! ✨' : 'Tarik cetakan ke dalam mangkok adonan!'}
      </p>

      {/* Container area */}
      <div style={{ position: 'relative', width: '300px', height: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Cetakan animasi — z-index 1, di belakang mangkok */}
        {moldCoated && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1,
            animation: 'dipAndRise 2.5s ease-in-out forwards',
          }}>
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

        {/* Upper Zone: Mold draggable — z-index 1 (di belakang mangkok) */}
        <div style={{ position: 'relative', zIndex: 1, height: '220px', display: 'flex', alignItems: 'center' }}>
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
                touchAction: 'none',
                opacity: isDragging ? 0.3 : 1,
                transform: isDragging ? 'scale(0.95)' : 'scale(1)',
                transition: 'transform 0.2s',
                filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))'
              }}
            />
          )}
        </div>

        {/* Lower Zone: Dough Bowl — z-index 2, lebih ke bawah dari cetakan */}
        <div
          id="dough-bowl-target"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          style={{
            position: 'relative',
            zIndex: 2,
            marginTop: '10px', /* Mangkok di bawah, tidak menutupi pencetak saat idle */
            width: '240px', height: '160px',
            background: '#F5DEB3',
            borderRadius: '10px 10px 100px 100px',
            border: '6px solid #B0BEC5',
            borderTopWidth: '12px',
            boxShadow: 'inset 0 -20px 40px rgba(0,0,0,0.2), 0 10px 20px rgba(0,0,0,0.3)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            overflow: 'visible',
          }}
        >
          {/* Inner Dough liquid representation */}
          <div style={{
            position: 'absolute', top: '0px', left: '0px', right: '0px', height: '30px',
            background: 'rgba(245, 222, 179, 0.9)',
            borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)',
            boxShadow: 'inset 0 -5px 10px rgba(0,0,0,0.1)'
          }} />
        </div>

      </div>
    </div>
  );
}
