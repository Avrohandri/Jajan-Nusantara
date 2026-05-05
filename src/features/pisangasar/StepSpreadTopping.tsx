import { useState, useRef, useEffect } from 'react';

interface Props {
  onComplete: () => void;
}

export function StepSpreadTopping({ onComplete }: Props) {
  const [bananas, setBananas] = useState([
    { id: 1, topped: false },
    { id: 2, topped: false },
    { id: 3, topped: false },
    { id: 4, topped: false },
  ]);
  const [draggingTopping, setDraggingTopping] = useState(false);
  const ghostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return () => {
      if (ghostRef.current && document.body.contains(ghostRef.current)) {
        document.body.removeChild(ghostRef.current);
      }
    };
  }, []);

  // Mouse Handlers
  const handleToppingDragStart = (e: React.DragEvent) => {
    setTimeout(() => setDraggingTopping(true), 0);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleToppingDragEnd = () => setDraggingTopping(false);

  const handleBananaDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleBananaDrop = (e: React.DragEvent, id: number) => {
    e.preventDefault();
    setDraggingTopping(false);
    applyTopping(id);
  };

  // Touch Handlers
  const handleToppingTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setDraggingTopping(true);

    const ghost = document.createElement('div');
    ghost.innerHTML = '🟤';
    ghost.style.cssText = `
      position: fixed;
      left: ${touch.clientX - 30}px;
      top: ${touch.clientY - 30}px;
      font-size: 60px;
      pointer-events: none; z-index: 999;
      filter: drop-shadow(0 8px 16px rgba(0,0,0,0.3));
    `;
    document.body.appendChild(ghost);
    ghostRef.current = ghost;
  };

  const handleToppingTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (ghostRef.current) {
      ghostRef.current.style.left = `${touch.clientX - 30}px`;
      ghostRef.current.style.top = `${touch.clientY - 30}px`;
    }
  };

  const handleToppingTouchEnd = (e: React.TouchEvent) => {
    if (ghostRef.current) {
      document.body.removeChild(ghostRef.current);
      ghostRef.current = null;
    }
    setDraggingTopping(false);

    const touch = e.changedTouches[0];
    // Check collision with any banana
    bananas.forEach(b => {
      if (b.topped) return;
      const el = document.getElementById(`banana-${b.id}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (
          touch.clientX >= rect.left && touch.clientX <= rect.right &&
          touch.clientY >= rect.top && touch.clientY <= rect.bottom
        ) {
          applyTopping(b.id);
        }
      }
    });
  };

  const completedRef = useRef(false);

  const applyTopping = (id: number) => {
    setBananas(prev => {
      const next = prev.map(b => b.id === id ? { ...b, topped: true } : b);
      if (next.every(b => b.topped) && !completedRef.current) {
        completedRef.current = true;
        setTimeout(() => onComplete(), 1500);
      }
      return next;
    });
  };

  const allTopped = bananas.every(b => b.topped);

  return (
    <div className="klepon-step-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
      <p className="klepon-instruction" style={{ textAlign: 'center' }}>
        {allTopped ? 'Semua pisang sudah diolesi taburan! 🍌🟤' : 'Lumeri pisang 🍌 dengan adonan 🥣'}
      </p>

      {/* The Topping Source */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px', width: '100px' }}>
        <div
          draggable
          onDragStart={handleToppingDragStart}
          onDragEnd={handleToppingDragEnd}
          onTouchStart={handleToppingTouchStart}
          onTouchMove={handleToppingTouchMove}
          onTouchEnd={handleToppingTouchEnd}
          style={{
            cursor: 'grab',
            touchAction: 'none',
            opacity: draggingTopping ? 0.3 : 1,
            transform: draggingTopping ? 'scale(0.9)' : 'scale(1)',
            transition: 'transform 0.2s',
            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.2))',
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <img src="/assets/pisang_asar/mangkok_adonan.png" alt="taburan" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.currentTarget.outerHTML = '<span style="font-size:80px">🥣</span>'; }} />
        </div>
      </div>

      {/* The Bananas Target */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', justifyContent: 'center', maxWidth: '400px' }}>
        {bananas.map(banana => (
          <div 
            key={banana.id}
            id={`banana-${banana.id}`}
            onDragOver={handleBananaDragOver}
            onDrop={(e) => handleBananaDrop(e, banana.id)}
            style={{
              width: '150px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
          >
            {banana.topped ? (
              <img src="/assets/pisang_asar/pisang_topping.png" alt="pisang topping" style={{ width: '100%', height: '100%', objectFit: 'contain', animation: 'popIn 0.3s ease-out' }} onError={(e) => { e.currentTarget.outerHTML = '<div style="background: #FFF176; border-radius: 10px; border: 2px solid #FBC02D; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size:40px; position: relative">🍌<div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(141, 110, 99, 0.8); border-radius: 8px; display: flex; align-items: center; justify-content: center;">🟤</div></div>'; }} />
            ) : (
              <img src="/assets/pisang_asar/pisang_siap.png" alt="pisang siap" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.currentTarget.outerHTML = '<div style="background: #FFF176; border-radius: 10px; border: 2px solid #FBC02D; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size:40px;">🍌</div>'; }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
