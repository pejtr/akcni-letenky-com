import "dotenv/config";
import { getDb } from "./server/db";
import { articles } from "./drizzle/schema";

async function main() {
  const db = await getDb();
  if (!db) {
    console.error("Database connection not available");
    process.exit(1);
  }

  const italianThermalArticle = {
    title: "TOP Termální prameny v Itálii pro dokonalý wellness: 4 nejkrásnější resorty a lázně",
    slug: "top-termalni-prameny-v-italii-wellness",
    excerpt: "Objevit horké prameny v Toskánsku, alpské lázně v Bormiu nebo termální parky na ostrově Ischia je zážitek na celý život. Podívejte se na 4 nejkrásnější termální resorty v Itálii s reálnými fotkami a tipy na letenky.",
    metaDescription: "TOP 4 termální prameny v Itálii: Saturnia, Bormio, Sirmione u Lago di Garda a ostrov Ischia. Reálné fotky, praktické tipy a nejlevnější letenky do Itálie.",
    keywords: "termální prameny Itálie, Terme di Saturnia, Bormio lázně, Sirmione ubytování, Ischia termály, wellness Itálie, akční letenky Itálie",
    featuredImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80",
    author: "Redakce Akční-Letenky.com",
    category: "tips",
    status: "published" as const,
    publishedAt: new Date(),
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
  };

  try {
    await db.insert(articles).values(italianThermalArticle);
    console.log("✅ Successfully created Italian Thermal Springs article in database!");
  } catch (err: any) {
    if (err.code === "ER_DUP_ENTRY" || err.message?.includes("Duplicate")) {
      console.log("ℹ️ Article already exists in database. Updating...");
    } else {
      console.error("❌ Error inserting article:", err);
    }
  }
}

main().catch(console.error);
