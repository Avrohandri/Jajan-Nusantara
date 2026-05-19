import { useEffect } from 'react';

/**
 * Custom hook untuk memuat (preload) gambar-gambar animasi di background
 * sehingga ketika ditampilkan oleh React, gambar sudah ada di cache browser
 * dan tidak menyebabkan kedipan/flicker (terutama pada minigame yang perubahannya cepat).
 */
export function usePreloadImages(imageUrls: string[]) {
  useEffect(() => {
    // Jalankan preloading saat komponen pertama kali dirender
    const preloadedImages: HTMLImageElement[] = [];
    imageUrls.forEach(url => {
      const img = new Image();
      img.src = url;
      preloadedImages.push(img);
    });
  }, []); // Kosong agar hanya dipanggil sekali saat mount
}
