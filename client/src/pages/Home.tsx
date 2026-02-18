import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useABTest } from "@/lib/abTest";
import HeroVariantA from "@/components/HeroVariantA";
import HeroVariantB from "@/components/HeroVariantB";
import UrgencyTimer from "@/components/UrgencyTimer";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import { ChevronRight, Plane } from "lucide-react";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import ChatbotWidget from "@/components/ChatbotWidget";

import WhatsAppBanner from "@/components/WhatsAppBanner";
import NewsletterBar from "@/components/NewsletterBar";
import FacebookCampaignBanner from "@/components/FacebookCampaignBanner";

import SocialProofNotification from "@/components/SocialProofNotification";
import OmioSection from "@/components/OmioSection";
import MobileMenu from "@/components/MobileMenu";
import TopFlightsThisWeek from "@/components/TopFlightsThisWeek";
import LiveViewerCounter from "@/components/LiveViewerCounter";
import PersonalizedSection from "@/components/PersonalizedSection";
import CountdownTimer from "@/components/CountdownTimer";
import GdprConsentBanner from "@/components/GdprConsentBanner";
import SocialSharePanel from "@/components/SocialSharePanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { returnFlights, countries, cities, topDestinations } from "@/data/destinations";
import { useWishlist } from "@/hooks/useWishlist";
import { Heart, Award, Bell } from "lucide-react";
import PriceAlertModal from "@/components/PriceAlertModal";
import { useCtaAbTest } from "@/hooks/useCtaAbTest";
import { useClickTracking } from "@/hooks/useClickTracking";
import { useConversionTracking } from "@/hooks/useConversionTracking";
import { useTicketCountdown } from "@/hooks/useTicketCountdown";
import { generateOrganizationSchema, generateBreadcrumbSchema, generateFAQSchema, injectStructuredData, removeAllStructuredData } from "@/lib/structuredData";

