/**
 * Destination data for homepage sections
 * Based on Pelikan.cz structure
 */

export interface Destination {
  name: string;
  price: number;
  country: string;
  image: string;
  slug: string;
  pelikanUrl?: string; // Optional Pelikan.cz affiliate URL with tracking
  seoSlug?: string; // Slug for internal SEO page: /letenky-{seoSlug}
}

export interface CountryDestination {
  name: string;
  description: string;
  image: string;
  slug: string;
  seoSlug?: string; // Slug for internal SEO page: /letenky-do-{seoSlug}
}

export interface TopDestination {
  title: string;
  subtitle: string;
  image: string;
  slug: string;
}

// Zpáteční levné letenky (16 destinations)
// URLs match original website Pelikan.cz affiliate links with a_aid=levne-letenky tracking
export const returnFlights: Destination[] = [
  { name: "Londýn", price: 733, country: "Anglie", image: "/destinations/london.jpg", slug: "AT:LON,S:PRI", pelikanUrl: "https://www.pelikan.cz/cs/akcni-letenky/AT:LON,S:PRI?a_aid=levne-letenky" },
  { name: "New York", price: 7490, country: "USA", image: "/destinations/newyork.jpg", slug: "AT:NYC,S:PRI", pelikanUrl: "https://www.pelikan.cz/cs/akcni-letenky/AT:NYC,S:PRI?a_aid=levne-letenky" },
  { name: "Afrika", price: 7990, country: "Afrika", image: "/destinations/africa.jpg", slug: "DR:AF,S:PRI", pelikanUrl: "https://www.pelikan.cz/cs/akcni-letenky/DR:AF,S:PRI?a_aid=levne-letenky" },
  { name: "Marakéš", price: 1426, country: "Maroko", image: "/destinations/morocco.jpg", slug: "AT:RAK,S:PRI", pelikanUrl: "https://www.pelikan.cz/cs/akcni-letenky/AT:RAK,S:PRI?a_aid=levne-letenky" },
  { name: "Paříž", price: 1027, country: "Francie", image: "/destinations/paris.jpg", slug: "AT:PAR,S:PRI", pelikanUrl: "https://www.pelikan.cz/cs/akcni-letenky/AT:PAR,S:PRI?a_aid=levne-letenky" },
  { name: "Hanoj", price: 7990, country: "Vietnam", image: "https://files.manuscdn.com/user_upload_by_module/session_file/89740521/PcIFUDsvFHLYFmbN.jpg", slug: "AT:SGN-HAN,S:PRI", pelikanUrl: "https://www.pelikan.cz/cs/akcni-letenky/AT:SGN-HAN,S:PRI?a_aid=levne-letenky" },
  { name: "Bali", price: 12790, country: "Indonésie", image: "/destinations/bali.jpg", slug: "AT:DPS,S:PRI", pelikanUrl: "https://www.pelikan.cz/cs/akcni-letenky/AT:DPS,S:PRI?a_aid=levne-letenky" },
  { name: "Colombo", price: 13990, country: "Srí Lanka", image: "/destinations/srilanka.jpg", slug: "AT:CMB,S:PRI", pelikanUrl: "https://www.pelikan.cz/cs/akcni-letenky/AT:CMB,S:PRI?a_aid=levne-letenky" },
  { name: "Dubaj", price: 5183, country: "Spojené Arabské Emiráty", image: "/destinations/dubai.jpg", slug: "AT:DXB,S:PRI", pelikanUrl: "https://www.pelikan.cz/cs/akcni-letenky/AT:DXB,S:PRI?a_aid=levne-letenky" },
  { name: "Bangkok", price: 12390, country: "Thajsko", image: "/destinations/thailand.jpg", slug: "AT:HKT-BKK,S:PRI", pelikanUrl: "https://www.pelikan.cz/cs/akcni-letenky/AT:HKT-BKK,S:PRI?a_aid=levne-letenky" },
  { name: "Santorini", price: 1791, country: "Řecko", image: "/destinations/santorini.jpg", slug: "AT:JTR,S:PRI", pelikanUrl: "https://www.pelikan.cz/cs/akcni-letenky/AT:JTR,S:PRI?a_aid=levne-letenky" },
  { name: "Jordánsko", price: 1114, country: "Ammán", image: "/destinations/jordan.jpg", slug: "AT:AMM,S:PRI", pelikanUrl: "https://www.pelikan.cz/cs/akcni-letenky/AT:AMM,S:PRI?a_aid=levne-letenky" },
  { name: "Řím", price: 712, country: "Itálie", image: "/destinations/rome.jpg", slug: "AT:ROM,S:PRI", pelikanUrl: "https://www.pelikan.cz/cs/akcni-letenky/AT:ROM,S:PRI?a_aid=levne-letenky" },
  { name: "Island", price: 1460, country: "Island", image: "/destinations/iceland.jpg", slug: "AT:REK,S:PRI", pelikanUrl: "https://www.pelikan.cz/cs/akcni-letenky/AT:REK,S:PRI?a_aid=levne-letenky" },
  { name: "Miami", price: 9490, country: "USA", image: "/destinations/miami.jpg", slug: "AT:MIA,S:PRI", pelikanUrl: "https://www.pelikan.cz/cs/akcni-letenky/AT:MIA,S:PRI?a_aid=levne-letenky" },
  { name: "Barcelona", price: 746, country: "Španělsko", image: "/destinations/barcelona.jpg", slug: "AT:BCN,S:PRI", pelikanUrl: "https://www.pelikan.cz/cs/akcni-letenky/AT:BCN,S:PRI?a_aid=levne-letenky" },
];

