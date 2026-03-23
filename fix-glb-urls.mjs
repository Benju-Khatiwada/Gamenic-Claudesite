import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATIC = path.join(__dirname, 'static');

const files = fs.readdirSync(STATIC).filter(f => f.endsWith('.html'));
let fixed = 0;

for (const f of files) {
  const filePath = path.join(STATIC, f);
  const original = fs.readFileSync(filePath, 'utf8');

  // In data-attributes JSON (HTML-entity-encoded), modelUrl points to live site.
  // The URL is encoded as: https:\/\/gamenic-virtual-studio.com\/wp-content\/uploads\/
  // We replace it with the local relative path: wp-content\/uploads\/
  const updated = original.replace(
    /https:\\\/\\\/gamenic-virtual-studio\.com\\\/wp-content\\\/uploads\\\//g,
    'wp-content\\/uploads\\/'
  );

  if (updated !== original) {
    fs.writeFileSync(filePath, updated);
    fixed++;
    console.log(`Fixed: ${f}`);
  }
}

console.log(`\nUpdated ${fixed} files.`);
