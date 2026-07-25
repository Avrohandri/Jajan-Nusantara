import { useEffect, useState } from 'react';

export interface CogPopupProps {
  title: string;
  subtitle?: string;
  items?: any;
  tip?: string;
  onClose: () => void;
  accentColor?: string; // default hijau pandan
}

/**
 * Popup kognitif sederhana (toast) —
 * Muncul sekilas (2.5 detik) tanpa perlu dipencet
 */
export function CognitiveInfoPopup({
  title,
  onClose,
  accentColor = '#7CAD58',
}: CogPopupProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger masuk setelah mount
    const t = setTimeout(() => setVisible(true), 20);
    
    // Auto close after 2.5 seconds
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Wait for exit animation
    }, 2500);

    return () => {
      clearTimeout(t);
      clearTimeout(hideTimer);
    };
  }, [onClose]);

  return (
    <div
      className={`cog-toast ${visible ? 'cog-toast--in' : ''}`}
      style={{ backgroundColor: accentColor }}
    >
      <span className="cog-toast-text">{title}</span>
    </div>
  );
}
