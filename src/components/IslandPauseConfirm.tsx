import React from 'react';

/**
 * IslandPauseConfirm
 * Dialog konfirmasi saat menekan tombol home di pause menu game utama (merge).
 * Menggunakan style yang sama dengan MiniGameBackConfirm (mgbc-*).
 */

interface IslandPauseConfirmProps {
  /** Callback saat player konfirmasi keluar */
  onConfirm: () => void;
  /** Callback saat player membatalkan (tetap main) */
  onCancel: () => void;
}

export function IslandPauseConfirm({ onConfirm, onCancel }: IslandPauseConfirmProps) {
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
          Apakah anda yakin? Ini akan <strong>mereset semua progress</strong> pada pulau ini.
        </p>
        
        <p className="mgbc-note">
          ✨ Skor dan hasil merge saat ini tidak akan disimpan jika kamu keluar sekarang.
        </p>

        {/* Tombol aksi */}
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
