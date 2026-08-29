import { lazy, Suspense, useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useABTest } from "@/lib/abTest";
import HeroVariantA from "@/components/HeroVariantA";
import HeroVariantB from "@/components/HeroVariantB";
import { ChevronRight, Plane } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { pelikanDeepLink } from "@shared/affiliateLinks";

import NewsletterBar from "@/components/NewsletterBar";
import FacebookCampaignBanner from "@/components/FacebookCampaignBanner";
import OptimizedImage from "@/components/OptimizedImage";

import MobileMenu from "@/components/MobileMenu";
import TopFlightsThisWeek from "@/components/TopFlightsThisWeek";
import PelikanPrimaryDeals from "@/components/PelikanPrimaryDeals";
import CrossPromoSlot from "@/components/CrossPromoSlot";
import FloatingCta from "@/components/FloatingCta";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { returnFlights, countries, cities, topDestinations } from "@/data/destinations";
import { useWishlist } from "@/hooks/useWishlist";
import { Heart, Award, Bell, BookOpen, ArrowRight } from "lucide-react";
import { useCtaAbTest } from "@/hooks/useCtaAbTest";
import { useClickTracking } from "@/hooks/useClickTracking";
import { useConversionTracking } from "@/hooks/useConversionTracking";
import { useTicketCountdown } from "@/hooks/useTicketCountdown";
import TravelQuizWidget from "@/components/TravelQuizWidget";
import PelikanSearchWidget from "@/components/PelikanSearchWidget";
import SEO from "@/components/SEO";
import { generateFAQSchema } from "@/lib/structuredData";


const ChatbotWidget = lazy(() => import("@/components/ChatbotWidget"));
const OmioSection = lazy(() => import("@/components/OmioSection"));
const PersonalizedSection = lazy(() => import("@/components/PersonalizedSection"));
const GdprConsentBanner = lazy(() => import("@/components/GdprConsentBanner"));
const PriceAlertModal = lazy(() => import("@/components/PriceAlertModal"));

// City slug mapping for tracking/search attribution
const cityToSlug: Record<string, string> = {
  "barcelona": "barcelona-spain",
  "londýn": "london-united-kingdom",
  "london": "london-united-kingdom",
  "paříž": "paris-france",
  "paris": "paris-france",
  "řím": "rome-italy",
  "rome": "rome-italy",
  "new york": "new-york-city-new-york-united-states",
  "amsterdam": "amsterdam-netherlands",
  "berlín": "berlin-germany",
  "berlin": "berlin-germany",
  "vídeň": "vienna-austria",
  "vienna": "vienna-austria",
  "madrid": "madrid-spain",
  "lisabon": "lisbon-portugal",
  "lisbon": "lisbon-portugal",
  "dubaj": "dubai-united-arab-emirates",
  "dubai": "dubai-united-arab-emirates",
  "bangkok": "bangkok-thailand",
  "tokio": "tokyo-japan",
  "tokyo": "tokyo-japan",
  "mallorka": "palma-mallorca-spain",
  "mallorca": "palma-mallorca-spain",
  "tenerife": "tenerife-spain",
  "kréta": "heraklion-greece",
  "crete": "heraklion-greece",
  "rhodos": "rhodes-greece",
  "rhodes": "rhodes-greece",
  "turecko": "antalya-turkey",
  "antalya": "antalya-turkey",
  "egypt": "hurghada-egypt",
  "hurghada": "hurghada-egypt",
  "milán": "milan-italy",
  "milan": "milan-italy",
  "benátky": "venice-italy",
  "venice": "venice-italy",
  "praha": "prague-czech-republic",
  "prague": "prague-czech-republic",
};

function FooterNewsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-6 mb-6 text-center shadow-xl animate-in zoom-in-95 duration-300">
        <p className="text-lg font-black mb-1">✓ Přihlášeno k odběru! Děkujeme</p>
        <p className="text-xs opacity-90 mb-4">Brzy vám pošleme první akční letenky na e-mail.</p>
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
          <p className="text-xs font-bold mb-2">🎁 BONUS: Chcete mít nabídky ihned na WhatsAppu?</p>
          <a
            href="https://chat.whatsapp.com/KG1IqrQclfY6NOgkmgs6ml"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebd56] text-white font-bold px-6 py-2.5 rounded-full text-xs shadow-md transition-transform hover:scale-105"
          >
            <span>Připojit se k WhatsApp skupině →</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-[#FFD700] to-[#FFC107] rounded-xl p-5 mb-6">
      <h3 className="text-base font-bold text-[#003087] mb-1 text-center">📧 Nechte si posílat nejlepší nabídky</h3>
      <p className="text-xs text-[#003087]/70 text-center mb-3">Připojte se k 12 340+ cestovatelům</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (email && email.includes("@")) {
            setSubmitted(true);
          }
        }}
        className="flex gap-2 max-w-md mx-auto"
      >
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vas@email.cz"
          className="flex-1 h-10 px-4 rounded-full border-2 border-white bg-white/90 text-sm placeholder:text-gray-400 focus:outline-none focus:border-[#1565C0]"
          required
        />
        <button type="submit" className="bg-[#E91E63] hover:bg-[#C2185B] text-white font-bold px-5 py-2 rounded-full text-sm whitespace-nowrap transition-colors">
          Odebírat
        </button>
      </form>
    </div>
  );
}

