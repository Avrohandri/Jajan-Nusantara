import { collection, setDoc, doc } from 'firebase/firestore';
import { getDb, isFirebaseConfigured } from './firebase/config';
import { fallbackSnacks } from './datastore/fallbackSnacks';
import { fallbackQuizzes } from './datastore/fallbackQuizzes';
import { fallbackRecipes } from './datastore/fallbackRecipes';

export async function seedFirestore() {
  if (!isFirebaseConfigured()) {
    console.error('❌ Firebase belum dikonfigurasi. Pastikan .env sudah diisi!');
    alert('Firebase belum dikonfigurasi di .env');
    return;
  }

  const db = getDb();
  if (!db) return;

  try {
    console.log('🚀 Memulai proses upload data ke Firestore...');

    // 1. Upload Snacks
    console.log('📦 Mengunggah daftar Snacks...');
    for (const snack of fallbackSnacks) {
      // Menggunakan nama yang distandarisasi sebagai Document ID (contoh: 'tier_1')
      const docRef = doc(collection(db, 'snacks'), `tier_${snack.tier}`);
      await setDoc(docRef, snack);
    }
    console.log('✅ Snacks berhasil diunggah.');

    // 2. Upload Quizzes
    console.log('📦 Mengunggah daftar Quizzes...');
    for (const quiz of fallbackQuizzes) {
      // Menyimpan berdasarkan ID kuis (q1, q2, dst)
      const { id, ...quizData } = quiz; 
      const docRef = doc(collection(db, 'quizzes'), id);
      await setDoc(docRef, quiz); 
    }
    console.log('✅ Quizzes berhasil diunggah.');

    // 3. Upload Recipes
    console.log('📦 Mengunggah daftar Recipes...');
    for (const recipe of fallbackRecipes) {
      // Membersihkan nama untuk dijadikan Document ID (contoh: 'Klepon' -> 'klepon')
      const safeId = recipe.snackName.toLowerCase().replace(/\s+/g, '_');
      const docRef = doc(collection(db, 'recipes'), safeId);
      await setDoc(docRef, recipe);
    }
    console.log('✅ Recipes berhasil diunggah.');

    console.log('🎉 SEMUA DATA BERHASIL DIUNGGAH KE FIRESTORE!');
    alert('Sukses! Semua data default berhasil diunggah ke Firestore.');

  } catch (error) {
    console.error('🔥 Wah, terjadi error saat mengunggah:', error);
    alert('Gagal mengunggah data. Periksa console log (F12) untuk detailnya.');
  }
}
