import imageCompression from 'browser-image-compression';

/**
 * Compress an image file to under `maxSizeKB` using browser-image-compression.
 * Falls back to canvas-based compression if the library fails.
 */
export const compressImage = async (file: File, maxSizeKB: number = 50): Promise<File> => {
  try {
    const options = {
      maxSizeMB: maxSizeKB / 1024,           // Convert KB to MB
      maxWidthOrHeight: 1200,                  // Cap dimensions
      useWebWorker: true,
      fileType: 'image/webp',                  // Output WebP for best ratio
      initialQuality: 0.85,
      alwaysKeepResolution: false,
    };

    const compressed = await imageCompression(file, options);

    // If still over target, do a second pass with stricter settings
    if (compressed.size > maxSizeKB * 1024) {
      const secondPass = await imageCompression(compressed, {
        ...options,
        maxSizeMB: maxSizeKB / 1024,
        maxWidthOrHeight: 800,
        initialQuality: 0.6,
      });

      const fileName = file.name.replace(/\.[^/.]+$/, '.webp');
      return new File([secondPass], fileName, { type: 'image/webp', lastModified: Date.now() });
    }

    const fileName = file.name.replace(/\.[^/.]+$/, '.webp');
    return new File([compressed], fileName, { type: 'image/webp', lastModified: Date.now() });
  } catch (err) {
    console.warn('browser-image-compression failed, falling back to canvas:', err);
    return canvasCompress(file, maxSizeKB);
  }
};

/** Canvas-based fallback (original logic) */
function canvasCompress(file: File, maxSizeKB: number): Promise<File> {
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
            const fileName = file.name.replace(/\.[^/.]+$/, '.webp');
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
}
