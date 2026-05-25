import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const now = new Date();

const articles = [
  {
    slug: "jak-letit-do-londyna-za-mene-nez-1500-kc",
    title: "Jak letět do Londýna za méně než 1 500 Kč: Kompletní průvodce",
    excerpt: "Londýn nemusí být drahý. Prozradíme vám přesně, kdy a jak rezervovat letenky z Prahy do Londýna za ceny, které vás překvapí.",
    featuredImage: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80",
    metaDescription: "Jak letět do Londýna za méně než 1 500 Kč z Prahy? Konkrétní tipy: nejlevnější aerolinky, nejlepší dny a měsíce pro rezervaci. Aktuální ceny 2026.",
    keywords: "letenky Londýn levně, Praha Londýn letenka cena, levné letenky Londýn 2026, jak letět do Londýna levně",
    content: `<p>Londýn je jednou z nejnavštěvovanějších destinací z Prahy — a přitom ho mnoho lidí považuje za příliš drahý. Pravda je jiná: <strong>letenky Praha–Londýn lze pravidelně sehnat za 1 000–1 500 Kč</strong>, pokud víte, kdy a kde hledat. Tento průvodce vám prozradí přesně, jak na to.</p>

<figure>
  <img src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80" alt="Tower Bridge Londýn" />
  <figcaption>Londýn je dosažitelný i s velmi omezeným rozpočtem — stačí správně načasovat rezervaci</figcaption>
</figure>

<h2>Které aerolinky létají z Prahy do Londýna nejlevněji?</h2>
<p>Na trase Praha–Londýn operuje několik nízkonákladových dopravců. <strong>Ryanair</strong> létá do Londýn Stansted (STN) a pravidelně nabízí akční letenky od 499 Kč jedním směrem. <strong>Wizz Air</strong> spojuje Prahu s Londýn Luton (LTN) za podobné ceny. <strong>easyJet</strong> létá do Gatwicku (LGW) a Lutonu a bývá o něco dražší, ale nabízí lepší časy odletů.</p>

<p>Pokud preferujete letiště Heathrow (LHR) — nejblíže centru — počítejte s vyššími cenami od British Airways nebo Czech Airlines, obvykle 2 500–4 000 Kč zpáteční. Pro rozpočtové cestování jsou Stansted a Luton jasnou volbou: metro nebo autobus do centra stojí 300–600 Kč a jede 45–90 minut.</p>

<h2>Kdy rezervovat letenky do Londýna nejlevněji?</h2>
<p>Načasování rezervace je klíčové. Podle dat Travelpayouts jsou <strong>nejlevnější letenky do Londýna dostupné 6–8 týdnů před odletem</strong> pro nízkonákladové aerolinky. Pro klasické dopravce je optimální okno 3–4 měsíce předem.</p>

<figure>
  <img src="https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=800&q=80" alt="Londýnské metro" />
  <figcaption>Londýnské metro (Tube) vás z Heathrow do centra doveze za 30 minut</figcaption>
</figure>

<p>Z hlediska ročního období jsou <strong>nejlevnější měsíce únor, březen a říjen–listopad</strong>. Naopak červenec, srpen a Vánoce jsou nejdražší — ceny mohou být 3–5× vyšší než mimo sezónu. Pokud máte flexibilní dovolenou, letní Londýn za 3 000 Kč zpáteční je stále skvělý obchod.</p>

<h2>Nejlepší dny pro let do Londýna</h2>
<p>Statisticky jsou <strong>úterý a středa nejlevnější dny pro odlet</strong> z Prahy do Londýna. Pátky a neděle jsou nejdražší — o 20–40 % více než střední týden. Pokud cestujete víkendově, zkuste odletět v pátek brzy ráno (5–7 hod) nebo naopak v neděli pozdě večer — tyto časy bývají levnější než odpolední lety.</p>

<h2>Praktický tip: Nastavte si cenové alerty</h2>
<p>Nejefektivnější způsob, jak chytit nejlevnější letenku do Londýna, je <strong>nastavit si cenový alert na Kiwi.com</strong>. Zadáte trasu Praha–Londýn, váš maximální budget (např. 1 500 Kč zpáteční) a systém vám automaticky pošle e-mail, jakmile cena klesne pod tuto hranici. Funguje to překvapivě dobře — průměrně 2–3× měsíčně se objeví nabídka pod 1 500 Kč zpáteční.</p>

<figure>
  <img src="https://images.unsplash.com/photo-1520986606214-8b456906c813?w=800&q=80" alt="Buckingham Palace Londýn" />
  <figcaption>Buckingham Palace, Hyde Park, Tate Modern — Londýn nabízí desítky bezplatných atrakcí</figcaption>
</figure>

<h2>Skrytý tip: Error fares a flash sales</h2>
<p>Několikrát ročně se objeví tzv. <strong>error fares</strong> — chybné ceny způsobené technickými chybami aerolinií. Londýn za 200 Kč nebo dokonce zdarma není fikce — tyto nabídky existují a trvají obvykle jen hodiny. Sledujte naši sekci <a href="/letenky">Akční letenky</a>, kde tyto nabídky okamžitě zveřejňujeme.</p>

<p>Připraveni letět do Londýna? Porovnejte aktuální ceny na <a href="https://tp.media/r?marker=155221&trs=267609&p=4114&u=https%3A%2F%2Fwww.kiwi.com%2Fcs%2Fsearch%2Ftiles%2FPRG%2FLON%2F" target="_blank" rel="nofollow">Kiwi.com</a> — zobrazí vám všechny dostupné lety z Prahy do všech londýnských letišť najednou a najde i kombinace, které byste sami nikdy nenašli.</p>`
  },
  {
    slug: "nejlevnejsi-letenky-z-prahy-kdy-a-jak-rezervovat",
    title: "Nejlevnější letenky z Prahy: Kdy a jak rezervovat v roce 2026",
    excerpt: "Kompletní průvodce rezervací nejlevnějších letenek z Prahy. Zjistěte, kdy létají ceny dolů, které aerolinky jsou nejlevnější a jak ušetřit tisíce korun.",
    featuredImage: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80",
    metaDescription: "Nejlevnější letenky z Prahy 2026: kdy rezervovat, které aerolinky, jak ušetřit. Kompletní průvodce pro chytré cestovatele. Aktuální tipy a triky.",
    keywords: "nejlevnější letenky Praha, levné letenky z Prahy 2026, kdy rezervovat letenky, jak ušetřit na letenkách",
    content: `<p>Praha Václav Havel Airport je jedním z nejlépe propojených letišť ve střední Evropě. Létají odtud desítky aerolinií do stovek destinací — a ceny letenek se liší dramaticky v závislosti na tom, <strong>kdy a jak rezervujete</strong>. Tento průvodce vám dá konkrétní odpovědi.</p>

<figure>
  <img src="https://images.unsplash.com/photo-1569154941061-e231b4aa8eda?w=800&q=80" alt="Letiště Praha Václav Havel" />
  <figcaption>Praha Václav Havel Airport odbavuje přes 17 milionů cestujících ročně a nabízí přímé lety do 160+ destinací</figcaption>
</figure>

<h2>Zlaté pravidlo: Kdy rezervovat letenky z Prahy</h2>
<p>Výzkumy ukazují, že <strong>optimální okno pro rezervaci letenky z Prahy je 4–8 týdnů před odletem</strong> pro evropské destinace a 2–4 měsíce pro dálkové lety. Rezervace příliš brzy (více než 6 měsíců) ani příliš pozdě (méně než 2 týdny) obvykle nenabídne nejlepší ceny.</p>

<p>Výjimkou jsou <strong>last minute nabídky</strong> — aerolinky plní prázdná sedadla výraznými slevami 3–7 dní před odletem. Pokud máte flexibilní pracovní dobu a cestujete sami nebo ve dvou, last minute letenky z Prahy mohou být o 40–60 % levnější než standardní ceny.</p>

<h2>Nejlevnější dny v týdnu pro let z Prahy</h2>
<p>Data z milionů rezervací ukazují jasný vzorec: <strong>úterý a středa jsou průměrně o 15–25 % levnější</strong> než pátky a neděle. Ranní lety (5–8 hod) a pozdní noční lety (22–24 hod) bývají levnější než odpolední a večerní spoje.</p>

<figure>
  <img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80" alt="Letadlo při vzletu" />
  <figcaption>Ranní lety jsou nejen levnější, ale také méně náchylné ke zpoždění</figcaption>
</figure>

<h2>Nejlevnější měsíce pro lety z Prahy</h2>
<p>Sezónnost má obrovský vliv na ceny. Pro <strong>evropské destinace</strong> jsou nejlevnější měsíce únor, březen, říjen a listopad — ceny mohou být 2–3× nižší než v červenci a srpnu. Pro <strong>dálkové destinace</strong> (Thajsko, Bali, Karibik) jsou nejlevnější měsíce duben–červen a září–říjen.</p>

<h2>Které aerolinky létají z Prahy nejlevněji?</h2>
<p><strong>Ryanair</strong> je dlouhodobě nejlevnější aerolinka z Prahy pro evropské destinace — pravidelně nabízí akce od 499 Kč jedním směrem. <strong>Wizz Air</strong> je silný konkurent, zejména na trasách do východní Evropy a Balkánu. <strong>easyJet</strong> pokrývá západní Evropu a Británii. Pro dálkové lety jsou nejlevnější <strong>Turkish Airlines</strong> (přes Istanbul) a <strong>Wizz Air Abu Dhabi</strong> (přes Abu Dhabi).</p>

<h2>Nástroje pro hledání nejlevnějších letenek</h2>
<p>Nejefektivnější strategie je <strong>kombinovat více nástrojů</strong>. Začněte na <a href="https://tp.media/r?marker=155221&trs=267609&p=4114&u=https%3A%2F%2Fwww.kiwi.com%2Fcs%2F" target="_blank" rel="nofollow">Kiwi.com</a> — jejich algoritmus hledá i kombinace různých aerolinií a letišť, které jiné vyhledávače ignorují. Kiwi.com také nabízí funkci "Flexibilní datum", kde vidíte ceny pro celý měsíc najednou a snadno najdete nejlevnější den.</p>

<figure>
  <img src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80" alt="Cestování s batohem" />
  <figcaption>Chytré plánování může ušetřit tisíce korun — peníze, které pak utratíte přímo na dovolené</figcaption>
</figure>

<p>Nezapomeňte sledovat naši sekci <a href="/letenky">Akční letenky</a>, kde každý den zveřejňujeme nejlepší nabídky last minute letenek z Prahy. Přihlaste se k odběru notifikací a buďte první, kdo se dozví o flash sales a error fares.</p>`
  },
  {
    slug: "chyby-pri-rezervaci-letenek-ktere-vas-stoji-tisice-korun",
    title: "7 chyb při rezervaci letenek, které vás stojí tisíce korun",
    excerpt: "Tyto chyby dělá 90 % cestovatelů a přicházejí kvůli nim o tisíce korun. Přečtěte si, jak se jim vyhnout a létat levněji.",
    featuredImage: "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=1200&q=80",
    metaDescription: "7 nejčastějších chyb při rezervaci letenek, které vás stojí tisíce korun. Jak se jim vyhnout a létat levněji? Konkrétní tipy a triky pro chytré cestovatele.",
    keywords: "chyby při rezervaci letenek, jak ušetřit na letenkách, levné letenky tipy, rezervace letenek průvodce",
    content: `<p>Každý rok Češi přeplatí na letenkách stovky milionů korun — ne proto, že by levné letenky neexistovaly, ale proto, že dělají zbytečné chyby při rezervaci. Zde je 7 nejčastějších z nich a jak se jim vyhnout.</p>

<figure>
  <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80" alt="Rezervace letenek online" />
  <figcaption>Správná strategie rezervace může ušetřit tisíce korun na každém letu</figcaption>
</figure>

<h2>Chyba č. 1: Hledáte letenky jen na jednom webu</h2>
<p>Největší chyba, kterou cestovatelé dělají, je spoléhat se na jediný vyhledávač letenek. Každá platforma má jiné dohody s aeroliniemi a zobrazuje jiné ceny. <strong>Vždy porovnejte alespoň 2–3 zdroje</strong>: <a href="https://tp.media/r?marker=155221&trs=267609&p=4114&u=https%3A%2F%2Fwww.kiwi.com%2Fcs%2F" target="_blank" rel="nofollow">Kiwi.com</a>, Skyscanner a přímo web aerolinky. Rozdíl může být i 30–50 %.</p>

<h2>Chyba č. 2: Rezervujete v pátek nebo o víkendu</h2>
<p>Víte, že ceny letenek se mění každou hodinu? A že aerolinky záměrně zvyšují ceny ve chvíli, kdy víte, že lidé nejvíce nakupují? <strong>Pátek odpoledne a sobota dopoledne jsou nejdražší časy pro rezervaci.</strong> Naopak úterý a středa ráno jsou statisticky nejlevnější — ceny mohou být o 15–20 % nižší.</p>

<h2>Chyba č. 3: Ignorujete vedlejší letiště</h2>
<p>Praha má jedno letiště, ale vaše cílová destinace může mít několik. Londýn má 6 letišť (Heathrow, Gatwick, Stansted, Luton, City, Southend), Paříž 3 (CDG, Orly, Beauvais). <strong>Letiště Stansted nebo Luton mohou být o 500–1 500 Kč levnější</strong> než Heathrow — a metro nebo autobus do centra stojí jen pár stovek.</p>

<figure>
  <img src="https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?w=800&q=80" alt="Různá letiště v Londýně" />
  <figcaption>Londýn Stansted je 60 km od centra, ale letenky sem bývají o 30–50 % levnější než na Heathrow</figcaption>
</figure>

<h2>Chyba č. 4: Rezervujete zpáteční letenku jako celek</h2>
<p>Mnozí cestovatelé automaticky hledají zpáteční letenku. Ale <strong>dvě jednosměrné letenky od různých aerolinií mohou být dohromady levnější</strong> než zpáteční od jedné aerolinky. Kiwi.com tuto kombinaci hledá automaticky — stačí zaškrtnout "Kombinované letenky".</p>

<h2>Chyba č. 5: Nevyužíváte cenové alerty</h2>
<p>Ceny letenek se mění desítkykrát denně. Pokud nemáte čas sledovat ceny každý den, <strong>nastavte si cenový alert</strong> — Kiwi.com, Google Flights nebo Skyscanner vám pošlou e-mail, jakmile cena klesne pod vámi stanovenou hranici. Tato funkce je zdarma a ušetří vám hodiny hledání.</p>

<h2>Chyba č. 6: Zapomínáte na poplatky za zavazadla</h2>
<p>Letenka za 599 Kč může reálně stát 1 800 Kč, pokud přidáte poplatek za kabinové zavazadlo (200–500 Kč) a odbavené zavazadlo (400–800 Kč). <strong>Vždy počítejte celkovou cenu včetně zavazadel</strong> — a pokud cestujete jen s příručním zavazadlem, ušetříte výrazně.</p>

<figure>
  <img src="https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=800&q=80" alt="Zavazadla na letišti" />
  <figcaption>Poplatky za zavazadla mohou zdvojnásobit cenu letenky — cestujte jen s příručním zavazadlem kdykoli je to možné</figcaption>
</figure>

<h2>Chyba č. 7: Čekáte na "ještě lepší cenu"</h2>
<p>Psychologie nákupu letenek je zákeřná — vždy se zdá, že cena by mohla ještě klesnout. Ale data ukazují, že <strong>ceny letenek v posledních 2 týdnech před odletem průměrně rostou</strong>, ne klesají (výjimkou jsou last minute nabídky pro prázdná sedadla). Pokud najdete dobrou cenu, která je o 30 % nižší než průměr — rezervujte. Čekání se nevyplácí.</p>

<p>Chcete být první, kdo se dozví o skutečně výjimečných nabídkách? Sledujte naši sekci <a href="/letenky">Akční letenky</a> — každý den aktualizujeme nejlepší last minute nabídky z Prahy a upozorňujeme na flash sales a error fares, které trvají jen hodiny.</p>`
  }
];

let inserted = 0;
for (const article of articles) {
  const [existing] = await conn.execute(
    "SELECT id FROM articles WHERE slug = ?",
    [article.slug]
  );
  if (existing.length > 0) {
    console.log(`⏭️  Skipping existing: ${article.slug}`);
    continue;
  }
  await conn.execute(
    `INSERT INTO articles (slug, title, excerpt, content, featuredImage, metaDescription, keywords, author, category, status, publishedAt, viewCount, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      article.slug,
      article.title,
      article.excerpt,
      article.content,
      article.featuredImage,
      article.metaDescription,
      article.keywords,
      "Redakce Akční-Letenky",
      "tips",
      "published",
      now,
      0,
      now,
      now,
    ]
  );
  console.log(`✅ Inserted: ${article.title}`);
  inserted++;
}

console.log(`\n🎉 Done! Inserted ${inserted} articles.`);
await conn.end();
