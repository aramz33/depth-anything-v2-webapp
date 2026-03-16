const MAX_DIMENSION = 1280;
const JPEG_QUALITY = 0.88;

/**
 * Resizes an image (given as a data URL) so that neither dimension exceeds
 * MAX_DIMENSION. Returns a new JPEG data URL. If the image is already within
 * bounds, the original data URL is returned unchanged.
 */
export function resizeImage(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img;

      if (w <= MAX_DIMENSION && h <= MAX_DIMENSION) {
        resolve(dataUrl);
        return;
      }

      const scale = Math.min(MAX_DIMENSION / w, MAX_DIMENSION / h);
      const targetW = Math.round(w * scale);
      const targetH = Math.round(h * scale);

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas 2D context"));
        return;
      }

      ctx.drawImage(img, 0, 0, targetW, targetH);
      resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
    };
    img.onerror = () => reject(new Error("Failed to load image for resizing"));
    img.src = dataUrl;
  });
}
