/**
 * Czech Grammar & Declension Engine for Travel Destinations
 * Handles natural preposition selection ("do" vs "na" vs "v") and proper noun declension.
 */

interface DestinationGrammar {
  genitive: string;      // 2. pád (Letenky do / na ...)
  locative: string;      // 6. pád (Dovolená v / na ...)
  preposition: "do" | "na";
  locativePreposition: "v" | "ve" | "na";
}

const DESTINATION_DICTIONARY: Record<string, DestinationGrammar> = {
  // Cities & Regions (preposition "do")
  "londyn": { genitive: "Londýna", locative: "Londýně", preposition: "do", locativePreposition: "v" },
  "london": { genitive: "Londýna", locative: "Londýně", preposition: "do", locativePreposition: "v" },
  "pariz": { genitive: "Paříže", locative: "Paříži", preposition: "do", locativePreposition: "v" },
  "paris": { genitive: "Paříže", locative: "Paříži", preposition: "do", locativePreposition: "v" },
  "rim": { genitive: "Říma", locative: "Římě", preposition: "do", locativePreposition: "v" },
  "rome": { genitive: "Říma", locative: "Římě", preposition: "do", locativePreposition: "v" },
  "barcelona": { genitive: "Barcelony", locative: "Barceloně", preposition: "do", locativePreposition: "v" },
  "dubaj": { genitive: "Dubaje", locative: "Dubaji", preposition: "do", locativePreposition: "v" },
  "dubai": { genitive: "Dubaje", locative: "Dubaji", preposition: "do", locativePreposition: "v" },
  "new-york": { genitive: "New Yorku", locative: "New Yorku", preposition: "do", locativePreposition: "v" },
  "new york": { genitive: "New Yorku", locative: "New Yorku", preposition: "do", locativePreposition: "v" },
  "milan": { genitive: "Milána", locative: "Miláně", preposition: "do", locativePreposition: "v" },
  "milano": { genitive: "Milána", locative: "Miláně", preposition: "do", locativePreposition: "v" },
  "benatky": { genitive: "Benátek", locative: "Benátkách", preposition: "do", locativePreposition: "v" },
  "venice": { genitive: "Benátek", locative: "Benátkách", preposition: "do", locativePreposition: "v" },
  "lisabon": { genitive: "Lisabonu", locative: "Lisabonu", preposition: "do", locativePreposition: "v" },
  "lisbon": { genitive: "Lisabonu", locative: "Lisabonu", preposition: "do", locativePreposition: "v" },
  "porto": { genitive: "Porta", locative: "Portu", preposition: "do", locativePreposition: "v" },
  "madrid": { genitive: "Madridu", locative: "Madridu", preposition: "do", locativePreposition: "v" },
  "amsterdam": { genitive: "Amsterdamu", locative: "Amsterdamu", preposition: "do", locativePreposition: "v" },
  "berlin": { genitive: "Berlína", locative: "Berlíně", preposition: "do", locativePreposition: "v" },
  "viden": { genitive: "Vídně", locative: "Vídni", preposition: "do", locativePreposition: "ve" },
  "vienna": { genitive: "Vídně", locative: "Vídni", preposition: "do", locativePreposition: "ve" },
  "budapest": { genitive: "Budapešti", locative: "Budapešti", preposition: "do", locativePreposition: "v" },
  "praha": { genitive: "Prahy", locative: "Praze", preposition: "do", locativePreposition: "v" },
  "prague": { genitive: "Prahy", locative: "Praze", preposition: "do", locativePreposition: "v" },
  "tokio": { genitive: "Tokia", locative: "Tokiu", preposition: "do", locativePreposition: "v" },
  "tokyo": { genitive: "Tokia", locative: "Tokiu", preposition: "do", locativePreposition: "v" },
  "bangkok": { genitive: "Bangkoku", locative: "Bangkoku", preposition: "do", locativePreposition: "v" },
  "singapur": { genitive: "Singapuru", locative: "Singapuru", preposition: "do", locativePreposition: "v" },
  "singapore": { genitive: "Singapuru", locative: "Singapuru", preposition: "do", locativePreposition: "v" },
  "dublin": { genitive: "Dublinu", locative: "Dublinu", preposition: "do", locativePreposition: "v" },
  "edinburg": { genitive: "Edinburghu", locative: "Edinburghu", preposition: "do", locativePreposition: "v" },
  "edinburgh": { genitive: "Edinburghu", locative: "Edinburghu", preposition: "do", locativePreposition: "v" },
  "oslo": { genitive: "Osla", locative: "Oslu", preposition: "do", locativePreposition: "v" },
  "stockholm": { genitive: "Stockholmu", locative: "Stockholmu", preposition: "do", locativePreposition: "v" },
  "kodan": { genitive: "Kodaně", locative: "Kodani", preposition: "do", locativePreposition: "v" },
  "copenhagen": { genitive: "Kodaně", locative: "Kodani", preposition: "do", locativePreposition: "v" },
  "ateny": { genitive: "Athén", locative: "Athénách", preposition: "do", locativePreposition: "v" },
  "athens": { genitive: "Athén", locative: "Athénách", preposition: "do", locativePreposition: "v" },
  "split": { genitive: "Splitu", locative: "Splitu", preposition: "do", locativePreposition: "ve" },
  "dubrovnik": { genitive: "Dubrovníku", locative: "Dubrovníku", preposition: "do", locativePreposition: "v" },
  "zadar": { genitive: "Zadaru", locative: "Zadaru", preposition: "do", locativePreposition: "v" },
  "pula": { genitive: "Puly", locative: "Pule", preposition: "do", locativePreposition: "v" },
  "bari": { genitive: "Bari", locative: "Bari", preposition: "do", locativePreposition: "v" },
  "neapol": { genitive: "Neapole", locative: "Neapoli", preposition: "do", locativePreposition: "v" },
  "naples": { genitive: "Neapole", locative: "Neapoli", preposition: "do", locativePreposition: "v" },
  "katavie": { genitive: "Katánie", locative: "Katánii", preposition: "do", locativePreposition: "v" },
  "catania": { genitive: "Katánie", locative: "Katánii", preposition: "do", locativePreposition: "v" },
  "palermo": { genitive: "Palerma", locative: "Palermu", preposition: "do", locativePreposition: "v" },
  "malaga": { genitive: "Málagy", locative: "Málaze", preposition: "do", locativePreposition: "v" },
  "alicante": { genitive: "Alicante", locative: "Alicante", preposition: "do", locativePreposition: "v" },
  "valencie": { genitive: "Valencie", locative: "Valencii", preposition: "do", locativePreposition: "ve" },
  "valencia": { genitive: "Valencie", locative: "Valencii", preposition: "do", locativePreposition: "ve" },
  "sevilla": { genitive: "Sevilly", locative: "Seville", preposition: "do", locativePreposition: "v" },
  "nice": { genitive: "Nice", locative: "Nice", preposition: "do", locativePreposition: "v" },
  "marseille": { genitive: "Marseille", locative: "Marseille", preposition: "do", locativePreposition: "v" },

  // Islands & Island States (preposition "na")
  "mallorca": { genitive: "Mallorcu", locative: "Mallorce", preposition: "na", locativePreposition: "na" },
  "majorka": { genitive: "Mallorcu", locative: "Mallorce", preposition: "na", locativePreposition: "na" },
  "ibiza": { genitive: "Ibizu", locative: "Ibizu", preposition: "na", locativePreposition: "na" },
  "menorca": { genitive: "Menorcu", locative: "Menorce", preposition: "na", locativePreposition: "na" },
  "tenerife": { genitive: "Tenerife", locative: "Tenerife", preposition: "na", locativePreposition: "na" },
  "gran-canaria": { genitive: "Gran Canarii", locative: "Gran Canarii", preposition: "na", locativePreposition: "na" },
  "fuerteventura": { genitive: "Fuerteventuru", locative: "Fuerteventuře", preposition: "na", locativePreposition: "na" },
  "lanzarote": { genitive: "Lanzarote", locative: "Lanzarote", preposition: "na", locativePreposition: "na" },
  "kanarske-ostrovy": { genitive: "Kanárské ostrovy", locative: "Kanárských ostrovech", preposition: "na", locativePreposition: "na" },
  "kreta": { genitive: "Krétu", locative: "Krétě", preposition: "na", locativePreposition: "na" },
  "rhodos": { genitive: "Rhodos", locative: "Rhodosu", preposition: "na", locativePreposition: "na" },
  "korfu": { genitive: "Korfu", locative: "Korfu", preposition: "na", locativePreposition: "na" },
  "kos": { genitive: "Kos", locative: "Kosu", preposition: "na", locativePreposition: "na" },
  "zakynthos": { genitive: "Zakynthos", locative: "Zakynthosu", preposition: "na", locativePreposition: "na" },
  "santorini": { genitive: "Santorini", locative: "Santorini", preposition: "na", locativePreposition: "na" },
  "mykonos": { genitive: "Mykonos", locative: "Mykonosu", preposition: "na", locativePreposition: "na" },
  "kypr": { genitive: "Kypr", locative: "Kypru", preposition: "na", locativePreposition: "na" },
  "cyprus": { genitive: "Kypr", locative: "Kypru", preposition: "na", locativePreposition: "na" },
  "malta": { genitive: "Maltu", locative: "Maltě", preposition: "na", locativePreposition: "na" },
  "madeira": { genitive: "Madeiru", locative: "Madeiře", preposition: "na", locativePreposition: "na" },
  "azory": { genitive: "Azory", locative: "Azorech", preposition: "na", locativePreposition: "na" },
  "bali": { genitive: "Bali", locative: "Bali", preposition: "na", locativePreposition: "na" },
  "maledivy": { genitive: "Maledivy", locative: "Maledivách", preposition: "na", locativePreposition: "na" },
  "maldives": { genitive: "Maledivy", locative: "Maledivách", preposition: "na", locativePreposition: "na" },
  "zanzibar": { genitive: "Zanzibar", locative: "Zanzibaru", preposition: "na", locativePreposition: "na" },
  "reunion": { genitive: "Réunion", locative: "Réunionu", preposition: "na", locativePreposition: "na" },
  "mauricius": { genitive: "Mauricius", locative: "Mauriciu", preposition: "na", locativePreposition: "na" },
  "sri-lanka": { genitive: "Srí Lanku", locative: "Srí Lance", preposition: "na", locativePreposition: "na" },
  "island": { genitive: "Island", locative: "Islandu", preposition: "na", locativePreposition: "na" },
  "iceland": { genitive: "Island", locative: "Islandu", preposition: "na", locativePreposition: "na" },
  "sicilie": { genitive: "Sicílii", locative: "Sicílii", preposition: "na", locativePreposition: "na" },
  "sardinie": { genitive: "Sardínii", locative: "Sardínii", preposition: "na", locativePreposition: "na" },
  "korsika": { genitive: "Korsiku", locative: "Korsice", preposition: "na", locativePreposition: "na" },
};

