import { useState, useEffect } from 'react';

/**
 * Semua aset gambar yang dipakai di seluruh game.
 * Preload dilakukan di halaman Login agar navigasi ke screen lain mulus tanpa loading.
 */
const ALL_GAME_ASSETS: string[] = [
  // ── Backgrounds & UI universal ─────────────────────────────────────────────
  '/assets/klepon/bg_kitchen.png',
  '/jog jaBG.png',
  '/baliBG.png',
  '/acehBG.png',
  '/malukuBG.png',

  // ── Klepon mini-game ───────────────────────────────────────────────────────
  '/assets/klepon/adonan_bolong.png',
  '/assets/klepon/adonan_isi.png',
  '/assets/klepon/adonan_bundar.png',
  '/assets/klepon/adonan_kelapa.png',
  '/assets/klepon/kukusan_tutup.png',
  '/assets/klepon/klepon_jadi.png',

  // ── Pie Susu mini-game ─────────────────────────────────────────────────────
  '/assets/pie_susu/ing_adonan 1.png',
  '/assets/pie_susu/ing_adonan 2.png',
  '/assets/pie_susu/ing_adonan jadi.png',
  '/assets/pie_susu/ing_adonan susu.png',
  '/assets/pie_susu/oven_tutup.png',
  '/assets/pie_susu/oven_buka.png',
  '/assets/pie_susu/oven_jadi.png',
  '/assets/pie_susu/pie susu_jadi.png',
  '/assets/pie_susu/ing_tepung.png',
  '/assets/pie_susu/ing_mentega.png',
  '/assets/pie_susu/ing_telur.png',
  '/assets/pie_susu/ing_susu.png',
  '/assets/pie_susu/ing_cokelat.png',
  '/assets/pie_susu/ing_jeruk.png',
  '/assets/pie_susu/ing_tomat.png',

  // ── Samaloyang mini-game ───────────────────────────────────────────────────
  '/assets/samaloyang/cetakan_berisi.png',
  '/assets/samaloyang/samaloyang_mold.png',
  '/assets/samaloyang/wajan.png',
  '/assets/samaloyang/ing_tepung.png',
  '/assets/samaloyang/ing_telur.png',
  '/assets/samaloyang/ing_santan.png',
  '/assets/samaloyang/ing_vanilla.png',
  '/assets/samaloyang/mangkok_aduk.png',
  '/assets/samaloyang/adonan_putar.png',
  '/assets/samaloyang/samaloyang_jadi.png',

  // ── Pisang Asar mini-game ──────────────────────────────────────────────────
  '/assets/pisang_asar/pisang_terpotong.png',
  '/assets/pisang_asar/pisang_utuh.png',
  '/assets/pisang_asar/pisang_tray.png',
  '/assets/pisang_asar/pisang_topping.png',
  '/assets/pisang_asar/pisang_siap.png',
  '/assets/pisang_asar/pisang_asar.png',
  '/assets/pisang_asar/pisang.png',
  '/assets/pisang_asar/kacang_kenari.png',
  '/assets/pisang_asar/telur.png',
  '/assets/pisang_asar/margarin.png',
  '/assets/pisang_asar/gula_aren.png',
  '/assets/pisang_asar/tempe.png',
  '/assets/pisang_asar/mangkok_adonan.png',
  '/assets/pisang_asar/mangkok_aduk.png',
  '/assets/pisang_asar/adonan_putar.png',
  '/assets/pisang_asar/panci.png',

  // ── Universal UI ──────────────────────────────────────────────────────────
  '/assets/universal/rotation_arrow.png',

  // ── Drop & Merge — Jogja food sprites ─────────────────────────────────────
  '/assets/foods_jogja/00_Klepon.png',
  '/assets/foods_jogja/01_Cenil.png',
  '/assets/foods_jogja/02_Yangko.png',
  '/assets/foods_jogja/03_Geplak.png',
  '/assets/foods_jogja/04_Bakpia.png',
  '/assets/foods_jogja/05_Lemper.png',
  '/assets/foods_jogja/06_TiwulAyu.png',
  '/assets/foods_jogja/07_JadahTempe.png',

  // ── Drop & Merge — Bali food sprites ──────────────────────────────────────
  '/assets/foods_bali/00_laklak.png',
  '/assets/foods_bali/01_kaliadrem.png',
  '/assets/foods_bali/02_pie susu.png',
  '/assets/foods_bali/03_jaje walik.png',
  '/assets/foods_bali/04_bendu.png',
  '/assets/foods_bali/05_jaje uli.png',
  '/assets/foods_bali/06_pisang rai.png',

  // ── Drop & Merge — Aceh food sprites ──────────────────────────────────────
  '/assets/foods_aceh/00_samaloyang.png',
  '/assets/foods_aceh/01_timphan.png',
  '/assets/foods_aceh/02_pulot ijo.png',
  '/assets/foods_aceh/03_keukarah.png',
  '/assets/foods_aceh/04_bungong kayee.png',
  '/assets/foods_aceh/05_meuseukat.png',
  '/assets/foods_aceh/06_kue adee.png',

  // ── Drop & Merge — Maluku food sprites ────────────────────────────────────
  '/assets/foods_maluku/00_koyabu.png',
  '/assets/foods_maluku/01_sagu lempeng.png',
  '/assets/foods_maluku/02_sagu gula.png',
  '/assets/foods_maluku/03_talam sagu bakar.png',
  '/assets/foods_maluku/04_asida.png',
  '/assets/foods_maluku/05_kue bagea.png',
  '/assets/foods_maluku/06_pisang asar.png',

  // ── Cooking Intro Screen ───────────────────────────────────────────────────
  '/assets/foods_jogja/00_Klepon.png',   // already above, deduplicated by browser cache
  '/assets/foods_bali/02_pie susu.png',
  '/assets/foods_aceh/00_samaloyang.png',
  '/assets/foods_maluku/06_pisang asar.png',
];

/** Hapus duplikat */
const UNIQUE_ASSETS = [...new Set(ALL_GAME_ASSETS)];

export interface PreloadState {
  /** 0–100 */
  progress: number;
  /** true ketika semua gambar sudah selesai dimuat (sukses maupun gagal) */
  done: boolean;
}

/**
 * Hook yang memuat semua aset game di background.
 * Setiap gambar yang berhasil (atau gagal) dihitung sebagai kemajuan.
 * Tidak pernah memblokir render — hasilnya hanya status progres.
 */
export function useGlobalPreload(): PreloadState {
  const [loaded, setLoaded] = useState(0);
  const total = UNIQUE_ASSETS.length;

  useEffect(() => {
    let mounted = true;
    let count = 0;

    const tick = () => {
      if (!mounted) return;
      count++;
      setLoaded(count);
    };

    UNIQUE_ASSETS.forEach((src) => {
      const img = new Image();
      img.onload = tick;
      img.onerror = tick; // tetap hitung meski gagal
      img.src = src;
    });

    return () => { mounted = false; };
  }, []);

  const progress = total === 0 ? 100 : Math.round((loaded / total) * 100);
  return { progress, done: progress >= 100 };
}
