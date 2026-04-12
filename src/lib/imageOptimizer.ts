export const compressImage = async (file: File, maxSizeKB: number = 50): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(img.src);
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      const maxDim = 1200;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas not supported'));

      ctx.drawImage(img, 0, 0, width, height);

      let quality = 0.9;
      const targetBytes = maxSizeKB * 1024;

      const attemptCompression = () => {
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('Compression failed'));

          if (blob.size > targetBytes && quality > 0.1) {
            quality -= 0.1;
            attemptCompression();
          } else {
            const fileName = file.name.replace(/\.[^/.]+$/, ".webp");
            const compressedFile = new File([blob], fileName, {
              type: 'image/webp',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          }
        }, 'image/webp', quality);
      };

      attemptCompression();
    };

    img.onerror = (err) => reject(err);
  });
};
