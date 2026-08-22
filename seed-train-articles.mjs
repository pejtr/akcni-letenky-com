import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { mysqlTable, int, varchar, text, timestamp, mysqlEnum } from "drizzle-orm/mysql-core";

// Define articles table schema inline
const articles = mysqlTable("articles", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  metaDescription: varchar("metaDescription", { length: 160 }),
  keywords: text("keywords"),
  featuredImage: text("featuredImage"),
  author: varchar("author", { length: 100 }).default("Akční Letenky"),
  category: varchar("category", { length: 50 }).default("general"),
  status: mysqlEnum("status", ["draft", "published"]).default("draft"),
  publishedAt: timestamp("publishedAt"),
  viewCount: int("viewCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

const trainArticles = [
  {
    title: "Zpátky na koleje: Proč čím dál více cestovatelů dává přednost pomalému cestování vlakem",
    slug: "zpatky-na-koleje-proc-cim-dal-vice-cestovatelu-dava-prednost-pomalemu-cestovani-vlakem",
    excerpt: "Čím dál více cestovatelů po celém světě objevuje kouzlo pomalého cestování. Vlaky zažívají obrovský boom – v Británii lámou stoleté rekordy, v USA vzkvétá Amtrak a noční i luxusní spojení napříč Evropou zažívají renesanci.",
    metaDescription: "Zpátky na koleje! Zjistěte, proč lidé po celém světě mění rychlá letadla za romantiku vlaků, jaké jsou nejpopulárnější trasy a jak ušetřit na jízdenkách.",
    keywords: "cestování vlakem, slow travel, pomalé cestování, vlakové trasy, vlakové zájezdy, Amtrak, noční vlaky, evropské železnice",
    featuredImage: "/blog-images/scenic-train-mountains.jpg",
    author: "Akční Letenky Redakce",
    category: "tips",
    status: "published",
    publishedAt: new Date(),
    content: `# Zpátky na koleje: Proč čím dál více cestovatelů dává přednost pomalému cestování vlakem

V době, kdy se většina světa snaží dostat z bodu A do bodu B co nejrychleji, dochází v cestovním ruchu k pozoruhodnému fenoménu. Čím dál více lidí podléhá kouzlu tzv. **„slow travel“** (pomalého cestování) a volí cestu po kolejích místo přeplněných letištních terminálů.

Železniční doprava zažívá globální renesanci. Vzkvétají jak dostupná noční spojení a vyhlídkové trasy, tak extrémně luxusní vlaky, které nabízejí komfort pětihvězdičkového hotelu na kolečkách.

---

## Proč roste obliba cestování vlakem?

1. **Pohodlí a klid bez letištního stresu**  
   Žádné příchody dvě hodiny předem, zdlouhavé bezpečnostní kontroly ani svlékání pásků. Na vlakové nádraží v centrumu města stačí dorazit pár minut před odjezdem a pohodlně nastoupit.

2. **Cesta jako samotný zážitek**  
   Místo pohledu na mraky z výšky deseti kilometrů sledujete proměňující se krajinu, horské průsmyky, řeky a malebná městečka přímo ze svého sedadla nebo jídelního vozu.

3. **Ekologičtější volba**  
   Železniční doprava vyprodukuje zlomek CO2 ve srovnání s leteckou či automobilovou dopravou. Pro čím dál více cestovatelů je udržitelnost klíčovým faktorem při výběru dovolené.

4. **Příjezd přímo do centra měst**  
   Většina hlavních vlakových nádraží leží přímo v srdci metropolí. Po vystoupení z vlaku jste okamžitě u památek, hotelů a návazné městské hromadné dopravy.

---

## Světový boom: Od Velké Británie po Ameriku

### 🇬🇧 Británie hlásí rekordy za více než 100 let
Ve Spojeném království je cestování vlakem nejpopulárnější od počátku 20. století. Cestující stále častěji volí železnici pro vnitrostátní cesty mezi Londýnem, Skotskem či Walesem, ale i pro mezinárodní spojení Eurostarem do Paříže či Bruselu.

### 🇺🇸 Americký Amtrak zažívá zlaté časy
Spojené státy byly dlouho považovány za zemi s dominancí letecké a automobilové dopravy. Americký národní dopravce **Amtrak** však hlásí rekordní počty cestujících. Dlouhé kontinentální trasy napříč Skalnatými horami a pobřežím Tichého oceánu se stávají vyhledávaným zážitkem pro domácí i zahraniční turisty.

### 🇪🇺 Evropa: Návrat nočních vlaků a luxusních expresů
Evropa stojí v čele železniční revoluce. Operátoři jako rakouský **ÖBB (Nightjet)** masivně investují do nových moderních lůžkových vozů. Zároveň vznikají nové luxusní projekty jako *La Dolce Vita Orient Express* v Itálii nebo znovuzrozené legendy jako *Golden Eagle* a *Belmond*.

---

## Nejkrásnější trasy, které musíte zažít

- **Glacier Express (Švýcarsko):** Legendární osmihodinová cesta přes 291 mostů a 91 tunelů skrz švýcarské Alpy z Zermattu do St. Moritz.
- **West Highland Line (Skotsko):** Průjezd divokou skotskou vysočinou včetně slavného viaduktu Glenfinnan, známého ze sérií o Harrym Potterovi.
- **Bernina Express (Švýcarsko – Itálie):** Trasa zařazená na seznam UNESCO, která vás zaveze z alpských ledovců až pod italské palmy.
- **Cinque Terre Express (Itálie):** Nádherná skalní trasa spojující pět pitoreskních vesniček na pobřeží Ligurského moře.

---

## Jak ušetřit při plánování cesty vlakem?

- **Rezervujte v předstihu:** Stejně jako u letenek, i jízdenky na dálkové a vysokorychlostní vlaky (TGV, ICE, Eurostar, Railjet) bývají nejlevnější 2 až 3 měsíce předem.
- **Využijte síťové jízdenky (Interrail / Eurail):** Pokud plánujete projet více zemí, Interrail pas vám umožní neomezené cestování po evropské železniční síti za výhodnou paušální cenu.
- **Kombinujte vlak s lety:** Často dává smysl doletět akční letenkou do evropské metropole (např. Řím, Paříž, Curych) a odtud pokračovat vyhlídkovým vlakem do okolních regionů.

---

## Závěr

Pomalé cestování vlakem není jen o přepravě z místa na místo – je to návrat ke kořenům cestování, kdy cesta samotná tvoří nejkrásnější část dovolené. Zkuste při příštím plánování vyměnit letadlo za koleje a objevit krásu světa z okna vlaku!`,
  },
  {
    title: "Top 10 Nejkrásnějších Vlakových Tras v Evropě",
    slug: "top-10-nejkrasnejsich-vlakovych-tras-v-evrope",
    content: `# Top 10 Nejkrásnějších Vlakových Tras v Evropě

Cestování vlakem po Evropě nabízí jedinečný zážitek - pohodlí, krásné výhledy a ekologický způsob dopravy. Představujeme vám 10 nejkrásnějších vlakových tras, které musíte zažít.

## 1. Glacier Express, Švýcarsko

![Scenic train in mountains](/blog-images/scenic-train-mountains.jpg)

Glacier Express je legendární trasa spojující St. Moritz a Zermatt. Během 8hodinové jízdy projedete 291 mostů a 91 tunelů, s výhledy na Alpy, které vám vyrazí dech.

**Cena:** od 1 500 Kč  
**Délka:** 8 hodin  
**Nejlepší období:** Celoročně, zima nabízí sněhové scenérie

## 2. Bernina Express, Švýcarsko-Itálie

Tato trasa je zapsána na seznamu UNESCO. Vede z Churu přes Alpy až do italského Tirano. Projíždíte ledovce, horské průsmyky a malebná alpská městečka.

**Cena:** od 800 Kč  
**Délka:** 4 hodiny  
**Tip:** Rezervujte si místo u okna vlevo

## 3. Flåm Railway, Norsko

Jedna z nejstrmějších železničních tratí na světě. Za 55 minut sestoupíte z hor k fjordu, kolem vodopádů a dramatických skalních stěn.

**Cena:** od 600 Kč  
**Délka:** 55 minut  
**Nejlepší období:** Květen-září

## 4. West Highland Line, Skotsko

Trasa z Glasgow do Mallaig vás provede skotskou vysočinou, kolem jezera Loch Lomond a přes slavný Glenfinnan Viaduct (známý z Harry Pottera).

**Cena:** od 450 Kč  
**Délka:** 5.5 hodiny  
**Tip:** Jízda parním vlakem Jacobite Steam Train

## 5. Cinque Terre Express, Itálie

Spojuje pět malebných italských vesniček na pobřeží Ligurského moře. Krátká trasa s neuvěřitelnými výhledy na moře a barevné domy.

**Cena:** od 150 Kč  
**Délka:** 30 minut (celá trasa)  
**Nejlepší období:** Duben-říjen

## 6. Semmering Railway, Rakousko

První horská železnice v Evropě (1854), UNESCO památka. Vede z Vídně přes Alpy s 16 viadukty a 15 tunely.

**Cena:** od 300 Kč  
**Délka:** 2 hodiny  
**Tip:** Ideální výlet z Vídně na víkend

## 7. Rauma Line, Norsko

Dramatická trasa mezi Dombås a Åndalsnes s výhledy na hory Trollveggen a vodopád Kylling.

**Cena:** od 500 Kč  
**Délka:** 1.5 hodiny  
**Nejlepší období:** Léto

## 8. Golden Pass Line, Švýcarsko

Spojuje Montreux a Lucern přes Interlaken. Panoramatické vozy s výhledem na Ženevské jezero, vinice a Alpy.

**Cena:** od 1 200 Kč  
**Délka:** 5 hodin  
**Tip:** Upgrade na panoramatický vůz stojí za to

## 9. Centovalli Express, Švýcarsko-Itálie

"Údolí sta údolí" - trasa z Locarno do Domodossoly přes 83 mostů a 31 tunelů.

**Cena:** od 400 Kč  
**Délka:** 2 hodiny  
**Nejlepší období:** Podzim (barevné listí)

## 10. Trans-Siberian Express, Rusko

Nejdelší železniční trať světa - z Moskvy do Vladivostoku. Epická 7denní cesta napříč Ruskem.

**Cena:** od 15 000 Kč (celá trasa)  
**Délka:** 7 dní  
**Tip:** Rezervujte si lůžkový vůz

## Jak Ušetřit na Vlakových Jízdenkách?

1. **Rezervujte předem** - ceny rostou s blížícím se datem odjezdu
2. **Používejte rail passy** - Eurail Pass se vyplatí při více jízdách
3. **Cestujte mimo sezónu** - levnější a méně lidí
4. **Noční vlaky** - ušetříte za ubytování

## Začněte Plánovat Svou Cestu

Všechny tyto trasy můžete vyhledat a rezervovat přes našeho partnera Omio. Porovnají za vás ceny a najdou nejlepší spojení.

[Vyhledat Vlakové Spojení →](/vlaky-autobusy)`,
    excerpt: "Objevte 10 nejkrásnějších vlakových tras v Evropě - od švýcarských Alp po norské fjordy. Kompletní průvodce s cenami, tipy a nejlepším obdobím pro návštěvu.",
    metaDescription: "Top 10 nejkrásnějších vlakových tras v Evropě: Glacier Express, Bernina Express, Flåm Railway a další. Ceny, tipy a jak ušetřit na jízdenkách.",
    keywords: "vlakové trasy Evropa, nejkrásnější vlaky, Glacier Express, Bernina Express, cestování vlakem, scenic trains Europe",
    featuredImage: "/blog-images/scenic-train-mountains.jpg",
    author: "Petr Melad",
    category: "guides",
    status: "published",
    publishedAt: new Date(),
  },
  {
    title: "Jak Ušetřit na Vlakových Jízdenkách: 7 Osvědčených Tipů",
    slug: "jak-usetrit-na-vlakovych-jizdenkach",
    content: `# Jak Ušetřit na Vlakových Jízdenkách: 7 Osvědčených Tipů

![Prague train station](/blog-images/prague-train-station.jpg)

Cestování vlakem může být výrazně levnější než letadlem, pokud znáte správné triky. Zde je 7 osvědčených způsobů, jak ušetřit až 70% na vlakových jízdenkách.

## 1. Rezervujte Co Nejdříve

Stejně jako u letenek platí: čím dříve rezervujete, tím levněji. Většina evropských železničních společností nabízí slevy až 70% pro včasné rezervace.

**Optimální doba rezervace:**
- **2-3 měsíce předem:** Nejlepší ceny
- **1 měsíc předem:** Stále dobré ceny
- **1 týden předem:** Standardní ceny
- **Den před odjezdem:** Nejdražší

**Příklad:** Jízdenka Praha-Vídeň:
- 3 měsíce předem: 299 Kč
- 1 týden předem: 599 Kč
- Den před: 899 Kč

## 2. Používejte Rail Passy

Pokud plánujete více cest, rail pass se vám vyplatí. Eurail Pass nabízí neomezené cestování v určitém období.

**Typy passů:**
- **Global Pass:** 33 zemí Evropy
- **One Country Pass:** Jedna země (levnější)
- **Regional Pass:** Vybrané regiony

**Kdy se vyplatí:**
- 3+ cesty během měsíce
- Flexibilní plány (můžete měnit trasy)
- Spontánní cestování

**Ceny Eurail Pass:**
- 4 dny v měsíci: od 5 500 Kč
- 7 dní v měsíci: od 7 500 Kč
- 15 dní v měsíci: od 10 500 Kč

## 3. Cestujte Mimo Špičku

Vlaky mimo špičku jsou výrazně levnější. Vyhněte se:
- Pondělí ráno (lidé jedou do práce)
- Pátek odpoledne (víkendové výlety)
- Neděle večer (návrat z víkendu)

**Nejlevnější časy:**
- Úterý-čtvrtek dopoledne
- Sobota ráno
- Neděle dopoledne

**Úspora:** 20-40%

## 4. Noční Vlaky = Ušetřete Za Ubytování

Noční vlaky jsou geniální způsob, jak ušetřit čas i peníze. Jedete přes noc a ráno jste v cíli - bez nutnosti platit hotel.

**Populární noční trasy:**
- Praha-Vídeň-Zürich: od 899 Kč (lůžkový vůz)
- Praha-Krakov: od 699 Kč
- Vídeň-Benátky: od 1 200 Kč

**Výhody:**
- Ušetříte 1 000-2 000 Kč za hotel
- Ušetříte čas (cestujete ve spánku)
- Romantický zážitek

**Tip:** Rezervujte lůžkový vůz (couchette) - pohodlnější a bezpečnější než sedačka.

## 5. Využívejte Slevy a Slevové Karty

Většina železničních společností nabízí slevy pro:
- **Studenty:** 25-50% sleva (ISIC karta)
- **Seniory (60+):** 25-40% sleva
- **Děti (do 15 let):** 50-100% sleva
- **Skupiny (4+ lidí):** 15-30% sleva

**Slevové karty:**
- **ČD In Karta:** 25% sleva na všechny jízdenky ČD (590 Kč/rok)
- **BahnCard (Německo):** 25-50% sleva (od 1 500 Kč/rok)
- **Carte Jeune (Francie):** 30% sleva pro mladé (1 200 Kč/rok)

## 6. Porovnávejte Ceny Přes Omio

Nemusíte procházet weby všech železničních společností. Omio porovná ceny za vás a najde nejlevnější spojení.

**Výhody Omio:**
- Porovnání vlaků, autobusů i letadel
- Jedna platforma pro všechny dopravce
- Česká podpora
- Mobilní jízdenky

[Vyhledat Nejlevnější Spojení →](/vlaky-autobusy)

## 7. Kombinujte Vlaky a Autobusy

Někdy je kombinace vlaku a autobusu levnější než přímý vlak.

**Příklad Praha-Amsterdam:**
- Přímý vlak: 2 500 Kč
- Vlak Praha-Berlín + autobus Berlín-Amsterdam: 1 200 Kč
- **Úspora: 1 300 Kč**

**Tip:** Omio automaticky najde nejlevnější kombinace.

## Bonus Tip: Flexibilní Data

Pokud máte flexibilní termín, zkuste různá data. Rozdíl v ceně může být i 50%.

**Nástroje:**
- Omio kalendář cen
- ČD "Nejlevnější spojení"
- DB Navigator (Německo)

## Shrnutí: Jak Ušetřit Nejvíc

1. ✅ Rezervujte 2-3 měsíce předem
2. ✅ Používejte rail passy pro více cest
3. ✅ Cestujte mimo špičku (úterý-čtvrtek)
4. ✅ Noční vlaky = zdarma ubytování
5. ✅ Využívejte studentské/seniorské slevy
6. ✅ Porovnávejte ceny přes Omio
7. ✅ Kombinujte vlaky a autobusy

**Reálná úspora:** 40-70% oproti nákupu na poslední chvíli!

## Začněte Šetřit Dnes

Vyhledejte si své spojení a porovnejte ceny různých dat. Často stačí posunout cestu o 1-2 dny a ušetříte stovky korun.

[Najít Nejlevnější Spojení →](/vlaky-autobusy)`,
    excerpt: "7 osvědčených tipů, jak ušetřit až 70% na vlakových jízdenkách v Evropě. Včasná rezervace, rail passy, noční vlaky a další triky pro levné cestování.",
    metaDescription: "Jak ušetřit na vlakových jízdenkách: 7 tipů pro úsporu až 70%. Včasná rezervace, Eurail Pass, noční vlaky, slevy a porovnávání cen.",
    keywords: "ušetřit vlakové jízdenky, levné vlaky Evropa, Eurail Pass, noční vlaky, slevy na vlaky, jak cestovat levně",
    featuredImage: "/blog-images/prague-train-station.jpg",
    author: "Petr Melad",
    category: "guides",
    status: "published",
    publishedAt: new Date(),
  },
  {
    title: "Proč Je Vlak Nejekologičtější Způsob Cestování",
    slug: "proc-je-vlak-nejekologictejsi-zpusob-cestovani",
    content: `# Proč Je Vlak Nejekologičtější Způsob Cestování

![Eco-friendly green train](/blog-images/eco-train-green.jpg)

Klimatická změna je realita a naše cestovatelské návyky mají velký dopad na planetu. Vlak je nejekologičtější způsob dopravy - produkuje až **90% méně CO₂** než letadlo. Pojďme se podívat na čísla.

## Srovnání Emisí CO₂

Pro cestu Praha-Vídeň (330 km):

| Dopravní prostředek | CO₂ na osobu | Relativní emise |
|---------------------|--------------|-----------------|
| **Vlak** | 3.5 kg | ✅ 100% |
| **Autobus** | 8 kg | 229% |
| **Auto (1 osoba)** | 45 kg | 1,286% |
| **Letadlo** | 35 kg | 1,000% |

**Závěr:** Vlak produkuje **10x méně CO₂** než letadlo a **13x méně** než auto s jedním cestujícím.

## Proč Je Vlak Tak Ekologický?

### 1. Elektrická Trakce

Většina evropských vlaků jezdí na elektřinu, která pochází z obnovitelných zdrojů:
- **Švýcarsko:** 90% vodní energie
- **Rakousko:** 80% obnovitelné zdroje
- **Německo:** 60% obnovitelné zdroje (rostoucí trend)

### 2. Vysoká Efektivita

Vlak přepraví 500+ lidí najednou s minimální spotřebou energie na osobu. Letadlo spotřebuje mnohem více paliva na osobu.

**Spotřeba energie na 100 km:**
- Vlak: 0.6 kWh/osobu
- Letadlo: 3.5 kWh/osobu
- Auto: 2.2 kWh/osobu

### 3. Žádné Emise Při Jízdě

Elektrické vlaky neprodukují žádné emise během jízdy. Letadla vypouštějí CO₂, NOx a další škodlivé látky přímo do atmosféry.

## Reálný Dopad: Kolik CO₂ Ušetříte?

Pokud nahradíte 5 letů ročně vlaky, ušetříte:

**5 letů Praha-Vídeň:**
- Letadlo: 175 kg CO₂
- Vlak: 17.5 kg CO₂
- **Úspora: 157.5 kg CO₂**

To odpovídá:
- 🌳 Vysazení 8 stromů
- 🚗 Jízda autem 1 000 km
- 💡 Roční spotřeba elektřiny v domácnosti (1 měsíc)

## Další Ekologické Výhody Vlaků

### Méně Hluku

Vlaky jsou tišší než letadla a auta, snižují hlukové znečištění v městech.

### Méně Prostoru

Železnice zabírá méně prostoru než silnice nebo letiště. Zachovává přírodní krajinu.

### Recyklovatelné Materiály

Moderní vlaky jsou z 95% recyklovatelné. Letadla jen z 50%.

### Podpora Místní Ekonomiky

Vlaky spojují malá města a vesnice, podporují místní ekonomiku bez nutnosti stavět letiště.

## Jak Můžete Přispět?

### 1. Volte Vlak Místo Letadla

Pro vzdálenosti do 1 000 km je vlak často rychlejší (včetně času na letišti) a vždy ekologičtější.

**Kdy volit vlak:**
- Praha-Vídeň: 4h vlakem vs 3h letadlem (+ 3h letiště) = **vlak je rychlejší**
- Praha-Mnichov: 5.5h vlakem vs 1h let (+ 3h letiště) = **podobná doba**
- Praha-Berlín: 4.5h vlakem vs 1h let (+ 3h letiště) = **vlak je rychlejší**

### 2. Sdílejte Auto

Pokud musíte jet autem, sdílejte ho s více lidmi. Auto se 4 lidmi má podobné emise jako vlak.

### 3. Kompenzujte Emise

Pokud musíte letět, kompenzujte emise přes projekty jako:
- Atmosfair
- MyClimate
- ClimateCare

**Cena:** 150-300 Kč za let Praha-Vídeň

## Budoucnost: Ještě Ekologičtější Vlaky

Evropa investuje do ještě ekologičtějších vlaků:

### Vodíkové Vlaky

Německo testuje vlaky na vodík - nulové emise, tichý provoz.

### Solární Panely na Vlacích

Holandsko testuje solární panely na střechách vlaků pro napájení klimatizace.

### Rychlovlaky

Nové rychlovlaky (300+ km/h) konkurují letadlům i na dlouhých trasách, s minimálními emisemi.

## Shrnutí: Proč Volit Vlak

✅ **90% nižší emise CO₂** než letadlo  
✅ **Elektřina z obnovitelných zdrojů**  
✅ **Vysoká energetická efektivita**  
✅ **Žádné emise při jízdě**  
✅ **Méně hluku a prostoru**  
✅ **Podpora místní ekonomiky**  

## Začněte Cestovat Ekologicky

Každá cesta vlakem místo letadlem je krok k čistší planetě. Najděte si své spojení a přispějte k ochraně životního prostředí.

[Vyhledat Ekologické Spojení →](/vlaky-autobusy)

---

**Zdroje:**
- European Environment Agency (EEA)
- International Union of Railways (UIC)
- Atmosfair CO₂ Calculator`,
    excerpt: "Vlak produkuje až 90% méně CO₂ než letadlo. Zjistěte, proč je vlak nejekologičtější způsob cestování a kolik emisí můžete ušetřit každou cestou.",
    metaDescription: "Proč je vlak nejekologičtější doprava: 90% nižší emise CO₂ než letadlo, elektřina z obnovitelných zdrojů, vysoká efektivita. Srovnání emisí a reálný dopad.",
    keywords: "ekologické cestování, vlak vs letadlo emise, CO2 vlak, udržitelná doprava, zelené cestování, klimatická změna doprava",
    featuredImage: "/blog-images/eco-train-green.jpg",
    author: "Petr Melad",
    category: "guides",
    status: "published",
    publishedAt: new Date(),
  },
];

console.log("Seeding train travel articles...");

for (const article of trainArticles) {
  try {
    await db.insert(articles).values(article);
    console.log(`✅ Created article: ${article.title}`);
  } catch (error) {
    console.error(`❌ Failed to create article: ${article.title}`, error);
  }
}

console.log("\n✅ All train travel articles seeded successfully!");

await connection.end();
