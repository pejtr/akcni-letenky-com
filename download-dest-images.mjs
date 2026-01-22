import fs from 'fs';
import https from 'https';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Destination image URLs from original website
const images = [
  { name: 'dest-dubai.webp', url: 'https://www.akcni-letenky.com/wp-content/uploads/2024/01/dubaj-150x150.webp' },
  { name: 'dest-thailand.webp', url: 'https://www.akcni-letenky.com/wp-content/uploads/2024/01/thajsko-150x150.webp' },
  { name: 'dest-santorini.webp', url: 'https://www.akcni-letenky.com/wp-content/uploads/2024/01/santorini-150x150.webp' },
  { name: 'dest-jordan.webp', url: 'https://www.akcni-letenky.com/wp-content/uploads/2024/01/jordansko-150x150.webp' },
];

const downloadImage = (url, filename) => {
  return new Promise((resolve, reject) => {
    const filepath = join(__dirname, 'client', 'public', filename);
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✓ Downloaded: ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      console.error(`✗ Error downloading ${filename}:`, err.message);
      reject(err);
    });
  });
};

async function downloadAll() {
  console.log('Downloading destination images...\n');
  
  for (const img of images) {
    try {
      await downloadImage(img.url, img.name);
    } catch (error) {
      console.error(`Failed to download ${img.name}`);
    }
  }
  
  console.log('\n✅ Download complete!');
}

downloadAll();
