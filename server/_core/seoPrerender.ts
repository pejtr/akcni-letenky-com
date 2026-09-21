/**
 * Server-side SEO head normalization for SPA routes.
 *
 * Search crawlers must never receive the homepage canonical/title for every
 * route. This module makes the initial HTML response route-aware, while React
 * Helmet may enrich it again after hydration.
 */
import { destinationCountries, destinationCities } from "../../shared/seoDestinations";

const BASE_URL = "https://www.akcni-letenky.com";

type RouteSeo = {
  title: string;
  description: string;
  canonicalPath: string;
  noindex?: boolean;
};

const STATIC_SEO: Record<string, Omit<RouteSeo, "canonicalPath">> = {
  "/": {
    title: "Akční letenky a cestovatelské tipy | Akční-Letenky.com",
    description: "Přehled akčních letenek, dovolených a cestovatelských tipů. Aktuální ceny a dostupnost ověříte u prodejce.",
  },
  "/letenky": {
    title: "Akční letenky z Prahy, Vídně a Bratislavy | Akční-Letenky.com",
    description: "Přehled akčních letenek bez umělých slev. Aktuální cenu, dostupnost a podmínky ověříte přímo u prodejce.",
  },
  "/dovolene": {
    title: "Dovolené a zájezdy | Akční-Letenky.com",
    description: "Přehled aktuálních tipů na dovolené a zájezdy. Ceny a dostupnost potvrzuje konkrétní prodejce.",
  },
  "/blog": {
    title: "Blog a cestovatelské rady | Akční-Letenky.com",
    description: "Praktické cestovatelské rady, inspirace a články o letenkách, destinacích a plánování cest.",
  },
  "/tipy-pro-cestovatele": {
    title: "Tipy pro cestovatele | Akční-Letenky.com",
    description: "Praktické tipy pro levnější a pohodlnější cestování, plánování letů a orientaci v nabídkách.",
  },
  "/aerolinky": {
    title: "Letecké společnosti | Akční-Letenky.com",
    description: "Přehled leteckých společností a praktických informací pro cestující.",
  },
  "/vlaky-autobusy": {
    title: "Vlaky a autobusy po Evropě | Akční-Letenky.com",
    description: "Srovnání možností cestování vlakem a autobusem po Evropě a praktické informace k cestě.",
  },
  "/porovnani-cen": {
    title: "Porovnání cen dopravy | Akční-Letenky.com",
    description: "Porovnejte možnosti cestování letadlem, vlakem a autobusem podle ceny a podmínek.",
  },
  "/hlidac-cen": {
    title: "Hlídač cen letenek | Akční-Letenky.com",
    description: "Sledujte změny cen letenek a nastavte si upozornění na vybrané trasy.",
  },
  "/odskodneni-za-let": {
    title: "Odškodnění za zpožděný nebo zrušený let | Akční-Letenky.com",
    description: "Informace k nároku na kompenzaci při zpoždění nebo zrušení letu.",
  },
  "/kalkulacka-zavazadel": {
    title: "Kalkulačka zavazadel | Akční-Letenky.com",
    description: "Praktická pomůcka pro orientaci v rozměrech a limitech zavazadel při cestování letadlem.",
  },
  "/ebook-zdarma": {
    title: "Cestovatelský e-book zdarma | Akční-Letenky.com",
    description: "Praktický e-book s tipy pro plánování cest a hledání letenek.",
  },
  "/o-nas": {
    title: "O projektu a kontakt | Akční-Letenky.com",
    description: "Informace o projektu Akční-Letenky.com, jeho provozovateli, partnerském modelu a možnostech kontaktu.",
  },
  "/dubaj": {
    title: "Letenky do Dubaje | Akční-Letenky.com",
    description: "Praktické informace pro cestu do Dubaje a odkazy na aktuální nabídky letenek.",
  },
  "/bali": {
    title: "Letenky na Bali | Akční-Letenky.com",
    description: "Praktické informace pro cestu na Bali a odkazy na aktuální nabídky letenek.",
  },
  "/new-york": {
    title: "Letenky do New Yorku | Akční-Letenky.com",
    description: "Praktické informace pro cestu do New Yorku a odkazy na aktuální nabídky letenek.",
  },
  "/reunion": {
    title: "Letenky na Réunion | Akční-Letenky.com",
    description: "Praktické informace pro cestu na ostrov Réunion a odkazy na aktuální nabídky letenek.",
  },
  "/letenky-do-1500": {
    title: "Tipy na levné letenky do 1 500 Kč | Akční-Letenky.com",
    description: "Přehled cenově zajímavých tras; aktuální cenu a dostupnost vždy ověřte u prodejce.",
  },
};

const CANONICAL_ALIASES: Record<string, string> = {
  "/levne-letenky": "/letenky",
  "/last-minute": "/letenky",
  "/letenky-dubaj": "/dubaj",
  "/letenky-bali": "/bali",
  "/letenky-new-york": "/new-york",
  "/letenky-reunion": "/reunion",
  "/kontakt": "/o-nas",
  "/tipy-cestovatele": "/tipy-pro-cestovatele",
};