// Státy (Countries)
export const countries: CountryDestination[] = [
  { name: "Letenky do USA", description: "Země neomezených možností", image: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?w=800&h=600&fit=crop", slug: "usa", seoSlug: "usa" },
  { name: "Letenky do Řecka", description: "Dovolená s řeckými bohy", image: "/destinations/santorini.jpg", slug: "greece", seoSlug: "recka" },
  { name: "Letenky do Velké Británie", description: "Londýn, Beatles a skotské zámky", image: "/destinations/london.jpg", slug: "united-kingdom", seoSlug: "velke-britanie" },
  { name: "Letenky do Španělska", description: "Nákonečné pobřeží a metropole", image: "/destinations/barcelona.jpg", slug: "spain", seoSlug: "spanelska" },
  { name: "Letenky do Itálie", description: "Památky a excelentní kuchyň", image: "/destinations/rome.jpg", slug: "italy", seoSlug: "italie" },
  { name: "Letenky do Spojených arabských emirátů", description: "Pláže, luxus a mrakodrapy", image: "/destinations/dubai.jpg", slug: "united-arab-emirates", seoSlug: "spojenych-arabskych-emiratu" },
  { name: "Letenky na Island", description: "Kouzelný ostrov gejzírů", image: "/destinations/iceland.jpg", slug: "iceland", seoSlug: "island" },
  { name: "Letenky na Kypr", description: "Nádherné písčité pláže", image: "https://files.manuscdn.com/user_upload_by_module/session_file/89740521/GgiPNTMdzpTVZpFP.jpg", slug: "cyprus", seoSlug: "kypr" },
  { name: "Letenky do Austrálie", description: "Klokani a vřiny oceánu", image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&h=600&fit=crop", slug: "australia", seoSlug: "australie" },
  { name: "Letenky do Dánska", description: "Země vikingů a Legolandu", image: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=800&h=600&fit=crop", slug: "denmark", seoSlug: "danska" },
  { name: "Letenky na Maltu", description: "Historie a krásné pláže", image: "https://files.manuscdn.com/user_upload_by_module/session_file/89740521/yiZzBcGCPxVaQOIX.jpg", slug: "malta", seoSlug: "malty" },
  { name: "Letenky do Chorvatska", description: "Oblíbená dovolenková klasika", image: "https://files.manuscdn.com/user_upload_by_module/session_file/89740521/wLtwqsnsRFimmUdd.jpg", slug: "croatia", seoSlug: "chorvatska" },
  { name: "Letenky do Thajska", description: "Dobrodružství i odpočinek na pláži", image: "/destinations/thailand.jpg", slug: "thailand", seoSlug: "thajska" },
  { name: "Letenky na Zanzibar", description: "Dokonalé pláže a bílý písek a tyrkysové moře", image: "https://files.manuscdn.com/user_upload_by_module/session_file/89740521/JFAApcWEFFYwQYtK.jpg", slug: "zanzibar", seoSlug: "zanzibaru" },
  { name: "Letenky do Mexika", description: "Nádvozhná letoviska a bohatá historie", image: "https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&h=600&fit=crop", slug: "mexico", seoSlug: "mexika" },
  { name: "Nejlepší wellnessy v Česku a na Slovensku", description: "Zkuste naše tipy na top pobyty", image: "https://files.manuscdn.com/user_upload_by_module/session_file/89740521/fonNkUOaeCmutNuZ.jpg", slug: "czech-slovakia-wellness", seoSlug: "wellness" },
];

// Města (Cities) - Top 20
export const cities: Destination[] = [
  { name: "New York", price: 7490, country: "USA", image: "/destinations/newyork.jpg", slug: "new-york-city-new-york-united-states", seoSlug: "new-york" },
  { name: "Londýn", price: 733, country: "Velká Británie", image: "/destinations/london.jpg", slug: "london-united-kingdom", seoSlug: "londyn" },
  { name: "Miami", price: 9490, country: "USA", image: "/destinations/miami.jpg", slug: "miami-florida-united-states", seoSlug: "miami" },
  { name: "Paříž", price: 1027, country: "Francie", image: "/destinations/paris.jpg", slug: "paris-france", seoSlug: "pariz" },
  { name: "Řím", price: 712, country: "Itálie", image: "/destinations/rome.jpg", slug: "rome-italy", seoSlug: "rim" },
  { name: "Barcelona", price: 746, country: "Španělsko", image: "/destinations/barcelona.jpg", slug: "barcelona-spain", seoSlug: "barcelona" },
  { name: "Bangkok", price: 12390, country: "Thajsko", image: "/destinations/thailand.jpg", slug: "bangkok-thailand", seoSlug: "bangkok" },
  { name: "Dubaj", price: 5183, country: "SAE", image: "/destinations/dubai.jpg", slug: "dubai-united-arab-emirates", seoSlug: "dubaj" },
  { name: "Hanoj", price: 7990, country: "Vietnam", image: "https://files.manuscdn.com/user_upload_by_module/session_file/89740521/PcIFUDsvFHLYFmbN.jpg", slug: "hanoi-vietnam", seoSlug: "hanoj" },
  { name: "Lisabon", price: 890, country: "Portugalsko", image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&h=600&fit=crop", slug: "lisbon-portugal", seoSlug: "lisabon" },
  { name: "Havana", price: 11990, country: "Kuba", image: "https://images.unsplash.com/photo-1518544801976-3e159e50e5bb?w=800&h=600&fit=crop", slug: "havana-cuba", seoSlug: "havana" },
  { name: "Amsterdam", price: 1150, country: "Nizozemsko", image: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&h=600&fit=crop", slug: "amsterdam-netherlands", seoSlug: "amsterdam" },
  { name: "Malaga", price: 890, country: "Španělsko", image: "https://images.unsplash.com/photo-1562883676-8c7feb83f09b?w=800&h=600&fit=crop", slug: "malaga-spain", seoSlug: "malaga" },
  
  { name: "Miláno", price: 890, country: "Itálie", image: "https://images.unsplash.com/photo-1513581166391-887a96ddeafd?w=800&h=600&fit=crop", slug: "milan-italy", seoSlug: "milano" },
  { name: "Abu Dhabi", price: 5490, country: "SAE", image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop", slug: "abu-dhabi-united-arab-emirates", seoSlug: "abu-dhabi" },
  { name: "Neapol", price: 790, country: "Itálie", image: "https://images.unsplash.com/photo-1543429258-f9e39f3a8e3c?w=800&h=600&fit=crop", slug: "naples-italy", seoSlug: "neapol" },
  { name: "Zadar", price: 690, country: "Chorvatsko", image: "https://images.unsplash.com/photo-1557555187-23d685287bc3?w=800&h=600&fit=crop", slug: "zadar-croatia", seoSlug: "zadar" },
  { name: "Cancún", price: 10990, country: "Mexiko", image: "https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=800&h=600&fit=crop", slug: "cancun-mexico", seoSlug: "cancun" },
  { name: "Palma de Mallorca", price: 990, country: "Španělsko", image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop", slug: "palma-mallorca-spain", seoSlug: "palma-de-mallorca" },
];

// Top destinace (Themed categories)
export const topDestinations: TopDestination[] = [
  { title: "Last minute", subtitle: "", image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&h=600&fit=crop", slug: "last-minute" },
  { title: "Výlety po Evropě", subtitle: "", image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&h=600&fit=crop", slug: "vylety-po-evrope" },
  { title: "Levná exotika", subtitle: "", image: "/destinations/bali.jpg", slug: "levna-exotika" },
  { title: "Exotická dovolená", subtitle: "", image: "/destinations/srilanka.jpg", slug: "exoticka-dovolena" },
  { title: "Dovolená Mauricius", subtitle: "", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop", slug: "mauricius" },
  { title: "Poznávací zájezdy", subtitle: "", image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&h=600&fit=crop", slug: "poznavaci-zajezdy" },
  { title: "Ostrov Malta", subtitle: "Historie a krásné pláže", image: "https://files.manuscdn.com/user_upload_by_module/session_file/89740521/yiZzBcGCPxVaQOIX.jpg", slug: "malta" },
  { title: "Ostrov Madeira", subtitle: "", image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop", slug: "madeira" },
  { title: "Dovolená v Dubaji", subtitle: "", image: "/destinations/dubai.jpg", slug: "dubaj" },
  { title: "Pobyty v Římě", subtitle: "", image: "/destinations/rome.jpg", slug: "rim" },
  { title: "Pobyt v Benátkách", subtitle: "", image: "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=800&h=600&fit=crop", slug: "benatky" },
  { title: "Kanárské ostrovy", subtitle: "", image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&h=600&fit=crop", slug: "kanarske-ostrovy" },
];
