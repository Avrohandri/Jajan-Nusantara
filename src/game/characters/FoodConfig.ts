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
    renderOrigin?: { x: number, y: number }; // untuk menyesuaikan offset visual vs center of mass (khususnya untuk fromVertices)
  };
  displaySize: { width: number; height: number };
  mergeScore: number;     // poin saat merge (tier+1 * 10)
  nextTier: number | null;
}

export const JOGJA_FOOD_CONFIG: FoodItem[] = [
  {
    tier: 0, name: "00_Klepon", textureKey: "00_Klepon", color: 0x7CAD58,
    colliderType: "circle", colliderOptions: { radius: 23 }, displaySize: { width: 44, height: 44 },
    mergeScore: 10, nextTier: 1
  },
  {
    tier: 1, name: "01_Cenil", textureKey: "01_Cenil", color: 0xE74C3C,
    colliderType: "circle", colliderOptions: { radius: 30 }, displaySize: { width: 60, height: 60 },
    mergeScore: 20, nextTier: 2
  },
  {
    tier: 2, name: "02_Yangko", textureKey: "02_Yangko", color: 0xFFF8DC,
    colliderType: "rectangle", colliderOptions: { width: 63, height: 54, angle: -0.45 },
    displaySize: { width: 69, height: 69 }, mergeScore: 30, nextTier: 3
  },
  {
    tier: 3, name: "03_Geplak", textureKey: "03_Geplak", color: 0xFFD700,
    colliderType: "circle", colliderOptions: { radius: 32, renderOrigin: { x: 0.51, y: 0.5 } }, displaySize: { width: 69, height: 69 },
    mergeScore: 40, nextTier: 4
  },
  {
    tier: 4, name: "04_Bakpia", textureKey: "04_Bakpia", color: 0xD4A373,
    colliderType: "circle", colliderOptions: { radius: 42 }, displaySize: { width: 82, height: 92 },
    mergeScore: 50, nextTier: 5
  },
  {
    tier: 5, name: "05_Lemper", textureKey: "05_Lemper", color: 0x2E8B57,
    colliderType: "circle", colliderOptions: { radius: 50 }, displaySize: { width: 120, height: 120 },
    mergeScore: 60, nextTier: 6
  },
  {
    tier: 6, name: "06_TiwulAyu", textureKey: "06_TiwulAyu", color: 0x8B4513,
    colliderType: "circle", colliderOptions: { radius: 53 }, displaySize: { width: 123, height: 123 },
    mergeScore: 70, nextTier: 7
  },
  {
    tier: 7, name: "07_JadahTempe", textureKey: "07_JadahTempe", color: 0xA0522D,
    colliderType: "polygon", colliderOptions: { sides: 8, polyRadius: 60 }, displaySize: { width: 135, height: 155 },
    mergeScore: 80, nextTier: null
  }
];

