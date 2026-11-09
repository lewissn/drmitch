// Local preview of dist/ with the same clean URLs as the live site.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.xml': 'application/xml', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json' };
const port = Number(process.env.PORT) || 3000;
http.createServer((req, res) => {
  let file = path.join('dist', decodeURIComponent(req.url.split('?')[0]));
  if (file.endsWith(path.sep) || file === 'dist') file = path.join(file, 'index.html');
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { 'content-type': 'text/html' }); res.end(fs.readFileSync('dist/404.html')); return; }
    res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(port, () => console.log(`http://localhost:${port}`));
