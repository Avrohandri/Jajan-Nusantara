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
  };
  displaySize: { width: number; height: number };
  mergeScore: number;     // poin saat merge (tier+1 * 10)
  nextTier: number | null;
}

export const FOOD_CONFIG: FoodItem[] = [
  {
    tier: 0,
    name: "00_Klepon",
    textureKey: "00_Klepon",
    color: 0x7CAD58, // Hijau
    colliderType: "circle",
    colliderOptions: { radius: 22 },
    displaySize: { width: 44, height: 44 },
    mergeScore: 10,
    nextTier: 1
  },
  {
    tier: 1,
    name: "01_Cenil",
    textureKey: "01_Cenil",
    color: 0xE74C3C, // Merah/Pink
    colliderType: "circle",
    colliderOptions: { radius: 28 },
    displaySize: { width: 56, height: 56 },
    mergeScore: 20,
    nextTier: 2
  },
  {
    tier: 2,
    name: "02_Yangko",
    textureKey: "02_Yangko",
    color: 0xFFF8DC, // Putih/Krem
    colliderType: "rectangle",
    colliderOptions: {
      width: 54,
      height: 45,
      angle: -0.45
    }, // Mode rectangle miring agar user mudah kustomisasi
    displaySize: { width: 64, height: 64 },
    mergeScore: 30,
    nextTier: 3
  },
  {
    tier: 3,
    name: "03_Geplak",
    textureKey: "03_Geplak",
    color: 0xFFD700, // Kuning kemerahan
    colliderType: "circle",
    colliderOptions: { radius: 32 },
    displaySize: { width: 72, height: 72 },
    mergeScore: 40,
    nextTier: 4
  },
  {
    tier: 4,
    name: "04_Bakpia",
    textureKey: "04_Bakpia",
    color: 0xD4A373, // Coklat muda/Krem
    colliderType: "circle",
    colliderOptions: { radius: 42 }, // Diperbesar lagi dari 41 ke 42
    displaySize: { width: 84, height: 84 },
    mergeScore: 50,
    nextTier: 5
  },
  {
    tier: 5,
    name: "05_Lemper",
    textureKey: "05_Lemper",
    color: 0x2E8B57, // Hijau tua (daun)
    colliderType: "circle",
    colliderOptions: { radius: 50 },
    displaySize: { width: 120, height: 120 },
    mergeScore: 60,
    nextTier: 6
  },
  {
    tier: 6,
    name: "06_TiwulAyu",
    textureKey: "06_TiwulAyu",
    color: 0x8B4513, // Coklat gelap
    colliderType: "circle",
    colliderOptions: { radius: 46 },
    displaySize: { width: 104, height: 104 },
    mergeScore: 70,
    nextTier: 7
  },
  {
    tier: 7,
    name: "07_JadahTempe",
    textureKey: "07_JadahTempe",
    color: 0xA0522D, // Coklat
    colliderType: "polygon",
    colliderOptions: { sides: 8, polyRadius: 60 },
    displaySize: { width: 120, height: 120 },
    mergeScore: 80,
    nextTier: null
  }
];
