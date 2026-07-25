import { useEffect, useState } from 'react';

export interface CogInfoItem {
  icon: string;
  label: string;
  value: string;
  highlight?: boolean;
}

export interface CogPopupProps {
  title: string;
  subtitle?: string;
  items: CogInfoItem[];
  tip?: string;
  onClose: () => void;
  accentColor?: string; // default hijau pandan
}

/**
 * Popup kognitif bergaya "papan resep tradisional" —
 * glassmorphism coklat hangat + border emas + animasi spring.
 */
export function CognitiveInfoPopup({
  title,
  subtitle,
  items,
  tip,
  onClose,
  accentColor = '#7CAD58',
}: CogPopupProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger masuk setelah mount (untuk animasi CSS)
    const t = setTimeout(() => setVisible(true), 20);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 280); // tunggu animasi keluar
  };

  return (
    <div
      className={`cog-overlay ${visible ? 'cog-overlay--in' : ''}`}
      onClick={handleClose}
    >
      <div
        className={`cog-popup ${visible ? 'cog-popup--in' : ''}`}
        onClick={e => e.stopPropagation()}
        style={{ '--cog-accent': accentColor } as React.CSSProperties}
      >
        {/* Dekorasi atas */}
        <div className="cog-popup-deco" />

        {/* Header */}
        <div className="cog-popup-header">
          <h3 className="cog-popup-title">{title}</h3>
          {subtitle && <p className="cog-popup-subtitle">{subtitle}</p>}
        </div>

        {/* Body — daftar kuantitas / info */}
        <div className="cog-popup-body">
          {items.map((item, i) => (
            <div
              key={i}
              className={`cog-item ${item.highlight ? 'cog-item--highlight' : ''}`}
              style={item.highlight ? { borderColor: accentColor } : undefined}
            >
              <span className="cog-item-icon">{item.icon}</span>
              <div className="cog-item-text">
                <span className="cog-item-label">{item.label}</span>
                <span
                  className="cog-item-value"
                  style={item.highlight ? { color: accentColor } : undefined}
                >
                  {item.value}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Tip opsional */}
        {tip && (
          <div className="cog-tip">
            <span className="cog-tip-icon">💡</span>
            <span className="cog-tip-text">{tip}</span>
          </div>
        )}

        {/* Tombol tutup */}
        <button className="cog-close-btn" onClick={handleClose}>
          Mengerti! ✓
        </button>
      </div>
    </div>
  );
}
