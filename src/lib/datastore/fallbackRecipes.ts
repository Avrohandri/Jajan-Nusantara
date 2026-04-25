import type { RecipeData } from '../../types';

export const fallbackRecipes: RecipeData[] = [
  {
    snackName: 'Klepon',
    steps: [
      { stepNumber: 1, instruction: 'Campurkan tepung ketan dengan air daun pandan', emoji: '🌿' },
      { stepNumber: 2, instruction: 'Ambil adonan, isi dengan gula merah', emoji: '🟤' },
      { stepNumber: 3, instruction: 'Bulatkan adonan dengan tangan', emoji: '🟢' },
      { stepNumber: 4, instruction: 'Kukus hingga matang dan mengapung', emoji: '♨️' },
      { stepNumber: 5, instruction: 'Gulingkan di kelapa parut segar', emoji: '🥥' },
    ],
  },
  {
    snackName: 'Kue Putu',
    steps: [
      { stepNumber: 1, instruction: 'Siapkan tepung beras dan gula merah', emoji: '🌾' },
      { stepNumber: 2, instruction: 'Masukkan tepung ke dalam cetakan bambu', emoji: '🎋' },
      { stepNumber: 3, instruction: 'Tambahkan gula merah di tengah', emoji: '🟤' },
      { stepNumber: 4, instruction: 'Kukus di atas api hingga matang', emoji: '💨' },
      { stepNumber: 5, instruction: 'Sajikan dengan kelapa parut', emoji: '🥥' },
    ],
  },
  {
    snackName: 'Onde-onde',
    steps: [
      { stepNumber: 1, instruction: 'Campurkan tepung ketan dengan air', emoji: '🌊' },
      { stepNumber: 2, instruction: 'Isi adonan dengan pasta kacang hijau', emoji: '🫘' },
      { stepNumber: 3, instruction: 'Bulatkan dan gulingkan di biji wijen', emoji: '⚪' },
      { stepNumber: 4, instruction: 'Goreng dalam minyak panas hingga mengembang', emoji: '🍳' },
      { stepNumber: 5, instruction: 'Angkat dan tiriskan', emoji: '✨' },
    ],
  },
  {
    snackName: 'Lemper',
    steps: [
      { stepNumber: 1, instruction: 'Masak beras ketan dengan santan', emoji: '🍚' },
      { stepNumber: 2, instruction: 'Siapkan isian ayam suwir berbumbu', emoji: '🍗' },
      { stepNumber: 3, instruction: 'Ambil ketan, pipihkan dan isi ayam', emoji: '🤲' },
      { stepNumber: 4, instruction: 'Gulung ketan menjadi bentuk silinder', emoji: '🌯' },
      { stepNumber: 5, instruction: 'Bungkus rapi dengan daun pisang', emoji: '🍃' },
    ],
  },
  {
    snackName: 'Serabi',
    steps: [
      { stepNumber: 1, instruction: 'Campurkan tepung beras dengan santan', emoji: '🥛' },
      { stepNumber: 2, instruction: 'Panaskan cetakan serabi di atas tungku', emoji: '🔥' },
      { stepNumber: 3, instruction: 'Tuang adonan ke cetakan panas', emoji: '🥞' },
      { stepNumber: 4, instruction: 'Tutup dan masak hingga matang', emoji: '⏳' },
      { stepNumber: 5, instruction: 'Siram dengan kuah santan gula merah', emoji: '🍯' },
    ],
  },
];
