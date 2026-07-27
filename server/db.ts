import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "../drizzle/schema";
import { InsertUser, users, flights, Flight, InsertFlight, wishlists, Wishlist, InsertWishlist, offerViews, OfferView, InsertOfferView } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL, { schema, mode: 'default' });
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Flight Offers Queries

export async function getFeaturedFlights(): Promise<Flight[]> {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(flights)
    .where(eq(flights.isFeatured, 1))
    .orderBy(desc(flights.createdAt))
    .limit(4);

  return result;
}

export async function getAllFlights(): Promise<Flight[]> {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(flights)
    .orderBy(desc(flights.createdAt));

  return result;
}

export async function getFlightById(id: number): Promise<Flight | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(flights)
    .where(eq(flights.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function searchFlights(params: {
  fromCity?: string;
  toCity?: string;
  departureDate?: Date;
  maxPrice?: number;
}): Promise<Flight[]> {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];

  if (params.fromCity) {
    conditions.push(eq(flights.fromCity, params.fromCity));
  }
  if (params.toCity) {
    conditions.push(eq(flights.toCity, params.toCity));
  }
  if (params.departureDate) {
    conditions.push(gte(flights.departureDate, params.departureDate));
  }
  if (params.maxPrice) {
    conditions.push(lte(flights.price, params.maxPrice));
  }

  const result = await db
    .select()
    .from(flights)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(flights.createdAt));

  return result;
}

export async function insertFlight(flight: InsertFlight): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(flights).values(flight);
}

// Wishlist Queries

export async function getUserWishlists(userId: number): Promise<Wishlist[]> {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(wishlists)
    .where(eq(wishlists.userId, userId));

  return result;
}

export async function addToWishlist(userId: number, flightId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(wishlists).values({ userId, flightId });
}

export async function removeFromWishlist(userId: number, flightId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .delete(wishlists)
    .where(and(eq(wishlists.userId, userId), eq(wishlists.flightId, flightId)));
}

// Destination-based Wishlist Queries (for localStorage sync)

export interface WishlistSyncItem {
  id: string; // destinationId slug
  addedAt: number; // Unix timestamp ms
  isFavorite: boolean;
}

export async function getUserDestinationWishlist(userId: number): Promise<WishlistSyncItem[]> {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      destinationId: wishlists.destinationId,
      addedAt: wishlists.addedAt,
      isFavorite: wishlists.isFavorite,
    })
    .from(wishlists)
    .where(and(
      eq(wishlists.userId, userId),
      sql`${wishlists.destinationId} IS NOT NULL`
    ));

  return result.map(r => ({
    id: r.destinationId!,
    addedAt: r.addedAt || Date.now(),
    isFavorite: r.isFavorite === 1,
  }));
}

export async function addDestinationToWishlist(
  userId: number,
  destinationId: string,
  addedAt: number,
  isFavorite: boolean
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Check if already exists
  const existing = await db
    .select({ id: wishlists.id })
    .from(wishlists)
    .where(and(
      eq(wishlists.userId, userId),
      eq(wishlists.destinationId, destinationId)
    ))
    .limit(1);

  if (existing.length > 0) {
    // Update existing
    await db.update(wishlists)
      .set({ isFavorite: isFavorite ? 1 : 0, addedAt })
      .where(eq(wishlists.id, existing[0].id));
  } else {
    // Insert new
    await db.insert(wishlists).values({
      userId,
      flightId: 0, // legacy field, not used for destination-based wishlist
      destinationId,
      addedAt,
      isFavorite: isFavorite ? 1 : 0,
    });
  }
}

export async function removeDestinationFromWishlist(
  userId: number,
  destinationId: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .delete(wishlists)
    .where(and(
      eq(wishlists.userId, userId),
      eq(wishlists.destinationId, destinationId)
    ));
}

export async function syncWishlistFromClient(
  userId: number,
  clientItems: WishlistSyncItem[]
): Promise<WishlistSyncItem[]> {
  const db = await getDb();
  if (!db) return clientItems;

  // Get server items
  const serverItems = await getUserDestinationWishlist(userId);

  // Merge: union of both sets, preferring most recent addedAt
  const merged = new Map<string, WishlistSyncItem>();

  // Add server items first
  for (const item of serverItems) {
    merged.set(item.id, item);
  }

  // Merge client items (keep newer addedAt, prefer isFavorite=true)
  for (const item of clientItems) {
    const existing = merged.get(item.id);
    if (!existing) {
      merged.set(item.id, item);
    } else {
      // Keep the one with more recent addedAt, prefer isFavorite=true
      merged.set(item.id, {
        id: item.id,
        addedAt: Math.max(existing.addedAt, item.addedAt),
        isFavorite: existing.isFavorite || item.isFavorite,
      });
    }
  }

  const mergedItems = Array.from(merged.values());

  // Write merged items back to DB
  for (const item of mergedItems) {
    await addDestinationToWishlist(userId, item.id, item.addedAt, item.isFavorite);
  }

  // Remove items from DB that are not in merged set (items removed on client)
  for (const serverItem of serverItems) {
    if (!merged.has(serverItem.id)) {
      await removeDestinationFromWishlist(userId, serverItem.id);
    }
  }

  return mergedItems;
}

export async function updateDestinationFavorite(
  userId: number,
  destinationId: string,
  isFavorite: boolean
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(wishlists)
    .set({ isFavorite: isFavorite ? 1 : 0 })
    .where(and(
      eq(wishlists.userId, userId),
      eq(wishlists.destinationId, destinationId)
    ));
}

// Offer Views Queries

