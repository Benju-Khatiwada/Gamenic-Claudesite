import scrape from 'website-scraper';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const options = {
  urls: ['https://gamenic-virtual-studio.com/'],
  directory: path.join(__dirname, 'static'),
  recursive: true,
  maxDepth: 5,
  requestConcurrency: 5,
  prettifyUrls: true,
  sources: [
    { selector: 'img', attr: 'src' },
    { selector: 'img', attr: 'srcset' },
    { selector: 'input', attr: 'src' },
    { selector: 'object', attr: 'data' },
    { selector: 'embed', attr: 'src' },
    { selector: 'param[name="movie"]', attr: 'value' },
    { selector: 'script', attr: 'src' },
    { selector: 'link[rel="stylesheet"]', attr: 'href' },
    { selector: 'link[rel~="icon"]', attr: 'href' },
    { selector: 'a', attr: 'href' },
    { selector: 'video', attr: 'src' },
    { selector: 'source', attr: 'src' },
    { selector: 'source', attr: 'srcset' },
    { selector: '[style]', attr: 'style' },
  ],
  urlFilter: (url) => {
    return url.startsWith('https://gamenic-virtual-studio.com') ||
           url.startsWith('http://gamenic-virtual-studio.com');
  },
};

console.log('Starting crawl of https://gamenic-virtual-studio.com/ ...');
console.log('Output directory: ./static');
console.log('');

try {
  await scrape(options);
  console.log('\nCrawl complete! Static files saved to ./static');
} catch (err) {
  console.error('Crawl error:', err.message);
  process.exit(1);
}