function normalizePath(raw: string): string {
  const pathname = raw.split("?")[0] || "/";
  if (pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
}

function humanizeSlug(slug: string): string {
  return decodeURIComponent(slug)
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function findDestination(slug: string) {
  return [...destinationCountries, ...destinationCities].find((d) => d.slug === slug);
}

function resolveRouteSeo(rawPath: string): RouteSeo {
  const path = normalizePath(rawPath);
  const canonicalPath = CANONICAL_ALIASES[path] || path;

  if (path.startsWith("/admin") || ["/wishlist", "/prihlaseni", "/redirect", "/404"].includes(path)) {
    return {
      title: "Akční Letenky",
      description: "Interní nebo uživatelská stránka portálu Akční Letenky.",
      canonicalPath,
      noindex: true,
    };
  }

  const staticSeo = STATIC_SEO[canonicalPath];
  if (staticSeo) return { ...staticSeo, canonicalPath };

  if (canonicalPath.startsWith("/letenky-do-")) {
    const slug = canonicalPath.slice("/letenky-do-".length);
    const destination = findDestination(slug);
    const name = destination?.name || humanizeSlug(slug);
    return {
      title: `Letenky do ${name} | Akční-Letenky.com`,
      description: destination?.metaDescription || `Praktický přehled letenek do destinace ${name}. Aktuální ceny a dostupnost ověříte u prodejce.`,
      canonicalPath,
    };
  }

  if (canonicalPath.startsWith("/letenky-")) {
    const slug = canonicalPath.slice("/letenky-".length);
    const destination = destinationCities.find((d) => d.slug === slug);
    const name = destination?.name || humanizeSlug(slug);
    return {
      title: `Letenky do ${name} | Akční-Letenky.com`,
      description: destination?.metaDescription || `Praktický přehled letenek do destinace ${name}. Aktuální ceny a dostupnost ověříte u prodejce.`,
      canonicalPath,
    };
  }

  if (canonicalPath.startsWith("/letecka-spolecnost/")) {
    const slug = canonicalPath.slice("/letecka-spolecnost/".length);
    const name = humanizeSlug(slug);
    return {
      title: `${name} – letenky a informace | Akční-Letenky.com`,
      description: `Praktické informace o letecké společnosti ${name} a odkazy na aktuální nabídky letenek.`,
      canonicalPath,
    };
  }

  if (canonicalPath.startsWith("/blog/")) {
    return {
      title: "Cestovatelský článek | Akční-Letenky.com",
      description: "Cestovatelský článek, praktické informace a tipy pro plánování cesty.",
      canonicalPath,
    };
  }

  if (canonicalPath.startsWith("/tipy-pro-cestovatele/")) {
    return {
      title: "Tip pro cestovatele | Akční-Letenky.com",
      description: "Praktický tip pro plánování cesty, letenek a cestovatelského rozpočtu.",
      canonicalPath,
    };
  }

  const singleSlug = canonicalPath.match(/^\/([^/]+)$/)?.[1];
  if (singleSlug) {
    const destination = findDestination(singleSlug);
    if (destination) {
      return {
        title: `Letenky – ${destination.name} | Akční-Letenky.com`,
        description: destination.metaDescription,
        canonicalPath,
      };
    }
  }

  return {
    title: "Akční letenky a cestovatelské tipy | Akční-Letenky.com",
    description: "Přehled akčních letenek, dovolených a cestovatelských tipů. Aktuální ceny a dostupnost ověříte u prodejce.",
    canonicalPath,
  };
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function prerenderSeoHtml(html: string, rawPath: string): string {
  const seo = resolveRouteSeo(rawPath);
  const canonicalUrl = `${BASE_URL}${seo.canonicalPath === "/" ? "/" : seo.canonicalPath}`;
  const robots = seo.noindex
    ? "noindex, nofollow"
    : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

  let out = html;
  out = out.replace(/<title>[\s\S]*?<\/title>/gi, "");
  out = out.replace(/<meta[^>]+name=["']description["'][^>]*>/gi, "");
  out = out.replace(/<link[^>]+rel=["']canonical["'][^>]*>/gi, "");
  out = out.replace(/<meta[^>]+name=["']robots["'][^>]*>/gi, "");
  out = out.replace(/<meta[^>]+property=["']og:url["'][^>]*>/gi, "");
  out = out.replace(/<meta[^>]+property=["']og:title["'][^>]*>/gi, "");
  out = out.replace(/<meta[^>]+property=["']og:description["'][^>]*>/gi, "");
  out = out.replace(/<meta[^>]+(?:name|property)=["']twitter:url["'][^>]*>/gi, "");
  out = out.replace(/<meta[^>]+(?:name|property)=["']twitter:title["'][^>]*>/gi, "");
  out = out.replace(/<meta[^>]+(?:name|property)=["']twitter:description["'][^>]*>/gi, "");
  out = out.replace(/<link[^>]+rel=["']alternate["'][^>]+hreflang=["'](?:cs|x-default)["'][^>]*>/gi, "");

  const tags = [
    `<title>${escapeAttr(seo.title)}</title>`,
    `<meta name="description" content="${escapeAttr(seo.description)}" />`,
    `<link rel="canonical" href="${canonicalUrl}" />`,
    `<meta name="robots" content="${robots}" />`,
    `<link rel="alternate" hreflang="cs" href="${canonicalUrl}" />`,
    `<link rel="alternate" hreflang="x-default" href="${canonicalUrl}" />`,
    `<meta property="og:url" content="${canonicalUrl}" />`,
    `<meta property="og:title" content="${escapeAttr(seo.title)}" />`,
    `<meta property="og:description" content="${escapeAttr(seo.description)}" />`,
    `<meta name="twitter:url" content="${canonicalUrl}" />`,
    `<meta name="twitter:title" content="${escapeAttr(seo.title)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(seo.description)}" />`,
  ].join("\n    ");

  return out.replace("</head>", `    ${tags}\n  </head>`);
}
