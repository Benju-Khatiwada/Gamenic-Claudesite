import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STATIC = path.join(__dirname, 'static');

const htmlFiles = fs.readdirSync(STATIC)
  .filter(f => f.endsWith('.html') && f !== 'index.html')
  .map(f => path.join(STATIC, f));

console.log(`Processing ${htmlFiles.length} sub-page HTML files...`);
let fixed = 0;

// Section anchor links that should be prefixed with index.html on sub-pages
const sections = ['about', 'services', 'products', 'blog', 'career'];

for (const file of htmlFiles) {
  let html = fs.readFileSync(file, 'utf8');
  const original = html;

  for (const section of sections) {
    // Replace all instances of href="#section" with href="index.html#section"
    // But be careful not to double-fix already-fixed links
    html = html.replace(new RegExp(`href="#${section}"`, 'g'), `href="index.html#${section}"`);
  }

  if (html !== original) {
    fs.writeFileSync(file, html);
    fixed++;
  }
}

console.log(`Fixed ${fixed} files.`);
