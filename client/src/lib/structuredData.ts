/**
 * JSON-LD Structured Data Utilities
 * Generates schema.org structured data for SEO
 */

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface ArticleData {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified: string;
  image: string;
  url: string;
}

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": "Akční Letenky",
    "alternateName": "AkcniLetenky.com",
    "url": "https://www.akcni-letenky.com",
    "logo": "https://www.akcni-letenky.com/logo.png",
    "description": "Nejlevnější letenky po celém světě. Najděte si tu nejlepší nabídku pro vaši dovolenou s úsporou až 60%.",
    "telephone": "+420123456789",
    "email": "info@akcni-letenky.com",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "CZ",
      "addressLocality": "Praha"
    },
    "sameAs": [
      "https://www.facebook.com/akcniletenky",
      "https://www.instagram.com/akcniletenky",
      "https://twitter.com/akcniletenky"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "2847"
    }
  };
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `https://www.akcni-letenky.com${item.url}`
    }))
  };
}

/**
 * Generate FAQPage schema
 */
export function generateFAQSchema(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

/**
 * Generate Article schema for blog posts
 */
export function generateArticleSchema(article: ArticleData) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.description,
    "image": article.image,
    "author": {
      "@type": "Organization",
      "name": article.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Akční Letenky",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.akcni-letenky.com/logo.png"
      }
    },
    "datePublished": article.datePublished,
    "dateModified": article.dateModified,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": article.url
    }
  };
}

/**
 * Generate Product/Offer schema for flight deals
 */
export function generateFlightOfferSchema(params: {
  destination: string;
  price: number;
  currency: string;
  departureDate: string;
  returnDate?: string;
  airline: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `Letenky do ${params.destination}`,
    "description": `Akční letenky do ${params.destination} s ${params.airline}`,
    "offers": {
      "@type": "Offer",
      "price": params.price,
      "priceCurrency": params.currency,
      "availability": "https://schema.org/InStock",
      "validFrom": new Date().toISOString(),
      "url": params.url,
      "seller": {
        "@type": "Organization",
        "name": params.airline
      }
    },
    "brand": {
      "@type": "Brand",
      "name": params.airline
    }
  };
}

/**
 * Inject JSON-LD script into document head
 */
export function injectStructuredData(data: object) {
  if (typeof window === "undefined") return;

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.text = JSON.stringify(data);
  document.head.appendChild(script);
}

/**
 * Remove all existing JSON-LD scripts (for cleanup)
 */
export function removeAllStructuredData() {
  if (typeof window === "undefined") return;

  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  scripts.forEach(script => script.remove());
}
