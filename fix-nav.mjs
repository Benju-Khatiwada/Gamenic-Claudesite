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

  // 1. Fix nav logo href="" -> href="index.html"
  html = html.replace(/<a href="" class="nav-logo">/g, '<a href="index.html" class="nav-logo">');

  // 2. Fix Home nav-link href="" -> href="index.html"
  html = html.replace(/<a href="" class="nav-link">Home<\/a>/g, '<a href="index.html" class="nav-link">Home</a>');

  // 3. Fix Home mobile-link href="" -> href="index.html"
  html = html.replace(/<a href="" class="mobile-link">Home<\/a>/g, '<a href="index.html" class="mobile-link">Home</a>');

  // 4. Fix anchor nav-links to include index.html prefix
  html = html.replace(/<a href="#about" class="nav-link">/g, '<a href="index.html#about" class="nav-link">');
  html = html.replace(/<a href="#services" class="nav-link">/g, '<a href="index.html#services" class="nav-link">');
  html = html.replace(/<a href="#products" class="nav-link">/g, '<a href="index.html#products" class="nav-link">');
  html = html.replace(/<a href="#blog" class="nav-link">/g, '<a href="index.html#blog" class="nav-link">');
  html = html.replace(/<a href="#career" class="nav-link">/g, '<a href="index.html#career" class="nav-link">');

  // 5. Fix anchor mobile-links to include index.html prefix
  html = html.replace(/<a href="#about" class="mobile-link">/g, '<a href="index.html#about" class="mobile-link">');
  html = html.replace(/<a href="#services" class="mobile-link">/g, '<a href="index.html#services" class="mobile-link">');
  html = html.replace(/<a href="#products" class="mobile-link">/g, '<a href="index.html#products" class="mobile-link">');
  html = html.replace(/<a href="#blog" class="mobile-link">/g, '<a href="index.html#blog" class="mobile-link">');
  html = html.replace(/<a href="#career" class="mobile-link">/g, '<a href="index.html#career" class="mobile-link">');

  // 6. Fix contact CTA links
  html = html.replace(/<a href="#contact" class="nav-cta">/g, '<a href="index.html#contact" class="nav-cta">');
  html = html.replace(/<a href="#contact" class="mobile-cta">/g, '<a href="index.html#contact" class="mobile-cta">');

  // 7. Fix breadcrumb Home links
  html = html.replace(/<a href="">Home<\/a>/g, '<a href="index.html">Home</a>');

  if (html !== original) {
    fs.writeFileSync(file, html);
    fixed++;
  }
}

console.log(`Fixed ${fixed} files.`);
