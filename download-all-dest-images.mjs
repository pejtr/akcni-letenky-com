import fs from 'fs';
import https from 'https';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// All destination image URLs from original website (150x150 thumbnails)
const images = [
  { name: 'dest-london.webp', url: 'https://www.akcni-letenky.com/wp-content/uploads/2024/01/londyn-150x150.webp' },
  { name: 'dest-newyork.webp', url: 'https://www.akcni-letenky.com/wp-content/uploads/2024/01/new-york-150x150.webp' },
  { name: 'dest-africa.webp', url: 'https://www.akcni-letenky.com/wp-content/uploads/2024/01/afrika-150x150.webp' },
  { name: 'dest-maroko.webp', url: 'https://www.akcni-letenky.com/wp-content/uploads/2024/01/maroko-150x150.webp' },
  { name: 'dest-paris.webp', url: 'https://www.akcni-letenky.com/wp-content/uploads/2024/01/pariz-150x150.webp' },
  { name: 'dest-vietnam.webp', url: 'https://www.akcni-letenky.com/wp-content/uploads/2024/01/vietnam-150x150.webp' },
  { name: 'dest-bali.webp', url: 'https://www.akcni-letenky.com/wp-content/uploads/2024/01/bali-150x150.webp' },
  { name: 'dest-srilanka.webp', url: 'https://www.akcni-letenky.com/wp-content/uploads/2024/01/sri-lanka-150x150.webp' },
  { name: 'dest-dubai.webp', url: 'https://www.akcni-letenky.com/wp-content/uploads/2024/01/dubaj-150x150.webp' },
  { name: 'dest-thailand.webp', url: 'https://www.akcni-letenky.com/wp-content/uploads/2024/01/thajsko-150x150.webp' },
  { name: 'dest-santorini.webp', url: 'https://www.akcni-letenky.com/wp-content/uploads/2024/01/santorini-150x150.webp' },
  { name: 'dest-jordan.webp', url: 'https://www.akcni-letenky.com/wp-content/uploads/2024/01/jordansko-150x150.webp' },
  { name: 'dest-rome.webp', url: 'https://www.akcni-letenky.com/wp-content/uploads/2024/01/rim-150x150.webp' },
  { name: 'dest-iceland.webp', url: 'https://www.akcni-letenky.com/wp-content/uploads/2024/01/island-150x150.webp' },
  { name: 'dest-miami.webp', url: 'https://www.akcni-letenky.com/wp-content/uploads/2024/01/miami-150x150.webp' },
  { name: 'dest-barcelona.webp', url: 'https://www.akcni-letenky.com/wp-content/uploads/2024/01/barcelona-150x150.webp' },
];

const downloadImage = (url, filename) => {
  return new Promise((resolve, reject) => {
    const filepath = join(__dirname, 'client', 'public', filename);
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✓ Downloaded: ${filename}`);
          resolve();
        });
      } else {
        fs.unlink(filepath, () => {});
        console.error(`✗ HTTP ${response.statusCode} for ${filename}`);
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      console.error(`✗ Error downloading ${filename}:`, err.message);
      reject(err);
    });
  });
};

async function downloadAll() {
  console.log('Downloading all destination images...\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const img of images) {
    try {
      await downloadImage(img.url, img.name);
      successCount++;
    } catch (error) {
      console.error(`Failed to download ${img.name}`);
      failCount++;
    }
  }
  
  console.log(`\n✅ Download complete! Success: ${successCount}, Failed: ${failCount}`);
}

downloadAll();
