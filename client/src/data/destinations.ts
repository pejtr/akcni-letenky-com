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
}

export interface CountryDestination {
  name: string;
  description: string;
  image: string;
  slug: string;
}

export interface TopDestination {
  title: string;
  subtitle: string;
  image: string;
  slug: string;
}

// Zpáteční levné letenky (16 destinations)
export const returnFlights: Destination[] = [
  { name: "Londýn", price: 733, country: "Anglie", image: "/destinations/london.jpg", slug: "london-united-kingdom" },
  { name: "New York", price: 7490, country: "USA", image: "/destinations/newyork.jpg", slug: "new-york-city-new-york-united-states" },
  { name: "Afrika", price: 7990, country: "Afrika", image: "/destinations/africa.jpg", slug: "africa" },
  { name: "Marakéš", price: 1426, country: "Maroko", image: "/destinations/morocco.jpg", slug: "marrakech-morocco" },
  { name: "Paříž", price: 1027, country: "Francie", image: "/destinations/paris.jpg", slug: "paris-france" },
  { name: "Hanoj", price: 7990, country: "Vietnam", image: "/destinations/vietnam.jpg", slug: "hanoi-vietnam" },
  { name: "Bali", price: 12790, country: "Indonésie", image: "/destinations/bali.jpg", slug: "denpasar-bali-indonesia" },
  { name: "Colombo", price: 13990, country: "Srí Lanka", image: "/destinations/srilanka.jpg", slug: "colombo-sri-lanka" },
  { name: "Dubaj", price: 5183, country: "Spojené Arabské Emiráty", image: "/destinations/dubai.jpg", slug: "dubai-united-arab-emirates" },
  { name: "Bangkok", price: 12390, country: "Thajsko", image: "/destinations/thailand.jpg", slug: "bangkok-thailand" },
  { name: "Santorini", price: 1791, country: "Řecko", image: "/destinations/santorini.jpg", slug: "santorini-greece" },
  { name: "Jordánsko", price: 1114, country: "Ammán", image: "/destinations/jordan.jpg", slug: "amman-jordan" },
  { name: "Řím", price: 712, country: "Itálie", image: "/destinations/rome.jpg", slug: "rome-italy" },
  { name: "Island", price: 1460, country: "Island", image: "/destinations/iceland.jpg", slug: "reykjavik-iceland" },
  { name: "Miami", price: 9490, country: "USA", image: "/destinations/miami.jpg", slug: "miami-florida-united-states" },
  { name: "Barcelona", price: 746, country: "Španělsko", image: "/destinations/barcelona.jpg", slug: "barcelona-spain" },
];

// Státy (Countries)
export const countries: CountryDestination[] = [
  { name: "Letenky do USA", description: "Země neomezených možností", image: "/destinations/usa.jpg", slug: "usa" },
  { name: "Letenky do Řecka", description: "Dovolená s řeckými bohy", image: "/destinations/greece.jpg", slug: "greece" },
  { name: "Letenky do Velké Británie", description: "Londýn, Beatles a skotské zámky", image: "/destinations/uk.jpg", slug: "united-kingdom" },
  { name: "Letenky do Španělska", description: "Nákonečné pobřeží a metropole", image: "/destinations/spain.jpg", slug: "spain" },
  { name: "Letenky do Itálie", description: "Památky a excelentní kuchyň", image: "/destinations/italy.jpg", slug: "italy" },
  { name: "Letenky do Spojených arabských emirátů", description: "Pláže, luxus a mrakodrapy", image: "/destinations/uae.jpg", slug: "united-arab-emirates" },
  { name: "Letenky na Island", description: "Kouzelný ostrov gejzírů", image: "/destinations/iceland.jpg", slug: "iceland" },
  { name: "Letenky na Kypr", description: "Nádherné písčité pláže", image: "/destinations/cyprus.jpg", slug: "cyprus" },
  { name: "Letenky do Austrálie", description: "Klokani a vřiny oceánu", image: "/destinations/australia.jpg", slug: "australia" },
  { name: "Letenky do Dánska", description: "Země vikingů a Legolandu", image: "/destinations/denmark.jpg", slug: "denmark" },
  { name: "Letenky na Maltu", description: "Historie a krásné pláže", image: "/destinations/malta.jpg", slug: "malta" },
  { name: "Letenky do Chorvatska", description: "Oblíbená dovolenková klasika", image: "/destinations/croatia.jpg", slug: "croatia" },
  { name: "Letenky do Thajska", description: "Dobrodružství i odpočinek na pláži", image: "/destinations/thailand.jpg", slug: "thailand" },
  { name: "Letenky na Zanzibar", description: "Dokonalé pláže a bílý písek a tyrkysové moře", image: "/destinations/zanzibar.jpg", slug: "zanzibar" },
  { name: "Letenky do Mexika", description: "Nádvozhná letoviska a bohatá historie", image: "/destinations/mexico.jpg", slug: "mexico" },
  { name: "Nejlepší wellnessy v Česku a na Slovensku", description: "Zkuste naše tipy na top pobyty", image: "/destinations/wellness.jpg", slug: "czech-slovakia-wellness" },
];

