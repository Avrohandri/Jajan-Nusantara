import { useState, useRef, useEffect } from 'react';

interface Props {
  onComplete: () => void;
}

const ITEMS = [
  { id: 'tepung', label: 'Tepung', imgSrc: '/assets/samaloyang/ing_tepung.png' }, 
  { id: 'telur', label: 'Telur', imgSrc: '/assets/samaloyang/ing_telur.png' },
  { id: 'santan', label: 'Santan', imgSrc: '/assets/samaloyang/ing_santan.png' }, 
  { id: 'vanilla', label: 'Vanilla', imgSrc: '/assets/samaloyang/ing_vanilla.png' } 
];

export function StepMatchIngredients({ onComplete }: Props) {
  const [complete, setComplete] = useState(false);
  const [matches, setMatches] = useState<Record<string, string>>({});

  // Shuffled arrays
  const [shuffledLabels] = useState(() => [...ITEMS].sort(() => Math.random() - 0.5));
  const [shuffledImages] = useState(() => [...ITEMS].sort(() => Math.random() - 0.5));

  // Drag states
  const [draggingLabelId, setDraggingLabelId] = useState<string | null>(null);
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const [labelPositions, setLabelPositions] = useState<Record<string, {x: number, y: number}>>({});
  const [imagePositions, setImagePositions] = useState<Record<string, {x: number, y: number}>>({});

  useEffect(() => {
    if (Object.keys(matches).length === ITEMS.length && !complete) {
      setTimeout(() => {
        setComplete(true);
        setTimeout(onComplete, 1000);
      }, 500);
    }
  }, [matches, complete, onComplete]);

  // Update layout positions for SVG lines
  const updatePositions = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    const newLabelPos: Record<string, {x: number, y: number}> = {};
    const newImgPos: Record<string, {x: number, y: number}> = {};

    shuffledLabels.forEach(item => {
      const el = document.getElementById(`label-${item.id}`);
      if (el) {
        const elRect = el.getBoundingClientRect();
        // Label is on the LEFT, anchor is its RIGHT side
        newLabelPos[item.id] = {
          x: elRect.right - rect.left,
          y: elRect.top + elRect.height / 2 - rect.top
        };
      }
    });

    shuffledImages.forEach(item => {
      const el = document.getElementById(`img-${item.id}`);
      if (el) {
        const elRect = el.getBoundingClientRect();
        // Image is on the RIGHT, anchor is its LEFT side
        newImgPos[item.id] = {
          x: elRect.left - rect.left,
          y: elRect.top + elRect.height / 2 - rect.top
        };
      }
    });

    setLabelPositions(newLabelPos);
    setImagePositions(newImgPos);
  };

  useEffect(() => {
    updatePositions();
    window.addEventListener('resize', updatePositions);
    return () => window.removeEventListener('resize', updatePositions);
  }, [shuffledLabels, shuffledImages]);

  // Pointer interactions
  const handlePointerDown = (id: string, e: React.PointerEvent) => {
    if (matches[id]) return; // already matched
    e.currentTarget.setPointerCapture(e.pointerId);
    setDraggingLabelId(id);
    
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const st = labelPositions[id];
      if (st) {
        setPointerPos({ x: st.x, y: st.y });
      } else {
        setPointerPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingLabelId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPointerPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!draggingLabelId) return;
    
    const elements = document.elementsFromPoint(e.clientX, e.clientY);
    let matchedTargetId = null;
    for (const el of elements) {
      const tgtId = el.getAttribute('data-target-id');
      if (tgtId) {
        matchedTargetId = tgtId;
        break;
      }
    }

    if (matchedTargetId === draggingLabelId) {
      setMatches(prev => ({ ...prev, [draggingLabelId]: matchedTargetId }));
    }

    setDraggingLabelId(null);
  };

  return (
    <div 
      className="klepon-step-content" 
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', position: 'relative', touchAction: 'none' }}
    >
      <style>
        {`
          @keyframes dash {
            to { stroke-dashoffset: -24; }
          }
          .marching-ants {
            animation: dash 1s linear infinite;
          }
        `}
      </style>

      {/* SVG Overlay for Lines */}
      <svg id="match-svg-overlay" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }}>
        {/* Draw confirmed matches */}
        {Object.entries(matches).map(([labelId, imgId]) => {
          const start = labelPositions[labelId];
          const end = imagePositions[imgId];
          if (!start || !end) return null;
          return (
            <line 
              key={labelId} x1={start.x} y1={start.y} x2={end.x} y2={end.y} 
              stroke="#4CAF50" strokeWidth="6" strokeLinecap="round"
            />
          );
        })}
        {/* Draw active drag line */}
        {draggingLabelId && labelPositions[draggingLabelId] && (
          <line
            x1={labelPositions[draggingLabelId].x} y1={labelPositions[draggingLabelId].y}
            x2={pointerPos.x} y2={pointerPos.y}
            stroke="#D4A373" strokeWidth="6" strokeLinecap="round" strokeDasharray="12 12"
            className="marching-ants"
          />
        )}
      </svg>

      <div style={{ display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'flex-start', gap: '80px', marginTop: '10px', zIndex: 2 }}>
        
        {/* Left Column: Labels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {shuffledLabels.map(item => {
            const isMatched = !!matches[item.id];
            const isDragging = draggingLabelId === item.id;
            return (
              <div 
                key={item.id} 
                id={`label-${item.id}`}
                onPointerDown={(e) => handlePointerDown(item.id, e)}
                style={{
                  height: '80px',
                  width: '90px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isMatched ? '#E8F5E9' : isDragging ? '#FFF8E1' : '#FFF',
                  border: `3px solid ${isMatched ? '#4CAF50' : isDragging ? '#FFC107' : '#D4A373'}`,
                  borderRadius: '14px',
                  fontWeight: 'bold', fontSize: '15px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  cursor: isMatched ? 'default' : 'grab',
                  opacity: isMatched ? 0.7 : 1,
                  transition: 'all 0.2s',
                  transform: isDragging ? 'scale(1.05)' : 'scale(1)',
                  touchAction: 'none'
                }}
              >
                {item.label}
              </div>
            );
          })}
        </div>

        {/* Right Column: Images */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {shuffledImages.map(item => {
            const isMatched = Object.values(matches).includes(item.id);
            return (
              <div
                key={item.id}
                id={`img-${item.id}`}
                data-target-id={item.id}
                style={{
                  width: '80px',
                  height: '80px',
                  background: isMatched ? '#E8F5E9' : '#FFF',
                  border: `3px solid ${isMatched ? '#4CAF50' : '#E0E0E0'}`,
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  opacity: isMatched ? 0.8 : 1,
                  transition: 'all 0.3s'
                }}
              >
                <img src={item.imgSrc} alt="bahan" style={{ width: '60px', height: '60px', objectFit: 'contain', pointerEvents: 'none' }} />
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
