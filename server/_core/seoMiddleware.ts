/**
 * SEO Middleware for Express
 * 
 * Handles:
 * 1. Non-www → www 301 redirect
 * 2. Trailing slash removal (301 redirect)
 * 3. Legacy WordPress URL → 410 Gone
 * 4. Legacy airline URL → 301 redirect to new format
 * 5. Route whitelist validation → real 404 for unknown paths
 */
import type { Request, Response, NextFunction } from "express";
import { destinationCountries, destinationCities } from "../../shared/seoDestinations";

// ─── Known valid static routes ───
const VALID_STATIC_ROUTES = new Set([
  "/",
  "/levne-letenky",
  "/last-minute",
  "/letenky",
  "/dovolene",
  "/hlidac-cen",
  "/odskodneni-za-let",
  "/kalkulacka-zavazadel",
  "/ebook-zdarma",
  "/blog",
  "/tipy-pro-cestovatele",
  "/aerolinky",
  "/vlaky-autobusy",
  "/porovnani-cen",
  "/wishlist",
  "/reunion",
  "/letenky-reunion",
  "/letenky-do-1500",
  "/redirect",
  "/dubaj",
  "/letenky-dubaj",
  "/bali",
  "/letenky-bali",
  "/new-york",
  "/letenky-new-york",
  "/prihlaseni",
  "/404",
]);

// ─── Valid dynamic route prefixes ───
const VALID_PREFIXES = [
  "/blog/",
  "/admin",
  "/letecka-spolecnost/",
  "/letecke-spolecnosti/",
  "/letenky-do-",
  "/tipy-pro-cestovatele/",
  "/api/",
];

// ─── Known valid airline slugs ───
const VALID_AIRLINE_SLUGS = new Set([
  "ryanair", "wizz-air", "czech-airlines", "lufthansa", "emirates",
  "qatar-airways", "turkish-airlines", "klm", "air-france", "british-airways",
  "austrian-airlines", "lot",
]);

// ─── Build valid destination slugs from seoDestinations ───
const VALID_DESTINATION_SLUGS = new Set<string>();
for (const c of destinationCountries) {
  VALID_DESTINATION_SLUGS.add(c.slug); // e.g. "usa"
}
for (const c of destinationCities) {
  VALID_DESTINATION_SLUGS.add(c.slug); // e.g. "barcelona"
  VALID_DESTINATION_SLUGS.add(`letenky-${c.slug}`); // e.g. "letenky-barcelona"
}

// ─── Legacy WordPress airline slug → new format mapping ───
const LEGACY_AIRLINE_REDIRECTS: Record<string, string> = {
  "ryanair-letenky": "/letecka-spolecnost/ryanair",
  "wizz-air-letenky": "/letecka-spolecnost/wizz-air",
  "czech-airlines-letenky": "/letecka-spolecnost/czech-airlines",
  "lufthansa-letenky": "/letecka-spolecnost/lufthansa",
  "emirates-letenky": "/letecka-spolecnost/emirates",
  "qatar-airways-letenky": "/letecka-spolecnost/qatar-airways",
  "turkish-airlines-letenky": "/letecka-spolecnost/turkish-airlines",
  "klm-letenky": "/letecka-spolecnost/klm",
  "air-france-letenky": "/letecka-spolecnost/air-france",
  "british-airways-letenky": "/letecka-spolecnost/british-airways",
  "austrian-airlines-letenky": "/letecka-spolecnost/austrian-airlines",
  "lot-letenky": "/letecka-spolecnost/lot",
};

/**
 * Middleware: Canonical domain redirect (non-www → www)
 */
export function canonicalDomainRedirect(req: Request, res: Response, next: NextFunction) {
  const host = req.hostname || req.headers.host || "";
  
  // Skip for localhost/dev
  if (host.includes("localhost") || host.includes("127.0.0.1") || host.includes("railway.app")) {
    return next();
  }
  
  // Redirect non-www to www
  if (host === "akcni-letenky.com") {
    const newUrl = `https://www.akcni-letenky.com${req.originalUrl}`;
    return res.redirect(301, newUrl);
  }
  
  next();
}

/**
 * Middleware: Trailing slash normalization (strip trailing slash with 301)
 */
export function trailingSlashRedirect(req: Request, res: Response, next: NextFunction) {
  const path = req.path;
  
  // Skip root, API, and static file requests
  if (path === "/" || path.startsWith("/api/") || path.includes(".")) {
    return next();
  }
  
  // Remove trailing slash
  if (path.length > 1 && path.endsWith("/")) {
    const cleanPath = path.slice(0, -1);
    const query = req.originalUrl.includes("?") ? req.originalUrl.slice(req.originalUrl.indexOf("?")) : "";
    return res.redirect(301, `${cleanPath}${query}`);
  }
  
  next();
}

/**
 * Middleware: Block legacy WordPress URLs with 410 Gone
 */
