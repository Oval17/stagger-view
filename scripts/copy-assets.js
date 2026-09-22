const fs = require('fs');
const path = require('path');

// Copies runtime assets that webpack doesn't bundle into dist/:
// the built service worker, the web manifest, and PWA icons.
const root = path.join(__dirname, '..');
const files = [
  ['public', 'service-worker.js'],
  ['public', 'manifest.json'],
];
const dirs = [['public', 'icons']];

for (const parts of files) {
  const src = path.join(root, ...parts);
  const dest = path.join(root, 'dist', ...parts.slice(1));
  if (!fs.existsSync(src)) {
    console.error(`copy-assets: missing ${src} (run build-sw first for the service worker)`);
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log(`copy-assets: ${src} -> ${dest}`);
}

for (const parts of dirs) {
  const src = path.join(root, ...parts);
  const dest = path.join(root, 'dist', ...parts.slice(1));
  if (!fs.existsSync(src)) {
    console.error(`copy-assets: missing dir ${src}`);
    process.exit(1);
  }
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src)) {
    if (!entry.endsWith('.png')) continue;
    fs.copyFileSync(path.join(src, entry), path.join(dest, entry));
  }
  console.log(`copy-assets: ${src}/ -> ${dest}/`);
}
