import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATIC = path.join(__dirname, 'static');

const glbUrls = [
  "https://gamenic-virtual-studio.com/wp-content/uploads/2024/04/Paint-Stand.glb",
  "https://gamenic-virtual-studio.com/wp-content/uploads/2024/04/Bench2.glb",
  "https://gamenic-virtual-studio.com/wp-content/uploads/2024/04/Plant4.glb",
  "https://gamenic-virtual-studio.com/wp-content/uploads/2024/04/1.glb",
  "https://gamenic-virtual-studio.com/wp-content/uploads/2024/04/Neon-Board.glb",
  "https://gamenic-virtual-studio.com/wp-content/uploads/2024/04/Lamp5.glb",
  "https://gamenic-virtual-studio.com/wp-content/uploads/2024/04/Chair7.glb",
  "https://gamenic-virtual-studio.com/wp-content/uploads/2024/04/Chairr.glb",
  "https://gamenic-virtual-studio.com/wp-content/uploads/2024/04/Chair2.glb",
  "https://gamenic-virtual-studio.com/wp-content/uploads/2024/04/Chair4.glb",
  "https://gamenic-virtual-studio.com/wp-content/uploads/2024/04/Lamp2.glb",
  "https://gamenic-virtual-studio.com/wp-content/uploads/2024/04/Lamp.glb",
  "https://gamenic-virtual-studio.com/wp-content/uploads/2024/04/Chair8.glb",
  "https://gamenic-virtual-studio.com/wp-content/uploads/2024/04/Plant2.glb",
  "https://gamenic-virtual-studio.com/wp-content/uploads/2024/04/Plant3.glb",
  "https://gamenic-virtual-studio.com/wp-content/uploads/2024/04/Plant.glb",
  "https://gamenic-virtual-studio.com/wp-content/uploads/2024/04/Round-Table.glb",
  "https://gamenic-virtual-studio.com/wp-content/uploads/2024/04/Plate.glb",
  "https://gamenic-virtual-studio.com/wp-content/uploads/2023/06/chair.glb",
  "https://gamenic-virtual-studio.com/wp-content/uploads/2024/04/AshTray.glb",
  "https://gamenic-virtual-studio.com/wp-content/uploads/2024/04/Shelf2.glb",
  "https://gamenic-virtual-studio.com/wp-content/uploads/2024/04/Shelf3.glb",
  "https://gamenic-virtual-studio.com/wp-content/uploads/2024/04/Shelf4.glb",
  "https://gamenic-virtual-studio.com/wp-content/uploads/2024/04/Shelf5.glb",
  "https://gamenic-virtual-studio.com/wp-content/uploads/2024/04/Shelff.glb",
  "https://gamenic-virtual-studio.com/wp-content/uploads/2024/04/Shheellff.glb",
  "https://gamenic-virtual-studio.com/wp-content/uploads/2024/04/Shelf.glb",
  "https://gamenic-virtual-studio.com/wp-content/uploads/2023/07/sofa2.glb",
  "https://gamenic-virtual-studio.com/wp-content/uploads/2024/04/Stand-Lamp.glb",
  "https://gamenic-virtual-studio.com/wp-content/uploads/2024/04/room_table.glb",
  "https://gamenic-virtual-studio.com/wp-content/uploads/2024/04/Table.glb",
  "https://gamenic-virtual-studio.com/wp-content/uploads/2024/04/Table3.glb",
  "https://gamenic-virtual-studio.com/wp-content/uploads/2024/04/Table4.glb",
  "https://gamenic-virtual-studio.com/wp-content/uploads/2024/04/Table6.glb",
  "https://gamenic-virtual-studio.com/wp-content/uploads/2024/04/Table8.glb",
  "https://gamenic-virtual-studio.com/wp-content/uploads/2024/04/Table5.glb",
  "https://gamenic-virtual-studio.com/wp-content/uploads/2023/06/SM_Sideboard-Jeremy4.glb",
  "https://gamenic-virtual-studio.com/wp-content/uploads/2024/04/tv.glb",
];

function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    // Strip the leading slash from pathname to get relative path
    const relPath = urlObj.pathname.slice(1); // e.g. wp-content/uploads/2024/04/Chairr.glb
    const localPath = path.join(STATIC, relPath);

    // Create directories if needed
    fs.mkdirSync(path.dirname(localPath), { recursive: true });

    // Skip if already downloaded
    if (fs.existsSync(localPath)) {
      console.log(`  SKIP (exists): ${relPath}`);
      resolve();
      return;
    }

    const file = fs.createWriteStream(localPath);

    const req = https.get(url, { timeout: 30000 }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(localPath);
        downloadFile(res.headers.location).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(localPath);
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        const size = fs.statSync(localPath).size;
        console.log(`  OK: ${relPath} (${(size/1024/1024).toFixed(1)} MB)`);
        resolve();
      });
    });

    req.on('error', (err) => {
      file.close();
      if (fs.existsSync(localPath)) fs.unlinkSync(localPath);
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Timeout for ${url}`));
    });
  });
}

console.log(`Downloading ${glbUrls.length} GLB files...\n`);
let ok = 0, failed = 0;

for (const url of glbUrls) {
  try {
    await downloadFile(url);
    ok++;
  } catch (err) {
    console.error(`  FAIL: ${url}\n    ${err.message}`);
    failed++;
  }
}

console.log(`\nDone. ${ok} ok, ${failed} failed.`);