export function legacyUrlHandler(req: Request, res: Response, next: NextFunction) {
  const path = req.path.toLowerCase();
  
  // 410 Gone for legacy file extensions
  if (path.endsWith(".html") || path.endsWith(".php") || path.endsWith(".asp") || path.endsWith(".aspx")) {
    return res.status(410).send("<!DOCTYPE html><html><head><title>410 Gone</title></head><body><h1>410 Gone</h1><p>Tato stránka byla trvale odstraněna.</p><p><a href=\"https://www.akcni-letenky.com/\">Zpět na hlavní stránku →</a></p></body></html>");
  }
  
  // 410 Gone for WordPress-specific paths
  const wpPaths = ["/wp-admin", "/wp-content", "/wp-includes", "/wp-login", "/wp-json",
    "/feed", "/rss", "/atom", "/comments", "/trackback",
    "/tag/", "/category/", "/author/", "/page/",
    "/core/", "/xmlrpc", "/wp-cron"];
  
  for (const wp of wpPaths) {
    if (path.startsWith(wp) || path === wp.slice(0, -1)) {
      return res.status(410).send("<!DOCTYPE html><html><head><title>410 Gone</title></head><body><h1>410 Gone</h1><p>Tato stránka byla trvale odstraněna.</p><p><a href=\"https://www.akcni-letenky.com/\">Zpět na hlavní stránku →</a></p></body></html>");
    }
  }
  
  // 410 for other known legacy paths
  const legacyPaths = ["/privacy-policy", "/zasady-ochrany-osobnich-udaju",
    "/caste-dotazy", "/kontakt", "/o-nas", "/podminky",
    "/first-minutes", "/akcni-pobyty", "/linkdomoci", "/tricky-matku"];
  
  for (const lp of legacyPaths) {
    if (path === lp || path === `${lp}/`) {
      return res.status(410).send("<!DOCTYPE html><html><head><title>410 Gone</title></head><body><h1>410 Gone</h1><p>Tato stránka byla trvale odstraněna.</p><p><a href=\"https://www.akcni-letenky.com/\">Zpět na hlavní stránku →</a></p></body></html>");
    }
  }
  
  next();
}

/**
 * Middleware: Legacy airline URL redirects & broken template fix
 */
export function legacyAirlineRedirects(req: Request, res: Response, next: NextFunction) {
  let path = req.path.replace(/\/$/, "").toLowerCase();
  
  // Handle literal :slug template error
  if (path.includes(":slug")) {
    return res.status(410).send("<!DOCTYPE html><html><head><title>410 Gone</title></head><body><h1>410 Gone</h1><p>Neplatná šablona URL.</p></body></html>");
  }

  // Strip leading slash
  let slug = path.replace(/^\//, "");
  
  // Check direct slug redirect e.g. "klm-letenky"
  if (LEGACY_AIRLINE_REDIRECTS[slug]) {
    return res.redirect(301, LEGACY_AIRLINE_REDIRECTS[slug]);
  }

  // Check with /letecke-spolecnosti/ or /letecka-spolecnost/ prefix
  const airlinePrefixMatch = slug.match(/^(?:letecke-spolecnosti|letecka-spolecnost)\/(.+)$/);
  if (airlinePrefixMatch) {
    const rawAirline = airlinePrefixMatch[1].replace(/-letenky$/, "");
    if (VALID_AIRLINE_SLUGS.has(rawAirline)) {
      if (req.path !== `/letecka-spolecnost/${rawAirline}`) {
        return res.redirect(301, `/letecka-spolecnost/${rawAirline}`);
      }
    }
  }

  next();
}

/**
 * Middleware: Route whitelist validation
 * Returns real 404 for paths that don't match any known route
 */
export function routeWhitelistValidation(req: Request, res: Response, next: NextFunction) {
  const path = req.path;
  
  // Skip API, static files, sitemap, robots
  if (path.startsWith("/api/") || path.includes(".") || 
      path === "/sitemap.xml" || path === "/sitemap_index.xml" || path === "/robots.txt") {
    return next();
  }
  
  // Check static routes
  if (VALID_STATIC_ROUTES.has(path)) {
    return next();
  }
  
  // Check dynamic route prefixes
  for (const prefix of VALID_PREFIXES) {
    if (path.startsWith(prefix)) {
      // For airline pages, validate the slug exists
      if (prefix === "/letecka-spolecnost/" || prefix === "/letecke-spolecnosti/") {
        const slug = path.replace(prefix, "").replace(/\/$/, "");
        if (!VALID_AIRLINE_SLUGS.has(slug)) {
          return res.status(404).send("<!DOCTYPE html><html><head><title>404 Stránka nenalezena</title></head><body><h1>404 Nenalezeno</h1><p>Tato letecká společnost neexistuje.</p><p><a href=\"https://www.akcni-letenky.com/aerolinky\">Zobrazit všechny aerolinky →</a></p></body></html>");
        }
      }
      return next();
    }
  }
  
  // Check catch-all destination slug (/:destination)
  const slug = path.replace(/^\//, "").replace(/\/$/, "").toLowerCase();
  if (slug && !slug.includes("/") && VALID_DESTINATION_SLUGS.has(slug)) {
    return next();
  }
  
  // Unknown route → real 404
  console.log(`[SEO 404] Unknown route: ${path}`);
  return res.status(404).send("<!DOCTYPE html><html lang=\"cs\"><head><meta charset=\"UTF-8\"><title>404 Stránka nenalezena | Akční Letenky</title><meta name=\"robots\" content=\"noindex, nofollow\"><style>body{font-family:system-ui,sans-serif;max-width:600px;margin:100px auto;text-align:center;color:#333}h1{font-size:3rem;color:#e91e63}a{color:#e91e63;text-decoration:none}a:hover{text-decoration:underline}</style></head><body><h1>404</h1><h2>Stránka nenalezena</h2><p>Hledaná stránka neexistuje nebo byla přesunuta.</p><p><a href=\"https://www.akcni-letenky.com/\">← Zpět na hlavní stránku</a></p><p><a href=\"https://www.akcni-letenky.com/levne-letenky\">Najít levné letenky →</a></p></body></html>");
}
