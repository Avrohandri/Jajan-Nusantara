import { useState, useRef, useCallback, useEffect } from 'react';

interface Ingredient {
  id: string;
  name: string;        // display name
  imgSrc: string;       // path to transparent PNG (user-supplied)
  emoji: string;        // fallback emoji
  correct: boolean;
  dropped: boolean;
}

const INITIAL_INGREDIENTS: Ingredient[] = [
  { id: 'pisang',   name: 'Pisang',        imgSrc: '/assets/pisang_asar/pisang.png',        emoji: '🍌', correct: true,  dropped: false },
  { id: 'kenari',   name: 'Kacang Kenari', imgSrc: '/assets/pisang_asar/kacang_kenari.png', emoji: '🥜', correct: true,  dropped: false },
  { id: 'telur',    name: 'Telur',         imgSrc: '/assets/pisang_asar/telur.png',         emoji: '🥚', correct: true,  dropped: false },
  { id: 'margarin', name: 'Margarin',      imgSrc: '/assets/pisang_asar/margarin.png',      emoji: '🧈', correct: true,  dropped: false },
  { id: 'gula',     name: 'Gula Aren',     imgSrc: '/assets/pisang_asar/gula_aren.png',     emoji: '🟤', correct: true,  dropped: false },
  { id: 'salah',    name: 'Tempe',         imgSrc: '/assets/pisang_asar/tempe.png',         emoji: '🟫', correct: false, dropped: false },
];

interface Props {
  onComplete: () => void;
}