export const BALI_FOOD_CONFIG: FoodItem[] = [
  {
    tier: 0, name: "Laklak", textureKey: "00_laklak", color: 0x6DAA2C,
    colliderType: "circle", colliderOptions: { radius: 23 }, displaySize: { width: 47, height: 47 },
    mergeScore: 10, nextTier: 1
  },
  {
    tier: 1, name: "Kaliadrem", textureKey: "01_kaliadrem", color: 0xA35D20,
    colliderType: "fromVertices", colliderOptions: { vertices: [{ x: 0, y: -35 }, { x: 40, y: 30 }, { x: -40, y: 30 }], renderOrigin: { x: 0.52, y: 0.61 } }, displaySize: { width: 75, height: 70 },
    mergeScore: 20, nextTier: 2
  },
  {
    tier: 2, name: "Pie Susu", textureKey: "02_pie susu", color: 0xFFC72C,
    colliderType: "circle", colliderOptions: { radius: 37 }, displaySize: { width: 82, height: 82 },
    mergeScore: 30, nextTier: 3
  },
  {
    tier: 3, name: "Jaje Walik", textureKey: "03_jaje walik", color: 0xB57B3F,
    colliderType: "fromVertices", colliderOptions: { vertices: [{ x: 0, y: -50 }, { x: 52, y: 0 }, { x: 0, y: 50 }, { x: -52, y: 0 }] }, displaySize: { width: 92, height: 92 },
    mergeScore: 40, nextTier: 4
  },
  {
    tier: 4, name: "Bendu", textureKey: "04_bendu", color: 0xE8A0CE,
    colliderType: "rectangle", colliderOptions: { width: 62, height: 104, chamferRadius: 27 }, displaySize: { width: 94, height: 109 },
    mergeScore: 50, nextTier: 5
  },
  {
    tier: 5, name: "Jaje Uli", textureKey: "05_jaje uli", color: 0x932026,
    colliderType: "circle", colliderOptions: { radius: 49, renderOrigin: { x: 0.50, y: 0.52 } }, displaySize: { width: 103, height: 120 },
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

export const ACEH_FOOD_CONFIG: FoodItem[] = [
  {
    tier: 0, name: "Samaloyang", textureKey: "00_samaloyang", color: 0xFF8C00,
    colliderType: "circle", colliderOptions: { radius: 23 }, displaySize: { width: 47, height: 47 },
    mergeScore: 10, nextTier: 1
  },
  {
    tier: 1, name: "Timphan", textureKey: "01_timphan", color: 0x3CB371,
    colliderType: "fromVertices", colliderOptions: {
      vertices: [
        { x: 0, y: -24 },    // atas
        { x: 32, y: -12 },   // kanan atas
        { x: 32, y: 16 },    // kanan bawah
        { x: 0, y: 28 },     // bawah
        { x: -32, y: 16 },   // kiri bawah
        { x: -32, y: -12 },  // kiri atas
      ]
    }, displaySize: { width: 80, height: 80 },
    mergeScore: 20, nextTier: 2
  },
  {
    tier: 2, name: "Pulot Ijo", textureKey: "02_pulot ijo", color: 0x32CD32,
    colliderType: "rectangle", colliderOptions: { width: 42, height: 82, chamferRadius: 5 }, displaySize: { width: 98, height: 88 },
    mergeScore: 30, nextTier: 3
  },
  {
    tier: 3, name: "Keukarah", textureKey: "03_keukarah", color: 0x8B4513,
    colliderType: "fromVertices", colliderOptions: {
      vertices: [
        { x: -55, y: 0 },
        { x: -50, y: 23 },
        { x: -44, y: 43 },
        { x: -25, y: 56 },
        { x: 0, y: 62 },
        { x: 25, y: 56 },
        { x: 44, y: 43 },
        { x: 50, y: 23 },
        { x: 55, y: 0 },
      ],
      renderOrigin: { x: 0.5, y: 0.52 }
    }, displaySize: { width: 115, height: 115 },
    mergeScore: 40, nextTier: 4
  },
  {
    tier: 4, name: "Bungong Kayee", textureKey: "04_bungong kayee", color: 0xFFFACD,
    colliderType: "circle", colliderOptions: { radius: 48 }, displaySize: { width: 101, height: 111 },
    mergeScore: 50, nextTier: 5
  },
  {
    tier: 5, name: "Meuseukat", textureKey: "05_meuseukat", color: 0xFFD700,
    colliderType: "circle", colliderOptions: { radius: 52 }, displaySize: { width: 130, height: 130 },
    mergeScore: 60, nextTier: 6
  },
  {
    tier: 6, name: "Kue Adee", textureKey: "06_kue adee", color: 0xD2691E,
    colliderType: "circle", colliderOptions: { radius: 62 }, displaySize: { width: 149, height: 149 },
    mergeScore: 80, nextTier: null
  }
];

export const MALUKU_FOOD_CONFIG: FoodItem[] = [
  {
    tier: 0, name: "00_Koyabu", textureKey: "00_koyabu", color: 0xFFE4B5,
    colliderType: "fromVertices", colliderOptions: { vertices: [{ x: 0, y: -24 }, { x: 33, y: 26 }, { x: -31, y: 27 }] }, displaySize: { width: 60, height: 60 },
    mergeScore: 10, nextTier: 1
  },
  {
    tier: 1, name: "01_SaguLempeng", textureKey: "01_sagu lempeng", color: 0xD87093,
    colliderType: "rectangle", colliderOptions: { width: 36, height: 67, chamferRadius: 5 }, displaySize: { width: 74, height: 80 },
    mergeScore: 20, nextTier: 2
  },
  {
    tier: 2, name: "02_SaguGula", textureKey: "02_sagu gula", color: 0x8B4513,
    colliderType: "rectangle", colliderOptions: { width: 61, height: 61, chamferRadius: 8 }, displaySize: { width: 81, height: 81 },
    mergeScore: 30, nextTier: 3
  },
  {
    tier: 3, name: "03_TalamSaguBakar", textureKey: "03_talam sagu bakar", color: 0xD2B48C,
    colliderType: "fromVertices", colliderOptions: {
      vertices: [
        { x: -35, y: -37 },  // kiri atas
        { x: 40, y: -37 },   // kanan atas
        { x: 50, y: 37 },    // kanan bawah
        { x: -45, y: 37 },   // kiri bawah
      ],
      renderOrigin: { x: 0.5, y: 0.52 }
    }, displaySize: { width: 97, height: 110 },
    mergeScore: 40, nextTier: 4
  },
  {
    tier: 4, name: "04_Asida", textureKey: "04_asida", color: 0x8B0000,
    colliderType: "circle", colliderOptions: { radius: 44, renderOrigin: { x: 0.48, y: 0.5 } }, displaySize: { width: 107, height: 124 },
    mergeScore: 50, nextTier: 5
  },
  {
    tier: 5, name: "05_KueBagea", textureKey: "05_kue bagea", color: 0xDEB887,
    colliderType: "circle", colliderOptions: { radius: 50, renderOrigin: { x: 0.52, y: 0.5 } }, displaySize: { width: 120, height: 120 },
    mergeScore: 60, nextTier: 6
  },
  {
    tier: 6, name: "06_PisangAsar", textureKey: "06_pisang asar", color: 0xDAA520,
    colliderType: "rectangle", colliderOptions: { width: 148, height: 62, chamferRadius: 27, renderOrigin: { x: 0.5, y: 0.53 } }, displaySize: { width: 155, height: 155 },
    mergeScore: 80, nextTier: null
  }
];

export const REGION_FOOD_CONFIGS_RAW: Record<string, FoodItem[]> = {
  'jogja': JOGJA_FOOD_CONFIG,
  'bali': BALI_FOOD_CONFIG,
  'aceh': ACEH_FOOD_CONFIG,
  'maluku': MALUKU_FOOD_CONFIG,
};

/** Scale all numeric collider and display dimensions by `factor`. 
 *  renderOrigin and angle are ratios/radians — they are preserved as-is. */
function scaleFoodConfig(config: FoodItem[], factor: number): FoodItem[] {
  return config.map(item => {
    const opts = item.colliderOptions;
    return {
      ...item,
      displaySize: {
        width: Math.round(item.displaySize.width * factor),
        height: Math.round(item.displaySize.height * factor),
      },
      colliderOptions: {
        ...opts,
        ...(opts.radius !== undefined ? { radius: Math.round(opts.radius * factor) } : {}),
        ...(opts.width !== undefined ? { width: Math.round(opts.width * factor) } : {}),
        ...(opts.height !== undefined ? { height: Math.round(opts.height * factor) } : {}),
        ...(opts.chamferRadius !== undefined ? { chamferRadius: Math.round(opts.chamferRadius * factor) } : {}),
        ...(opts.polyRadius !== undefined ? { polyRadius: Math.round(opts.polyRadius * factor) } : {}),
        ...(opts.vertices !== undefined ? {
          vertices: opts.vertices.map(v => ({
            x: Math.round(v.x * factor * 10) / 10,
            y: Math.round(v.y * factor * 10) / 10,
          }))
        } : {}),
      },
    };
  });
}

const SCALE_FACTOR = 1.3;

export const REGION_FOOD_CONFIGS: Record<string, FoodItem[]> = Object.fromEntries(
  Object.entries(REGION_FOOD_CONFIGS_RAW).map(([key, cfg]) => [key, scaleFoodConfig(cfg, SCALE_FACTOR)])
);

// Fallback to jogja for backward compatibility where FOOD_CONFIG is still explicitly imported (will remove later if needed)
export const FOOD_CONFIG = REGION_FOOD_CONFIGS['jogja'];

