import { useState, useRef, useCallback, useEffect } from 'react';

interface Props {
  onComplete: () => void;
}

const REQUIRED_DEGREES = 1440; // 4 full clockwise rotations

export function StepDoughMixing({ onComplete }: Props) {
  const [totalDegrees, setTotalDegrees] = useState(0);
  const [isStirring, setIsStirring] = useState(false);
  const [whirlAngle, setWhirlAngle] = useState(0);
  const completedRef = useRef(false);

  const bowlRef = useRef<HTMLDivElement>(null);
  const lastAngleRef = useRef<number | null>(null);
  const isPressingRef = useRef(false);

  const getAngle = useCallback((clientX: number, clientY: number): number => {
    const bowl = bowlRef.current;
    if (!bowl) return 0;
    const rect = bowl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI);
  }, []);

  const handleAngle = useCallback((angle: number) => {
    if (lastAngleRef.current === null) {
      lastAngleRef.current = angle;
      return;
    }
    let delta = angle - lastAngleRef.current;
    // Normalize delta to [-180, 180]
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    // Only count clockwise (positive) movement
    if (delta > 0) {
      setTotalDegrees(prev => {
        const next = Math.min(prev + delta, REQUIRED_DEGREES);
        if (next >= REQUIRED_DEGREES && !completedRef.current) {
          completedRef.current = true;
          setTimeout(() => onComplete(), 600);
        }
        return next;
      });
      setWhirlAngle(a => a + delta);
    }
    lastAngleRef.current = angle;
  }, [onComplete]);

  // Mouse events
  const onMouseDown = (e: React.MouseEvent) => {
    isPressingRef.current = true;
    lastAngleRef.current = getAngle(e.clientX, e.clientY);
    setIsStirring(true);
  };

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isPressingRef.current) return;
    handleAngle(getAngle(e.clientX, e.clientY));
  }, [getAngle, handleAngle]);

  const onMouseUp = useCallback(() => {
    isPressingRef.current = false;
    lastAngleRef.current = null;
    setIsStirring(false);
  }, []);

  // Touch events
  const onTouchStart = (e: React.TouchEvent) => {
    isPressingRef.current = true;
    const t = e.touches[0];
    lastAngleRef.current = getAngle(t.clientX, t.clientY);
    setIsStirring(true);
  };

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!isPressingRef.current) return;
    e.preventDefault();
    const t = e.touches[0];
    handleAngle(getAngle(t.clientX, t.clientY));
  }, [getAngle, handleAngle]);

  const onTouchEnd = useCallback(() => {
    isPressingRef.current = false;
    lastAngleRef.current = null;
    setIsStirring(false);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [onMouseMove, onMouseUp, onTouchMove, onTouchEnd]);

  const percent = Math.min((totalDegrees / REQUIRED_DEGREES) * 100, 100);
  const circumference = 2 * Math.PI * 54; // r=54
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="klepon-step-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      <p className="klepon-instruction" style={{ textAlign: 'center' }}>
        Putar adonan searah jarum jam ↻<br />
        <span style={{ fontSize: '13px', opacity: 0.7 }}>Campur tepung 🌾, mentega 🧈, telur 🥚</span>
      </p>

      <div className="mixing-scene" style={{ position: 'relative', width: '200px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        
        {/* Decorative Ingredients (Below the bowl) */}
        <div style={{ position: 'absolute', bottom: '-10px', zIndex: 1, display: 'flex', gap: '15px', pointerEvents: 'none' }}>
           <img src="/assets/pie_susu/ing_tepung.png" alt="tepung" style={{ width: '35px', height: '35px', objectFit: 'contain', animation: 'floatUp 2s ease-in-out infinite alternate' }} />
           <img src="/assets/pie_susu/ing_mentega.png" alt="mentega" style={{ width: '35px', height: '35px', objectFit: 'contain', animation: 'floatUp 2.5s ease-in-out infinite alternate-reverse' }} />
           <img src="/assets/pie_susu/ing_telur.png" alt="telur" style={{ width: '35px', height: '35px', objectFit: 'contain', animation: 'floatUp 2.2s ease-in-out infinite alternate' }} />
        </div>

        {/* Circular progress ring */}
        <svg className="mixing-ring" width="140" height="140" viewBox="0 0 120 120" style={{ position: 'absolute', zIndex: 10, pointerEvents: 'none' }}>
          <circle cx="60" cy="60" r="54" fill="none" stroke="#E8D5C4" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke="#D4A373"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 60 60)"
            // Transition removed for real-time update
          />
        </svg>

        {/* Bowl Container */}
        <div
          ref={bowlRef}
          style={{
            position: 'absolute',
            width: '130px',
            height: '130px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transform: isStirring ? 'scale(0.98)' : 'scale(1)',
            transition: 'transform 0.1s',
            zIndex: 5
          }}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
        >
          {/* Mangkok Image (Background) */}
          <img src="/assets/pie_susu/mangkok_aduk.png" alt="bowl" style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'contain', zIndex: 0, pointerEvents: 'none' }} />

          {/* Adonan visual rotating (Enlarged) */}
          <div
            style={{
              width: '110px',
              height: '110px',
              transform: `rotate(${whirlAngle}deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
              pointerEvents: 'none',
              opacity: percent < 100 ? 0.7 + (percent * 0.003) : 1
            }}
          >
             <img src="/assets/pie_susu/adonan_putar.png" alt="dough" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
        </div>

        {/* Rotating Spoon placed absolutely in the scene to float above everything */}
        <div style={{
           position: 'absolute',
           width: '100px', height: '100px',
           transform: `rotate(${whirlAngle}deg)`,
           zIndex: 15, // Above ring
           pointerEvents: 'none'
        }}>
           <div style={{ 
              position: 'absolute', 
              top: '-30px', 
              left: '10px', 
              fontSize: '56px', 
              transform: 'rotate(200deg)', // Sendok terbalik
              filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.3))'
           }}>
              🥄
           </div>
        </div>
      </div>

      <div className="mixing-info" style={{ textAlign: 'center' }}>
        <span className="mixing-percent" style={{ fontSize: '24px', fontWeight: 'bold' }}>{Math.round(percent)}%</span>
        <br/>
        <span className="mixing-label">
          {percent >= 100 ? '✅ Adonan kulit pai siap!' : 'Aduk terus...'}
        </span>
      </div>

      {!isStirring && percent < 100 && percent > 0 && (
        <p className="mixing-hint" style={{ color: '#D4A373', fontWeight: 'bold', animation: 'bounce 1s infinite' }}>↻ Terus putar!</p>
      )}
    </div>
  );
}
