/**
 * SEO component — centralized Helmet wrapper for meta tags, OG, and structured data.
 * Use on every page for consistent search-engine and social-sharing metadata.
 */
import { Helmet } from "react-helmet";

export interface StructuredDataItem {
  "@context": string;
  "@type": string;
  [key: string]: unknown;
}

export interface SEOProps {
  /** Primary <title> tag */
  title: string;
  /** <meta name="description"> — keep under 160 chars */
  description: string;
  /** Canonical URL (absolute, e.g. https://akcni-letenky.com/levne-letenky) */
  canonical?: string;
  /** Open Graph title (falls back to title) */
  ogTitle?: string;
  /** Open Graph description (falls back to description) */
  ogDescription?: string;
  /** Open Graph image URL */
  ogImage?: string;
  /** Page keywords (optional, minor SEO weight) */
  keywords?: string;
  /** Set noindex — use for 404, admin, thin pages */
  noindex?: boolean;
  /** Additional JSON-LD structured data blocks */
  structuredData?: StructuredDataItem[];
  /** Language override (default "cs") */
  lang?: string;
}

export default function SEO({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  keywords,
  noindex,
  structuredData,
  lang = "cs",
}: SEOProps) {
  const siteName = "Akční Letenky";
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  const ogImg =
    ogImage ||
    "https://www.akcni-letenky.com/hero-bg.jpg";
  const ogTitleFinal = ogTitle || title;
  const ogDescFinal = ogDescription || description;
  const canonicalUrl = canonical || "https://www.akcni-letenky.com/";

  return (
    <Helmet>
      <html lang={lang} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Robots */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
      )}

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={ogTitleFinal} />
      <meta property="og:description" content={ogDescFinal} />
      <meta property="og:image" content={ogImg} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="cs_CZ" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={ogTitleFinal} />
      <meta name="twitter:description" content={ogDescFinal} />
      <meta name="twitter:image" content={ogImg} />

      {/* Global Organization schema (every page) */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TravelAgency",
          "@id": "https://www.akcni-letenky.com/#organization",
          "name": "Akční Letenky",
          "alternateName": "AkcniLetenky.com",
          "url": "https://www.akcni-letenky.com",
          "logo": "https://www.akcni-letenky.com/logo.png",
          "description": "Nejlevnější letenky po celém světě. Najděte si tu nejlepší nabídku pro vaši dovolenou s úsporou až 60%.",
          "sameAs": [
            "https://www.facebook.com/akcniletenky",
            "https://www.instagram.com/akcniletenky"
          ]
        })}
      </script>

      {/* WebSite schema with SearchAction (every page) */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": "https://www.akcni-letenky.com/#website",
          "url": "https://www.akcni-letenky.com",
          "name": "Akční Letenky",
          "description": "Nejlevnější letenky z Prahy i ČR. Akční a last minute letenky s úsporou až 80%.",
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://www.akcni-letenky.com/levne-letenky?destination={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          }
        })}
      </script>

      {/* Page-specific structured data */}
      {structuredData?.map((data, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
}
