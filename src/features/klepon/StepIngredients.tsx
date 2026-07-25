import { useState, useRef, useCallback, useEffect } from 'react';
import { useSfx } from '../../hooks/useSfx';
import { CognitiveInfoPopup } from './CognitiveInfoPopup';

interface Ingredient {
  id: string;
  name: string;
  imgSrc: string;
  plateColor: string;
  correct: boolean;
  dropped: boolean;
}

const INITIAL_INGREDIENTS: Ingredient[] = [
  { id: 'tepung', name: 'Tepung',     imgSrc: '/assets/klepon/ing_tepung.png',  plateColor: '#EEE8DA', correct: true,  dropped: false },
  { id: 'pandan', name: 'Pandan',     imgSrc: '/assets/klepon/ing_pandan.png',  plateColor: '#4CAF50', correct: true,  dropped: false },
  { id: 'gula',   name: 'Gula Merah', imgSrc: '/assets/klepon/ing_gula.png',    plateColor: '#5D3A1A', correct: true,  dropped: false },
  { id: 'bawang', name: 'Bawang',     imgSrc: '/assets/klepon/ing_bawang.png',  plateColor: '#9C6BAE', correct: false, dropped: false },
  { id: 'tomat',  name: 'Tomat',      imgSrc: '/assets/klepon/ing_tomat.png',   plateColor: '#87CEEB', correct: false, dropped: false },
  { id: 'cabai',  name: 'Cabai',      imgSrc: '/assets/klepon/ing_cabai.png',   plateColor: '#FFC107', correct: false, dropped: false },
];

// Info kognitif per bahan — muncul sebagai popup setelah di-drag
const ING_POPUP_INFO: Record<string, { title: string; subtitle?: string; items: { icon: string; label: string; value: string; highlight?: boolean }[]; tip?: string; accentColor?: string }> = {
  tepung: {
    title: '🌾 Tepung Ketan',
    subtitle: 'Bahan dasar adonan klepon',
    accentColor: '#C4A35A',
    items: [
      { icon: '⚖️', label: 'Jumlah untuk 1 porsi (10 klepon)', value: '250 gram', highlight: true },
      { icon: '🥣', label: 'Jenis tepung', value: 'Tepung ketan putih' },
      { icon: '💧', label: 'Kandungan', value: 'Gluten rendah, menghasilkan tekstur kenyal khas klepon' },
    ],
    tip: 'Jangan gunakan tepung terigu biasa — klepon tidak akan kenyal!',
  },
  pandan: {
    title: '🌿 Daun Pandan',
    subtitle: 'Pewarna & aroma alami klepon',
    accentColor: '#7CAD58',
    items: [
      { icon: '🍃', label: 'Daun pandan segar', value: '±15 lembar', highlight: true },
      { icon: '💧', label: 'Hasil setelah diolah', value: '±100 ml air pandan', highlight: true },
      { icon: '🔧', label: 'Cara membuat', value: 'Blender daun pandan + sedikit air → saring' },
      { icon: '🎨', label: 'Fungsi', value: 'Warna hijau alami + aroma harum khas' },
    ],
    tip: 'Air pandan dimasukkan sedikit demi sedikit agar adonan tidak terlalu lembek!',
  },
  gula: {
    title: '🍬 Gula Merah',
    subtitle: 'Isian manis kejutan klepon',
    accentColor: '#8B4513',
    items: [
      { icon: '⚖️', label: 'Per 1 klepon', value: '±1 sdt / ±5 gram', highlight: true },
      { icon: '⚖️', label: 'Untuk 1 porsi (10 klepon)', value: '±50–100 gram gula merah', highlight: false },
      { icon: '✂️', label: 'Persiapan', value: 'Sisir / potong kecil agar mudah dimasukkan' },
      { icon: '💥', label: 'Sensasi', value: 'Meletus manis saat digigit!' },
    ],
    tip: 'Lubangi adonan dengan ibu jari sebelum memasukkan gula agar mudah ditutup.',
  },
};

interface Props {
  onComplete: () => void;
}

