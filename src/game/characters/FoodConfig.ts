export interface FoodItem {
  tier: number;           // 0-7
  name: string;           // "00_Klepon", dst
  textureKey: string;     // sama dengan name
  color: number;          // particle color
  colliderType: 'circle' | 'polygon' | 'fromVertices' | 'rectangle';
  colliderOptions: {
    radius?: number;       // untuk circle
    sides?: number;        // untuk polygon
    polyRadius?: number;   // untuk polygon
    vertices?: { x: number, y: number }[]; // untuk fromVertices
    width?: number;        // untuk rectangle
    height?: number;       // untuk rectangle
    angle?: number;        // rotasi body (radians)
    chamferRadius?: number; // untuk membuat rectangle menjadi kapsul (lonjong)
  };
  displaySize: { width: number; height: number };
  mergeScore: number;     // poin saat merge (tier+1 * 10)
  nextTier: number | null;
}

export const JOGJA_FOOD_CONFIG: FoodItem[] = [
  {
    tier: 0, name: "00_Klepon", textureKey: "00_Klepon", color: 0x7CAD58,
    colliderType: "circle", colliderOptions: { radius: 22 }, displaySize: { width: 44, height: 44 },
    mergeScore: 10, nextTier: 1
  },
  {
    tier: 1, name: "01_Cenil", textureKey: "01_Cenil", color: 0xE74C3C,
    colliderType: "circle", colliderOptions: { radius: 28 }, displaySize: { width: 56, height: 56 },
    mergeScore: 20, nextTier: 2
  },
  {
    tier: 2, name: "02_Yangko", textureKey: "02_Yangko", color: 0xFFF8DC,
    colliderType: "rectangle", colliderOptions: { width: 56, height: 47, angle: -0.45 },
    displaySize: { width: 64, height: 64 }, mergeScore: 30, nextTier: 3
  },
  {
    tier: 3, name: "03_Geplak", textureKey: "03_Geplak", color: 0xFFD700,
    colliderType: "circle", colliderOptions: { radius: 32 }, displaySize: { width: 72, height: 72 },
    mergeScore: 40, nextTier: 4
  },
  {
    tier: 4, name: "04_Bakpia", textureKey: "04_Bakpia", color: 0xD4A373,
    colliderType: "circle", colliderOptions: { radius: 42 }, displaySize: { width: 84, height: 94 },
    mergeScore: 50, nextTier: 5
  },
  {
    tier: 5, name: "05_Lemper", textureKey: "05_Lemper", color: 0x2E8B57,
    colliderType: "circle", colliderOptions: { radius: 50 }, displaySize: { width: 120, height: 120 },
    mergeScore: 60, nextTier: 6
  },
  {
    tier: 6, name: "06_TiwulAyu", textureKey: "06_TiwulAyu", color: 0x8B4513,
    colliderType: "circle", colliderOptions: { radius: 46 }, displaySize: { width: 104, height: 104 },
    mergeScore: 70, nextTier: 7
  },
  {
    tier: 7, name: "07_JadahTempe", textureKey: "07_JadahTempe", color: 0xA0522D,
    colliderType: "polygon", colliderOptions: { sides: 8, polyRadius: 60 }, displaySize: { width: 140, height: 160 },
    mergeScore: 80, nextTier: null
  }
];

export const BALI_FOOD_CONFIG: FoodItem[] = [
  {
    tier: 0, name: "Laklak", textureKey: "00_laklak", color: 0x6DAA2C,
    colliderType: "circle", colliderOptions: { radius: 22 }, displaySize: { width: 44, height: 44 },
    mergeScore: 10, nextTier: 1
  },
  {
    tier: 1, name: "Kaliadrem", textureKey: "01_kaliadrem", color: 0xA35D20,
    colliderType: "fromVertices", colliderOptions: { vertices: [{ x: 0, y: -28 }, { x: 32, y: 24 }, { x: -31, y: 24 }] }, displaySize: { width: 62, height: 56 },
    mergeScore: 20, nextTier: 2
  },
  {
    tier: 2, name: "Pie Susu", textureKey: "02_pie susu", color: 0xFFC72C,
    colliderType: "circle", colliderOptions: { radius: 33 }, displaySize: { width: 72, height: 72 },
    mergeScore: 30, nextTier: 3
  },
  {
    tier: 3, name: "Jaje Walik", textureKey: "03_jaje walik", color: 0xB57B3F,
    colliderType: "fromVertices", colliderOptions: { vertices: [{ x: 0, y: -44 }, { x: 46, y: 0 }, { x: 0, y: 44 }, { x: -46, y: 0 }] }, displaySize: { width: 84, height: 84 },
    mergeScore: 40, nextTier: 4
  },
  {
    tier: 4, name: "Bendu", textureKey: "04_bendu", color: 0xE8A0CE,
    colliderType: "rectangle", colliderOptions: { width: 60, height: 100, chamferRadius: 27 }, displaySize: { width: 90, height: 105 },
    mergeScore: 50, nextTier: 5
  },
  {
    tier: 5, name: "Jaje Uli", textureKey: "05_jaje uli", color: 0x932026,
    colliderType: "circle", colliderOptions: { radius: 48 }, displaySize: { width: 105, height: 121 },
    mergeScore: 60, nextTier: 6
  },
  {
    tier: 6, name: "Pisang Rai", textureKey: "06_pisang rai", color: 0xDBC36D,
    colliderType: "fromVertices", colliderOptions: {
      vertices: [
        { x: -10, y: -65 },    // puncak atas
        { x: 40, y: -13 },   // tengah kanan
        { x: 65, y: 38 },    // pojok kanan bawah
        { x: 0, y: 40 },     // tengah bawah
        { x: -85, y: 38 },   // pojok kiri bawah
        { x: -55, y: -13 },  // tengah kiri
      ]
    }, displaySize: { width: 150, height: 120 },
    mergeScore: 80, nextTier: null
  }
];

export const REGION_FOOD_CONFIGS: Record<string, FoodItem[]> = {
  'jogja': JOGJA_FOOD_CONFIG,
  'bali': BALI_FOOD_CONFIG,
  // Other regions will fall back to jogja if not defined
};

// Fallback to jogja for backward compatibility where FOOD_CONFIG is still explicitly imported (will remove later if needed)
export const FOOD_CONFIG = JOGJA_FOOD_CONFIG;
