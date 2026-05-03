/**
 * ============================================================
 *  KONFIGURASI SYARAT BINTANG PER PULAU
 * ============================================================
 *  Ubah nilai di sini untuk mengatur syarat bintang setiap pulau.
 *
 *  star3 = skor MINIMUM untuk mendapat ⭐⭐⭐
 *  star2 = skor MINIMUM untuk mendapat ⭐⭐  (harus < star3)
 *  star1 = skor MINIMUM untuk mendapat ⭐   (harus < star2)
 *
 *  Jika skor pemain di bawah star1 → 0 bintang (tidak dihitung)
 * ============================================================
 */

export interface StarThreshold {
  /** Minimum skor untuk bintang 1 */
  star1: number;
  /** Minimum skor untuk bintang 2 */
  star2: number;
  /** Minimum skor untuk bintang 3 */
  star3: number;
}

export const STAR_THRESHOLDS: Record<string, StarThreshold> = {
  /** Pulau Jogja — Drop & Merge Jadah Tempe */
  jogja: {
    star1: 500,   // ⭐   : skor 500 – 1499
    star2: 1500,  // ⭐⭐  : skor 1500 – 2999
    star3: 2800,  // ⭐⭐⭐ : skor ≥ 3000
  },

  /** Pulau Bali — Drop & Merge Pisang Rai */
  bali: {
    star1: 600,   // ⭐   : skor 600 – 1799
    star2: 1200,  // ⭐⭐  : skor 1800 – 3499
    star3: 2100,  // ⭐⭐⭐ : skor ≥ 3500
  },

  /** Pulau Aceh — Drop & Merge Kue Adee */
  aceh: {
    star1: 600,   // ⭐   : skor 700 – 1999
    star2: 1200,  // ⭐⭐  : skor 2000 – 3999
    star3: 2100,  // ⭐⭐⭐ : skor ≥ 4000
  },

  /** Pulau Maluku — Drop & Merge Pisang Asar */
  maluku: {
    star1: 600,   // ⭐   : skor 800 – 2499
    star2: 1200,  // ⭐⭐  : skor 2500 – 4999
    star3: 2100,  // ⭐⭐⭐ : skor ≥ 5000
  },
};

/**
 * Hitung jumlah bintang (0–3) berdasarkan skor dan region.
 * Mengembalikan 0 jika region tidak dikenal atau skor di bawah star1.
 */
export function calculateStars(region: string, score: number): 0 | 1 | 2 | 3 {
  const threshold = STAR_THRESHOLDS[region];
  if (!threshold) return 0;

  if (score >= threshold.star3) return 3;
  if (score >= threshold.star2) return 2;
  if (score >= threshold.star1) return 1;
  return 0;
}
