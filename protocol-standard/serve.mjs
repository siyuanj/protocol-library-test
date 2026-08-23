/* Minimal dependency-free static server for the protocol-standard/ folder.
 * Usage: node serve.mjs   (PORT / HOST via env; defaults 127.0.0.1:4173)
 * Open http://localhost:4173/renderer/demo.html
 */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT ? Number(process.env.PORT) : 4173;
const HOST = process.env.HOST || "127.0.0.1";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".md": "text/markdown; charset=utf-8",
};

const server = createServer(async (req, res) => {
  try {
    let urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    if (urlPath === "/") urlPath = "/renderer/index.html";
    const filePath = normalize(join(rootDir, urlPath));
    if (!filePath.startsWith(rootDir)) { res.writeHead(403); res.end("Forbidden"); return; }
    const data = await readFile(filePath);
    res.writeHead(200, { "Content-Type": TYPES[extname(filePath)] || "application/octet-stream" });
    res.end(data);
  } catch (e) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not found: " + (req.url || ""));
  }
});
server.listen(PORT, HOST, () => console.log(`Serving protocol-standard at http://${HOST}:${PORT}/renderer/demo.html`));
