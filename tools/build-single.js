// Builds ib-toolkit.html: the whole app in one self-contained file
// (styles, questions and code inlined), so it can be downloaded and opened directly.
// Run with: node tools/build-single.js
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
let html = read('index.html');

html = html.replace('<link rel="stylesheet" href="css/styles.css">', () => `<style>\n${read('css/styles.css')}\n</style>`);

// The private question file is never bundled; add those questions in-app instead.
html = html.replace(/\s*<!-- Optional, gitignored[^>]*-->\s*<script src="data\/private-questions\.js"[^>]*><\/script>/, '');

html = html.replace(/<script src="([^"]+)"><\/script>/g, (_, src) => {
  const code = read(src).replace(/<\/script/gi, '<\\/script');
  return `<script>\n/* ${src} */\n${code}\n</script>`;
});

if (/<script src=|<link rel="stylesheet"/.test(html)) throw new Error('An external reference was left un-inlined.');
fs.writeFileSync(path.join(root, 'ib-toolkit.html'), html);
console.log(`Wrote ib-toolkit.html (${(Buffer.byteLength(html) / 1024).toFixed(0)} KB)`);
