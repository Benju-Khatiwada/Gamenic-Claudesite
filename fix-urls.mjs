import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATIC = path.join(__dirname, 'static');
const BASE = 'https://gamenic-virtual-studio.com';

// Download a file
function download(url, dest) {
  return new Promise((resolve) => {
    const dir = path.dirname(dest);
    fs.mkdirSync(dir, { recursive: true });
    if (fs.existsSync(dest)) return resolve(true);

    const file = fs.createWriteStream(dest);
    const proto = url.startsWith('https') ? https : http;
    proto.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        fs.unlinkSync(dest);
        return download(res.headers.location, dest).then(resolve);
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(true); });
    }).on('error', () => { fs.unlink(dest, () => {}); resolve(false); });
  });
}

// Convert absolute URL to local relative path
function urlToLocalPath(url, fromFile) {
  try {
    const u = new URL(url);
    if (!u.hostname.includes('gamenic-virtual-studio.com')) return null;
    const localPath = path.join(STATIC, u.pathname);
    const relPath = path.relative(path.dirname(fromFile), localPath).replace(/\\/g, '/');
    return { localPath, relPath };
  } catch {
    return null;
  }
}

// Find all HTML files
const htmlFiles = fs.readdirSync(STATIC)
  .filter(f => f.endsWith('.html'))
  .map(f => path.join(STATIC, f));

const urlRegex = /https?:\/\/gamenic-virtual-studio\.com([^\s"'<>)]+)/g;
const downloads = new Map();

console.log(`Processing ${htmlFiles.length} HTML files...`);

// Pass 1: collect all external URLs that need downloading
for (const file of htmlFiles) {
  let html = fs.readFileSync(file, 'utf8');
  const matches = [...html.matchAll(urlRegex)];
  for (const m of matches) {
    const url = m[0];
    const parsed = urlToLocalPath(url, file);
    if (!parsed) continue;
    const ext = path.extname(parsed.localPath).toLowerCase();
    // Only download actual assets (not page links)
    if (['.png','.jpg','.jpeg','.gif','.svg','.webp','.ico','.woff','.woff2','.ttf','.eot','.mp4','.webm','.pdf'].includes(ext)) {
      downloads.set(url, parsed.localPath);
    }
  }
}

console.log(`Found ${downloads.size} external assets to download...`);

// Download missing assets
let downloaded = 0, skipped = 0;
for (const [url, dest] of downloads) {
  if (!fs.existsSync(dest)) {
    const ok = await download(url, dest);
    if (ok) downloaded++;
  } else {
    skipped++;
  }
}
console.log(`Downloaded: ${downloaded}, Already existed: ${skipped}`);

// Pass 2: replace URLs in HTML files
console.log('Replacing URLs in HTML files...');
let filesFixed = 0;

for (const file of htmlFiles) {
  let html = fs.readFileSync(file, 'utf8');
  let changed = false;

  html = html.replace(urlRegex, (match) => {
    const parsed = urlToLocalPath(match, file);
    if (!parsed) return match;
    const ext = path.extname(parsed.localPath).toLowerCase();
    // Replace asset URLs with relative paths
    if (['.png','.jpg','.jpeg','.gif','.svg','.webp','.ico','.woff','.woff2','.ttf','.eot','.mp4','.webm','.pdf'].includes(ext)) {
      if (fs.existsSync(parsed.localPath)) {
        changed = true;
        return parsed.relPath;
      }
    }
    return match;
  });

  if (changed) {
    fs.writeFileSync(file, html);
    filesFixed++;
  }
}

console.log(`Fixed ${filesFixed} HTML files.`);
console.log('Done!');
