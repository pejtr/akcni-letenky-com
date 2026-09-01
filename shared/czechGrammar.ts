/**
 * Czech Destination Declension & Phrase Engine for Travel
 * 
 * Rules:
 * - Cities & regions use preposition "do" + 2. pád (genitiv), e.g. "do Paříže", "do Londýna".
 * - Islands & archipelagos use preposition "na" + 4. pád (akuzativ), e.g. "na Mallorku", "na Krétu", "na Island".
 * - For unknown destinations, NEVER guess cases via naive heuristics. Fallback safely to nominative with colon: "Akční letenky: [Název]".
 */

export interface DestinationGrammarEntry {
  title: string;
  preposition: "do" | "na";
  targetForm: string;     // 2. pád (pro "do") nebo 4. pád (pro "na")
  locativeForm: string;   // 6. pád (pro "v / na")
  locativePreposition: "v" | "ve" | "na";
}

const DESTINATION_DICTIONARY: Record<string, DestinationGrammarEntry> = {
  // --- Města a vnitrozemské státy ("do" + 2. pád / genitiv) ---
  "londyn": { title: "Londýn", preposition: "do", targetForm: "Londýna", locativeForm: "Londýně", locativePreposition: "v" },
  "london": { title: "Londýn", preposition: "do", targetForm: "Londýna", locativeForm: "Londýně", locativePreposition: "v" },
  "pariz": { title: "Paříž", preposition: "do", targetForm: "Paříže", locativeForm: "Paříži", locativePreposition: "v" },
  "paris": { title: "Paříž", preposition: "do", targetForm: "Paříže", locativeForm: "Paříži", locativePreposition: "v" },
  "rim": { title: "Řím", preposition: "do", targetForm: "Říma", locativeForm: "Římě", locativePreposition: "v" },
  "rome": { title: "Řím", preposition: "do", targetForm: "Říma", locativeForm: "Římě", locativePreposition: "v" },
  "barcelona": { title: "Barcelona", preposition: "do", targetForm: "Barcelony", locativeForm: "Barceloně", locativePreposition: "v" },
  "dubaj": { title: "Dubaj", preposition: "do", targetForm: "Dubaje", locativeForm: "Dubaji", locativePreposition: "v" },
  "dubai": { title: "Dubaj", preposition: "do", targetForm: "Dubaje", locativeForm: "Dubaji", locativePreposition: "v" },
  "new-york": { title: "New York", preposition: "do", targetForm: "New Yorku", locativeForm: "New Yorku", locativePreposition: "v" },
  "new york": { title: "New York", preposition: "do", targetForm: "New Yorku", locativeForm: "New Yorku", locativePreposition: "v" },
  "milan": { title: "Milán", preposition: "do", targetForm: "Milána", locativeForm: "Miláně", locativePreposition: "v" },
  "milano": { title: "Milán", preposition: "do", targetForm: "Milána", locativeForm: "Miláně", locativePreposition: "v" },
  "benatky": { title: "Benátky", preposition: "do", targetForm: "Benátek", locativeForm: "Benátkách", locativePreposition: "v" },
  "venice": { title: "Benátky", preposition: "do", targetForm: "Benátek", locativeForm: "Benátkách", locativePreposition: "v" },
  "lisabon": { title: "Lisabon", preposition: "do", targetForm: "Lisabonu", locativeForm: "Lisabonu", locativePreposition: "v" },
  "lisbon": { title: "Lisabon", preposition: "do", targetForm: "Lisabonu", locativeForm: "Lisabonu", locativePreposition: "v" },
  "porto": { title: "Porto", preposition: "do", targetForm: "Porta", locativeForm: "Portu", locativePreposition: "v" },
  "madrid": { title: "Madrid", preposition: "do", targetForm: "Madridu", locativeForm: "Madridu", locativePreposition: "v" },
  "amsterdam": { title: "Amsterdam", preposition: "do", targetForm: "Amsterdamu", locativeForm: "Amsterdamu", locativePreposition: "v" },
  "berlin": { title: "Berlín", preposition: "do", targetForm: "Berlína", locativeForm: "Berlíně", locativePreposition: "v" },
  "viden": { title: "Vídeň", preposition: "do", targetForm: "Vídně", locativeForm: "Vídni", locativePreposition: "ve" },
  "vienna": { title: "Vídeň", preposition: "do", targetForm: "Vídně", locativeForm: "Vídni", locativePreposition: "ve" },
  "budapest": { title: "Budapešť", preposition: "do", targetForm: "Budapešti", locativeForm: "Budapešti", locativePreposition: "v" },
  "praha": { title: "Praha", preposition: "do", targetForm: "Prahy", locativeForm: "Praze", locativePreposition: "v" },
  "prague": { title: "Praha", preposition: "do", targetForm: "Prahy", locativeForm: "Praze", locativePreposition: "v" },
  "tokio": { title: "Tokio", preposition: "do", targetForm: "Tokia", locativeForm: "Tokiu", locativePreposition: "v" },
  "tokyo": { title: "Tokio", preposition: "do", targetForm: "Tokia", locativeForm: "Tokiu", locativePreposition: "v" },
  "bangkok": { title: "Bangkok", preposition: "do", targetForm: "Bangkoku", locativeForm: "Bangkoku", locativePreposition: "v" },
  "singapur": { title: "Singapur", preposition: "do", targetForm: "Singapuru", locativeForm: "Singapuru", locativePreposition: "v" },
  "singapore": { title: "Singapur", preposition: "do", targetForm: "Singapuru", locativeForm: "Singapuru", locativePreposition: "v" },
  "dublin": { title: "Dublin", preposition: "do", targetForm: "Dublinu", locativeForm: "Dublinu", locativePreposition: "v" },
  "edinburg": { title: "Edinburgh", preposition: "do", targetForm: "Edinburghu", locativeForm: "Edinburghu", locativePreposition: "v" },
  "edinburgh": { title: "Edinburgh", preposition: "do", targetForm: "Edinburghu", locativeForm: "Edinburghu", locativePreposition: "v" },
  "oslo": { title: "Oslo", preposition: "do", targetForm: "Osla", locativeForm: "Oslu", locativePreposition: "v" },
  "stockholm": { title: "Stockholm", preposition: "do", targetForm: "Stockholmu", locativeForm: "Stockholmu", locativePreposition: "v" },
  "kodan": { title: "Kodaň", preposition: "do", targetForm: "Kodaně", locativeForm: "Kodani", locativePreposition: "v" },
  "copenhagen": { title: "Kodaň", preposition: "do", targetForm: "Kodaně", locativeForm: "Kodani", locativePreposition: "v" },
  "ateny": { title: "Athény", preposition: "do", targetForm: "Athén", locativeForm: "Athénách", locativePreposition: "v" },
  "athens": { title: "Athény", preposition: "do", targetForm: "Athén", locativeForm: "Athénách", locativePreposition: "v" },
  "split": { title: "Split", preposition: "do", targetForm: "Splitu", locativeForm: "Splitu", locativePreposition: "ve" },
  "dubrovnik": { title: "Dubrovník", preposition: "do", targetForm: "Dubrovníku", locativeForm: "Dubrovníku", locativePreposition: "v" },
  "zadar": { title: "Zadar", preposition: "do", targetForm: "Zadaru", locativeForm: "Zadaru", locativePreposition: "v" },
  "pula": { title: "Pula", preposition: "do", targetForm: "Puly", locativeForm: "Pule", locativePreposition: "v" },
  "bari": { title: "Bari", preposition: "do", targetForm: "Bari", locativeForm: "Bari", locativePreposition: "v" },
  "neapol": { title: "Neapol", preposition: "do", targetForm: "Neapole", locativeForm: "Neapoli", locativePreposition: "v" },
  "naples": { title: "Neapol", preposition: "do", targetForm: "Neapole", locativeForm: "Neapoli", locativePreposition: "v" },
  "catania": { title: "Katánie", preposition: "do", targetForm: "Katánie", locativeForm: "Katánii", locativePreposition: "v" },
  "katanie": { title: "Katánie", preposition: "do", targetForm: "Katánie", locativeForm: "Katánii", locativePreposition: "v" },
  "palermo": { title: "Palermo", preposition: "do", targetForm: "Palerma", locativeForm: "Palermu", locativePreposition: "v" },
  "malaga": { title: "Málaga", preposition: "do", targetForm: "Málagy", locativeForm: "Málaze", locativePreposition: "v" },
  "alicante": { title: "Alicante", preposition: "do", targetForm: "Alicante", locativeForm: "Alicante", locativePreposition: "v" },
  "valencie": { title: "Valencie", preposition: "do", targetForm: "Valencie", locativeForm: "Valencii", locativePreposition: "ve" },
  "valencia": { title: "Valencie", preposition: "do", targetForm: "Valencie", locativeForm: "Valencii", locativePreposition: "ve" },
  "sevilla": { title: "Sevilla", preposition: "do", targetForm: "Sevilly", locativeForm: "Seville", locativePreposition: "v" },
  "nice": { title: "Nice", preposition: "do", targetForm: "Nice", locativeForm: "Nice", locativePreposition: "v" },
  "marseille": { title: "Marseille", preposition: "do", targetForm: "Marseille", locativeForm: "Marseille", locativePreposition: "v" },
  "vietnam": { title: "Vietnam", preposition: "do", targetForm: "Vietnamu", locativeForm: "Vietnamu", locativePreposition: "ve" },
  "egypt": { title: "Egypt", preposition: "do", targetForm: "Egypta", locativeForm: "Egyptě", locativePreposition: "v" },
  "recko": { title: "Řecko", preposition: "do", targetForm: "Řecka", locativeForm: "Řecku", locativePreposition: "v" },
  "spanelsko": { title: "Španělsko", preposition: "do", targetForm: "Španělska", locativeForm: "Španělsku", locativePreposition: "ve" },
  "italie": { title: "Itálie", preposition: "do", targetForm: "Itálie", locativeForm: "Itálii", locativePreposition: "v" },
  "portugalsko": { title: "Portugalsko", preposition: "do", targetForm: "Portugalska", locativeForm: "Portugalsku", locativePreposition: "v" },
  "francie": { title: "Francie", preposition: "do", targetForm: "Francie", locativeForm: "Francii", locativePreposition: "ve" },
  "turecko": { title: "Turecko", preposition: "do", targetForm: "Turecka", locativeForm: "Turecku", locativePreposition: "v" },
  "istanbul": { title: "Istanbul", preposition: "do", targetForm: "Istanbulu", locativeForm: "Istanbulu", locativePreposition: "v" },

  // --- Ostrovy a souostroví ("na" + 4. pád / akuzativ) ---
  "mallorca": { title: "Mallorka", preposition: "na", targetForm: "Mallorku", locativeForm: "Mallorce", locativePreposition: "na" },
  "mallorka": { title: "Mallorka", preposition: "na", targetForm: "Mallorku", locativeForm: "Mallorce", locativePreposition: "na" },
  "majorka": { title: "Mallorka", preposition: "na", targetForm: "Mallorku", locativeForm: "Mallorce", locativePreposition: "na" },
  "ibiza": { title: "Ibiza", preposition: "na", targetForm: "Ibizu", locativeForm: "Isize", locativePreposition: "na" },
  "menorca": { title: "Menorca", preposition: "na", targetForm: "Menorcu", locativeForm: "Menorce", locativePreposition: "na" },
  "tenerife": { title: "Tenerife", preposition: "na", targetForm: "Tenerife", locativeForm: "Tenerife", locativePreposition: "na" },
  "gran-canaria": { title: "Gran Canaria", preposition: "na", targetForm: "Gran Canarii", locativeForm: "Gran Canarii", locativePreposition: "na" },
  "fuerteventura": { title: "Fuerteventura", preposition: "na", targetForm: "Fuerteventuru", locativeForm: "Fuerteventuře", locativePreposition: "na" },
  "lanzarote": { title: "Lanzarote", preposition: "na", targetForm: "Lanzarote", locativeForm: "Lanzarote", locativePreposition: "na" },
  "kanarske-ostrovy": { title: "Kanárské ostrovy", preposition: "na", targetForm: "Kanárské ostrovy", locativeForm: "Kanárských ostrovech", locativePreposition: "na" },
  "kreta": { title: "Kréta", preposition: "na", targetForm: "Krétu", locativeForm: "Krétě", locativePreposition: "na" },
  "rhodos": { title: "Rhodos", preposition: "na", targetForm: "Rhodos", locativeForm: "Rhodosu", locativePreposition: "na" },
  "korfu": { title: "Korfu", preposition: "na", targetForm: "Korfu", locativeForm: "Korfu", locativePreposition: "na" },
  "kos": { title: "Kos", preposition: "na", targetForm: "Kos", locativeForm: "Kosu", locativePreposition: "na" },
  "zakynthos": { title: "Zakynthos", preposition: "na", targetForm: "Zakynthos", locativeForm: "Zakynthosu", locativePreposition: "na" },
  "santorini": { title: "Santorini", preposition: "na", targetForm: "Santorini", locativeForm: "Santorini", locativePreposition: "na" },
  "mykonos": { title: "Mykonos", preposition: "na", targetForm: "Mykonos", locativeForm: "Mykonosu", locativePreposition: "na" },
  "kypr": { title: "Kypr", preposition: "na", targetForm: "Kypr", locativeForm: "Kypru", locativePreposition: "na" },
  "cyprus": { title: "Kypr", preposition: "na", targetForm: "Kypr", locativeForm: "Kypru", locativePreposition: "na" },
  "malta": { title: "Malta", preposition: "na", targetForm: "Maltu", locativeForm: "Maltě", locativePreposition: "na" },
  "madeira": { title: "Madeira", preposition: "na", targetForm: "Madeiru", locativeForm: "Madeiře", locativePreposition: "na" },
  "azory": { title: "Azory", preposition: "na", targetForm: "Azory", locativeForm: "Azorech", locativePreposition: "na" },
  "bali": { title: "Bali", preposition: "na", targetForm: "Bali", locativeForm: "Bali", locativePreposition: "na" },
  "maledivy": { title: "Maledivy", preposition: "na", targetForm: "Maledivy", locativeForm: "Maledivách", locativePreposition: "na" },
  "maldives": { title: "Maledivy", preposition: "na", targetForm: "Maledivy", locativeForm: "Maledivách", locativePreposition: "na" },
  "zanzibar": { title: "Zanzibar", preposition: "na", targetForm: "Zanzibar", locativeForm: "Zanzibaru", locativePreposition: "na" },
  "reunion": { title: "Réunion", preposition: "na", targetForm: "Réunion", locativeForm: "Réunionu", locativePreposition: "na" },
  "mauricius": { title: "Mauricius", preposition: "na", targetForm: "Mauricius", locativeForm: "Mauriciu", locativePreposition: "na" },
  "sri-lanka": { title: "Srí Lanka", preposition: "na", targetForm: "Srí Lanku", locativeForm: "Srí Lance", locativePreposition: "na" },
  "island": { title: "Island", preposition: "na", targetForm: "Island", locativeForm: "Islandu", locativePreposition: "na" },
  "iceland": { title: "Island", preposition: "na", targetForm: "Island", locativeForm: "Islandu", locativePreposition: "na" },
  "sicilie": { title: "Sicílie", preposition: "na", targetForm: "Sicílii", locativeForm: "Sicílii", locativePreposition: "na" },
  "sardinie": { title: "Sardínie", preposition: "na", targetForm: "Sardínii", locativeForm: "Sardínii", locativePreposition: "na" },
  "korsika": { title: "Korsika", preposition: "na", targetForm: "Korsiku", locativeForm: "Korsice", locativePreposition: "na" },
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
 * Returns exact verified dictionary entry or null if not verified
 */
export function getDestinationGrammar(destination: string): DestinationGrammarEntry | null {
  if (!destination) return null;
  const key = normalizeKey(destination);
  return DESTINATION_DICTIONARY[key] || null;
}

/**
 * Returns natural Czech phrase for flights to a destination.
 * For verified destinations: "do Londýna", "na Mallorku".
 * For unverified destinations: returns the name in nominative without broken declension.
 */
export function formatDestinationGenitive(destination: string, includePreposition: boolean = true): string {
  if (!destination) return "";
  const entry = getDestinationGrammar(destination);

  if (entry) {
    return includePreposition ? `${entry.preposition} ${entry.targetForm}` : entry.targetForm;
  }

  // Safe fallback: never guess cases with heuristics
  return destination.trim();
}

/**
 * Returns natural title for flight pages with safe fallbacks:
 * - Verified: "Akční letenky do Paříže od 890 Kč", "Akční letenky na Mallorku od 1 290 Kč"
 * - Unverified: "Akční letenky: [Název] od [Cena] Kč"
 */
export function formatFlightPageTitle(destination: string, minPrice?: number): string {
  if (!destination) return "Akční letenky";
  const entry = getDestinationGrammar(destination);
  const priceSuffix = minPrice ? ` od ${minPrice.toLocaleString("cs-CZ").replace(/\u00a0/g, " ")} Kč` : "";

  if (entry) {
    return `Akční letenky ${entry.preposition} ${entry.targetForm}${priceSuffix}`;
  }

  // Safe fallback for unreviewed foreign names
  return `Akční letenky: ${destination.trim()}${priceSuffix}`;
}