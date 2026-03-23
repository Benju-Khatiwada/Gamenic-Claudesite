import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATIC = path.join(__dirname, 'static');

const files = fs.readdirSync(STATIC).filter(f => f.endsWith('.html'));
const glbUrls = new Set();

for (const f of files) {
  const content = fs.readFileSync(path.join(STATIC, f), 'utf8');
  // data-attributes JSON is HTML-entity-encoded: &quot; = "
  // modelUrl":"https://...Chairr.glb"
  // data-attributes is HTML-entity-encoded with &quot; and escaped slashes \/
  const decoded = content.replace(/&quot;/g, '"').replace(/\\\//g, '/');
  const re = /"modelUrl"\s*:\s*"(https?:\/\/[^"]+\.glb)"/g;
  let m;
  while ((m = re.exec(decoded)) !== null) {
    glbUrls.add(m[1]);
  }
}

console.log([...glbUrls].join('\n'));
console.log(`\nTotal: ${glbUrls.size} unique GLB URLs`);