// City to Kiwi.com slug mapping
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
  
  // Helper function to track affiliate clicks
  const trackAffiliateClick = (dest: string, destSlug: string, source: string, url: string) => {
    trackClickMutation.mutate({
      destination: dest,
      destinationSlug: destSlug,
      source: source,
      affiliatePartner: "kiwi",
      affiliateUrl: url,
    });
  };
  
  // Handle search - redirect to Kiwi.com with affiliate link
  const handleSearch = () => {
    const destLower = destination.toLowerCase().trim();
    const destSlug = cityToSlug[destLower] || destLower.replace(/\s+/g, "-");
    
    // Parse date from dd.mm.yyyy to yyyy-mm-dd
    let formattedDate = "";
    if (departureDate) {
      const parts = departureDate.split(".");
      if (parts.length === 3) {
        formattedDate = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
      }
    }
    
    // Build Kiwi.com search URL
    const origin = "prague-czech-republic"; // Default origin is Prague
    let kiwiUrl = `https://www.kiwi.com/cs/search/results/${origin}/${destSlug}`;
    
    if (formattedDate) {
      kiwiUrl += `/${formattedDate}`;
    }
    
    kiwiUrl += `?adults=${passengers}`;
    
    // Track the search event (Meta Pixel Search event)
    trackFunnelSearch(destination, origin);
    
    // Track the click
    trackAffiliateClick(destination, destSlug, "search", kiwiUrl);
    trackFunnelAffiliateClick(destination);
    
    // Open in new tab
    window.open(kiwiUrl, "_blank");
  };
  
  // SEO: Set document title, meta description, and structured data
  useEffect(() => {
    document.title = "Levné Letenky z Prahy od 590 Kč | Sleva až -80% | Akční Letenky 2026";
    
    // Set meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'Najděte nejlevnější akční letenky do celého světa. Porovnejte ceny letenek z Prahy do Londýna, Paříže, Barcelony a dalších destinací. Last minute slevy až 80%.');
    
    // Set meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', 'akční letenky, levné letenky, last minute letenky, letenky z prahy, nejlevnější letenky, letenky do evropy, letenky do londýna, letenky do paříže');
    
    // Add JSON-LD structured data
    removeAllStructuredData(); // Clean up any existing schemas
    
    // Organization schema
    injectStructuredData(generateOrganizationSchema());
    
    // Breadcrumb schema for homepage
    injectStructuredData(generateBreadcrumbSchema([
      { name: "Domů", url: "/" }
    ]));
    
    // FAQ schema
    injectStructuredData(generateFAQSchema([
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
    ]))
    
    return () => {
      // Cleanup on unmount
      removeAllStructuredData();
    };
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
    // Navigate to search results
    window.location.href = `https://www.kiwi.com/deep?from=PRG&to=${destination}&passengers=${passengers}&affilid=levneletenky`;
  };

  const handleSearchVariantB = (from: string, destination: string, duration: string, passengers: number) => {
    // Navigate to search results
    window.location.href = `https://www.kiwi.com/deep?from=${from}&to=${destination}&passengers=${passengers}&affilid=levneletenky`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Exit Intent Popup */}
      <ExitIntentPopup whatsappLink="https://chat.whatsapp.com/KG1IqrQclfY6NOgkmgs6ml" />
      
      {/* Facebook Campaign Banner - shown to FB visitors */}
      <FacebookCampaignBanner />
      {/* Newsletter Bar */}
      <NewsletterBar />
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
      {/* Sticky Navigation Header */}
      <header role="banner"
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-gradient-to-r from-[#FFD700] to-[#FFC107] shadow-md",
          isScrolled ? "py-1.5" : "py-2"
        )}
      >
        <div className="container flex items-center justify-between gap-2">
          {/* Logo */}
          <a href="/" className="flex items-center gap-1.5 flex-shrink-0">
            <img 
              src="/logo-akcni-letenky.png" 
              alt="Akční Letenky" 
              className="h-9 md:h-10 lg:h-12 w-auto"
            />
          </a>

          {/* Navigation - only on xl screens to avoid crowding */}
          <nav role="navigation" aria-label="Main navigation" className="hidden xl:flex items-center gap-2 flex-shrink">
            <Link href="/levne-letenky" className="text-xs text-[#003087] hover:text-[#001f5c] transition-colors font-semibold flex items-center gap-1 whitespace-nowrap px-1 py-1">
              💸 LETENKY
            </Link>
            <Link href="/dovolene" className="text-xs text-[#003087] hover:text-[#001f5c] transition-colors font-semibold flex items-center gap-1 whitespace-nowrap px-1 py-1">
              ⭐ DOVOLENÁ
            </Link>
            <a href="#airlines" className="text-xs text-[#003087] hover:text-[#001f5c] transition-colors font-semibold flex items-center gap-1 whitespace-nowrap px-1 py-1">
              ✈️ AEROLINKY
            </a>
            <Link href="/vlaky-autobusy" className="text-xs text-[#003087] hover:text-[#001f5c] transition-colors font-semibold flex items-center gap-1 whitespace-nowrap px-1 py-1">
              🚆 VLAKY
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Hamburger Menu - shown below xl */}
            <div className="xl:hidden">
              <MobileMenu />
            </div>
            
            {/* Wishlist Heart Icon with Badge */}
            <Link
              href="/wishlist"
              className="relative text-[#003087] hover:text-[#E91E63] transition-colors inline-block"
              aria-label="Seznam přání"
              title="Seznam přání"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                  {wishlistCount}
                </span>
              )}
            </Link>
            
            {/* Countdown + CTA - hidden on mobile */}
            <div className="hidden md:flex items-center gap-2">
              <CountdownTimer className="hidden lg:flex" />
              <a 
                href="https://www.kiwi.com/deep?affilid=akcniletenkyakcniletenky&currency=CZK&lang=cs" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-[#E91E63] hover:bg-[#C2185B] text-white px-3 py-1.5 rounded-full transition-colors whitespace-nowrap font-semibold text-xs cta-btn-animated"
                onClick={() => trackReservationClick()}
              >
                <Plane className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden lg:inline">{reservationCta.text}</span>
                <span className="lg:hidden">REZERVOVAT</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* A/B Test: Hero Section */}
      {heroVariant === 'A' ? (
        <HeroVariantA onSearch={handleSearchVariantA} />
      ) : (
        <HeroVariantB onSearch={handleSearchVariantB} />
      )}



      {/* Kiwi.com Search Widget */}
      <section className="py-8 bg-white">
        <div className="container">
          <div id="widget-holder" className="max-w-4xl mx-auto"></div>
        </div>
      </section>

      {/* Blue Info Banner */}
      <div className="bg-gradient-to-r from-[#1976D2] to-[#2196F3] py-4 shadow-md">
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

      {/* Featured European Cities */}
      <section aria-labelledby="featured-cities" className="py-10 bg-[#F0F4F8]">
        <div className="container">
          <h2 id="featured-cities" className="text-2xl md:text-3xl font-bold text-center mb-8 text-[#003087]">
            Nejlevnější letenky do evropských měst
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCities.map((city, index) => {
              const destSlug = cityToSlug[city.to.toLowerCase()] || city.to.toLowerCase().replace(/\s+/g, "-");
              const affiliateUrl = city.pelikanUrl || `https://www.kiwi.com/cs/search/results/prague-czech-republic/${destSlug}`;
              return (
                <div key={index} className="relative">
                  <a
                    href={affiliateUrl}
                    target="_blank"
                    rel="noopener nofollow sponsored"
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 block group"
                    onClick={() => { trackAffiliateClick(city.to, destSlug, "featured", affiliateUrl); trackFunnelAffiliateClick(city.to); }}
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
                          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
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
                      {/* Live Viewer Counter */}
                      <div className="flex justify-center mb-2">
                        <LiveViewerCounter destinationId={`city_${city.to.toLowerCase()}`} />
                      </div>
                      {/* Urgency Timer */}
                      <div className="flex justify-center">
                        <UrgencyTimer offerId={`city_${city.to.toLowerCase()}`} className="text-xs" />
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

      {/* WhatsApp Community Banner */}
      <WhatsAppBanner />

      {/* Nejprodávanější letenky tento týden */}
      <section aria-labelledby="top-this-week" className="py-12 bg-white">
        <div className="container">
          {/* Section Title */}
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-r from-[#FF5722] to-[#E91E63] py-3 px-6 rounded-lg shadow-lg">
              <h2 id="top-this-week" className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                🔥 Nejprodávanější letenky tento týden
              </h2>
            </div>
          </div>

          <TopFlightsThisWeek />
        </div>
      </section>

      {/* Personalized Recommendations */}
      <PersonalizedSection />

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
              // Use pelikanUrl from data if available, otherwise fallback to generic URL
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
                    <img
                      src={dest.image}
                      alt={`${dest.name}, ${dest.country}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      loading="lazy"
                      decoding="async"
                      fetchPriority={index < 4 ? "high" : "low"}
                      onError={(e) => { (e.target as HTMLImageElement).src = '/destinations/paris.jpg'; }}
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
                    
                    {/* Live Viewer Counter */}
                    <div className="mt-auto">
                      <LiveViewerCounter destinationId={`return_${dest.slug}`} />
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
            Procházejte destinace a aerolinky
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
                  const seoUrl = `/letenky-do-${country.seoSlug || country.slug}`;
                  return (
                    <a
                      key={index}
                      href={seoUrl}
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
                  const seoUrl = `/letenky-${city.seoSlug || city.slug}`;
                  return (
                    <a
                      key={index}
                      href={seoUrl}
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
                {airlines.map((airline, index) => (
                  <Link
                    key={index}
                    href={`/letecka-spolecnost/${airline.slug}`}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-5 flex flex-col items-center gap-3 group"
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
                  </Link>
                ))}
              </div>
            </TabsContent>

            {/* Top destinace Tab */}
            <TabsContent value="top" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {topDestinations.map((dest, index) => {
                  const kiwiUrl = `https://www.kiwi.com/cs/search/results/prague-czech-republic/${dest.slug}`;
                  return (
                    <a
                      key={index}
                      href={kiwiUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden border border-gray-100"
                      onClick={() => { trackAffiliateClick(dest.title, dest.slug, "top-tab", kiwiUrl); trackFunnelAffiliateClick(dest.title); }}
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

      {/* Omio Section - Trains, Buses, Ferries */}
      <OmioSection />

      {/* Airline Logos Section */}
      <section aria-labelledby="airlines" className="py-12 bg-[#F5F7FA]">
        <div className="container">
          <h2 id="airlines" className="text-2xl font-bold text-center mb-8">
            Letecké společnosti
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {airlines.map((airline, index) => (
              <Link
                key={index}
                href={`/letecka-spolecnost/${airline.slug}`}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-5 flex flex-col items-center gap-3 group"
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
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section with Schema.org FAQPage */}
      <section aria-labelledby="faq" className="py-12 bg-white">
        <div className="container max-w-4xl">
          <h2 id="faq" className="text-2xl font-bold text-center mb-8">
            Často kladené otázky
          </h2>
          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <details
                key={index}
                className="bg-[#F5F7FA] rounded-lg shadow-sm group"
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none font-semibold text-lg hover:bg-gray-100 rounded-lg transition-colors">
                  <span>{faq.question}</span>
                  <span className="text-[#E91E63] text-2xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-5 pb-5 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Sticky Bottom Banner - A/B Tested */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FFD700] py-2 px-3 shadow-lg z-[100] animate-in slide-in-from-bottom" style={{ pointerEvents: 'auto' }}>
          <div className="container">
            <p className="text-center text-sm md:text-base font-bold text-black">
              <span className="text-[#E91E63]">{stickyCta.emoji}</span>{" "}
              <a href="/levne-letenky" className="text-blue-700 hover:underline cursor-pointer" onClick={() => trackStickyClick()}>
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
              <a href="/levne-letenky?kategorie=eurovikendy" className="text-blue-700 hover:underline cursor-pointer" onClick={() => trackStickyClick()}>Eurovíkendy</a> |{" "}
              <a href="/levne-letenky?kategorie=business" className="text-blue-700 hover:underline cursor-pointer" onClick={() => trackStickyClick()}>Business class</a>
            </p>
          </div>
        </div>

      {/* Footer Section */}
      <footer className="bg-[#FF9800] py-16">
        <div className="container">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-5xl mx-auto">
            {/* Main Heading */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#FFD700] rounded-lg flex items-center justify-center">
                  <span className="text-3xl">✈️</span>
                </div>
                <h2 className="text-3xl font-black text-[#003087]">AKČNÍ-LETENKY.com</h2>
              </div>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Objevte <strong>nejlevnější letenky</strong> a splňte si své cestovatelské sny. Porovnáváme za vás nabídky od desítek leteckých společností, abyste mohli letět chytře a za zlevněné ceny.
              </p>
            </div>

            {/* Quick Links Banner */}
            <div className="bg-[#FFD700] rounded-lg px-6 py-3 mb-8">
              <div className="flex items-center justify-center gap-3 flex-wrap text-xs md:text-sm">
                <a href="#akce-tydne" className="font-semibold text-[#003087] hover:underline">➡️ Akční nabídka týdne</a>
                <span className="text-[#003087]">|</span>
                <a href="#business-class" className="font-semibold text-[#003087] hover:underline">⭐ Business class</a>
                <span className="text-[#003087]">|</span>
                <a href="#prime-lety" className="font-semibold text-[#003087] hover:underline">✈️ Přímé lety</a>
                <span className="text-[#003087]">|</span>
                <a href="#faq" className="font-semibold text-[#003087] hover:underline">💰 Časté dotazy</a>
              </div>
            </div>

            {/* Footer Categories Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {/* Column 1 - Akční nabídky */}
              <div>
                <h3 className="text-base font-bold mb-3 text-[#003087]">🌴 Akční nabídky</h3>
                <ul className="space-y-2">
                  <li><a href="https://www.pelikan.cz/cs/akcni-letenky/LP:0_1500,S:PRI?a_aid=levne-letenky&utm_source=akcni-letenky&utm_medium=footer&utm_campaign=1500kc" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Letenky do 1 500 Kč</a></li>
                  <li><a href="https://www.pelikan.cz/cs/pobyty/kategorie/177/TO:2?a_aid=levne-letenky&sortBy=minPriceSandbox&utm_source=akcni-letenky&utm_medium=footer&utm_campaign=dovolena-sleva" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Dovolená se slevou až 80 %</a></li>
                  <li><a href="#eurovikendy" className="text-xs text-blue-600 hover:underline">Eurovíkendy</a></li>
                  <li><a href="#business-class" className="text-xs text-blue-600 hover:underline">Business class</a></li>
                  <li><a href="#top-akce" className="text-xs text-blue-600 hover:underline">🚀TOP akce</a></li>
                  <li><a href="#mauricius" className="text-xs text-blue-600 hover:underline">Mauricius</a></li>
                  <li><a href="#kratke-vylety" className="text-xs text-blue-600 hover:underline">Krátké výlety</a></li>
                  <li><a href="#maledivy" className="text-xs text-blue-600 hover:underline">Maledivy</a></li>
                </ul>
              </div>

              {/* Column 2 - Dovolené */}
              <div>
                <h3 className="text-base font-bold mb-3 text-[#003087]">⭐ Dovolené</h3>
                <ul className="space-y-2">
                  <li><a href="#premium-dovolena" className="text-xs text-blue-600 hover:underline">⭐Premium dovolená</a></li>
                  <li><a href="#dubaj" className="text-xs text-blue-600 hover:underline">Dovolená v Dubaji</a></li>
                  <li><a href="#poznavaci" className="text-xs text-blue-600 hover:underline">Poznávací zájezdy</a></li>
                  <li><a href="#kanary" className="text-xs text-blue-600 hover:underline">Kanárské ostrovy</a></li>
                  <li><a href="#last-minute" className="text-xs text-blue-600 hover:underline">Last minute</a></li>
                  <li><a href="#nejlepsi-dovolene" className="text-xs text-blue-600 hover:underline">Nejlepší dovolené</a></li>
                  <li><a href="#wellness" className="text-xs text-blue-600 hover:underline">Wellness</a></li>
                  <li><a href="#exoticka" className="text-xs text-blue-600 hover:underline">Exotická dovolená</a></li>
                </ul>
              </div>

              {/* Column 3 - Hotely & Místa */}
              <div>
                <h3 className="text-base font-bold mb-3 text-[#003087]">🏛️ Hotely & Místa</h3>
                <ul className="space-y-2">
                  <li><a href="https://www.pelikan.cz/cs/pobyty?a_aid=levne-letenky&utm_source=akcni-letenky&utm_medium=footer&utm_campaign=pobyty-rim" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Pobyty v Římě</a></li>
                  <li><a href="https://www.pelikan.cz/cs/pobyty?a_aid=levne-letenky&utm_source=akcni-letenky&utm_medium=footer&utm_campaign=hotely-cesko" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Hotely v Česku</a></li>
                  <li><a href="https://www.pelikan.cz/cs/pobyty?a_aid=levne-letenky&utm_source=akcni-letenky&utm_medium=footer&utm_campaign=pobyty-benatky" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Pobyt v Benátkách</a></li>
                  <li><a href="https://www.pelikan.cz/cs/pobyty?a_aid=levne-letenky&utm_source=akcni-letenky&utm_medium=footer&utm_campaign=dovolena-usa" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Dovolená v USA</a></li>
                  <li><a href="https://www.pelikan.cz/cs/pobyty?a_aid=levne-letenky&utm_source=akcni-letenky&utm_medium=footer&utm_campaign=hotely-slovensko" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Hotely na Slovensku</a></li>
                  <li><a href="https://www.pelikan.cz/cs/pobyty?a_aid=levne-letenky&utm_source=akcni-letenky&utm_medium=footer&utm_campaign=madeira" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Ostrov Madeira</a></li>
                  <li><a href="https://www.pelikan.cz/cs/pobyty/kategorie/177/TO:2?a_aid=levne-letenky&utm_source=akcni-letenky&utm_medium=footer&utm_campaign=vlastni-doprava" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">S vlastní dopravou</a></li>
                  <li><a href="https://www.pelikan.cz/cs/pobyty?a_aid=levne-letenky&utm_source=akcni-letenky&utm_medium=footer&utm_campaign=malta" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Ostrov Malta</a></li>
                </ul>
              </div>
            </div>

            {/* Separator */}
            <div className="border-t border-gray-200 my-6"></div>

            {/* Two Columns */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Left Column - Why Book With Us */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-blue-600">✓</span>
                  Proč rezervovat u nás?
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-sm">Garantujeme <strong>nejlevnější letenky</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-sm">Denně čerstvé <strong>akční letenky</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-sm">Přehledné porovnání desítek aerolinek</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-sm">Snadná a bezpečná online rezervace</span>
                  </li>
                </ul>
              </div>

              {/* Right Column - Community */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-blue-600">👥</span>
                  Přidejte se ke komunitě 60 tis. + členů
                </h3>
                <div className="space-y-4">
                  <a href="https://www.facebook.com/groups/akcniletenky" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <div className="w-10 h-10 bg-[#1877F2] rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">f</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Akční letenky a cestování</p>
                      <p className="text-xs text-muted-foreground">Tipy a rady od komunity.</p>
                    </div>
                  </a>
                  <a href="https://www.facebook.com/groups/tourdesvet" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <div className="w-10 h-10 bg-[#1877F2] rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">f</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Tour De Svět - Cestování</p>
                      <p className="text-xs text-muted-foreground">Inspirace pro vaše cesty.</p>
                    </div>
                  </a>
                  <a 
                    href="https://chat.whatsapp.com/KDpuBfwm1Uw2GYc0PJJQXE" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  >
                    <div className="w-10 h-10 bg-[#25D366] rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xl">✉️</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm flex items-center gap-1">
                        WhatsApp Skupina 🔥
                      </p>
                      <p className="text-xs text-muted-foreground">Exkluzivní slevy až -70%</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <Button 
                size="lg" 
                className="bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold px-8 py-6 text-base md:text-lg rounded-full shadow-lg max-w-full whitespace-normal"
                onClick={() => {
                  trackFooterClick();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                {footerCta.emoji} {footerCta.text}
              </Button>
              {footerCta.subtext && (
                <p className="text-yellow-300 text-sm font-semibold mt-2">{footerCta.subtext}</p>
              )}
            </div>

            {/* Bottom Yellow Banner */}
            <div className="bg-[#FFD700] rounded-lg px-6 py-3 mt-8 text-center">
              <p className="text-sm text-[#003087]">
                <strong>Business class letenky</strong> – Cestujte stylově a pohodlně! ✈️
              </p>
            </div>
          </div>

          {/* Partner Websites */}
          <div className="border-t border-white/20 pt-6 mt-8">
            <h3 className="text-center text-white font-semibold mb-4">Naši partneři</h3>
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <a 
                href="https://www.do-italie.cz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
              >
                <img src="/logo-do-italie.png" alt="DO-ITALIE.cz" className="w-8 h-6 object-contain" />
                <span className="text-white text-sm font-medium">DO-ITALIE.cz</span>
              </a>
              <a 
                href="https://www.revolut-bonus.cz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
              >
                <span className="text-white text-sm font-medium">REVOLUT-BONUS.cz</span>
              </a>
              <a 
                href="https://www.amarex.cz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
              >
                <img src="/logo-amarex.svg" alt="AMAREX.cz" className="h-6 w-auto object-contain" />
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center mt-8 text-white text-sm">
            <p>© 2026 AKČNÍ-LETENKY.com | Všechna práva vyhrazena</p>
          </div>
        </div>
      </footer>

      {/* Chatbot Widget */}
      <ChatbotWidget />

      {/* Social Proof Widget */}

      
      {/* Social Proof Notifications */}
      <SocialProofNotification />

      {/* Price Alert Modal */}
      <PriceAlertModal
        isOpen={priceAlertModal.isOpen}
        onClose={() => setPriceAlertModal(prev => ({ ...prev, isOpen: false }))}
        destination={priceAlertModal.destination}
        destinationSlug={priceAlertModal.slug}
        currentPrice={priceAlertModal.price}
      />

      {/* GDPR Consent Banner */}
      <GdprConsentBanner />
      
    </div>
  );
}
