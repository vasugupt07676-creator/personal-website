const fs = require("fs");
const path = require("path");

const SITE_URL =
  process.env.SITE_URL ||
  // fallback to a likely GitHub Pages URL if you haven't set SITE_URL yet:
  `https://${process.env.GITHUB_REPOSITORY?.split("/")[0]}.github.io/${process.env.GITHUB_REPOSITORY?.split("/")[1]}/`.replace(/\/+/g, "/");

// Common routes for a personal site; add or remove as needed.
const routes = [
  "/", "/about", "/projects", "/skills", "/contact", "/blog"
];

// Also include any .html files sitting at repo root
const htmlFiles = fs.readdirSync(process.cwd())
  .filter(f => f.endsWith(".html"))
  .map(f => "/" + (f === "index.html" ? "" : f.replace(/\.html$/, "")));

const uniquePaths = Array.from(new Set([...routes, ...htmlFiles]));

function lastModGuess(p) {
  // Try to map /foo to foo.html for lastmod; fallback to now
  const htmlCandidate = p === "/" ? "index.html" : p.replace(/^\//, "") + ".html";
  try {
    const stat = fs.statSync(path.join(process.cwd(), htmlCandidate));
    return new Date(stat.mtime).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

const urls = uniquePaths.map(p => {
  const loc = new URL(p.replace(/\/index$/, "/"), SITE_URL).href;
  const lastmod = lastModGuess(p);
  const priority = p === "/" ? "1.0" : "0.7";
  return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;

fs.writeFileSync(path.join(process.cwd(), "sitemap.xml"), xml.trim() + "\n", "utf8");
console.log(`Generated sitemap.xml with ${uniquePaths.length} URLs at ${SITE_URL}`);
