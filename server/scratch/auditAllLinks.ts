import fs from "fs";
import path from "path";

// Define all routes registered in client/src/App.tsx
const KNOWN_STATIC_ROUTES = new Set([
  "/",
  "/letecka-spolecnost",
  "/letecke-spolecnosti",
  "/letenky-do",
  "/blog",
  "/admin/ab-test",
  "/admin/emails",
  "/admin/hero-ab-test",
  "/admin/revolut-ab-test",
  "/admin/ab-test-analytics",
  "/admin/share-ab-test",
  "/admin/whatsapp-generator",
  "/admin/social-media",
  "/admin/indexing-and-push",
  "/admin/ugc-factory",
  "/admin",
  "/levne-letenky",
  "/last-minute",
  "/letenky",
  "/tipy-pro-cestovatele",
  "/dovolene",
  "/hlidac-cen",
  "/odskodneni-za-let",
  "/kalkulacka-zavazadel",
  "/ebook-zdarma",
  "/wishlist",
  "/vlaky-autobusy",
  "/porovnani-cen",
  "/reunion",
  "/letenky-reunion",
  "/letenky-do-1500",
  "/redirect",
  "/aerolinky",
  "/dubaj",
  "/letenky-dubaj",
  "/bali",
  "/letenky-bali",
  "/new-york",
  "/letenky-new-york",
  "/prihlaseni",
  "/404",
]);

function isKnownInternalRoute(pathname: string): boolean {
  // Strip query and hash
  const clean = pathname.split("?")[0].split("#")[0];
  if (!clean || clean === "") return true;
  if (KNOWN_STATIC_ROUTES.has(clean)) return true;
  
  // Check parameterized routes
  if (clean.startsWith("/blog/")) return true;
  if (clean.startsWith("/tipy-pro-cestovatele/")) return true;
  if (clean.startsWith("/letecka-spolecnost/")) return true;
  if (clean.startsWith("/letecke-spolecnosti/")) return true;
  if (clean.startsWith("/letenky-do-")) return true;
  if (clean.startsWith("/r/flights/")) return true;
  
  // DestinationLandingPage catch-all /:destination (e.g. /letenky-pariz, /letenky-londyn, /rim, /barcelona, /malta)
  if (clean.startsWith("/") && clean.length > 1 && !clean.includes("//")) {
    return true;
  }

  return false;
}

function scanFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!["node_modules", "dist", "build", ".git"].includes(file)) {
        scanFiles(fullPath, fileList);
      }
    } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function runAudit() {
  console.log("=== COMPREHENSIVE LINK AUDIT ===");
  const root = path.resolve(__dirname, "../..");
  const clientFiles = scanFiles(path.join(root, "client", "src"));
  
  const foundLinks: Array<{ file: string; line: number; type: string; raw: string; destination: string }> = [];

  const hrefRegex = /href=["']([^"']+)["']/g;
  const linkRegex = /<Link[^>]+href=["']([^"']+)["']/g;

  for (const filePath of clientFiles) {
    const relativePath = path.relative(root, filePath);
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");

    lines.forEach((lineText, idx) => {
      let match;
      const r1 = new RegExp(hrefRegex);
      while ((match = r1.exec(lineText)) !== null) {
        foundLinks.push({
          file: relativePath,
          line: idx + 1,
          type: "href",
          raw: match[0],
          destination: match[1],
        });
      }

      const r2 = new RegExp(linkRegex);
      while ((match = r2.exec(lineText)) !== null) {
        foundLinks.push({
          file: relativePath,
          line: idx + 1,
          type: "Link",
          raw: match[0],
          destination: match[1],
        });
      }
    });
  }

  console.log(`Total raw static links found in codebase: ${foundLinks.length}`);

  const internalLinks = foundLinks.filter(l => l.destination.startsWith("/") || l.destination.startsWith("#") || l.destination.startsWith("https://www.akcni-letenky.com") || l.destination.startsWith("https://akcni-letenky.com"));
  const externalLinks = foundLinks.filter(l => !internalLinks.includes(l) && (l.destination.startsWith("http://") || l.destination.startsWith("https://") || l.destination.startsWith("mailto:") || l.destination.startsWith("tel:")));
  const suspectLinks = foundLinks.filter(l => !internalLinks.includes(l) && !externalLinks.includes(l));

  console.log(`- Internal links: ${internalLinks.length}`);
  console.log(`- External links: ${externalLinks.length}`);
  console.log(`- Suspect / relative links: ${suspectLinks.length}`);

  console.log("\n--- VALIDATING INTERNAL ROUTES ---");
  const invalidInternal: any[] = [];
  for (const item of internalLinks) {
    let pathname = item.destination;
    if (pathname.startsWith("https://www.akcni-letenky.com")) {
      pathname = pathname.replace("https://www.akcni-letenky.com", "");
    } else if (pathname.startsWith("https://akcni-letenky.com")) {
      pathname = pathname.replace("https://akcni-letenky.com", "");
    }

    if (pathname.startsWith("#")) continue; // Anchor link

    if (!isKnownInternalRoute(pathname)) {
      invalidInternal.push({ ...item, resolvedPath: pathname });
    }
  }

  console.log(`Invalid internal links: ${invalidInternal.length}`);
  if (invalidInternal.length > 0) {
    invalidInternal.forEach(i => console.log(`  [FAIL] ${i.file}:${i.line} -> ${i.destination}`));
  } else {
    console.log("  [PASS] All internal links point to valid registered routes!");
  }

  console.log("\n--- VALIDATING EXTERNAL AFFILIATE & SOCIAL LINKS ---");
  const brokenExternal: any[] = [];
  for (const item of externalLinks) {
    if (item.destination.startsWith("mailto:") || item.destination.startsWith("tel:")) continue;
    try {
      new URL(item.destination);
    } catch {
      brokenExternal.push(item);
    }
  }

  console.log(`Malformed external links: ${brokenExternal.length}`);
  if (brokenExternal.length > 0) {
    brokenExternal.forEach(e => console.log(`  [FAIL] ${e.file}:${e.line} -> ${e.destination}`));
  } else {
    console.log("  [PASS] All external URLs have valid URL structure.");
  }

  if (suspectLinks.length > 0) {
    console.log("\n--- SUSPECT / UNUSUAL LINKS ---");
    suspectLinks.forEach(s => console.log(`  [WARN] ${s.file}:${s.line} -> ${s.destination}`));
  }
}

runAudit();
