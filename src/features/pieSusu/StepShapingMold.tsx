import { useState } from 'react';

interface Props {
  onComplete: () => void;
}

const TAPS_NEEDED = 2;

export function StepShapingMold({ onComplete }: Props) {
  const [tapCount, setTapCount] = useState(0);

  const handleTap = () => {
    if (tapCount >= TAPS_NEEDED) return;
    const next = tapCount + 1;
    setTapCount(next);
    
    if (next >= TAPS_NEEDED) {
      setTimeout(() => onComplete(), 700);
    }
  };

  // Determine image source based on tap progress
  let imgSrc = '/assets/pie_susu/ing_adonan 1.png';
  if (tapCount === 1) imgSrc = '/assets/pie_susu/ing_adonan 2.png';
  if (tapCount >= 2) imgSrc = '/assets/pie_susu/ing_adonan jadi.png';

  return (
    <div className="klepon-step-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <p className="klepon-instruction" style={{ textAlign: 'center' }}>
        Tap adonan untuk memipihkannya ke loyang! 👆
      </p>

      <div 
        className="shaping-area" 
        onClick={handleTap}
        style={{
          width: '240px',
          height: '240px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: tapCount < TAPS_NEEDED ? 'pointer' : 'default',
          position: 'relative'
        }}
      >
        <img 
          src={imgSrc} 
          alt="Adonan"
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.2))',
            transition: 'transform 0.2s',
            transform: tapCount > 0 ? 'scale(1.05)' : 'scale(1)'
          }}
        />
      </div>

      <div className="tap-progress-row" style={{ display: 'flex', gap: '8px' }}>
        {Array.from({ length: TAPS_NEEDED }).map((_, i) => (
          <span 
            key={i} 
            className={`tap-dot ${i < tapCount ? 'tap-dot-filled' : ''}`} 
            style={{
              width: '14px', height: '14px', borderRadius: '50%',
              background: i < tapCount ? '#D4A373' : '#ddd',
              transition: 'background 0.2s'
            }}
          />
        ))}
      </div>
      
      {tapCount < TAPS_NEEDED ? (
        <span className="tap-hint" style={{ fontWeight: 'bold' }}>Tap {TAPS_NEEDED - tapCount}× lagi</span>
      ) : (
        <span className="tap-hint" style={{ fontWeight: 'bold', color: '#D4A373' }}>✅ Selesai berbentuk pai!</span>
      )}
    </div>
  );
}
