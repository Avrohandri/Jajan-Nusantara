import { useState, useRef, useCallback, useEffect } from 'react';
import { useSfx } from '../../hooks/useSfx';

interface Props {
  onComplete: () => void;
}

const REQUIRED_DEGREES = 1440;

export function StepMixing({ onComplete }: Props) {
  const { playButtonClick } = useSfx();
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
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    if (delta > 0) {
      setTotalDegrees(prev => {
        const next = Math.min(prev + delta, REQUIRED_DEGREES);
        if (next >= REQUIRED_DEGREES && !completedRef.current) {
          completedRef.current = true;
          setTimeout(() => onComplete(), 800);
        }
        return next;
      });
      setWhirlAngle(a => a + delta);
    }
    lastAngleRef.current = angle;
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    playButtonClick();
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

  const onTouchStart = (e: React.TouchEvent) => {
    playButtonClick();
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
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  // Warna adonan berubah dari putih → hijau pandan sesuai progress


  return (
    <div className="klepon-step-content">


      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <div className="klepon-instruction" style={{ 
          textAlign: 'center', 
          background: 'rgba(255, 245, 230, 0.6)', 
          padding: '12px 16px', 
          borderRadius: '16px', 
          border: '2px solid #D4A373',
          boxShadow: '0 4px 12px rgba(212, 163, 115, 0.2)',
          color: '#5D4037',
          fontWeight: 'bold'
        }}>
          <div style={{ fontSize: '14px' }}>Campur Tepung Ketan dan Air Pandan!</div>
        </div>
        <div style={{ fontSize: '13px', opacity: 0.8, fontWeight: 'bold', textAlign: 'center' }}>
          Tekan & putar searah jarum jam di dalam mangkok ↻
        </div>
      </div>

      <div className="mixing-scene">
        {/* Ring progress */}
        <svg className="mixing-ring" width="140" height="140" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#E8D5C4" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="54"
            fill="none"
            stroke="#7CAD58"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dashoffset 0.05s linear' }}
          />
        </svg>

        {/* Mangkok */}
        <div
          ref={bowlRef}
          className={`mixing-bowl-container ${isStirring ? 'bowl-stirring' : ''}`}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
        >
          <img
            src="/assets/klepon/mangkok_aduk.png"
            alt="mangkok aduk"
            className="mixing-bowl-bg"
            draggable={false}
          />

          <img
            src="/assets/klepon/adonan_putar.png"
            alt="adonan"
            className="mixing-dough-img"
            style={{
              transform: `rotate(${whirlAngle}deg)`,
              transition: 'filter 0.5s ease',
            }}
            draggable={false}
          />

          {!isStirring && percent < 100 && (
            <img
              src="/assets/universal/rotation_arrow.png"
              alt="Rotate clockwise"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '220px',
                height: '220px',
                marginTop: '-110px',
                marginLeft: '-110px',
                opacity: 0.8,
                pointerEvents: 'none',
                animation: 'spin 3s linear infinite',
                zIndex: 20,
                filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.5))'
              }}
            />
          )}

          <div className={`mixer-decoration mixer-left ${isStirring ? 'mixer-shaking' : ''}`}>🥄</div>
          <div className={`mixer-decoration mixer-right ${isStirring ? 'mixer-shaking' : ''}`}>🥄</div>
        </div>
      </div>

      <div className="mixing-info">
        <span className="mixing-percent">{Math.round(percent)}%</span>
        <span className="mixing-label">
          {percent >= 100 ? '✅ Adonan siap!' : 'Aduk terus...'}
        </span>
      </div>

      {!isStirring && percent < 100 && percent > 0 && (
        <p className="mixing-hint">↻ Terus putar!</p>
      )}


    </div>
  );
}
