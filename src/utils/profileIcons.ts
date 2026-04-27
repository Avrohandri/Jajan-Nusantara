export interface ProfileIconData {
  name: string;
  imagePath: string;
  bgClass: string;
}

export const PROFILE_ICONS: ProfileIconData[] = [
  // Jogja
  { name: 'Klepon',     imagePath: '/assets/foods_jogja/00_Klepon.png', bgClass: 'bg-jogja' },
  { name: 'Cenil',      imagePath: '/assets/foods_jogja/01_Cenil.png', bgClass: 'bg-jogja' },
  { name: 'Yangko',     imagePath: '/assets/foods_jogja/02_Yangko.png', bgClass: 'bg-jogja' },
  { name: 'Geplak',     imagePath: '/assets/foods_jogja/03_Geplak.png', bgClass: 'bg-jogja' },
  { name: 'Bakpia',     imagePath: '/assets/foods_jogja/04_Bakpia.png', bgClass: 'bg-jogja' },
  { name: 'Lemper',     imagePath: '/assets/foods_jogja/05_Lemper.png', bgClass: 'bg-jogja' },
  { name: 'Tiwul Ayu',  imagePath: '/assets/foods_jogja/06_TiwulAyu.png', bgClass: 'bg-jogja' },
  { name: 'Jadah Tempe',imagePath: '/assets/foods_jogja/07_JadahTempe.png', bgClass: 'bg-jogja' },
  // Bali
  { name: 'Laklak',      imagePath: '/assets/foods_bali/00_laklak.png', bgClass: 'bg-bali' },
  { name: 'Kaliadrem',   imagePath: '/assets/foods_bali/01_kaliadrem.png', bgClass: 'bg-bali' },
  { name: 'Pie Susu',    imagePath: '/assets/foods_bali/02_pie susu.png', bgClass: 'bg-bali' },
  { name: 'Jaje Walik',  imagePath: '/assets/foods_bali/03_jaje walik.png', bgClass: 'bg-bali' },
  { name: 'Bendu',       imagePath: '/assets/foods_bali/04_bendu.png', bgClass: 'bg-bali' },
  { name: 'Jaje Uli',    imagePath: '/assets/foods_bali/05_jaje uli.png', bgClass: 'bg-bali' },
  { name: 'Pisang Rai',  imagePath: '/assets/foods_bali/06_pisang rai.png', bgClass: 'bg-bali' },
  // Aceh
  { name: 'Samaloyang',  imagePath: '/assets/foods_aceh/00_samaloyang.png', bgClass: 'bg-aceh' },
  { name: 'Timphan',     imagePath: '/assets/foods_aceh/01_timphan.png', bgClass: 'bg-aceh' },
  { name: 'Pulot Ijo',   imagePath: '/assets/foods_aceh/02_pulot ijo.png', bgClass: 'bg-aceh' },
  { name: 'Keukarah',    imagePath: '/assets/foods_aceh/03_keukarah.png', bgClass: 'bg-aceh' },
  { name: 'Bungong Kayee', imagePath: '/assets/foods_aceh/04_bungong kayee.png', bgClass: 'bg-aceh' },
  { name: 'Meuseukat',   imagePath: '/assets/foods_aceh/05_meuseukat.png', bgClass: 'bg-aceh' },
  { name: 'Kue Adee',    imagePath: '/assets/foods_aceh/06_kue adee.png', bgClass: 'bg-aceh' },
  // Maluku
  { name: 'Koyabu',      imagePath: '/assets/foods_maluku/00_koyabu.png', bgClass: 'bg-maluku' },
  { name: 'Sagu Lempeng',imagePath: '/assets/foods_maluku/01_sagu lempeng.png', bgClass: 'bg-maluku' },
  { name: 'Sagu Gula',   imagePath: '/assets/foods_maluku/02_sagu gula.png', bgClass: 'bg-maluku' },
  { name: 'Talam Sagu Bakar', imagePath: '/assets/foods_maluku/03_talam sagu bakar.png', bgClass: 'bg-maluku' },
  { name: 'Asida',       imagePath: '/assets/foods_maluku/04_asida.png', bgClass: 'bg-maluku' },
  { name: 'Kue Bagea',   imagePath: '/assets/foods_maluku/05_kue bagea.png', bgClass: 'bg-maluku' },
  { name: 'Pisang Asar', imagePath: '/assets/foods_maluku/06_pisang asar.png', bgClass: 'bg-maluku' },
];

export function getProfileIconData(name: string): ProfileIconData {
  return PROFILE_ICONS.find(i => i.name === name) || PROFILE_ICONS[0];
}
