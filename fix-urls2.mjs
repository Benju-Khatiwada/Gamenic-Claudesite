import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATIC = path.join(__dirname, 'static');

// WordPress dynamic endpoints to remove entirely (they don't work on static hosting)
const WP_REMOVE_PATTERNS = [
  /<link[^>]+rel=["']https:\/\/api\.w\.org\/["'][^>]*>/gi,
  /<link[^>]+(wp-json|oembed)[^>]*>/gi,
  /<link[^>]+xmlrpc[^>]*>/gi,
  /<script[^>]*wp-emoji[^>]*>[\s\S]*?<\/script>/gi,
  /<script[^>]*emoji[^>]*>[\s\S]*?<\/script>/gi,
  /<!--\[if IE\]>[\s\S]*?<!\[endif\]-->/gi,
];

const ASSET_EXTS = new Set(['.png','.jpg','.jpeg','.gif','.svg','.webp','.ico','.woff','.woff2','.ttf','.eot','.mp4','.webm','.pdf','.json','.css','.js']);

function download(url, dest) {
  return new Promise((resolve) => {
    const dir = path.dirname(dest);
    fs.mkdirSync(dir, { recursive: true });
    if (fs.existsSync(dest)) return resolve(true);
    const file = fs.createWriteStream(dest);
    const proto = url.startsWith('https') ? https : http;
    proto.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close(); fs.unlink(dest, () => {});
        return download(res.headers.location, dest).then(resolve);
      }
      if (res.statusCode !== 200) { file.close(); fs.unlink(dest, () => {}); return resolve(false); }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(true); });
    }).on('error', () => { fs.unlink(dest, () => {}); resolve(false); });
  });
}

const htmlFiles = fs.readdirSync(STATIC)
  .filter(f => f.endsWith('.html'))
  .map(f => path.join(STATIC, f));

// Match both normal and escaped absolute URLs
const urlRegex = /https?:\\?\/\\?\/gamenic-virtual-studio\.com((?:[^\s"'<>)\\]|\\[/])*)/g;

console.log(`Processing ${htmlFiles.length} HTML files...`);

const toDownload = new Map();

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  for (const m of html.matchAll(urlRegex)) {
    // Unescape the path
    const rawPath = m[1].replace(/\\\//g, '/').split(/[?#]/)[0];
    const ext = path.extname(rawPath).toLowerCase();
    if (!ASSET_EXTS.has(ext)) continue;
    const localPath = path.join(STATIC, rawPath);
    const fullUrl = `https://gamenic-virtual-studio.com${rawPath}`;
    if (!toDownload.has(fullUrl)) toDownload.set(fullUrl, localPath);
  }
}

console.log(`Downloading ${toDownload.size} missing assets...`);
let downloaded = 0;
for (const [url, dest] of toDownload) {
  if (!fs.existsSync(dest)) {
    const ok = await download(url, dest);
    if (ok) { downloaded++; process.stdout.write('.'); }
  }
}
console.log(`\nDownloaded: ${downloaded}`);

console.log('Fixing HTML files...');
let fixed = 0;

for (const file of htmlFiles) {
  let html = fs.readFileSync(file, 'utf8');
  const original = html;

  // Remove WordPress-only dynamic tags
  for (const pat of WP_REMOVE_PATTERNS) html = html.replace(pat, '');

  // Replace asset URLs (escaped and unescaped)
  html = html.replace(urlRegex, (match, rawPath) => {
    const cleanPath = rawPath.replace(/\\\//g, '/').split(/[?#]/)[0];
    const ext = path.extname(cleanPath).toLowerCase();
    if (!ASSET_EXTS.has(ext)) return match;
    const localPath = path.join(STATIC, cleanPath);
    if (!fs.existsSync(localPath)) return match;
    const rel = path.relative(path.dirname(file), localPath).replace(/\\/g, '/');
    return rel;
  });

  if (html !== original) {
    fs.writeFileSync(file, html);
    fixed++;
  }
}

console.log(`Fixed ${fixed} files.`);

// Final check
const remaining = htmlFiles.filter(f =>
  fs.readFileSync(f, 'utf8').includes('gamenic-virtual-studio.com')
).length;
console.log(`Remaining files with old domain: ${remaining}`);
