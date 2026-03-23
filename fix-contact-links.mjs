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

for (const file of htmlFiles) {
  let html = fs.readFileSync(file, 'utf8');
  const original = html;

  // Fix ALL remaining href="#contact" links on sub-pages to use index.html#contact
  // This is a broad replacement - any href="#contact" on a sub-page should go to the homepage contact section
  html = html.replace(/href="#contact"/g, 'href="index.html#contact"');

  if (html !== original) {
    fs.writeFileSync(file, html);
    fixed++;
  }
}

console.log(`Fixed ${fixed} files.`);
