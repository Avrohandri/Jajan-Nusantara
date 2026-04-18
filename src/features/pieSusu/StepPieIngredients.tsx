import { useState, useRef, useEffect } from 'react';

interface Ingredient {
  id: string;
  name: string;
  imgSrc: string;
  correct: boolean;
}

const INITIAL_INGREDIENTS: Ingredient[] = [
  { id: 'tepung', name: 'Tepung',     imgSrc: '/assets/pie_susu/ing_tepung.png',  correct: true },
  { id: 'mentega',name: 'Mentega',    imgSrc: '/assets/pie_susu/ing_mentega.png', correct: true },
  { id: 'telur',  name: 'Telur',      imgSrc: '/assets/pie_susu/ing_telur.png',   correct: true },
  { id: 'susu',   name: 'Susu',       imgSrc: '/assets/pie_susu/ing_susu.png',    correct: true },
  { id: 'cokelat',name: 'Cokelat',    imgSrc: '/assets/pie_susu/ing_cokelat.png', correct: false },
  { id: 'jeruk',  name: 'Jeruk',      imgSrc: '/assets/pie_susu/ing_jeruk.png',   correct: false },
  { id: 'tomat',  name: 'Tomat',      imgSrc: '/assets/pie_susu/ing_tomat.png',   correct: false },
];

interface Props {
  onComplete: () => void;
}

export function StepPieIngredients({ onComplete }: Props) {
  const [shuffledIngs, setShuffledIngs] = useState<Ingredient[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [feedback, setFeedback] = useState<'right' | 'left' | 'error' | null>(null);

  const startX = useRef(0);

  // Initialize and shuffle on mount
  useEffect(() => {
    const shuffled = [...INITIAL_INGREDIENTS].sort(() => Math.random() - 0.5);
    setShuffledIngs(shuffled);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    startX.current = e.clientX;
    setFeedback(null);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setDragX(e.clientX - startX.current);
  };

  const nextCard = () => {
    setDragX(0);
    setFeedback(null);
    const nextIdx = currentIndex + 1;
    if (nextIdx >= shuffledIngs.length) {
      setTimeout(() => onComplete(), 400); // give a bit of time before moving to next step
    }
    setCurrentIndex(nextIdx);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    (e.target as Element).releasePointerCapture(e.pointerId);

    const ing = shuffledIngs[currentIndex];
    if (!ing) return;

    if (dragX > 100) {
      // Swipe Right -> Accept (Should be correct)
      if (ing.correct) {
        setFeedback('right');
        setTimeout(() => nextCard(), 250);
      } else {
        setFeedback('error');
        setDragX(0); // Snap back
      }
    } else if (dragX < -100) {
      // Swipe Left -> Reject (Should be false)
      if (!ing.correct) {
        setFeedback('left');
        setTimeout(() => nextCard(), 250);
      } else {
        setFeedback('error');
        setDragX(0); // Snap back
      }
    } else {
      // Didn't swipe far enough
      setDragX(0);
    }
  };

  const currentIng = shuffledIngs[currentIndex];
  const isComplete = currentIndex >= shuffledIngs.length;

  // Visual cues based on drag pos
  const bgColor = dragX > 50 ? 'rgba(40, 167, 69, 0.05)' : dragX < -50 ? 'rgba(220, 53, 69, 0.05)' : 'transparent';
  
  return (
    <div className="ing-screen" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: bgColor, transition: 'background-color 0.3s', paddingBottom: '40px', paddingTop: '20px', borderRadius: '16px' }}>
      
      {/* Remove duplicate header since PieSusuMiniGameScreen already renders one */}
      
      {/* Instruction match Image 1 */}
      <div className="ing-instruction-bar" style={{ marginTop: '-10px', marginBottom: '20px', fontWeight: 'bold' }}>
        Geser bahan ke tempat yang benar
      </div>

      {/* Swipe direction indicators */}
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '320px', marginBottom: '20px', fontWeight: 'bold', fontSize: '14px' }}>
        <div style={{ color: '#dc3545', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '24px' }}>⬅️❌</span>
          Salah
        </div>
        <div style={{ color: '#28a745', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: '24px' }}>✅➡️</span>
          Benar
        </div>
      </div>

      <div style={{ position: 'relative', width: '200px', height: '240px' }}>
        {isComplete ? (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            fontSize: '64px', animation: 'bowlItemIn 0.5s ease'
          }}>
            ✅<br/><span style={{fontSize: '20px'}}>Bahan Terkumpul!</span>
          </div>
        ) : (
          <>
            {/* The Next Card (Decorative, behind) */}
            {currentIndex + 1 < shuffledIngs.length && (
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: '16px',
                border: '2px solid rgba(212,163,115,0.5)',
                transform: 'scale(0.95) translateY(10px)',
                zIndex: 1, boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
              }} />
            )}

            {/* The Current Card */}
            {currentIng && (
              <div
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  borderRadius: '16px',
                  border: '6px solid ' + (feedback === 'error' ? '#dc3545' : '#D4A373'),
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  touchAction: 'none', cursor: isDragging ? 'grabbing' : 'grab',
                  // Animations
                  transform: feedback === 'right' ? `translateX(200px) rotate(30deg)` :
                             feedback === 'left' ? `translateX(-200px) rotate(-30deg)` :
                             `translateX(${dragX}px) rotate(${dragX * 0.05}deg)`,
                  transition: isDragging ? 'none' : 'transform 0.25s ease-out, border 0.2s, background-color 0.2s',
                  animation: feedback === 'error' ? 'error-shake 0.4s ease-in-out' : 'none',
                  zIndex: 2
                }}
              >
                {/* Stamp visual feedback overlay */}
                {dragX > 80 && !feedback && <div style={{ position: 'absolute', top: '20px', left: '20px', color: '#28a745', fontWeight: 'bold', fontSize: '24px', transform: 'rotate(-15deg)', border: '2px solid #28a745', padding: '4px 8px', borderRadius: '4px', opacity: 0.8, zIndex: 10 }}>BENAR</div>}
                {dragX < -80 && !feedback && <div style={{ position: 'absolute', top: '20px', right: '20px', color: '#dc3545', fontWeight: 'bold', fontSize: '24px', transform: 'rotate(15deg)', border: '2px solid #dc3545', padding: '4px 8px', borderRadius: '4px', opacity: 0.8, zIndex: 10 }}>SALAH</div>}

                {/* Optional red glow if wrong */}
                <div style={{ position: 'absolute', inset: 0, borderRadius: '10px', background: feedback === 'error' ? 'rgba(220,53,69,0.3)' : 'transparent', transition: 'background 0.2s', zIndex: 0, pointerEvents: 'none' }} />

                <img 
                  src={currentIng.imgSrc} 
                  alt={currentIng.name}
                  style={{ width: '120px', height: '120px', objectFit: 'contain', zIndex: 1, pointerEvents: 'none', transition: 'filter 0.2s' }} 
                  draggable={false}
                />
                
                <div style={{ zIndex: 2, pointerEvents: 'none', marginTop: '10px' }}>
                  <span className="ing-label">{currentIng.name}</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ marginTop: '30px', fontWeight: 'bold', color: '#555' }}>
        Sisa Bahan: {shuffledIngs.length - currentIndex}
      </div>

    </div>
  );
}
