import { useState, useRef } from 'react';

interface Props {
  onComplete: () => void;
}

export function StepCutBanana({ onComplete }: Props) {
  // We need 4 bananas
  const [bananas, setBananas] = useState([
    { id: 1, cut: false },
    { id: 2, cut: false },
    { id: 3, cut: false },
    { id: 4, cut: false },
  ]);

  const [message, setMessage] = useState('');
  const completedRef = useRef(false);

  const handleCut = (id: number) => {
    setBananas(prev => {
      const nextBananas = prev.map(b => b.id === id ? { ...b, cut: true } : b);
      
      if (nextBananas.every(b => b.cut) && !completedRef.current) {
        completedRef.current = true;
        setMessage('Semua pisang sudah dipotong!');
        setTimeout(() => onComplete(), 1500);
      }
      
      return nextBananas;
    });
  };

  return (
    <div className="klepon-step-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <p className="klepon-instruction" style={{ textAlign: 'center' }}>
        Ketuk pisang untuk membelahnya menjadi dua.
      </p>

      {message && (
        <div style={{ padding: '10px 20px', background: '#4CAF50', color: 'white', borderRadius: '20px', fontWeight: 'bold' }}>
          {message}
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center', maxWidth: '350px' }}>
        {bananas.map(banana => (
          <div 
            key={banana.id} 
            onClick={() => !banana.cut && handleCut(banana.id)}
            style={{
              position: 'relative',
              width: '135px',
              height: '80px',
              cursor: banana.cut ? 'default' : 'pointer',
              transition: 'transform 0.1s',
            }}
            onMouseOver={(e) => {
              if (!banana.cut) e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseOut={(e) => {
              if (!banana.cut) e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            {banana.cut ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', height: '100%' }}>
                {/* Visual for cut banana halves */}
                <div style={{ width: '48%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="/assets/pisang_asar/pisang_terpotong.png" alt="pisang terpotong" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.currentTarget.outerHTML = '<div style="background: #FFF176; border-radius: 10px 0 0 10px; border: 2px solid #FBC02D; width: 100%; height: 80px; display: flex; align-items: center; justify-content: center; font-size:30px;">🍌</div>'; }} />
                </div>
                <div style={{ width: '48%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="/assets/pisang_asar/pisang_terpotong.png" alt="pisang terpotong" style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scaleX(-1)' }} onError={(e) => { e.currentTarget.outerHTML = '<div style="background: #FFF176; border-radius: 0 10px 10px 0; border: 2px solid #FBC02D; width: 100%; height: 80px; display: flex; align-items: center; justify-content: center; font-size:30px;">🍌</div>'; }} />
                </div>
              </div>
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/assets/pisang_asar/pisang_utuh.png" alt="pisang utuh" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.currentTarget.outerHTML = '<div style="background: #FFEE58; border-radius: 10px; border: 2px solid #FBC02D; font-size: 40px; width: 100%; height: 80px; display: flex; align-items: center; justify-content: center;">🍌</div>'; }} />
                {/* Cut line hint */}
                <div style={{ position: 'absolute', width: '2px', height: '100%', background: 'rgba(0,0,0,0.2)', left: '50%', transform: 'translateX(-50%)', borderStyle: 'dashed', borderWidth: '0 1px' }} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