// Města (Cities) - Top 20
export const cities: Destination[] = [
  { name: "New York", price: 7490, country: "USA", image: "/destinations/newyork.jpg", slug: "new-york-city-new-york-united-states" },
  { name: "Londýn", price: 733, country: "Velká Británie", image: "/destinations/london.jpg", slug: "london-united-kingdom" },
  { name: "Miami", price: 9490, country: "USA", image: "/destinations/miami.jpg", slug: "miami-florida-united-states" },
  { name: "Paříž", price: 1027, country: "Francie", image: "/destinations/paris.jpg", slug: "paris-france" },
  { name: "Řím", price: 712, country: "Itálie", image: "/destinations/rome.jpg", slug: "rome-italy" },
  { name: "Barcelona", price: 746, country: "Španělsko", image: "/destinations/barcelona.jpg", slug: "barcelona-spain" },
  { name: "Bangkok", price: 12390, country: "Thajsko", image: "/destinations/thailand.jpg", slug: "bangkok-thailand" },
  { name: "Dubaj", price: 5183, country: "SAE", image: "/destinations/dubai.jpg", slug: "dubai-united-arab-emirates" },
  { name: "Hanoj", price: 7990, country: "Vietnam", image: "/destinations/vietnam.jpg", slug: "hanoi-vietnam" },
  { name: "Lisabon", price: 890, country: "Portugalsko", image: "/destinations/lisbon.jpg", slug: "lisbon-portugal" },
  { name: "Havana", price: 11990, country: "Kuba", image: "/destinations/havana.jpg", slug: "havana-cuba" },
  { name: "Amsterdam", price: 1150, country: "Nizozemsko", image: "/destinations/amsterdam.jpg", slug: "amsterdam-netherlands" },
  { name: "Malaga", price: 890, country: "Španělsko", image: "/destinations/malaga.jpg", slug: "malaga-spain" },
  { name: "Male", price: 14990, country: "Maledivy", image: "/destinations/maldives.jpg", slug: "male-maldives" },
  { name: "Miláno", price: 890, country: "Itálie", image: "/destinations/milan.jpg", slug: "milan-italy" },
  { name: "Abu Dhabi", price: 5490, country: "SAE", image: "/destinations/abudhabi.jpg", slug: "abu-dhabi-united-arab-emirates" },
  { name: "Neapol", price: 790, country: "Itálie", image: "/destinations/naples.jpg", slug: "naples-italy" },
  { name: "Zadar", price: 690, country: "Chorvatsko", image: "/destinations/zadar.jpg", slug: "zadar-croatia" },
  { name: "Cancún", price: 10990, country: "Mexiko", image: "/destinations/cancun.jpg", slug: "cancun-mexico" },
  { name: "Palma de Mallorca", price: 990, country: "Španělsko", image: "/destinations/mallorca.jpg", slug: "palma-mallorca-spain" },
];

// Top destinace (Themed categories)
export const topDestinations: TopDestination[] = [
  { title: "Last minute", subtitle: "", image: "/destinations/lastminute.jpg", slug: "last-minute" },
  { title: "Výlety po Evropě", subtitle: "", image: "/destinations/europe.jpg", slug: "vylety-po-evrope" },
  { title: "Levná exotika", subtitle: "", image: "/destinations/exotic.jpg", slug: "levna-exotika" },
  { title: "Exotická dovolená", subtitle: "", image: "/destinations/exotic-holiday.jpg", slug: "exoticka-dovolena" },
  { title: "Dovolená Mauricius", subtitle: "", image: "/destinations/mauritius.jpg", slug: "mauricius" },
  { title: "Poznávací zájezdy", subtitle: "", image: "/destinations/sightseeing.jpg", slug: "poznavaci-zajezdy" },
  { title: "Ostrov Malta", subtitle: "Historie a krásné pláže", image: "/destinations/malta.jpg", slug: "malta" },
  { title: "Ostrov Madeira", subtitle: "", image: "/destinations/madeira.jpg", slug: "madeira" },
  { title: "Dovolená v Dubaji", subtitle: "", image: "/destinations/dubai.jpg", slug: "dubaj" },
  { title: "Pobyty v Římě", subtitle: "", image: "/destinations/rome.jpg", slug: "rim" },
  { title: "Pobyt v Benátkách", subtitle: "", image: "/destinations/venice.jpg", slug: "benatky" },
  { title: "Kanárské ostrovy", subtitle: "", image: "/destinations/canary.jpg", slug: "kanarske-ostrovy" },
];
