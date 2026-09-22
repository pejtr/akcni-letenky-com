/**
 * SEO component — centralized Helmet wrapper for meta tags, OG, and structured data.
 */
import { Helmet } from "react-helmet";

export interface StructuredDataItem {
  "@context": string;
  "@type": string;
  [key: string]: unknown;
}

export interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  keywords?: string;
  noindex?: boolean;
  structuredData?: StructuredDataItem[];
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
  const ogImg = ogImage || "https://www.akcni-letenky.com/hero-bg.jpg";
  const canonicalUrl = canonical || "https://www.akcni-letenky.com/";

  return (
    <Helmet>
      <html lang={lang} />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />

      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:image" content={ogImg} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="cs_CZ" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={ogTitle || title} />
      <meta name="twitter:description" content={ogDescription || description} />
      <meta name="twitter:image" content={ogImg} />

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "@id": "https://www.akcni-letenky.com/#organization",
          name: "Akční Letenky",
          alternateName: "Akcni-Letenky.com",
          url: "https://www.akcni-letenky.com",
          logo: "https://www.akcni-letenky.com/logo-akcni-letenky.png",
          description:
            "Nezávislý portál pro objevování akčních letenek a cestovatelských tipů. Rezervace probíhají u partnerských prodejců.",
        })}
      </script>

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": "https://www.akcni-letenky.com/#website",
          url: "https://www.akcni-letenky.com",
          name: "Akční Letenky",
          description:
            "Přehled akčních letenek, dovolených a cestovatelských tipů pro české cestovatele.",
          publisher: { "@id": "https://www.akcni-letenky.com/#organization" },
        })}
      </script>

      {structuredData?.map((data, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
}
