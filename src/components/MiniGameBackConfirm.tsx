
interface MiniGameBackConfirmProps {
  foodName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function MiniGameBackConfirm({ foodName, onConfirm, onCancel }: MiniGameBackConfirmProps) {
  return (
    <div className="mgbc-overlay" role="dialog" aria-modal="true" aria-label="Konfirmasi keluar">
      <div className="mgbc-card">

        {}
        <div className="mgbc-icon-wrap" aria-hidden="true">
          <span className="mgbc-icon">⚠️</span>
        </div>

        {}
        <h2 className="mgbc-title">Yakin mau keluar?</h2>

        {}
        <p className="mgbc-body">
          Jika kamu keluar sekarang, progres memasak{' '}
          <strong>{foodName}</strong> akan hilang dan skor permainan sebelumnya
          akan <strong>direset</strong>.
        </p>
        <p className="mgbc-note">
          🔒 Pulau berikutnya juga belum terbuka sampai kamu menyelesaikan memasak!
        </p>

        {}
        <div className="mgbc-actions">
          <button className="mgbc-btn mgbc-btn--cancel" onClick={onCancel}>
            Lanjut Memasak 🍳
          </button>
          <button className="mgbc-btn mgbc-btn--confirm" onClick={onConfirm}>
            Keluar & Reset
          </button>
        </div>

      </div>
    </div>
  );
}