export async function getOfferViews(flightId: number): Promise<OfferView | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(offerViews)
    .where(eq(offerViews.flightId, flightId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function incrementOfferViews(flightId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const existing = await getOfferViews(flightId);

  if (existing) {
    await db
      .update(offerViews)
      .set({ viewCount: (existing.viewCount || 0) + 1, lastUpdated: new Date() })
      .where(eq(offerViews.flightId, flightId));
  } else {
    await db.insert(offerViews).values({ flightId, viewCount: 1 });
  }
}

// Article Queries

const FALLBACK_ARTICLES = [
  {
    id: 901,
    title: "Věda potvrzuje: Lidé, kteří více cestují, jsou doslova chytřejší!",
    slug: "veda-potvrzuje-lide-kteri-cestuji-jsou-chytrejsi",
    excerpt: "Nejnovější poznatky neurovědy a psychologie dokazují to, co vášniví cestovatelé tuší už dlouho: Cestování do nových míst fyzicky mění strukturu mozku, podporuje neuroplasticitu, zvyšuje kreativitu a dělá nás chytřejšími.",
    metaDescription: "Věda potvrzuje: Lidé, kteří více cestují, jsou doslova chytřejší! Zjistěte, jak cestování fyzicky mění náš mozek, zvyšuje kreativitu a kognitivní flexibilitu.",
    keywords: "cestování a mozek, vědecké výzkumy cestování, neuroplasticita, kreativita, výhody cestování, akční letenky, rozvoj osobnosti",
    featuredImage: "/images/cestovani-mozok-chytrejsi.jpg",
    author: "Redakce Akční-Letenky.com",
    category: "tips",
    status: "published",
    publishedAt: new Date("2026-07-27T10:00:00Z"),
    createdAt: new Date("2026-07-27T10:00:00Z"),
    updatedAt: new Date("2026-07-27T10:00:00Z"),
    viewCount: 1420,
    content: `<article class="travel-tip-article">

<p class="lead">Přemýšleli jste někdy nad tím, proč se po návratu z dovolené nebo dobrodružné cesty cítíte mentálně svěžejší, plní nápadů a schopní řešit i ty nejsložitější překážky s nadhledem? Není to jen příjemný pocit po odpočinku. <strong>Nejnovější výzkumy z oblasti neurovědy a kognitivní psychologie potvrzují fascinující fakt: lidé, kteří více cestují, jsou doslova chytřejší.</strong></p>

<img src="/images/cestovani-mozok-chytrejsi.jpg" alt="Věda potvrzuje: Lidé kteří více cestují jsou chytřejší" class="w-full rounded-2xl shadow-lg my-6 border border-gray-200" />

<h2>1. Neuroplasticita: Jak nové prostředí fyzicky přetváří mozek</h2>
<p>Náš mozek je neuvěřitelně přizpůsobivý orgán. Tento jev se nazývá <em>neuroplasticita</em> — schopnost mozku vytvářet nová neuronová spojení v reakci na nové podněty. Když zůstáváme v každodenní rutině (stejná cesta do práce, stejná strava, stejné prostředí), mozek funguje v režimu "autopilota" a využívá stále stejné zavedené dráhy.</p>
<p>Jakmile však vyrazíte do neznámého prostředí — ať už je to exotická <a href="/letenky-do-vietnamu" class="text-blue-600 font-bold hover:underline">Hanoj</a>, živý <a href="/dubaj" class="text-blue-600 font-bold hover:underline">Dubaj</a> nebo romantická <a href="/pariz" class="text-blue-600 font-bold hover:underline">Paříž</a> — mozek je zaplaven novými vizuálními, zvukovými i čichovými vjemy. Musí se učit orientovat v nových ulicích, dešifrovat cizí jazyk a chápat odlišné kulturní zvyky. Výsledek? Vytváření tisíců nových synapsí a udržování mozku v mladistvé kondici.</p>

<h2>2. Raketový růst kreativity a kognitivní flexibility</h2>
<p>Výzkumy profesorky Adama Galinského z Columbia Business School jednoznačně prokázaly přímé propojení mezi mezinárodním cestováním a zvýšením kreativity. Cestování podporuje takzvanou <strong>kognitivní flexibilitu</strong> — schopnost přepínat mezi různými myšlenkovými koncepty a nahlížet na problémy z zcela nových úhlů.</p>

<div class="my-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border-l-4 border-l-blue-600 shadow-sm">
  <h3 class="font-bold text-lg text-blue-950 mb-2">💡 Klíčový vědecký poznatek:</h3>
  <p class="text-sm text-blue-900 leading-relaxed">
    Není to jen o pasivním ležení na pláži. Nejmocnější stimul pro mozek představuje <strong>hluboké ponoření do cizí kultury</strong> (zkoušení místního jídla, konverzace s místními, učení se základním frázičkám). Tento proces nutí mozek opustit navyklé vzorce myšlení a přijímat neotřelé nápady.
  </p>
</div>

<h2>3. Vylepšené schopnosti řešení komplexních problémů</h2>
<p>Cestování nás staví do nečekaných situací. Zmeškaný vlak, hledání správného nástupiště v cizojazyčném metru nebo placení cizí měnou bez kalkulačky — každá tato situace vyžaduje okamžitou analýzu a rychlé rozhodování. Trénuje se tím prefrontální kůra mozková, která je zodpovědná za plánování, kritické myšlení a řešení problémů.</p>
<p>Lidé, kteří pravidelně cestují, vykazují výrazně vyšší odolnost vůči stresu (takzvanou psychickou rezilienci) a dokáží v krizových situacích zachovat chladnou hlavu.</p>

<h2>4. Snížení kortizolu a celkový restart kapacity paměti</h2>
<p>Chronický stres v běžném pracovním životě uvolňuje hormon kortizol, který doslova poškozuje hippocampus — oblast mozku zodpovědnou za paměť a učení. Cestování a odpojení od každodenních povinností snižuje hladinu stresových hormonů, což umožňuje neuronům regenerovat. Po návratu z cesty tak vaše paměť i schopnost soustředění fungují na výrazně vyšší úrovni.</p>

<h2>Chcete dát svému mozku nejlepší trénink? Vyrazte za dobrodružstvím!</h2>
<p>Pravidelné cestování je tou nejlepší investicí do vlastního rozvoje a zdraví vašeho mozku. A dobrou zprávou je, že k tomu nemusíte utratit majlant. Na <a href="/levne-letenky" class="text-blue-600 font-bold hover:underline">Akční-Letenky.com</a> pro vás denně vyhledáváme ty nejvýhodnější letenky do celého světa s přímým odkazem na rezervaci na Pelikán.cz.</p>

</article>`,
  },
  {
    id: 902,
    title: "TOP Termální prameny v Itálii pro dokonalý wellness: 4 nejkrásnější resorty a lázně",
    slug: "top-termalni-prameny-v-italii-wellness",
    excerpt: "Objevit horké prameny v Toskánsku, alpské lázně v Bormiu nebo termální parky na ostrově Ischia je zážitek na celý život. Podívejte se na 4 nejkrásnější termální resorty v Itálii s reálnými fotkami a tipy na letenky.",
    metaDescription: "TOP 4 termální prameny v Itálii: Saturnia, Bormio, Sirmione u Lago di Garda a ostrov Ischia. Reálné fotky, praktické tipy a nejlevnější letenky do Itálie.",
    keywords: "termální prameny Itálie, Terme di Saturnia, Bormio lázně, Sirmione ubytování, Ischia termály, wellness Itálie, akční letenky Itálie",
    featuredImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80",
    author: "Redakce Akční-Letenky.com",
    category: "tips",
    status: "published",
    publishedAt: new Date("2026-07-27T11:00:00Z"),
    createdAt: new Date("2026-07-27T11:00:00Z"),
    updatedAt: new Date("2026-07-27T11:00:00Z"),
    viewCount: 1850,
    content: `<article class="travel-tip-article">

<p class="lead">Itálie není jen zemí písečných pláží, historie a vynikající gastronomie. Je také evropskou velmocí v oblasti přírodních horkých pramenů a luxusních termálních resortů. Díky bohaté vulkanické činnosti zde vyvěrají stovky minerálních pramenů s léčivými účinky na tělo i mysl.</p>

<p>Přinášíme vám podrobný přehled <strong>4 nejkrásnějších termálních resortů a horkých pramenů v Itálii</strong> s reálnými fotografiemi a praktickými tipy, jak se k nim dostat nejlevněji.</p>

<hr class="my-8" />

<h2>1. Cascate del Mulino / Terme di Saturnia (Toskánsko)</h2>
<p>Kaskády Saturnia v srdci toskánské přírody patří k nejfotogeničtějším horkým pramenům na světě. Těrchavá tyrkysová voda o stálé teplotě 37,5 °C stéká po přírodních travertinových terasách pod širým nebem. Kaskády jsou volně přístupné zdarma 24 hodin denně 7 dní v týdnu.</p>

<img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1000&q=80" alt="Terme di Saturnia - Termální prameny Toskánsko" class="w-full rounded-2xl shadow-lg my-6 border border-gray-200" />

<ul class="space-y-2 mb-6">
  <li><strong>Teplota vody:</strong> 37,5 °C celoročně</li>
  <li><strong>Typ:</strong> Sírné minerální prameny pro regeneraci pokožky a kloubů</li>
  <li><strong>Vstupné:</strong> Přírodní kaskády zdarma / Přílehlý 5* Terme di Saturnia Resort s poplatkem</li>
  <li><strong>Jak se tam dostat:</strong> Nejvýhodnější je letět akční letenkou do <a href="/rim" class="text-blue-600 font-bold hover:underline">Říma</a> nebo <a href="/florencie" class="text-blue-600 font-bold hover:underline">Florencie</a> a půjčit si auto na 1,5 hodiny jízdy.</li>
</ul>

<hr class="my-8" />

<h2>2. QC Terme Bagni Vecchi & Bagni Nuovi (Bormio, Lombardie)</h2>
<p>Lázně Bormio v italských Alpách nabízejí unikátní spojení historických římských lázní a dechberoucích výhledů na zasněžené alpské vrcholky. Panoramatický venkovní bazén v Bagni Vecchi je vysekaný přímo do skalní stěny a lázeňský komplex Bagni Nuovi nabízí přes 30 různých termálních procedur.</p>

<img src="https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1000&q=80" alt="QC Terme Bormio - Alpské termální lázně" class="w-full rounded-2xl shadow-lg my-6 border border-gray-200" />

<ul class="space-y-2 mb-6">
  <li><strong>Teplota vody:</strong> 36 °C až 43 °C</li>
  <li><strong>Hlavní lákadlo:</strong> Římské lázně v jeskyních a výhled na zasněžené Alpy</li>
  <li><strong>Vstupné:</strong> Denní vstup QC Terme od cca 52 €</li>
  <li><strong>Jak se tam dostat:</strong> Letenky do <a href="/milan" class="text-blue-600 font-bold hover:underline">Milána (Bergamo / Malpensa)</a> a následně scénickým vlakem nebo autem směr Bormio.</li>
</ul>

<hr class="my-8" />

<h2>3. Aquaria Thermal SPA & Terme di Sirmione (Lago di Garda)</h2>
<p>Na romantickém poloostrově vybíhajícím do jezera Lago di Garda leží městečko Sirmione. Místní prameny vyvěrají přímo ze dna jezera a nabízejí vysoký obsah síry, bromu a jódu. Aquaria Thermal SPA disponuje venkovními termálními bazény s panoramatickým výhledem na jezero a středověký hrad Castello Scaligero.</p>

<img src="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1000&q=80" alt="Terme di Sirmione - Lago di Garda termální spa" class="w-full rounded-2xl shadow-lg my-6 border border-gray-200" />

<ul class="space-y-2 mb-6">
  <li><strong>Teplota vody:</strong> 37 °C v termálních bazénech</li>
  <li><strong>Využití:</strong> Léčba dýchacích cest, regenerace těla a romantický wellness v západu slunce</li>
  <li><strong>Vstupné:</strong> 5hodinový vstup cca 44 €</li>
  <li><strong>Jak se tam dostat:</strong> Letenky do <a href="/verona" class="text-blue-600 font-bold hover:underline">Benátek</a> nebo <a href="/milan" class="text-blue-600 font-bold hover:underline">Milána</a> a krátká jízda k jezeru Garda.</li>
</ul>

<hr class="my-8" />

<h2>4. Poseidonovy a Negombo termální zahrady (Ostrov Ischia)</h2>
<p>Ostrov Ischia v Neapolském zálivu je známý jako zelený ostrov mládí. Poseidonovy zahrady (Giardini Poseidon) jsou největším termálním parkem na ostrově s více než 20 termálními bazény obklopenými bujnou středomořskou vegetací přímo nad privátní pláží.</p>

<img src="https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1000&q=80" alt="Poseidonovy termální zahrady Ischia" class="w-full rounded-2xl shadow-lg my-6 border border-gray-200" />

<ul class="space-y-2 mb-6">
  <li><strong>Teplota vody:</strong> Variabilní bazény od 28 °C do 40 °C</li>
  <li><strong>Vybavení:</strong> Přírodní sauny v jeskyních, Kneippovy chodníky, mořské bazény a soukromá pláž</li>
  <li><strong>Vstupné:</strong> Celodenní vstup cca 38 €</li>
  <li><strong>Jak se tam dostat:</strong> Přímé akční letenky do <a href="/neapol" class="text-blue-600 font-bold hover:underline">Neapole</a> a odtud 45 minut trajektem na ostrov Ischia.</li>
</ul>

<hr class="my-8" />

<h2>Naplánujte si wellness dovolenou v Itálii s nejlevnější letenkou</h2>
<p>Všechny tyto nádherné termální resorty jsou z České republiky snadno dostupné. Na <a href="/levne-letenky" class="text-blue-600 font-bold hover:underline">Akční-Letenky.com</a> najdete denně aktualizovaný přehled nejlevnějších letenek do Říma, Milána, Benátek i Neapole.</p>

</article>`,
  },
  {
    id: 903,
    title: "Via Etnea v Catanii: Romantická procházka s výhledem na kouřící Etnu a typickou sicilskou atmosférou",
    slug: "via-etnea-catania-romantika",
    excerpt: "Objevit nejkrásnější bulvár Sicílie pod majestátní Etnou je nezapomenutelný zážitek. Přinášíme vám romantického průvodce po Via Etnea v Catanii s atmosféru nasátými fotografiemi, kavárnami a tipy na nejlevnější letenky.",
    metaDescription: "Via Etnea v Catanii: Romantická procházka pod soptící Etnou. Atmosférické fotky, nejlepší barokní kavárny, kulinářské tipy a nejlevnější letenky na Sicílii.",
    keywords: "Via Etnea Catania, Catania romantika, Sicílie cestování, fotky Catania, letenky na Sicílii, Etna výhledy, baroko Catania",
    featuredImage: "https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?w=1200&q=80",
    author: "Redakce Akční-Letenky.com",
    category: "tips",
    status: "published",
    publishedAt: new Date("2026-07-27T12:00:00Z"),
    createdAt: new Date("2026-07-27T12:00:00Z"),
    updatedAt: new Date("2026-07-27T12:00:00Z"),
    viewCount: 1690,
    content: `<article class="travel-tip-article">

<p class="lead">Pokud existuje ulice, která dokonale zachycuje duši Sicílie, je to <strong>Via Etnea v Catanii</strong>. Tato tři kilometry dlouhá barokní tepna spojuje historické srdce města na Piazza del Duomo s úpatím majestátní sopky Etny. Procházka po černých lávových dlažebních kostkách za soumraku s pohledem na dýmající kráter je jedním z nejromantičtějších zážitků, které můžete v Itálii prožít.</p>

<img src="https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?w=1000&q=80" alt="Via Etnea v Catanii s barokní architekturou" class="w-full rounded-2xl shadow-lg my-6 border border-gray-200" />

<h2>1. Procházka pod barokními fasádami z lávového kamene</h2>
<p>Co dělá Via Etnea tak jedinečnou, je její architektura. Po zničujícím zemětřesení v roce 1693 byla celá ulička přestavěna z černého lávového kamene a bílého vápence v jedinečném stylu sicilského baroka. Paláce jako <em>Palazzo San Giuliano</em> nebo <em>Palazzo Universitá</em> vytvářejí úchvatnou kulisu pro odpolední romantické toulky.</p>

<img src="https://images.unsplash.com/photo-1548625361-188b8e0a6d0c?w=1000&q=80" alt="Pohled na majestátní sopku Etna z ulice Via Etnea" class="w-full rounded-2xl shadow-lg my-6 border border-gray-200" />

<h2>2. Romantická káva a autentičnost sicilských cannoli</h2>
<p>Žádná procházka po Via Etnea se neobejde bez zastávky v tradiční sicilské kavárně. Zastavte se v historické kavárně <strong>Pasticceria Savia</strong> (založené roku 1897), kde můžete ochutnat legendární čerstvě plněná <em>cannoli</em> s krémem ze zrající ricotty, posypaná pistáciemi z Bronte, a k tomu pravé sicilské espresso.</p>

<img src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1000&q=80" alt="Typická sicilská káva a tradiční sladkosti na Via Etnea" class="w-full rounded-2xl shadow-lg my-6 border border-gray-200" />

<h2>3. Zelená oáza Villa Bellini a večerní atmosféra</h2>
<p>Uprostřed bulváru se rozkládá nejstarší městský park Catanie — <strong>Villa Bellini</strong>. Projděte se mezi staletými palmami, fontánami a vystoupejte na vrcholový altán, odkud je při západu slunce nejkrásnější panoramatický výhled na celé město a dýmající vrchol sopky Etny.</p>

<img src="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1000&q=80" alt="Atmosférický západ slunce nad barokními střechami Catanie" class="w-full rounded-2xl shadow-lg my-6 border border-gray-200" />

<h2>Jak naplánovat romantický víkend v Catanii nejlevněji?</h2>
<p>Do Catanie létají přímé nízkonákladové spoje přímo z Prahy i z okolních letišť (Vídeň, Katovice). Na <a href="/levne-letenky" class="text-blue-600 font-bold hover:underline">Akční-Letenky.com</a> naleznete denně akční ponuky zpátečních letenek do Catanie již od 1 290 Kč.</p>

</article>`,
  },
  {
    id: 904,
    title: "Coperto v Itálii: Co to je, kolik se platí a jak funguje stolování v italské restauraci",
    slug: "coperto-co-to-je",
    excerpt: "Chystáte se do Itálie a přemýšlíte, co znamená položka Coperto na vašem účtu v restauraci? Vysvětlíme vám tradici krytí stolu, rozdíl mezi coperto a servizio, kolik běžně zaplatíte a jak správně stolovat.",
    metaDescription: "Coperto v Itálii: Kompletní průvodce. Co znamená coperto v jídelním lístku, kolik stojí, jaký je rozdíl oproti spropitnému a praktické tipy pro stolování v Itálii.",
    keywords: "coperto Itálie, coperto co to je, restaurace v Itálii, poplatek za stůl Itálie, spropitné v Itálii, italská kuchyně, akční letenky Itálie",
    featuredImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80",
    author: "Redakce Akční-Letenky.com",
    category: "tips",
    status: "published",
    publishedAt: new Date("2026-07-27T13:00:00Z"),
    createdAt: new Date("2026-07-27T13:00:00Z"),
    updatedAt: new Date("2026-07-27T13:00:00Z"),
    viewCount: 2100,
    content: `<article class="travel-tip-article">

<p class="lead">Při první návštěvě italské restaurace bývá mnoho českých turistů překvapeno, když na závěrečném účtu objeví položku <strong>"Coperto"</strong> (často 1,50 € až 3,00 € na osobu). Nejedná se o podvod ani skrytý poplatek — jde o staletou italskou tradici s fascinující historií.</p>

<img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000&q=80" alt="Stolování v italské restauraci - Coperto" class="w-full rounded-2xl shadow-lg my-6 border border-gray-200" />

<h2>Co přesně Coperto znamená?</h2>
<p>Slovo <em>coperto</em> pochází ze středověku z italského výrazu pro "krytí" nebo "střechu nad hlavou". Původně hosté v zájezdních hostincích platili poplatek za to, že se mohli posadit pod střechu a sníst si vlastní přinesené jídlo. Hostinský jim k tomu poskytl stůl, příbory, talíře a chléb.</p>

<p>V moderní italské gastronomii poplatek <strong>Coperto pokrývá</strong>:</p>
<ul class="space-y-2 my-4">
  <li>✅ Prostření stolu (látkový ubrus, ubrousky, příbory a sklenice)</li>
  <li>✅ Čerstvé pečivo (košík s chlebem, grissini nebo focacciou)</li>
  <li>✅ Olivový olej, balzamikový ocet, sůl a pepř na stole</li>
</ul>

<img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&q=80" alt="Italská trattoria s tradičním prostřením stolu" class="w-full rounded-2xl shadow-lg my-6 border border-gray-200" />

<h2>Rozdíl mezi Coperto a Servizio</h2>
<p>Je důležité nerozptýlit se mezi dvěma různými položkami na účtu:</p>

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
  <div class="bg-amber-50 p-5 rounded-2xl border border-amber-200">
    <h3 class="font-bold text-amber-950 mb-2">🍞 Coperto (Krytí stolu)</h3>
    <p class="text-sm text-amber-900">Pevná částka za osobu (typicky 1,50 € – 3,50 €). Je uvedena v jídelním lístku a platí ji všichni hosté sedící u stolu.</p>
  </div>
  <div class="bg-blue-50 p-5 rounded-2xl border border-blue-200">
    <h3 class="font-bold text-blue-950 mb-2">🍷 Servizio (Poplatek za obsluhu)</h3>
    <p class="text-sm text-blue-900">Procentuální příplatek (obvykle 10 % – 15 %), který se objevuje hlavně v turistických centrech nebo při ubytování větších skupin.</p>
  </div>
</div>

<img src="https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1000&q=80" alt="Tradiční italské jídlo, víno a prostření" class="w-full rounded-2xl shadow-lg my-6 border border-gray-200" />

<h2>Dává se v Itálii spropitné (Mancia)?</h2>
<p>Jelikož je <em>Coperto</em> již započítáno v účtu, klasické spropitné jako v ČR (10 %) se v Itálii nevyžaduje. Pokud jste byli s jídlem a obsluhou velmi spokojeni, je zvykem nechat na stole několik drobných mincí (1 € až 2 € na osobu).</p>

<h2>Jak ušetřit za stolování v Itálii?</h2>
<p>Pokud chcete ušetřit a dát si kávu nebo rychlé panino bez poplatku coperto, posaďte se <strong>"al banco" (na baru)</strong>. V Itálii platí pravidlo, že konzumace na baru je bez coperta a výrazně levnější než konzumace "al tavolo" (u stolu).</p>

<img src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1000&q=80" alt="Venkovní terasa restaurace v Itálii za soumraku" class="w-full rounded-2xl shadow-lg my-6 border border-gray-200" />

<h2>Zažijte pravou italskou gastronomii zblízka</h2>
<p>Chystáte se do Říma, Milána, Benátek nebo Neapole? Sledujte aktuální <a href="/levne-letenky" class="text-blue-600 font-bold hover:underline">akční letenky do Itálie</a> na Akční-Letenky.com a rezervujte s garancí nejnižších cen přímo na Pelikán.cz!</p>

</article>`,
  },
  {
    id: 905,
    title: "Sardinský sýr Pecorino Sardo: Tradiční klenot Sardinie s bohatou fotogalerií a tipy na ochutnávku",
    slug: "sardinsky-syr-pecorino",
    excerpt: "Objevte tajné kouzlo tradičního sýru Pecorino Sardo DOP z čistého ovčího mléka. Zjistěte, jak se vyrábí na pastvinách divoké Sardinie, jaké má odrůdy, jak ho kombinovat s víním a kde ho ochutnat.",
    metaDescription: "Sardinský sýr Pecorino Sardo DOP: Průvodce tradičním ovčím sýrem ze Sardinie. Fotky, odrůdy Dolce a Maturo, párování s vínem Cannonau a letenky na Sardinii.",
    keywords: "Pecorino Sardo, sardinský sýr pecorino, sýr ze Sardinie, gastronomie Sardinie, letenky na Sardinii, Cagliari, Olbia, Alghero",
    featuredImage: "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=1200&q=80",
    author: "Redakce Akční-Letenky.com",
    category: "tips",
    status: "published",
    publishedAt: new Date("2026-07-27T14:00:00Z"),
    createdAt: new Date("2026-07-27T14:00:00Z"),
    updatedAt: new Date("2026-07-27T14:00:00Z"),
    viewCount: 1980,
    content: `<article class="travel-tip-article">

<p class="lead">Pokud navštívíte čarovný ostrov Sardinie, okamžitě si všimnete dvou věcí: průzračného moře a všudypřítomné vůně tradičního sýru <strong>Pecorino Sardo DOP</strong>. Tento tvrdý ovčí sýr je po staletí pýchou místních shepherdů a jedním z nejdůležitějších symbolů sardinské gastronomie a dlouhověkosti obyvatel.</p>

<img src="https://images.unsplash.com/photo-1452195100486-9cc805987862?w=1000&q=80" alt="Bochníky sýru Pecorino Sardo ze Sardinie" class="w-full rounded-2xl shadow-lg my-6 border border-gray-200" />

<h2>1. 100% čisté ovčí mléko z nedotčených sardinských pastvin</h2>
<p>Na rozdil od jiných italských sýrů se vysoce ceněný <em>Pecorino Sardo DOP</em> vyrábí výhradně z plnotučného mléka autochtonního plemene sardinských ovcí. Ty se po celý rok volně pasou na horských loukách plných divokých bylinek, tymiánu a rozmarýnu, což dodává sýru jeho charakteristickou bohatou a bylinkovou vůni.</p>

<img src="https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=1000&q=80" alt="Ovce na divokých horských pastvinách na Sardinii" class="w-full rounded-2xl shadow-lg my-6 border border-gray-200" />

<h2>2. Dva druhy Pecorino Sardo: Dolce vs. Maturo</h2>
<p>Pecorino Sardo se vyrábí ve dvou hlavních variantách, které se liší dobou zrání a chutí:</p>

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
  <div class="bg-[#FFFDF5] p-5 rounded-2xl border border-amber-300">
    <h3 class="font-bold text-amber-950 mb-2">🧀 Pecorino Sardo Dolce (Jemný)</h3>
    <p class="text-sm text-amber-900">Zraje pouze 20 až 60 dní. Má světlou barvu, měkčí elastickou texturu a velmi jemnou, sladce mléčnou chuť s tóny čerstvého másla.</p>
  </div>
  <div class="bg-amber-100/60 p-5 rounded-2xl border border-amber-400">
    <h3 class="font-bold text-amber-950 mb-2">🍷 Pecorino Sardo Maturo (Vyzrálý)</h3>
    <p class="text-sm text-amber-900">Zraje minimálně 2 až 12 měsíců. Získává slamově žlutou až hnědou kůru, slamnatou zrnitou strukturu a intenzivní, slanou až pikantní chuť.</p>
  </div>
</div>

<img src="https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=1000&q=80" alt="Nakrájený sýr Pecorino s ořechy a medem" class="w-full rounded-2xl shadow-lg my-6 border border-gray-200" />

<h2>3. Jak správně párovat Pecorino s víním a medem?</h2>
<p>Místní obyvatelé na Sardinii doporučují podávat vyzrálé Pecorino s kapkou hustého sardinského medu (např. hořkého medu z planiky <em>Miele di Corbezzolo</em>) a podávat ho spolu s ikonickým křupavým chlebem <strong>Pane Carasau</strong>.</p>
<p>K jemnějšímu typu <em>Dolce</em> se skvěle hodí svěží bílé víno <strong>Vermentino di Gallura DOCG</strong>, zatímco k vyzrálému <em>Maturo</em> je ideální plné červené víno <strong>Cannonau di Sardegna</strong>.</p>

<img src="https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=1000&q=80" alt="Tradiční servírování sýru Pecorino s víním a prkénkem" class="w-full rounded-2xl shadow-lg my-6 border border-gray-200" />

<h2>Ochutnejte originální Pecorino přímo na Sardinii!</h2>
<p>Na Sardinii létají přímé spoje z Prahy i okolních letišť do městeček <a href="/cagliari" class="text-blue-600 font-bold hover:underline">Cagliari</a>, <a href="/olbia" class="text-blue-600 font-bold hover:underline">Olbia</a> nebo <a href="/alghero" class="text-blue-600 font-bold hover:underline">Alghero</a>. Vyhledejte si nejvýhodnější <a href="/levne-letenky" class="text-blue-600 font-bold hover:underline">akční letenky na Sardinii</a> na Akční-Letenky.com a užijte si nezapomenutelnou gastro dovolenou!</p>

</article>`,
  },
  {
    id: 906,
    title: "Kam na nejlepší pizzu v Římě: Průvodce ikonickými pizzeriemi s fotogalerií vyhlášených pizz",
    slug: "kam-na-nejlepsi-pizzu-rim",
    excerpt: "Chystáte se do Věčného města a toužíte po té nejlepší autentické pizzě? Provedeme vás nejslavnějšími pizzeriemi v Římě – od křupavé Pizza al Taglio v Bonci Pizzarium po tradiční pece v Testaccio.",
    metaDescription: "Kam na nejlepší pizzu v Římě: Přehled ikonických pizzerií. Fotky slavných pizz, tipy na Bonci Pizzarium, Da Remo, Da Michele a akční letenky do Říma.",
    keywords: "nejlepší pizza Řím, pizzerie Řím, Bonci Pizzarium, Pizzeria Da Remo, Pizza al Taglio, Pizza Romana, letenky do Říma",
    featuredImage: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80",
    author: "Redakce Akční-Letenky.com",
    category: "tips",
    status: "published",
    publishedAt: new Date("2026-07-27T15:00:00Z"),
    createdAt: new Date("2026-07-27T15:00:00Z"),
    updatedAt: new Date("2026-07-27T15:00:00Z"),
    viewCount: 2450,
    content: `<article class="travel-tip-article">

<p class="lead">Ochutnat pravou římskou pizzu přímo ve Věčném městě je gastronomický zážitek, na který se nezapomíná. V Římě existují dva základní styly: <strong>Pizza al Taglio</strong> (krájená obdélníková pizza prodávaná na váhu) a <strong>Pizza Tonda Romana</strong> (klasická kulatá pizza s ultratenkým a křupavým těstem).</p>

<p>Přinášíme vám prověřený seznam <strong>4 nejlepších pizzerií v Římě</strong> s reálnými fotografiemi jejich vyhlášených specialit!</p>

<hr class="my-8" />

<h2>1. Pizzarium Bonci (Čtvrť Trionfale / Vatikán)</h2>
<p>Králem římské obdélníkové pizzy <em>Pizza al Taglio</em> je kuchařský guru Gabriele Bonci. Jeho těsto kyne dlouhých 72 hodin z organické mouky a na vrchu najdete neotřelé gourmet ingredience: od pečených brambor s rozmarýnem po mortadellu s pistáciovým krémem a čerstvou burratou.</p>

<img src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1000&q=80" alt="Pizzarium Bonci - Slavná římská Pizza al Taglio" class="w-full rounded-2xl shadow-lg my-6 border border-gray-200" />

<ul class="space-y-2 mb-6">
  <li><strong>Styl:</strong> Pizza al Taglio (krájená na váhu)</li>
  <li><strong>Lokalita:</strong> Via della Meloria 43 (kousek od Vatikánských muzeí)</li>
  <li><strong>Specialita:</strong> Porchetta s mozzarella di bufala a pečené brambory s lanýžovým olejem</li>
</ul>

<hr class="my-8" />

<h2>2. Pizzeria Da Remo (Čtvrť Testaccio)</h2>
<p>Pizzeria Da Remo je absolutní legendou pro milovníky tradiční kulaté <em>Pizza Tonda Romana</em>. Těsto je rozválené do tenoučka, upečené v rozpálené peci na dřevo s lehce připálenými křupavými okraji. Atmosféra je rušná, hlučná a nefalšovaně římská.</p>

<img src="https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1000&q=80" alt="Pizzeria Da Remo - Tradiční tenká a křupavá římská pizza" class="w-full rounded-2xl shadow-lg my-6 border border-gray-200" />

<ul class="space-y-2 mb-6">
  <li><strong>Styl:</strong> Classic Pizza Tonda Romana (tenká & křupavá)</li>
  <li><strong>Lokalita:</strong> Piazza Santa Maria Liberatrice 44 (Testaccio)</li>
  <li><strong>Specialita:</strong> Pizza Margherita, Pizza Capricciosa a Supplì (smažené rýžové kuličky s mozzarellou)</li>
</ul>

<hr class="my-8" />

<h2>3. L'Antica Pizzeria da Michele (Via Flaminia & Trevi)</h2>
<p>Slavná neapolská rodina da Michele přinesla svou ikonickou recepturu z roku 1870 i do srdce Říma. Pokud milujete neapolský styl pizzy s vysokým nadýchaným okrajem (cornicione) a vláčným středem z rajčat San Marzano a Mozzarella di Bufala, toto je vaše mecca.</p>

<img src="https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=1000&q=80" alt="L'Antica Pizzeria da Michele - Neapolská Margherita v Římě" class="w-full rounded-2xl shadow-lg my-6 border border-gray-200" />

<ul class="space-y-2 mb-6">
  <li><strong>Styl:</strong> Tradiční neapolská pizza</li>
  <li><strong>Lokalita:</strong> Via Flaminia 80 / Via delle Muratte (poblíž Fontány di Trevi)</li>
  <li><strong>Specialita:</strong> Legendární Pizza Margherita a Pizza Marinara</li>
</ul>

<hr class="my-8" />

<h2>4. Seu Pizza Illuminati (Čtvrť Trastevere)</h2>
<p>Pro zájemce o moderní autorskou pizzu vyšší gastronomie je pizzerie Pier Daniela Seu absolutní nutností. Spojuje lehkost a stravitelnost těsta s odvážnými kombinacemi surových mořských ryb, zrajících sýrů a sezónního ovoce.</p>

<img src="https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=1000&q=80" alt="Seu Pizza Illuminati - Moderní gourmet pizza v Římě" class="w-full rounded-2xl shadow-lg my-6 border border-gray-200" />

<ul class="space-y-2 mb-6">
  <li><strong>Styl:</strong> Contemporary Gourmet Pizza</li>
  <li><strong>Lokalita:</strong> Via Bargoni 10–18 (Trastevere)</li>
  <li><strong>Specialita:</strong> Valéria (tartar z tuňáka, pistácie, stracciatella)</li>
</ul>

<hr class="my-8" />

<h2>Leťte na pizzu do Říma za pár stovek!</h2>
<p>Z Prahy do Říma (na letiště Fiumicino nebo Ciampino) létá denně několik přímých spojů. Na <a href="/levne-letenky" class="text-blue-600 font-bold hover:underline">Akční-Letenky.com</a> vyhledáváme zpáteční akční letenky do Říma již od 890 Kč. Dopřejte si gastro víkend ve Věčném městě!</p>

</article>`,
  },
  {
    id: 907,
    title: "Neapolská pizza: Kde ochutnat ten pravý originál přímo v Neapoli?",
    slug: "neapolska-pizza-kde-ochutnat-original",
    excerpt: "Pravá neapolská pizza chráněná UNESCO je gastronomickým zážitkem. Zjistěte, co dělá originální Pizza Napoletana výjimečnou, které pizzerie v Neapoli jsou považovány za nejlepší a jak se tam dostat nejlevněji.",
    metaDescription: "Pravá neapolská pizza v Neapoli: Průvodce pizzeriemi Da Michele, Sorbillo, Di Matteo. Krásné fotky neapolské pizzy Margherita, receptura AVPN a akční letenky do Neapole.",
    keywords: "neapolská pizza, pizza Neapol, L'Antica Pizzeria da Michele, Sorbillo, Pizza Napoletana, letenky do Neapole, AVPN pizza",
    featuredImage: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=1200&q=80",
    author: "Redakce Akční-Letenky.com",
    category: "tips",
    status: "published",
    publishedAt: new Date("2026-07-27T16:00:00Z"),
    createdAt: new Date("2026-07-27T16:00:00Z"),
    updatedAt: new Date("2026-07-27T16:00:00Z"),
    viewCount: 2890,
    content: `<article class="travel-tip-article">

<p class="lead">Neapol je kolébkou pizzy a místo, kde toto jídlo dosáhlo dokonalosti. Pravá neapolská pizza není jen jídlo, je to kulinářské dědictví chráněné organizací <strong>Associazione Verace Pizza Napoletana (AVPN)</strong> a zapsané na seznamu UNESCO.</p>

<img src="https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=1000&q=80" alt="Pravá neapolská pizza Margherita s lístky bazalky a mozzarella di bufala" class="w-full rounded-2xl shadow-lg my-6 border border-gray-200" />

<div class="p-5 bg-amber-50 rounded-2xl border border-amber-200 my-6">
  <p class="text-sm text-amber-950 font-medium">
    <strong>Ve zkratce:</strong> Pravou neapolskou pizzu ochutnáte v Neapoli v pizzeriích certifikovaných asociací AVPN (Associazione Verace Pizza Napoletana), které dodržují přísné standardy výroby. Mezi nejslavnější patří <em>Pizzeria Da Michele</em>, <em>Sorbillo</em> nebo <em>Di Matteo</em>, kde se podávají klasiky jako Pizza Margherita a Pizza Marinara.
  </p>
</div>

<h2>Co dělá pravou neapolskou pizzu originálem?</h2>
<p>Přísná pravidla AVPN stanovují přesné suroviny i postup výroby: mouka typu 00, čerstvá voda, mořská sůl a neapolské pivovarské droždí pro těsto, které musí kynout minimálně 8 až 24 hodin. Na omáčku se používají výhradně rajčata <em>San Marzano</em> z vulkanické půdy v okolí Vesuvu a čerstvá <em>mozzarella di bufala</em> nebo <em>fior di latte</em>.</p>

<img src="https://images.unsplash.com/photo-1595854341625-f33ee10dbf94?w=1000&q=80" alt="Pečení pizzy v peci na dřevo při 485 °C" class="w-full rounded-2xl shadow-lg my-6 border border-gray-200" />

<p>Pizza se peče v domové peci na dřevo při extrémní teplotě 450–480 °C po dobu pouhých 60–90 sekund. Výsledkem je lehce opálený nadýchaný okraj (cornicione) s charakteristickými "leopardími skvrnami" a jemný, šťavnatý střed.</p>

<h2>3 nejslavnější pizzerie v Neapoli, které musíte navštívit</h2>

<h3>1. L'Antica Pizzeria Da Michele (Via Cesare Sersale)</h3>
<p>Slavná pizzerie z roku 1870 známá z filmu <em>Jíst, meditovat, milovat</em> s Julií Roberts. Podávají se zde pouze dva tradiční druhy: Margherita a Marinara. Očekávejte frontu, která ale uteče neskutečně rychle a odměna v podobě dokonale vláčné pizzy stojí za to.</p>

<img src="https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=1000&q=80" alt="Ikonická Pizza Margherita v Pizzerii Da Michele v Neapoli" class="w-full rounded-2xl shadow-lg my-6 border border-gray-200" />

<h3>2. Gino e Toto Sorbillo (Via dei Tribunali)</h3>
<p>Gino Sorbillo je pravděpodobně nejslavnější pizzaiolo současnosti. Jeho rodinná pizzerie v historické uličce Via dei Tribunali nabízí obrovské pizzy přesahující talíř vyrobené z nejlepších organických surovin z celého Kampánie.</p>

<img src="https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1000&q=80" alt="Tradiční neapolská pizza v pizzerii Sorbillo" class="w-full rounded-2xl shadow-lg my-6 border border-gray-200" />

<h3>3. Pizzeria Di Matteo (Via dei Tribunali)</h3>
<p>Místo, kde ochutnal pizzu i americký prezident Bill Clinton. Kromě fantastické pizzy je Di Matteo vyhlášené svými smaženými přílohami — vyzkoušejte <em>Pizza Fritta</em> (smažená plněná pizza) nebo <em>Frittatina di pasta</em>.</p>

<h2>Vyrazte na víkend do Neapole za nejlevnější letenkou</h2>
<p>Z Prahy i Vídně létají do Neapole (NAP) nízkonákladové společnosti jako Wizz Air a Ryanair. Zpáteční akční letenky se běžně pohybují od 990 Kč. Podívejte se na aktuální <a href="/levne-letenky" class="text-blue-600 font-bold hover:underline">akční letenky do Neapole</a> na Akční-Letenky.com a rezervujte si gastronomický výlet ještě dnes!</p>

</article>`,
  },
  {
    id: 908,
    title: "Kam na nejlepší gelato v Římě? Průvodce za sladkým pokladem a pravou italskou zmrzlinou",
    slug: "pravy-italsky-gelato-rim",
    excerpt: "Dát si v Římě pravou řemeslnou zmrzlinu (gelato artigianale) je povinnost. Zjistěte, jak poznat poctivé gelato bez umělých barviv, které gelaterie v Římě jsou nejlepší a jak se tam dostat.",
    metaDescription: "Kam na nejlepší gelato v Římě: Kompletní průvodce po řemeslných gelateriích Giolitti, Frigidarium, Come il Latte. Fotky zmrzliny, rady a akční letenky do Říma.",
    keywords: "gelato Řím, nejlepší zmrzlina v Římě, řemeslné gelato, Giolitti, Frigidarium, letenky do Říma, gelato artigianale",
    featuredImage: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=1200&q=80",
    author: "Redakce Akční-Letenky.com",
    category: "tips",
    status: "published",
    publishedAt: new Date("2026-07-27T17:00:00Z"),
    createdAt: new Date("2026-07-27T17:00:00Z"),
    updatedAt: new Date("2026-07-27T17:00:00Z"),
    viewCount: 3120,
    content: `<article class="travel-tip-article">

<p class="lead">Dát si v Římě zmrzlinu (správně italsky <em>gelato</em>) není jen možností na rychlé zchlazení v létě, je to prakticky kulturní povinnost napříč všemi ročními obdobími. Zatímco ulice centra doslova přetékají barevnými vitrínami, my vám ukážeme, jak rozeznat turistickou past od opravdového uměleckého díla a kam přesně se zacházet.</p>

<img src="https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=1000&q=80" alt="Pravé řemeslné italské gelato ve vaaflovém kornoutu" class="w-full rounded-2xl shadow-lg my-6 border border-gray-200" />

<h2>Základní pravidlo: Jak poznat pravé Gelato Artigianale?</h2>
<p>Než se vydáte do uliček Věčného města, naučte se 3 základní triky, jak poznat poctivou zmrzlinu:</p>

<ul class="space-y-3 my-4">
  <li class="flex items-start gap-2">
    <span class="text-amber-500 font-bold">1. Barva nesmí svítit:</span>
    <span>Pistáciová zmrzlina musí mít přírodní hnědo-zelenou barvu (ne zářivě jedovatě zelenou). Banánová má být krémově šedobílá (ne žlutá).</span>
  </li>
  <li class="flex items-start gap-2">
    <span class="text-amber-500 font-bold">2. Žádné obří kopečky naskládané do výšky:</span>
    <span>Pravé gelato se uchovává v nerezových nádobách s poklopem (zvaných <em>pozzetti</em>) nebo leží nízko ve vaničkách. Pokud je nahromaděné vysoko nad okraj, obsahuje ztužovače a vzduch.</span>
  </li>
  <li class="flex items-start gap-2">
    <span class="text-amber-500 font-bold">3. Podává se špachtlí (spatula):</span>
    <span>Tradice velí servírovat gelato plochou špachtlí, nikoli kulatým klešťovým kopečkovačem.</span>
  </li>
</ul>

<img src="https://images.unsplash.com/photo-1567206563064-6f60f4078b57?w=1000&q=80" alt="Vitrine s čerstvým řemeslným italským gelatem" class="w-full rounded-2xl shadow-lg my-6 border border-gray-200" />

<h2>3 nejlepší gelaterie v Římě, které nesmíte vynechat</h2>

<h3>1. Giolitti (Poblíž Pantheonu)</h3>
<p>Nejstarší a nejslavnější gelaterie v Římě funguje již od roku 1900. Obsluha v elegantních vestách vám naservíruje tradiční príchutě s poctivou porcí čerstvě ušlehané šlehačky (<em>panna</em>) nahoře zcela zdarma.</p>

<h3>2. Frigidarium (Poblíž Piazza Navona)</h3>
<p>Milovaná gelaterie mezi místními i turisty. Po výběru príchutí vám kornout zdarma namočí do horké hořké nebo bílé čokolády, která na zmrzlině vteřinově ztuhne do křupavé krusty.</p>

<img src="https://images.unsplash.com/photo-1580915411954-282cb1b0d780?w=1000&q=80" alt="Pistáciové gelato v mističce s oplatkou a lískovými oříšky" class="w-full rounded-2xl shadow-lg my-6 border border-gray-200" />

<h3>3. Come il Latte (Čtvrť Sallustiano / Termini)</h3>
<p>Jak název napovídá ("Jako mléko"), tato gelaterie si zakládá na extrémně krémové textuře s 70% podílem čerstvého plnotučného mléka ze psaných farem. Na dno kornoutu vám nalijí tekoucí teplou čokoládu ze dvou čokoládových fontán.</p>

<h2>Dopřejte si sladký víkend v Římě s nejlevnější letenkou</h2>
<p>Ochutnat pravé gelato pod rozkvetlými římškými stromy je otázkou pár hodin letu. Na <a href="/levne-letenky" class="text-blue-600 font-bold hover:underline">Akční-Letenky.com</a> vyhledáváme zpáteční akční letenky do Říma již od 890 Kč. Podívejte se na nabídky ještě dnes!</p>

</article>`,
  },
  {
    id: 909,
    title: "Vatikán a Vatikánská muzea: Kompletní průvodce a atmosférická fotogalerie",
    slug: "vatikan-a-vatikanska-muzea-pruvodce",
    excerpt: "Objevte nejmenší stát světa s obrovským kulturním bohatstvím. Průvodce po Vatikánských muzeích, Sixtinské kapli a Bazilice svatého Petra s atmosférickými fotografiemi a radami, jak přeskočit fronty.",
    metaDescription: "Vatikán a Vatikánská muzea: Kompletní průvodce. Krásné fotky Svatopetrského náměstí, Sixtinské kaple a spirálového schodiště. Tipy na vstupenky a letenky do Říma.",
    keywords: "Vatikán, Vatikánská muzea, Sixtinská kaple, Bazilika svatého Petra, Řím památky, letenky do Říma, Vatikán fotogalerie",
    featuredImage: "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=1200&q=80",
    author: "Redakce Akční-Letenky.com",
    category: "tips",
    status: "published",
    publishedAt: new Date("2026-07-27T18:00:00Z"),
    createdAt: new Date("2026-07-27T18:00:00Z"),
    updatedAt: new Date("2026-07-27T18:00:00Z"),
    viewCount: 3450,
    content: `<article class="travel-tip-article">

<p class="lead">Vatikán je s rozlohou pouhých 0,49 km² nejmenším nezávislým státem světa, avšak ukrývá jedno z největších a nejvýznamnějších uměleckých a duchovních bohatství lidstva. Návštěva <strong>Svatopetrského náměstí, Baziliky svatého Petra a Vatikánských muzeí</strong> patří k nejhlubším zážitkům při návštěvě Říma.</p>

<img src="https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=1000&q=80" alt="Svatopetrské náměstí ve Vatikánu za zlaté hodinky s Berniniho kolonádou" class="w-full rounded-2xl shadow-lg my-6 border border-gray-200" />

<h2>1. Vatikánská muzea a Sixtinská kaple</h2>
<p>Vatikánská muzea (Musei Vaticani) představují komplex 54 galerií obsahující přes 70 000 uměleckých děl nashromážděných papeži v průběhu staletí. Vrcholem prohlídky je bezpochyby <strong>Sixtinská kaple</strong> s ikonickými stropními freskami od Michelangelo Buonarrotiho, včetně slavného výjevu <em>Stvoření Adama</em> a <em>Posledního soudu</em>.</p>

<img src="https://images.unsplash.com/photo-1543429776-2782fc8e1acd?w=1000&q=80" alt="Slavné dvojité spirálové schodiště Giuseppe Momo ve Vatikánských muzeích" class="w-full rounded-2xl shadow-lg my-6 border border-gray-200" />

<h2>2. Bazilika svatého Petra a výstup na kupoli</h2>
<p>Největší křesťanský kostel světa, Bazilika sv. Petra (Basilica di San Pietro), uhrančivě spojuje barokní a renesanční architekturu. Uvnitř naleznete Michelangelo slavnou sochu <em>Pieta</em> i bronzový Baldachýn nad hrobem sv. Petra od Gian Lorenza Berniniho.</p>

<img src="https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1000&q=80" alt="Interiér Baziliky svatého Petra s paprsky světla pod Michelangelo kupolí" class="w-full rounded-2xl shadow-lg my-6 border border-gray-200" />

<p>Nepromeškejte výstup do Michelangelo kupole (Cupola). Po překonání 551 schodů (nebo výtahu a 320 schodů) se před vámi otevře nejkrásnější panoramatický výhled na celé Svatopetrské náměstí, Vatikánské zahrady a stříbrnou stuhu řeky Tifry protínající Řím.</p>

<img src="https://images.unsplash.com/photo-1529260830199-42c24126f198?w=1000&q=80" alt="Panoramatický pohled na Řím a Vatikánské zahrady z kupole" class="w-full rounded-2xl shadow-lg my-6 border border-gray-200" />

<h2>Praktické tipy pro návštěvu bez zbytečného čekání</h2>
<ul class="space-y-2 my-4">
  <li>🎟️ <strong>Kupujte vstupenky online s předstihem:</strong> Fronty u kasy mohou v sezóně trvat 2 až 3 hodiny. Oficiální online vstupenka s přesným časem vám ušetří drahocenný čas.</li>
  <li>👔 <strong>Dodržujte dress code:</strong> Ramena a kolena musí být zakrytá u mužů i žen. Použitelný je lehký šátek pro zakrytí ramen.</li>
  <li>🌅 <strong>Brzké ranní hodiny:</strong> Nejlepší čas pro návštěvu Baziliky sv. Petra je hned po otevření v 7:00 ráno.</li>
</ul>

<h2>Navštivte Vatikán s nejvýhodnější letenkou</h2>
<p>Vatikán je na dosah ruky. Sledujte denně aktualizované <a href="/levne-letenky" class="text-blue-600 font-bold hover:underline">akční letenky do Říma</a> na Akční-Letenky.com a rezervujte s garancí nejnižších cen přímo na Pelikán.cz!</p>

</article>`,
  },
];

export async function getAllArticles(limit?: number) {
  const db = await getDb();
  if (db) {
    try {
      const { articles } = await import("../drizzle/schema");
      let query = db
        .select()
        .from(articles)
        .where(eq(articles.status, "published"))
        .orderBy(desc(articles.publishedAt));

      if (limit) {
        query = query.limit(limit) as any;
      }
      const res = await query;
      if (res && res.length > 0) return res;
    } catch {
      /* fallback below */
    }
  }

  return limit ? FALLBACK_ARTICLES.slice(0, limit) : FALLBACK_ARTICLES;
}

export async function getArticleBySlug(slug: string) {
  const db = await getDb();
  if (db) {
    try {
      const { articles } = await import("../drizzle/schema");
      const result = await db
        .select()
        .from(articles)
        .where(and(eq(articles.slug, slug), eq(articles.status, "published")))
        .limit(1);

      if (result.length > 0) return result[0];
    } catch {
      /* fallback below */
    }
  }

  return FALLBACK_ARTICLES.find((a) => a.slug === slug);
}

export async function getRecentArticles(limit: number = 5) {
  const db = await getDb();
  if (db) {
    try {
      const { articles } = await import("../drizzle/schema");
      const result = await db
        .select()
        .from(articles)
        .where(eq(articles.status, "published"))
        .orderBy(desc(articles.publishedAt))
        .limit(limit);

      if (result && result.length > 0) return result;
    } catch {
      /* fallback below */
    }
  }

  return FALLBACK_ARTICLES.slice(0, limit);
}

export async function getArticlesByCategory(category: string, limit?: number) {
  const db = await getDb();
  if (db) {
    try {
      const { articles } = await import("../drizzle/schema");
      let query = db
        .select()
        .from(articles)
        .where(and(eq(articles.status, "published"), eq(articles.category, category)))
        .orderBy(desc(articles.publishedAt));

      if (limit) {
        query = query.limit(limit) as any;
      }
      const res = await query;
      if (res && res.length > 0) return res;
    } catch {
      /* fallback below */
    }
  }

  const filtered = FALLBACK_ARTICLES.filter((a) => a.category === category);
  return limit ? filtered.slice(0, limit) : filtered;
}

// Destination Queries

export async function getAllDestinations() {
  const db = await getDb();
  if (!db) return [];

  const { destinations } = await import("../drizzle/schema");

  const result = await db
    .select()
    .from(destinations)
    .orderBy(desc(destinations.createdAt));

  return result;
}

export async function getDestinationBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;

  const { destinations } = await import("../drizzle/schema");

  const result = await db
    .select()
    .from(destinations)
    .where(eq(destinations.slug, slug))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getFeaturedDestinations(limit: number = 8) {
  const db = await getDb();
  if (!db) return [];

  const { destinations } = await import("../drizzle/schema");

  const result = await db
    .select()
    .from(destinations)
    .orderBy(desc(destinations.popularityScore))
    .limit(limit);

  return result;
}


// Affiliate Click Tracking

export async function recordAffiliateClick(data: {
  destination: string;
  destinationSlug: string;
  source: string;
  affiliatePartner?: string;
  affiliateUrl: string;
  userAgent?: string;
  referrer?: string;
  sessionId?: string;
  userId?: number;
}) {
  const db = await getDb();
  if (!db) return null;

  const { affiliateClicks } = await import("../drizzle/schema");

  const result = await db.insert(affiliateClicks).values({
    destination: data.destination,
    destinationSlug: data.destinationSlug,
    source: data.source,
    affiliatePartner: data.affiliatePartner || "kiwi",
    affiliateUrl: data.affiliateUrl,
    userAgent: data.userAgent || null,
    referrer: data.referrer || null,
    sessionId: data.sessionId || null,
    userId: data.userId || null,
  });

  return result;
}

export async function getAffiliateClickStats() {
  const db = await getDb();
  if (!db) return null;

  const { affiliateClicks } = await import("../drizzle/schema");

  // Get total clicks
  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(affiliateClicks);
  const totalClicks = totalResult[0]?.count || 0;

  // Get today's clicks
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(affiliateClicks)
    .where(gte(affiliateClicks.createdAt, today));
  const todayClicks = todayResult[0]?.count || 0;

  // Get this week's clicks
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(affiliateClicks)
    .where(gte(affiliateClicks.createdAt, weekAgo));
  const weekClicks = weekResult[0]?.count || 0;

  // Get this month's clicks
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  const monthResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(affiliateClicks)
    .where(gte(affiliateClicks.createdAt, monthAgo));
  const monthClicks = monthResult[0]?.count || 0;

  return {
    total: totalClicks,
    today: todayClicks,
    thisWeek: weekClicks,
    thisMonth: monthClicks,
  };
}

export async function getTopDestinationsByClicks(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  const { affiliateClicks, flights } = await import("../drizzle/schema");

  // Get top destinations by clicks
  const topDestinations = await db
    .select({
      destination: affiliateClicks.destination,
      destinationSlug: affiliateClicks.destinationSlug,
      clicks: sql<number>`count(*)`,
    })
    .from(affiliateClicks)
    .groupBy(affiliateClicks.destination, affiliateClicks.destinationSlug)
    .orderBy(desc(sql`count(*)`))
    .limit(limit);

  // For each destination, find the cheapest flight
  const result = await Promise.all(
    topDestinations.map(async (dest) => {
      const cheapestFlight = await db
        .select({
          price: flights.price,
          originalPrice: flights.originalPrice,
          discountPercent: flights.discountPercent,
        })
        .from(flights)
        .where(sql`LOWER(${flights.toCity}) = LOWER(${dest.destination})`)
        .orderBy(flights.price)
        .limit(1);

      return {
        ...dest,
        price: cheapestFlight[0]?.price || null,
        originalPrice: cheapestFlight[0]?.originalPrice || null,
        discountPercent: cheapestFlight[0]?.discountPercent || 0,
      };
    })
  );

  return result;
}

export async function getClicksBySource() {
  const db = await getDb();
  if (!db) return [];

  const { affiliateClicks } = await import("../drizzle/schema");

  const result = await db
    .select({
      source: affiliateClicks.source,
      clicks: sql<number>`count(*)`,
    })
    .from(affiliateClicks)
    .groupBy(affiliateClicks.source)
    .orderBy(desc(sql`count(*)`));

  return result;
}

export async function getClickTrend(days: number = 30) {
  const db = await getDb();
  if (!db) return [];

  const { affiliateClicks } = await import("../drizzle/schema");

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const result = await db
    .select({
      date: sql<string>`DATE(createdAt)`,
      clicks: sql<number>`count(*)`,
    })
    .from(affiliateClicks)
    .where(gte(affiliateClicks.createdAt, startDate))
    .groupBy(sql`DATE(createdAt)`)
    .orderBy(sql`DATE(createdAt)`);

  return result;
}

export async function getRecentClicks(limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  const { affiliateClicks } = await import("../drizzle/schema");

  const result = await db
    .select()
    .from(affiliateClicks)
    .orderBy(desc(affiliateClicks.createdAt))
    .limit(limit);

  return result;
}


// ============ Site Settings ============
import { siteSettings } from "../drizzle/schema";

export async function getSiteSetting(key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.settingKey, key))
    .limit(1);

  return result[0]?.settingValue ?? null;
}

export async function setSiteSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const existing = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.settingKey, key))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(siteSettings)
      .set({ settingValue: value, updatedAt: new Date() })
      .where(eq(siteSettings.settingKey, key));
  } else {
    await db.insert(siteSettings).values({
      settingKey: key,
      settingValue: value,
    });
  }
}

export async function getAllSiteSettings(): Promise<Record<string, string>> {
  const db = await getDb();
  if (!db) return {};

  const result = await db.select().from(siteSettings);
  const settings: Record<string, string> = {};
  for (const row of result) {
    if (row.settingValue) {
      settings[row.settingKey] = row.settingValue;
    }
  }
  return settings;
}
