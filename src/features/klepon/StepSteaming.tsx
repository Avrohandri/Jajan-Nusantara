import { useState, useRef, useEffect } from 'react';
import { useSfx } from '../../hooks/useSfx';
import { CognitiveInfoPopup } from './CognitiveInfoPopup';

interface Props {
  onComplete: () => void;
}

const KLEPON_COUNT = 3;
// Durasi simulasi mengukus dalam detik (representasi visual, bukan 15 menit asli)
const STEAM_DURATION_MS = 3000;

export function StepSteaming({ onComplete }: Props) {
  const { playButtonClick } = useSfx();
  const [inPan, setInPan] = useState<boolean[]>(Array(KLEPON_COUNT).fill(false));
  const [boiling, setBoiling] = useState(false);
  const [done, setDone] = useState(false);
  const [bubbles, setBubbles] = useState<{ id: number; x: number }[]>([]);
  const [showSteamPopup, setShowSteamPopup] = useState(false);
  const [steamSecondsLeft, setSteamSecondsLeft] = useState(3); // countdown simulasi
  const panRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);
  const bubbleIdRef = useRef(0);
  const bubbleInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);
  const boilingStartedRef = useRef(false);
  const steamPopupShownRef = useRef(false);

  const allIn = inPan.every(Boolean);

  useEffect(() => {
    if (allIn && !boilingStartedRef.current) {
      boilingStartedRef.current = true;

      // Tampilkan popup info kukus dulu
      if (!steamPopupShownRef.current) {
        steamPopupShownRef.current = true;
        setTimeout(() => setShowSteamPopup(true), 400);
      }

      setBoiling(true);

      // Bubble animasi
      bubbleInterval.current = setInterval(() => {
        setBubbles(prev => {
          const newBubble = { id: bubbleIdRef.current++, x: 20 + Math.random() * 60 };
          return [...prev.slice(-8), newBubble];
        });
      }, 250);

      // Countdown simulasi
      let secs = Math.ceil(STEAM_DURATION_MS / 1000);
      setSteamSecondsLeft(secs);
      countdownInterval.current = setInterval(() => {
        secs -= 1;
        setSteamSecondsLeft(secs);
        if (secs <= 0 && countdownInterval.current) clearInterval(countdownInterval.current);
      }, 1000);

      // Selesai kukus
      setTimeout(() => {
        if (bubbleInterval.current) clearInterval(bubbleInterval.current);
        if (countdownInterval.current) clearInterval(countdownInterval.current);
        setDone(true);
        setTimeout(() => {
          if (!completedRef.current) {
            completedRef.current = true;
            onComplete();
          }
        }, 600);
      }, STEAM_DURATION_MS);
    }
    return () => {
      if (bubbleInterval.current) clearInterval(bubbleInterval.current);
      if (countdownInterval.current) clearInterval(countdownInterval.current);
    };
  }, [allIn, onComplete]);

  const dropKlepon = (idx: number) => {
    if (inPan[idx]) return;
    setInPan(prev => { const n = [...prev]; n[idx] = true; return n; });
  };

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    playButtonClick();
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('kleponIdx', String(idx));
  };

  const handlePanDragOver = (e: React.DragEvent) => e.preventDefault();

  const handlePanDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const idx = parseInt(e.dataTransfer.getData('kleponIdx'));
    if (!isNaN(idx)) dropKlepon(idx);
  };

  const handleTouchStart = (e: React.TouchEvent, idx: number) => {
    playButtonClick();
    const touch = e.touches[0];
    const ghost = document.createElement('div');
    ghost.style.cssText = `position:fixed;left:${touch.clientX - 45}px;top:${touch.clientY - 45}px;width:90px;height:90px;pointer-events:none;z-index:999;filter:drop-shadow(0 6px 12px rgba(0,0,0,0.3))`;
    ghost.innerHTML = `<img src="/assets/klepon/adonan_isi.png" style="width:100%;height:100%;object-fit:contain;" />`;
    ghost.dataset.idx = String(idx);
    document.body.appendChild(ghost);
    ghostRef.current = ghost;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (ghostRef.current) {
      ghostRef.current.style.left = `${touch.clientX - 25}px`;
      ghostRef.current.style.top = `${touch.clientY - 25}px`;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!ghostRef.current) return;
    const idx = parseInt(ghostRef.current.dataset.idx || '');
    document.body.removeChild(ghostRef.current);
    ghostRef.current = null;

    const touch = e.changedTouches[0];
    const pan = panRef.current;
    if (pan) {
      const rect = pan.getBoundingClientRect();
      if (
        touch.clientX >= rect.left && touch.clientX <= rect.right &&
        touch.clientY >= rect.top && touch.clientY <= rect.bottom
      ) {
        dropKlepon(idx);
      }
    }
  };

  const inPanCount = inPan.filter(Boolean).length;

  return (
    <div className="klepon-step-content">
      {/* Static info sebelum kukus */}
      {!allIn && (
        <div className="cog-static-card cog-static-card--compact">
          <div className="cog-static-label">♨️ Info Mengukus Klepon</div>
          <div className="cog-static-rows">
            <div className="cog-static-row"><span>🕐 Waktu</span><strong>15–20 menit api sedang</strong></div>
            <div className="cog-static-row"><span>💡 Pastikan</span><strong>Air sudah mendidih sebelum dimasukkan</strong></div>
            <div className="cog-static-row"><span>✅ Tanda matang</span><strong>Warna lebih pekat & mengapung</strong></div>
          </div>
        </div>
      )}

      <p className="klepon-instruction">
        Seret klepon ke dalam pengukus!
      </p>

      {/* Scene kukus */}
      <div className="boiling-scene">
        <div className="stove-area">

          <div
            ref={panRef}
            className={`pan ${boiling ? 'pan-boiling' : ''}`}
            onDragOver={handlePanDragOver}
            onDrop={handlePanDrop}
          >
            {/* Label status kukus */}
            {boiling && !done && (
              <div className="steam-countdown-badge">
                ♨️ {steamSecondsLeft}s
              </div>
            )}

            <div className="pan-contents">
              {inPan.map((inn, i) =>
                inn ? (
                  <img
                    key={i}
                    src="/assets/klepon/adonan_isi.png"
                    alt="adonan"
                    className={`pan-klepon-img ${boiling ? 'klepon-floating' : ''}`}
                    style={{ animationDelay: `${i * 0.3}s` }}
                  />
                ) : null
              )}
              {boiling && bubbles.map(b => (
                <span
                  key={b.id}
                  className="bubble"
                  style={{ left: `${b.x}%` }}
                >
                  💧
                </span>
              ))}
            </div>

          </div>
          <div className="flame-row">
            {['🔥', '🔥', '🔥'].map((f, i) => (
              <span key={i} className="flame" style={{ animationDelay: `${i * 0.15}s` }}>{f}</span>
            ))}
          </div>
        </div>

        {/* Klepon yang belum dimasukkan */}
        <div className="klepon-source-row">
          {inPan.map((inn, idx) =>
            !inn ? (
              <div
                key={idx}
                className="klepon-draggable"
                draggable
                onDragStart={e => handleDragStart(e, idx)}
                onTouchStart={e => handleTouchStart(e, idx)}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <img src="/assets/klepon/adonan_isi.png" alt="adonan" className="source-klepon-img" />
              </div>
            ) : null
          )}
        </div>
      </div>

      {/* Progress indicator */}
      {!allIn && (
        <div className="steam-progress-info">
          {inPanCount}/{KLEPON_COUNT} klepon masuk kukusan
        </div>
      )}

      {boiling && !done && (
        <p className="boiling-status">
          ♨️ Mengukus... {steamSecondsLeft > 0 ? `${steamSecondsLeft}s` : 'hampir selesai!'}
        </p>
      )}
      {done && (
        <p className="boiling-status" style={{ color: '#7CAD58' }}>✅ Klepon matang!</p>
      )}

      {/* Popup info waktu kukus — muncul saat semua klepon masuk */}
      {showSteamPopup && (
        <CognitiveInfoPopup
          title="♨️ Mengukus Klepon"
          subtitle="Proses pemasakan dengan uap panas"
          accentColor="#E07A2F"
          items={[
            { icon: '🕐', label: 'Waktu mengukus', value: '15–20 menit dengan api sedang', highlight: true },
            { icon: '💧', label: 'Persiapan', value: 'Pastikan air kukusan sudah mendidih sebelum memasukkan klepon', highlight: true },
            { icon: '✅', label: 'Tanda matang', value: 'Warna klepon lebih pekat & mengapung ke atas' },
            { icon: '🚫', label: 'Hindari', value: 'Membuka tutup kukusan terlalu sering — uap akan terbuang' },
            { icon: '🌡️', label: 'Suhu', value: 'Api sedang — jangan terlalu besar agar tidak pecah' },
          ]}
          tip="Alasi loyang kukusan dengan daun pisang agar klepon tidak lengket!"
          onClose={() => setShowSteamPopup(false)}
        />
      )}
    </div>
  );
}