export function StepIngredientSelection({ onComplete }: Props) {
  const [ingredients, setIngredients] = useState(INITIAL_INGREDIENTS);
  const [bowlState, setBowlState]     = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [draggingId, setDraggingId]   = useState<string | null>(null);
  const [isOver, setIsOver]           = useState(false);
  const completedRef                  = useRef(false);

  const bowlRef       = useRef<HTMLDivElement>(null);
  const ghostRef      = useRef<HTMLDivElement | null>(null);
  const shakeTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (ghostRef.current && document.body.contains(ghostRef.current)) {
        document.body.removeChild(ghostRef.current);
      }
    };
  }, []);

  const correctCount  = ingredients.filter(i => i.correct && i.dropped).length;
  const totalCorrect  = ingredients.filter(i => i.correct).length;

  /* ─── feedback ─── */
  const triggerFeedback = useCallback((correct: boolean) => {
    setBowlState(correct ? 'correct' : 'wrong');
    if (shakeTimer.current) clearTimeout(shakeTimer.current);
    shakeTimer.current = setTimeout(() => setBowlState('idle'), 800);
  }, []);

  /* ─── drop logic ─── */
  const handleDrop = useCallback((id: string) => {
    const ing = ingredients.find(i => i.id === id);
    if (!ing || ing.dropped) return;

    if (ing.correct) {
      setIngredients(prev => prev.map(i => i.id === id ? { ...i, dropped: true } : i));
      triggerFeedback(true);
      if (correctCount + 1 >= totalCorrect && !completedRef.current) {
        completedRef.current = true;
        setTimeout(() => onComplete(), 700);
      }
    } else {
      triggerFeedback(false);
    }
    setDraggingId(null);
  }, [ingredients, correctCount, totalCorrect, onComplete, triggerFeedback]);

  /* ─── mouse drag ─── */
  const onDragStart = (e: React.DragEvent, id: string) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
  };
  const onBowlDragOver  = (e: React.DragEvent) => { e.preventDefault(); setIsOver(true); };
  const onBowlDragLeave = () => setIsOver(false);
  const onBowlDrop      = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    if (draggingId) handleDrop(draggingId);
  };

  /* ─── touch drag ─── */
  const touchIngId = useRef<string | null>(null);

  const onTouchStart = (e: React.TouchEvent, id: string) => {
    touchIngId.current = id;
    const touch = e.touches[0];
    const ing = ingredients.find(i => i.id === id);
    if (!ing) return;

    const ghost = document.createElement('div');
    ghost.className = 'ing-ghost';
    ghost.style.cssText = [
      `position:fixed`,
      `left:${touch.clientX - 55}px`,
      `top:${touch.clientY - 55}px`,
      `width:110px`,
      `height:110px`,
      `background:transparent`,
      `display:flex`,
      `align-items:center`,
      `justify-content:center`,
      `pointer-events:none`,
      `z-index:9999`,
      `filter:drop-shadow(0 8px 16px rgba(0,0,0,0.3))`,
      `transition:none`,
    ].join(';');
    
    // Check if the image exists, otherwise fall back to emoji visually
    const img = new Image();
    img.src = ing.imgSrc;
    img.onload = () => {
      ghost.innerHTML = `<img src="${ing.imgSrc}" style="width:100%;height:100%;object-fit:contain;" />`;
    };
    img.onerror = () => {
      ghost.innerHTML = `<div style="font-size: 80px;">${ing.emoji}</div>`;
    };
    
    document.body.appendChild(ghost);
    ghostRef.current = ghost;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (ghostRef.current) {
      ghostRef.current.style.left = `${touch.clientX - 45}px`;
      ghostRef.current.style.top  = `${touch.clientY - 45}px`;
    }
    const bowl = bowlRef.current;
    if (bowl) {
      const r = bowl.getBoundingClientRect();
      const over = touch.clientX >= r.left && touch.clientX <= r.right &&
                   touch.clientY >= r.top  && touch.clientY <= r.bottom;
      setIsOver(over);
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (ghostRef.current) { document.body.removeChild(ghostRef.current); ghostRef.current = null; }
    const touch = e.changedTouches[0];
    const bowl  = bowlRef.current;
    setIsOver(false);
    if (bowl && touchIngId.current) {
      const r = bowl.getBoundingClientRect();
      const dropped = touch.clientX >= r.left && touch.clientX <= r.right &&
                      touch.clientY >= r.top  && touch.clientY <= r.bottom;
      if (dropped) handleDrop(touchIngId.current);
    }
    touchIngId.current = null;
  };

  const bowlClass = [
    'ing-bowl-zone',
    isOver          ? 'bowl-zone-over'    : '',
    bowlState === 'wrong'   ? 'bowl-zone-wrong'   : '',
    bowlState === 'correct' ? 'bowl-zone-correct'  : '',
  ].filter(Boolean).join(' ');

  // Standard React onError handler for fallback images
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, emoji: string) => {
    e.currentTarget.style.display = 'none';
    const parent = e.currentTarget.parentElement;
    if (parent) {
      const fallback = document.createElement('div');
      fallback.style.fontSize = '90px'; // increased from 80px
      fallback.style.display = 'flex';
      fallback.style.alignItems = 'center';
      fallback.style.justifyContent = 'center';
      fallback.style.width = '100px';
      fallback.style.height = '100px';
      fallback.innerText = emoji;
      parent.appendChild(fallback);
    }
  };

  return (
    <div className="ing-screen">
      {/* ── Info card ── */}
      <div className="ing-info-card">
        <div className="ing-info-header">
          <div className="ing-info-left">
            <h2 className="ing-card-title">🌾 Pilih Bahan</h2>
            <p className="ing-card-sub">Pilih bahan yang tepat untuk Pisang Asar</p>
          </div>
        </div>
        {/* Instruction bar */}
        <div className="ing-instruction-bar">
          Drag bahan yang benar ke dalam panci! 🍲
        </div>
      </div>

      {/* ── 2 × 3 ingredient grid ── */}
      <div className="ing-grid">
        {ingredients.map(ing => (
          <div
            key={ing.id}
            className={`ing-item ${ing.dropped ? 'ing-item-dropped' : ''}`}
            draggable={!ing.dropped}
            onDragStart={e => onDragStart(e, ing.id)}
            onDragEnd={()  => setDraggingId(null)}
            onTouchStart={e => onTouchStart(e, ing.id)}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{ opacity: ing.dropped ? 0.25 : 1 }}
          >
            {/* Wooden coaster */}
            <div className="ing-coaster" style={{ width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={ing.imgSrc}
                alt={ing.name}
                className="ing-img"
                draggable={false}
                onError={(e) => handleImageError(e, ing.emoji)}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            {/* Ingredient Name Label */}
            {!ing.dropped && (
              <div className="ing-label">
                {ing.name}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Bowl drop-zone ── */}
      <div
        ref={bowlRef}
        className={bowlClass}
        onDragOver={onBowlDragOver}
        onDragLeave={onBowlDragLeave}
        onDrop={onBowlDrop}
      >
        <img 
          src="/assets/pisang_asar/panci.png" 
          alt="panci" 
          className="ing-bowl-img" 
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent && !parent.querySelector('.fallback-panci')) {
              const fallback = document.createElement('div');
              fallback.className = 'fallback-panci';
              fallback.style.fontSize = '120px';
              fallback.innerText = '🍲';
              parent.insertBefore(fallback, parent.firstChild);
            }
          }}
        />

        {/* Dropped ingredients float inside bowl */}
        <div className="ing-bowl-contents">
          {ingredients.filter(i => i.correct && i.dropped).map(i => (
            <div key={i.id} style={{ fontSize: '40px' }} className="ing-bowl-item">
              <img src={i.imgSrc} alt="" style={{width: '100%', height:'100%', objectFit: 'contain'}} onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) parent.innerText = i.emoji;
              }} />
            </div>
          ))}
        </div>

        {/* Hint text shown when bowl is empty */}
        {correctCount === 0 && (
          <span className="ing-bowl-hint">Taruh bahan<br />di sini</span>
        )}
      </div>

    </div>
  );
}
