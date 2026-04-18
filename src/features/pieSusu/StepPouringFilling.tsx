import { useState, useEffect } from 'react';

interface Props {
  onComplete: () => void;
}

export function StepPouringFilling({ onComplete }: Props) {
  const [isFilled, setIsFilled] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [pourProgress, setPourProgress] = useState(0);

  const startHolding = () => {
    if (isFilled) return;
    setIsHolding(true);
  };
  
  const stopHolding = () => {
    setIsHolding(false);
  };

  useEffect(() => {
    if (!isHolding || isFilled) return;
    const interval = setInterval(() => {
      setPourProgress(p => Math.min(p + 4, 100));
    }, 30);
    return () => clearInterval(interval);
  }, [isHolding, isFilled]);

  useEffect(() => {
    if (pourProgress >= 100 && !isFilled) {
      setIsHolding(false);
      setIsFilled(true);
      setTimeout(() => onComplete(), 1000);
    }
  }, [pourProgress, isFilled, onComplete]);

  return (
    <div className="klepon-step-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <p className="klepon-instruction" style={{ textAlign: 'center' }}>
        {isFilled ? 'Pie sudah terisi manis! ✨' : 'Tahan tombol untuk menuangkan susu!'}
      </p>

      {/* Button to pour */}
      <div style={{ height: '50px' }}>
        {!isFilled && (
          <button 
            className="btn btn-primary" 
            style={{ 
              fontWeight: 'bold', fontSize: '18px', padding: '10px 24px', borderRadius: '24px',
              transform: isHolding ? 'scale(0.95)' : 'scale(1)',
              transition: 'transform 0.1s',
              touchAction: 'none',
              userSelect: 'none',
              WebkitUserSelect: 'none'
            }}
            onPointerDown={startHolding}
            onPointerUp={stopHolding}
            onPointerLeave={stopHolding}
            onPointerCancel={stopHolding}
          >
            🥣 Tahan & Tuang
          </button>
        )}
      </div>

      {/* Scene Area */}
      <div style={{ position: 'relative', width: '240px', height: '240px', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', marginTop: '20px' }}>
        
        {/* Pitcher Bowl (Appears when holding) */}
        <div style={{
          position: 'absolute',
          top: '-60px',
          fontSize: '64px',
          transform: isHolding ? 'rotate(-30deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s ease',
          opacity: isHolding ? 1 : 0,
          zIndex: 4
        }}>
          🥣
        </div>

        {/* The Milk Stream */}
        <div style={{
          position: 'absolute',
          top: '0px',
          width: '12px',
          height: isHolding ? '150px' : '0px',
          background: 'linear-gradient(to bottom, #FFF 0%, #FFEF96 100%)',
          borderRadius: '10px',
          transition: 'height 0.1s linear',
          filter: 'drop-shadow(0 0 8px rgba(255,239,150,0.8))',
          zIndex: 3
        }} />

        {/* The Pie Image - Crossfade Effect */}
        <img 
          src="/assets/pie_susu/ing_adonan jadi.png"
          style={{
            position: 'absolute',
            width: '100%', height: '100%', objectFit: 'contain', zIndex: 2,
            opacity: 1 - (pourProgress / 100),
            pointerEvents: 'none'
          }}
          draggable={false}
          alt=""
        />
        <img 
          src="/assets/pie_susu/ing_adonan susu.png"
          style={{
            position: 'absolute',
            width: '100%', height: '100%', objectFit: 'contain', zIndex: 2,
            opacity: pourProgress / 100,
            pointerEvents: 'none'
          }}
          draggable={false}
          alt=""
        />

      </div>
      
    </div>
  );
}
