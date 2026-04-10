/**
 * Tips Article Generator
 * Automatically generates daily SEO-optimized travel tip articles
 * Category: "tips" — targeted at Czech travelers looking for cheap flights
 */

import { invokeLLM } from "./_core/llm";
import { getDb } from "./db";
import { articles } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";
import { sendTelegramMessage } from "./telegram";

// ─── Topic Pool ────────────────────────────────────────────────────────────────
// 30+ unique topics to ensure months of non-repeating daily articles
const TIPS_TOPICS = [
  {
    slug_prefix: "jak-rezervovat-letenky-v-inkognito-rezimu",
    title: "Proč vždy hledat letenky v inkognito režimu (a jak to dělat správně)",
    keywords: "inkognito letenky, anonymní prohlížení letenky, jak ušetřit na letenkách, cookies letenky",
    image: "https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=1200&q=80",
    prompt_focus: "Vysvětli, proč vyhledávače letenek sledují cookies a zvyšují ceny při opakovaném hledání. Popiš krok za krokem jak používat inkognito mód v Chrome, Firefox, Safari a Edge. Přidej tipy na VPN a mazání cookies. Uveď konkrétní příklady úspory.",
  },
  {
    slug_prefix: "nejlevnejsi-den-na-koupi-letenky",
    title: "Nejlevnější den na koupi letenky: Úterý vs. středa vs. víkend",
    keywords: "nejlevnější den letenky, kdy kupovat letenky, úterý letenky levné, ušetřit na letenkách",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
    prompt_focus: "Analyzuj, kdy jsou letenky statisticky nejlevnější (úterý, středa ráno). Vysvětli proč aerolinky mění ceny v různé dny. Poraď kdy naopak nekupovat (pátek, neděle). Přidej tipy na cenové alerty.",
  },
  {
    slug_prefix: "alternativni-letiste-levnejsi-letenky",
    title: "Alternativní letiště: Jak letět z Vídně nebo Bratislavy a ušetřit tisíce",
    keywords: "letiště Vídeň Praha, Bratislava letiště letenky, alternativní letiště ušetřit, levné letenky z Vídně",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80",
    prompt_focus: "Porovnej ceny letenek z Prahy vs. Vídně vs. Bratislavy. Vysvětli jak se dostat na alternativní letiště (autobus, vlak). Uveď konkrétní destinace kde je rozdíl největší. Přidej kalkulaci celkových nákladů.",
  },
  {
    slug_prefix: "cenovy-alert-letenky-nastaveni",
    title: "Cenové alerty na letenky: Jak nastavit a nikdy nepropásnout slevu",
    keywords: "cenový alert letenky, hlídání ceny letenky, notifikace letenky, Google Flights alert",
    image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1200&q=80",
    prompt_focus: "Krok za krokem průvodce nastavením cenových alertů na Kiwi.com, Google Flights, Skyscanner a Kayak. Vysvětli jak fungují algoritmy sledování cen. Poraď jak nastavit realistické cílové ceny.",
  },
  {
    slug_prefix: "letenky-s-prestupem-vs-prime",
    title: "Přestupní letenky vs. přímé lety: Kdy se přestup vyplatí a kdy ne",
    keywords: "přestupní letenky, přímý let vs přestup, letenky s přestupem ušetřit, hidden city ticketing",
    image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&q=80",
    prompt_focus: "Porovnej ceny přímých vs. přestupních letů na konkrétních příkladech. Vysvětli hidden city ticketing (a jeho rizika). Poraď kdy přestup stojí za to (úspora vs. čas). Zmínka o Kiwi.com nomad feature.",
  },
  {
    slug_prefix: "jak-packat-pouze-do-prirucniho-zavazadla",
    title: "Jak sbalit vše do příručního zavazadla: Průvodce minimalistickým cestováním",
    keywords: "příruční zavazadlo packing, jak sbalit do kabiny, minimalistické cestování, ušetřit za zavazadlo",
    image: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=1200&q=80",
    prompt_focus: "Praktický průvodce jak sbalit na 1-2 týdny pouze do příručního zavazadla. Doporuč konkrétní techniky skládání oblečení (roll method, KonMari). Uveď seznam nezbytností a co vynechat. Kalkulace úspory na poplatcích za zavazadlo.",
  },
  {
    slug_prefix: "flexibilni-data-odletu-ušetrit",
    title: "Flexibilní data odletu: Jak posun o 1-3 dny ušetří až 3 000 Kč",
    keywords: "flexibilní data letenky, kdy letět nejlevněji, cenový kalendář letenky, ušetřit posun data",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80",
    prompt_focus: "Vysvětli jak funguje cenový kalendář na Kiwi.com a Google Flights. Uveď konkrétní příklady úspory při posunu data o 1-3 dny. Poraď jak využít 'everywhere' search pro inspiraci. Tipy na flexibilní práci a home office při plánování cest.",
  },
  {
    slug_prefix: "letenky-pro-seniory-slevy",
    title: "Letenky pro seniory: Kompletní průvodce slevami a výhodami pro 60+",
    keywords: "letenky seniori, slevy letenky 60+, senior letenky, levné letenky důchodci",
    image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200&q=80",
    prompt_focus: "Přehled slev pro seniory u hlavních aerolinek (ČSA, Lufthansa, Austrian). Vysvětli věkové hranice a podmínky. Poraď jak kombinovat senior slevy s early bird cenami. Tipy na cestovní pojištění pro seniory.",
  },
  {
    slug_prefix: "letenky-student-isic-slevy",
    title: "Studentské letenky a ISIC: Jak studenti ušetří na cestování",
    keywords: "studentské letenky, ISIC letenky, letenky pro studenty, levné letenky student",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80",
    prompt_focus: "Průvodce studentskými slevami na letenky. Vysvětli výhody ISIC karty pro cestování. Porovnej studentské tarify u různých aerolinek. Tipy na Interrail jako alternativu. Jak kombinovat studentské slevy s dalšími akcemi.",
  },
  {
    slug_prefix: "jak-cestovat-s-malym-ditetem-letadlem",
    title: "Cestování s miminkem a batoletem letadlem: Vše co potřebujete vědět",
    keywords: "cestování s dítětem letadlem, letenky miminko, batolě letadlo, baby v letadle tipy",
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80",
    prompt_focus: "Praktický průvodce cestováním s dítětem do 2 let (lap infant) a 2-12 let. Vysvětli pravidla aerolinek pro kojence. Poraď co zabalit, jak zvládnout bezpečnostní kontrolu, jak uklidnit dítě při vzletu. Tipy na výběr sedadel.",
  },
  {
    slug_prefix: "letenky-na-silvestra-vanoce-levne",
    title: "Letenky na Vánoce a Silvestra: Jak cestovat ve sváteční sezóně levně",
    keywords: "letenky Vánoce, letenky Silvestr, svátky letenky levné, cestování Vánoce ušetřit",
    image: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=1200&q=80",
    prompt_focus: "Strategie pro nákup letenek na Vánoce a Silvestra (kdy kupovat, jak daleko dopředu). Alternativní destinace místo přeplněných míst. Tipy na early bird nákup vs. last minute. Jak ušetřit na ubytování ve sváteční sezóně.",
  },
  {
    slug_prefix: "google-flights-tipy-triky",
    title: "Google Flights: 10 skrytých funkcí, o kterých většina cestovatelů neví",
    keywords: "Google Flights tipy, Google Flights triky, jak používat Google Flights, letenky Google",
    image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=1200&q=80",
    prompt_focus: "Detailní průvodce pokročilými funkcemi Google Flights: explore map, price graph, date grid, price tracking, baggage info. Vysvětli jak nastavit alerty. Porovnej s Kiwi.com a Skyscanner. Konkrétní tipy pro úsporu.",
  },
  {
    slug_prefix: "letenky-business-class-levne",
    title: "Business class za cenu economy: Jak létat v přepychu bez přepychu ceny",
    keywords: "business class levně, upgrade letenky, business class akce, levná business class",
    image: "https://images.unsplash.com/photo-1540339832862-474599807836?w=1200&q=80",
    prompt_focus: "Strategie pro levnou business class: bid upgrade, last-minute upgrade, miles upgrade, error fares. Kdy se business class vyplatí (dlouhé lety). Tipy na programy jako Lufthansa Miles & More. Jak najít business class akce.",
  },
  {
    slug_prefix: "cestovni-pojisteni-letenky",
    title: "Cestovní pojištění při nákupu letenek: Co kryje a co ne",
    keywords: "cestovní pojištění letenky, pojištění zrušení letu, storno pojištění, letenky pojištění",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80",
    prompt_focus: "Průvodce cestovním pojištěním pro letecké cestování. Vysvětli rozdíl mezi pojištěním zrušení letu, zpožděním, ztrátou zavazadel. Porovnej nabídky pojišťoven. Kdy je pojištění povinné a kdy dobrovolné. Tipy na kreditní karty s pojištěním.",
  },
  {
    slug_prefix: "error-fares-omylove-letenky",
    title: "Error fares: Jak najít omylové letenky a letět za zlomek ceny",
    keywords: "error fares, omylové letenky, chybné ceny letenek, mistake fares letenky",
    image: "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=1200&q=80",
    prompt_focus: "Co jsou error fares a jak vznikají. Kde je sledovat (Secret Flying, Airfarewatchdog, Scott's Cheap Flights). Jak rychle jednat při nalezení. Rizika a co dělat když aerolinka zruší letenku. Konkrétní příklady historických error fares.",
  },
  {
    slug_prefix: "letenky-kolem-sveta-round-the-world",
    title: "Letenka kolem světa: Jak naplánovat cestu kolem zeměkoule za rozumnou cenu",
    keywords: "letenka kolem světa, round the world ticket, RTW letenka, cesta kolem světa cena",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80",
    prompt_focus: "Průvodce RTW (round-the-world) letenkami. Vysvětli aliance (Star Alliance, Oneworld, SkyTeam) a jejich RTW produkty. Porovnej ceny. Alternativa: koupit jednotlivé letenky. Tipy na itinerář a logistiku.",
  },
  {
    slug_prefix: "jak-vybrat-sedadlo-v-letadle",
    title: "Jak vybrat nejlepší sedadlo v letadle: Průvodce výběrem místa",
    keywords: "výběr sedadla letadlo, nejlepší sedadlo letadlo, SeatGuru, sedadlo u okna vs uličky",
    image: "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=1200&q=80",
    prompt_focus: "Průvodce výběrem sedadla: okno vs. ulička vs. střed. Jak používat SeatGuru. Nejlepší sedadla pro spánek, pro vysoké lidi, pro rodiny. Jak získat sedadlo zdarma. Tipy na exit row sedadla.",
  },
  {
    slug_prefix: "letenky-posledni-chvile-app",
    title: "Nejlepší aplikace pro last minute letenky: Recenze a porovnání",
    keywords: "aplikace letenky, last minute letenky app, Kiwi app, Skyscanner app, nejlepší letenky aplikace",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&q=80",
    prompt_focus: "Porovnání nejlepších mobilních aplikací pro hledání letenek: Kiwi.com, Skyscanner, Google Flights, Hopper, Kayak. Hodnocení funkcí, přehlednosti, alertů. Která aplikace je nejlepší pro last minute. Tipy na notifikace.",
  },
  {
    slug_prefix: "letenky-s-kreditni-kartou-cashback",
    title: "Kreditní karty s cashback na letenky: Jak platit a ještě vydělávat",
    keywords: "kreditní karta letenky cashback, miles kreditní karta, Amex letenky, kreditní karta cestování",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&q=80",
    prompt_focus: "Přehled kreditních karet s výhodami pro cestování dostupných v ČR. Vysvětli cashback, míle a pojištění u karet. Porovnej Amex, Visa, Mastercard cestovní karty. Jak maximalizovat výhody. Tipy na kombinaci karet.",
  },
  {
    slug_prefix: "jak-zvladnout-dlouhy-let",
    title: "Jak přežít dlouhý let: Tipy na komfort, spánek a zdraví na palubě",
    keywords: "dlouhý let tipy, jak spát v letadle, jet lag prevence, zdraví na palubě letadla",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80",
    prompt_focus: "Praktické tipy na přežití letů delších než 8 hodin. Jak předejít jet lagu. Co jíst a pít na palubě. Cvičení na trombózu. Nejlepší pomůcky pro spánek (maska, polštář, špunty). Jak se obléknout na dlouhý let.",
  },
  {
    slug_prefix: "letenky-na-posled-chvili-wizz-ryanair",
    title: "Flash sales Ryanair a Wizz Air: Jak chytit letenky za 1 euro",
    keywords: "Ryanair flash sale, Wizz Air akce, letenky za 1 euro, nízkonákladové aerolinky akce",
    image: "https://images.unsplash.com/photo-1542621334-a254cf47733d?w=1200&q=80",
    prompt_focus: "Kdy a jak Ryanair a Wizz Air pořádají flash sales. Jak se přihlásit k odběru newsletterů. Tipy na sledování sociálních sítí aerolinek. Jak rychle nakoupit při flash sale. Podmínky a omezení akčních letenek.",
  },
  {
    slug_prefix: "visa-free-destinace-z-cr",
    title: "Kam bez víza: 50+ destinací dostupných z ČR bez byrokratických překážek",
    keywords: "visa free destinace ČR, kam bez víza Česko, bezvisové destinace, cestování bez víza",
    image: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80",
    prompt_focus: "Přehled nejlepších bezvisových destinací pro české cestovatelé rozdělených podle regionu. Vysvětli Schengen, e-visa a visa on arrival. Tipy na nejlevnější destinace bez víza. Jak zkontrolovat vízové požadavky.",
  },
  {
    slug_prefix: "letenky-na-dovolenou-s-psem",
    title: "Cestování se psem letadlem: Pravidla, poplatky a tipy pro mazlíčky",
    keywords: "cestování se psem letadlem, pes v letadle, letenky se psem, mazlíček letadlo pravidla",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=80",
    prompt_focus: "Kompletní průvodce cestováním se psem letadlem. Pravidla aerolinek (velikost, váha, přepravka). Dokumenty potřebné pro cestování se zvířetem v EU. Tipy na přípravu psa na let. Poplatky u různých aerolinek.",
  },
  {
    slug_prefix: "jak-ziskat-kompenzaci-za-zpozdeny-let",
    title: "Kompenzace za zpoždění letu: Jak získat až 600 EUR zpět",
    keywords: "kompenzace zpoždění letu, EU261 odškodnění, zpoždění letenky náhrada, jak reklamovat let",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80",
    prompt_focus: "Průvodce nařízením EU261/2004. Kdy máte nárok na kompenzaci (zpoždění 3h+, zrušení, overbooking). Jak podat reklamaci u aerolinky. Kdy použít kompenzační agenturu (AirHelp, ClaimCompass). Konkrétní příklady úspěšných reklamací.",
  },
  {
    slug_prefix: "nejlevnejsi-mesice-pro-cestovani",
    title: "Nejlevnější měsíce pro cestování: Kdy letět kam pro nejlepší ceny",
    keywords: "nejlevnější měsíce cestování, kdy letět levně, low season letenky, off-season cestování",
    image: "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=1200&q=80",
    prompt_focus: "Přehled nejlevnějších měsíců pro populární destinace (Španělsko, Řecko, Thajsko, USA, Dubaj). Vysvětli high/low/shoulder season. Tipy na destinace kde off-season je stále krásné počasí. Konkrétní cenové rozdíly.",
  },
];

