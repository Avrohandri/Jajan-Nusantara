import { useState, useRef, useCallback } from 'react';

interface Ingredient {
  id: string;
  imgSrc: string;       // path to transparent PNG (user-supplied)
  plateColor: string;   // CSS color for the decorative plate
  correct: boolean;
  dropped: boolean;
}

const INITIAL_INGREDIENTS: Ingredient[] = [
  { id: 'tepung', imgSrc: '/assets/klepon/ing_tepung.png',  plateColor: '#EEE8DA', correct: true,  dropped: false },
  { id: 'pandan', imgSrc: '/assets/klepon/ing_pandan.png',  plateColor: '#4CAF50', correct: true,  dropped: false },
  { id: 'gula',   imgSrc: '/assets/klepon/ing_gula.png',    plateColor: '#5D3A1A', correct: true,  dropped: false },
  { id: 'bawang', imgSrc: '/assets/klepon/ing_bawang.png',  plateColor: '#9C6BAE', correct: false, dropped: false },
  { id: 'tomat',  imgSrc: '/assets/klepon/ing_tomat.png',   plateColor: '#87CEEB', correct: false, dropped: false },
  { id: 'cabai',  imgSrc: '/assets/klepon/ing_cabai.png',   plateColor: '#FFC107', correct: false, dropped: false },
];

interface Props {
  onComplete: () => void;
}

export function StepIngredients({ onComplete }: Props) {
  const [ingredients, setIngredients] = useState(INITIAL_INGREDIENTS);
  const [bowlState, setBowlState]     = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [draggingId, setDraggingId]   = useState<string | null>(null);
  const [isOver, setIsOver]           = useState(false);

  const bowlRef       = useRef<HTMLDivElement>(null);
  const ghostRef      = useRef<HTMLDivElement | null>(null);
  const shakeTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      if (correctCount + 1 >= totalCorrect) setTimeout(() => onComplete(), 700);
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
    ghost.innerHTML = `<img src="${ing.imgSrc}" style="width:100%;height:100%;object-fit:contain;" />`;
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

  return (
    <div className="ing-screen">

      {/* ── Info card ── */}
      <div className="ing-info-card">
        <div className="ing-info-header">
          <div className="ing-info-left">
            <h2 className="ing-card-title">🌾 Pilih Bahan</h2>
            <p className="ing-card-sub">Pilih bahan yang tepat untuk klepon</p>
          </div>
        </div>

        {/* Instruction bar */}
        <div className="ing-instruction-bar">
          Drag bahan yang benar ke dalam mangkok! ☕
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
            <div className="ing-coaster">
              <img
                src={ing.imgSrc}
                alt=""
                className="ing-img"
                draggable={false}
              />
            </div>
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
        {/* Use actual bowl image; user will supply */}
        <img src="/assets/klepon/mangkok.png" alt="mangkok" className="ing-bowl-img" />

        {/* Dropped ingredients float inside bowl */}
        <div className="ing-bowl-contents">
          {ingredients.filter(i => i.correct && i.dropped).map(i => (
            <img key={i.id} src={i.imgSrc} alt="" className="ing-bowl-item" />
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
