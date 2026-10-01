import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const SVG_PATH = path.resolve(process.cwd(), 'public/assets/digital_medic_logo.svg');
const PUBLIC_DIR = path.resolve(process.cwd(), 'public');

async function generate() {
  if (!fs.existsSync(SVG_PATH)) {
    console.error('SVG not found at:', SVG_PATH);
    process.exit(1);
  }

  const svgBuffer = fs.readFileSync(SVG_PATH);

  // 1. 192x192 PNG (standard PWA icon)
  await sharp(svgBuffer)
    .resize(192, 192, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(PUBLIC_DIR, 'pwa-192x192.png'));
  console.log('✓ Generated pwa-192x192.png');

  // 2. 512x512 PNG (high-res standard PWA icon)
  await sharp(svgBuffer)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(PUBLIC_DIR, 'pwa-512x512.png'));
  console.log('✓ Generated pwa-512x512.png');

  // 3. Apple Touch Icon 180x180 with clean white/medical background
  await sharp(svgBuffer)
    .resize(150, 150, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .extend({
      top: 15,
      bottom: 15,
      left: 15,
      right: 15,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .png()
    .toFile(path.join(PUBLIC_DIR, 'apple-touch-icon.png'));
  console.log('✓ Generated apple-touch-icon.png');

  // 4. 512x512 Maskable Icon with 15% safe padding and branded white container with soft border
  await sharp(svgBuffer)
    .resize(410, 410, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .extend({
      top: 51,
      bottom: 51,
      left: 51,
      right: 51,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .png()
    .toFile(path.join(PUBLIC_DIR, 'pwa-maskable-512x512.png'));
  console.log('✓ Generated pwa-maskable-512x512.png');

  // 5. Small favicons
  await sharp(svgBuffer)
    .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(PUBLIC_DIR, 'favicon-32x32.png'));

  await sharp(svgBuffer)
    .resize(16, 16, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(PUBLIC_DIR, 'favicon-16x16.png'));

  // 6. Generic icon.png
  await sharp(svgBuffer)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(PUBLIC_DIR, 'icon.png'));

  console.log('All PWA icons generated successfully!');
}

generate().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