// ─── Unsplash image pool for variety ──────────────────────────────────────────
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80",
  "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=1200&q=80",
  "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80",
  "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80",
  "https://images.unsplash.com/photo-1542621334-a254cf47733d?w=1200&q=80",
];

function randomFallbackImage() {
  return FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)]!;
}

/**
 * Get the next unused topic from the pool
 * Checks DB to avoid duplicates
 */
async function getNextTopic(db: Awaited<ReturnType<typeof getDb>>) {
  if (!db) throw new Error("DB not available");

  for (const topic of TIPS_TOPICS) {
    const existing = await db
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.slug, topic.slug_prefix))
      .limit(1);

    if (existing.length === 0) {
      return topic;
    }
  }

  // All topics used — generate a fresh one with a timestamp suffix
  const base = TIPS_TOPICS[Math.floor(Math.random() * TIPS_TOPICS.length)]!;
  return {
    ...base,
    slug_prefix: `${base.slug_prefix}-${new Date().getFullYear()}`,
  };
}

/**
 * Generate a single travel-tips article using LLM
 */
export async function generateDailyTipArticle(): Promise<{
  slug: string;
  title: string;
  success: boolean;
  error?: string;
}> {
  const db = await getDb();
  if (!db) {
    return { slug: "", title: "", success: false, error: "Database not available" };
  }

  try {
    const topic = await getNextTopic(db);

    console.log(`[TipsGenerator] Generating tip article: "${topic.title}"`);

    const systemPrompt = `Jsi profesionální cestovní copywriter a SEO expert. Píšeš v češtině přirozeným, přátelským a praktickým stylem. Tvé články jsou konkrétní, plné actionable tipů a optimalizované pro Google vyhledávání. Vždy zahrni relevantní affiliate odkaz na Kiwi.com (https://www.kiwi.com/cs/?affilid=155221&currency=czk) přirozeně do textu.`;

    const userPrompt = `Napiš kompletní SEO článek pro kategorii "Tipy pro cestovatele" na webu Akční-Letenky.cz.

TÉMA: ${topic.title}
KLÍČOVÁ SLOVA: ${topic.keywords}
ZAMĚŘENÍ: ${topic.prompt_focus}

POŽADAVKY NA FORMÁT (DŮLEŽITÉ):
- Výstup musí být čistý HTML článek (ne Markdown)
- Začni <article> tagem
- Použij <h2> a <h3> nadpisy
- Přidej 2-3 relevantní obrázky z Unsplash pomocí <img src="https://images.unsplash.com/photo-XXXXX?w=800&q=80" alt="popis" class="w-full rounded-xl my-6" />
- PRVNÍ obrázek v těle článku MUSÍ být jiný než hero image (${topic.image})
- Přidej zvýrazněné boxy: <div class="bg-blue-50 border border-blue-200 rounded-xl p-6 my-8">
- Délka: 900-1200 slov
- Zahrň call-to-action s odkazem na Kiwi.com: <a href="https://www.kiwi.com/cs/?affilid=155221&currency=czk" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline font-semibold">Kiwi.com</a>
- Zahrň interní odkaz na /tipy-pro-cestovatele a /levne-letenky
- Konec článku: <div class="bg-green-50 border border-green-200 rounded-xl p-6 my-8"> s CTA

VÝSTUP (JSON):
{
  "title": "...",
  "excerpt": "...(max 200 znaků)",
  "metaDescription": "...(max 155 znaků)",
  "content": "...(HTML)"
}`;

    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "tips_article",
          strict: true,
          schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              excerpt: { type: "string" },
              metaDescription: { type: "string" },
              content: { type: "string" },
            },
            required: ["title", "excerpt", "metaDescription", "content"],
            additionalProperties: false,
          },
        },
      },
    });

    const raw = response.choices[0]?.message?.content;
    const parsed = JSON.parse(typeof raw === "string" ? raw : JSON.stringify(raw));

    const now = new Date();

    await db.insert(articles).values({
      title: parsed.title,
      slug: topic.slug_prefix,
      excerpt: parsed.excerpt.substring(0, 200),
      metaDescription: parsed.metaDescription.substring(0, 155),
      content: parsed.content,
      featuredImage: topic.image || randomFallbackImage(),
      author: "Akční Letenky",
      category: "tips",
      keywords: topic.keywords,
      status: "published",
      publishedAt: now,
    });

    console.log(`[TipsGenerator] ✅ Published: "${parsed.title}" (slug: ${topic.slug_prefix})`);

    // Notify owner
    await notifyOwner({
      title: "Nový tip článek vygenerován",
      content: `Automaticky byl vygenerován a publikován nový článek:\n\n**${parsed.title}**\n\nSlug: /blog/${topic.slug_prefix}\nKategorie: Tipy pro cestovatele`,
    }).catch(() => {}); // non-blocking

    // Share on Telegram
    await shareTipOnTelegram({
      title: parsed.title,
      excerpt: parsed.excerpt,
      slug: topic.slug_prefix,
      image: topic.image || randomFallbackImage(),
    }).catch((e: unknown) => {
      console.error("[TipsGenerator] Telegram share failed:", e);
    });

    return { slug: topic.slug_prefix, title: parsed.title, success: true };
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[TipsGenerator] ❌ Error:", msg);
    return { slug: "", title: "", success: false, error: msg };
  }
}