function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Returns natural Czech phrase for flights to a destination (e.g. "do Londýna", "na Mallorcu")
 * @param destination City or region name (Czech or English)
 * @param includePreposition Whether to prefix with "do " or "na "
 */
export function formatDestinationGenitive(destination: string, includePreposition: boolean = true): string {
  if (!destination) return "";
  const key = normalizeKey(destination);
  const found = DESTINATION_DICTIONARY[key];

  if (found) {
    return includePreposition ? `${found.preposition} ${found.genitive}` : found.genitive;
  }

  // Heuristic fallbacks for Czech language
  let name = destination.trim();
  let prep: "do" | "na" = "do";

  // Island checks
  if (/ostrov|island|beach|plaz/i.test(name)) {
    prep = "na";
  }

  // Declension heuristic
  if (name.endsWith("a")) {
    name = name.slice(0, -1) + "y";
  } else if (name.endsWith("e")) {
    name = name.slice(0, -1) + "e";
  } else if (!/[aeiouyáéíóúý]$/i.test(name)) {
    name = name + "u";
  }

  return includePreposition ? `${prep} ${name}` : name;
}

/**
 * Returns natural title for a flight landing page (e.g. "Akční letenky do Paříže", "Levné letenky na Mallorcu")
 */
export function formatFlightPageTitle(destination: string, minPrice?: number): string {
  const phrase = formatDestinationGenitive(destination, true);
  const priceSuffix = minPrice ? ` od ${minPrice.toLocaleString("cs-CZ").replace(/\u00a0/g, " ")} Kč` : "";
  return `Akční letenky ${phrase}${priceSuffix}`;
}