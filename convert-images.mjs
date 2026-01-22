import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, 'client', 'public');

async function convertPngToWebp() {
  const files = fs.readdirSync(publicDir);
  const pngFiles = files.filter(f => f.startsWith('dest-') && f.endsWith('.png'));
  
  console.log(`Found ${pngFiles.length} PNG files to convert...\n`);
  
  for (const file of pngFiles) {
    const inputPath = path.join(publicDir, file);
    const outputPath = path.join(publicDir, file.replace('.png', '.webp'));
    
    try {
      await sharp(inputPath)
        .webp({ quality: 80 })
        .toFile(outputPath);
      console.log(`✓ Converted: ${file} → ${path.basename(outputPath)}`);
    } catch (error) {
      console.error(`✗ Failed to convert ${file}:`, error.message);
    }
  }
  
  console.log('\n✅ Conversion complete!');
}

convertPngToWebp();