/**
 * Get generation statistics
 */
export async function getTipsGenerationStats(): Promise<{
  totalTips: number;
  lastGenerated: Date | null;
  topicsUsed: number;
  topicsAvailable: number;
  recentArticles: { title: string; slug: string; publishedAt: Date | null }[];
}> {
  const db = await getDb();
  if (!db) {
    return { totalTips: 0, lastGenerated: null, topicsUsed: 0, topicsAvailable: TIPS_TOPICS.length, recentArticles: [] };
  }

  const { desc } = await import("drizzle-orm");
  const { and, eq: eqOp } = await import("drizzle-orm");

  const tipArticles = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      publishedAt: articles.publishedAt,
    })
    .from(articles)
    .where(eqOp(articles.category, "tips"))
    .orderBy(desc(articles.publishedAt))
    .limit(10);

  const lastGenerated = tipArticles.length > 0 ? tipArticles[0]!.publishedAt : null;

  return {
    totalTips: tipArticles.length,
    lastGenerated,
    topicsUsed: tipArticles.length,
    topicsAvailable: TIPS_TOPICS.length,
    recentArticles: tipArticles.slice(0, 5).map((a) => ({
      title: a.title,
      slug: a.slug,
      publishedAt: a.publishedAt,
    })),
  };
}

/**
 * Share a new tip article on Telegram channel
 * Sends a beautifully formatted HTML message with title, excerpt and link
 */
