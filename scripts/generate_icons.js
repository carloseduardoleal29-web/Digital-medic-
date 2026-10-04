import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateIcons() {
  const svgBuffer = fs.readFileSync(path.resolve('./public/digital_medic_logo.svg'));

  const sizes = [
    { name: 'pwa-512x512.png', size: 512 },
    { name: 'pwa-192x192.png', size: 192 },
    { name: 'pwa-maskable-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'icon.png', size: 64 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-16x16.png', size: 16 },
  ];

  for (const item of sizes) {
    const outPathPublic = path.resolve('./public', item.name);
    const outPathDist = path.resolve('./dist', item.name);

    await sharp(svgBuffer)
      .resize(item.size, item.size)
      .png()
      .toFile(outPathPublic);

    if (fs.existsSync('./dist')) {
      await sharp(svgBuffer)
        .resize(item.size, item.size)
        .png()
        .toFile(outPathDist);
    }

    console.log(`✓ Generated ${item.name} (${item.size}x${item.size})`);
  }
}

generateIcons().catch(console.error);
