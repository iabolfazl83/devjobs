/**
 * Serves the static export (out/) the way GitHub Pages does — under the same
 * base path, `/dir/` → `/dir/index.html`, unknown paths → 404.html — so
 * `npm run preview` and the Playwright tests exercise the exact deployed build.
 *
 *   NEXT_PUBLIC_BASE_PATH=/devjobs PORT=4173 node scripts/serve-static.mjs
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve("out");
const BASE = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
const PORT = Number(process.env.PORT ?? 4173);

const TYPES = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".txt": "text/plain; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".ico": "image/x-icon",
    ".woff2": "font/woff2",
    ".xml": "application/xml",
};

if (!fs.existsSync(ROOT)) {
    console.error("No out/ directory — run `npm run build` first.");
    process.exit(1);
}

function resolveFile(urlPath) {
    const candidate = path.join(ROOT, decodeURIComponent(urlPath));
    if (!candidate.startsWith(ROOT)) return null; // path traversal
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
    const index = path.join(candidate, "index.html");
    if (fs.existsSync(index)) return index;
    if (fs.existsSync(`${candidate}.html`)) return `${candidate}.html`;
    return null;
}

http.createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://localhost");
    if (BASE && url.pathname === "/") {
        response.writeHead(302, {Location: `${BASE}/`}).end();
        return;
    }
    if (BASE && !url.pathname.startsWith(BASE)) {
        response.writeHead(404).end("Not found (outside base path)");
        return;
    }
    const relative = url.pathname.slice(BASE.length) || "/";
    // Mirror GitHub Pages: a directory without a trailing slash redirects to one.
    const file = resolveFile(relative);
    if (file && file.endsWith("index.html") && !relative.endsWith("/") && !relative.endsWith(".html")) {
        response.writeHead(301, {Location: `${BASE}${relative}/${url.search}`}).end();
        return;
    }
    const target = file ?? path.join(ROOT, "404.html");
    response.writeHead(file ? 200 : 404, {"Content-Type": TYPES[path.extname(target)] ?? "application/octet-stream"});
    fs.createReadStream(target).pipe(response);
}).listen(PORT, () => {
    console.log(`Serving out/ at http://localhost:${PORT}${BASE}/`);
});
