const fs = require("fs");
const path = require("path");

function normalizeBase(url){
  // Ensure a single trailing slash so new URL(path, base) behaves as expected.
  return url.endsWith("/") ? url : url + "/";
}

function guessSiteUrl(){
  if(process.env.SITE_URL) return normalizeBase(process.env.SITE_URL);

  // If the repo uses a custom domain on GitHub Pages, prefer CNAME.
  const cnamePath = path.join(process.cwd(), "CNAME");
  if(fs.existsSync(cnamePath)){
    const domain = fs.readFileSync(cnamePath, "utf8").trim();
    if(domain) return normalizeBase(`https://${domain}`);
  }

  // Fallback to GitHub Pages URL.
  const repo = process.env.GITHUB_REPOSITORY || "";
  const [owner, name] = repo.split("/");
  if(owner && name) return normalizeBase(`https://${owner}.github.io/${name}`);
  return normalizeBase("https://example.com");
}

const SITE_URL = guessSiteUrl();

// Include any .html files sitting at repo root (index.html becomes /).
const htmlFiles = fs.readdirSync(process.cwd())
  .filter((f) => f.endsWith(".html"))
  .sort((a, b) => a.localeCompare(b))
  .map((f) => (f === "index.html" ? "/" : `/${f}`));

const uniquePaths = Array.from(new Set(htmlFiles)).sort((a, b) => {
  if(a === "/") return -1;
  if(b === "/") return 1;
  return a.localeCompare(b);
});

function lastModForPath(p){
  // Map / to index.html, and /foo.html to foo.html
  const file = p === "/" ? "index.html" : p.replace(/^\//, "");
  try {
    const stat = fs.statSync(path.join(process.cwd(), file));
    return new Date(stat.mtime).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

const urls = uniquePaths.map((p) => {
  const loc = new URL(p, SITE_URL).href;
  const lastmod = lastModForPath(p);
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
