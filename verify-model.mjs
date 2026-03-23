import fs from 'fs';

const html = fs.readFileSync('C:/Users/97798/Desktop/wordpress/wordpressclaude/static/chair-3.html', 'utf8');
const idx = html.indexOf('woocommerce-product-details__short-description');
const section = html.substring(idx, idx + 2000);
const blockMatch = section.match(/data-attributes="([^"]+)"/);
if (blockMatch) {
  const raw = blockMatch[1];
  const decoded = raw.replace(/&quot;/g, '"').replace(/&amp;/g, '&');
  try {
    const attrs = JSON.parse(decoded);
    console.log('modelUrl:', attrs.model && attrs.model.modelUrl);
    console.log('height:', attrs.styles && attrs.styles.height);
    console.log('\nParsed successfully!');
  } catch(e) {
    console.log('Parse error:', e.message);
    console.log('Decoded (first 500):', decoded.substring(0, 500));
  }
}
