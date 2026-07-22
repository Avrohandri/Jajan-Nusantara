export interface StarThreshold {
  star1: number;
  star2: number;
  star3: number;
}

export const STAR_THRESHOLDS: Record<string, StarThreshold> = {
  jogja: {
    star1: 500,
    star2: 1500,
    star3: 2800,
  },

  bali: {
    star1: 600,
    star2: 1200,
    star3: 2100,
  },

  aceh: {
    star1: 600,
    star2: 1200,
    star3: 2100,
  },

  maluku: {
    star1: 600,
    star2: 1200,
    star3: 2100,
  },
};

export function calculateStars(region: string, score: number): 0 | 1 | 2 | 3 {
  const threshold = STAR_THRESHOLDS[region];
  if (!threshold) return 0;

  if (score >= threshold.star3) return 3;
  if (score >= threshold.star2) return 2;
  if (score >= threshold.star1) return 1;
  return 0;
}
