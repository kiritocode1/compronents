import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('./', import.meta.url));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.png': 'image/png' };
createServer(async (request, response) => {
  const path = resolve(root, `.${new URL(request.url, 'http://localhost').pathname.replace(/\/$/, '/index.html')}`);
  if (!path.startsWith(root.endsWith(sep) ? root : root + sep)) {
    response.writeHead(403).end();
    return;
  }
  try {
    const bytes = await readFile(path);
    response.writeHead(200, { 'Content-Type': types[extname(path)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' }).end(bytes);
  } catch {
    response.writeHead(404).end('Not found');
  }
}).listen(Number(process.env.PORT), '127.0.0.1', () => console.log('Cassette preview ready'));
