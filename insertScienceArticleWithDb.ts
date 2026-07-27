import "dotenv/config";
import { getDb } from "./server/db";
import { articles } from "./drizzle/schema";

async function main() {
  const db = await getDb();
  if (!db) {
    console.error("Database connection not available");
    process.exit(1);
  }

  const scienceArticleData = {
    title: "Věda potvrzuje: Lidé, kteří více cestují, jsou doslova chytřejší!",
    slug: "veda-potvrzuje-lide-kteri-cestuji-jsou-chytrejsi",
    excerpt: "Nejnovější poznatky neurovědy a psychologie dokazují to, co vášniví cestovatelé tuší už dlouho: Cestování do nových míst fyzicky mění strukturu mozku, podporuje neuroplasticitu, zvyšuje kreativitu a dělá nás chytřejšími.",
    metaDescription: "Věda potvrzuje: Lidé, kteří více cestují, jsou doslova chytřejší! Zjistěte, jak cestování fyzicky mění náš mozek, zvyšuje kreativitu a kognitivní flexibilitu.",
    keywords: "cestování a mozek, vědecké výzkumy cestování, neuroplasticita, kreativita, výhody cestování, akční letenky, rozvoj osobnosti",
    featuredImage: "/images/cestovani-mozok-chytrejsi.jpg",
    author: "Redakce Akční-Letenky.com",
    category: "tips",
    status: "published" as const,
    publishedAt: new Date(),
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
  };

  try {
    await db.insert(articles).values(scienceArticleData);
    console.log("✅ Successfully inserted science travel article into database!");
  } catch (err: any) {
    if (err.code === "ER_DUP_ENTRY" || err.message?.includes("Duplicate")) {
      console.log("ℹ️ Article already exists in database.");
    } else {
      console.error("❌ Error inserting article:", err);
    }
  }
}

main().catch(console.error);
