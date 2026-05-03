/**
 * MiniGameBackConfirm
 * Dialog peringatan bertema game kuliner — muncul saat player menekan tombol back
 * di tengah-tengah mini game memasak.
 */

interface MiniGameBackConfirmProps {
  /** Nama makanan yang sedang dimasak, e.g. "Klepon" */
  foodName: string;
  /** Callback saat player konfirmasi keluar */
  onConfirm: () => void;
  /** Callback saat player membatalkan (tetap main) */
  onCancel: () => void;
}

export function MiniGameBackConfirm({ foodName, onConfirm, onCancel }: MiniGameBackConfirmProps) {
  return (
    <div className="mgbc-overlay" role="dialog" aria-modal="true" aria-label="Konfirmasi keluar">
      <div className="mgbc-card">

        {/* Icon peringatan */}
        <div className="mgbc-icon-wrap" aria-hidden="true">
          <span className="mgbc-icon">⚠️</span>
        </div>

        {/* Judul */}
        <h2 className="mgbc-title">Yakin mau keluar?</h2>

        {/* Isi pesan */}
        <p className="mgbc-body">
          Jika kamu keluar sekarang, progres memasak{' '}
          <strong>{foodName}</strong> akan hilang dan skor permainan sebelumnya
          akan <strong>direset</strong>.
        </p>
        <p className="mgbc-note">
          🔒 Pulau berikutnya juga belum terbuka sampai kamu menyelesaikan memasak!
        </p>

        {/* Tombol aksi */}
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
