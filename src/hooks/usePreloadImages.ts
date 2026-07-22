import { useEffect } from 'react';

export function usePreloadImages(imageUrls: string[]) {
  useEffect(() => {
    const preloadedImages: HTMLImageElement[] = [];
    imageUrls.forEach(url => {
      const img = new Image();
      img.src = url;
      preloadedImages.push(img);
    });
  }, []);
}
