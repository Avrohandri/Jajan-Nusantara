import { collection, setDoc, doc } from 'firebase/firestore';
import { getDb, isFirebaseConfigured } from './firebase/config';

import { fallbackQuizzes } from './datastore/fallbackQuizzes';


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


    console.log('📦 Mengunggah daftar Quizzes...');
    for (const quiz of fallbackQuizzes) {
      const { id, ...quizData } = quiz; 
      const docRef = doc(collection(db, 'quizzes'), id);
      await setDoc(docRef, quizData); 
    }
    console.log('✅ Quizzes berhasil diunggah.');


    console.log('🎉 SEMUA DATA BERHASIL DIUNGGAH KE FIRESTORE!');
    alert('Sukses! Semua data default berhasil diunggah ke Firestore.');

  } catch (error) {
    console.error('🔥 Wah, terjadi error saat mengunggah:', error);
    alert('Gagal mengunggah data. Periksa console log (F12) untuk detailnya.');
  }
}
