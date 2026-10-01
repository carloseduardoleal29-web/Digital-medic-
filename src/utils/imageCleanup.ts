/**
 * Medical Stamp & Signature Image Processor
 * Removes dark backgrounds, gray shadows from camera photos, and extracts crisp transparent ink.
 */
export function removeDarkBackgroundAndEnhanceInk(
  dataUrl: string,
  threshold: number = 210, // Brightness threshold above which pixels become 100% transparent
  inkBoost: boolean = true
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Process each pixel
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a === 0) continue;

        // Calculate luminosity / brightness
        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

        if (brightness > threshold) {
          // It's paper background or light shadow -> make completely transparent
          data[i + 3] = 0;
        } else {
          // It's ink! Calculate opacity based on ink darkness
          const inkDensity = (threshold - brightness) / threshold;
          data[i + 3] = Math.min(255, Math.round(a * (0.4 + inkDensity * 0.6)));

          if (inkBoost) {
            // Enhance ink sharpness and color richness
            // If it's blueish ink
            if (b > r + 10 && b > g + 10) {
              data[i] = Math.max(0, r - 30);
              data[i + 1] = Math.max(0, g - 20);
              data[i + 2] = Math.min(235, b + 20);
            } else {
              // Darken black/navy ink
              data[i] = Math.max(0, Math.round(r * 0.7));
              data[i + 1] = Math.max(0, Math.round(g * 0.7));
              data[i + 2] = Math.max(0, Math.round(b * 0.7));
            }
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => {
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}
