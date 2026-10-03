#!/usr/bin/env node
/**
 * Replace the Comfy's UI screenshot (the full-size preview and the card thumbnail).
 *
 *   npm run comfy-image -- path/to/screenshot.png
 *
 * Any format sharp reads works (PNG, JPG, WebP…). Both outputs are 16:9 to match
 * the fixed dimensions in ComfyUi.tsx; a source with another aspect ratio is
 * centre-cropped to fit.
 */
import sharp from 'sharp';
import { statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const asset = (name) => fileURLToPath(new URL(`../src/assets/${name}`, import.meta.url));

const OUTPUTS = [
  { file: asset('comfy-ui-preview.webp'), width: 2000, height: 1125, quality: 82 },
  { file: asset('comfy-ui-thumb.webp'), width: 640, height: 360, quality: 80 },
];

const source = process.argv[2];
if (!source) {
  console.error('Usage: npm run comfy-image -- path/to/screenshot.png');
  process.exit(1);
}

const { width, height } = await sharp(source).metadata();
const ratio = width / height;
if (Math.abs(ratio - 16 / 9) > 0.01) {
  console.warn(`Note: source is ${width}x${height}, not 16:9. It will be centre-cropped.`);
}
if (width < 2000) {
  console.warn(`Note: source is only ${width}px wide, so the preview is upscaled to 2000px.`);
}

for (const out of OUTPUTS) {
  await sharp(source)
    .resize(out.width, out.height, { fit: 'cover', position: 'centre' })
    .webp({ quality: out.quality })
    .toFile(out.file);
  const kb = Math.round(statSync(out.file).size / 1024);
  console.log(`Wrote ${out.width}x${out.height} → ${out.file.split('/src/')[1]} (${kb} KB)`);
}

console.log("Remember to update the image's alt text in src/content/copy.ts if the scene changed.");
