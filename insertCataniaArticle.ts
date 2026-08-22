import "dotenv/config";
import { getDb } from "./server/db";
import { articles } from "./drizzle/schema";

async function main() {
  const db = await getDb();
  if (!db) {
    console.error("Database connection not available");
    process.exit(1);
  }

  const cataniaArticle = {
    title: "Via Etnea v Catanii: Romantická procházka s výhledem na kouřící Etnu a typickou sicilskou atmosférou",
    slug: "via-etnea-catania-romantika",
    excerpt: "Objevit nejkrásnější bulvár Sicílie pod majestátní Etnou je nezapomenutelný zážitek. Přinášíme vám romantického průvodce po Via Etnea v Catanii s atmosféru nasátými fotografiemi, kavárnami a tipy na nejlevnější letenky.",
    metaDescription: "Via Etnea v Catanii: Romantická procházka pod soptící Etnou. Atmosférické fotky, nejlepší barokní kavárny, kulinářské tipy a nejlevnější letenky na Sicílii.",
    keywords: "Via Etnea Catania, Catania romantika, Sicílie cestování, fotky Catania, letenky na Sicílii, Etna výhledy, baroko Catania",
    featuredImage: "https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?w=1200&q=80",
    author: "Redakce Akční-Letenky.com",
    category: "tips",
    status: "published" as const,
    publishedAt: new Date(),
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
  };

  try {
    await db.insert(articles).values(cataniaArticle);
    console.log("✅ Successfully created Via Etnea Catania article in database!");
  } catch (err: any) {
    if (err.code === "ER_DUP_ENTRY" || err.message?.includes("Duplicate")) {
      console.log("ℹ️ Article already exists in database.");
    } else {
      console.error("❌ Error inserting article:", err);
    }
  }
}

main().catch(console.error);