export function StepIngredients({ onComplete }: Props) {
  const { playButtonClick } = useSfx();
  const [ingredients, setIngredients] = useState(INITIAL_INGREDIENTS);
  const [bowlState, setBowlState]     = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [draggingId, setDraggingId]   = useState<string | null>(null);
  const [isOver, setIsOver]           = useState(false);
  const [popup, setPopup]             = useState<string | null>(null); // id bahan yang muncul popup

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

  const triggerFeedback = useCallback((correct: boolean) => {
    setBowlState(correct ? 'correct' : 'wrong');
    if (shakeTimer.current) clearTimeout(shakeTimer.current);
    shakeTimer.current = setTimeout(() => setBowlState('idle'), 800);
  }, []);

  const handleDrop = useCallback((id: string) => {
    const ing = ingredients.find(i => i.id === id);
    if (!ing || ing.dropped) return;

    if (ing.correct) {
      setIngredients(prev => prev.map(i => i.id === id ? { ...i, dropped: true } : i));
      triggerFeedback(true);
      // Tampilkan popup info untuk bahan yang benar
      if (ING_POPUP_INFO[id]) setPopup(id);
      // Lanjut hanya jika popup sudah di-dismiss (dihandle di onClose popup)
    } else {
      triggerFeedback(false);
    }
    setDraggingId(null);
  }, [ingredients, triggerFeedback]);

  // Ketika popup ditutup, cek apakah semua bahan sudah dimasukkan
  const handlePopupClose = useCallback(() => {
    setPopup(null);
    setIngredients(prev => {
      const newCorrectCount = prev.filter(i => i.correct && i.dropped).length;
      const total = prev.filter(i => i.correct).length;
      if (newCorrectCount >= total) {
        setTimeout(() => onComplete(), 400);
      }
      return prev;
    });
  }, [onComplete]);

  const onDragStart = (e: React.DragEvent, id: string) => {
    playButtonClick();
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

  const touchIngId = useRef<string | null>(null);

  const onTouchStart = (e: React.TouchEvent, id: string) => {
    playButtonClick();
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

  const popupInfo = popup ? ING_POPUP_INFO[popup] : null;

  return (
    <div className="ing-screen">

      {/* Info card static — kuantitas bahan 1 porsi */}
      <div className="ing-info-card">
        <div className="ing-info-header">
          <div className="ing-info-left">
            <h2 className="ing-card-title">🌾 Pilih Bahan</h2>
            <p className="ing-card-sub">Pilih bahan yang tepat untuk klepon</p>
          </div>
        </div>

        {/* Tabel kuantitas static */}
        <div className="cog-static-card">
          <div className="cog-static-label">📋 Takaran 1 Porsi (10 klepon)</div>
          <div className="cog-static-rows">
            <div className="cog-static-row"><span>🌾 Tepung ketan</span><strong>250 gram</strong></div>
            <div className="cog-static-row"><span>🌿 Air pandan</span><strong>100 ml</strong></div>
            <div className="cog-static-row"><span>🍬 Gula merah</span><strong>100 gram</strong></div>
            <div className="cog-static-row"><span>🥥 Kelapa parut</span><strong>100 gram</strong></div>
          </div>
        </div>

        {/* Instruksi drag */}
        <div className="ing-instruction-bar">
          Seret bahan yang benar ke dalam mangkok! ☕
        </div>
      </div>

      {/* Grid bahan */}
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
            <div className="ing-coaster">
              <img
                src={ing.imgSrc}
                alt={ing.name}
                className="ing-img"
                draggable={false}
                style={ing.id === 'pandan' ? { transform: 'translate(5px, -5px) scale(1.1)' } : undefined}
              />
            </div>

            {!ing.dropped && (
              <div className="ing-label">
                {ing.name}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bowl drop zone */}
      <div
        ref={bowlRef}
        className={bowlClass}
        onDragOver={onBowlDragOver}
        onDragLeave={onBowlDragLeave}
        onDrop={onBowlDrop}
      >
        <img src="/assets/klepon/mangkok.png" alt="mangkok" className="ing-bowl-img" />

        <div className="ing-bowl-contents">
          {ingredients.filter(i => i.correct && i.dropped).map(i => (
            <img key={i.id} src={i.imgSrc} alt="" className="ing-bowl-item" />
          ))}
        </div>

        {correctCount === 0 && (
          <span className="ing-bowl-hint">Taruh bahan<br />di sini</span>
        )}
      </div>

      {/* Popup kognitif per bahan */}
      {popup && popupInfo && (
        <CognitiveInfoPopup
          title={popupInfo.title}
          subtitle={popupInfo.subtitle}
          items={popupInfo.items}
          tip={popupInfo.tip}
          accentColor={popupInfo.accentColor}
          onClose={handlePopupClose}
        />
      )}
    </div>
  );
}
