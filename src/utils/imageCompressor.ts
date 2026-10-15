/**
 * Utilidad de Compresión de Imágenes de Firma, Sello y Logo Médico
 * Redimensiona y comprime imágenes Base64 automáticamente mediante <canvas>
 * a máximo 300x300 píxeles para que pesen menos de 50 KB y Firestore
 * las guarde al instante sin superar el límite de 1MB.
 */

export function compressImageBase64(dataUrl: string, maxDim = 300, quality = 0.8): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image')) {
      resolve(dataUrl || '');
      return;
    }

    // Si ya es un SVG o pesa menos de 40KB, no requiere compresión adicional
    if (dataUrl.startsWith('data:image/svg+xml') || dataUrl.length < 40000) {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const isPng = dataUrl.startsWith('data:image/png');
      let compressed = isPng ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', quality);

      // Si aún supera los 60KB, re-intentar compresión JPEG
      if (compressed.length > 60000) {
        compressed = canvas.toDataURL('image/jpeg', 0.7);
      }

      resolve(compressed);
    };

    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Comprime de forma asíncrona todos los campos de imagen de un objeto DoctorConfig.
 */
export async function compressDoctorConfigImages(config: any): Promise<any> {
  if (!config || typeof config !== 'object') return config;
  const result = { ...config };

  const fields = ['logoImg', 'logoDer', 'marcaAgua', 'selloImg', 'firmaImg', 'selloFirma'];
  for (const field of fields) {
    if (result[field] && typeof result[field] === 'string' && result[field].length > 40000) {
      try {
        result[field] = await compressImageBase64(result[field], 300, 0.8);
      } catch (err) {
        console.warn(`Error comprimiendo campo ${field}:`, err);
      }
    }
  }

  return result;
}
