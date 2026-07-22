
interface IslandPauseConfirmProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function IslandPauseConfirm({ onConfirm, onCancel }: IslandPauseConfirmProps) {
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
          Apakah anda yakin? Ini akan <strong>mereset semua progress</strong> pada pulau ini.
        </p>
        
        <p className="mgbc-note">
          ✨ Skor dan hasil merge saat ini tidak akan disimpan jika kamu keluar sekarang.
        </p>

        {}
        <div className="mgbc-actions">
          <button className="mgbc-btn mgbc-btn--cancel" onClick={onCancel}>
            Lanjut Bermain 🎮
          </button>
          <button className="mgbc-btn mgbc-btn--confirm" onClick={onConfirm}>
            Keluar & Reset
          </button>
        </div>

      </div>
    </div>
  );
}