export async function shareTipOnTelegram(article: {
  title: string;
  excerpt: string;
  slug: string;
  image?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const siteUrl = process.env.VITE_SITE_URL || "https://akcni-letenky.com";
  const articleUrl = `${siteUrl}/blog/${article.slug}`;

  // Truncate excerpt to keep message clean
  const shortExcerpt = article.excerpt.length > 180
    ? article.excerpt.substring(0, 177) + "..."
    : article.excerpt;

  const message = [
    `✈️ <b>Nový tip pro cestovatele!</b>`,
    ``,
    `💡 <b>${article.title}</b>`,
    ``,
    `${shortExcerpt}`,
    ``,
    `➡️ <a href="${articleUrl}">Přečstěte celý článek</a>`,
    ``,
    `————————————————————`,
    `🔔 <i>Sledujte nás pro další tipy na levné letenky</i>`,
    `🛫 <a href="https://akcni-letenky.com">Akční-Letenky.cz</a>`,
  ].join("\n");

  console.log(`[TipsGenerator] Sharing on Telegram: "${article.title}"`);
  const result = await sendTelegramMessage(message, { parseMode: "HTML", disableWebPagePreview: false });

  if (result.ok) {
    console.log(`[TipsGenerator] ✅ Telegram share successful (msg id: ${result.messageId})`);
  } else {
    console.error(`[TipsGenerator] ❌ Telegram share failed: ${result.error}`);
  }

  return result;
}

/**
 * Share an existing article on Telegram by slug (for manual admin use)
 */
export async function shareTipBySlug(slug: string): Promise<{ ok: boolean; error?: string }> {
  const db = await getDb();
  if (!db) return { ok: false, error: "Database not available" };

  const rows = await db
    .select({
      title: articles.title,
      slug: articles.slug,
      excerpt: articles.excerpt,
      featuredImage: articles.featuredImage,
    })
    .from(articles)
    .where(eq(articles.slug, slug))
    .limit(1);

  if (rows.length === 0) {
    return { ok: false, error: `Article not found: ${slug}` };
  }

  const article = rows[0]!;
  return shareTipOnTelegram({
    title: article.title,
    excerpt: article.excerpt || "",
    slug: article.slug,
    image: article.featuredImage || undefined,
  });
}

/**
 * Schedule daily tip article generation at 7:00 AM
 */
export function scheduleDailyTipArticle() {
  const now = new Date();
  const scheduledTime = new Date();
  scheduledTime.setHours(7, 0, 0, 0); // 7:00 AM

  // If 7 AM has already passed today, schedule for tomorrow
  if (now >= scheduledTime) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  const msUntilRun = scheduledTime.getTime() - now.getTime();
  const minutesUntil = Math.round(msUntilRun / 1000 / 60);

  console.log(`[TipsGenerator] Scheduled daily tip article at 7:00 AM (in ${minutesUntil} minutes)`);

  setTimeout(async () => {
    console.log("[TipsGenerator] Running daily tip article generation...");
    const result = await generateDailyTipArticle();
    if (result.success) {
      console.log(`[TipsGenerator] Daily tip generated: "${result.title}"`);
    } else {
      console.error(`[TipsGenerator] Daily tip generation failed: ${result.error}`);
    }

    // Repeat every 24 hours
    setInterval(async () => {
      console.log("[TipsGenerator] Running daily tip article generation...");
      const r = await generateDailyTipArticle();
      if (!r.success) {
        console.error(`[TipsGenerator] Failed: ${r.error}`);
      }
    }, 24 * 60 * 60 * 1000);
  }, msUntilRun);
}
