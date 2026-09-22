const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'public', 'service-worker.js');
const dest = path.join(__dirname, '..', 'dist', 'service-worker.js');

fs.mkdirSync(path.dirname(dest), { recursive: true });
if (!fs.existsSync(src)) {
  console.error(`copy-sw: missing ${src} (run build-sw first)`);
  process.exit(1);
}
fs.copyFileSync(src, dest);
console.log(`copy-sw: ${src} -> ${dest}`);