export default function Home() {
  // A/B Test for hero section
  const heroVariant = useABTest("hero_redesign");
  const { toggleWishlist, isInWishlist, wishlistCount } = useWishlist();

  // CTA A/B Tests
  const { ctaVariant: featuredCta, trackClick: trackFeaturedClick } = useCtaAbTest("featured_cta");
  const { ctaVariant: footerCta, trackClick: trackFooterClick } = useCtaAbTest("footer_cta");
  const { ctaVariant: stickyCta, trackClick: trackStickyClick } = useCtaAbTest("sticky_banner");
  const { ctaVariant: reservationCta, trackClick: trackReservationClick } = useCtaAbTest("reservation_button");
  // Dynamic ticket countdown for urgency
  const ticketCount = useTicketCountdown();
  // Click heatmap tracking
  useClickTracking(true);
  // Conversion funnel tracking
  const { trackAffiliateClick: trackFunnelAffiliateClick, trackDestinationView: trackFunnelDestView, trackSearch: trackFunnelSearch } = useConversionTracking();

  const [isScrolled, setIsScrolled] = useState(false);
  const [showBottomBanner, setShowBottomBanner] = useState(false);
  const [stickyBannerDismissed, setStickyBannerDismissed] = useState(false);
  const [showDeferredEnhancements, setShowDeferredEnhancements] = useState(false);
  const [priceAlertModal, setPriceAlertModal] = useState<{
    isOpen: boolean;
    destination: string;
    slug: string;
    price: number;
  }>({ isOpen: false, destination: "", slug: "", price: 0 });

  // Search form state
  const [origin, setOrigin] = useState("prague");
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [duration, setDuration] = useState("1week");
  const [passengers, setPassengers] = useState("1");

  // Affiliate click tracking
  const trackClickMutation = trpc.affiliate.trackClick.useMutation();

  const buildPelikanSearchUrl = (campaign: string, content?: string) =>
    pelikanDeepLink("/cs/akcni-letenky", {
      campaign,
      channel: "homepage",
      content,
    });

  const buildPelikanVacationUrl = (campaign: string, content?: string) =>
    pelikanDeepLink("/cs/pobyty", {
      campaign,
      channel: "homepage",
      content,
    });

  // Helper function to track affiliate clicks
  const trackAffiliateClick = (
    dest: string,
    destSlug: string,
    source: string,
    url: string,
    partner: "pelikan" | "kiwi" | "internal" = "pelikan"
  ) => {
    trackClickMutation.mutate({
      destination: dest,
      destinationSlug: destSlug,
      source: source,
      affiliatePartner: partner,
      affiliateUrl: url,
    });
  };

  // Handle search - redirect to Pelikan.cz with affiliate tracking
  const handleSearch = () => {
    const destLower = destination.toLowerCase().trim();
    const destSlug = cityToSlug[destLower] || destLower.replace(/\s+/g, "-") || "all";
    const pelikanUrl = buildPelikanSearchUrl("homepage-search", `${destSlug}-${duration}-${passengers}`);

    // Track the search event (Meta Pixel Search event)
    trackFunnelSearch(destination, "prague");

    // Track the click
    trackAffiliateClick(destination, destSlug, "search", pelikanUrl, "pelikan");
    trackFunnelAffiliateClick(destination);

    // Open in new tab
    window.open(pelikanUrl, "_blank");
  };

  // Dynamic meta tags and document title for SEO
  useEffect(() => {
    document.title = "Akční Letenky: levné letenky z Prahy a last minute lety | Akcni-letenky.com";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', "Hledejte akční letenky z Prahy, Vídně i Polska od 590 Kč. Porovnáváme ověřené promo tarify aerolinek denně.");
    }
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', "akční letenky, levné letenky, letenky praha, last minute letenky, nízkonákladové lety");
    }
  }, []);

  // Handle scroll for sticky navigation and bottom banner
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);

      // Calculate scroll percentage for bottom banner
      // Once banner appears (after 50% scroll), it stays visible permanently
      if (!showBottomBanner) {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (window.scrollY / scrollHeight) * 100;
        if (scrollPercent > 50) {
          setShowBottomBanner(true);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showBottomBanner]);

  // Check if sticky banner was dismissed recently (auto-restore after 30 min)
  useEffect(() => {
    const dismissed = sessionStorage.getItem("sticky-banner-dismissed");
    if (dismissed) {
      const elapsed = Date.now() - parseInt(dismissed);
      if (elapsed < 30 * 60 * 1000) {
        setStickyBannerDismissed(true);
      }
    }
  }, []);

  const dismissStickyBanner = () => {
    setStickyBannerDismissed(true);
    sessionStorage.setItem("sticky-banner-dismissed", Date.now().toString());
  };

  useEffect(() => {
    const win = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (win.requestIdleCallback) {
      const idleId = win.requestIdleCallback(() => setShowDeferredEnhancements(true), { timeout: 2500 });
      return () => win.cancelIdleCallback?.(idleId);
    }

    const timeoutId = window.setTimeout(() => setShowDeferredEnhancements(true), 1500);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("cs-CZ").format(price) + " Kč";
  };

  // Use imported destination data
  const popularDestinations = returnFlights.map(dest => ({
    city: dest.name,
    price: dest.price,
    country: dest.country,
    image: dest.image
  }));

  // Featured European cities with correct images and Pelikan.cz affiliate links
  const featuredCities = [
    {
      from: "Praha",
      to: "Londýn",
      price: 733,
      description: "Londýn – obchodní i kulturní centrum plné příležitostí a zážitků.",
      image: "/destinations/london.jpg",
      pelikanUrl: "https://www.pelikan.cz/cs/akcni-letenky/AT:LON,S:PRI?a_aid=levne-letenky"
    },
    {
      from: "Praha",
      to: "Paříž",
      price: 1027,
      description: "Město lásky, umění, módy i gastronomie.",
      image: "/destinations/paris.jpg",
      pelikanUrl: "https://www.pelikan.cz/cs/akcni-letenky/AT:PAR,S:PRI?a_aid=levne-letenky"
    },
    {
      from: "Praha",
      to: "Řím",
      price: 712,
      description: "Věčné město – památky, historie a skvělé jídlo.",
      image: "/destinations/rome.jpg",
      pelikanUrl: "https://www.pelikan.cz/cs/akcni-letenky/AT:ROM,S:PRI?a_aid=levne-letenky"
    },
    {
      from: "Praha",
      to: "Barcelona",
      price: 946,
      description: "Gaudí, tapas a městské pláže. Skvělá volba po celý rok.",
      image: "/destinations/barcelona.jpg",
      pelikanUrl: "https://www.pelikan.cz/cs/akcni-letenky/AT:BCN,S:PRI?a_aid=levne-letenky"
    },
  ];

  // FAQ data for rich snippets
  const faqData = [
    {
      question: "Jak najít nejlevnější letenky?",
      answer: "Nejlevnější letenky najdete porovnáním cen napříč aerolinkami. Doporučujeme rezervovat 2-3 měsíce předem, být flexibilní s daty a využívat naše denní akční nabídky. Sledujte také naši FB skupinu s 33 500 členy pro exkluzivní tipy."
    },
    {
      question: "Jsou uvedené ceny konečné?",
      answer: "Ano, zobrazené ceny jsou obvykle konečné včetně daní a poplatků. Další služby jako zavazadla, výběr sedadla nebo strava mohou být zpoplatněny zvlášť u dopravce nebo agentury."
    },
    {
      question: "Jak funguje rezervace letenek?",
      answer: "Po výběru letu vás přesměrujeme na web partnera (Pelikán, Kiwi.com), kde dokončíte rezervaci. Platba probíhá přímo u partnera, který zajistí vystavení letenek a potvrzení."
    },
    {
      question: "Mohu letenku stornovat nebo změnit?",
      answer: "Podmínky storna a změn závisí na tarifu a aerolince. Levné tarify jsou obvykle nevratné, dražší tarify umožňují změny za poplatek. Doporučujeme cestovní pojištění pro případ nečekaných událostí."
    },
    {
      question: "Kdy je nejlepší čas na nákup letenek?",
      answer: "Obecně platí: čím dříve, tím levněji. Pro evropské destinace rezervujte 1-2 měsíce předem, pro dálkové lety 3-6 měsíců. Last minute nabídky mohou být výhodné, ale výběr je omezený."
    },
    {
      question: "Jaké dokumenty potřebuji k cestě?",
      answer: "Pro cesty po EU stačí občanský průkaz. Pro mimoevropské destinace potřebujete platný cestovní pas (minimálně 6 měsíců platnosti). Některé země vyžadují víza - ověřte si požadavky před cestou."
    }
  ];

  // Airlines data with correct logos and slugs for internal pages
  const airlines = [
    { name: "Austrian Airlines", logo: "/airlines/austrian.png", slug: "austrian-airlines" },
    { name: "Emirates", logo: "/airlines/emirates.png", slug: "emirates" },
    { name: "Qatar Airways", logo: "/airlines/qatar.jpg", slug: "qatar-airways" },
    { name: "Ryanair", logo: "/airlines/ryanair.png", slug: "ryanair" },
    { name: "Air France", logo: "/airlines/airfrance.jpg", slug: "air-france" },
    { name: "Lufthansa", logo: "/airlines/lufthansa.png", slug: "lufthansa" },
    { name: "Icelandair", logo: "/airlines/icelandair.png", slug: "icelandair" },
    { name: "Turkish Airlines", logo: "/airlines/turkish.png", slug: "turkish-airlines" },
    { name: "KLM", logo: "/airlines/klm.jpeg", slug: "klm" },
    { name: "British Airways", logo: "/airlines/british.png", slug: "british-airways" },
    { name: "Wizz Air", logo: "/airlines/wizz.png", slug: "wizz-air" },
    { name: "LOT", logo: "/airlines/lot.jpg", slug: "lot" },
  ];

  const handleSearchVariantA = (destination: string, passengers: number) => {
    const destSlug = destination.toLowerCase().trim().replace(/\s+/g, "-") || "all";
    window.location.href = buildPelikanSearchUrl("hero-search-a", `${destSlug}-${passengers}`);
  };

  const handleSearchVariantB = (from: string, destination: string, duration: string, passengers: number) => {
    const destSlug = destination.toLowerCase().trim().replace(/\s+/g, "-") || "all";
    window.location.href = pelikanDeepLink("/cs/akcni-letenky", {
      campaign: "hero-search-b",
      channel: "homepage",
      content: `${from}-${destSlug}-${duration}-${passengers}`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="🔥 Nejlevnější Akční a Last Minute Letenky (Slevy až 80%)"
        description="Dnes aktualizováno! Ulovte ty nejlepší last minute a akční letenky z Prahy i Vídně kamkoliv do světa. Porovnáváme skryté nabídky s garantovanou slevou."
        canonical="https://www.akcni-letenky.com/"
        structuredData={[
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Domů", "item": "https://www.akcni-letenky.com/" }
            ]
          },
          generateFAQSchema([
            {
              question: "Kde najdu nejlevnější last minute letenky z Prahy kamkoliv?",
              answer: "Na portálu Akční-Letenky.com denně porovnáváme nejvýhodnější last minute akční nabídky letenek z Prahy (PRG) i ostatních letišť v okolí. Nabídky se slevou až 80% aktualizujeme v reálném čase."
            },
            {
              question: "Jak vyhledat nejlevnější akční letenky kamkoliv?",
              answer: "Při vyhledávání zvolte jako odletové místo Praha a jako cíl ponechte pole 'Kamkoliv'. Náš srovnávač vám okamžitě zobrazí nejlevnější letenky seřazené od nejnižší ceny bez ohledu na destinaci."
            },
            {
              question: "Jak najít nejlevnější letenky?",
              answer: "Nejlevnější letenky najdete porovnáním cen napříč aerolinkami. Doporučujeme rezervovat 2-3 měsíce předem, být flexibilní s daty a využívat naše denní akční nabídky. Sledujte také naši FB skupinu s 33 500 členy pro exkluzivní tipy."
            },
            {
              question: "Jsou uvedené ceny konečné?",
              answer: "Ano, zobrazené ceny jsou obvykle konečné včetně daní a poplatků. Další služby jako zavazadla, výběr sedadla nebo strava mohou být zpoplatněny zvlášť u dopravce nebo agentury."
            },
            {
              question: "Kdy je nejlepší čas na nákup last minute letenek?",
              answer: "Last minute letenky z Prahy se nejvíce vyplatí kupovat 1 až 14 dní před odletem. Dopravci v tomto období doprodávají neobsazená místa v letadlech i charterových letech za výrazně snížené ceny."
            }
          ])
        ]}
      />

      {/* Breadcrumbs with Schema.org */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Domů",
              "item": "https://www.akcni-letenky.com/"
            }
          ]
        })}
      </script>
      {/* Top promo banner - Čedok style */}
      <div className={cn(
        "fixed top-0 left-0 right-0 z-50 bg-[#E91E63] text-white text-center text-xs py-1.5 px-4 transition-all duration-300",
        isScrolled ? "-translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"
      )}>
        <div className="flex items-center justify-center gap-3">
          <span className="font-semibold">🔥 AKCE: PRÁVĚ JSME ZLEVNILI VYBRANÉ LETENKY — SLEVY AŽ 80 %</span>
          <a href={buildPelikanSearchUrl("promo-banner")} target="_blank" rel="noopener"
            className="bg-white text-[#E91E63] font-bold px-3 py-0.5 rounded-full text-xs hover:bg-gray-100 transition-colors"
            onClick={() => trackStickyClick()}>
            REZERVUJTE TEĎ!
          </a>
        </div>
      </div>

      {/* Sticky Navigation Header - Čedok.cz style: white bg, blue text */}
      <header role="banner"
        className={cn(
          "fixed left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-100 transition-all duration-300",
          isScrolled ? "top-0 py-2" : "top-8 py-2"
        )}
      >
        <div className="container flex items-center justify-between gap-4">
          {/* Logo */}
          <a href="/" className="flex items-center gap-1.5 flex-shrink-0">
            <img
              src="/logo-akcni-letenky.png"
              alt="Akční Letenky"
              className="h-9 md:h-10 lg:h-11 w-auto"
            />
          </a>

          {/* Main Navigation - Čedok style */}
          <nav role="navigation" aria-label="Main navigation" className="hidden lg:flex items-center gap-0.5 flex-shrink">
            <Link href="/levne-letenky" className="text-sm text-gray-700 hover:text-[#1565C0] hover:bg-blue-50 transition-colors font-medium flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-md">
              <Plane className="w-4 h-4" /> Last Minute
            </Link>
            <Link href="/dovolene" className="text-sm text-gray-700 hover:text-[#1565C0] hover:bg-blue-50 transition-colors font-medium flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-md">
              ☀️ Dovolená
            </Link>
            <Link href="/levne-letenky" className="text-sm text-gray-700 hover:text-[#1565C0] hover:bg-blue-50 transition-colors font-medium flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-md">
              ✈️ Letenky
            </Link>
            <a href="#airlines" className="text-sm text-gray-700 hover:text-[#1565C0] hover:bg-blue-50 transition-colors font-medium flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-md">
              🏢 Aerolinky
            </a>
            <Link href="/vlaky-autobusy" className="text-sm text-gray-700 hover:text-[#1565C0] hover:bg-blue-50 transition-colors font-medium flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-md">
              🚆 Vlaky
            </Link>
            <Link href="/tipy-pro-cestovatele" className="text-sm text-gray-700 hover:text-[#1565C0] hover:bg-blue-50 transition-colors font-medium flex items-center gap-1.5 whitespace-nowrap px-3 py-2 rounded-md">
              💡 Tipy
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Hamburger Menu - shown below lg */}
            <div className="lg:hidden">
              <MobileMenu />
            </div>

            {/* Wishlist Heart Icon with Badge */}
            <Link
              href="/wishlist"
              className="relative text-gray-500 hover:text-[#E91E63] transition-colors inline-block p-2"
              aria-label="Oblíbené"
              title="Oblíbené"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* CTA Button - Čedok style: blue rounded */}
            <a
              href={buildPelikanSearchUrl("header-cta")}
              target="_blank"
              rel="noopener"
              className="hidden md:flex items-center gap-1.5 bg-[#1565C0] hover:bg-[#0d47a1] text-white px-4 py-2 rounded-full transition-colors whitespace-nowrap font-semibold text-sm shadow-sm"
              onClick={() => trackReservationClick()}
            >
              <Plane className="w-3.5 h-3.5 flex-shrink-0" />
              <span>ZAREZERVOVAT TEĎ</span>
            </a>
          </div>
        </div>
      </header>

      {/* A/B Test: Hero Section */}
      {heroVariant === 'A' ? (
        <HeroVariantA onSearch={handleSearchVariantA} />
      ) : (
        <HeroVariantB onSearch={handleSearchVariantB} />
      )}
      {/* Blue Info Banner */}
      <div className="bg-gradient-to-r from-[#1976D2] to-[#2196F3] py-4 shadow-md mt-16">
        <div className="container">
          <div className="flex flex-wrap items-center justify-center gap-6 text-white text-sm md:text-base font-medium">
            <a href="https://www.pelikan.cz/cs/pobyty/s-pelikanem/?a_aid=levne-letenky" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
              <b>Dovolená se slevou až 80 %</b>
            </a>
            <span className="text-white/60">|</span>
            <a href="https://www.pelikan.cz/cs/pobyty/kategorie/104/?a_aid=levne-letenky" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
              Eurovíkendy
            </a>
            <span className="text-white/60">|</span>
            <a href="https://www.pelikan.cz/cs/ubytovani/?a_aid=levne-letenky" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
              Hotely
            </a>
            <span className="text-white/60">|</span>
            <a href="https://www.pelikan.cz/cs/akcni-letenky/LP:0_1500,S:PRI?a_aid=levne-letenky" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
              Nejlevnější letenky <b>od 590 Kč</b>
            </a>
          </div>
        </div>
      </div>

      <PelikanPrimaryDeals />

      {/* Featured European Cities */}
      <section aria-labelledby="featured-cities" className="py-10 bg-[#F0F4F8]">
        <div className="container">
          <h2 id="featured-cities" className="text-2xl md:text-3xl font-bold text-center mb-8 text-[#003087]">
            Nejlevnější letenky do evropských metropolí
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCities.map((city, index) => {
              // Simple slug for internal landing pages
              const simpleSlug = city.to.toLowerCase().replace(/\s+/g, "-").replace(/ý/g, "y").replace(/í/g, "i").replace(/ř/g, "r");
              const internalUrl = `/${simpleSlug}`;
              return (
                <div key={index} className="relative">
                  <a
                    href={internalUrl}
                    rel="noopener"
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 block group"
                    onClick={() => { trackAffiliateClick(city.to, simpleSlug, "featured", internalUrl, "internal"); trackFunnelAffiliateClick(city.to); }}
                  >
                    <div className="relative h-48 overflow-hidden">
                      {/* Gold "Nejprodávanější" Badge for top 3 */}
                      {index < 3 && (
                        <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 text-xs">
                          <Award className="w-4 h-4" />
                          Nejprodávanější
                        </div>
                      )}
                      <div
                        className="h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                        style={{ backgroundImage: `url(${city.image})` }}
                        role="img"
                        aria-label={`Fotografie ${city.to}`}
                      />
                      {/* Airplane overlay on hover */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <svg className="w-16 h-16 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                        </svg>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-xl mb-2 text-center">
                        Letenky do <span className="text-[#003087]">{city.to}</span>
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 text-center min-h-[40px]">
                        {city.description}
                      </p>
                      <div className="flex items-center justify-center gap-3 mb-3">
                        <div className="bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white font-bold rounded-lg px-5 py-3 text-center shadow-md text-2xl whitespace-nowrap">
                          od {formatPrice(city.price)}
                        </div>
                        <div className="text-gray-400 line-through text-base">
                          od {formatPrice(Math.round(city.price * 1.4))}
                        </div>
                      </div>
                    </div>
                  </a>
                  {/* Wishlist Heart Icon */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(`city_${city.to.toLowerCase()}`);
                    }}
                    className="absolute top-3 right-3 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition-all duration-200 hover:scale-110"
                    aria-label={isInWishlist(`city_${city.to.toLowerCase()}`) ? `Odebrat ${city.to} ze seznamu přání` : `Přidat ${city.to} do seznamu přání`}
                  >
                    <Heart
                      className={cn(
                        "w-5 h-5 transition-colors",
                        isInWishlist(`city_${city.to.toLowerCase()}`)
                          ? "fill-red-500 text-red-500"
                          : "text-gray-600 hover:text-red-500"
                      )}
                    />
                  </button>
                  {/* Price Alert Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const destSlug = cityToSlug[city.to.toLowerCase()] || city.to.toLowerCase().replace(/\s+/g, "-");
                      setPriceAlertModal({
                        isOpen: true,
                        destination: city.to,
                        slug: destSlug,
                        price: city.price,
                      });
                    }}
                    className="absolute top-14 right-3 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition-all duration-200 hover:scale-110"
                    aria-label={`Hlídat cenu letenky do ${city.to}`}
                    title="Hlídat cenu"
                  >
                    <Bell className="w-5 h-5 text-orange-500 hover:text-orange-600" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Nejprodávanější letenky tento týden */}
      <section aria-labelledby="top-this-week" className="py-12 bg-white">
        <div className="container">
          {/* Section Title */}
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-r from-[#FF5722] to-[#E91E63] py-3 px-6 rounded-lg shadow-lg">
              <h2 id="top-this-week" className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                🔥 Nejlepší last minute letenky tohoto týdne
              </h2>
            </div>
          </div>

          <TopFlightsThisWeek />

          {/* Official Pelikan Search Widget */}
          <PelikanSearchWidget departures="PRG" />
        </div>
      </section>

      {/* Travel Quiz Widget - Budget & Style recommendation */}
      <section className="py-6 bg-white">
        <div className="container">
          <TravelQuizWidget />
        </div>
      </section>

      {/* Kam letět z Prahy? - Interaktivní mapa cen letů */}
      <HomeFlightMapSection />

      {/* Tipy pro cestovatele - 3 nejnovější články */}
      <HomeTipsWidget />

      {/* Personalized Recommendations */}
      <Suspense fallback={null}>
        <PersonalizedSection />
      </Suspense>

      {/* Zpáteční levné letenky Grid */}
      <section aria-labelledby="return-flights" className="py-12 bg-[#F5F7FA]">
        <div className="container">
          {/* Yellow Banner Title */}
          <div className="flex justify-center mb-12">
            <div className="bg-gradient-to-r from-[#FFD700] to-[#FFC107] py-4 px-8 rounded-2xl shadow-lg">
              <h2 id="return-flights" className="text-3xl md:text-4xl font-black text-[#003087] text-center">
                ✈️ Zpáteční levné letenky
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {returnFlights.map((dest, index) => {
              const pelikanUrl = dest.pelikanUrl || `https://www.pelikan.cz/cs/akcni-letenky?a_aid=levne-letenky&utm_source=akcni-letenky&utm_medium=grid&utm_campaign=${dest.slug}`;
              const redirectUrl = `/redirect?url=${encodeURIComponent(pelikanUrl)}&dest=${encodeURIComponent(dest.name)}`;
              const discountPercent = Math.round(26 + (index * 3) % 12);
              return (
                <a
                  key={index}
                  href={redirectUrl}
                  className="relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden flex flex-col"
                  onClick={() => { trackAffiliateClick(dest.name, dest.slug, "grid", pelikanUrl); trackFunnelAffiliateClick(dest.name); }}
                >
                  {/* Discount Badge */}
                  <div className="absolute top-2 right-2 z-10 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    -{discountPercent}%
                  </div>

                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <OptimizedImage
                      src={dest.image}
                      alt={`${dest.name}, ${dest.country}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                      decoding="async"
                      fetchPriority={index < 4 ? "high" : "low"}
                      fallbackSrc="/destinations/paris.jpg"
                    />
                    {/* CTA overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-orange-600/90 to-orange-500/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-1">
                      <span className="text-white font-bold text-sm px-3 py-2 bg-white/20 rounded-full backdrop-blur-sm border border-white/30">
                        {featuredCta.emoji} {featuredCta.text}
                      </span>
                      {featuredCta.subtext && (
                        <span className="text-white/90 text-xs font-medium">{featuredCta.subtext}</span>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3 md:p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-base md:text-lg text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                      {dest.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">{dest.country}</p>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-lg md:text-xl font-bold text-orange-600 whitespace-nowrap">od {formatPrice(dest.price)}</span>
                      <span className="text-xs text-gray-400 line-through">od {formatPrice(Math.round(dest.price * 1.35))}</span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground text-center mt-8 max-w-4xl mx-auto">
            * Uvedené ceny jsou obvykle za zpáteční lety včetně poplatků. Další služby (zavazadla apod.) mohou být zpoplatněny u dopravce/agentury.
          </p>
        </div>
      </section>

      {/* Tabbed Sections: Státy, Města, Letecké společnosti, Top destinace */}
      <section aria-labelledby="browse-destinations" className="py-12 bg-white">
        <div className="container">
          <h2 id="browse-destinations" className="text-2xl md:text-3xl font-bold text-center mb-8 text-[#003087]">
            Kamkoliv za teplem: Exotika a dálkové lety
          </h2>
          <Tabs defaultValue="states" className="w-full">
            <TabsList className="flex w-full max-w-3xl mx-auto mb-8 overflow-x-auto gap-1 sm:grid sm:grid-cols-4">
              <TabsTrigger value="states">Státy</TabsTrigger>
              <TabsTrigger value="cities">Města</TabsTrigger>
              <TabsTrigger value="airlines">Letecké společnosti</TabsTrigger>
              <TabsTrigger value="top">Top destinace</TabsTrigger>
            </TabsList>

            {/* Státy Tab */}
            <TabsContent value="states" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {countries.map((country, index) => {
                  const seoUrl = buildPelikanSearchUrl("homepage-states-tab", country.slug);
                  return (
                    <a
                      key={index}
                      href={seoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden border border-gray-100"
                      onClick={() => { trackAffiliateClick(country.name, country.slug, "states-tab", seoUrl); trackFunnelAffiliateClick(country.name); }}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={country.image}
                          alt={country.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                          <h3 className="font-bold text-lg">{country.name}</h3>
                          <p className="text-sm text-white/90">{country.description}</p>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </TabsContent>

            {/* Města Tab */}
            <TabsContent value="cities" className="mt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {cities.map((city, index) => {
                  const seoUrl = buildPelikanSearchUrl("homepage-cities-tab", city.slug);
                  return (
                    <a
                      key={index}
                      href={seoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden border border-gray-100 p-3"
                      onClick={() => { trackAffiliateClick(city.name, city.slug, "cities-tab", seoUrl); trackFunnelAffiliateClick(city.name); }}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={city.image}
                          alt={city.name}
                          className="w-12 h-12 rounded-md object-cover flex-shrink-0"
                          loading="lazy"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                            {city.name}
                          </h3>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </TabsContent>

            {/* Letecké společnosti Tab */}
            <TabsContent value="airlines" className="mt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
                {airlines.map((airline, index) => {
                  const pelikanUrl = buildPelikanSearchUrl("homepage-airlines-tab", airline.slug);
                  return (
                    <a
                      key={index}
                      href={pelikanUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-5 flex flex-col items-center gap-3 group"
                      onClick={() => { trackAffiliateClick(airline.name, airline.slug, "airlines-tab", pelikanUrl); trackFunnelAffiliateClick(airline.name); }}
                    >
                      <img
                        src={airline.logo}
                        alt={`${airline.name} logo`}
                        className="w-28 h-28 md:w-32 md:h-32 object-contain flex-shrink-0"
                        loading="lazy"
                      />
                      <span className="text-sm md:text-base font-medium text-blue-600 group-hover:underline text-center">
                        {airline.name}
                      </span>
                    </a>
                  );
                })}
              </div>
            </TabsContent>

            {/* Top destinace Tab */}
            <TabsContent value="top" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {topDestinations.map((dest, index) => {
                  const pelikanUrl = buildPelikanVacationUrl("top-destinations", dest.slug);
                  return (
                    <a
                      key={index}
                      href={pelikanUrl}
                      target="_blank"
                      rel="noopener"
                      className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden border border-gray-100"
                      onClick={() => { trackAffiliateClick(dest.title, dest.slug, "top-tab", pelikanUrl, "pelikan"); trackFunnelAffiliateClick(dest.title); }}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={dest.image}
                          alt={dest.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                          <h3 className="font-bold text-lg">{dest.title}</h3>
                          {dest.subtitle && <p className="text-sm text-white/90">{dest.subtitle}</p>}
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>

          {/* Context-aware Cross Promo Slot (Travel Revenue Network) */}
          <div className="mt-10 max-w-5xl mx-auto">
            <CrossPromoSlot placement="italy_context" context={{ pageType: "homepage" }} />
          </div>
        </div>
      </section>

      {/* Trust Building Section */}
      <article className="py-12 bg-[#F5F7FA]">
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-4">
            Akční letenky: hledejte nejvýhodnější spojení snadno
          </h2>
          <p className="text-center text-muted-foreground leading-relaxed">
            Náš přehled akčních letenek vám pomůže rychle porovnat ceny napříč aerolinkami a agenturami, hlídat změny cen a najít termíny s nejlepší cenou. Zobrazené částky jsou obvykle konečné (daně/poplatky); další služby mohou být zpoplatněny u poskytovatele.
          </p>
        </div>
      </article>

      {/* FAQ Section */}
      <section className="py-12 bg-white" aria-labelledby="faq">
        <div className="container max-w-4xl">
          <h2 id="faq" className="text-2xl font-bold text-center mb-8 text-[#003087]">
            Často kladené otázky k letenkám
          </h2>
          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqData.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border rounded-xl px-5 bg-[#F8FAFC]">
                <AccordionTrigger className="text-left font-bold text-gray-900 hover:text-blue-600">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 text-sm leading-relaxed pt-2 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Omio Section - Trains, Buses, Ferries */}
      <Suspense fallback={null}>
        <OmioSection />
      </Suspense>

      {/* Sticky Bottom Banner - A/B Tested */}
      {showBottomBanner && !stickyBannerDismissed && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-[#FFD700] to-[#FFC107] py-2 px-3 shadow-xl z-[100] animate-in slide-in-from-bottom border-t-2 border-yellow-400" style={{ pointerEvents: 'auto' }}>
          <div className="container flex items-center justify-between gap-2">
            {/* Mobile: single CTA */}
            <a
              href={pelikanDeepLink("/cs/akcni-letenky/DF:PED-OSR-BRQ-PRG,S:PRI", { campaign: "sticky-banner", channel: "homepage" })}
              target="_blank"
              rel="noopener noreferrer"
              className="md:hidden flex-1 flex items-center justify-center gap-2 text-sm font-extrabold text-[#003087] bg-white rounded-full py-2 px-4 shadow-md hover:bg-gray-50 transition-colors"
              onClick={() => trackStickyClick()}
            >
              <span className="text-[#E91E63]">{stickyCta.emoji}</span>
              <span>
                {stickyCta.text.includes("{{") ? (
                  stickyCta.text.split(/\{\{|\}\}/).map((part, i) =>
                    i % 2 === 1 ? (
                      <span key={i} className="text-[#E91E63]">{part === "COUNTDOWN" ? ticketCount : part}</span>
                    ) : part
                  )
                ) : stickyCta.text}
              </span>
            </a>
            {/* Desktop: full set of links */}
            <p className="hidden md:block text-center text-sm md:text-base font-bold text-black flex-1">
              <span className="text-[#E91E63]">{stickyCta.emoji}</span>{" "}
              <a
                href={pelikanDeepLink("/cs/akcni-letenky/DF:PED-OSR-BRQ-PRG,S:PRI", { campaign: "sticky-banner", channel: "homepage" })}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-700 hover:underline cursor-pointer"
                onClick={() => trackStickyClick()}
              >
                {stickyCta.text.includes("{{") ? (
                  <>
                    {stickyCta.text.split(/\{\{|\}\}/).map((part, i) =>
                      i % 2 === 1 ? (
                        <span key={i} className="text-[#E91E63] font-extrabold price-highlight-pulse">{part === "COUNTDOWN" ? ticketCount : part}</span>
                      ) : part
                    )}
                  </>
                ) : stickyCta.text}
              </a> |{" "}
              <a href="https://www.pelikan.cz/cs/pobyty/kategorie/177/TO:2?a_aid=levne-letenky&sortBy=minPriceSandbox&utm_source=akcni-letenky&utm_medium=sticky-banner&utm_campaign=dovolena-sleva" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline cursor-pointer" onClick={() => trackStickyClick()}>Dovolená se slevou až <span className="text-[#E91E63] font-extrabold price-highlight-pulse">80 %</span> – od <span className="text-red-600 font-extrabold">4 990 Kč</span></a> |{" "}
              <a href="https://www.pelikan.cz/cs/pobyty/kategorie/104?a_aid=levne-letenky" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline cursor-pointer" onClick={() => trackStickyClick()}>Eurovíkendy</a> |{" "}
              <a href="https://cestovani.pelikan.cz/premium-cestovani?a_aid=levne-letenky" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline cursor-pointer" onClick={() => trackStickyClick()}>Business class</a>
            </p>
            {/* Dismiss button */}
            <button onClick={dismissStickyBanner} className="flex-shrink-0 p-1.5 rounded-full bg-white/50 hover:bg-white/80 transition-colors" aria-label="Zavřít banner">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* Footer Section */}
      <footer className="bg-[#FF9800] py-16">
        <div className="container">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-5xl mx-auto">
            {/* Newsletter Signup in Footer */}
            <FooterNewsletter />

            {/* Bottom Yellow Banner for Business Class */}
            <div className="bg-[#FFD700] rounded-lg px-6 py-3 mt-8 text-center">
              <a href="https://www.akcni-letenky.com/levne-letenky?kategorie=business" className="text-sm font-bold text-[#003087] hover:underline flex items-center justify-center gap-1">
                <span>Business class letenky – Cestujte stylově a pohodlně! ✈️</span>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Price Alert Modal */}
      {priceAlertModal.isOpen && (
        <Suspense fallback={null}>
          <PriceAlertModal
            isOpen={priceAlertModal.isOpen}
            onClose={() => setPriceAlertModal(prev => ({ ...prev, isOpen: false }))}
            destination={priceAlertModal.destination}
            destinationSlug={priceAlertModal.slug}
            currentPrice={priceAlertModal.price}
          />
        </Suspense>
      )}

      {/* GDPR Consent Banner */}
      {showDeferredEnhancements && (
        <Suspense fallback={null}>
          <GdprConsentBanner />
        </Suspense>
      )}
    </div>
  );
}

// ── Tipy pro cestovatele widget ─────────────────────────────────────────
function HomeTipsWidget() {
  const { data: recentArticles, isLoading } = trpc.articles.recent.useQuery({ limit: 3 });

  if (isLoading) {
    return (
      <section className="py-10 bg-[#F0F4F8]">
        <div className="container">
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-r from-[#1a5276] to-[#2980b9] py-3 px-6 rounded-lg shadow-lg">
              <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                💡 Tipy pro cestovatele
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                <div className="h-40 bg-gray-200" />
                <div className="p-5">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!recentArticles || recentArticles.length === 0) return null;

  return (
    <section className="py-10 bg-[#F0F4F8]">
      <div className="container">
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-r from-[#1a5276] to-[#2980b9] py-3 px-6 rounded-lg shadow-lg">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              💡 Tipy pro cestovatele
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentArticles.map((article) => (
            <a
              key={article.id}
              href={`/blog/${article.slug}`}
              className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100"
            >
              {article.featuredImage ? (
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={article.featuredImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-[#1a5276] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      Tip
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-40 bg-gradient-to-br from-sky-100 to-blue-200 flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-sky-400" />
                </div>
              )}
              <div className="p-5">
                <h3 className="font-bold text-gray-800 text-base leading-snug line-clamp-2 group-hover:text-[#1a5276] transition-colors mb-2">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2">{article.excerpt}</p>
                <div className="flex items-center gap-2 mt-3 text-xs text-[#1a5276] font-semibold">
                  Číst více <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </a>
          ))}
        </div>
        <div className="flex justify-center mt-8">
          <a
            href="/tipy-pro-cestovatele"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#1a5276] bg-white border border-[#1a5276]/20 rounded-lg px-5 py-2.5 hover:bg-[#1a5276]/5 transition-colors"
          >
            Všechny tipy <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

// Static fallback prices when API is unavailable
const STATIC_PRICES = [
  { iata: "LHR", name: "Londýn", price: 1290 },
  { iata: "BCN", name: "Barcelona", price: 1590 },
  { iata: "FCO", name: "Řím", price: 1190 },
];

// ── Kam letět z Prahy? sekce ────────────────────────────────────────────
function HomeFlightMapSection() {
  const [expanded, setExpanded] = useState(false);

  // Fetch dynamic prices from Pelikán API (cached on server)
  const { data: cheapFlights, isLoading } = trpc.flights.cheapFromPrague.useQuery(
    { destinations: ["LHR", "BCN", "FCO", "CDG", "AMS", "LIS", "ATH", "DXB", "BKK"] },
    {
      enabled: expanded,
      staleTime: 60 * 60 * 1000, // 1h client-side cache
      retry: false,
    }
  );

  // Use dynamic prices if available, fallback to static
  const displayPrices = cheapFlights && cheapFlights.filter(f => f.price !== null).length >= 2
    ? cheapFlights.filter(f => f.price !== null).slice(0, 3)
    : STATIC_PRICES;

  // Find the lowest price for the teaser headline
  const lowestPrice = cheapFlights?.find(f => f.price !== null)?.price ?? 590;

  return (
    <section className="py-10 bg-gradient-to-b from-[#EBF4FF] to-white">
      <div className="container">
        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-[#003087] rounded-xl p-2.5">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-[#003087]">
                Kam letět z Prahy?
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Interaktivní mapa nejlevějších letů — klikni na destinaci a zjišti cenu
              </p>
            </div>
          </div>
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-2 text-sm font-semibold text-[#003087] bg-white border border-[#003087]/20 rounded-lg px-4 py-2 hover:bg-[#003087]/5 transition-colors"
            aria-expanded={expanded}
          >
            {expanded ? "Skrýt mapu ▲" : "Zobrazit mapu ▼"}
          </button>
        </div>

        {/* Preview teaser — always visible */}
        {!expanded && (
          <div
            className="relative rounded-2xl overflow-hidden cursor-pointer group border border-[#003087]/10 shadow-md"
            onClick={() => setExpanded(true)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === "Enter" && setExpanded(true)}
          >
            {/* Blurred placeholder map background */}
            <div className="h-48 bg-gradient-to-br from-[#0a3d7a] via-[#1565c0] to-[#0288d1] flex items-center justify-center relative">
              <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #fff 1px, transparent 1px), radial-gradient(circle at 70% 30%, #fff 1px, transparent 1px), radial-gradient(circle at 50% 70%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 60%, #fff 1px, transparent 1px), radial-gradient(circle at 20% 80%, #fff 1px, transparent 1px)", backgroundSize: "200px 200px" }}
              />
              <div className="text-center z-10">
                <div className="text-5xl mb-3">🗺️</div>
                <p className="text-white font-bold text-lg">Zobrazit interaktivní mapu letů</p>
                <p className="text-white/70 text-sm mt-1">
                  Letenky z Prahy od{" "}
                  <span className="font-bold text-yellow-300">
                    {isLoading ? "..." : `${lowestPrice.toLocaleString("cs-CZ")} Kč`}
                  </span>
                  {" "}• Klikni pro zobrazení
                </p>
              </div>
              <div className="absolute inset-0 bg-[#003087]/30 group-hover:bg-[#003087]/10 transition-colors" />
            </div>
            {/* Dynamic quick stats bar */}
            <div className="bg-white px-6 py-3 flex flex-wrap gap-4 text-sm text-gray-600 border-t border-gray-100">
              {isLoading ? (
                <>
                  <span className="animate-pulse bg-gray-200 rounded h-4 w-40" />
                  <span className="animate-pulse bg-gray-200 rounded h-4 w-44" />
                  <span className="animate-pulse bg-gray-200 rounded h-4 w-36" />
                </>
              ) : (
                <>
                  {displayPrices.map(f => (
                    <span key={f.iata}>
                      ✈️ <strong>Praha → {f.name}</strong>{" "}
                      od{" "}
                      <span className="text-green-700 font-bold">
                        {f.price ? f.price.toLocaleString("cs-CZ") : "---"} Kč
                      </span>
                    </span>
                  ))}
                  <span className="text-[#003087] font-semibold cursor-pointer hover:underline ml-auto">
                    + zobrazit vše →
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Tracked Pelikan fallback shown when expanded */}
        {expanded && (
          <div className="rounded-2xl overflow-hidden shadow-lg border border-[#003087]/10">
            <div className="bg-white p-6 md:p-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                Pelikan nabidky misto neoverenych iframe prokliku
              </p>
              <h3 className="mt-2 text-2xl font-black text-[#003087]">
                Vyberte si aktualni letenky s plne trackovanym affiliate odkazem
              </h3>
              <p className="mt-2 max-w-2xl text-sm text-gray-600">
                Prodejni klik vede primo na Pelikan.cz s parametrem a_aid=levne-letenky, takze neztracime provizi na externim widgetu.
              </p>
              <a
                href={pelikanDeepLink("/cs/akcni-letenky", {
                  campaign: "homepage-map",
                  channel: "expanded-panel",
                  content: "all",
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#E91E63] px-6 py-3 font-bold text-white transition-colors hover:bg-[#C2185B]"
              >
                Zobrazit vsechny Pelikan akce
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
